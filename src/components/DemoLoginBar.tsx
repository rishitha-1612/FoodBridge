import React from 'react';
import { UserRole } from '../types';
import { Utensils, HeartHandshake, Bike, ShieldCheck, Zap } from 'lucide-react';

interface DemoLoginBarProps {
  onQuickLogin: (role: UserRole) => void;
  currentRole?: UserRole;
  loading?: boolean;
}

export const DemoLoginBar: React.FC<DemoLoginBarProps> = ({ onQuickLogin, currentRole, loading }) => {
  return (
    <div className="bg-[#1F1B18] text-white px-4 py-2.5 text-xs border-b border-stone-800 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E8630A]"></span>
          </span>
          <span className="font-bold text-orange-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            Quick Demo Persona Switcher:
          </span>
          <span className="hidden sm:inline text-stone-400">Instant test accounts for all roles</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onQuickLogin('restaurant')}
            disabled={loading}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              currentRole === 'restaurant'
                ? 'bg-[#E8630A] text-white ring-2 ring-orange-300'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white'
            }`}
          >
            <Utensils className="w-3 h-3 text-orange-400" />
            Restaurant
          </button>

          <button
            onClick={() => onQuickLogin('ngo')}
            disabled={loading}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              currentRole === 'ngo'
                ? 'bg-[#E8630A] text-white ring-2 ring-orange-300'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white'
            }`}
          >
            <HeartHandshake className="w-3 h-3 text-rose-400" />
            NGO
          </button>

          <button
            onClick={() => onQuickLogin('volunteer')}
            disabled={loading}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              currentRole === 'volunteer'
                ? 'bg-[#E8630A] text-white ring-2 ring-orange-300'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white'
            }`}
          >
            <Bike className="w-3 h-3 text-amber-400" />
            Volunteer
          </button>

          <button
            onClick={() => onQuickLogin('admin')}
            disabled={loading}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              currentRole === 'admin'
                ? 'bg-[#E8630A] text-white ring-2 ring-orange-300'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Admin
          </button>
        </div>
      </div>
    </div>
  );
};
