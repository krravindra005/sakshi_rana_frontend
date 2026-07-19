import React, { useState, useEffect } from 'react';
import { adminPromotionService, adminPaymentService, adminWalletService, AdminPromoProduct } from '../../services/admin.service';
import { Payment, WalletTransaction } from '../../types/user';
import { 
  Sparkles, 
  Coins, 
  DollarSign, 
  Plus, 
  Check, 
  X, 
  AlertCircle, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Eye,
  Lock
} from 'lucide-react';

interface BusinessViewProps {
  activeRole: string;
}

export const BusinessView: React.FC<BusinessViewProps> = ({ activeRole }) => {
  const [activeTab, setActiveTab] = useState<'promotions' | 'payments' | 'wallet'>('promotions');
  const [promoProducts, setPromoProducts] = useState<AdminPromoProduct[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual Adjustment Form State
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [targetUserId, setTargetUserId] = useState('usr-101');
  const [adjustAmount, setAdjustAmount] = useState(250);
  const [adjustDirection, setAdjustDirection] = useState<'credit' | 'debit'>('credit');
  const [adjustReason, setAdjustReason] = useState('Promotional campaign reward credits');

  const loadFinanceData = async () => {
    try {
      setLoading(true);
      const [promos, pays, txs] = await Promise.all([
        adminPromotionService.getPromoProducts(),
        adminPaymentService.getPayments(),
        adminWalletService.getTransactions()
      ]);

      setPromoProducts(promos);
      setPayments(pays);
      setTransactions(txs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  const handleTogglePromo = async (id: string, currentStatus: 'active' | 'inactive') => {
    try {
      const next = currentStatus === 'active' ? 'inactive' : 'active';
      await adminPromotionService.updatePromoProductStatus(id, next);
      await loadFinanceData();
    } catch (err) {
      alert('Error toggling status');
    }
  };

  const handleWalletAdjustment = async () => {
    try {
      await adminWalletService.performWalletAdjustment(targetUserId, adjustAmount, adjustDirection, adjustReason);
      setShowAdjustModal(false);
      await loadFinanceData();
    } catch (err) {
      alert('Adjustment failed');
    }
  };

  // Vetting Finance authorizations
  const isAuthorizedForFinance = () => {
    return ['Super Admin', 'Admin', 'Finance'].includes(activeRole);
  };

  return (
    <div className="space-y-6">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#18181B]">Financial Control Deck</h2>
          <p className="text-xs text-[#667085] mt-0.5 font-mono font-semibold uppercase tracking-wider text-rose-700">Business, promotion packages, and credits ledger ledger audits</p>
        </div>
        <button 
          onClick={loadFinanceData}
          className="p-2 border border-[#E4E7EC] bg-white rounded-xl text-[#667085] hover:text-[#18181B] self-end"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* CORE FINANCE SUB-TABS */}
      <div className="flex border-b border-[#E4E7EC] gap-4 bg-white p-2 rounded-2xl border">
        {[
          { id: 'promotions', label: 'Exposure Packages', icon: Sparkles },
          { id: 'payments', label: 'Fiat Invoices', icon: DollarSign },
          { id: 'wallet', label: 'Credits Ledger', icon: Coins },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold font-mono rounded-xl transition-all ${
                activeTab === tab.id 
                  ? 'bg-rose-600 text-white shadow-sm' 
                  : 'text-[#667085] hover:bg-[#F8F9FC] hover:text-[#18181B]'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="text-xs font-mono text-slate-400 p-8 text-center">Syncing secure business ledgers...</p>
      ) : (
        <div className="space-y-6">
          
          {/* TAB 1: PROMOTIONS */}
          {activeTab === 'promotions' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {promoProducts.map(product => (
                <div key={product.id} className="bg-white border border-[#E4E7EC] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-[#18181B] text-sm">{product.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">Slug: {product.slug}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono ${
                        product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {product.status}
                      </span>
                    </div>

                    <div className="p-3 bg-[#F8F9FC] rounded-xl border font-mono text-xs space-y-1">
                      <span className="text-[#667085] text-[10px] block font-bold uppercase tracking-wide">Placements Layout:</span>
                      <strong className="text-slate-800">{product.placementType}</strong>
                    </div>

                    {/* Durations */}
                    <div className="space-y-1.5 font-mono text-xs">
                      <span className="text-[10px] font-bold text-[#667085] block uppercase">Standard Pricing Matrix:</span>
                      {product.durations.map((dur, i) => (
                        <div key={i} className="flex justify-between border-b border-dashed border-[#E4E7EC] py-1">
                          <span>{dur.days} Days</span>
                          <strong className="text-[#18181B]">{dur.price} Credits</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleTogglePromo(product.id, product.status)}
                    className={`mt-6 w-full py-2 text-xs font-bold rounded-xl transition-all border ${
                      product.status === 'active' 
                        ? 'border-rose-200 text-rose-700 hover:bg-rose-50' 
                        : 'border-green-200 text-green-700 hover:bg-green-50'
                    }`}
                  >
                    {product.status === 'active' ? 'Deactivate Package' : 'Activate Package'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: FIAT INVOICES */}
          {activeTab === 'payments' && (
            <div className="bg-white border border-[#E4E7EC] rounded-2xl shadow-xs overflow-hidden">
              <div className="p-5 border-b border-[#E4E7EC] flex justify-between items-center bg-[#F8F9FC]/40">
                <div>
                  <h4 className="text-sm font-bold text-[#18181B]">Fiat Invoices & Gateway Ingress</h4>
                  <p className="text-[11px] text-[#667085] mt-0.5 font-mono">Incoming wallet credit purchases verified via instant webhooks</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F8F9FC] text-[#667085] uppercase tracking-wider font-mono border-b border-[#E4E7EC] font-bold text-[10px]">
                      <th className="p-4 pl-6">Invoice ID</th>
                      <th className="p-4">User Email</th>
                      <th className="p-4">Provider / Channel</th>
                      <th className="p-4">Transaction Reference</th>
                      <th className="p-4">Fiat Volume</th>
                      <th className="p-4">Webhook Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E7EC] font-mono">
                    {payments.map(pay => (
                      <tr key={pay.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4 pl-6 font-bold text-slate-500">{pay.id}</td>
                        <td className="p-4 text-[#18181B] font-semibold">{pay.userId === 'usr-101' ? 'elena.v@example.com' : 'serena.gomez@example.com'}</td>
                        <td className="p-4">{pay.paymentMethod}</td>
                        <td className="p-4 text-slate-400">{pay.transactionId}</td>
                        <td className="p-4 text-[#18181B] font-bold">₹{pay.amount} {pay.currency}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            pay.paymentStatus === 'completed' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            {pay.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CREDITS LEDGER & ADJS */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              
              {/* Vetting authorization alerts */}
              <div className="bg-white border border-[#E4E7EC] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="font-mono text-xs">
                  <h4 className="font-bold text-[#18181B] flex items-center gap-1.5 text-sm">
                    <Coins size={16} className="text-rose-600" />
                    <span>Immutable Credits Ledger Console</span>
                  </h4>
                  <p className="text-[#667085] mt-1">Manual account adjustments require authoritative Finance credentials and audit justification comments.</p>
                </div>
                
                {isAuthorizedForFinance() ? (
                  <button 
                    onClick={() => setShowAdjustModal(true)}
                    className="px-4 py-2 bg-[#18181B] hover:bg-rose-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm font-mono"
                  >
                    <Plus size={14} />
                    <span>Post Manual Credit Entry</span>
                  </button>
                ) : (
                  <div className="px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl text-rose-950 font-mono text-xs flex items-center gap-2">
                    <Lock size={14} className="text-rose-600" />
                    <span>Ledger Adjustment Locked (Auth mask)</span>
                  </div>
                )}
              </div>

              {/* Transactions grid list */}
              <div className="bg-white border border-[#E4E7EC] rounded-2xl shadow-xs overflow-hidden">
                <div className="p-5 border-b border-[#E4E7EC] bg-[#F8F9FC]/40">
                  <h4 className="text-sm font-bold text-[#18181B]">Credits Ledger Registry</h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F8F9FC] text-[#667085] uppercase tracking-wider font-mono border-b border-[#E4E7EC] font-bold text-[10px]">
                        <th className="p-4 pl-6">ID</th>
                        <th className="p-4">Time stamp</th>
                        <th className="p-4">Audit Memo / Description</th>
                        <th className="p-4">Credits Direction</th>
                        <th className="p-4">Credits Ledger Weight</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E7EC] font-mono">
                      {transactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-4 pl-6 font-bold text-slate-500">{tx.id}</td>
                          <td className="p-4 text-[#667085]">{new Date(tx.date).toLocaleString()}</td>
                          <td className="p-4 font-sans text-slate-700 font-semibold">{tx.description}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                              tx.type === 'credit' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-rose-100 text-rose-700'
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className={`p-4 font-bold text-sm ${tx.type === 'credit' ? 'text-green-700' : 'text-rose-600'}`}>
                            {tx.type === 'credit' ? '+' : '-'}{tx.amount} Credits
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* MANUAL CREDIT ADJ FORM MODAL */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E4E7EC] shadow-2xl p-6 space-y-4 font-mono text-xs">
            
            <div className="flex items-center gap-2 text-rose-600 border-b pb-2">
              <Coins size={18} />
              <h4 className="font-bold text-base text-[#18181B] font-sans">Credits Ledger manual entry</h4>
            </div>

            <div className="bg-amber-50 border border-amber-200 text-amber-950 p-3 rounded-lg text-[11px] leading-relaxed">
              ⚠️ <strong>Caution:</strong> This posts an immutable, double-entry credits ledger transaction. It cannot be deleted or reversed once committed.
            </div>

            <div className="space-y-3">
              <label className="block text-[#667085]">Target User Profile ID:</label>
              <select 
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none"
              >
                <option value="usr-101">Elena Vance (usr-101)</option>
                <option value="usr-103">Serena Gomez (usr-103)</option>
              </select>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#667085] mb-1">Adjust direction:</label>
                  <select 
                    value={adjustDirection}
                    onChange={(e) => setAdjustDirection(e.target.value as any)}
                    className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="credit">Deposit (Credit)</option>
                    <option value="debit">Deduct (Debit)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#667085] mb-1">Credits Amount:</label>
                  <input 
                    type="number" 
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <label className="block text-[#667085] mt-2">Justification Memo / Comment:</label>
              <textarea 
                rows={3}
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl p-3 focus:outline-none focus:border-rose-400"
                placeholder="State administrative purpose..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#E4E7EC]">
              <button 
                onClick={() => setShowAdjustModal(false)}
                className="px-4 py-2 border border-[#E4E7EC] rounded-xl text-xs font-bold text-[#667085]"
              >
                Cancel
              </button>
              <button 
                onClick={handleWalletAdjustment}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
              >
                Commit Ledger Record
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
