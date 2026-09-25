import React, { useState, useEffect } from 'react';
import { adminReportService, AdminReport, adminAdService, adminUserService } from '../../services/admin.service';
import { Ad } from '../../types/ad';
import { User } from '../../types/user';
import { 
  ShieldAlert, 
  UserCheck, 
  Check, 
  X, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  MoreVertical,
  Activity
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
  
  // Filtering
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Context loading
  const [linkedAd, setLinkedAd] = useState<Ad | null>(null);
  const [linkedUser, setLinkedUser] = useState<User | null>(null);

  // Notes Modal
  const [actionModal, setActionModal] = useState<{ id: string; action: 'resolve' | 'dismiss' } | null>(null);
  const [actionNotes, setActionNotes] = useState('Compliance standards evaluated. No violation found.');

  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const all = await adminReportService.getReports(statusFilter || undefined);
      setReports(all);
      if (all.length > 0) {
        setSelectedReport(prev => (prev ? all.find(r => r.id === prev.id) || all[0] : all[0]));
      } else {
        setSelectedReport(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  useEffect(() => {
    if (selectedReport) {
      if (selectedReport.ad) {
        setLinkedAd(selectedReport.ad);
        setLinkedUser(null);
      } else if (selectedReport.reportedUser) {
        setLinkedUser(selectedReport.reportedUser);
        setLinkedAd(null);
      } else if (selectedReport.entityType === 'AD' && selectedReport.reportedEntityId) {
        adminAdService.getAdById(selectedReport.reportedEntityId)
          .then(ad => { setLinkedAd(ad); setLinkedUser(null); })
          .catch(() => setLinkedAd(null));
      } else if (selectedReport.reportedEntityId) {
        adminUserService.getUserById(selectedReport.reportedEntityId)
          .then(usr => { setLinkedUser(usr); setLinkedAd(null); })
          .catch(() => setLinkedUser(null));
      }
    } else {
      setLinkedAd(null);
      setLinkedUser(null);
    }
  }, [selectedReport]);

  const handleAssignToMe = async (id: string) => {
    try {
      setIsProcessing(true);
      await adminReportService.claimReport(id);
      showNotification(`Ticket #${id} claimed successfully.`);
      await fetchReports();
    } catch (err: any) {
      showNotification(err?.message || 'Error claiming report', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolveDismiss = async () => {
    if (!actionModal || isProcessing) return;
    try {
      setIsProcessing(true);
      await adminReportService.updateReportStatus(actionModal.id, actionModal.action === 'resolve' ? 'resolved' : 'dismissed', actionNotes);
      showNotification(`Report #${actionModal.id} has been marked as ${actionModal.action === 'resolve' ? 'resolved' : 'dismissed'}.`);
      setActionModal(null);
      setActionNotes('');
      await fetchReports();
    } catch (err: any) {
      showNotification(err?.message || 'Error updating report status', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filters logic
  const filteredReports = reports.filter(r => {
    const matchesPriority = !priorityFilter || r.priority === priorityFilter;
    return matchesPriority;
  });

  return (
    <div className="space-y-6">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#18181B]">Abuse & Safety Report Center</h2>
          <p className="text-xs text-[#667085] mt-0.5 font-mono">Investigate user reports, flag intellectual breaches, and enforce marketplace rules</p>
        </div>
        <button 
          onClick={fetchReports}
          disabled={loading || isProcessing}
          className="p-2 border border-[#E4E7EC] bg-white rounded-xl text-[#667085] hover:text-[#18181B] self-end flex items-center gap-1.5 font-mono text-xs disabled:opacity-50"
          title="Refresh reports"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Sync Reports</span>
        </button>
      </div>

      {/* FEEDBACK NOTIFICATION BANNER */}
      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-mono border flex items-center gap-2.5 transition-all ${
          feedback.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {feedback.type === 'success' ? <Check size={16} className="text-green-600 flex-shrink-0" /> : <AlertTriangle size={16} className="text-rose-600 flex-shrink-0" />}
          <span className="font-semibold">{feedback.message}</span>
        </div>
      )}

      {/* FILTER CHEVRON */}
      <div className="bg-white border border-[#E4E7EC] rounded-2xl p-4 shadow-xs flex flex-wrap gap-4 items-center">
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400 font-mono text-[#18181B]"
        >
          <option value="">All Resolution Statuses</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>

        <select 
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400 font-mono text-[#18181B]"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {reports.length === 0 ? (
        <p className="text-xs font-mono text-slate-400 p-8 text-center bg-white rounded-2xl border border-[#E4E7EC]">No reports currently on file.</p>
      ) : (
        /* DOUBLE COLUMN LIST AND DETAIL SPLIT SCREEN */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* LEFT: REPORT LIST QUEUE */}
          <div className="lg:col-span-2 bg-white border border-[#E4E7EC] rounded-2xl p-4 shadow-xs flex flex-col gap-3 h-[600px] overflow-hidden">
            <h4 className="text-xs font-bold text-[#667085] uppercase tracking-wider font-mono px-1">Safety Tickets ({filteredReports.length})</h4>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {filteredReports.map(rep => {
                const isSelected = selectedReport?.id === rep.id;
                return (
                  <button
                    key={rep.id}
                    onClick={() => setSelectedReport(rep)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-2 relative ${
                      isSelected 
                        ? 'bg-rose-50/50 border-rose-200 text-rose-800' 
                        : 'border-[#E4E7EC] bg-white hover:bg-[#F8F9FC] text-[#667085]'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="font-bold text-rose-700">{rep.id}</span>
                      <span className={`px-2 py-0.5 rounded uppercase font-bold ${
                        rep.priority === 'high' || rep.priority === 'critical' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {rep.priority}
                      </span>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-[#18181B] truncate">{rep.reason}</h5>
                      <span className="text-[10px] font-mono mt-0.5 text-slate-400 block">Reported: {rep.entityType} ID: {rep.reportedEntityId}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: REPORT DETAIL CONTEXT PANEL */}
          {selectedReport && (
            <div className="lg:col-span-3 bg-white border border-[#E4E7EC] rounded-2xl p-6 shadow-xs flex flex-col justify-between h-[600px] overflow-y-auto scrollbar-thin">
              
              <div className="space-y-6">
                {/* Title Box */}
                <div className="border-b pb-4 flex justify-between items-start gap-4">
                  <div>
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold font-mono uppercase">
                      TICKET DETAIL ({selectedReport.status})
                    </span>
                    <h3 className="text-base font-bold text-[#18181B] mt-1">{selectedReport.reason}</h3>
                  </div>
                  
                  {/* Status pills */}
                  <div className="flex gap-2 font-mono text-xs">
                    {!selectedReport.assignedModerator ? (
                      <button 
                        onClick={() => handleAssignToMe(selectedReport.id)}
                        className="px-3 py-1 border border-rose-300 hover:bg-rose-50 rounded-lg text-rose-700 font-bold transition-all flex items-center gap-1"
                      >
                        <UserCheck size={13} />
                        <span>Claim ticket</span>
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-bold">
                        Owner: {selectedReport.assignedModerator}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Claim detail description */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider font-mono block">Reporter Claim Statement:</span>
                  <div className="p-4 border border-slate-200 bg-slate-50 rounded-xl text-xs leading-relaxed text-[#18181B] italic">
                    "{selectedReport.description}"
                  </div>
                  <div className="text-[10px] font-mono text-[#667085] text-right">
                    Submitted by: <strong className="text-slate-800">{selectedReport.reporterName || 'Anonymous User'}</strong>
                  </div>
                </div>

                {/* Linked Content Preview */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider font-mono block">Reported Marketplace Entity Context:</span>
                  
                  {linkedAd && (
                    <div className="p-4 border border-[#E4E7EC] rounded-xl flex gap-3.5 bg-[#F8F9FC] items-center">
                      <img 
                        src={linkedAd.profileImage || (linkedAd.images && linkedAd.images[0]) || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600'} 
                        alt={linkedAd.profileName || linkedAd.title} 
                        className="w-12 h-12 object-cover rounded-lg border flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-xs min-w-0 flex-1">
                        <h6 className="font-bold text-[#18181B] truncate">{linkedAd.title}</h6>
                        <span className="text-[10px] font-mono text-[#667085] block mt-0.5">
                          Category: {linkedAd.categorySlug || 'Escorts'} • City: {linkedAd.citySlug || 'India'}
                        </span>
                        <span className="inline-block px-1.5 py-0.5 bg-green-50 text-green-700 font-bold text-[9px] uppercase rounded-md mt-1.5">
                          Status: {linkedAd.status}
                        </span>
                      </div>
                    </div>
                  )}

                  {linkedUser && (
                    <div className="p-4 border border-[#E4E7EC] rounded-xl flex gap-3 bg-[#F8F9FC] items-center">
                      <img 
                        src={linkedUser.profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(linkedUser.name || 'User')}&background=random`} 
                        alt={linkedUser.profile?.name || linkedUser.name || 'User'} 
                        className="w-10 h-10 rounded-full object-cover border"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-xs min-w-0 font-mono">
                        <h6 className="font-bold text-[#18181B] font-sans">{linkedUser.profile?.name || linkedUser.name}</h6>
                        <span className="text-[10px] text-slate-500 block truncate">{linkedUser.email}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Joined: {linkedUser.profile?.joinedAt || 'Recently'} • Status: <strong className="text-green-700 capitalize">{linkedUser.status}</strong></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Resolution Notes log if already processed */}
                {selectedReport.notes && (
                  <div className="p-4 bg-green-50/60 border border-green-200 text-green-950 text-xs rounded-xl font-mono">
                    <strong>Resolution Decision:</strong> "{selectedReport.notes}"
                  </div>
                )}

                {/* Live Case Timeline */}
                <div className="space-y-3 border-t pt-4">
                  <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider font-mono block">Interactive Case Timeline</span>
                  <div className="relative border-l-2 border-[#E4E7EC] ml-3 pl-4 space-y-4 text-xs font-mono">
                    <div className="relative">
                      <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-rose-600" />
                      <div className="text-slate-400 text-[10px]">{new Date(selectedReport.createdAt).toLocaleString()}</div>
                      <div className="font-bold text-slate-800">Abuse report submitted</div>
                    </div>
                    {selectedReport.assignedModerator && (
                      <div className="relative">
                        <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-slate-600" />
                        <div className="text-slate-400 text-[10px]">{new Date(selectedReport.createdAt).toLocaleString()}</div>
                        <div className="font-bold text-slate-800">Claimed by Moderator: {selectedReport.assignedModerator}</div>
                      </div>
                    )}
                    {selectedReport.status !== 'pending' && (
                      <div className="relative">
                        <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-green-600" />
                        <div className="text-slate-400 text-[10px]">Processed</div>
                        <div className="font-bold text-slate-800">Ticket completed as {selectedReport.status}</div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Resolution Controls */}
              {selectedReport.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t border-[#E4E7EC] mt-6">
                  <button 
                    onClick={() => setActionModal({ id: selectedReport.id, action: 'resolve' })}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Check size={14} />
                    <span>Resolve Ticket</span>
                  </button>
                  <button 
                    onClick={() => setActionModal({ id: selectedReport.id, action: 'dismiss' })}
                    className="flex-1 py-2 border border-[#E4E7EC] hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <X size={14} />
                    <span>Dismiss Claim</span>
                  </button>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* ACTION FORM DIALOG */}
      {actionModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E4E7EC] shadow-2xl p-6 space-y-4">
            
            <h4 className="font-bold text-base text-[#18181B] font-mono capitalize">{actionModal.action} Report Decision Form</h4>
            <p className="text-xs text-[#667085] leading-relaxed font-mono">
              Write a brief justification note regarding report ID <strong>{actionModal.id}</strong>.
            </p>

            <div className="space-y-2 font-mono text-xs">
              <label className="block text-[#667085]">Audit Resolution Statement:</label>
              <textarea 
                rows={3}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl p-3 focus:outline-none"
                placeholder="Compliance standards satisfied..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#E4E7EC]">
              <button 
                onClick={() => setActionModal(null)}
                className="px-4 py-2 border border-[#E4E7EC] rounded-xl text-xs font-bold text-[#667085]"
              >
                Cancel
              </button>
              <button 
                onClick={handleResolveDismiss}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
              >
                Confirm Dispatch
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
