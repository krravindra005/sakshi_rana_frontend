import React, { useState, useEffect } from 'react';
import { adminUserService, adminAdService, adminReportService, adminPaymentService, AdminReport } from '../../services/admin.service';
import { User, Payment, WalletTransaction } from '../../types/user';
import { Ad } from '../../types/ad';
import { 
  Search, 
  UserX, 
  UserCheck, 
  AlertTriangle, 
  Mail, 
  Phone, 
  ShieldAlert, 
  Coins, 
  Eye, 
  X, 
  Clock, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  EyeOff
} from 'lucide-react';

interface UsersViewProps {
  activeRole: string;
  onNavigateToTab: (tabId: string, param?: string) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ activeRole, onNavigateToTab }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Detail user states
  const [activeDetailUser, setActiveDetailUser] = useState<User | null>(null);
  const [userTab, setUserTab] = useState<'overview' | 'ads' | 'reports' | 'wallet' | 'payments'>('overview');
  const [userAds, setUserAds] = useState<Ad[]>([]);
  const [userReports, setUserReports] = useState<AdminReport[]>([]);
  const [userPayments, setUserPayments] = useState<Payment[]>([]);

  // Restrictive Modal states
  const [suspendModal, setSuspendModal] = useState<{ id: string; action: 'suspend' | 'ban' | 'unsuspend' } | null>(null);
  const [restrictReason, setRestrictReason] = useState('Suspected deceptive marketplace operations');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const all = await adminUserService.getUsers();
      setUsers(all);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch sub-tab content whenever detail user is selected
  useEffect(() => {
    if (activeDetailUser) {
      // Ads
      adminAdService.getAllAds().then(all => {
        setUserAds(all.filter(a => a.userId === activeDetailUser.id));
      });
      // Reports
      adminReportService.getReports().then(reps => {
        setUserReports(reps.filter(r => r.reportedEntityId === activeDetailUser.id || r.reporter === activeDetailUser.profile.name));
      });
      // Payments
      adminPaymentService.getPayments().then(pays => {
        setUserPayments(pays.filter(p => p.userId === activeDetailUser.id));
      });
    } else {
      setUserAds([]);
      setUserReports([]);
      setUserPayments([]);
    }
  }, [activeDetailUser]);

  // Sensitive data mask checking
  const canViewSensitiveData = () => {
    return ['Super Admin', 'Admin', 'Finance'].includes(activeRole);
  };

  const handleUpdateStatus = async (id: string, status: 'active' | 'suspended', reason: string) => {
    try {
      await adminUserService.updateUserStatus(id, status, reason);
      await fetchUsers();
      if (activeDetailUser?.id === id) {
        const updated = await adminUserService.getUserById(id);
        setActiveDetailUser(updated);
      }
      setSuspendModal(null);
    } catch (err) {
      alert('Error updating user state');
    }
  };

  // Filters logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.profile.phone && user.profile.phone.includes(searchQuery));

    const matchesStatus = !statusFilter || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#18181B]">Platform Users Directory</h2>
          <p className="text-xs text-[#667085] mt-0.5 font-mono">Vetting of advertiser identities, registration histories, and trust ratings</p>
        </div>
        <button 
          onClick={fetchUsers}
          className="p-2 border border-[#E4E7EC] bg-white rounded-xl text-[#667085] hover:text-[#18181B] self-end"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white border border-[#E4E7EC] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-4 items-center">
        
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3 text-slate-400 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by User ID, Name, Email, or Phone..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-rose-400 font-mono"
          />
        </div>

        <select 
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400 font-mono text-[#18181B] w-full sm:w-48"
        >
          <option value="">All User Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>

      </div>

      {/* USER LIST DATAGRID */}
      <div className="bg-white border border-[#E4E7EC] rounded-2xl shadow-xs overflow-hidden">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8F9FC] text-[#667085] uppercase tracking-wider font-mono border-b border-[#E4E7EC] font-bold text-[10px]">
                <th className="p-4 pl-6">Advertiser Name</th>
                <th className="p-4">Secure Credentials</th>
                <th className="p-4">System Role</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Verifications</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right pr-6">Oversight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[#667085] font-mono">
                    Downloading platform user directories...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[#667085] font-mono">
                    No users matched searching queries.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <img 
                            src={user.profile.avatar} 
                            alt={user.profile.name} 
                            className="w-9 h-9 rounded-full object-cover border border-[#E4E7EC]"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex flex-col">
                            <span className="font-bold text-[#18181B]">{user.profile.name}</span>
                            <span className="text-[10px] text-[#667085] font-mono">UID: {user.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-slate-500 max-w-[200px] truncate">
                        {canViewSensitiveData() ? (
                          <>
                            <div className="flex items-center gap-1 text-[#18181B] font-semibold">
                              <Mail size={12} className="text-[#667085]" />
                              <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-[#667085] mt-0.5">
                              <Phone size={12} />
                              <span>{user.profile.phone}</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-1 text-[10px] text-rose-800 bg-rose-50 border border-rose-100 px-2 py-1 rounded">
                            <EyeOff size={11} className="text-rose-600" />
                            <span>Role Masking Active</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 uppercase text-[10px] font-mono font-bold text-slate-600">
                        {user.role}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono ${
                          user.status === 'active'
                            ? 'bg-green-50 text-green-700 border border-green-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="p-4 space-y-1 text-[10px] font-mono font-bold">
                        <div className="flex items-center gap-1">
                          <span className={user.profile.emailVerified ? 'text-green-600' : 'text-slate-400'}>
                            {user.profile.emailVerified ? 'Email ✓' : 'Email ✗'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={user.profile.phoneVerified ? 'text-green-600' : 'text-slate-400'}>
                            {user.profile.phoneVerified ? 'Phone ✓' : 'Phone ✗'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[#667085]">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => { setActiveDetailUser(user); setUserTab('overview'); }}
                            className="p-1.5 border border-[#E4E7EC] text-[#667085] hover:text-[#18181B] bg-white rounded-lg shadow-2xs"
                            title="Audit deep logs"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-4 border-t border-[#E4E7EC] bg-[#F8F9FC] flex items-center justify-between font-mono text-xs">
          <span className="text-[#667085]">
            Showing {(currentPage-1)*itemsPerPage + 1} to {Math.min(currentPage*itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
          </span>

          <div className="flex items-center gap-1.5">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="p-1.5 border border-[#E4E7EC] bg-white text-[#667085] hover:text-[#18181B] rounded-lg disabled:opacity-50"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-bold text-[#18181B]">Page {currentPage} of {totalPages}</span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-1.5 border border-[#E4E7EC] bg-white text-[#667085] hover:text-[#18181B] rounded-lg disabled:opacity-50"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

      </div>

      {/* USER DEEP LOG DRAWER */}
      {activeDetailUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end animate-fade-in">
          <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col animate-slide-right overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-[#E4E7EC] flex items-center justify-between bg-[#F8F9FC]">
              <div className="flex items-center gap-3">
                <img 
                  src={activeDetailUser.profile.avatar} 
                  alt={activeDetailUser.profile.name} 
                  className="w-12 h-12 rounded-full border border-[#E4E7EC] object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="font-bold text-[#18181B] text-base">{activeDetailUser.profile.name}</h3>
                  <p className="text-xs text-[#667085] font-mono mt-0.5">ID: {activeDetailUser.id} • Status: <span className="text-rose-700 font-bold uppercase">{activeDetailUser.status}</span></p>
                </div>
              </div>
              <button 
                onClick={() => setActiveDetailUser(null)}
                className="p-1.5 border border-[#E4E7EC] bg-white text-[#667085] hover:text-[#18181B] rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick action bar */}
            <div className="bg-rose-50/50 border-b border-[#E4E7EC] px-6 py-3 flex items-center justify-between gap-3 font-mono text-xs">
              <span>Account Administration:</span>
              <div className="flex gap-2">
                {activeDetailUser.status !== 'suspended' && (
                  <button 
                    onClick={() => setSuspendModal({ id: activeDetailUser.id, action: 'suspend' })}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg flex items-center gap-1 transition-all"
                  >
                    <UserX size={13} />
                    <span>Suspend</span>
                  </button>
                )}
                {activeDetailUser.status !== 'active' && (
                  <button 
                    onClick={() => setSuspendModal({ id: activeDetailUser.id, action: 'unsuspend' })}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg flex items-center gap-1 transition-all"
                  >
                    <UserCheck size={13} />
                    <span>Re-activate</span>
                  </button>
                )}
                {activeDetailUser.status !== 'banned' && (
                  <button 
                    onClick={() => setSuspendModal({ id: activeDetailUser.id, action: 'ban' })}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg flex items-center gap-1 transition-all"
                  >
                    <AlertTriangle size={13} />
                    <span>Ban Permanent</span>
                  </button>
                )}
              </div>
            </div>

            {/* TABS HEADERS */}
            <div className="px-6 border-b border-[#E4E7EC] flex gap-4 bg-[#F8F9FC]/40">
              {[
                { id: 'overview', label: 'Identity Overview' },
                { id: 'ads', label: `Published Ads (${userAds.length})` },
                { id: 'reports', label: `Linked Reports (${userReports.length})` },
                { id: 'payments', label: `Payments Ledger (${userPayments.length})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setUserTab(tab.id as any)}
                  className={`py-3 text-xs font-bold border-b-2 transition-all font-mono ${
                    userTab === tab.id 
                      ? 'border-rose-600 text-rose-600' 
                      : 'border-transparent text-[#667085] hover:text-[#18181B]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {userTab === 'overview' && (
                <div className="space-y-6 text-xs font-mono">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-[#E4E7EC] rounded-xl bg-[#F8F9FC] space-y-2">
                      <h5 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-3">Core Identity Registry</h5>
                      <div>
                        <span className="text-[#667085] block">Full Name:</span>
                        <strong className="text-slate-800 text-sm font-sans">{activeDetailUser.profile.name}</strong>
                      </div>
                      <div>
                        <span className="text-[#667085] block">Email ID:</span>
                        <strong className="text-slate-800 font-sans">{canViewSensitiveData() ? activeDetailUser.email : 'Masked (Unauthorized)'}</strong>
                      </div>
                      <div>
                        <span className="text-[#667085] block">Mobile Number:</span>
                        <strong className="text-slate-800">{canViewSensitiveData() ? activeDetailUser.profile.phone : 'Masked (Unauthorized)'}</strong>
                      </div>
                    </div>

                    <div className="p-4 border border-[#E4E7EC] rounded-xl bg-[#F8F9FC] space-y-2">
                      <h5 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-3">System Access logs</h5>
                      <div>
                        <span className="text-[#667085] block">Joined On:</span>
                        <strong className="text-slate-800">{new Date(activeDetailUser.createdAt).toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-[#667085] block">System Role:</span>
                        <strong className="text-rose-700 uppercase">{activeDetailUser.role}</strong>
                      </div>
                      <div>
                        <span className="text-[#667085] block">Compliance Posts:</span>
                        <strong className="text-slate-800">{userAds.length} total</strong>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {userTab === 'ads' && (
                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-[#667085] uppercase tracking-wider font-mono">Published Marketplace Advertisements</h5>
                  
                  {userAds.length === 0 ? (
                    <p className="text-xs text-slate-400 font-mono">No advertisements created by this user yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userAds.map(ad => (
                        <div key={ad.id} className="p-3 border border-[#E4E7EC] rounded-xl flex gap-3 hover:bg-[#F8F9FC]">
                          <img 
                            src={ad.profileImage || ad.images[0]} 
                            alt={ad.profileName} 
                            className="w-12 h-12 object-cover rounded-lg border border-[#E4E7EC]"
                            referrerPolicy="no-referrer"
                          />
                          <div className="text-xs min-w-0">
                            <h6 className="font-bold text-[#18181B] truncate">{ad.title}</h6>
                            <p className="text-[10px] text-[#667085] font-mono">ID: {ad.id} • Views: {ad.viewsCount}</p>
                            <span className="mt-1 inline-block px-1.5 py-0.5 rounded text-[9px] font-bold font-mono uppercase bg-green-50 text-green-700">
                              {ad.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {userTab === 'reports' && (
                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-[#667085] uppercase tracking-wider font-mono">Compliance & Trust watch report flags</h5>
                  
                  {userReports.length === 0 ? (
                    <p className="text-xs text-slate-400 font-mono">No abuse or identity warnings triggered on this account.</p>
                  ) : (
                    <div className="space-y-3 font-mono text-xs">
                      {userReports.map(r => (
                        <div key={r.id} className="p-3 border border-rose-100 bg-rose-50/50 rounded-xl">
                          <div className="flex justify-between font-bold">
                            <span className="text-rose-700">{r.id}</span>
                            <span className="uppercase text-[9px] bg-rose-100 text-rose-800 px-1.5 rounded">{r.status}</span>
                          </div>
                          <p className="mt-1 font-bold text-[#18181B]">{r.reason}</p>
                          <p className="text-[#667085] text-[11px] italic mt-0.5">"{r.description}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {userTab === 'payments' && (
                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-[#667085] uppercase tracking-wider font-mono">Secure Fiat Payments Ledger</h5>
                  
                  {userPayments.length === 0 ? (
                    <p className="text-xs text-slate-400 font-mono">No transaction records registered.</p>
                  ) : (
                    <div className="overflow-x-auto border border-[#E4E7EC] rounded-xl">
                      <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead>
                          <tr className="bg-[#F8F9FC] text-[#667085] uppercase font-bold text-[9px] border-b">
                            <th className="p-3">Order ID</th>
                            <th className="p-3">Method</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Post Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E4E7EC]">
                          {userPayments.map(p => (
                            <tr key={p.id}>
                              <td className="p-3 text-slate-500">{p.orderId}</td>
                              <td className="p-3">{p.paymentMethod}</td>
                              <td className="p-3 font-bold text-slate-800">₹{p.amount}</td>
                              <td className="p-3">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${p.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                                  {p.paymentStatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* SUSPEND / BAN CONFIRMATION MODAL */}
      {suspendModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E4E7EC] shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle size={24} className="animate-pulse" />
              <h4 className="font-bold text-base text-[#18181B] capitalize">Confirm administrative {suspendModal.action}</h4>
            </div>

            <p className="text-xs text-[#667085] leading-relaxed">
              You are changing active credentials posture of user <strong>{suspendModal.id}</strong>. This triggers direct IP access flags suspension.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <label className="block text-[#667085]">Compulsory audit action reason:</label>
              <textarea 
                rows={3}
                placeholder="State details for the ban or suspension audit registry..."
                value={restrictReason}
                onChange={(e) => setRestrictReason(e.target.value)}
                className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl p-3 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#E4E7EC]">
              <button 
                onClick={() => setSuspendModal(null)}
                className="px-4 py-2 border border-[#E4E7EC] rounded-xl text-xs font-bold text-[#667085] hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  const targetStatus = suspendModal.action === 'unsuspend' ? 'active' : 'suspended';
                  handleUpdateStatus(suspendModal.id, targetStatus, restrictReason);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
              >
                Confirm State Mandate
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
