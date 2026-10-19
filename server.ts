import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import initSqlJs, { Database } from "sql.js";

const JWT_SECRET = process.env.JWT_SECRET || "foodbridge-super-secret-jwt-key-2026";
const PORT = 3000;
const CHATBOT_SERVICE_URL = process.env.CHATBOT_SERVICE_URL || "http://127.0.0.1:8000";
const DB_FILE = path.join(process.cwd(), "foodbridge.sqlite");

let db: Database;

// Save SQLite database binary to file
function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  }
}

// Database helper utilities
function runSql(sql: string, params: any[] = []) {
  db.run(sql, params);
  saveDatabase();
}

function querySql(sql: string, params: any[] = []): any[] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results: any[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function queryOneSql(sql: string, params: any[] = []): any | null {
  const rows = querySql(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

async function initDatabase() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_FILE)) {
    const filebuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(filebuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables if not exist
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL,
      organization_name TEXT,
      phone TEXT,
      address TEXT,
      availability_zone TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS donations (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      restaurant_name TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity TEXT NOT NULL,
      expiry TEXT NOT NULL,
      pickup_address TEXT NOT NULL,
      pickup_window TEXT NOT NULL,
      special_notes TEXT,
      status TEXT NOT NULL,
      accepted_by_ngo_id TEXT,
      accepted_by_ngo_name TEXT,
      assigned_volunteer_id TEXT,
      assigned_volunteer_name TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS donation_timeline (
      id TEXT PRIMARY KEY,
      donation_id TEXT NOT NULL,
      status TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      updated_by TEXT,
      note TEXT
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      donation_id TEXT NOT NULL,
      ngo_id TEXT NOT NULL,
      volunteer_id TEXT NOT NULL,
      assigned_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_role TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );
  `);

  // Seed clean system admin account if empty
  const userCount = queryOneSql("SELECT COUNT(*) as count FROM users")?.count || 0;
  if (userCount === 0) {
    console.log("Initializing database with system admin account...");
    const adminPass = await bcrypt.hash("admin123", 10);
    const now = new Date().toISOString();

    // 1. Admin account for system administration
    runSql(`INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      "usr_admin", "System Administrator", "admin@foodbridge.org", adminPass, "admin", "approved", "FoodBridge HQ", "+1-800-FOOD-BRG", "100 Civic Center Plaza, Metro", "", now
    ]);

    saveDatabase();
  }
}

// Auth Middleware
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }
    const dbUser = queryOneSql("SELECT id, email, role, status, name FROM users WHERE id = ?", [user.id]);
    if (!dbUser) {
      res.status(401).json({ error: "User account no longer exists." });
      return;
    }
    if (dbUser.status === 'suspended') {
      res.status(403).json({ error: "Your account has been suspended. Please contact administrator." });
      return;
    }
    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      name: dbUser.name
    };
    next();
  });
}

