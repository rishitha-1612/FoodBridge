import { Donation, User, AuthResponse, ImpactStats, ActivityLog } from '../types';

const TOKEN_KEY = 'foodbridge_jwt_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      setStoredToken(null);
    }
    throw new Error(data.error || 'API request failed');
  }

  return data as T;
}

// Auth API
export const apiAuth = {
  login: (email: string, password: string) => 
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  register: (payload: any) => 
    request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getMe: () => request<User>('/api/auth/me')
};

// Donations API
export const apiDonations = {
  list: (params?: { status?: string; restaurantId?: string; ngoId?: string; volunteerId?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.restaurantId) query.append('restaurantId', params.restaurantId);
    if (params?.ngoId) query.append('ngoId', params.ngoId);
    if (params?.volunteerId) query.append('volunteerId', params.volunteerId);
    if (params?.search) query.append('search', params.search);
    
    return request<Donation[]>(`/api/donations?${query.toString()}`);
  },

  getById: (id: string) => request<Donation>(`/api/donations/${id}`),

  create: (payload: {
    title: string;
    category: string;
    quantity: string;
    expiry: string;
    pickupAddress: string;
    pickupWindow?: string;
    specialNotes?: string;
  }) => request<Donation>('/api/donations', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  update: (id: string, payload: any) => request<Donation>(`/api/donations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),

  delete: (id: string) => request<{ message: string }>(`/api/donations/${id}`, {
    method: 'DELETE'
  }),

  // State machine actions
  accept: (id: string) => request<Donation>(`/api/donations/${id}/accept`, {
    method: 'POST'
  }),

  assignVolunteer: (id: string, volunteerId: string) => request<Donation>(`/api/donations/${id}/assign-volunteer`, {
    method: 'POST',
    body: JSON.stringify({ volunteerId })
  }),

  markPickup: (id: string) => request<Donation>(`/api/donations/${id}/pickup`, {
    method: 'POST'
  }),

  markDeliver: (id: string) => request<Donation>(`/api/donations/${id}/deliver`, {
    method: 'POST'
  }),

  markComplete: (id: string) => request<Donation>(`/api/donations/${id}/complete`, {
    method: 'POST'
  })
};

// Admin API
export const apiAdmin = {
  getDashboard: () => request<{
    totalUsers: number;
    pendingNgos: number;
    activeDonations: number;
    completedDonations: number;
    logs: ActivityLog[];
  }>('/api/admin/dashboard'),

  getUsers: () => request<User[]>('/api/admin/users'),

  approveUser: (id: string) => request<{ message: string }>(`/api/admin/users/${id}/approve`, {
    method: 'PUT'
  }),

  updateUserStatus: (id: string, status: 'approved' | 'pending' | 'suspended') => 
    request<{ message: string }>(`/api/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
};

// Impact Stats & Logs
export const apiImpact = {
  getStats: () => request<ImpactStats>('/api/stats/impact'),
  getActivityLogs: () => request<ActivityLog[]>('/api/activity-logs')
};

// Profile API
export const apiProfile = {
  get: () => request<User>('/api/profile'),
  update: (payload: Partial<User>) => request<User>('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
};
