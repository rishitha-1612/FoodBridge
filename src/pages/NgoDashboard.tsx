import React, { useState, useEffect } from 'react';
import { User, Donation } from '../types';
import { apiDonations, apiAdmin } from '../lib/api';
import { StatusBadge } from '../components/StatusBadge';
import { StatusStepper } from '../components/StatusStepper';
import { FoodSafetyModal } from '../components/FoodSafetyModal';
import { 
  HeartHandshake, Clock, Sparkles, MapPin, UserCheck, CheckCircle2, 
  Bike, ChevronDown, ChevronUp, AlertCircle, X, Search, ShieldCheck, Thermometer 
} from 'lucide-react';

interface NgoDashboardProps {
  currentUser: User;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const NgoDashboard: React.FC<NgoDashboardProps> = ({ currentUser, onNavigate }) => {
  const [tab, setTab] = useState<'browse' | 'accepted' | 'volunteers'>('browse');
  const [availableDonations, setAvailableDonations] = useState<Donation[]>([]);
  const [myDonations, setMyDonations] = useState<Donation[]>([]);
  const [allVolunteers, setAllVolunteers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

  // Selected donation modal
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [assignVolunteerModalDonation, setAssignVolunteerModalDonation] = useState<Donation | null>(null);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string>('');
  const [expandedTrackerId, setExpandedTrackerId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Available donations
      const available = await apiDonations.list({ status: 'Available', search: searchQuery });
      setAvailableDonations(available);

      // 2. My NGO's accepted or completed donations
      const myAccepted = await apiDonations.list({ ngoId: currentUser.id });
      setMyDonations(myAccepted);

      // 3. Load volunteers list for assignment
      const users = await apiAdmin.getUsers();
      setAllVolunteers(users.filter(u => u.role === 'volunteer'));
    } catch (err) {
      console.error("Failed loading NGO portal data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser.id, searchQuery]);

  const handleAcceptDonation = async (donId: string) => {
    try {
      await apiDonations.accept(donId);
      setSelectedDonation(null);
      loadData();
    } catch (err: any) {
      alert(`Failed to accept donation: ${err.message}`);
    }
  };

  const handleAssignVolunteer = async () => {
    if (!assignVolunteerModalDonation || !selectedVolunteerId) return;
    try {
      await apiDonations.assignVolunteer(assignVolunteerModalDonation.id, selectedVolunteerId);
      setAssignVolunteerModalDonation(null);
      setSelectedVolunteerId('');
      loadData();
    } catch (err: any) {
      alert(`Failed to assign volunteer: ${err.message}`);
    }
  };

  const inProgressCount = myDonations.filter(d => d.status === 'Accepted' || d.status === 'Pickup Assigned' || d.status === 'Picked Up' || d.status === 'Delivered').length;
  const completedCount = myDonations.filter(d => d.status === 'Completed').length;
  const totalMealsReceived = myDonations.reduce((sum, d) => sum + (parseInt(d.quantity) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Pending Account Notice if NGO is pending */}
      {currentUser.status === 'pending' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 font-medium flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            <strong>Account Pending Verification:</strong> Your NGO account is under review. You can browse available surplus food, but donation claims require admin approval.
          </span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cause font-extrabold text-2xl sm:text-3xl text-stone-900">
                {currentUser.organizationName || currentUser.name}
              </h1>
              <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-rose-200">
                Community NGO
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              {currentUser.address || '456 Compassion St, Eastside'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsSafetyModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl border border-rose-200 text-rose-800 bg-rose-50 hover:bg-rose-100 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            <span>Safety Guidelines</span>
          </button>

          <button
            onClick={() => setTab('browse')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              tab === 'browse' ? 'bg-[#E8630A] text-white shadow-xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Browse Available ({availableDonations.length})
          </button>
          <button
            onClick={() => setTab('accepted')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              tab === 'accepted' ? 'bg-[#E8630A] text-white shadow-xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            My Accepted ({myDonations.length})
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold">Available Nearby</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-cause font-extrabold text-3xl text-stone-900">{availableDonations.length}</p>
          <p className="text-[11px] text-emerald-700 font-semibold">Ready to claim</p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold">In Progress</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-cause font-extrabold text-3xl text-stone-900">{inProgressCount}</p>
          <p className="text-[11px] text-amber-700 font-semibold">Accepted or En Route</p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold">Received This Month</span>
            <CheckCircle2 className="w-4 h-4 text-rose-600" />
          </div>
          <p className="font-cause font-extrabold text-3xl text-stone-900">{completedCount}</p>
          <p className="text-[11px] text-stone-500 font-medium">Completed deliveries</p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold">Meals Distributed</span>
            <HeartHandshake className="w-4 h-4 text-[#E8630A]" />
          </div>
          <p className="font-cause font-extrabold text-3xl text-[#E8630A]">{totalMealsReceived}</p>
          <p className="text-[11px] text-stone-500 font-medium">Portions served</p>
        </div>

      </div>

      {/* Search Bar for Available Tab */}
      {tab === 'browse' && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search available food by dish, restaurant, or category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#E8630A] focus:ring-2 focus:ring-orange-100 text-xs sm:text-sm bg-white outline-none"
          />
        </div>
      )}

      {/* Tab 1: Browse Available Donations */}
      {tab === 'browse' && (
        <div className="space-y-4">
          <h2 className="font-cause font-extrabold text-xl text-stone-900 flex items-center gap-2">
            <span>Available Surplus Food Donations</span>
            <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
              {availableDonations.length} items
            </span>
          </h2>

          {loading ? (
            <div className="text-center py-12 bg-white border border-stone-200 rounded-3xl space-y-2">
              <div className="w-8 h-8 border-4 border-[#E8630A] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-stone-500">Searching active listings...</p>
            </div>
          ) : availableDonations.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-3xl p-10 text-center space-y-3">
              <Sparkles className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-bold text-stone-900 text-lg">No Available Food at the Moment</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Check back shortly! Partner restaurants continuously upload surplus prepared food throughout the afternoon and evening.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableDonations.map((don) => (
                <div 
                  key={don.id}
                  className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs hover:border-orange-300 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8630A] bg-orange-50 px-2 py-0.5 rounded-md">
                          {don.category.replace('_', ' ')}
                        </span>
                        <h3 className="font-bold text-stone-900 text-lg mt-1">{don.title}</h3>
                        <p className="text-xs text-stone-600 font-medium">{don.restaurantName}</p>
                      </div>
                      <StatusBadge status={don.status} size="sm" />
                    </div>

                    <div className="text-xs text-stone-600 space-y-1.5 bg-stone-50 border border-stone-100 p-3 rounded-2xl">
                      <p><strong className="text-stone-800">Quantity:</strong> {don.quantity}</p>
                      <p><strong className="text-stone-800">Pickup Address:</strong> {don.pickupAddress}</p>
                      <p><strong className="text-stone-800">Time Window:</strong> {don.pickupWindow}</p>
                      {don.specialNotes && (
                        <p><strong className="text-stone-800">Notes:</strong> {don.specialNotes}</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3 border-t border-stone-100">
                    <button
                      onClick={() => setSelectedDonation(don)}
                      className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => handleAcceptDonation(don.id)}
                      className="px-5 py-2 rounded-xl bg-[#E8630A] hover:bg-[#C2410C] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <HeartHandshake className="w-4 h-4" />
                      <span>Accept Donation</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Accepted Donations */}
      {tab === 'accepted' && (
        <div className="space-y-4">
          <h2 className="font-cause font-extrabold text-xl text-stone-900">My Claimed Donations & Logistics</h2>

          {myDonations.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-3xl p-10 text-center space-y-3">
              <p className="text-sm text-stone-600 font-medium">You haven't accepted any donations yet.</p>
              <button
                onClick={() => setTab('browse')}
                className="px-4 py-2 bg-[#E8630A] text-white rounded-xl text-xs font-bold"
              >
                Browse Available Donations
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myDonations.map((don) => {
                const isTrackerExpanded = expandedTrackerId === don.id;

                return (
                  <div key={don.id} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-stone-900 text-lg">{don.title}</h3>
                          <StatusBadge status={don.status} size="sm" />
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          From <strong>{don.restaurantName}</strong> • {don.quantity}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {don.status === 'Accepted' && (
                          <button
                            onClick={() => {
                              setAssignVolunteerModalDonation(don);
                              setSelectedVolunteerId(allVolunteers[0]?.id || '');
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-orange-100 text-[#C2410C] hover:bg-orange-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <Bike className="w-4 h-4" />
                            <span>Assign Driver</span>
                          </button>
                        )}

                        <button
                          onClick={() => setExpandedTrackerId(isTrackerExpanded ? null : don.id)}
                          className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1"
                        >
                          <span>{isTrackerExpanded ? 'Hide Delivery Stepper' : 'Track Delivery Status'}</span>
                          {isTrackerExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="bg-stone-50 border border-stone-100 rounded-xl p-3 text-xs text-stone-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div><strong>Pickup Location:</strong> {don.pickupAddress}</div>
                      <div>
                        <strong>Assigned Driver: </strong> 
                        <span className="text-[#E8630A] font-bold">
                          {don.assignedVolunteerName || 'No Driver Assigned Yet'}
                        </span>
                      </div>
                    </div>

                    {isTrackerExpanded && (
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
      )}

      {/* Donation Detail Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h3 className="font-cause font-extrabold text-xl text-stone-900">Donation Details</h3>
              <button onClick={() => setSelectedDonation(null)} className="p-2 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-stone-700">
              <h4 className="font-bold text-stone-900 text-lg">{selectedDonation.title}</h4>
              <p className="text-xs text-stone-500">Offered by <strong>{selectedDonation.restaurantName}</strong></p>
              
              <div className="bg-[#FFF9F5] border border-orange-200 rounded-2xl p-4 space-y-2 text-xs">
                <p><strong>Quantity:</strong> {selectedDonation.quantity}</p>
                <p><strong>Category:</strong> {selectedDonation.category}</p>
                <p><strong>Pickup Address:</strong> {selectedDonation.pickupAddress}</p>
                <p><strong>Pickup Window:</strong> {selectedDonation.pickupWindow}</p>
                {selectedDonation.specialNotes && (
                  <p><strong>Special Notes:</strong> {selectedDonation.specialNotes}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedDonation(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={() => handleAcceptDonation(selectedDonation.id)}
                className="px-5 py-2 rounded-xl bg-[#E8630A] text-white text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Confirm & Accept Donation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Volunteer Modal */}
      {assignVolunteerModalDonation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-cause font-extrabold text-lg text-stone-900">Assign Volunteer Driver</h3>
              <button onClick={() => setAssignVolunteerModalDonation(null)} className="p-1.5 text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-stone-600">
                Select a registered volunteer driver to pick up <strong>{assignVolunteerModalDonation.title}</strong> from {assignVolunteerModalDonation.restaurantName}.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">Available Volunteer Drivers</label>
                <select
                  value={selectedVolunteerId}
                  onChange={(e) => setSelectedVolunteerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-800 bg-white outline-none"
                >
                  {allVolunteers.map(vol => (
                    <option key={vol.id} value={vol.id}>
                      {vol.name} ({vol.availabilityZone || 'General Zone'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setAssignVolunteerModalDonation(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignVolunteer}
                className="px-5 py-2 rounded-xl bg-[#E8630A] text-white text-xs font-bold shadow-md"
              >
                Confirm Driver Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Food Safety Guidelines Modal */}
      <FoodSafetyModal 
        isOpen={isSafetyModalOpen} 
        onClose={() => setIsSafetyModalOpen(false)} 
        defaultRoleTab="ngo"
      />

    </div>
  );
};
