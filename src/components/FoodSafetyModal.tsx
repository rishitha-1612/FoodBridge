import React, { useState } from 'react';
import { 
  ShieldCheck, X, CheckCircle2, XCircle, Thermometer, Utensils, 
  HeartHandshake, Bike, AlertTriangle, FileText, Search, ChevronRight, 
  Info, Sparkles, Check, HelpCircle, Shield
} from 'lucide-react';

interface FoodSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRoleTab?: 'all' | 'restaurant' | 'ngo' | 'volunteer' | 'foods' | 'legal';
}

export const FoodSafetyModal: React.FC<FoodSafetyModalProps> = ({
  isOpen,
  onClose,
  defaultRoleTab = 'all'
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'restaurant' | 'ngo' | 'volunteer' | 'foods' | 'legal'>(defaultRoleTab);
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive Temp Checker State
  const [calcCategory, setCalcCategory] = useState<'hot' | 'cold' | 'ambient' | 'bakery'>('hot');
  const [calcTemp, setCalcTemp] = useState<number>(145);
  const [calcUnit, setCalcUnit] = useState<'F' | 'C'>('F');
  const [calcHours, setCalcHours] = useState<number>(1);

  if (!isOpen) return null;

  // Temp calculation logic
  const tempInF = calcUnit === 'C' ? (calcTemp * 9) / 5 + 32 : calcTemp;
  let tempStatus: 'safe' | 'caution' | 'unsafe' = 'safe';
  let tempMessage = '';

  if (calcCategory === 'hot') {
    if (tempInF >= 140 && calcHours <= 4) {
      tempStatus = 'safe';
      tempMessage = 'Safe for donation! Hot food is maintained above 140°F (60°C). Packaging in thermal containers required.';
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
      tempMessage = 'Do NOT donate. Cold food stored above 40°F risks rapid bacterial multiplication.';
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

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FFF9F5] rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 relative my-auto animate-in fade-in zoom-in-95">
        
        {/* Header Bar */}
        <div className="bg-white px-6 py-5 border-b border-stone-200 rounded-t-3xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#E8630A] to-[#C2410C] text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-cause font-extrabold text-xl text-stone-900">
                  Food Safety & Quality Guidelines
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  HACCP Aligned
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                Mandatory protocols for Restaurants, NGOs, and Volunteer Drivers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
            title="Close Guidelines"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-stone-200 px-6 pt-2 pb-0 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'all'
                ? 'border-[#E8630A] text-[#E8630A]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Overview & Checklist</span>
          </button>

          <button
            onClick={() => setActiveTab('foods')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'foods'
                ? 'border-[#E8630A] text-[#E8630A]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Utensils className="w-4 h-4 text-emerald-600" />
            <span>Suitable vs. Unsuitable Foods</span>
          </button>

          <button
            onClick={() => setActiveTab('restaurant')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'restaurant'
                ? 'border-[#E8630A] text-[#E8630A]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Utensils className="w-4 h-4 text-orange-600" />
            <span>Restaurant Protocols</span>
          </button>

          <button
            onClick={() => setActiveTab('ngo')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'ngo'
                ? 'border-[#E8630A] text-[#E8630A]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-rose-500" />
            <span>NGO Receiving Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('volunteer')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'volunteer'
                ? 'border-[#E8630A] text-[#E8630A]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Bike className="w-4 h-4 text-amber-500" />
            <span>Volunteer Drivers</span>
          </button>

          <button
            onClick={() => setActiveTab('legal')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'legal'
                ? 'border-[#E8630A] text-[#E8630A]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Good Samaritan Act</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          
          {/* TAB 1: OVERVIEW & INTERACTIVE TEMP CALCULATOR */}
          {(activeTab === 'all' || activeTab === 'restaurant') && (
            <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-[#E8630A]" />
                  <h3 className="font-cause font-extrabold text-base text-stone-900">
                    Interactive Temperature & Safety Verification Tool
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-stone-400 bg-stone-100 px-2.5 py-1 rounded-lg">
                  Instant Assessment
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Food Category</label>
                  <select
                    value={calcCategory}
                    onChange={(e: any) => setCalcCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-medium bg-white text-stone-800"
                  >
                    <option value="hot">Cooked Hot Dish</option>
                    <option value="cold">Chilled / Prepared Salad</option>
                    <option value="bakery">Bakery / Bread</option>
                    <option value="ambient">Packaged Dry Goods</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Current Temperature</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={calcTemp}
                      onChange={(e) => setCalcTemp(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold text-stone-900"
                    />
                    <button
                      onClick={() => setCalcUnit(calcUnit === 'F' ? 'C' : 'F')}
                      className="px-2.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 font-bold text-stone-700 border border-stone-300"
                    >
                      °{calcUnit}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Hours Since Preparation</label>
                  <input
                    type="number"
                    min="1"
                    max="48"
                    value={calcHours}
                    onChange={(e) => setCalcHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold text-stone-900"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    tempStatus === 'safe' 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                      : tempStatus === 'caution'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    {tempStatus === 'safe' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                    {tempStatus === 'caution' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
                    {tempStatus === 'unsafe' && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                    <div>
                      <p className="uppercase text-[10px] tracking-wider font-extrabold">
                        {tempStatus === 'safe' ? 'Suitable for Listing' : tempStatus === 'caution' ? 'Caution Needed' : 'Unsuitable for Donation'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <p className={`text-xs p-3 rounded-xl font-medium border ${
                tempStatus === 'safe' ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' :
                tempStatus === 'caution' ? 'bg-amber-50/50 border-amber-100 text-amber-800' :
                'bg-rose-50/50 border-rose-100 text-rose-800'
              }`}>
                {tempMessage}
              </p>
            </div>
          )}

          {/* TAB: SUITABLE VS UNSUITABLE FOODS */}
          {(activeTab === 'all' || activeTab === 'foods') && (
            <div className="space-y-4">
              <h3 className="font-cause font-extrabold text-lg text-stone-900 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#E8630A]" />
                <span>Food Suitability Criteria</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Acceptable Foods */}
                <div className="bg-white border border-emerald-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center gap-2 text-emerald-800 border-b border-emerald-100 pb-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <div>
                      <h4 className="font-bold text-base">Acceptable for Donation</h4>
                      <p className="text-[11px] text-emerald-600 font-medium">Safe, unserved, & properly maintained surplus</p>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-stone-700">
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</span>
                      <span><strong>Fresh Prepared Meals:</strong> Unserved cooked entrees stored above 140°F (60°C) or rapidly chilled below 40°F (4°C).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</span>
                      <span><strong>Packaged Commercial Food:</strong> Sealed items with legible expiration/best-by dates and undamaged seals.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</span>
                      <span><strong>Fresh Produce:</strong> Whole, unblemished raw fruits and vegetables free from decay or mould.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</span>
                      <span><strong>Bakery Goods:</strong> Bread, rolls, and pastries baked within 24 hours and wrapped securely.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</span>
                      <span><strong>Canned & Dry Shelf-Stable Items:</strong> Intact cans without denting, rust, or bulging seams.</span>
                    </li>
                  </ul>
                </div>

                {/* Unacceptable Foods */}
                <div className="bg-white border border-rose-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center gap-2 text-rose-800 border-b border-rose-100 pb-3">
                    <XCircle className="w-6 h-6 text-rose-600" />
                    <div>
                      <h4 className="font-bold text-base">Unacceptable for Donation</h4>
                      <p className="text-[11px] text-rose-600 font-medium">Prohibited to protect shelter recipient health</p>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-stone-700">
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">✕</span>
                      <span><strong>Open Buffet / Plate Leftovers:</strong> Food that has been served on open self-service bars or partially consumed plates.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">✕</span>
                      <span><strong>Temperature Violated Foods:</strong> Perishables held in the 40°F–140°F danger zone for longer than 2 hours.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">✕</span>
                      <span><strong>Unpasteurized Products:</strong> Raw unpasteurized milk, raw juices, or unpasteurized soft cheeses.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">✕</span>
                      <span><strong>Expired / Compromised Items:</strong> Swollen or rusted cans, broken seals, or foods past safe expiration.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">✕</span>
                      <span><strong>Uncertified Home Kitchen Food:</strong> Prepared dishes made outside licensed, inspected commercial facilities.</span>
                    </li>
                  </ul>
                </div>

              </div>
            </div>
          )}

          {/* TAB: RESTAURANT HANDLING INSTRUCTIONS */}
          {(activeTab === 'all' || activeTab === 'restaurant') && (
            <div className="bg-white border border-stone-200/90 rounded-2xl p-6 space-y-4 shadow-2xs">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#E8630A] flex items-center justify-center font-bold">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cause font-extrabold text-base text-stone-900">
                    Restaurant Packaging & Staging Checklist
                  </h3>
                  <p className="text-xs text-stone-500">Steps required before listing surplus items</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                
                <div className="bg-[#FFF9F5] border border-orange-200/70 rounded-xl p-4 space-y-2">
                  <p className="font-extrabold text-[#C2410C] uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <span>1. Temperature Staging</span>
                  </p>
                  <p className="text-stone-700 leading-relaxed font-medium">
                    Hot foods must be held at or above <strong>140°F (60°C)</strong> using steam tables or warming cabinets prior to pickup. Chilled foods must remain below <strong>40°F (4°C)</strong> in commercial walk-ins.
                  </p>
                </div>

                <div className="bg-[#FFF9F5] border border-orange-200/70 rounded-xl p-4 space-y-2">
                  <p className="font-extrabold text-[#C2410C] uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <span>2. Food-Grade Containers</span>
                  </p>
                  <p className="text-stone-700 leading-relaxed font-medium">
                    Pack meals in clean, leak-proof, food-grade aluminum pans or tamper-evident containers with tight-fitting lids. Never reuse single-use packaging.
                  </p>
                </div>

                <div className="bg-[#FFF9F5] border border-orange-200/70 rounded-xl p-4 space-y-2">
                  <p className="font-extrabold text-[#C2410C] uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <span>3. Labeling & Allergen Declarations</span>
                  </p>
                  <p className="text-stone-700 leading-relaxed font-medium">
                    Every container must be stamped with: <strong>Prep Date & Time</strong>, Dish Title, and explicit declarations for major allergens (Peanuts, Tree Nuts, Dairy, Wheat, Soy, Eggs, Fish, Sesame).
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* TAB: NGO RECEIVING CONSIDERATIONS */}
          {(activeTab === 'all' || activeTab === 'ngo') && (
            <div className="bg-white border border-stone-200/90 rounded-2xl p-6 space-y-4 shadow-2xs">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cause font-extrabold text-base text-stone-900">
                    NGO & Shelter Food Safety Inspection Protocols
                  </h3>
                  <p className="text-xs text-stone-500">Guidelines for accepting and serving donated meals</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-stone-700">
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <p className="font-bold text-stone-900 flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-rose-600" />
                    <span>Arrival Probe Inspection</span>
                  </p>
                  <p className="leading-relaxed">
                    Verify internal core temperature upon delivery using a calibrated probe thermometer. Reject hot food arriving below 135°F (57°C) or cold food above 41°F (5°C) if transit duration was over 45 minutes.
                  </p>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <p className="font-bold text-stone-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Safe Reheating Requirements</span>
                  </p>
                  <p className="leading-relaxed">
                    All pre-cooked donated meals must be reheated to an internal temperature of <strong>165°F (74°C) for at least 15 seconds</strong> within 2 hours before serving to shelter residents.
                  </p>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <p className="font-bold text-stone-900 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span>Allergen Isolation & Storage</span>
                  </p>
                  <p className="leading-relaxed">
                    Store allergen-containing items on lower shelves beneath allergen-free options. Keep physical dish labels intact until all portions are consumed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: VOLUNTEER DRIVER SAFETY */}
          {(activeTab === 'all' || activeTab === 'volunteer') && (
            <div className="bg-white border border-stone-200/90 rounded-2xl p-6 space-y-4 shadow-2xs">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cause font-extrabold text-base text-stone-900">
                    Volunteer Driver Transit & Hygiene Rules
                  </h3>
                  <p className="text-xs text-stone-500">Preventing cross-contamination during transit</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-4 space-y-2">
                  <p className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-700" />
                    <span>Insulated Thermal Equipment</span>
                  </p>
                  <p className="text-stone-700 leading-relaxed font-medium">
                    Drivers must transport hot food in insulated commercial thermal bags and cold food with ice packs/coolers. Never place uninsulated food containers directly on vehicle floors.
                  </p>
                </div>

                <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-4 space-y-2">
                  <p className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-700" />
                    <span>Transit Window Constraint</span>
                  </p>
                  <p className="text-stone-700 leading-relaxed font-medium">
                    Complete direct transportation from restaurant pickup to NGO dropoff within a <strong>maximum 45-minute window</strong>. No personal stops or animal presence inside transport vehicle.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* TAB: GOOD SAMARITAN LEGAL PROTECTION */}
          {(activeTab === 'all' || activeTab === 'legal') && (
            <div className="bg-white border border-stone-200/90 rounded-2xl p-6 space-y-4 shadow-2xs">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cause font-extrabold text-base text-stone-900">
                    Bill Emerson Good Samaritan Food Donation Act Protection
                  </h3>
                  <p className="text-xs text-stone-500">Legal immunity & liability protection for food donors</p>
                </div>
              </div>

              <div className="text-xs text-stone-700 space-y-3 leading-relaxed">
                <p className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl text-blue-950 font-medium">
                  <strong>Legal Protection Overview:</strong> Under federal and local Good Samaritan laws, food donors (restaurants, caterers, grocery stores) and non-profit redistributors are protected from civil and criminal liability when donating surplus food in good faith.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <p className="font-bold text-stone-900">Good Faith Requirement</p>
                    <p className="text-stone-600">
                      Protection applies as long as the donor believes the food is wholesome at the time of donation and adheres to standard temperature and sanitation protocols.
                    </p>
                  </div>

                  <div className="space-y-1 bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <p className="font-bold text-stone-900">Liability Waiver Scope</p>
                    <p className="text-stone-600">
                      Donors are shielded except in rare cases of gross negligence or intentional misconduct. FoodBridge maintains full audit logs to prove compliance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-white px-6 py-4 border-t border-stone-200 rounded-b-3xl flex items-center justify-between shrink-0 text-xs">
          <p className="text-stone-500 font-medium hidden sm:block">
            Questions regarding food safety? Contact <span className="text-[#E8630A] font-bold">safety@foodbridge.org</span>
          </p>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#E8630A] hover:bg-[#C2410C] text-white font-bold shadow-md transition-all ml-auto"
          >
            I Understand & Agree to Guidelines
          </button>
        </div>

      </div>
    </div>
  );
};
