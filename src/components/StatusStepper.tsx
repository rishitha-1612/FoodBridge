import React from 'react';
import { DonationStatus } from '../types';
import { Clock, CheckCircle2, Truck, PackageCheck, UserCheck, Sparkles } from 'lucide-react';

interface StatusStepperProps {
  currentStatus: DonationStatus;
  timeline?: {
    status: DonationStatus;
    timestamp: string;
    updatedBy?: string;
    note?: string;
  }[];
  compact?: boolean;
}

const ALL_STATUSES: DonationStatus[] = [
  'Available',
  'Accepted',
  'Pickup Assigned',
  'Picked Up',
  'Delivered',
  'Completed'
];

export const StatusStepper: React.FC<StatusStepperProps> = ({ currentStatus, timeline = [], compact = false }) => {
  const currentIndex = ALL_STATUSES.indexOf(currentStatus);

  const getStepIcon = (status: DonationStatus, isCompleted: boolean, isCurrent: boolean) => {
    if (isCompleted) {
      return <CheckCircle2 className="w-4 h-4 text-white" />;
    }
    switch (status) {
      case 'Available': return <Clock className={`w-4 h-4 ${isCurrent ? 'text-[#E8630A]' : 'text-stone-400'}`} />;
      case 'Accepted': return <Sparkles className={`w-4 h-4 ${isCurrent ? 'text-[#E8630A]' : 'text-stone-400'}`} />;
      case 'Pickup Assigned': return <UserCheck className={`w-4 h-4 ${isCurrent ? 'text-[#E8630A]' : 'text-stone-400'}`} />;
      case 'Picked Up': return <Truck className={`w-4 h-4 ${isCurrent ? 'text-[#E8630A]' : 'text-stone-400'}`} />;
      case 'Delivered': return <PackageCheck className={`w-4 h-4 ${isCurrent ? 'text-[#E8630A]' : 'text-stone-400'}`} />;
      case 'Completed': return <CheckCircle2 className={`w-4 h-4 ${isCurrent ? 'text-[#E8630A]' : 'text-stone-400'}`} />;
    }
  };

  if (compact) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between relative gap-1">
          {ALL_STATUSES.map((status, index) => {
            const isCompleted = index < currentIndex || currentStatus === 'Completed';
            const isCurrent = index === currentIndex && currentStatus !== 'Completed';

            return (
              <div key={status} className="flex-1 flex flex-col items-center relative group">
                {/* Connecting bar */}
                {index > 0 && (
                  <div 
                    className={`absolute top-3.5 right-[50%] left-[-50%] h-1 -translate-y-1/2 -z-10 transition-all ${
                      index <= currentIndex ? 'bg-[#E8630A]' : 'bg-stone-200'
                    }`}
                  />
                )}
                
                <div 
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted 
                      ? 'bg-[#E8630A] text-white ring-2 ring-[#E8630A]/20' 
                      : isCurrent 
                      ? 'bg-white border-2 border-[#E8630A] text-[#E8630A] ring-4 ring-[#E8630A]/10 animate-pulse' 
                      : 'bg-stone-100 border border-stone-300 text-stone-400'
                  }`}
                >
                  {getStepIcon(status, isCompleted, isCurrent)}
                </div>

                <span className={`text-[11px] font-semibold mt-1 text-center truncate max-w-[70px] ${
                  isCurrent ? 'text-[#E8630A] font-bold' : isCompleted ? 'text-stone-800' : 'text-stone-400'
                }`}>
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
      <h4 className="font-display font-bold text-stone-900 text-base mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#E8630A]"></span>
        Donation Progress Timeline
      </h4>

      <div className="space-y-4">
        {ALL_STATUSES.map((status, index) => {
          const isCompleted = index < currentIndex || currentStatus === 'Completed';
          const isCurrent = index === currentIndex && currentStatus !== 'Completed';

          // find matching timeline log if present
          const timelineEntry = timeline.find(t => t.status === status);

          return (
            <div key={status} className="flex items-start gap-3.5 relative">
              {/* Connecting line */}
              {index < ALL_STATUSES.length - 1 && (
                <div 
                  className={`absolute left-4 top-8 bottom-0 w-0.5 -ml-px ${
                    index < currentIndex ? 'bg-[#E8630A]' : 'bg-stone-200'
                  }`} 
                />
              )}

              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                  isCompleted 
                    ? 'bg-[#E8630A] text-white shadow-xs' 
                    : isCurrent 
                    ? 'bg-orange-50 border-2 border-[#E8630A] text-[#E8630A] ring-4 ring-[#E8630A]/15' 
                    : 'bg-stone-100 border border-stone-200 text-stone-400'
                }`}
              >
                {getStepIcon(status, isCompleted, isCurrent)}
              </div>

              <div className="flex-1 pt-0.5">
                <div className="flex items-center justify-between">
                  <h5 className={`text-sm font-bold ${
                    isCurrent ? 'text-[#E8630A]' : isCompleted ? 'text-stone-900' : 'text-stone-400'
                  }`}>
                    {status}
                    {isCurrent && (
                      <span className="ml-2 text-[11px] font-semibold bg-orange-100 text-[#C2410C] px-2 py-0.5 rounded-full">
                        Current Step
                      </span>
                    )}
                  </h5>
                  {timelineEntry?.timestamp && (
                    <span className="text-xs text-stone-500 font-medium">
                      {new Date(timelineEntry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>

                {timelineEntry?.note && (
                  <p className="text-xs text-stone-600 mt-1 bg-stone-50 border border-stone-100 rounded-lg p-2">
                    <span className="font-semibold text-stone-700">{timelineEntry.updatedBy}: </span>
                    {timelineEntry.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
