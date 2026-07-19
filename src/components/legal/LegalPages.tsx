import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { ShieldCheck, ArrowLeft, Terminal } from 'lucide-react';

interface LegalPagesProps {
  type: 'terms' | 'privacy';
}

export const LegalPages: React.FC<LegalPagesProps> = ({ type }) => {
  const { navigateTo } = useRouter();

  const isTerms = type === 'terms';

  return (
    <div className="bg-[#fcfcfd] min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Floating Back Button */}
        <button
          onClick={() => navigateTo('/')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-semibold mb-6 group transition"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition" />
          <span>Back to Marketplace</span>
        </button>

        {/* Paper Layout */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-8 sm:p-12 space-y-6">
          
          <div className="border-b border-slate-100 pb-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              LAST UPDATED: JULY 19, 2026
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {isTerms ? 'Terms and Conditions of Use' : 'Advertiser & Visitor Privacy Policy'}
            </h1>
            <p className="text-xs text-slate-500 mt-2">
              Aura Classifieds &bull; Strictly 18+ Classified Directory
            </p>
          </div>

          {isTerms ? (
            /* TERMS AND CONDITIONS */
            <div className="prose prose-slate text-sm text-slate-600 leading-relaxed space-y-5">
              <p className="font-semibold text-slate-900">
                Welcome to Aura Classifieds. By accessing this platform, you certify under penalty of perjury that you are an adult aged 18 years or older, and you accept these Terms of Service.
              </p>
              
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-base">1. Eligibility Certification</h3>
                <p>
                  You agree that you will not allow any minor under 18 years of age to view this platform. Accessing this directory with false age parameters constitutes a breach of terms, subject to immediate IP access restriction.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-base">2. Non-Solicitation Statement</h3>
                <p>
                  This platform is exclusively a listings directory for independent, self-governed, consenting adult companions. No prostitution, human trafficking, physical exploitation, or pimping activities are promoted. Users must adhere strictly to municipal, local, and country-level legislations.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-base">3. Disclaimer of Liability</h3>
                <p>
                  Aura acts solely as a virtual venue. We do not inspect, represent, hire, or coordinate physical meetings. All agreements, compensation, physical safety audits, and meeting arrangements reside entirely between the independent advertiser and the client.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-base">4. Wallet Credits Refund Policy</h3>
                <p>
                  Advertiser credit deposits are non-refundable. All promotions, featured tags, and verification packages are delivered instantly via virtual credits; credits hold no physical fiat redemption value outside Aura advertising services.
                </p>
              </div>
            </div>
          ) : (
            /* PRIVACY POLICY */
            <div className="prose prose-slate text-sm text-slate-600 leading-relaxed space-y-5">
              <p className="font-semibold text-slate-900">
                Your absolute privacy is our fundamental mandate. Aura is built with custom encryption standards to ensure advertiser records and browser settings remain confidential and secure.
              </p>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-base">1. Minimal Information Collection</h3>
                <p>
                  We gather only the minimum telemetry data required to authorize logins. Independent advertiser portfolios are encrypted. We never lease or sell user indices, phone lists, or search analytics.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-base">2. Browsing Logs</h3>
                <p>
                  We utilize transient session parameters to keep track of your "Favorite Companion" folders locally. These lists stay entirely inside your personal device browser storage and are never uploaded to our main application indices unless you register a publisher profile.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-base">3. Discretion Protocols</h3>
                <p>
                  We recommend that all advertisers utilize encrypted email clients and VPN protocols when logging into the publisher dashboards to guarantee complete network confidentiality.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-base">4. Regulatory Disclosure</h3>
                <p>
                  We will disclose stored account records exclusively when presented with a valid federal court order, subpoena, or official request by anti-trafficking agencies verifying serious child safety violations.
                </p>
              </div>
            </div>
          )}

          {/* Secure lock footer */}
          <div className="border-t border-slate-100 pt-6 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4.5 h-4.5 text-emerald-500" /> End-to-end encrypted ledger</span>
            <span>Aura Security Group</span>
          </div>

        </div>

      </div>
    </div>
  );
};
