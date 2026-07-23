import React, { useState, useEffect } from 'react';
import { User, Donation, ActivityLog, ImpactStats } from '../types';
import { apiAdmin, apiDonations, apiImpact } from '../lib/api';
import { StatusBadge } from '../components/StatusBadge';
import { 
  ShieldCheck, Users, CheckCircle, AlertTriangle, BarChart3, 
  Activity, Search, Filter, ShieldAlert, Sparkles, RefreshCw, Check, X 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  CartesianGrid, PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';

interface AdminDashboardProps {
  currentUser: User;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onNavigate }) => {
  const [tab, setTab] = useState<'overview' | 'users' | 'donations' | 'analytics' | 'logs'>('overview');
  
  const [users, setUsers] = useState<User[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ImpactStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [donationStatusFilter, setDonationStatusFilter] = useState<string>('all');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const uList = await apiAdmin.getUsers();
      setUsers(uList);

      const dList = await apiDonations.list();
      setDonations(dList);

      const lList = await apiImpact.getActivityLogs();
      setLogs(lList);

      const sData = await apiImpact.getStats();
      setStats(sData);
    } catch (err) {
      console.error("Failed loading admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleApproveUser = async (userId: string) => {
    try {
      await apiAdmin.approveUser(userId);
      loadAdminData();
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  const handleUpdateStatus = async (userId: string, newStatus: 'approved' | 'pending' | 'suspended') => {
    try {
      await apiAdmin.updateUserStatus(userId, newStatus);
      loadAdminData();
    } catch (err: any) {
      alert(`Status update error: ${err.message}`);
    }
  };

  // Recharts Data Aggregates
  const mealsOverTimeData = [
    { month: 'Jan', meals: 0 },
    { month: 'Feb', meals: 0 },
    { month: 'Mar', meals: 0 },
    { month: 'Apr', meals: 0 },
    { month: 'May', meals: 0 },
    { month: 'Jun', meals: 0 },
    { month: 'Current', meals: stats?.mealsDonated || 0 },
  ];

  const statusBreakdownData = [
    { name: 'Available', value: donations.filter(d => d.status === 'Available').length, color: '#10B981' },
    { name: 'Accepted', value: donations.filter(d => d.status === 'Accepted').length, color: '#F59E0B' },
    { name: 'Pickup Assigned', value: donations.filter(d => d.status === 'Pickup Assigned').length, color: '#E8630A' },
    { name: 'Picked Up', value: donations.filter(d => d.status === 'Picked Up').length, color: '#3B82F6' },
    { name: 'Delivered', value: donations.filter(d => d.status === 'Delivered').length, color: '#6366F1' },
    { name: 'Completed', value: donations.filter(d => d.status === 'Completed').length, color: '#1F1B18' },
  ];

  const wastePreventedData = [
    { week: 'W1', tons: 0 },
    { week: 'W2', tons: 0 },
    { week: 'W3', tons: 0 },
    { week: 'W4', tons: 0 },
    { week: 'Current', tons: stats?.foodWastePreventedTons || 0 },
  ];

  const filteredUsers = users.filter(u => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesSearch = u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                          (u.organizationName && u.organizationName.toLowerCase().includes(userSearchQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const filteredDonations = donations.filter(d => {
    return donationStatusFilter === 'all' || d.status === donationStatusFilter;
  });

  const pendingUsers = users.filter(u => u.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-[#1F1B18] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E8630A] flex items-center justify-center font-bold text-xl shadow-md text-white shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cause font-extrabold text-2xl sm:text-3xl text-white">
                Platform Administrative Control
              </h1>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold px-2.5 py-0.5 rounded-full">
                System Admin
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-400 font-medium mt-0.5">
              Supervising user verification, safety compliance, and impact statistics
            </p>
          </div>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-2 border border-stone-700"
        >
          <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-stone-200 flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setTab('overview')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            tab === 'overview' ? 'border-[#E8630A] text-[#E8630A]' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>System Overview</span>
        </button>

        <button
          onClick={() => setTab('users')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            tab === 'users' ? 'border-[#E8630A] text-[#E8630A]' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Approvals ({pendingUsers.length} Pending)</span>
        </button>

        <button
          onClick={() => setTab('donations')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            tab === 'donations' ? 'border-[#E8630A] text-[#E8630A]' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Donations Monitor</span>
        </button>

        <button
          onClick={() => setTab('analytics')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            tab === 'analytics' ? 'border-[#E8630A] text-[#E8630A]' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics & Recharts</span>
        </button>

        <button
          onClick={() => setTab('logs')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            tab === 'logs' ? 'border-[#E8630A] text-[#E8630A]' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Activity Audit Logs</span>
        </button>
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="space-y-8">
          
          {/* Summary Stat Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs space-y-1">
              <p className="text-xs font-bold text-stone-500">Total Users</p>
              <p className="font-cause font-extrabold text-3xl text-stone-900">{users.length}</p>
              <p className="text-[11px] text-stone-500">All registered roles</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs space-y-1">
              <p className="text-xs font-bold text-[#C2410C]">Pending Approvals</p>
              <p className="font-cause font-extrabold text-3xl text-[#C2410C]">{pendingUsers.length}</p>
              <p className="text-[11px] text-orange-700 font-semibold">Requires admin review</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs space-y-1">
              <p className="text-xs font-bold text-stone-500">Active Donations</p>
              <p className="font-cause font-extrabold text-3xl text-[#E8630A]">{donations.filter(d => d.status !== 'Completed').length}</p>
              <p className="text-[11px] text-emerald-700 font-semibold">In redistribution pipeline</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs space-y-1">
              <p className="text-xs font-bold text-stone-500">Completed Deliveries</p>
              <p className="font-cause font-extrabold text-3xl text-emerald-700">{donations.filter(d => d.status === 'Completed').length}</p>
              <p className="text-[11px] text-stone-500 font-medium">Successfully received</p>
            </div>

            <div className="col-span-2 md:col-span-1 bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs space-y-1">
              <p className="text-xs font-bold text-stone-500">Food Waste Prevented</p>
              <p className="font-cause font-extrabold text-3xl text-[#E8630A]">{stats?.foodWastePreventedTons || 0} t</p>
              <p className="text-[11px] text-stone-500 font-medium">Metric tons diverted</p>
            </div>

          </div>

          {/* Pending Approval Section Alert */}
          {pendingUsers.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-700" />
                  <h3 className="font-bold text-amber-900 text-base">
                    Action Needed: {pendingUsers.length} Non-Profit Accounts Pending Approval
                  </h3>
                </div>
                <button
                  onClick={() => setTab('users')}
                  className="px-4 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-2xs"
                >
                  Review Users Now
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pendingUsers.map(u => (
                  <div key={u.id} className="bg-white border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-stone-900 text-sm">{u.organizationName || u.name}</p>
                      <p className="text-xs text-stone-500">{u.email} • Role: {u.role}</p>
                    </div>
                    <button
                      onClick={() => handleApproveUser(u.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity Feed */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4 shadow-xs">
            <h3 className="font-cause font-extrabold text-lg text-stone-900">Recent Platform Activity Stream</h3>
            <div className="space-y-3">
              {logs.slice(0, 8).map(log => (
                <div key={log.id} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 flex items-start justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">{log.userName}</span>
                      <span className="text-[10px] uppercase font-bold bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded">
                        {log.userRole}
                      </span>
                      <span className="font-bold text-[#E8630A]">{log.action}</span>
                    </div>
                    <p className="text-stone-600 mt-0.5">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Users Management Tab */}
      {tab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="font-cause font-extrabold text-xl text-stone-900">User Account & Permission Management</h2>

            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search users or orgs..."
                className="px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-medium outline-none bg-white"
              />

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-800 bg-white outline-none"
              >
                <option value="all">All Roles</option>
                <option value="restaurant">Restaurants</option>
                <option value="ngo">NGOs</option>
                <option value="volunteer">Volunteers</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 text-stone-600 uppercase font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-4">User / Organization</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Contact Info</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-orange-50/40">
                      <td className="p-4">
                        <p className="font-bold text-stone-900 text-sm">{u.organizationName || u.name}</p>
                        <p className="text-[11px] text-stone-500">{u.email}</p>
                      </td>
                      <td className="p-4">
                        <span className="font-bold capitalize bg-stone-100 px-2.5 py-1 rounded-lg text-stone-800">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-stone-600">
                        <p>{u.phone || 'N/A'}</p>
                        <p className="text-[10px] text-stone-400">{u.address || u.availabilityZone || 'N/A'}</p>
                      </td>
                      <td className="p-4">
                        {u.status === 'approved' && (
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
                            Approved
                          </span>
                        )}
                        {u.status === 'pending' && (
                          <span className="bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-full">
                            Pending Approval
                          </span>
                        )}
                        {u.status === 'suspended' && (
                          <span className="bg-rose-100 text-rose-800 font-bold px-2.5 py-1 rounded-full">
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {u.status === 'pending' && (
                          <button
                            onClick={() => handleApproveUser(u.id)}
                            className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                        )}
                        {u.status === 'approved' && u.role !== 'admin' && (
                          <button
                            onClick={() => handleUpdateStatus(u.id, 'suspended')}
                            className="px-3 py-1 rounded-xl bg-rose-100 text-rose-700 font-bold hover:bg-rose-200"
                          >
                            Suspend
                          </button>
                        )}
                        {u.status === 'suspended' && (
                          <button
                            onClick={() => handleUpdateStatus(u.id, 'approved')}
                            className="px-3 py-1 rounded-xl bg-stone-800 text-white font-bold hover:bg-stone-900"
                          >
                            Re-activate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Donations Monitor Tab */}
      {tab === 'donations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-cause font-extrabold text-xl text-stone-900">Platform Donations Monitor</h2>
            <select
              value={donationStatusFilter}
              onChange={(e) => setDonationStatusFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-800 bg-white"
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

          <div className="space-y-4">
            {filteredDonations.map(don => (
              <div key={don.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">{don.title}</h3>
                    <p className="text-xs text-stone-500">
                      From <strong>{don.restaurantName}</strong> • {don.quantity}
                    </p>
                  </div>
                  <StatusBadge status={don.status} size="sm" />
                </div>

                <div className="bg-stone-50 p-3 rounded-xl text-xs text-stone-600 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <p><strong>Pickup Address:</strong> {don.pickupAddress}</p>
                  <p><strong>NGO Shelter:</strong> {don.acceptedByNgoName || 'Unassigned'}</p>
                  <p><strong>Driver:</strong> {don.assignedVolunteerName || 'Unassigned'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics & Recharts Tab */}
      {tab === 'analytics' && (
        <div className="space-y-8">
          <div className="space-y-1">
            <h2 className="font-cause font-extrabold text-2xl text-stone-900">Impact & Operations Recharts Analytics</h2>
            <p className="text-xs text-stone-500">Visual trends calculated from platform SQL aggregates</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Chart 1: Meals Donated Over Time */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-stone-900 text-base">Monthly Cumulative Meals Redistributed</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mealsOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="meals" fill="#E8630A" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Donations Status Breakdown */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-stone-900 text-base">Donation Pipeline Breakdown</h3>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusBreakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Food Waste Prevented Trend */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4 lg:col-span-2">
              <h3 className="font-bold text-stone-900 text-base">Weekly Food Waste Diverted from Landfills (Metric Tons)</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={wastePreventedData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="tons" stroke="#10B981" strokeWidth={3} dot={{ r: 6, fill: '#10B981' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Activity Logs Tab */}
      {tab === 'logs' && (
        <div className="space-y-4">
          <h2 className="font-cause font-extrabold text-xl text-stone-900">Audit & Action Logs</h2>
          <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-2xs space-y-3">
            {logs.map(l => (
              <div key={l.id} className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-stone-900">{l.userName}</span> ({l.userRole}) - <strong className="text-[#E8630A]">{l.action}</strong>
                  <p className="text-stone-600 mt-0.5">{l.details}</p>
                </div>
                <span className="text-[10px] text-stone-400 font-mono">
                  {new Date(l.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
