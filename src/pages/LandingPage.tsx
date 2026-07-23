import React, { useEffect, useState } from 'react';
import { User, ImpactStats } from '../types';
import { apiImpact } from '../lib/api';
import { StatusStepper } from '../components/StatusStepper';
import { 
  Utensils, HeartHandshake, Bike, ShieldCheck, ArrowRight, Check, Sparkles, 
  Clock, Shield, BarChart3, Bell, Compass, MapPin, Award
} from 'lucide-react';

interface LandingPageProps {
  currentUser: User | null;
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ currentUser, onNavigate }) => {
  const [stats, setStats] = useState<ImpactStats | null>(null);

  useEffect(() => {
    apiImpact.getStats()
      .then(setStats)
      .catch(err => console.error("Failed to load impact stats:", err));
  }, []);

  return (
    <div className="space-y-20 pb-16">
      
      {/* 1. HERO SECTION (Asymmetric, Orange-forward design) */}
      <section className="pt-8 md:pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-orange-100/80 border border-orange-200 text-[#C2410C] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#E8630A]" />
              <span>Food Rescue & Redistribution Platform</span>
            </div>

            <h1 className="font-cause font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#1F1B18] leading-[1.1] tracking-tight">
              Bridging <span className="text-[#E8630A] underline decoration-orange-300 decoration-wavy decoration-2">Surplus Food</span> to Community Tables.
            </h1>

            <p className="text-lg text-stone-600 font-medium leading-relaxed max-w-2xl">
              FoodBridge connects restaurants with surplus meals to local shelters and NGOs, powered by volunteer drivers. Turn food waste into immediate nutrition.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate(currentUser ? 'restaurant_dashboard' : 'register')}
                className="px-6 py-3.5 rounded-2xl bg-[#E8630A] hover:bg-[#C2410C] text-white font-bold text-base shadow-lg shadow-orange-600/25 transition-all flex items-center gap-2.5 hover:translate-y-0.5"
              >
                <span>{currentUser ? 'Go to Dashboard' : 'Join FoodBridge Today'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => onNavigate('about')}
                className="px-6 py-3.5 rounded-2xl bg-white border border-stone-300 hover:border-orange-300 text-stone-800 hover:text-[#C2410C] font-bold text-base transition-colors flex items-center gap-2 shadow-xs"
              >
                <Compass className="w-5 h-5 text-stone-500" />
                <span>See How It Works</span>
              </button>
            </div>

            {/* Micro proof points */}
            <div className="pt-6 border-t border-stone-200/80 flex flex-wrap gap-6 text-xs text-stone-600 font-semibold">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">✓</div>
                <span>100% Verified NGOs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">✓</div>
                <span>Real-time Status Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">✓</div>
                <span>Zero Cost for Non-Profits</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Network Overview */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xl relative z-10 space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#E8630A] flex items-center justify-center font-bold">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">Surplus Food Rescue</h3>
                    <p className="text-xs text-stone-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400" /> Active Network
                    </p>
                  </div>
                </div>
                <span className="bg-[#FFF9F5] text-[#C2410C] text-xs font-bold px-2.5 py-1 rounded-full border border-orange-200">
                  Live Operations
                </span>
              </div>

              <div className="space-y-3 text-center py-2">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#E8630A] mx-auto flex items-center justify-center font-bold">
                  <Utensils className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-sm">Real-time Food Bridge</p>
                  <p className="text-xs text-stone-500 mt-1">
                    Registered restaurants post surplus food, verified NGOs claim, and volunteers deliver.
                  </p>
                </div>
                <StatusStepper currentStatus="Available" compact={true} />
              </div>

              <div className="bg-[#FFF9F5] border border-orange-200/80 rounded-2xl p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-stone-700 font-medium">
                  <Bike className="w-4 h-4 text-[#E8630A]" />
                  <span>Network Volunteers: <strong>{stats ? stats.volunteers : 0} Active</strong></span>
                </div>
                <span className="text-stone-500 font-mono">Ready</span>
              </div>
            </div>

            {/* Background Accent Card */}
            <div className="absolute -bottom-4 -right-4 w-full h-full bg-[#E8630A]/10 rounded-3xl -z-10 transform rotate-1 border border-orange-200"></div>
          </div>

        </div>
      </section>


      {/* 2. DONATION STATUS FLOW MACHINE VISUAL */}
      <section className="bg-white border-y border-stone-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#E8630A] uppercase tracking-widest">End-to-End State Machine</span>
            <h2 className="font-cause font-extrabold text-3xl sm:text-4xl text-[#1F1B18]">
              Transparent Donation Status Lifecycle
            </h2>
            <p className="text-stone-600 font-medium text-sm sm:text-base">
              Every donation travels through strict, traceable state transitions for maximum accountability.
            </p>
          </div>

          <div className="p-2">
            <StatusStepper currentStatus="Picked Up" />
          </div>
        </div>
      </section>


      {/* 5. PLATFORM FEATURES STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1F1B18] text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-stone-800 pb-8">
            <div>
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">Engineered for Reliability</span>
              <h2 className="font-cause font-extrabold text-3xl sm:text-4xl text-white mt-1">
                Core Platform Capabilities
              </h2>
            </div>
            <button
              onClick={() => onNavigate('login')}
              className="px-5 py-2.5 rounded-xl bg-[#E8630A] hover:bg-[#C2410C] text-white font-bold text-sm transition-colors"
            >
              Launch Live Dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-stone-800 text-orange-400 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Secure JWT Authentication</h4>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  Role-based access tokens ensure restaurants, NGOs, and volunteers access only authorized views.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-stone-800 text-orange-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Real-time Updates</h4>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  Live polling updates ensure NGOs see available food listings the instant restaurants post them.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-stone-800 text-orange-400 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Analytics & Reports</h4>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  Visual Recharts integration for measuring meal volume, driver activity, and carbon offsets.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-stone-800 text-orange-400 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">In-App Notifications</h4>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  Instant visual activity logs notify drivers when a new pickup assignment is confirmed.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-stone-800 text-orange-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Admin Verification</h4>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  All non-profit shelter registrations undergo strict administrative approval before claiming food.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-stone-800 text-orange-400 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Impact Measurement</h4>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  Aggregated metrics track total meals redistributed and tons of greenhouse gas emissions prevented.
                </p>
              </div>
            </div>

          </div>

          {/* Food Safety Direct Banner */}
          <div className="bg-gradient-to-r from-stone-900 to-[#1F1B18] border border-orange-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm sm:text-base">Comprehensive Food Safety Standards</h4>
                <p className="text-xs text-stone-400">Temperature controls, allergen declarations, and strict transport rules for all partners.</p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('safety')}
              className="px-4 py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 font-bold text-xs shrink-0 transition-colors cursor-pointer"
            >
              Explore Safety Protocols →
            </button>
          </div>
        </div>
      </section>


      {/* 6. IMPACT & LIVE AGGREGATED STATS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#FFF9F5] to-orange-50 border border-orange-200/80 rounded-3xl p-8 sm:p-12 text-center space-y-8">
          <div className="max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#C2410C] uppercase tracking-widest">Measured Environmental Impact</span>
            <h2 className="font-cause font-extrabold text-3xl sm:text-4xl text-[#1F1B18]">
              Live Community Achievements
            </h2>
            <p className="text-stone-600 font-medium text-sm">
              Real-time aggregates calculated directly from platform database activity.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pt-4">
            
            <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-2xs">
              <p className="font-cause font-extrabold text-3xl sm:text-4xl text-[#E8630A]">
                {stats ? stats.mealsDonated.toLocaleString() : '0'}
              </p>
              <p className="text-xs font-bold text-stone-600 mt-1">Meals Donated</p>
            </div>

            <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-2xs">
              <p className="font-cause font-extrabold text-3xl sm:text-4xl text-rose-600">
                {stats ? stats.activeNgos : '0'}
              </p>
              <p className="text-xs font-bold text-stone-600 mt-1">Active NGOs</p>
            </div>

            <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-2xs">
              <p className="font-cause font-extrabold text-3xl sm:text-4xl text-amber-600">
                {stats ? stats.volunteers : '0'}
              </p>
              <p className="text-xs font-bold text-stone-600 mt-1">Volunteers</p>
            </div>

            <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-2xs">
              <p className="font-cause font-extrabold text-3xl sm:text-4xl text-blue-600">
                {stats ? stats.successfulDeliveries : '0'}
              </p>
              <p className="text-xs font-bold text-stone-600 mt-1">Deliveries Done</p>
            </div>

            <div className="col-span-2 md:col-span-1 bg-white border border-orange-100 rounded-2xl p-5 shadow-2xs">
              <p className="font-cause font-extrabold text-3xl sm:text-4xl text-emerald-700">
                {stats ? `${stats.foodWastePreventedTons} t` : '0 t'}
              </p>
              <p className="text-xs font-bold text-stone-600 mt-1">Food Waste Prevented</p>
            </div>

          </div>
        </div>
      </section>


      {/* 7. OUTCOME STATEMENT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#E8630A] text-white rounded-3xl p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl relative overflow-hidden">
          <div className="space-y-4 max-w-xl text-left relative z-10">
            <h2 className="font-cause font-extrabold text-3xl sm:text-5xl leading-tight">
              Less Waste. More Food. Better Tomorrow.
            </h2>
            <p className="text-orange-100 font-medium text-base">
              Whether you are a restaurant owner, non-profit coordinator, or local volunteer, your involvement directly feeds families in need today.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <button
              onClick={() => onNavigate('register')}
              className="px-8 py-4 rounded-2xl bg-white text-[#C2410C] hover:bg-stone-50 font-extrabold text-lg shadow-lg hover:scale-105 transition-all"
            >
              Get Started Now
            </button>
          </div>

          {/* Background decorative circles */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-orange-400/20 blur-2xl pointer-events-none"></div>
        </div>
      </section>

    </div>
  );
};
