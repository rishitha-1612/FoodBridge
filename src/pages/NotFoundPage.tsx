import React from 'react';
import { HeartHandshake, ArrowLeft, Utensils } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (page: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-md mx-auto my-16 px-4 text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-orange-100 text-[#E8630A] flex items-center justify-center mx-auto shadow-inner">
        <Utensils className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-[#E8630A] uppercase tracking-widest">Error 404</span>
        <h1 className="font-cause font-extrabold text-4xl text-stone-900">Page Not Found</h1>
        <p className="text-stone-600 text-sm leading-relaxed">
          The page or route you requested doesn't exist on FoodBridge. Let's get you back to the platform.
        </p>
      </div>

      <button
        onClick={() => onNavigate('home')}
        className="px-6 py-3 rounded-2xl bg-[#E8630A] hover:bg-[#C2410C] text-white font-bold text-sm shadow-md transition-all inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </button>
    </div>
  );
};