function logActivity(userId: string, userName: string, userRole: string, action: string, details: string) {
  const id = `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = new Date().toISOString();
  runSql(`INSERT INTO activity_logs VALUES (?, ?, ?, ?, ?, ?, ?)`, [
    id, userId, userName, userRole, action, details, timestamp
  ]);
}

async function startServer() {
  await initDatabase();
  const app = express();
  app.use(express.json());

  // --- API ROUTES ---

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "FoodBridge API" });
  });

  // Public intent help, with optional JWT so account-specific status stays scoped to the signed-in user.
  app.post("/api/chatbot", async (req: AuthRequest, res: Response) => {
    const { message, language } = req.body || {};
    if (typeof message !== "string" || !message.trim() || message.length > 2000) {
      res.status(400).json({ error: "Enter a message between 1 and 2000 characters." });
      return;
    }
    if (!['en', 'hi', 'kn'].includes(language)) {
      res.status(400).json({ error: "Choose English, Hindi, or Kannada." });
      return;
    }

    const authorization = req.headers.authorization;
    if (authorization) {
      const token = authorization.split(' ')[1];
      if (!token) { res.status(401).json({ error: "Invalid authorization header." }); return; }
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        const user = queryOneSql("SELECT id, email, role, status, name FROM users WHERE id = ?", [decoded.id]);
        if (!user || user.status === 'suspended') { res.status(401).json({ error: "Invalid or unavailable account." }); return; }
        req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
      } catch {
        res.status(401).json({ error: "Invalid or expired token." });
        return;
      }
    }

    try {
      const upstream = await fetch(`${CHATBOT_SERVICE_URL.replace(/\/$/, '')}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim(), language }),
        signal: AbortSignal.timeout(15000)
      });
      if (!upstream.ok) {
        res.status(upstream.status === 400 ? 400 : 503).json({ error: "Chat support is temporarily unavailable." });
        return;
      }
      const prediction = await upstream.json() as { intent: string; confidence: number; language: string; fallback: boolean };
      const text: Record<string, Record<string, string>> = {
        en: {
          greeting: "Hello! I can help with FoodBridge, donations, account setup, and food safety. What would you like to know?",
          goodbye: "Goodbye! Thank you for helping reduce food waste with FoodBridge.", thanks: "You’re welcome! I’m here if you need help with FoodBridge.",
          about_foodbridge: "FoodBridge connects food donors with approved NGOs and volunteers to redistribute surplus food and track each handoff.",
          account_login: "Use the Login page to access your account. If you can’t sign in, check your email and password, or contact FoodBridge support for account help.",
          claim_donation: "Approved NGOs can browse available donations in the NGO Portal and accept a suitable listing. NGO accounts need administrator approval before claiming.",
          contact_support: "For additional help, use the contact details shown in the FoodBridge app or describe the issue here and I’ll try to guide you.",
          create_donation: "Sign in with a restaurant account and open the Restaurant Dashboard to add or manage a donation. Include its quantity, expiry, pickup address, and pickup window.",
          donation_expiry: "Only list food that can be safely collected before its expiry. Keep it at the required temperature, package it safely, and clearly note allergens and handling instructions.",
          donor_registration: "Choose Register, select your account type, and complete the form. Choose Restaurant to list surplus food, NGO to receive donations, or Volunteer to help with pickups.",
          food_safety: "Food must be wholesome and safely handled. Keep hot food above 140°F (60°C), chilled food at or below 40°F (4°C), use food-grade packaging, and label allergens.",
          ngo_approval: "NGO registrations are reviewed by a FoodBridge administrator. You can browse listings while pending; accepting donations requires an approved account.",
          pickup_assignment: "After an NGO accepts a donation, it can assign an available volunteer. The pickup and delivery progress appears in the donation timeline.",
          role_permissions: "Restaurants list donations, approved NGOs accept them, volunteers handle assigned pickups, and administrators manage approvals and platform operations.",
          volunteer_registration: "Choose Register and create a volunteer account. Add your availability zone so NGOs can coordinate nearby pickups.",
          out_of_scope: "I’m trained for FoodBridge support topics. Ask me about registration, donations, claims, pickups, food safety, or account access."
        },
        hi: {
          greeting: "नमस्ते! मैं FoodBridge, दान, खाता बनाने और खाद्य सुरक्षा के बारे में सहायता कर सकता हूँ। आप क्या जानना चाहते हैं?",
          goodbye: "अलविदा! FoodBridge के साथ भोजन की बर्बादी कम करने में मदद करने के लिए धन्यवाद।", thanks: "आपका स्वागत है! FoodBridge से जुड़ी सहायता के लिए मैं यहाँ हूँ।",
          about_foodbridge: "FoodBridge भोजन दान करने वालों को स्वीकृत NGOs और स्वयंसेवकों से जोड़ता है, ताकि अतिरिक्त भोजन वितरित हो और हर चरण दर्ज रहे।",
          account_login: "अपने खाते में जाने के लिए Login पेज खोलें। प्रवेश न हो तो ईमेल और पासवर्ड जाँचें या सहायता से संपर्क करें।",
          claim_donation: "स्वीकृत NGOs, NGO Portal में उपलब्ध दान देखकर उपयुक्त दान स्वीकार कर सकते हैं। दान स्वीकार करने से पहले NGO खाते को प्रशासक की मंज़ूरी चाहिए।",
          contact_support: "अधिक सहायता के लिए FoodBridge ऐप में दिए गए संपर्क विवरण देखें। आप समस्या बताएँ, मैं मार्गदर्शन करने की कोशिश करूँगा।",
          create_donation: "रेस्तराँ खाते से लॉगिन करके Restaurant Dashboard में दान जोड़ें या प्रबंधित करें। मात्रा, समाप्ति, पिकअप पता और समय दें।",
          donation_expiry: "केवल वही भोजन सूचीबद्ध करें जिसे समाप्ति से पहले सुरक्षित रूप से लिया जा सके। सही तापमान रखें, सुरक्षित पैक करें और एलर्जी व संभाल संबंधी जानकारी लिखें।",
          donor_registration: "Register चुनें, अपनी भूमिका चुनें और फ़ॉर्म भरें। भोजन सूचीबद्ध करने के लिए Restaurant, दान पाने के लिए NGO, या पिकअप में मदद के लिए Volunteer चुनें।",
          food_safety: "भोजन सुरक्षित और खाने योग्य होना चाहिए। गर्म भोजन 60°C से ऊपर, ठंडा भोजन 4°C या उससे कम रखें; खाद्य-योग्य पैकेजिंग करें और एलर्जी की जानकारी दें।",
          ngo_approval: "NGO पंजीकरण की समीक्षा FoodBridge प्रशासक करते हैं। लंबित स्थिति में आप सूची देख सकते हैं; दान स्वीकार करने के लिए मंज़ूरी आवश्यक है।",
          pickup_assignment: "NGO के दान स्वीकार करने के बाद वह उपलब्ध स्वयंसेवक को नियुक्त कर सकता है। पिकअप और डिलीवरी की प्रगति दान की टाइमलाइन में दिखती है।",
          role_permissions: "रेस्तराँ दान सूचीबद्ध करते हैं, स्वीकृत NGOs उन्हें स्वीकार करते हैं, स्वयंसेवक तय पिकअप करते हैं और प्रशासक मंज़ूरी व संचालन संभालते हैं।",
          volunteer_registration: "Register चुनकर स्वयंसेवक खाता बनाएँ। आसपास के पिकअप समन्वय के लिए अपना उपलब्धता क्षेत्र जोड़ें।",
          out_of_scope: "मुझे FoodBridge सहायता विषयों के लिए प्रशिक्षित किया गया है। पंजीकरण, दान, पिकअप, खाद्य सुरक्षा या खाते के बारे में पूछें।"
        },
        kn: {
          greeting: "ನಮಸ್ಕಾರ! FoodBridge, ದೇಣಿಗೆ, ಖಾತೆ ನೋಂದಣಿ ಮತ್ತು ಆಹಾರ ಸುರಕ್ಷತೆಯ ಬಗ್ಗೆ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. ನಿಮಗೆ ಏನು ತಿಳಿಯಬೇಕು?",
          goodbye: "ವಿದಾಯ! FoodBridge ಮೂಲಕ ಆಹಾರ ವ್ಯರ್ಥವನ್ನು ಕಡಿಮೆ ಮಾಡಲು ಸಹಕರಿಸಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದಗಳು.", thanks: "ಸ್ವಾಗತ! FoodBridge ಸಹಾಯಕ್ಕೆ ನಾನು ಇಲ್ಲಿದ್ದೇನೆ.",
          about_foodbridge: "FoodBridge ಹೆಚ್ಚುವರಿ ಆಹಾರವನ್ನು ಹಂಚಲು ಆಹಾರ ದಾನಿಗಳನ್ನು ಅನುಮೋದಿತ NGOಗಳು ಮತ್ತು ಸ್ವಯಂಸೇವಕರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುತ್ತದೆ; ಪ್ರತಿ ಹಂತವನ್ನೂ ದಾಖಲಿಸುತ್ತದೆ.",
          account_login: "ಖಾತೆಗೆ ಪ್ರವೇಶಿಸಲು Login ಪುಟವನ್ನು ಬಳಸಿ. ಪ್ರವೇಶವಾಗದಿದ್ದರೆ ಇಮೇಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ಪರಿಶೀಲಿಸಿ ಅಥವಾ ಬೆಂಬಲವನ್ನು ಸಂಪರ್ಕಿಸಿ.",
          claim_donation: "ಅನುಮೋದಿತ NGOಗಳು NGO Portal ನಲ್ಲಿ ಲಭ್ಯವಿರುವ ದೇಣಿಗೆಗಳನ್ನು ನೋಡಿ ಸೂಕ್ತವಾದುದನ್ನು ಸ್ವೀಕರಿಸಬಹುದು. ಸ್ವೀಕರಿಸಲು ನಿರ್ವಾಹಕರ ಅನುಮೋದನೆ ಅಗತ್ಯ.",
          contact_support: "ಹೆಚ್ಚಿನ ಸಹಾಯಕ್ಕೆ FoodBridge ಆ್ಯಪ್‌ನಲ್ಲಿರುವ ಸಂಪರ್ಕ ವಿವರಗಳನ್ನು ಬಳಸಿ. ಸಮಸ್ಯೆಯನ್ನು ತಿಳಿಸಿದರೆ ಮಾರ್ಗದರ್ಶನ ನೀಡಲು ಪ್ರಯತ್ನಿಸುತ್ತೇನೆ.",
          create_donation: "ರೆಸ್ಟೋರೆಂಟ್ ಖಾತೆಯಿಂದ ಪ್ರವೇಶಿಸಿ Restaurant Dashboard ನಲ್ಲಿ ದೇಣಿಗೆ ಸೇರಿಸಿ ಅಥವಾ ನಿರ್ವಹಿಸಿ. ಪ್ರಮಾಣ, ಅವಧಿ, ಪಿಕಪ್ ವಿಳಾಸ ಮತ್ತು ಸಮಯ ನಮೂದಿಸಿ.",
          donation_expiry: "ಅವಧಿ ಮುಗಿಯುವ ಮೊದಲು ಸುರಕ್ಷಿತವಾಗಿ ಸಂಗ್ರಹಿಸಬಹುದಾದ ಆಹಾರವನ್ನಷ್ಟೇ ಪಟ್ಟಿ ಮಾಡಿ. ಸರಿಯಾದ ತಾಪಮಾನ ಮತ್ತು ಪ್ಯಾಕಿಂಗ್ ಕಾಯ್ದುಕೊಂಡು ಅಲರ್ಜಿ ಹಾಗೂ ನಿರ್ವಹಣೆ ವಿವರಿಸಿ.",
          donor_registration: "Register ಆಯ್ಕೆಮಾಡಿ, ನಿಮ್ಮ ಖಾತೆಯ ಪಾತ್ರವನ್ನು ಆರಿಸಿ ಮತ್ತು ಫಾರ್ಮ್ ಭರ್ತಿ ಮಾಡಿ. ಆಹಾರ ಪಟ್ಟಿ ಮಾಡಲು Restaurant, ದೇಣಿಗೆ ಪಡೆಯಲು NGO, ಅಥವಾ ಪಿಕಪ್ ಸಹಾಯಕ್ಕೆ Volunteer ಆಯ್ಕೆಮಾಡಿ.",
          food_safety: "ಆಹಾರ ಸುರಕ್ಷಿತವಾಗಿರಬೇಕು. ಬಿಸಿ ಆಹಾರವನ್ನು 60°C ಗಿಂತ ಹೆಚ್ಚು, ತಣ್ಣನೆಯ ಆಹಾರವನ್ನು 4°C ಅಥವಾ ಕಡಿಮೆ ಇಡಿ; ಆಹಾರ-ಸುರಕ್ಷಿತ ಪ್ಯಾಕಿಂಗ್ ಮಾಡಿ, ಅಲರ್ಜಿಗಳನ್ನು ಸೂಚಿಸಿ.",
          ngo_approval: "NGO ನೋಂದಣಿಯನ್ನು FoodBridge ನಿರ್ವಾಹಕರು ಪರಿಶೀಲಿಸುತ್ತಾರೆ. ಬಾಕಿ ಸ್ಥಿತಿಯಲ್ಲಿ ಪಟ್ಟಿಗಳನ್ನು ನೋಡಬಹುದು; ದೇಣಿಗೆ ಸ್ವೀಕರಿಸಲು ಅನುಮೋದನೆ ಬೇಕು.",
          pickup_assignment: "NGO ದೇಣಿಗೆಯನ್ನು ಸ್ವೀಕರಿಸಿದ ನಂತರ ಲಭ್ಯವಿರುವ ಸ್ವಯಂಸೇವಕರನ್ನು ನಿಯೋಜಿಸಬಹುದು. ಪಿಕಪ್ ಮತ್ತು ವಿತರಣೆಯ ಸ್ಥಿತಿ ದೇಣಿಗೆಯ ಕಾಲರೇಖೆಯಲ್ಲಿ ಕಾಣುತ್ತದೆ.",
          role_permissions: "ರೆಸ್ಟೋರೆಂಟ್‌ಗಳು ದೇಣಿಗೆ ಪಟ್ಟಿ ಮಾಡುತ್ತವೆ, ಅನುಮೋದಿತ NGOಗಳು ಸ್ವೀಕರಿಸುತ್ತವೆ, ಸ್ವಯಂಸೇವಕರು ನಿಯೋಜಿತ ಪಿಕಪ್ ಮಾಡುತ್ತಾರೆ ಮತ್ತು ನಿರ್ವಾಹಕರು ಅನುಮೋದನೆ ಹಾಗೂ ಕಾರ್ಯಾಚರಣೆ ನೋಡಿಕೊಳ್ಳುತ್ತಾರೆ.",
          volunteer_registration: "Register ಆಯ್ಕೆಮಾಡಿ ಸ್ವಯಂಸೇವಕ ಖಾತೆ ರಚಿಸಿ. ಹತ್ತಿರದ ಪಿಕಪ್‌ಗಳಿಗಾಗಿ ನಿಮ್ಮ ಲಭ್ಯತಾ ವಲಯ ಸೇರಿಸಿ.",
          out_of_scope: "ನನಗೆ FoodBridge ಸಹಾಯ ವಿಷಯಗಳ ತರಬೇತಿ ಇದೆ. ನೋಂದಣಿ, ದೇಣಿಗೆ, ಪಿಕಪ್, ಆಹಾರ ಸುರಕ್ಷತೆ ಅಥವಾ ಖಾತೆ ಬಗ್ಗೆ ಕೇಳಿ."
        }
      };
      const privateIntents = ['delivery_status', 'donation_history'];
      let answer = text[language][prediction.intent] || text[language].out_of_scope;
      let records: any[] | undefined;
      if (!prediction.fallback && privateIntents.includes(prediction.intent)) {
        if (!req.user) {
          res.status(401).json({ error: language === 'hi' ? "अपनी डिलीवरी या दान का इतिहास देखने के लिए पहले लॉगिन करें।" : language === 'kn' ? "ನಿಮ್ಮ ವಿತರಣೆ ಅಥವಾ ದೇಣಿಗೆ ಇತಿಹಾಸ ನೋಡಲು ಮೊದಲು ಲಾಗಿನ್ ಮಾಡಿ." : "Please log in to view your delivery status or donation history." });
          return;
        }
        let ownership = "restaurant_id = ?";
        if (req.user.role === 'ngo') ownership = "accepted_by_ngo_id = ?";
        else if (req.user.role === 'volunteer') ownership = "assigned_volunteer_id = ?";
        else if (req.user.role === 'admin') ownership = "1=1";
        records = querySql(`SELECT id, title, status, expiry, created_at FROM donations WHERE ${ownership} ORDER BY created_at DESC LIMIT 10`, req.user.role === 'admin' ? [] : [req.user.id]);
        answer = language === 'hi' ? "यहाँ आपके खाते से जुड़े नवीनतम दान और उनकी स्थिति है:" : language === 'kn' ? "ನಿಮ್ಮ ಖಾತೆಗೆ ಸಂಬಂಧಿಸಿದ ಇತ್ತೀಚಿನ ದೇಣಿಗೆಗಳು ಮತ್ತು ಅವುಗಳ ಸ್ಥಿತಿ ಇಲ್ಲಿವೆ:" : "Here are the latest donations linked to your account and their status:";
        if (records.length === 0) answer = language === 'hi' ? "आपके खाते से जुड़ा कोई दान रिकॉर्ड अभी नहीं मिला।" : language === 'kn' ? "ನಿಮ್ಮ ಖಾತೆಗೆ ಸಂಬಂಧಿಸಿದ ದೇಣಿಗೆ ದಾಖಲೆಗಳು ಇನ್ನೂ ಕಂಡುಬಂದಿಲ್ಲ." : "There are no donation records linked to your account yet.";
      }
      if (prediction.fallback) answer = text[language].out_of_scope;
      res.json({ intent: prediction.intent, confidence: prediction.confidence, language, fallback: prediction.fallback, answer, ...(records ? { records } : {}) });
    } catch (error) {
      console.error("Chatbot request failed:", error);
      res.status(503).json({ error: "Chat support is temporarily unavailable. Please try again." });
    }
  });

  // Auth: Register
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { name, email, password, role, organizationName, phone, address, availabilityZone } = req.body;

      if (!name || !email || !password || !role) {
        res.status(400).json({ error: "Name, email, password, and role are required." });
        return;
      }

      const existing = queryOneSql("SELECT id FROM users WHERE email = ?", [email.toLowerCase().trim()]);
      if (existing) {
        res.status(400).json({ error: "An account with this email already exists." });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const createdAt = new Date().toISOString();
      
      // NGOs require admin approval by default, restaurants & volunteers approved
      const status = role === 'ngo' ? 'pending' : 'approved';

      runSql(`INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        userId, name, email.toLowerCase().trim(), hashedPassword, role, status,
        organizationName || name, phone || '', address || '', availabilityZone || '', createdAt
      ]);

      logActivity(userId, name, role, "User Register", `Registered as ${role} (${status})`);

      const userObj = {
        id: userId,
        name,
        email: email.toLowerCase().trim(),
        role,
        status,
        organizationName: organizationName || name,
        phone: phone || '',
        address: address || '',
        availabilityZone: availabilityZone || '',
        createdAt
      };

      const token = jwt.sign(
        { id: userId, email: userObj.email, role: userObj.role, name: userObj.name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(201).json({ token, user: userObj });
    } catch (err: any) {
      console.error("Register error:", err);
      res.status(500).json({ error: err.message || "Failed to register" });
    }
  });

  // Auth: Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required." });
        return;
      }

      const user = queryOneSql("SELECT * FROM users WHERE email = ?", [email.toLowerCase().trim()]);
      if (!user) {
        res.status(401).json({ error: "Invalid email or password." });
        return;
      }

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        res.status(401).json({ error: "Invalid email or password." });
        return;
      }

      if (user.status === 'suspended') {
        res.status(403).json({ error: "Your account has been suspended. Please contact platform admin." });
        return;
      }

      const userObj = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        organizationName: user.organization_name,
        phone: user.phone,
        address: user.address,
        availabilityZone: user.availability_zone,
        createdAt: user.created_at
      };

      const token = jwt.sign(
        { id: userObj.id, email: userObj.email, role: userObj.role, name: userObj.name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      logActivity(userObj.id, userObj.name, userObj.role, "User Login", "Logged into system");

      res.json({ token, user: userObj });
    } catch (err: any) {
      console.error("Login error:", err);
      res.status(500).json({ error: err.message || "Failed to login" });
    }
  });

  // Auth: Current User
  app.get("/api/auth/me", authenticateToken, (req: AuthRequest, res: Response) => {
    const user = queryOneSql("SELECT * FROM users WHERE id = ?", [req.user?.id]);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      organizationName: user.organization_name,
      phone: user.phone,
      address: user.address,
      availabilityZone: user.availability_zone,
      createdAt: user.created_at
    });
  });

  // Helper to get formatted donation object with timeline
  function getFullDonation(donId: string) {
    const don = queryOneSql("SELECT * FROM donations WHERE id = ?", [donId]);
    if (!don) return null;
    const timelineRows = querySql("SELECT * FROM donation_timeline WHERE donation_id = ? ORDER BY timestamp ASC", [donId]);

    return {
      id: don.id,
      restaurantId: don.restaurant_id,
      restaurantName: don.restaurant_name,
      title: don.title,
      category: don.category,
      quantity: don.quantity,
      expiry: don.expiry,
      pickupAddress: don.pickup_address,
      pickupWindow: don.pickup_window,
      specialNotes: don.special_notes,
      status: don.status,
      acceptedByNgoId: don.accepted_by_ngo_id,
      acceptedByNgoName: don.accepted_by_ngo_name,
      assignedVolunteerId: don.assigned_volunteer_id,
      assignedVolunteerName: don.assigned_volunteer_name,
      createdAt: don.created_at,
      statusTimeline: timelineRows.map(tl => ({
        status: tl.status,
        timestamp: tl.timestamp,
        updatedBy: tl.updated_by,
        note: tl.note
      }))
    };
  }

  // GET /api/donations (Filterable by status, restaurantId, ngoId, volunteerId)
  app.get("/api/donations", (req: Request, res: Response) => {
    const { status, restaurantId, ngoId, volunteerId, search } = req.query;
    let sql = "SELECT id FROM donations WHERE 1=1";
    const params: any[] = [];

    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }
    if (restaurantId) {
      sql += " AND restaurant_id = ?";
      params.push(restaurantId);
    }
    if (ngoId) {
      sql += " AND accepted_by_ngo_id = ?";
      params.push(ngoId);
    }
    if (volunteerId) {
      sql += " AND assigned_volunteer_id = ?";
      params.push(volunteerId);
    }
    if (search) {
      sql += " AND (title LIKE ? OR restaurant_name LIKE ? OR category LIKE ?)";
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    sql += " ORDER BY created_at DESC";

    const rows = querySql(sql, params);
    const donations = rows.map(r => getFullDonation(r.id)).filter(Boolean);
    res.json(donations);
  });

  // GET /api/donations/:id
  app.get("/api/donations/:id", (req: Request, res: Response) => {
    const donation = getFullDonation(req.params.id);
    if (!donation) {
      res.status(404).json({ error: "Donation not found" });
      return;
    }
    res.json(donation);
  });

  // POST /api/donations (Restaurant adds new donation)
  app.post("/api/donations", authenticateToken, (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'restaurant' && req.user?.role !== 'admin') {
      res.status(403).json({ error: "Only restaurants can post food donations." });
      return;
    }

    const user = queryOneSql("SELECT * FROM users WHERE id = ?", [req.user.id]);
    if (user?.status === 'pending') {
      res.status(403).json({ error: "Your account is pending administrator approval before posting donations." });
      return;
    }

    const { title, category, quantity, expiry, pickupAddress, pickupWindow, specialNotes } = req.body;
    if (!title || !quantity || !expiry || !pickupAddress) {
      res.status(400).json({ error: "Title, quantity, expiry, and pickup address are required." });
      return;
    }

    const donId = `don_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const restaurantName = user?.organization_name || user?.name || "Partner Restaurant";

    runSql(`INSERT INTO donations VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      donId, req.user.id, restaurantName, title, category || 'cooked_meal',
      quantity, expiry, pickupAddress, pickupWindow || 'Immediate', specialNotes || '',
      'Available', null, null, null, null, now
    ]);

    const tlId = `tl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    runSql(`INSERT INTO donation_timeline VALUES (?, ?, ?, ?, ?, ?)`, [
      tlId, donId, 'Available', now, restaurantName, 'Donation created and listed'
    ]);

    logActivity(req.user.id, restaurantName, req.user.role, "Create Donation", `Listed donation: ${title}`);

    const newDonation = getFullDonation(donId);
    res.status(201).json(newDonation);
  });

  // PUT /api/donations/:id (Edit donation while Available)
  app.put("/api/donations/:id", authenticateToken, (req: AuthRequest, res: Response) => {
    const don = queryOneSql("SELECT * FROM donations WHERE id = ?", [req.params.id]);
    if (!don) {
      res.status(404).json({ error: "Donation not found" });
      return;
    }

    if (don.restaurant_id !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({ error: "Not authorized to edit this donation." });
      return;
    }

    if (don.status !== 'Available') {
      res.status(400).json({ error: "Cannot edit donation once accepted or in progress." });
      return;
    }

    const { title, category, quantity, expiry, pickupAddress, pickupWindow, specialNotes } = req.body;
    runSql(`
      UPDATE donations SET
        title = ?, category = ?, quantity = ?, expiry = ?, pickup_address = ?, pickup_window = ?, special_notes = ?
      WHERE id = ?
    `, [
      title || don.title,
      category || don.category,
      quantity || don.quantity,
      expiry || don.expiry,
      pickupAddress || don.pickup_address,
      pickupWindow || don.pickup_window,
      specialNotes !== undefined ? specialNotes : don.special_notes,
      req.params.id
    ]);

    res.json(getFullDonation(req.params.id));
  });

  // DELETE /api/donations/:id (Delete donation while Available)
  app.delete("/api/donations/:id", authenticateToken, (req: AuthRequest, res: Response) => {
    const don = queryOneSql("SELECT * FROM donations WHERE id = ?", [req.params.id]);
    if (!don) {
      res.status(404).json({ error: "Donation not found" });
      return;
    }

    if (don.restaurant_id !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({ error: "Not authorized to delete this donation." });
      return;
    }

    if (don.status !== 'Available') {
      res.status(400).json({ error: "Cannot delete donation once accepted or in progress." });
      return;
    }

    runSql("DELETE FROM donations WHERE id = ?", [req.params.id]);
    runSql("DELETE FROM donation_timeline WHERE donation_id = ?", [req.params.id]);

    logActivity(req.user.id, req.user.name, req.user.role, "Delete Donation", `Deleted donation: ${don.title}`);

    res.json({ message: "Donation deleted successfully." });
  });

  // STATE MACHINE TRANSITIONS

  // 1. POST /api/donations/:id/accept (Available -> Accepted)
  app.post("/api/donations/:id/accept", authenticateToken, (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'ngo' && req.user?.role !== 'admin') {
      res.status(403).json({ error: "Only registered NGOs can accept food donations." });
      return;
    }

    const user = queryOneSql("SELECT * FROM users WHERE id = ?", [req.user.id]);
    if (user?.status !== 'approved' && req.user?.role !== 'admin') {
      res.status(403).json({ error: "Your NGO account is pending administrative verification." });
      return;
    }

    const don = queryOneSql("SELECT * FROM donations WHERE id = ?", [req.params.id]);
    if (!don) {
      res.status(404).json({ error: "Donation not found" });
      return;
    }

    if (don.status !== 'Available') {
      res.status(400).json({ error: `Cannot accept donation with current status '${don.status}'. Must be Available.` });
      return;
    }

    const now = new Date().toISOString();
    const ngoName = user?.organization_name || user?.name || "NGO Partner";

    runSql(`
      UPDATE donations SET
        status = 'Accepted',
        accepted_by_ngo_id = ?,
        accepted_by_ngo_name = ?
      WHERE id = ?
    `, [req.user.id, ngoName, req.params.id]);

    const tlId = `tl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    runSql(`INSERT INTO donation_timeline VALUES (?, ?, ?, ?, ?, ?)`, [
      tlId, req.params.id, 'Accepted', now, ngoName, `Accepted by NGO ${ngoName}`
    ]);

    logActivity(req.user.id, ngoName, req.user.role, "Accept Donation", `Accepted donation '${don.title}'`);

    res.json(getFullDonation(req.params.id));
  });

  // 2. POST /api/donations/:id/assign-volunteer (Accepted -> Pickup Assigned)
  app.post("/api/donations/:id/assign-volunteer", authenticateToken, (req: AuthRequest, res: Response) => {
    const don = queryOneSql("SELECT * FROM donations WHERE id = ?", [req.params.id]);
    if (!don) {
      res.status(404).json({ error: "Donation not found" });
      return;
    }

    if (don.accepted_by_ngo_id !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({ error: "Only the NGO that accepted this donation (or an admin) can assign a volunteer." });
      return;
    }

    if (don.status !== 'Accepted') {
      res.status(400).json({ error: `Cannot assign volunteer when status is '${don.status}'. Must be Accepted.` });
      return;
    }

    const { volunteerId } = req.body;
    if (!volunteerId) {
      res.status(400).json({ error: "volunteerId is required" });
      return;
    }

    const volunteer = queryOneSql("SELECT * FROM users WHERE id = ? AND role = 'volunteer'", [volunteerId]);
    if (!volunteer) {
      res.status(400).json({ error: "Selected volunteer not found." });
      return;
    }

    const now = new Date().toISOString();
    const user = queryOneSql("SELECT * FROM users WHERE id = ?", [req.user?.id]);
    const updatedByName = user?.organization_name || user?.name || "NGO";

    runSql(`
      UPDATE donations SET
        status = 'Pickup Assigned',
        assigned_volunteer_id = ?,
        assigned_volunteer_name = ?
      WHERE id = ?
    `, [volunteer.id, volunteer.name, req.params.id]);

    const tlId = `tl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    runSql(`INSERT INTO donation_timeline VALUES (?, ?, ?, ?, ?, ?)`, [
      tlId, req.params.id, 'Pickup Assigned', now, updatedByName, `Assigned volunteer ${volunteer.name} for pickup`
    ]);

    const asgnId = `asgn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    runSql(`INSERT INTO assignments VALUES (?, ?, ?, ?, ?)`, [
      asgnId, req.params.id, don.accepted_by_ngo_id || req.user?.id || '', volunteer.id, now
    ]);

    logActivity(req.user?.id || 'sys', updatedByName, req.user?.role || 'ngo', "Assign Volunteer", `Assigned ${volunteer.name} to donation '${don.title}'`);

    res.json(getFullDonation(req.params.id));
  });

  // 3. POST /api/donations/:id/pickup (Pickup Assigned -> Picked Up)
  app.post("/api/donations/:id/pickup", authenticateToken, (req: AuthRequest, res: Response) => {
    const don = queryOneSql("SELECT * FROM donations WHERE id = ?", [req.params.id]);
    if (!don) {
      res.status(404).json({ error: "Donation not found" });
      return;
    }

    const isVolunteer = don.assigned_volunteer_id === req.user?.id;
    const isDonor = don.restaurant_id === req.user?.id;
    const isNgo = don.accepted_by_ngo_id === req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    if (!isVolunteer && !isDonor && !isNgo && !isAdmin) {
      res.status(403).json({ error: "Not authorized to update pickup status for this donation." });
      return;
    }

    if (don.status !== 'Pickup Assigned') {
      res.status(400).json({ error: `Cannot mark picked up when status is '${don.status}'. Must be Pickup Assigned.` });
      return;
    }

    const now = new Date().toISOString();
    const user = queryOneSql("SELECT * FROM users WHERE id = ?", [req.user?.id]);
    const updaterName = user?.name || "Volunteer";

    runSql(`
      UPDATE donations SET
        status = 'Picked Up'
      WHERE id = ?
    `, [req.params.id]);

    const tlId = `tl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    runSql(`INSERT INTO donation_timeline VALUES (?, ?, ?, ?, ?, ?)`, [
      tlId, req.params.id, 'Picked Up', now, updaterName, `Food picked up from ${don.restaurant_name}`
    ]);

    logActivity(req.user?.id || 'sys', updaterName, req.user?.role || 'volunteer', "Mark Picked Up", `Picked up food from ${don.restaurant_name}`);

    res.json(getFullDonation(req.params.id));
  });

  // 4. POST /api/donations/:id/deliver (Picked Up -> Delivered)
  app.post("/api/donations/:id/deliver", authenticateToken, (req: AuthRequest, res: Response) => {
    const don = queryOneSql("SELECT * FROM donations WHERE id = ?", [req.params.id]);
    if (!don) {
      res.status(404).json({ error: "Donation not found" });
      return;
    }

    const isVolunteer = don.assigned_volunteer_id === req.user?.id;
    const isNgo = don.accepted_by_ngo_id === req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    if (!isVolunteer && !isNgo && !isAdmin) {
      res.status(403).json({ error: "Not authorized to update delivery status for this donation." });
      return;
    }

    if (don.status !== 'Picked Up') {
      res.status(400).json({ error: `Cannot mark delivered when status is '${don.status}'. Must be Picked Up.` });
      return;
    }

    const now = new Date().toISOString();
    const user = queryOneSql("SELECT * FROM users WHERE id = ?", [req.user?.id]);
    const updaterName = user?.name || "Volunteer";

    runSql(`
      UPDATE donations SET
        status = 'Delivered'
      WHERE id = ?
    `, [req.params.id]);

    const tlId = `tl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    runSql(`INSERT INTO donation_timeline VALUES (?, ?, ?, ?, ?, ?)`, [
      tlId, req.params.id, 'Delivered', now, updaterName, `Delivered food to ${don.accepted_by_ngo_name || 'NGO'}`
    ]);

    logActivity(req.user?.id || 'sys', updaterName, req.user?.role || 'volunteer', "Mark Delivered", `Delivered food to ${don.accepted_by_ngo_name || 'NGO'}`);

    res.json(getFullDonation(req.params.id));
  });

  // 5. POST /api/donations/:id/complete (Delivered -> Completed)
  app.post("/api/donations/:id/complete", authenticateToken, (req: AuthRequest, res: Response) => {
    const don = queryOneSql("SELECT * FROM donations WHERE id = ?", [req.params.id]);
    if (!don) {
      res.status(404).json({ error: "Donation not found" });
      return;
    }

    const isVolunteer = don.assigned_volunteer_id === req.user?.id;
    const isDonor = don.restaurant_id === req.user?.id;
    const isNgo = don.accepted_by_ngo_id === req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    if (!isVolunteer && !isDonor && !isNgo && !isAdmin) {
      res.status(403).json({ error: "Not authorized to complete this donation." });
      return;
    }

    if (don.status !== 'Delivered' && don.status !== 'Picked Up') {
      res.status(400).json({ error: `Cannot complete donation when status is '${don.status}'.` });
      return;
    }

    const now = new Date().toISOString();
    const user = queryOneSql("SELECT * FROM users WHERE id = ?", [req.user?.id]);
    const updaterName = user?.organization_name || user?.name || "User";

    runSql(`
      UPDATE donations SET
        status = 'Completed'
      WHERE id = ?
    `, [req.params.id]);

    const tlId = `tl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    runSql(`INSERT INTO donation_timeline VALUES (?, ?, ?, ?, ?, ?)`, [
      tlId, req.params.id, 'Completed', now, updaterName, "Donation verified and completed"
    ]);

    logActivity(req.user?.id || 'sys', updaterName, req.user?.role || 'user', "Mark Completed", `Completed redistribution for '${don.title}'`);

    res.json(getFullDonation(req.params.id));
  });

  // ADMIN ENDPOINTS

  // GET /api/admin/users
  app.get("/api/admin/users", authenticateToken, (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'admin' && req.user?.role !== 'ngo') {
    res.status(403).json({ error: "Access denied" });
    return;
}

    const users = querySql("SELECT id, name, email, role, status, organization_name as organizationName, phone, address, availability_zone as availabilityZone, created_at as createdAt FROM users ORDER BY created_at DESC");
    res.json(users);
  });

  // PUT /api/admin/users/:id/approve
  app.put("/api/admin/users/:id/approve", authenticateToken, (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const targetUser = queryOneSql("SELECT * FROM users WHERE id = ?", [req.params.id]);
    if (!targetUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    runSql("UPDATE users SET status = 'approved' WHERE id = ?", [req.params.id]);
    logActivity(req.user.id, req.user.name, 'admin', "Approve User", `Approved account for ${targetUser.name} (${targetUser.role})`);

    res.json({ message: `User ${targetUser.name} approved successfully.` });
  });

  // PUT /api/admin/users/:id/status (Suspend / Activate)
  app.put("/api/admin/users/:id/status", authenticateToken, (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const { status } = req.body;
    if (!['approved', 'pending', 'suspended'].includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const targetUser = queryOneSql("SELECT * FROM users WHERE id = ?", [req.params.id]);
    if (!targetUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    runSql("UPDATE users SET status = ? WHERE id = ?", [status, req.params.id]);
    logActivity(req.user.id, req.user.name, 'admin', "Update User Status", `Set status of ${targetUser.name} to ${status}`);

    res.json({ message: `User status updated to ${status}.` });
  });

  // GET /api/admin/dashboard
  app.get("/api/admin/dashboard", authenticateToken, (req: AuthRequest, res: Response) => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const totalUsers = queryOneSql("SELECT COUNT(*) as c FROM users")?.c || 0;
    const pendingNgos = queryOneSql("SELECT COUNT(*) as c FROM users WHERE role = 'ngo' AND status = 'pending'")?.c || 0;
    const activeDonations = queryOneSql("SELECT COUNT(*) as c FROM donations WHERE status != 'Completed'")?.c || 0;
    const completedDonations = queryOneSql("SELECT COUNT(*) as c FROM donations WHERE status = 'Completed'")?.c || 0;

    const logs = querySql("SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 20");

    res.json({
      totalUsers,
      pendingNgos,
      activeDonations,
      completedDonations,
      logs: logs.map(l => ({
        id: l.id,
        userId: l.user_id,
        userName: l.user_name,
        userRole: l.user_role,
        action: l.action,
        details: l.details,
        timestamp: l.timestamp
      }))
    });
  });

  // STATS & IMPACT API
  app.get("/api/stats/impact", (_req: Request, res: Response) => {
    const completedCount = queryOneSql("SELECT COUNT(*) as c FROM donations WHERE status = 'Completed'")?.c || 0;
    const totalDonations = queryOneSql("SELECT COUNT(*) as c FROM donations")?.c || 0;
    const activeNgos = queryOneSql("SELECT COUNT(*) as c FROM users WHERE role = 'ngo' AND status = 'approved'")?.c || 0;
    const volunteers = queryOneSql("SELECT COUNT(*) as c FROM users WHERE role = 'volunteer'")?.c || 0;

    // Calculate real meals & tons prevented directly from database records
    const completedDonations = querySql("SELECT quantity FROM donations WHERE status = 'Completed'");
    let mealsDonated = 0;
    for (const d of completedDonations) {
      const q = parseInt(d.quantity) || 0;
      mealsDonated += q;
    }

    const successfulDeliveries = completedCount;
    const foodWastePreventedTons = Number((mealsDonated * 0.0004).toFixed(2));

    res.json({
      mealsDonated,
      activeNgos,
      volunteers,
      successfulDeliveries,
      foodWastePreventedTons,
      activeDonationsCount: totalDonations - completedCount
    });
  });

  // ACTIVITY LOGS
  app.get("/api/activity-logs", authenticateToken, (_req: Request, res: Response) => {
    const logs = querySql("SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 50");
    res.json(logs.map(l => ({
      id: l.id,
      userId: l.user_id,
      userName: l.user_name,
      userRole: l.user_role,
      action: l.action,
      details: l.details,
      timestamp: l.timestamp
    })));
  });

  // PROFILE API
  app.get("/api/profile", authenticateToken, (req: AuthRequest, res: Response) => {
    const user = queryOneSql("SELECT * FROM users WHERE id = ?", [req.user?.id]);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      organizationName: user.organization_name,
      phone: user.phone,
      address: user.address,
      availabilityZone: user.availability_zone,
      createdAt: user.created_at
    });
  });

  app.put("/api/profile", authenticateToken, (req: AuthRequest, res: Response) => {
    const { name, organizationName, phone, address, availabilityZone } = req.body;
    
    runSql(`
      UPDATE users SET
        name = ?, organization_name = ?, phone = ?, address = ?, availability_zone = ?
      WHERE id = ?
    `, [name, organizationName || name, phone || '', address || '', availabilityZone || '', req.user?.id]);

    const updated = queryOneSql("SELECT * FROM users WHERE id = ?", [req.user?.id]);
    res.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      status: updated.status,
      organizationName: updated.organization_name,
      phone: updated.phone,
      address: updated.address,
      availabilityZone: updated.availability_zone,
      createdAt: updated.created_at
    });
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FoodBridge Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
