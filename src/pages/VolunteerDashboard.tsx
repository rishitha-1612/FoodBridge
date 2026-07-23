import React, { useState, useEffect } from 'react';
import { User, Donation } from '../types';
import { apiDonations } from '../lib/api';
import { StatusBadge } from '../components/StatusBadge';
import { StatusStepper } from '../components/StatusStepper';
import { FoodSafetyModal } from '../components/FoodSafetyModal';
import { 
  Bike, Truck, PackageCheck, CheckCircle2, MapPin, 
  Clock, Navigation, ChevronDown, ChevronUp, AlertCircle, ShieldCheck 
} from 'lucide-react';

interface VolunteerDashboardProps {
  currentUser: User;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({ currentUser, onNavigate }) => {
  const [assignedDonations, setAssignedDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

  const loadAssigned = async () => {
    setLoading(true);
    try {
      const data = await apiDonations.list({ volunteerId: currentUser.id });
      setAssignedDonations(data);
    } catch (err) {
      console.error("Failed loading volunteer assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssigned();
  }, [currentUser.id]);

  const handlePickup = async (id: string) => {
    try {
      await apiDonations.markPickup(id);
      loadAssigned();
    } catch (err: any) {
      alert(`Pickup error: ${err.message}`);
    }
  };

  const handleDeliver = async (id: string) => {
    try {
      await apiDonations.markDeliver(id);
      loadAssigned();
    } catch (err: any) {
      alert(`Delivery error: ${err.message}`);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await apiDonations.markComplete(id);
      loadAssigned();
    } catch (err: any) {
      alert(`Completion error: ${err.message}`);
    }
  };

  const inProgress = assignedDonations.filter(d => d.status === 'Pickup Assigned' || d.status === 'Picked Up' || d.status === 'Delivered');
  const completed = assignedDonations.filter(d => d.status === 'Completed');
  const totalMealsDelivered = assignedDonations.reduce((sum, d) => sum + (parseInt(d.quantity) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
            <Bike className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cause font-extrabold text-2xl sm:text-3xl text-stone-900">
                {currentUser.name}
              </h1>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                Volunteer Driver
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5 flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-stone-400" />
              Zone: {currentUser.availabilityZone || 'Downtown & Midtown Metro Area'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsSafetyModalOpen(true)}
          className="px-4 py-2.5 rounded-xl border border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <ShieldCheck className="w-4 h-4 text-amber-700" />
          <span>Transport Safety Rules</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold">Assigned Pickups</span>
            <Bike className="w-4 h-4 text-amber-600" />
          </div>
          <p className="font-cause font-extrabold text-3xl text-stone-900">{assignedDonations.length}</p>
          <p className="text-[11px] text-amber-700 font-semibold">Total dispatch runs</p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold">Active In-Progress</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="font-cause font-extrabold text-3xl text-stone-900">{inProgress.length}</p>
          <p className="text-[11px] text-blue-700 font-semibold">Pickup or delivery</p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold">Completed Runs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-cause font-extrabold text-3xl text-stone-900">{completed.length}</p>
          <p className="text-[11px] text-stone-500 font-medium">Delivered to shelter</p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold">Total Portions Moved</span>
            <PackageCheck className="w-4 h-4 text-[#E8630A]" />
          </div>
          <p className="font-cause font-extrabold text-3xl text-[#E8630A]">{totalMealsDelivered}</p>
          <p className="text-[11px] text-stone-500 font-medium">Food saved</p>
        </div>

      </div>

      {/* Main List */}
      <div className="space-y-4">
        <h2 className="font-cause font-extrabold text-xl text-stone-900 flex items-center gap-2">
          <span>Assigned Pickup & Delivery Dispatches</span>
          <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-full">
            {assignedDonations.length}
          </span>
        </h2>

        {loading ? (
          <div className="text-center py-12 bg-white border border-stone-200 rounded-3xl space-y-2">
            <div className="w-8 h-8 border-4 border-[#E8630A] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-stone-500">Loading driver dispatch route...</p>
          </div>
        ) : assignedDonations.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-3xl p-10 text-center space-y-3">
            <Bike className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="font-bold text-stone-900 text-lg">No Pending Pickups Assigned</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              You're currently all clear! When NGOs accept food donations in your availability zone and assign you as driver, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {assignedDonations.map((don) => {
              const isExpanded = expandedId === don.id;

              return (
                <div key={don.id} className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-bold text-stone-900 text-xl">{don.title}</h3>
                        <StatusBadge status={don.status} size="md" />
                      </div>
                      <p className="text-xs text-stone-500 mt-1">
                        Quantity: <strong className="text-[#E8630A]">{don.quantity}</strong> • Pickup Window: <strong>{don.pickupWindow}</strong>
                      </p>
                    </div>

                    {/* Strict State Machine Action Controls for Volunteers */}
                    <div className="flex items-center gap-2 flex-wrap">
                      
                      {don.status === 'Pickup Assigned' && (
                        <button
                          onClick={() => handlePickup(don.id)}
                          className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all"
                        >
                          <Truck className="w-4 h-4" />
                          <span>1. Mark as Picked Up</span>
                        </button>
                      )}

                      {don.status === 'Picked Up' && (
                        <button
                          onClick={() => handleDeliver(don.id)}
                          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all"
                        >
                          <PackageCheck className="w-4 h-4" />
                          <span>2. Mark as Delivered</span>
                        </button>
                      )}

                      {don.status === 'Delivered' && (
                        <button
                          onClick={() => handleComplete(don.id)}
                          className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>3. Mark as Completed</span>
                        </button>
                      )}

                      {don.status === 'Completed' && (
                        <span className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-1.5 border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Completed</span>
                        </span>
                      )}

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : don.id)}
                        className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold"
                      >
                        {isExpanded ? 'Hide Stepper' : 'View Stepper'}
                      </button>
                    </div>
                  </div>

                  {/* Address & Contact Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    
                    <div className="bg-[#FFF9F5] border border-orange-200/80 rounded-2xl p-4 space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-stone-900">
                        <span className="text-orange-800 flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-[#E8630A]" />
                          Pickup Location (Restaurant)
                        </span>
                      </div>
                      <p className="font-bold text-stone-800 text-sm">{don.restaurantName}</p>
                      <p className="text-stone-600">{don.pickupAddress}</p>
                      {don.specialNotes && (
                        <p className="text-stone-500 pt-1 border-t border-orange-100 italic">
                          "{don.specialNotes}"
                        </p>
                      )}
                    </div>

                    <div className="bg-[#FFF9F5] border border-rose-200/80 rounded-2xl p-4 space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-stone-900">
                        <span className="text-rose-800 flex items-center gap-1">
                          <Navigation className="w-4 h-4 text-rose-600" />
                          Delivery Destination (NGO Shelter)
                        </span>
                      </div>
                      <p className="font-bold text-stone-800 text-sm">{don.acceptedByNgoName || 'Community Shelter'}</p>
                      <p className="text-stone-600">Shelter Facility Receiving Area</p>
                      <p className="text-stone-500 pt-1 border-t border-rose-100">
                        Instruct receiving staff to confirm delivery in portal.
                      </p>
                    </div>

                  </div>

                  {isExpanded && (
                    <div className="pt-2">
                      <StatusStepper currentStatus={don.status} timeline={don.statusTimeline} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Food Safety Modal */}
      <FoodSafetyModal 
        isOpen={isSafetyModalOpen} 
        onClose={() => setIsSafetyModalOpen(false)} 
        defaultRoleTab="volunteer"
      />

    </div>
  );
};
