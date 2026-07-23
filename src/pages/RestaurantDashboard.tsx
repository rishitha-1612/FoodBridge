import React, { useState, useEffect } from 'react';
import { User, Donation } from '../types';
import { apiDonations } from '../lib/api';
import { StatusBadge } from '../components/StatusBadge';
import { StatusStepper } from '../components/StatusStepper';
import { FoodSafetyModal } from '../components/FoodSafetyModal';
import { 
  Utensils, Plus, Clock, CheckCircle2, PackageCheck, Edit3, Trash2, 
  ChevronDown, ChevronUp, History, LayoutDashboard, User as UserIcon, X, MapPin, Sparkles, Filter, ShieldCheck, AlertTriangle 
} from 'lucide-react';

interface RestaurantDashboardProps {
  currentUser: User;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const RestaurantDashboard: React.FC<RestaurantDashboardProps> = ({ currentUser, onNavigate, onLogout }) => {
  const [tab, setTab] = useState<'overview' | 'my_donations' | 'history'>('overview');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDonationId, setExpandedDonationId] = useState<string | null>(null);

  // Food Safety Modal state
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

  // Add Donation Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'cooked_meal' | 'packaged' | 'produce' | 'bakery' | 'other'>('cooked_meal');
  const [formQuantity, setFormQuantity] = useState('');
  const [formExpiryHours, setFormExpiryHours] = useState('6');
  const [formPickupAddress, setFormPickupAddress] = useState(currentUser.address || '');
  const [formPickupWindow, setFormPickupWindow] = useState('Today 4:00 PM - 7:00 PM');
  const [formSpecialNotes, setFormSpecialNotes] = useState('');
  const [formSafetyAgreed, setFormSafetyAgreed] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadDonations = async () => {
    setLoading(true);
    try {
      const data = await apiDonations.list({ restaurantId: currentUser.id });
      setDonations(data);
    } catch (err) {
      console.error("Failed to load restaurant donations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, [currentUser.id]);

  const openAddModal = (don?: Donation) => {
    if (don) {
      setEditingDonation(don);
      setFormTitle(don.title);
      setFormCategory(don.category);
      setFormQuantity(don.quantity);
      setFormPickupAddress(don.pickupAddress);
      setFormPickupWindow(don.pickupWindow);
      setFormSpecialNotes(don.specialNotes || '');
    } else {
      setEditingDonation(null);
      setFormTitle('');
      setFormCategory('cooked_meal');
      setFormQuantity('');
      setFormPickupAddress(currentUser.address || '');
      setFormPickupWindow('');
      setFormSpecialNotes('');
    }
    setIsAddModalOpen(true);
  };

  const handleSaveDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const expiryDate = new Date(Date.now() + parseInt(formExpiryHours) * 3600 * 1000).toISOString();

      if (editingDonation) {
        await apiDonations.update(editingDonation.id, {
          title: formTitle,
          category: formCategory,
          quantity: formQuantity,
          expiry: expiryDate,
          pickupAddress: formPickupAddress,
          pickupWindow: formPickupWindow,
          specialNotes: formSpecialNotes
        });
      } else {
        await apiDonations.create({
          title: formTitle,
          category: formCategory,
          quantity: formQuantity,
          expiry: expiryDate,
          pickupAddress: formPickupAddress,
          pickupWindow: formPickupWindow,
          specialNotes: formSpecialNotes
        });
      }

      setIsAddModalOpen(false);
      loadDonations();
    } catch (err: any) {
      alert(`Error saving donation: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDonation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this donation entry?")) return;
    try {
      await apiDonations.delete(id);
      loadDonations();
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  // Metrics calculation
  const activeCount = donations.filter(d => d.status === 'Available' || d.status === 'Accepted').length;
  const pendingPickupCount = donations.filter(d => d.status === 'Pickup Assigned' || d.status === 'Picked Up').length;
  const completedCount = donations.filter(d => d.status === 'Completed').length;
  
  // Estimate meals contributed
  const totalMealsContributed = donations.reduce((acc, d) => {
    const num = parseInt(d.quantity) || 0;
    return acc + num;
  }, 0);

  const filteredDonations = statusFilter === 'all' 
    ? donations 
    : donations.filter(d => d.status === statusFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-[#E8630A] flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
            <Utensils className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cause font-extrabold text-2xl sm:text-3xl text-stone-900">
                {currentUser.organizationName || currentUser.name}
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                Verified Restaurant
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              {currentUser.address || '742 Evergreen Terrace, Downtown'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => setIsSafetyModalOpen(true)}
            className="px-4 py-3 rounded-2xl bg-orange-50 hover:bg-orange-100 text-[#C2410C] border border-orange-200/80 font-bold text-xs transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-[#E8630A]" />
            <span>Food Safety Guidelines</span>
          </button>

          <button
            onClick={() => openAddModal()}
            className="px-5 py-3 rounded-2xl bg-[#E8630A] hover:bg-[#C2410C] text-white font-bold text-sm shadow-md shadow-orange-600/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Donation</span>
          </button>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold">Active Listings</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-cause font-extrabold text-3xl text-stone-900">{activeCount}</p>
          <p className="text-[11px] text-emerald-700 font-semibold">Available or Accepted</p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold">Pending Pickup</span>
            <PackageCheck className="w-4 h-4 text-orange-600" />
          </div>
          <p className="font-cause font-extrabold text-3xl text-stone-900">{pendingPickupCount}</p>
          <p className="text-[11px] text-orange-700 font-semibold">Driver assigned or en route</p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold">Completed Runs</span>
            <CheckCircle2 className="w-4 h-4 text-[#E8630A]" />
          </div>
          <p className="font-cause font-extrabold text-3xl text-stone-900">{completedCount}</p>
          <p className="text-[11px] text-stone-500 font-medium">Delivered to shelter</p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold">Total Food Saved</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-cause font-extrabold text-3xl text-[#E8630A]">{totalMealsContributed}</p>
          <p className="text-[11px] text-stone-500 font-medium">Estimated meal portions</p>
        </div>

      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-stone-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('overview')}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              tab === 'overview' 
                ? 'border-[#E8630A] text-[#E8630A]' 
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Active Donations</span>
          </button>

          <button
            onClick={() => setTab('history')}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              tab === 'history' 
                ? 'border-[#E8630A] text-[#E8630A]' 
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Full Donation History</span>
          </button>
        </div>

        {tab === 'history' && (
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-xs font-bold outline-none text-stone-700"
            >
              <option value="all">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Accepted">Accepted</option>
              <option value="Pickup Assigned">Pickup Assigned</option>
              <option value="Picked Up">Picked Up</option>
              <option value="Delivered">Delivered</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        )}
      </div>

      {/* Content Body */}
      {loading ? (
        <div className="text-center py-16 bg-white border border-stone-200 rounded-3xl space-y-3">
          <div className="w-8 h-8 border-4 border-[#E8630A] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-stone-500 font-medium">Fetching restaurant donations...</p>
        </div>
      ) : donations.length === 0 ? (
        /* Empty State Design for new restaurants with zero donations */
        <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center space-y-5 max-w-lg mx-auto my-8">
          <div className="w-20 h-20 rounded-3xl bg-orange-100 text-[#E8630A] flex items-center justify-center mx-auto shadow-inner">
            <Utensils className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="font-cause font-extrabold text-2xl text-stone-900">No Food Listed Yet</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Start redirecting surplus food to local community shelters. Click below to add your first food donation listing.
            </p>
          </div>
          <button
            onClick={() => openAddModal()}
            className="px-6 py-3 rounded-2xl bg-[#E8630A] hover:bg-[#C2410C] text-white font-bold text-sm shadow-md transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Your First Donation</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDonations.map((donation) => {
            const isExpanded = expandedDonationId === donation.id;

            return (
              <div 
                key={donation.id} 
                className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs hover:border-orange-200 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-bold text-stone-900 text-lg">{donation.title}</h3>
                      <StatusBadge status={donation.status} size="sm" />
                    </div>
                    <p className="text-xs text-stone-500 flex items-center gap-3">
                      <span>Category: <strong className="text-stone-700 capitalize">{donation.category.replace('_', ' ')}</strong></span>
                      <span>•</span>
                      <span>Quantity: <strong className="text-[#E8630A]">{donation.quantity}</strong></span>
                      <span>•</span>
                      <span>Pickup: <strong className="text-stone-700">{donation.pickupWindow}</strong></span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {donation.status === 'Available' && (
                      <>
                        <button
                          onClick={() => openAddModal(donation)}
                          className="px-3 py-1.5 rounded-xl border border-stone-200 hover:border-orange-300 hover:bg-orange-50 text-stone-700 hover:text-[#C2410C] text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteDonation(donation.id)}
                          className="px-3 py-1.5 rounded-xl border border-stone-200 hover:border-rose-300 hover:bg-rose-50 text-stone-700 hover:text-rose-600 text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => setExpandedDonationId(isExpanded ? null : donation.id)}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <span>{isExpanded ? 'Hide Timeline' : 'View Stepper Timeline'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Additional details */}
                <div className="text-xs text-stone-600 bg-stone-50 border border-stone-100 p-3 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="font-bold text-stone-700">Pickup Location: </span>
                    {donation.pickupAddress}
                  </div>
                  <div>
                    <span className="font-bold text-stone-700">Assigned NGO / Driver: </span>
                    {donation.acceptedByNgoName ? `${donation.acceptedByNgoName} ${donation.assignedVolunteerName ? `(Driver: ${donation.assignedVolunteerName})` : ''}` : 'Awaiting NGO Acceptance'}
                  </div>
                </div>

                {/* Expanded Stepper View */}
                {isExpanded && (
                  <div className="pt-2">
                    <StatusStepper currentStatus={donation.status} timeline={donation.statusTimeline} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Donation Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#E8630A] flex items-center justify-center font-bold">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cause font-extrabold text-xl text-stone-900">
                    {editingDonation ? 'Edit Food Donation' : 'List Surplus Food Donation'}
                  </h3>
                  <p className="text-xs text-stone-500">Provide accurate details for local NGO shelters</p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDonation} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">Food Title / Dish Description</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Fresh Artisan Sandwiches & Wraps"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#E8630A] focus:ring-2 focus:ring-orange-100 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">Food Category</label>
                  <select
                    value={formCategory}
                    onChange={(e: any) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#E8630A] text-sm outline-none bg-white font-medium text-stone-800"
                  >
                    <option value="cooked_meal">Cooked Meal (Ready to Eat)</option>
                    <option value="bakery">Bakery & Pastries</option>
                    <option value="produce">Fresh Produce / Fruit</option>
                    <option value="packaged">Packaged Goods</option>
                    <option value="other">Other Food Item</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">Quantity & Units</label>
                  <input
                    type="text"
                    required
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                    placeholder="e.g. 35 meals or 15 kg"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#E8630A] focus:ring-2 focus:ring-orange-100 text-sm outline-none"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">Estimated Expiry Window</label>
                  <select
                    value={formExpiryHours}
                    onChange={(e) => setFormExpiryHours(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#E8630A] text-sm outline-none bg-white font-medium text-stone-800"
                  >
                    <option value="3">Consume within 3 hours</option>
                    <option value="6">Consume within 6 hours</option>
                    <option value="12">Consume within 12 hours</option>
                    <option value="24">Good for 24 hours</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">Pickup Time Window</label>
                  <input
                    type="text"
                    required
                    value={formPickupWindow}
                    onChange={(e) => setFormPickupWindow(e.target.value)}
                    placeholder="e.g. Today 4:00 PM - 6:00 PM"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#E8630A] focus:ring-2 focus:ring-orange-100 text-sm outline-none"
                  />
                </div>

              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">Pickup Address</label>
                <input
                  type="text"
                  required
                  value={formPickupAddress}
                  onChange={(e) => setFormPickupAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#E8630A] focus:ring-2 focus:ring-orange-100 text-sm outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">Special Instructions / Allergen Notes</label>
                <textarea
                  rows={3}
                  value={formSpecialNotes}
                  onChange={(e) => setFormSpecialNotes(e.target.value)}
                  placeholder="e.g. Contains dairy & gluten. Packed in insulated thermal containers."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#E8630A] focus:ring-2 focus:ring-orange-100 text-sm outline-none"
                ></textarea>
              </div>

              {/* Food Safety Prominent Notice Box */}
              <div className="bg-[#FFF9F5] border border-orange-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#E8630A] shrink-0" />
                    <div>
                      <p className="font-bold text-xs text-stone-900">Food Safety & Quality Assurance</p>
                      <p className="text-[11px] text-stone-600 font-medium">Hot food ≥140°F (60°C) • Cold food ≤40°F (4°C)</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsSafetyModalOpen(true)}
                    className="text-xs font-bold text-[#E8630A] hover:underline shrink-0 bg-white px-2.5 py-1 rounded-lg border border-orange-200 shadow-2xs"
                  >
                    View Guidelines
                  </button>
                </div>

                <label className="flex items-start gap-2 text-xs text-stone-700 font-medium cursor-pointer pt-1 border-t border-orange-100">
                  <input
                    type="checkbox"
                    required
                    checked={formSafetyAgreed}
                    onChange={(e) => setFormSafetyAgreed(e.target.checked)}
                    className="mt-0.5 rounded text-[#E8630A] focus:ring-[#E8630A]"
                  />
                  <span>
                    I confirm this surplus food complies with <strong>FoodBridge Safety Guidelines</strong> (held at safe temperature, unserved kitchen surplus, packaged in food-grade containers with allergen notes).
                  </span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-sm hover:bg-stone-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || !formSafetyAgreed}
                  className="px-6 py-2.5 rounded-xl bg-[#E8630A] hover:bg-[#C2410C] text-white font-bold text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : editingDonation ? 'Update Donation' : 'Post Food Donation'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Food Safety Modal */}
      <FoodSafetyModal 
        isOpen={isSafetyModalOpen} 
        onClose={() => setIsSafetyModalOpen(false)} 
        defaultRoleTab="restaurant"
      />

    </div>
  );
};
