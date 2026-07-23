import React, { useState } from 'react';
import { User } from '../types';
import { apiProfile } from '../lib/api';
import { User as UserIcon, Building, Phone, MapPin, Save, Lock, ShieldCheck } from 'lucide-react';

interface ProfilePageProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, onUpdateUser }) => {
  const [name, setName] = useState(currentUser.name);
  const [organizationName, setOrganizationName] = useState(currentUser.organizationName || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [address, setAddress] = useState(currentUser.address || '');
  const [availabilityZone, setAvailabilityZone] = useState(currentUser.availabilityZone || '');
  
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    try {
      const updated = await apiProfile.update({
        name,
        organizationName,
        phone,
        address,
        availabilityZone
      });

      onUpdateUser(updated);
      setSuccessMsg("Profile information updated successfully!");
    } catch (err: any) {
      alert(`Failed to update profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      
      <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-4 border-b border-stone-100 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 text-[#E8630A] font-bold text-2xl flex items-center justify-center">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-cause font-extrabold text-2xl text-stone-900">{currentUser.name}</h1>
            <p className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
              <span>{currentUser.email}</span>
              <span>•</span>
              <span className="font-bold uppercase text-[#E8630A] bg-orange-50 px-2 py-0.5 rounded">
                {currentUser.role}
              </span>
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:border-[#E8630A]"
            />
          </div>

          {currentUser.role !== 'volunteer' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">Organization / Facility Name</label>
              <input
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:border-[#E8630A]"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">Phone Contact</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:border-[#E8630A]"
            />
          </div>

          {currentUser.role !== 'volunteer' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">Primary Location Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:border-[#E8630A]"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">Preferred Driver Zone</label>
              <input
                type="text"
                value={availabilityZone}
                onChange={(e) => setAvailabilityZone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:border-[#E8630A]"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-[#E8630A] hover:bg-[#C2410C] text-white font-bold text-sm shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
