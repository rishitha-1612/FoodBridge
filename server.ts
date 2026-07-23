import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import initSqlJs, { Database } from "sql.js";

const JWT_SECRET = process.env.JWT_SECRET || "foodbridge-super-secret-jwt-key-2026";
const PORT = 3000;
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
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: "Admin access required" });
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
    console.log(`FoodBridge Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
