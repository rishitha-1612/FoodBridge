import React from 'react';
import { DonationStatus } from '../types';
import { Sparkles, CheckCircle2, Clock, Truck, PackageCheck, UserCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: DonationStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold gap-1',
    md: 'px-2.5 py-1 text-xs font-bold gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm font-bold gap-2',
  };

  const config: Record<DonationStatus, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
    'Available': {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      icon: <Clock className="w-3.5 h-3.5 text-emerald-600" />
    },
    'Accepted': {
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      border: 'border-amber-200',
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-600" />
    },
    'Pickup Assigned': {
      bg: 'bg-orange-50',
      text: 'text-orange-900',
      border: 'border-orange-200',
      icon: <UserCheck className="w-3.5 h-3.5 text-orange-600" />
    },
    'Picked Up': {
      bg: 'bg-blue-50',
      text: 'text-blue-900',
      border: 'border-blue-200',
      icon: <Truck className="w-3.5 h-3.5 text-blue-600" />
    },
    'Delivered': {
      bg: 'bg-indigo-50',
      text: 'text-indigo-900',
      border: 'border-indigo-200',
      icon: <PackageCheck className="w-3.5 h-3.5 text-indigo-600" />
    },
    'Completed': {
      bg: 'bg-stone-900',
      text: 'text-white',
      border: 'border-stone-800',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
    },
  };

  const style = config[status] || config['Available'];

  return (
    <span className={`inline-flex items-center rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeClasses[size]} transition-all shadow-xs`}>
      {style.icon}
      <span>{status}</span>
    </span>
  );
};
