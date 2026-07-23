import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { HeartHandshake, LogOut, User as UserIcon, LayoutDashboard, Utensils, Bike, Shield, ChevronDown, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onNavigate: (page: string) => void;
  activePage: string;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onNavigate, activePage, onLogout }) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const getRoleDashboardPage = (role: UserRole) => {
    switch (role) {
      case 'restaurant': return 'restaurant_dashboard';
      case 'ngo': return 'ngo_dashboard';
      case 'volunteer': return 'volunteer_dashboard';
      case 'admin': return 'admin_dashboard';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'restaurant': return <Utensils className="w-4 h-4 text-[#E8630A]" />;
      case 'ngo': return <HeartHandshake className="w-4 h-4 text-rose-500" />;
      case 'volunteer': return <Bike className="w-4 h-4 text-amber-500" />;
      case 'admin': return <Shield className="w-4 h-4 text-stone-800" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <button 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 text-left focus:outline-none group"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#E8630A] to-[#C2410C] flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-cause font-extrabold text-2xl tracking-tight text-[#1F1B18] group-hover:text-[#E8630A] transition-colors">
                Food<span className="text-[#E8630A]">Bridge</span>
              </span>
            </div>
            <p className="text-[11px] text-[#8A7F78] font-medium hidden sm:block">Surplus Food Redistribution</p>
          </div>
        </button>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activePage === 'home' 
                ? 'bg-orange-50 text-[#C2410C]' 
                : 'text-stone-700 hover:text-[#E8630A] hover:bg-stone-50'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => onNavigate('about')}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activePage === 'about' 
                ? 'bg-orange-50 text-[#C2410C]' 
                : 'text-stone-700 hover:text-[#E8630A] hover:bg-stone-50'
            }`}
          >
            How It Works
          </button>

          <button
            onClick={() => onNavigate('safety')}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activePage === 'safety' 
                ? 'bg-orange-50 text-[#C2410C]' 
                : 'text-stone-700 hover:text-[#E8630A] hover:bg-stone-50'
            }`}
          >
            Food Safety
          </button>

          {currentUser && (
            <button
              onClick={() => onNavigate(getRoleDashboardPage(currentUser.role))}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                activePage.includes('dashboard') || activePage.includes('restaurant') || activePage.includes('ngo') || activePage.includes('volunteer') || activePage.includes('admin')
                  ? 'bg-[#E8630A] text-white shadow-xs' 
                  : 'bg-stone-100 text-stone-800 hover:bg-orange-100 hover:text-[#C2410C]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>
                {currentUser.role === 'restaurant' && 'Restaurant Dashboard'}
                {currentUser.role === 'ngo' && 'NGO Portal'}
                {currentUser.role === 'volunteer' && 'Volunteer Hub'}
                {currentUser.role === 'admin' && 'Admin Control'}
              </span>
            </button>
          )}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              {/* Profile Link */}
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#C2410C] flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-xs">
                  <p className="font-bold text-stone-900 line-clamp-1">{currentUser.name}</p>
                  <p className="text-[10px] text-stone-500 capitalize flex items-center gap-1">
                    {getRoleIcon(currentUser.role)}
                    {currentUser.role}
                  </p>
                </div>
              </button>

              <button
                onClick={onLogout}
                title="Sign out"
                className="p-2 rounded-xl text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-2 rounded-xl text-sm font-bold text-stone-800 hover:text-[#E8630A] hover:bg-stone-100 transition-colors"
              >
                Sign In
              </button>

              {/* Register button with Role Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold bg-[#E8630A] hover:bg-[#C2410C] text-white shadow-md shadow-orange-600/20 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Get Started</span>
                  <ChevronDown className="w-4 h-4 opacity-80" />
                </button>

                {roleDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setRoleDropdownOpen(false)}
                  >
                    <div className="px-3 py-1.5 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      Select Your Role to Register
                    </div>
                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        onNavigate('register?role=restaurant');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-orange-50 hover:text-[#C2410C] flex items-center gap-2.5"
                    >
                      <Utensils className="w-4 h-4 text-[#E8630A]" />
                      <span>Register as Restaurant</span>
                    </button>
                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        onNavigate('register?role=ngo');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-orange-50 hover:text-[#C2410C] flex items-center gap-2.5"
                    >
                      <HeartHandshake className="w-4 h-4 text-rose-500" />
                      <span>Register as NGO</span>
                    </button>
                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        onNavigate('register?role=volunteer');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-orange-50 hover:text-[#C2410C] flex items-center gap-2.5"
                    >
                      <Bike className="w-4 h-4 text-amber-500" />
                      <span>Register as Volunteer</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
