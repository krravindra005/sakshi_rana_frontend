import React, { useState, useEffect } from 'react';
import { ShieldAlert, Check, X } from 'lucide-react';

interface AgeGateProps {
  onConfirm: () => void;
  onReject: () => void;
  onPageChange: (path: string) => void;
}

export const AgeGate: React.FC<AgeGateProps> = ({ onConfirm, onReject, onPageChange }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isConfirmed = localStorage.getItem('age_confirmed_18');
    if (!isConfirmed) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('age_confirmed_18', 'true');
    setIsVisible(false);
    onConfirm();
  };

  const handleDecline = () => {
    onReject();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div 
        id="age-gate-container"
        className="w-full max-w-lg overflow-hidden bg-white border border-slate-100 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300"
      >
        {/* Banner Indicator */}
        <div className="flex justify-center py-6 bg-slate-900 text-amber-400">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
            <span className="text-sm font-semibold tracking-wider uppercase font-mono">18+ Age Verification Required</span>
          </div>
        </div>

        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-3">
            Adult Content & Classifieds Access
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            This website is a premium adult-classified directory containing services and companion advertisements intended exclusively for mature audiences. You must be at least <strong className="text-slate-900">18 years of age</strong> or the age of majority in your jurisdiction to view these materials.
          </p>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500 text-left mb-6 leading-relaxed">
            By entering, you certify that you are over 18, agree to browse discreetly, and consent to our terms and cookie privacy policies. All escort names, profiles, and services shown are fictional mock representations.
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              id="age-gate-btn-accept"
              onClick={handleAccept}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition duration-200 shadow-sm"
            >
              <Check className="w-4 h-4" />
              I am 18 or older
            </button>
            <button
              id="age-gate-btn-decline"
              onClick={handleDecline}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition duration-200"
            >
              <X className="w-4 h-4" />
              Exit Website
            </button>
          </div>

          <div className="flex justify-center gap-4 text-xs font-medium text-slate-400">
            <button 
              onClick={() => onPageChange('/terms')} 
              className="hover:text-slate-600 underline transition"
            >
              Terms & Conditions
            </button>
            <span>&bull;</span>
            <button 
              onClick={() => onPageChange('/privacy')} 
              className="hover:text-slate-600 underline transition"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
