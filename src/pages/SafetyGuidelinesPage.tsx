import React, { useState } from 'react';
import { 
  ShieldCheck, CheckCircle2, XCircle, Thermometer, Utensils, 
  HeartHandshake, Bike, FileText, Search, AlertTriangle, 
  Sparkles, ArrowLeft, Download, ExternalLink, HelpCircle, Info, Shield 
} from 'lucide-react';

interface SafetyGuidelinesPageProps {
  onNavigate: (page: string) => void;
}

export const SafetyGuidelinesPage: React.FC<SafetyGuidelinesPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'restaurant' | 'ngo' | 'volunteer' | 'foods' | 'legal'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive Temp Checker State
  const [calcCategory, setCalcCategory] = useState<'hot' | 'cold' | 'ambient' | 'bakery'>('hot');
  const [calcTemp, setCalcTemp] = useState<number>(145);
  const [calcUnit, setCalcUnit] = useState<'F' | 'C'>('F');
  const [calcHours, setCalcHours] = useState<number>(1);

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const tempInF = calcUnit === 'C' ? (calcTemp * 9) / 5 + 32 : calcTemp;
  let tempStatus: 'safe' | 'caution' | 'unsafe' = 'safe';
  let tempMessage = '';

  if (calcCategory === 'hot') {
    if (tempInF >= 140 && calcHours <= 4) {
      tempStatus = 'safe';
      tempMessage = 'Safe for donation! Hot food is maintained above 140°F (60°C). Thermal container packaging required.';
    } else if (tempInF >= 120 && calcHours <= 2) {
      tempStatus = 'caution';
      tempMessage = 'Time-sensitive! Must be transferred to insulated containers or rapidly chilled below 40°F immediately.';
    } else {
      tempStatus = 'unsafe';
      tempMessage = 'Do NOT donate. Hot food held below 140°F for over 2 hours enters the bacterial danger zone.';
    }
  } else if (calcCategory === 'cold') {
    if (tempInF <= 40 && calcHours <= 24) {
      tempStatus = 'safe';
      tempMessage = 'Safe for donation! Chilled food maintained at or below 40°F (4°C). Keep refrigerated during transit.';
    } else if (tempInF <= 45 && calcHours <= 2) {
      tempStatus = 'caution';
      tempMessage = 'Requires immediate ice-pack transport or rapid cooling before dispatch.';
    } else {
      tempStatus = 'unsafe';
      tempMessage = 'Do NOT donate. Cold food stored above 40°F risks rapid bacterial growth.';
    }
  } else if (calcCategory === 'bakery' || calcCategory === 'ambient') {
    if (calcHours <= 24) {
      tempStatus = 'safe';
      tempMessage = 'Safe for donation! Ensure items are wrapped in food-grade packaging and clearly labeled with allergens.';
    } else {
      tempStatus = 'caution';
      tempMessage = 'Inspect carefully for stale texture, moisture condensation, or broken packaging before dispatch.';
    }
  }

  const faqs = [
    {
      q: "Who is responsible for food safety during transport?",
      a: "Responsibilities are shared across the pipeline: Restaurants ensure proper initial temperature staging and packaging; Volunteer Drivers maintain insulated thermal bags during transit; NGOs conduct temperature probe checks upon arrival."
    },
    {
      q: "Can restaurants donate surplus food from buffet lines?",
      a: "No. Food previously exposed on open self-service buffets cannot be donated due to contamination risks. Only unserved kitchen surplus stored in temperature-controlled back-of-house containers is suitable."
    },
    {
      q: "What packaging materials are acceptable for donation?",
      a: "Food-grade aluminum steam table pans with tight lids, clear food packaging containers with tamper seals, and commercial food wrap. Single-use plastic bags or unsealed bowls are strictly prohibited."
    },
    {
      q: "Are donors protected against legal liability?",
      a: "Yes. Under the Bill Emerson Good Samaritan Food Donation Act, donors donating wholesome surplus food in good faith to non-profit entities are protected from civil and criminal liability."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Breadcrumb & Header Banner */}
      <div className="space-y-4">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-[#E8630A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="bg-gradient-to-br from-stone-900 via-[#1F1B18] to-stone-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border border-stone-800">
          <div className="space-y-3 max-w-2xl z-10">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-bold px-3 py-1 rounded-full">
              <ShieldCheck className="w-4 h-4 text-orange-400" />
              Official FoodBridge Quality Standards
            </div>
            <h1 className="font-cause font-extrabold text-3xl sm:text-4xl tracking-tight text-white">
              Food Safety & Handling Guidelines
            </h1>
            <p className="text-stone-300 text-sm leading-relaxed">
              Comprehensive guidelines for restaurants, NGOs, and volunteer drivers to ensure every meal redistributed through FoodBridge is safe, wholesome, and compliant with health regulations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 z-10 w-full sm:w-auto">
            <button
              onClick={() => window.print()}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Print Safety Sheet</span>
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="px-5 py-3 rounded-2xl bg-[#E8630A] hover:bg-[#C2410C] text-white font-bold text-xs shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Utensils className="w-4 h-4" />
              <span>List Surplus Food</span>
            </button>
          </div>

          {/* Decorative Background Accent */}
          <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </div>

      {/* Interactive Temperature Checker Section */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#E8630A] flex items-center justify-center font-bold">
              <Thermometer className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-cause font-extrabold text-xl text-stone-900">
                Interactive Food Safety Verification Tool
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Test temperature & staging duration compliance before donating or receiving food
              </p>
            </div>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
            HACCP Standard
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-stone-800 block">Food Type</label>
            <select
              value={calcCategory}
              onChange={(e: any) => setCalcCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 font-bold bg-white text-stone-800 outline-none focus:border-[#E8630A]"
            >
              <option value="hot">Cooked Hot Dish (Soups, Stews, Rice)</option>
              <option value="cold">Chilled / Prepared Salad / Dairy</option>
              <option value="bakery">Bakery / Bread / Pastries</option>
              <option value="ambient">Packaged Dry Goods</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-stone-800 block">Current Temperature</label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={calcTemp}
                onChange={(e) => setCalcTemp(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 font-bold text-stone-900 outline-none focus:border-[#E8630A]"
              />
              <button
                onClick={() => setCalcUnit(calcUnit === 'F' ? 'C' : 'F')}
                className="px-3 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 font-extrabold text-stone-800 border border-stone-300"
              >
                °{calcUnit}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-stone-800 block">Hours Since Prep</label>
            <input
              type="number"
              min="1"
              max="48"
              value={calcHours}
              onChange={(e) => setCalcHours(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 font-bold text-stone-900 outline-none focus:border-[#E8630A]"
            />
          </div>

          <div className="flex flex-col justify-end space-y-1.5">
            <label className="font-bold text-stone-800 block">Safety Assessment</label>
            <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 ${
              tempStatus === 'safe' 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                : tempStatus === 'caution'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}>
              {tempStatus === 'safe' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
              {tempStatus === 'caution' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
              {tempStatus === 'unsafe' && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
              <div>
                <p className="uppercase text-[11px] tracking-wider font-extrabold">
                  {tempStatus === 'safe' ? 'Compliant & Safe' : tempStatus === 'caution' ? 'Action Required' : 'Unsafe to Donate'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-2xl font-medium text-xs border ${
          tempStatus === 'safe' ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' :
          tempStatus === 'caution' ? 'bg-amber-50/70 border-amber-200 text-amber-900' :
          'bg-rose-50/70 border-rose-200 text-rose-900'
        }`}>
          {tempMessage}
        </div>
      </div>

      {/* Main Guidelines Tabs */}
      <div className="space-y-6">
        
        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-[#E8630A] text-white shadow-md shadow-orange-600/20'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Full Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('foods')}
            className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'foods'
                ? 'bg-[#E8630A] text-white shadow-md shadow-orange-600/20'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Utensils className="w-4 h-4 text-emerald-600" />
            <span>Suitable vs. Unsuitable</span>
          </button>

          <button
            onClick={() => setActiveTab('restaurant')}
            className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'restaurant'
                ? 'bg-[#E8630A] text-white shadow-md shadow-orange-600/20'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Utensils className="w-4 h-4 text-orange-600" />
            <span>Restaurant Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('ngo')}
            className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'ngo'
                ? 'bg-[#E8630A] text-white shadow-md shadow-orange-600/20'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-rose-600" />
            <span>NGO Receiving Protocols</span>
          </button>

          <button
            onClick={() => setActiveTab('volunteer')}
            className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'volunteer'
                ? 'bg-[#E8630A] text-white shadow-md shadow-orange-600/20'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Bike className="w-4 h-4 text-amber-600" />
            <span>Volunteer Drivers</span>
          </button>

          <button
            onClick={() => setActiveTab('legal')}
            className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'legal'
                ? 'bg-[#E8630A] text-white shadow-md shadow-orange-600/20'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Legal Immunity</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="space-y-8">
          
          {/* Panel 1: Suitable vs Unsuitable Foods */}
          {(activeTab === 'all' || activeTab === 'foods') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white border border-emerald-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
                <div className="flex items-center gap-3 border-b border-emerald-100 pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-cause font-extrabold text-lg text-emerald-950">Suitable for Donation</h3>
                    <p className="text-xs text-emerald-700 font-medium">Foods approved for listing and redistribution</p>
                  </div>
                </div>

                <ul className="space-y-3 text-xs text-stone-700">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">✓</span>
                    <div>
                      <p className="font-bold text-stone-900">Unserved Prepared Cooked Meals</p>
                      <p className="text-stone-500">Maintained above 140°F (60°C) or rapidly chilled below 40°F (4°C) in clean kitchen containers.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">✓</span>
                    <div>
                      <p className="font-bold text-stone-900">Commercial Packaged Products</p>
                      <p className="text-stone-500">Unopened boxes, canned goods, or frozen foods with intact seals and visible use-by dates.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">✓</span>
                    <div>
                      <p className="font-bold text-stone-900">Fresh Produce & Whole Fruits</p>
                      <p className="text-stone-500">Raw vegetables and fruit with intact skins, free from mold, bruises, or rot.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">✓</span>
                    <div>
                      <p className="font-bold text-stone-900">Bakery Items & Bread</p>
                      <p className="text-stone-500">Commercial baked rolls, artisan breads, and pastries prepared in licensed kitchens within 24 hours.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white border border-rose-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
                <div className="flex items-center gap-3 border-b border-rose-100 pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-cause font-extrabold text-lg text-rose-950">Prohibited Foods</h3>
                    <p className="text-xs text-rose-700 font-medium">Unsuitable due to foodborne safety risks</p>
                  </div>
                </div>

                <ul className="space-y-3 text-xs text-stone-700">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">✕</span>
                    <div>
                      <p className="font-bold text-stone-900">Open Buffet & Plate Leftovers</p>
                      <p className="text-stone-500">Any food previously displayed on open self-service bars or partially eaten table plates.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">✕</span>
                    <div>
                      <p className="font-bold text-stone-900">Temperature Violated Food (&gt; 2 hours)</p>
                      <p className="text-stone-500">Hot or cold perishables held between 40°F and 140°F for longer than two hours.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">✕</span>
                    <div>
                      <p className="font-bold text-stone-900">Unpasteurized Dairy & Raw Seafood</p>
                      <p className="text-stone-500">Raw milk, unpasteurized juices, raw shellfish, or unpasteurized soft cheeses.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">✕</span>
                    <div>
                      <p className="font-bold text-stone-900">Home-Cooked Food Items</p>
                      <p className="text-stone-500">Food items prepared in non-certified residential kitchens without commercial health permits.</p>
                    </div>
                  </li>
                </ul>
              </div>

            </div>
          )}

          {/* Panel 2: Restaurant Specific Guidelines */}
          {(activeTab === 'all' || activeTab === 'restaurant') && (
            <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#E8630A] flex items-center justify-center font-bold">
                  <Utensils className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-cause font-extrabold text-xl text-stone-900">
                    Restaurant & Kitchen Donor Protocols
                  </h3>
                  <p className="text-xs text-stone-500">Standard operating procedure for preparing surplus listings</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                
                <div className="bg-[#FFF9F5] border border-orange-200/80 rounded-2xl p-5 space-y-3">
                  <span className="w-7 h-7 rounded-xl bg-[#E8630A] text-white font-extrabold flex items-center justify-center text-xs">1</span>
                  <h4 className="font-bold text-stone-900 text-sm">Temperature Holding</h4>
                  <p className="text-stone-600 leading-relaxed">
                    Hot foods must be held continuously at <strong>≥ 140°F (60°C)</strong> prior to driver arrival. Chilled meals must be refrigerated at <strong>≤ 40°F (4°C)</strong>. Record initial temperature on packaging label.
                  </p>
                </div>

                <div className="bg-[#FFF9F5] border border-orange-200/80 rounded-2xl p-5 space-y-3">
                  <span className="w-7 h-7 rounded-xl bg-[#E8630A] text-white font-extrabold flex items-center justify-center text-xs">2</span>
                  <h4 className="font-bold text-stone-900 text-sm">Packaging & Sealing</h4>
                  <p className="text-stone-600 leading-relaxed">
                    Pack in food-grade aluminum steam table pans or clear tamper-evident plastic containers. Covers must be firmly crimped or sealed. Never reuse cardboard or unwashed containers.
                  </p>
                </div>

                <div className="bg-[#FFF9F5] border border-orange-200/80 rounded-2xl p-5 space-y-3">
                  <span className="w-7 h-7 rounded-xl bg-[#E8630A] text-white font-extrabold flex items-center justify-center text-xs">3</span>
                  <h4 className="font-bold text-stone-900 text-sm">Mandatory Allergen Labels</h4>
                  <p className="text-stone-600 leading-relaxed">
                    Affix food label noting: <strong>Preparation Time & Date</strong>, Item Name, and check boxes for Major 8 Allergens (Milk, Egg, Peanut, Tree Nut, Fish, Shellfish, Wheat, Soy, Sesame).
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* Panel 3: NGO Receiving Considerations */}
          {(activeTab === 'all' || activeTab === 'ngo') && (
            <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-cause font-extrabold text-xl text-stone-900">
                    NGO & Shelter Receiving Procedures
                  </h3>
                  <p className="text-xs text-stone-500">Inspection & reheating safety before distribution</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                
                <div className="space-y-3 bg-stone-50 p-5 rounded-2xl border border-stone-200">
                  <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                    <Thermometer className="w-5 h-5 text-rose-600" />
                    <span>1. Core Probe Verification</span>
                  </div>
                  <p className="text-stone-600 leading-relaxed">
                    Upon driver delivery, use a sanitized digital stem thermometer to verify core temperatures. Reject hot food under 135°F or chilled food over 41°F if total transit exceeded 45 minutes.
                  </p>
                </div>

                <div className="space-y-3 bg-stone-50 p-5 rounded-2xl border border-stone-200">
                  <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <span>2. Reheating to 165°F</span>
                  </div>
                  <p className="text-stone-600 leading-relaxed">
                    All pre-cooked donated meals must be reheated to an internal core temperature of <strong>165°F (74°C) for at least 15 seconds</strong> within 2 hours prior to serving community residents.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* Panel 4: Volunteer Drivers */}
          {(activeTab === 'all' || activeTab === 'volunteer') && (
            <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Bike className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-cause font-extrabold text-xl text-stone-900">
                    Volunteer Driver Transport Guidelines
                  </h3>
                  <p className="text-xs text-stone-500">Maintaining thermal integrity during transit</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-5 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-2">
                  <p className="font-bold text-amber-950 text-sm">Insulated Thermal Equipment</p>
                  <p className="text-stone-700 leading-relaxed">
                    Volunteer drivers must carry commercial heavy-duty insulated thermal bags or coolers. Hot and cold items must be kept in separate thermal compartments during transit.
                  </p>
                </div>

                <div className="p-5 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-2">
                  <p className="font-bold text-amber-950 text-sm">Direct Route & Vehicle Sanitation</p>
                  <p className="text-stone-700 leading-relaxed">
                    Dispatches must be driven directly from restaurant to NGO shelter without unapproved detours. Vehicles must be clean, odorless, and strictly free of household pets.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Panel 5: Good Samaritan Legal Act */}
          {(activeTab === 'all' || activeTab === 'legal') && (
            <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-cause font-extrabold text-xl text-stone-900">
                    Bill Emerson Good Samaritan Act Immunity
                  </h3>
                  <p className="text-xs text-stone-500">Legal protection for surplus food donations</p>
                </div>
              </div>

              <div className="text-xs text-stone-700 space-y-4 leading-relaxed">
                <p className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-blue-950 font-medium">
                  The Bill Emerson Good Samaritan Food Donation Act explicitly protects individuals, restaurants, hotels, caterers, and non-profit organizations from civil and criminal liability when donating food in good faith.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                    <p className="font-bold text-stone-900">Good Faith Presumption</p>
                    <p className="text-stone-600">
                      As long as donors reasonably believe food is safe at the time of donation and follow standard temperature rules, legal immunity applies.
                    </p>
                  </div>

                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                    <p className="font-bold text-stone-900">Full Platform Digital Logging</p>
                    <p className="text-stone-600">
                      FoodBridge logs pickup times, status updates, and user confirmations at every step to provide digital verification of compliance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
          <HelpCircle className="w-6 h-6 text-[#E8630A]" />
          <h3 className="font-cause font-extrabold text-xl text-stone-900">
            Frequently Asked Food Safety Questions
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx} 
                className="border border-stone-200 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 font-bold text-sm text-stone-900 hover:bg-stone-50 flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  <span className="text-[#E8630A] font-extrabold text-lg">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="p-4 sm:p-5 pt-0 text-xs text-stone-600 leading-relaxed border-t border-stone-100 bg-stone-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Banner */}
      <div className="bg-[#1F1B18] text-white rounded-3xl p-8 text-center space-y-4">
        <h3 className="font-cause font-extrabold text-2xl">Ready to Start Redirecting Surplus Food Safely?</h3>
        <p className="text-xs text-stone-400 max-w-xl mx-auto">
          Join hundreds of verified restaurants and local shelters building a resilient, zero-hunger community.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('register?role=restaurant')}
            className="px-6 py-3 rounded-2xl bg-[#E8630A] hover:bg-[#C2410C] text-white font-bold text-xs shadow-md transition-all"
          >
            Register Your Restaurant
          </button>
          <button
            onClick={() => onNavigate('register?role=ngo')}
            className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-stone-700"
          >
            Register Your NGO Shelter
          </button>
        </div>
      </div>

    </div>
  );
};
