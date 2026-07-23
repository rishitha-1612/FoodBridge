import React, { useState } from 'react';
import { 
  HeartHandshake, Utensils, Bike, ShieldCheck, HelpCircle, 
  ChevronDown, ChevronUp, Globe, AlertTriangle, ArrowRight, Check, Award 
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: "What counts as surplus food on FoodBridge?",
      a: "Surplus food includes unserved, properly handled cooked meals, bakery goods, packaged food near sell-by dates, and fresh agricultural produce. All donated items must meet food hygiene guidelines, be stored at safe temperatures, and remain unexpired during the pickup window."
    },
    {
      q: "How is food safety and temperature control ensured?",
      a: "Restaurants must provide accurate allergen notes, preparation timestamps, and storage instructions upon listing. Volunteers use insulated thermal transport containers, and receiving NGOs verify food condition before final receipt log entry."
    },
    {
      q: "Who can register as an NGO or receiving shelter?",
      a: "Registered non-profits, community kitchens, youth shelters, and recognized food banks are eligible. To ensure safety and accountability, every NGO account requires administrative approval from FoodBridge before claiming donations."
    },
    {
      q: "Is there any cost for restaurants or shelters to use FoodBridge?",
      a: "No! FoodBridge is a 100% free non-profit technological bridge dedicated to eliminating food waste and feeding local communities. There are no listing or delivery fees for any partner."
    },
    {
      q: "How can volunteers participate in food pickup runs?",
      a: "Volunteers create an account and specify their local availability zone. When NGOs accept a food donation nearby, volunteer drivers receive pickup notifications and can accept runs based on their schedule."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-orange-100 text-[#C2410C] px-3.5 py-1 rounded-full text-xs font-bold">
          <Globe className="w-3.5 h-3.5" />
          Mission & Architecture
        </div>
        <h1 className="font-cause font-extrabold text-4xl sm:text-5xl text-[#1F1B18]">
          Eliminating Hunger by Ending Food Waste
        </h1>
        <p className="text-stone-600 font-medium text-base sm:text-lg leading-relaxed">
          FoodBridge was engineered to solve a systemic mismatch: tons of fresh food discarded daily while local community members face meal insecurity.
        </p>
      </div>

      {/* The Dual Problem & Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="bg-white border border-rose-200 rounded-3xl p-8 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-[#1F1B18] text-xl">The Critical Problem</h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            Globally, over 1/3 of all produced food is lost or wasted, contributing heavily to methane emissions. Simultaneously, community dining rooms and shelters struggle to maintain consistent nutritious meal offerings due to budget limits.
          </p>
        </div>

        <div className="bg-white border border-emerald-200 rounded-3xl p-8 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-[#1F1B18] text-xl">The FoodBridge Solution</h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            Our real-time web platform bridges commercial kitchens with local non-profits. Through automated status tracking and localized volunteer dispatch, surplus food is rescued and served in under 2 hours.
          </p>
        </div>

      </div>

      {/* HOW FOODBRIDGE WORKS - 4 STEP CHAIN */}
      <div className="space-y-8 border-t border-stone-200 pt-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#E8630A] uppercase tracking-widest">End-to-End Workflow</span>
          <h2 className="font-cause font-extrabold text-3xl sm:text-4xl text-[#1F1B18]">
            How FoodBridge Works
          </h2>
          <p className="text-stone-600 font-medium text-sm sm:text-base">
            A simple, reliable 4-step chain connecting surplus food directly to community hunger shelters.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Step 1 */}
          <div className="bg-[#FFF9F5] border border-stone-200/90 rounded-2xl p-6 relative group hover:border-orange-300 transition-all shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#E8630A] font-extrabold flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
              <Utensils className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-[#E8630A] uppercase tracking-wider block mb-1">Step 01</span>
            <h3 className="font-bold text-stone-900 text-lg mb-2">Restaurants Donate</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Kitchens list excess prepared food, bakery goods, or fresh produce with quantity and pickup window.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#FFF9F5] border border-stone-200/90 rounded-2xl p-6 relative group hover:border-orange-300 transition-all shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 font-extrabold flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-[#C2410C] uppercase tracking-wider block mb-1">Step 02</span>
            <h3 className="font-bold text-stone-900 text-lg mb-2">NGOs Accept</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Verified shelters browse nearby available food donations and accept what fits their meal schedule.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#FFF9F5] border border-stone-200/90 rounded-2xl p-6 relative group hover:border-orange-300 transition-all shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 font-extrabold flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
              <Bike className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-[#E8630A] uppercase tracking-wider block mb-1">Step 03</span>
            <h3 className="font-bold text-stone-900 text-lg mb-2">Volunteers Pick Up</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Local volunteer drivers accept pickup assignments, retrieve food, and transport it safely.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-[#FFF9F5] border border-stone-200/90 rounded-2xl p-6 relative group hover:border-orange-300 transition-all shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">Step 04</span>
            <h3 className="font-bold text-stone-900 text-lg mb-2">Food Serves People</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Hot meals arrive at community dining rooms, nourishing families while preventing food waste.
            </p>
          </div>

        </div>
      </div>

      {/* TAILORED ROLES FOR MAXIMUM SYNERGY */}
      <div className="space-y-8 border-t border-stone-200 pt-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#C2410C] uppercase tracking-widest">Role Breakdown</span>
          <h2 className="font-cause font-extrabold text-3xl sm:text-4xl text-[#1F1B18]">
            Tailored Roles for Maximum Synergy
          </h2>
          <p className="text-stone-600 font-medium text-sm sm:text-base">
            Every role in FoodBridge has dedicated tools designed for rapid execution and accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Restaurant Card */}
          <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-xs space-y-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#E8630A] flex items-center justify-center font-bold">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#1F1B18] text-xl">What Restaurants Do</h3>
              <ul className="space-y-3 text-sm text-stone-600">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#E8630A] shrink-0 mt-0.5" />
                  <span>Register & manage kitchen location profile</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#E8630A] shrink-0 mt-0.5" />
                  <span>List surplus food, quantities, and allergen notes</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#E8630A] shrink-0 mt-0.5" />
                  <span>Track real-time status as NGOs claim and drivers pick up</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#E8630A] shrink-0 mt-0.5" />
                  <span>View monthly environmental impact and meals saved</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('register?role=restaurant')}
              className="w-full py-3 rounded-xl bg-stone-100 hover:bg-orange-100 text-stone-900 hover:text-[#C2410C] font-bold text-sm transition-colors text-center"
            >
              Register Restaurant
            </button>
          </div>

          {/* NGO Card */}
          <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-xs space-y-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#1F1B18] text-xl">What NGOs Do</h3>
              <ul className="space-y-3 text-sm text-stone-600">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>Browse live map of available food donations nearby</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>Accept donations matching shelter dining requirements</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>Assign volunteer drivers or schedule directly</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>Confirm receipt and log distribution records</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('register?role=ngo')}
              className="w-full py-3 rounded-xl bg-stone-100 hover:bg-rose-100 text-stone-900 hover:text-rose-700 font-bold text-sm transition-colors text-center"
            >
              Register NGO
            </button>
          </div>

          {/* Volunteer Card */}
          <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-xs space-y-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Bike className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#1F1B18] text-xl">What Volunteers Do</h3>
              <ul className="space-y-3 text-sm text-stone-600">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>View pickup requests in local availability zones</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Accept runs and get turn-by-turn restaurant addresses</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Update status (Picked Up → Delivered) in 1 click</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Earn community impact hours and badges</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('register?role=volunteer')}
              className="w-full py-3 rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-900 hover:text-amber-800 font-bold text-sm transition-colors text-center"
            >
              Register Volunteer
            </button>
          </div>

        </div>
      </div>

      {/* Detailed Walkthrough of the 4-Actor Flow */}
      <div className="space-y-8 border-t border-stone-200 pt-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="font-cause font-extrabold text-3xl text-[#1F1B18]">
            Detailed Platform Architecture
          </h2>
          <p className="text-stone-600 font-medium text-sm">
            How our core platform actors collaborate smoothly.
          </p>
        </div>

        <div className="space-y-6">
          
          {/* Actor 1 */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start gap-6 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-[#E8630A] flex items-center justify-center shrink-0">
              <Utensils className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#E8630A] uppercase tracking-wider">1. Restaurant & Kitchen Partners</span>
              <h3 className="font-bold text-stone-900 text-lg">Listing & Package Readiness</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Restaurants log into their dedicated dashboard to create donation entries. They specify category (cooked meal, produce, bakery), allergen warnings, storage instructions, pickup window, and location address. Upon posting, the donation status defaults to <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-xs">Available</span>.
              </p>
            </div>
          </div>

          {/* Actor 2 */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start gap-6 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">2. Approved NGO Shelters</span>
              <h3 className="font-bold text-stone-900 text-lg">Discovery & Request Acceptance</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                NGO directors monitor real-time available listings nearby. When a donation matches their feeding schedule, they click "Accept". The state transitions to <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-xs">Accepted</span>, reserving the food exclusively for that shelter.
              </p>
            </div>
          </div>

          {/* Actor 3 */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start gap-6 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Bike className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">3. Volunteer Drivers</span>
              <h3 className="font-bold text-stone-900 text-lg">Dispatch, Pickup & Safe Delivery</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                The accepting NGO assigns a local volunteer driver (<span className="bg-orange-100 text-orange-900 font-bold px-2 py-0.5 rounded text-xs">Pickup Assigned</span>). The volunteer travels to the restaurant, retrieves the insulated containers (<span className="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded text-xs">Picked Up</span>), and transports them directly to the shelter (<span className="bg-indigo-100 text-indigo-900 font-bold px-2 py-0.5 rounded text-xs">Delivered</span>).
              </p>
            </div>
          </div>

          {/* Actor 4 */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start gap-6 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-stone-900 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">4. System Administrators</span>
              <h3 className="font-bold text-stone-900 text-lg">Verification & Platform Analytics</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Admins approve pending non-profit accounts, monitor active delivery timelines, manage user permissions, and analyze platform-wide impact statistics. Once confirmed, donations transition to <span className="bg-stone-900 text-white font-bold px-2 py-0.5 rounded text-xs">Completed</span>.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="space-y-6 border-t border-stone-200 pt-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E8630A]">
            <HelpCircle className="w-4 h-4" />
            <span>Got Questions?</span>
          </div>
          <h2 className="font-cause font-extrabold text-3xl text-[#1F1B18]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-stone-200 rounded-2xl overflow-hidden transition-all shadow-2xs"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-4 text-left font-bold text-stone-900 text-base flex items-center justify-between gap-4 hover:bg-orange-50/50 transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-5 h-5 text-[#E8630A] shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-stone-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-5 pt-1 text-sm text-stone-600 leading-relaxed border-t border-stone-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-[#1F1B18] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6">
        <h3 className="font-cause font-extrabold text-3xl text-white">
          Ready to Make a Direct Local Impact?
        </h3>
        <p className="text-stone-400 max-w-xl mx-auto text-sm leading-relaxed">
          Join hundreds of participating restaurants, NGO coordinators, and volunteer drivers using FoodBridge today.
        </p>
        <button
          onClick={() => onNavigate('register')}
          className="px-8 py-3.5 rounded-2xl bg-[#E8630A] hover:bg-[#C2410C] text-white font-bold text-base shadow-lg shadow-orange-600/25 transition-all inline-flex items-center gap-2"
        >
          <span>Register Now</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
};
