import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { apiAuth, setStoredToken } from '../lib/api';
import { HeartHandshake, Utensils, Bike, Shield, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiAuth.login(email, password);
      setStoredToken(res.token);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="bg-white border border-stone-200 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        
        {/* Brand Side Panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#1F1B18] via-stone-900 to-stone-950 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8630A] flex items-center justify-center text-white font-bold shadow-md">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="font-cause font-extrabold text-2xl text-white">FoodBridge</span>
            </div>

            <div className="space-y-2 pt-4">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">Sign In to Continue</span>
              <h2 className="font-cause font-extrabold text-3xl leading-snug">
                Welcome back to FoodBridge.
              </h2>
              <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
                Connect your surplus food, manage claims, and orchestrate deliveries in real time.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-6 relative z-10 border-t border-stone-800/80">
            <p className="text-xs text-stone-400 leading-relaxed">
              New to FoodBridge? Create an account to register your restaurant, non-profit shelter, or volunteer profile.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs transition-colors text-center"
            >
              Create New Account →
            </button>
          </div>

          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-orange-600/10 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Form Side */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            <div className="space-y-1">
              <h3 className="font-cause font-extrabold text-2xl text-stone-900">Sign In</h3>
              <p className="text-xs text-stone-500">Enter your credentials or use a quick demo account above.</p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.org"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#E8630A] focus:ring-2 focus:ring-orange-100 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-stone-700">Password</label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Demo password reset instructions sent!"); }} className="text-[11px] text-[#E8630A] font-bold hover:underline">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#E8630A] focus:ring-2 focus:ring-orange-100 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="remember"
                  defaultChecked
                  className="rounded text-[#E8630A] focus:ring-[#E8630A] border-stone-300"
                />
                <label htmlFor="remember" className="text-xs text-stone-600 font-medium select-none">
                  Remember me on this browser
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#E8630A] hover:bg-[#C2410C] text-white font-bold text-sm shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-stone-100 text-center text-xs text-stone-600">
              Don't have an account yet?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="font-bold text-[#E8630A] hover:underline"
              >
                Create Account
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
