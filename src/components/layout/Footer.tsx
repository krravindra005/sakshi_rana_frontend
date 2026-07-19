import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { ShieldAlert, Sparkles, HeartHandshake, EyeOff, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo } = useRouter();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      
      {/* Policy and Safety Banner */}
      <div className="border-b border-slate-800 bg-slate-950/40 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="flex gap-3">
            <div className="p-2 rounded-xl bg-slate-800 text-amber-500 h-fit">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-200">Discreet & Private</h4>
              <p className="text-xs text-slate-500 mt-1">We enforce complete cookie secrecy. We never track your coordinates, search history, or personal identifiers.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="p-2 rounded-xl bg-slate-800 text-indigo-400 h-fit">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-200">100% Non-Explicit</h4>
              <p className="text-xs text-slate-500 mt-1">This prototype has strict anti-pornography guidelines. We showcase only luxury lifestyle social companions.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="p-2 rounded-xl bg-slate-800 text-emerald-400 h-fit">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-200">Anti-Exploitation Policy</h4>
              <p className="text-xs text-slate-500 mt-1">We strictly condemn human trafficking, forced labor, and non-consensual operations. Report suspicious profiles instantly.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          
          {/* Logo & Intro */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white text-slate-950 font-bold">
                <Sparkles className="w-4.5 h-4.5 text-amber-500" />
              </div>
              <span className="text-base font-bold tracking-tight">
                AURA<span className="text-amber-500 font-light text-xs uppercase tracking-widest ml-1">Classifieds</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Aura Classifieds is an elegant, premium, and discreet advertising directory designed for independent mature companions and adult meeting discoveries. All profiles represent verified, consenting independent adults.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-rose-950/30 border border-rose-900/40 rounded-md text-rose-400 text-[10px] font-bold uppercase tracking-wider font-mono">
              <ShieldAlert className="w-3.5 h-3.5" />
              Adults Only 18+
            </div>
          </div>

          {/* Quick Nav Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateTo('/call-girls/delhi')} className="hover:text-white transition">
                  Call Girls Companion
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/massage/mumbai')} className="hover:text-white transition">
                  Massage & Therapists
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/male-escorts/bangalore')} className="hover:text-white transition">
                  Male Escorts
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/transsexual/pune')} className="hover:text-white transition">
                  Transsexual Escorts
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/adult-meetings/delhi')} className="hover:text-white transition">
                  Adult Meetings
                </button>
              </li>
            </ul>
          </div>

          {/* Legal / Policies */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Regulatory & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateTo('/terms')} className="hover:text-white transition">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/privacy')} className="hover:text-white transition">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/safety')} className="hover:text-white transition">
                  Safety & Trust Guidelines
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/report')} className="hover:text-white transition">
                  Report Abuse / Scam
                </button>
              </li>
            </ul>
          </div>

          {/* Support / Contact */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Support & FAQ</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateTo('/safety')} className="hover:text-white transition">
                  How it Works
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/post-ad')} className="hover:text-white transition font-medium text-amber-400 hover:text-amber-300">
                  Advertise with us
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/dashboard')} className="hover:text-white transition">
                  My Advertiser Dashboard
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-600">
          <p>
            &copy; {currentYear} Aura Classifieds. Created as a premium, non-explicit adult-classified UI/UX prototype. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="hover:text-slate-500 transition">Design by Antigravity Agent</span>
            <span>&bull;</span>
            <span className="hover:text-slate-500 transition">Compliant with Section 18 U.S.C. 2257 Mock Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
