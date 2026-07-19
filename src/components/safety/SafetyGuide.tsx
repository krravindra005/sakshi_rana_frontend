import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { ShieldAlert, ShieldCheck, HeartHandshake, EyeOff, Lock, HelpCircle, ArrowLeft, Send } from 'lucide-react';

export const SafetyGuide: React.FC = () => {
  const { navigateTo } = useRouter();

  return (
    <div className="bg-[#fcfcfd] min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-bold text-indigo-700 font-mono tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-500 animate-pulse" />
            SAFE & TRUSTED ADVERTISING DIRECTORY
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Trust & Safety Guidelines</h1>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Aura Classifieds maintains a zero-tolerance policy against exploitation, fraud, and illicit coercion. Learn how to browse discreetly and safely.
          </p>
        </div>

        {/* GUIDES GRID */}
        <div className="space-y-6">
          
          {/* Guide Card 1: Consumer safety */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              <span>Precautions for Buyers & Browsers</span>
            </h2>
            <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
              <p>
                <strong>1. Never pay advanced deposits:</strong> Genuine independent companions rarely demand up-front booking fees or digital gift card deposits prior to meeting in-person. Always reject requests for prepayment.
              </p>
              <p>
                <strong>2. Choose safe, neutral public meetups:</strong> Always hold initial greetings in prominent public settings such as a luxury hotel lobby, restaurant, or lounge. Verify details before proceeding to private areas.
              </p>
              <p>
                <strong>3. Share coordinates with a trusted friend:</strong> Inform a contact where you are visiting and establish check-in alerts. Keep your personal telephone charged and coordinates active.
              </p>
            </div>
          </div>

          {/* Guide Card 2: Advertiser safety */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <span>Precautions for Advertisers</span>
            </h2>
            <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
              <p>
                <strong>1. Screen clients thoroughly:</strong> Request verifying social channels or employer proof if appropriate. Trust your instincts and cancel reservations if a caller sounds suspicious.
              </p>
              <p>
                <strong>2. Establish cash/payment rules in advance:</strong> Discuss service expectations, rates, and duration transparently prior to hosting. Never accept suspicious bank wire vouchers.
              </p>
              <p>
                <strong>3. Implement secure 2FA logins:</strong> Guard your Aura advertiser credentials with active mobile authentication to block malicious hijacking.
              </p>
            </div>
          </div>

          {/* Code of Conduct */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-amber-400" />
              <span>Our Legal Code of Conduct</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              This platform adheres to strict federal compliance laws. We actively assist cyber-crime authorities to trace and prosecute actors engaged in child labor exploitation, human trafficking, or non-consensual operations. Any profile flagged for illicit activities is terminated, coordinates logged, and reported immediately.
            </p>
          </div>

          {/* Direct Support Ticket form */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
              <HelpCircle className="w-5 h-5 text-slate-500" />
              <span>Submit a Confidential Support Inquiry</span>
            </h2>
            <form onSubmit={(e) => { e.preventDefault(); alert('Inquiry Sent! Our discreet trust department will reach out in 12 hours.'); }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Your Contact Email</label>
                  <input required type="email" placeholder="confidential@example.com" className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Issue Subject</label>
                  <select required className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none">
                    <option value="abuse">Report abuse / blackmail</option>
                    <option value="scam">Prepayment fraud / scammer</option>
                    <option value="verification">Verification badge assistance</option>
                    <option value="billing">Credit balance & payments</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Message details</label>
                <textarea required rows={4} placeholder="Describe the concern confidentially. Include links to listings if reporting..." className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:outline-none focus:bg-white transition" />
              </div>

              <button type="submit" className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 px-6 rounded-xl transition shadow">
                <Send className="w-3.5 h-3.5" />
                <span>Submit Secure Ticket</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
