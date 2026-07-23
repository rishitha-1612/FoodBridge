export type UserRole = 'restaurant' | 'ngo' | 'volunteer' | 'admin';

export type UserStatus = 'pending' | 'approved' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  organizationName?: string;
  phone?: string;
  address?: string;
  availabilityZone?: string;
  createdAt: string;
}

export type DonationStatus = 
  | 'Available'
  | 'Accepted'
  | 'Pickup Assigned'
  | 'Picked Up'
  | 'Delivered'
  | 'Completed';

export interface Donation {
  id: string;
  restaurantId: string;
  restaurantName: string;
  title: string;
  category: 'cooked_meal' | 'packaged' | 'produce' | 'bakery' | 'other';
  quantity: string; // e.g. "25 meals" or "10 kg"
  expiry: string; // ISO date string or human readable
  pickupAddress: string;
  pickupWindow: string;
  specialNotes?: string;
  status: DonationStatus;
  acceptedByNgoId?: string;
  acceptedByNgoName?: string;
  assignedVolunteerId?: string;
  assignedVolunteerName?: string;
  createdAt: string;
  statusTimeline: {
    status: DonationStatus;
    timestamp: string;
    updatedBy?: string;
    note?: string;
  }[];
}

export interface Assignment {
  id: string;
  donationId: string;
  ngoId: string;
  volunteerId: string;
  assignedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

export interface ImpactStats {
  mealsDonated: number;
  activeNgos: number;
  volunteers: number;
  successfulDeliveries: number;
  foodWastePreventedTons: number;
  activeDonationsCount: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}
