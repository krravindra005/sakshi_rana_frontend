import React, { useState, useEffect } from 'react';
import { adminAuditService, AuditLog } from '../../services/admin.service';
import { 
  FileText, 
  Search, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  X, 
  Shield, 
  Layers, 
  Clock, 
  User, 
  Activity, 
  Loader2,
  Terminal,
  Filter,
  CheckCircle,
  Copy
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Selected log for detailed JSON / diff inspect modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await adminAuditService.getAuditLogs();
      setLogs(data || []);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleCopyJson = (data: any) => {
    try {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // Filter logic
  const filteredLogs = logs.filter(log => {
    const q = searchQuery.toLowerCase();
    const actor = (log.adminName || '').toLowerCase();
    const email = (log.adminEmail || '').toLowerCase();
    const action = (log.action || '').toLowerCase();
    const details = (log.details || '').toLowerCase();
    const entity = (log.entityType || log.auditableType || '').toLowerCase();
    const ip = (log.ipAddress || '').toLowerCase();

    const matchesSearch = !q ||
      actor.includes(q) ||
      email.includes(q) ||
      action.includes(q) ||
      details.includes(q) ||
      entity.includes(q) ||
      ip.includes(q);

    const matchesEntity = !entityFilter || entity.includes(entityFilter.toLowerCase());
    const matchesAction = !actionFilter || action.includes(actionFilter.toLowerCase());

    return matchesSearch && matchesEntity && matchesAction;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getActionBadgeColor = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('approve') || act.includes('create') || act.includes('resolve') || act.includes('activate')) {
      return 'bg-green-50 text-green-700 border-green-200';
    }
    if (act.includes('reject') || act.includes('ban') || act.includes('suspend') || act.includes('delete')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (act.includes('update') || act.includes('edit') || act.includes('adjust') || act.includes('assign')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#18181B]">Security & Compliance Audit Logs</h2>
          <p className="text-xs text-[#667085] mt-0.5 font-mono">Immutable cryptographic records of administrative actions, moderation approvals, wallet adjustments, and policy updates</p>
        </div>
        <button 
          onClick={fetchLogs}
          disabled={loading}
          className="p-2 border border-[#E4E7EC] bg-white rounded-xl text-[#667085] hover:text-[#18181B] self-end flex items-center gap-1.5 text-xs font-mono disabled:opacity-50"
          title="Refresh audit trail"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh Logs</span>
        </button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white border border-[#E4E7EC] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center">
        
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3 text-slate-400 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by Actor, Action, Module, IP address, or details..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-rose-400 font-mono"
          />
        </div>

        <select 
          value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value); setCurrentPage(1); }}
          className="bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400 font-mono text-[#18181B] w-full md:w-48"
        >
          <option value="">All Entities</option>
          <option value="ad">Ads & Listings</option>
          <option value="user">User Directory</option>
          <option value="role">Roles & Permissions</option>
          <option value="report">Reports & Abuse</option>
          <option value="setting">System Settings</option>
          <option value="wallet">Wallet & Points</option>
          <option value="location">Locations & Cities</option>
        </select>

        <select 
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
          className="bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400 font-mono text-[#18181B] w-full md:w-48"
        >
          <option value="">All Actions</option>
          <option value="approve">Approve</option>
          <option value="reject">Reject</option>
          <option value="suspend">Suspend / Ban</option>
          <option value="assign">Role Assign</option>
          <option value="update">Update / Edit</option>
          <option value="adjust">Wallet Adjust</option>
          <option value="resolve">Report Resolve</option>
        </select>

      </div>

      {/* AUDIT LOGS DATAGRID */}
      <div className="bg-white border border-[#E4E7EC] rounded-2xl shadow-xs overflow-hidden">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8F9FC] text-[#667085] uppercase tracking-wider font-mono border-b border-[#E4E7EC] font-bold text-[10px]">
                <th className="p-4 pl-6">ID / Timestamp</th>
                <th className="p-4">Actor (Staff)</th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">Network IP</th>
                <th className="p-4">Audit Payload / Details</th>
                <th className="p-4 text-right pr-6">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC] font-mono text-[#18181B]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[#667085]">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin text-rose-600" />
                      <span>Reading secure audit event ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[#667085]">
                    No audit records found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const dateStr = log.timestamp || log.createdAt;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors text-[11px]">
                      <td className="p-4 pl-6 whitespace-nowrap">
                        <div className="font-bold text-slate-800">#{log.id}</div>
                        <div className="text-[10px] text-[#667085] flex items-center gap-1 mt-0.5">
                          <Clock size={10} />
                          <span>{dateStr ? new Date(dateStr).toLocaleString() : 'N/A'}</span>
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center font-bold text-[10px]">
                            {(log.adminName || 'A')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-[#18181B]">{log.adminName || 'System'}</div>
                            <div className="text-[10px] text-slate-500 uppercase">{log.role || 'Admin'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getActionBadgeColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-slate-700 font-semibold">
                          <Layers size={11} className="text-slate-400" />
                          <span>{log.entityType || 'SYSTEM'}</span>
                        </div>
                        {log.targetId && (
                          <div className="text-[10px] text-[#667085]">Ref: #{log.targetId}</div>
                        )}
                      </td>

                      <td className="p-4 whitespace-nowrap text-[#667085] font-mono text-[10px]">
                        {log.ipAddress || '127.0.0.1'}
                      </td>

                      <td className="p-4 max-w-xs truncate font-sans text-slate-700">
                        <span className="truncate block" title={log.details}>
                          {log.details || 'System routine event registered'}
                        </span>
                      </td>

                      <td className="p-4 text-right pr-6 whitespace-nowrap">
                        <button 
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 border border-[#E4E7EC] text-[#667085] hover:text-rose-600 bg-white rounded-lg shadow-2xs transition-all"
                          title="View JSON Payload & Diff"
                        >
                          <Eye size={13} />
                        </button>
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
            Showing {filteredLogs.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} audit records
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
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-1.5 border border-[#E4E7EC] bg-white text-[#667085] hover:text-[#18181B] rounded-lg disabled:opacity-50"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

      </div>

      {/* AUDIT DETAIL MODAL (JSON DIFF & PAYLOAD) */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E4E7EC] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E4E7EC] flex items-center justify-between bg-[#F8F9FC]">
              <div className="flex items-center gap-2.5">
                <Terminal size={18} className="text-rose-600" />
                <div>
                  <h3 className="font-bold text-sm text-[#18181B]">Audit Event #{selectedLog.id}</h3>
                  <p className="text-[11px] text-[#667085] font-mono">
                    {selectedLog.timestamp ? new Date(selectedLog.timestamp).toUTCString() : 'N/A'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-1.5 border border-[#E4E7EC] bg-white text-[#667085] hover:text-[#18181B] rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 font-mono text-xs">
              
              {/* Meta properties */}
              <div className="grid grid-cols-2 gap-3 bg-[#F8F9FC] p-3.5 rounded-xl border border-[#E4E7EC]">
                <div>
                  <span className="text-[#667085] text-[10px] uppercase block font-bold">Actor:</span>
                  <span className="font-bold text-[#18181B]">{selectedLog.adminName}</span> ({selectedLog.role || 'Admin'})
                </div>
                <div>
                  <span className="text-[#667085] text-[10px] uppercase block font-bold">Action Event:</span>
                  <span className="text-rose-700 font-bold">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-[#667085] text-[10px] uppercase block font-bold">Entity Type:</span>
                  <span>{selectedLog.entityType || selectedLog.auditableType || 'SYSTEM'}</span>
                </div>
                <div>
                  <span className="text-[#667085] text-[10px] uppercase block font-bold">Network IP:</span>
                  <span>{selectedLog.ipAddress || '127.0.0.1'}</span>
                </div>
              </div>

              {/* Event details note */}
              {selectedLog.details && (
                <div className="space-y-1">
                  <span className="text-[#667085] text-[10px] uppercase font-bold block">Summary Details:</span>
                  <div className="p-3 bg-slate-50 border border-[#E4E7EC] rounded-xl font-sans text-slate-800 text-xs">
                    {selectedLog.details}
                  </div>
                </div>
              )}

              {/* New Values / Changes Diff */}
              {selectedLog.newValues && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#667085] text-[10px] uppercase font-bold">Applied Values Payload (new_values):</span>
                    <button 
                      onClick={() => handleCopyJson(selectedLog.newValues)}
                      className="text-[10px] text-slate-500 hover:text-rose-600 flex items-center gap-1"
                    >
                      {copied ? <CheckCircle size={10} className="text-green-600" /> : <Copy size={10} />}
                      <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                  </div>
                  <pre className="p-3.5 bg-slate-900 text-green-400 rounded-xl overflow-x-auto text-[11px] leading-relaxed font-mono">
                    {JSON.stringify(selectedLog.newValues, null, 2)}
                  </pre>
                </div>
              )}

              {/* Old Values (if present) */}
              {selectedLog.oldValues && Object.keys(selectedLog.oldValues).length > 0 && (
                <div className="space-y-1">
                  <span className="text-[#667085] text-[10px] uppercase font-bold block">Previous Values (old_values):</span>
                  <pre className="p-3 bg-slate-100 text-slate-700 rounded-xl overflow-x-auto text-[11px] font-mono border">
                    {JSON.stringify(selectedLog.oldValues, null, 2)}
                  </pre>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E4E7EC] flex justify-end bg-[#F8F9FC]">
              <button 
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold font-mono"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
