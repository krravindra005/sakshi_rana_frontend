import React, { useState, useEffect } from 'react';
import { PointsService } from '../../services/points.service';
import { PointRequest } from '../../types/api';
import { 
  Coins, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Search, 
  Sliders, 
  User as UserIcon, 
  Check, 
  X,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface PointRequestsViewProps {
  activeRole: string;
}

export const PointRequestsView: React.FC<PointRequestsViewProps> = () => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [requests, setRequests] = useState<PointRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Daily rate setting state
  const [dailyRate, setDailyRate] = useState<number>(100);
  const [isUpdatingRate, setIsUpdatingRate] = useState(false);
  const [rateSuccessMsg, setRateSuccessMsg] = useState<string | null>(null);
  const [rateErrorMsg, setRateErrorMsg] = useState<string | null>(null);

  // Action Modal (Approve / Reject)
  const [selectedRequest, setSelectedRequest] = useState<PointRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Load requests & daily points setting
  const loadData = async () => {
    try {
      setLoading(true);
      const [reqData, settingsData] = await Promise.all([
        PointsService.getAdminRequests(statusFilter, 1, searchQuery),
        PointsService.getAdPointSettings(),
      ]);

      setRequests(reqData.data);
      setDailyRate(settingsData.points_required_per_day);
    } catch (err) {
      console.error('Error loading points data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Save Daily Ad Points Setting
  const handleSaveRate = async () => {
    try {
      setIsUpdatingRate(true);
      setRateSuccessMsg(null);
      setRateErrorMsg(null);

      const res = await PointsService.updateAdPointSettings(Number(dailyRate));
      setDailyRate(res.points_required_per_day);
      setRateSuccessMsg(`Daily rate successfully saved: ${res.points_required_per_day} points/day`);

      setTimeout(() => setRateSuccessMsg(null), 4000);
    } catch (err: any) {
      setRateErrorMsg(err?.response?.data?.message || 'Failed to update daily points rate.');
    } finally {
      setIsUpdatingRate(false);
    }
  };

  // Execute Approve or Reject
  const handleExecuteAction = async () => {
    if (!selectedRequest || !actionType) return;

    try {
      setActionLoading(true);
      setActionError(null);

      if (actionType === 'approve') {
        await PointsService.approveRequest(selectedRequest.id, adminNote.trim() || undefined);
      } else {
        await PointsService.rejectRequest(selectedRequest.id, adminNote.trim() || 'Request declined by Super Admin');
      }

      // Close modal and reload
      setSelectedRequest(null);
      setActionType(null);
      setAdminNote('');
      await loadData();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || `Failed to ${actionType} request.`);
    } finally {
      setActionLoading(false);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
                Point Requests Management
              </h1>
              <p className="text-sm text-zinc-400">
                Review user point requests, approve or reject credit allocations, and set daily ad points.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors border border-zinc-700"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Setting Card: Advertisement Daily Points */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Advertisement Daily Points Setting</h2>
              <p className="text-xs text-zinc-400">
                Configure how many points an advertisement consumes per day (e.g. 100 points/day).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 focus-within:border-amber-500">
              <span className="text-xs text-zinc-400 mr-2 font-mono">Points / Day:</span>
              <input
                type="number"
                min="0"
                max="100000"
                value={dailyRate}
                onChange={(e) => setDailyRate(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-24 bg-transparent text-white font-mono text-sm focus:outline-none"
              />
            </div>
            <button
              onClick={handleSaveRate}
              disabled={isUpdatingRate}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-semibold transition-colors disabled:opacity-50 shrink-0"
            >
              {isUpdatingRate ? 'Saving...' : 'Save Setting'}
            </button>
          </div>
        </div>

        {rateSuccessMsg && (
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{rateSuccessMsg}</span>
          </div>
        )}

        {rateErrorMsg && (
          <div className="mt-3 flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{rateErrorMsg}</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-xl w-full sm:w-auto">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors flex items-center gap-1.5 ${
                statusFilter === filter
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {filter}
              {filter === 'pending' && pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-zinc-950 font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by user name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Point Requests Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/70 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Requested Points</th>
                <th className="py-3.5 px-4">Reason / Notes</th>
                <th className="py-3.5 px-4">Request Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-2" />
                    Loading point requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    No point requests found.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-zinc-800/40 transition-colors">
                    {/* User info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
                          <UserIcon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-zinc-200 font-semibold">{req.user?.name || `User #${req.user_id}`}</div>
                          <div className="text-zinc-400 text-[11px]">{req.user?.email}</div>
                          {req.user?.wallet && (
                            <div className="text-[10px] text-amber-400/90 font-mono mt-0.5">
                              Current Balance: {Number(req.user.wallet.cached_balance).toLocaleString()} Credits
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Requested Points */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold font-mono text-sm">
                        <Coins className="w-3.5 h-3.5" />
                        {Number(req.points).toLocaleString()} Points
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="py-3.5 px-4 max-w-xs truncate text-zinc-300">
                      {req.reason ? req.reason : <span className="text-zinc-500 italic">No reason provided</span>}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap">
                      {req.created_at ? new Date(req.created_at).toLocaleString() : 'N/A'}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {req.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                      {req.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Approved
                        </span>
                      )}
                      {req.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setActionType('approve');
                              setAdminNote('Approved points grant');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setActionType('reject');
                              setAdminNote('Request declined as per policy');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shadow-sm"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-500 font-mono italic">
                          Processed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {selectedRequest && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                {actionType === 'approve' ? (
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <XCircle className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-white capitalize">
                    {actionType} Point Request
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Request #{selectedRequest.id} &bull; {selectedRequest.user?.name || `User #${selectedRequest.user_id}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setActionType(null);
                }}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Requested Points:</span>
                  <span className="text-amber-400 font-bold font-mono text-sm">
                    {Number(selectedRequest.points).toLocaleString()} Points
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">User Email:</span>
                  <span className="text-zinc-200 font-mono">{selectedRequest.user?.email}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Current Balance:</span>
                  <span className="text-zinc-200 font-mono">
                    {selectedRequest.user?.wallet?.cached_balance ?? 0} Credits
                  </span>
                </div>
                {actionType === 'approve' && (
                  <div className="pt-2 border-t border-zinc-800/60 flex justify-between items-center text-xs text-emerald-400">
                    <span>New Balance After Credit:</span>
                    <span className="font-bold font-mono">
                      {(Number(selectedRequest.user?.wallet?.cached_balance ?? 0) + Number(selectedRequest.points)).toLocaleString()} Credits
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  {actionType === 'approve' ? 'Admin Note (Optional)' : 'Rejection Reason (Optional)'}
                </label>
                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={actionType === 'approve' ? 'Add any notes for records...' : 'Specify reason for declining...'}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {actionError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setSelectedRequest(null);
                  setActionType(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleExecuteAction}
                className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition-colors flex items-center gap-1.5 ${
                  actionType === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                } disabled:opacity-50`}
              >
                {actionLoading ? 'Processing...' : (
                  actionType === 'approve' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Confirm Approval & Credit
                    </>
                  ) : (
                    <>
                      <X className="w-3.5 h-3.5" />
                      Confirm Rejection
                    </>
                  )
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
