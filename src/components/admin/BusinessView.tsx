import React, { useState, useEffect } from 'react';
import { 
  adminPromotionService, 
  adminPaymentService, 
  adminWalletService, 
  adminUserService, 
  AdminPromoProduct 
} from '../../services/admin.service';
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
  Lock,
  Search,
  Mail,
  Phone,
  User as UserIcon
} from 'lucide-react';

interface BusinessViewProps {
  activeRole: string;
}

interface AdminUserOption {
  id: number;
  name: string;
  email: string;
  phone?: string;
  walletBalance: number;
}

export const BusinessView: React.FC<BusinessViewProps> = ({ activeRole }) => {
  const [activeTab, setActiveTab] = useState<'promotions' | 'payments' | 'wallet'>('promotions');
  const [promoProducts, setPromoProducts] = useState<AdminPromoProduct[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Users for manual points adjustment
  const [usersList, setUsersList] = useState<AdminUserOption[]>([]);

  // User Search State (Main Page)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AdminUserOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // User Search State (Modal)
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [modalSearching, setModalSearching] = useState(false);
  const [modalFilteredUsers, setModalFilteredUsers] = useState<AdminUserOption[]>([]);

  // Manual Adjustment Form State
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [targetUserId, setTargetUserId] = useState<number | ''>('');
  const [adjustAmount, setAdjustAmount] = useState<number | string>(250);
  const [adjustDirection, setAdjustDirection] = useState<'credit' | 'debit'>('credit');
  const [adjustReason, setAdjustReason] = useState('Promotional campaign reward credits');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);
  const [adjustSuccess, setAdjustSuccess] = useState<string | null>(null);

  const loadFinanceData = async () => {
    try {
      setLoading(true);
      const [promos, pays, txs, usersRes] = await Promise.all([
        adminPromotionService.getPromoProducts(),
        adminPaymentService.getPayments(),
        adminWalletService.getTransactions(),
        adminUserService.getUsers(1, '')
      ]);

      setPromoProducts(promos || []);
      setPayments(pays || []);
      setTransactions(txs || []);

      const rawUsers = Array.isArray(usersRes) ? usersRes : (usersRes?.data || []);
      const formattedUsers: AdminUserOption[] = rawUsers.map((u: any) => ({
        id: Number(u.id),
        name: u.name || u.profile?.name || u.profile?.display_name || u.email || `User #${u.id}`,
        email: u.email || '',
        phone: u.phone || u.profile?.phone || '',
        walletBalance: Number(u.wallet?.balance ?? u.wallet?.cached_balance ?? 0),
      })).filter((u: AdminUserOption) => !isNaN(u.id));

      setUsersList(formattedUsers);
      setModalFilteredUsers(formattedUsers);
      setTargetUserId(prev => {
        if (prev && formattedUsers.some(u => u.id === prev)) {
          return prev;
        }
        return formattedUsers.length > 0 ? formattedUsers[0].id : '';
      });
    } catch (err) {
      console.error('Failed to load finance data:', err);
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

  // Search User via /search-user API on the Page
  const handlePageUserSearch = async (term: string) => {
    setSearchQuery(term);
    if (!term.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    try {
      setIsSearching(true);
      setHasSearched(true);
      const res = await adminWalletService.searchUser(term.trim());
      const rawUsers = Array.isArray(res) ? res : (res ? [res] : []);
      const formatted: AdminUserOption[] = rawUsers.map((u: any) => ({
        id: Number(u.id),
        name: u.name || u.profile?.name || u.profile?.display_name || u.email || `User #${u.id}`,
        email: u.email || '',
        phone: u.phone || u.profile?.phone || '',
        walletBalance: Number(u.wallet?.cached_balance ?? u.wallet?.balance ?? 0),
      })).filter((u: AdminUserOption) => !isNaN(u.id));

      setSearchResults(formatted);
    } catch (err) {
      console.error('Failed to search user:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Search User via /search-user API in the Modal
  const handleModalUserSearch = async (term: string) => {
    setModalSearchQuery(term);
    if (!term.trim()) {
      setModalFilteredUsers(usersList);
      return;
    }

    try {
      setModalSearching(true);
      const res = await adminWalletService.searchUser(term.trim());
      const rawUsers = Array.isArray(res) ? res : (res ? [res] : []);
      const formatted: AdminUserOption[] = rawUsers.map((u: any) => ({
        id: Number(u.id),
        name: u.name || u.profile?.name || u.profile?.display_name || u.email || `User #${u.id}`,
        email: u.email || '',
        phone: u.phone || u.profile?.phone || '',
        walletBalance: Number(u.wallet?.cached_balance ?? u.wallet?.balance ?? 0),
      })).filter((u: AdminUserOption) => !isNaN(u.id));

      setModalFilteredUsers(formatted);
      if (formatted.length > 0) {
        setTargetUserId(formatted[0].id);
      }
    } catch (err) {
      console.error('Modal user search failed:', err);
      setModalFilteredUsers([]);
    } finally {
      setModalSearching(false);
    }
  };

  const openAdjustModal = (userId?: number) => {
    setAdjustError(null);
    setAdjustSuccess(null);
    setModalSearchQuery('');

    // Combine current user list with any searched users so selected user is available
    const combined = [...usersList];
    for (const s of searchResults) {
      if (!combined.some(u => u.id === s.id)) {
        combined.push(s);
      }
    }
    setModalFilteredUsers(combined);

    if (userId) {
      setTargetUserId(userId);
    } else if (!targetUserId && combined.length > 0) {
      setTargetUserId(combined[0].id);
    }
    setShowAdjustModal(true);
  };

  const selectedUser = modalFilteredUsers.find(u => u.id === Number(targetUserId)) 
    || usersList.find(u => u.id === Number(targetUserId))
    || searchResults.find(u => u.id === Number(targetUserId));
    
  const currentBalance = selectedUser ? selectedUser.walletBalance : 0;
  const numAmount = parseFloat(String(adjustAmount)) || 0;
  const projectedBalance = adjustDirection === 'credit'
    ? currentBalance + numAmount
    : Math.max(0, currentBalance - numAmount);

  const handleWalletAdjustment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAdjustError(null);
    setAdjustSuccess(null);

    const numericUserId = Number(targetUserId);
    if (!numericUserId || isNaN(numericUserId)) {
      setAdjustError('Please select a valid target user.');
      return;
    }

    const numericAmount = parseFloat(String(adjustAmount));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setAdjustError('Please enter a valid points amount greater than 0.');
      return;
    }

    if (adjustDirection === 'debit' && selectedUser && selectedUser.walletBalance < numericAmount) {
      setAdjustError(`Cannot debit ${numericAmount} points. User's available balance is only ${selectedUser.walletBalance} points.`);
      return;
    }

    if (!adjustReason.trim()) {
      setAdjustError('Please provide a justification comment for this ledger entry.');
      return;
    }

    try {
      setIsSubmitting(true);
      await adminWalletService.performWalletAdjustment(
        numericUserId,
        numericAmount,
        adjustDirection,
        adjustReason.trim()
      );

      const actionText = adjustDirection === 'credit' ? 'credited to' : 'debited from';
      setAdjustSuccess(`Successfully ${actionText} user's wallet! Balance has been updated.`);

      // Re-fetch transactions and user balances
      await loadFinanceData();

      setTimeout(() => {
        setShowAdjustModal(false);
        setAdjustSuccess(null);
        setAdjustError(null);
      }, 1500);
    } catch (err: any) {
      console.error('Wallet adjustment failed:', err);
      const msg = err?.errors?.amount?.[0]
        || err?.errors?.user_id?.[0]
        || err?.errors?.direction?.[0]
        || err?.errors?.reason?.[0]
        || err?.message
        || 'Adjustment failed. Please verify the parameters and try again.';
      setAdjustError(msg);
    } finally {
      setIsSubmitting(false);
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
        <div className="flex items-center gap-2 self-end">
          {isAuthorizedForFinance() && (
            <button
              onClick={() => {
                setActiveTab('wallet');
                openAdjustModal();
              }}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm font-mono"
            >
              <Plus size={14} />
              <span>Credit / Debit Points</span>
            </button>
          )}
          <button 
            onClick={loadFinanceData}
            title="Refresh finance data"
            className="p-2 border border-[#E4E7EC] bg-white rounded-xl text-[#667085] hover:text-[#18181B]"
          >
            <RefreshCw size={15} />
          </button>
        </div>
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
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 font-mono">
                          No fiat invoice records found.
                        </td>
                      </tr>
                    ) : (
                      payments.map(pay => (
                        <tr key={pay.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-4 pl-6 font-bold text-slate-500">{pay.id}</td>
                          <td className="p-4 text-[#18181B] font-semibold">
                            {(pay as any).user?.email || (pay as any).userEmail || (pay.userId === 'usr-101' ? 'elena.v@example.com' : `User #${pay.userId}`)}
                          </td>
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
                      ))
                    )}
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
                    onClick={() => openAdjustModal()}
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

              {/* USER SEARCH SECTION */}
              <div className="bg-white border border-[#E4E7EC] rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-[#18181B] flex items-center gap-2">
                      <Search size={16} className="text-rose-600" />
                      <span>User Points & Wallet Lookup</span>
                    </h4>
                    <p className="text-xs text-[#667085] mt-0.5 font-mono">
                      Query user directory via <code className="bg-slate-100 text-rose-700 px-1 py-0.5 rounded text-[11px]">/search-user</code> to inspect current points balance or initiate adjustments.
                    </p>
                  </div>
                  {hasSearched && (
                    <button
                      onClick={() => handlePageUserSearch('')}
                      className="text-xs font-mono text-[#667085] hover:text-rose-600 flex items-center gap-1 self-start sm:self-auto"
                    >
                      <X size={13} />
                      <span>Clear Results</span>
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handlePageUserSearch(e.target.value)}
                    placeholder="Search users by name, email, or phone (e.g. Devon, Elena, admin@gmail.com)..."
                    className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl pl-10 pr-10 py-2.5 text-xs font-mono focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
                  />
                  {isSearching ? (
                    <RefreshCw size={14} className="animate-spin absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-600" />
                  ) : searchQuery ? (
                    <button 
                      onClick={() => handlePageUserSearch('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  ) : null}
                </div>

                {/* Search Feedback and Results */}
                {isSearching && (
                  <p className="text-xs font-mono text-slate-400 py-3 text-center flex items-center justify-center gap-2">
                    <RefreshCw size={13} className="animate-spin text-rose-600" />
                    <span>Searching user directory...</span>
                  </p>
                )}

                {!isSearching && hasSearched && searchResults.length === 0 && (
                  <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-xl text-center space-y-1">
                    <p className="text-xs font-bold text-rose-800">User Not Found</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      No matching user found for &quot;{searchQuery}&quot;. Please check the name, email, or phone and try again.
                    </p>
                  </div>
                )}

                {!isSearching && searchResults.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-mono text-[#667085] font-semibold flex items-center justify-between">
                      <span>Matching Users ({searchResults.length}):</span>
                      <span>Click to credit or debit points</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {searchResults.map((user) => (
                        <div 
                          key={user.id} 
                          className="bg-[#F8F9FC] border border-[#E4E7EC] hover:border-rose-300 rounded-xl p-3.5 flex flex-col justify-between space-y-3 transition-all"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="font-bold text-xs text-[#18181B]">{user.name}</h5>
                                <span className="text-[10px] text-slate-400 font-mono">User ID: #{user.id}</span>
                              </div>
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold text-[10px] font-mono rounded-lg border border-rose-100">
                                {user.walletBalance.toLocaleString()} pts
                              </span>
                            </div>

                            <div className="space-y-0.5 text-[11px] text-[#667085] font-mono">
                              {user.email && (
                                <div className="flex items-center gap-1.5 truncate">
                                  <Mail size={12} className="text-slate-400 shrink-0" />
                                  <span className="truncate">{user.email}</span>
                                </div>
                              )}
                              {user.phone && (
                                <div className="flex items-center gap-1.5 truncate">
                                  <Phone size={12} className="text-slate-400 shrink-0" />
                                  <span className="truncate">{user.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {isAuthorizedForFinance() && (
                            <button
                              onClick={() => openAdjustModal(user.id)}
                              className="w-full py-1.5 px-3 bg-white hover:bg-rose-600 hover:text-white text-[#18181B] border border-[#E4E7EC] rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                            >
                              <Coins size={12} className="text-rose-600" />
                              <span>Credit / Debit Points</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
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
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-400 font-mono">
                            No ledger transactions recorded yet.
                          </td>
                        </tr>
                      ) : (
                        transactions.map(tx => {
                          const isCredit = (tx.direction === 'credit') || (tx.type === 'credit') || (tx.type === 'deposit');
                          const dateVal = tx.created_at || (tx as any).date;
                          const formattedDate = dateVal ? new Date(dateVal).toLocaleString() : 'Recent';
                          const txUser = (tx as any).user;

                          return (
                            <tr key={tx.id || (tx as any).uuid} className="hover:bg-slate-50/60 transition-colors">
                              <td className="p-4 pl-6 font-bold text-slate-500">#{tx.id}</td>
                              <td className="p-4 text-[#667085]">{formattedDate}</td>
                              <td className="p-4 font-sans text-slate-700 font-semibold">
                                <div>{tx.description}</div>
                                {txUser && (
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                    Target User: <span className="text-slate-600 font-medium">{txUser.name}</span> ({txUser.email})
                                  </div>
                                )}
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                  isCredit 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-rose-100 text-rose-700'
                                }`}>
                                  {tx.direction || (isCredit ? 'credit' : 'debit')}
                                </span>
                              </td>
                              <td className={`p-4 font-bold text-sm ${isCredit ? 'text-green-700' : 'text-rose-600'}`}>
                                {isCredit ? '+' : '-'}{Number(tx.amount).toLocaleString()} Credits
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* MANUAL CREDIT/DEBIT ADJ FORM MODAL */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E4E7EC] shadow-2xl p-6 space-y-4 font-mono text-xs">
            
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2 text-rose-600">
                <Coins size={18} />
                <h4 className="font-bold text-base text-[#18181B] font-sans">Credits Ledger manual entry</h4>
              </div>
              <button 
                onClick={() => !isSubmitting && setShowAdjustModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 text-amber-950 p-3 rounded-lg text-[11px] leading-relaxed">
              ⚠️ <strong>Caution:</strong> This posts an immutable, double-entry credits ledger transaction. It cannot be deleted or reversed once committed.
            </div>

            {adjustError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-[11px] flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{adjustError}</span>
              </div>
            )}

            {adjustSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-[11px] flex items-center gap-2">
                <Check size={15} className="shrink-0" />
                <span>{adjustSuccess}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[#667085] font-semibold mb-1">Target User Profile ID:</label>
                
                {/* Search box inside modal */}
                <div className="relative mb-2">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    value={modalSearchQuery}
                    onChange={(e) => handleModalUserSearch(e.target.value)}
                    placeholder="Search user by name, email, or phone..."
                    className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl pl-9 pr-8 py-2 text-xs focus:outline-none focus:border-rose-400 font-mono"
                  />
                  {modalSearching && (
                    <RefreshCw size={13} className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-rose-600" />
                  )}
                </div>

                <select 
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value ? Number(e.target.value) : '')}
                  disabled={isSubmitting}
                  className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400 font-mono"
                >
                  {modalFilteredUsers.length === 0 ? (
                    <option value="">No matching users found</option>
                  ) : (
                    modalFilteredUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email || `ID: ${u.id}`}) — Balance: {u.walletBalance.toLocaleString()} pts
                      </option>
                    ))
                  )}
                </select>
                {selectedUser && (
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 px-1">
                    <span>Current: <strong className="text-slate-800">{currentBalance.toLocaleString()} pts</strong></span>
                    <span>Projected: <strong className={adjustDirection === 'credit' ? 'text-green-700' : 'text-rose-600'}>{projectedBalance.toLocaleString()} pts</strong></span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#667085] mb-1 font-semibold">Adjust direction:</label>
                  <select 
                    value={adjustDirection}
                    onChange={(e) => setAdjustDirection(e.target.value as 'credit' | 'debit')}
                    disabled={isSubmitting}
                    className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400"
                  >
                    <option value="credit">Deposit (Credit)</option>
                    <option value="debit">Deduct (Debit)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#667085] mb-1 font-semibold">Credits Amount:</label>
                  <input 
                    type="number" 
                    min="1"
                    step="any"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#667085] mb-1 font-semibold">Justification Memo / Comment:</label>
                <textarea 
                  rows={3}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl p-3 focus:outline-none focus:border-rose-400"
                  placeholder="State administrative purpose..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#E4E7EC]">
              <button 
                type="button"
                onClick={() => setShowAdjustModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-[#E4E7EC] rounded-xl text-xs font-bold text-[#667085] hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleWalletAdjustment}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Committing...</span>
                  </>
                ) : (
                  <span>Commit Ledger Record</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
