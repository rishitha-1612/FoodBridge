import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { apiAuth, setStoredToken } from '../lib/api';
import { Utensils, HeartHandshake, Bike, Check, ArrowRight, Clock, ShieldCheck } from 'lucide-react';

interface RegisterPageProps {
  initialRole?: UserRole;
  onRegisterSuccess: (user: User) => void;
  onNavigate: (page: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ initialRole = 'restaurant', onRegisterSuccess, onNavigate }) => {
  const [role, setRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [availabilityZone, setAvailabilityZone] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);

  useEffect(() => {
    // Sync initial role if prop changes or URL param changes
    const urlParams = new URLSearchParams(window.location.search);
    const urlRole = urlParams.get('role') as UserRole;
    if (urlRole && ['restaurant', 'ngo', 'volunteer'].includes(urlRole)) {
      setRole(urlRole);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        name: name || organizationName,
        email,
        password,
        role,
        organizationName: organizationName || name,
        phone,
        address,
        availabilityZone
      };

      const res = await apiAuth.register(payload);

      if (res.user.status === 'pending') {
        setPendingApproval(true);
      } else {
        setStoredToken(res.token);
        onRegisterSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  if (pendingApproval) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-stone-200 rounded-3xl shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-cause font-extrabold text-2xl text-stone-900">Registration Submitted</h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            Thank you for registering <strong>{organizationName || name}</strong> with FoodBridge! To maintain food safety standards, non-profit NGO accounts undergo administrative review.
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-xs text-[#C2410C] font-medium text-left space-y-1">
          <p className="font-bold">Next Steps:</p>
          <p>• Our FoodBridge verification team will review your organization details within 24 hours.</p>
          <p>• You will receive an email confirmation once approved.</p>
        </div>

        <button
          onClick={() => onNavigate('login')}
          className="w-full py-3 rounded-xl bg-[#E8630A] text-white font-bold text-sm shadow-md"
        >
          Return to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      
      {/* Page Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs font-bold text-[#E8630A] uppercase tracking-widest">Join FoodBridge Network</span>
        <h1 className="font-cause font-extrabold text-3xl sm:text-4xl text-stone-900">
          Create Your Partner Account
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 font-medium">
          Select your primary operational role below. Form inputs adapt automatically.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <button
          type="button"
          onClick={() => setRole('restaurant')}
          className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 ${
            role === 'restaurant'
              ? 'bg-orange-50/80 border-[#E8630A] ring-2 ring-orange-200 shadow-sm'
              : 'bg-white border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="flex justify-between items-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              role === 'restaurant' ? 'bg-[#E8630A] text-white' : 'bg-stone-100 text-stone-600'
            }`}>
              <Utensils className="w-5 h-5" />
            </div>
            {role === 'restaurant' && <Check className="w-5 h-5 text-[#E8630A]" />}
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-base">Restaurant</h3>
            <p className="text-xs text-stone-500 mt-0.5">Donate excess meals, pastries & produce</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setRole('ngo')}
          className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 ${
            role === 'ngo'
              ? 'bg-rose-50/80 border-rose-500 ring-2 ring-rose-200 shadow-sm'
              : 'bg-white border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="flex justify-between items-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              role === 'ngo' ? 'bg-rose-600 text-white' : 'bg-stone-100 text-stone-600'
            }`}>
              <HeartHandshake className="w-5 h-5" />
            </div>
            {role === 'ngo' && <Check className="w-5 h-5 text-rose-600" />}
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-base">NGO / Shelter</h3>
            <p className="text-xs text-stone-500 mt-0.5">Claim food & feed local community</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setRole('volunteer')}
          className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 ${
            role === 'volunteer'
              ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-200 shadow-sm'
              : 'bg-white border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="flex justify-between items-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              role === 'volunteer' ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600'
            }`}>
              <Bike className="w-5 h-5" />
            </div>
            {role === 'volunteer' && <Check className="w-5 h-5 text-amber-600" />}
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-base">Volunteer Driver</h3>
            <p className="text-xs text-stone-500 mt-0.5">Transport food from kitchen to shelter</p>
          </div>
        </button>

      </div>

      {/* Role Adaptive Registration Form */}
      <div className="bg-white border border-stone-200 rounded-3xl p-8 sm:p-10 shadow-lg">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Field 1: Contact/User Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">
                {role === 'volunteer' ? 'Full Name' : 'Primary Contact Name'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'volunteer' ? 'e.g. Alex Rivera' : 'e.g. Sarah Jenkins'}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#E8630A] focus:ring-2 focus:ring-orange-100 text-sm outline-none"
              />
            </div>

            {/* Field 2: Role Specific Org Name */}
            {role !== 'volunteer' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  {role === 'restaurant' ? 'Restaurant / Bakery Name' : 'NGO / Shelter Organization Name'}
                </label>
                <input
                  type="text"
                  required
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder={role === 'restaurant' ? 'e.g. GreenBites Cafe' : 'e.g. Hope Community Kitchen'}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#E8630A] focus:ring-2 focus:ring-orange-100 text-sm outline-none"
                />
              </div>
            )}

            {/* Field 3: Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@domain.org"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#E8630A] focus:ring-2 focus:ring-orange-100 text-sm outline-none"
              />
            </div>

            {/* Field 4: Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1-555-0199"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#E8630A] focus:ring-2 focus:ring-orange-100 text-sm outline-none"
              />
            </div>

          </div>

          {/* Role specific full-width fields */}
          {role !== 'volunteer' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">
                {role === 'restaurant' ? 'Pickup Address (Kitchen Location)' : 'Shelter Facility Address'}
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Community Way, Downtown Metro"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#E8630A] focus:ring-2 focus:ring-orange-100 text-sm outline-none"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">Preferred Delivery Availability Zone</label>
              <input
                type="text"
                required
                value={availabilityZone}
                onChange={(e) => setAvailabilityZone(e.target.value)}
                placeholder="e.g. Downtown & Midtown Metro Area"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#E8630A] focus:ring-2 focus:ring-orange-100 text-sm outline-none"
              />
            </div>
          )}

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#E8630A] focus:ring-2 focus:ring-orange-100 text-sm outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#E8630A] hover:bg-[#C2410C] text-white font-bold text-sm shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <span>Create {role === 'restaurant' ? 'Restaurant' : role === 'ngo' ? 'NGO' : 'Volunteer'} Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>

        <div className="mt-6 pt-4 border-t border-stone-100 text-center text-xs text-stone-600">
          Already registered?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-bold text-[#E8630A] hover:underline"
          >
            Sign In Here
          </button>
        </div>
      </div>

    </div>
  );
};
