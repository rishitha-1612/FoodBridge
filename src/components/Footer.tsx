import React from 'react';
import { HeartHandshake, Globe, Shield, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#1F1B18] text-stone-300 border-t border-stone-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8630A] flex items-center justify-center text-white font-bold">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="font-cause font-extrabold text-2xl text-white tracking-tight">
                Food<span className="text-orange-500">Bridge</span>
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              Connecting surplus food from restaurants to local NGOs and shelters via dedicated volunteer drivers. Less Waste. More Meals.
            </p>
            <div className="inline-flex items-center gap-2 bg-stone-800/80 border border-stone-700/60 rounded-xl px-3 py-1.5 text-xs text-orange-400 font-bold">
              <Globe className="w-3.5 h-3.5 text-orange-400" />
              Community Food Rescue Network
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider text-orange-400">
              Platform Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-orange-400 transition-colors">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-orange-400 transition-colors">
                  How FoodBridge Works
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('safety')} className="hover:text-orange-400 transition-colors font-bold text-orange-400">
                  Food Safety Guidelines
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('login')} className="hover:text-orange-400 transition-colors">
                  Sign In to Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('register')} className="hover:text-orange-400 transition-colors">
                  Join as Partner / Volunteer
                </button>
              </li>
            </ul>
          </div>

          {/* Roles */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider text-orange-400">
              Community Roles
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                <span><strong>Restaurants:</strong> Donate excess meals safely</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span><strong>NGOs:</strong> Claim & distribute food to shelters</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span><strong>Volunteers:</strong> Transport food locally</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span><strong>Admins:</strong> Safety & verification control</span>
              </li>
            </ul>
          </div>

          {/* Safety & Trust */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider text-orange-400">
              Food Safety & Trust
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              All participating NGOs are verified by FoodBridge administrators. Food preparation and temperature compliance guidelines strictly enforced.
            </p>
            <button 
              onClick={() => onNavigate('safety')}
              className="w-full text-left flex items-center justify-between gap-2 text-xs text-stone-300 font-semibold bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-orange-500/50 p-2.5 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Verified Accounts & Temperature Protocols</span>
              </div>
              <span className="text-orange-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© 2026 FoodBridge Redistribution Network. Built with clean modular architecture.</p>
          <p className="flex items-center gap-1 text-stone-400 font-medium">
            Crafted for <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> Sustainable Community Impact
          </p>
        </div>
      </div>
    </footer>
  );
};
