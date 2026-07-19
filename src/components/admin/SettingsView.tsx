import React, { useState, useEffect } from 'react';
import { adminSettingsService, adminAuditService, AdminSettings, AuditLog } from '../../services/admin.service';
import { 
  Settings, 
  FileText, 
  Save, 
  Search, 
  Check, 
  X, 
  AlertCircle, 
  RefreshCw, 
  Lock, 
  Sliders
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'config' | 'logs'>('config');
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Search filter for Logs
  const [searchLog, setSearchLog] = useState('');
  const [moduleLogFilter, setModuleLogFilter] = useState('');

  const loadSettingsAndLogs = async () => {
    try {
      setLoading(true);
      const [allSettings, allLogs] = await Promise.all([
        adminSettingsService.getSettings(),
        adminAuditService.getAuditLogs()
      ]);
      setSettings(allSettings);
      setLogs(allLogs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsAndLogs();
  }, []);

  const handleSaveSettings = async () => {
    if (!settings) return;
    try {
      await adminSettingsService.saveSettings(settings);
      await loadSettingsAndLogs();
      alert('Global settings successfully saved!');
    } catch (err) {
      alert('Error saving configuration');
    }
  };

  // Logs filters
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.adminName.toLowerCase().includes(searchLog.toLowerCase()) ||
      log.action.toLowerCase().includes(searchLog.toLowerCase()) ||
      log.details.toLowerCase().includes(searchLog.toLowerCase());

    const matchesModule = !moduleLogFilter || log.entityType === moduleLogFilter;

    return matchesSearch && matchesModule;
  });

  return (
    <div className="space-y-6">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#18181B]">System Management Console</h2>
          <p className="text-xs text-[#667085] mt-0.5 font-mono">Control global configuration values, and inspect immutable moderator activity streams</p>
        </div>
        <button 
          onClick={loadSettingsAndLogs}
          className="p-2 border border-[#E4E7EC] bg-white rounded-xl text-[#667085] hover:text-[#18181B] self-end"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* SUB-TAB TOGGLES */}
      <div className="flex border-b border-[#E4E7EC] gap-4 bg-white p-2 rounded-2xl border">
        {[
          { id: 'config', label: 'Global System Settings', icon: Settings },
          { id: 'logs', label: 'Immutable Audit Logs', icon: FileText },
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
        <p className="text-xs font-mono text-slate-400 p-8 text-center bg-white rounded-2xl border">Syncing configuration engines...</p>
      ) : (
        <div className="space-y-6">
          
          {/* TAB 1: SETTINGS PANEL */}
          {activeTab === 'config' && settings && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* General Settings */}
                <div className="bg-white border border-[#E4E7EC] rounded-2xl p-5 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold text-[#667085] uppercase tracking-wider font-mono border-b pb-2 flex items-center gap-2">
                    <Sliders size={14} className="text-rose-600" />
                    <span>General Environment Parameters</span>
                  </h4>
                  <div className="space-y-3 font-mono text-xs">
                    <div className="space-y-1">
                      <label className="text-[#667085] block">Marketplace Name:</label>
                      <input 
                        type="text" 
                        value={settings.siteName}
                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                        className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[#667085] block">Default Country Context:</label>
                      <input 
                        type="text" 
                        value={settings.defaultCountry}
                        onChange={(e) => setSettings({ ...settings, defaultCountry: e.target.value })}
                        className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[#667085] block">Primary System Currency:</label>
                      <input 
                        type="text" 
                        value={settings.currency}
                        onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                        className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Moderation Settings */}
                <div className="bg-white border border-[#E4E7EC] rounded-2xl p-5 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold text-[#667085] uppercase tracking-wider font-mono border-b pb-2 flex items-center gap-2">
                    <AlertCircle size={14} className="text-rose-600" />
                    <span>Censorship & Automated Vetting Rules</span>
                  </h4>
                  <div className="space-y-3 font-mono text-xs">
                    <div className="space-y-1">
                      <label className="text-[#667085] block">Default Ads Expiration (Days):</label>
                      <input 
                        type="number" 
                        value={settings.defaultExpirationDays}
                        onChange={(e) => setSettings({ ...settings, defaultExpirationDays: parseInt(e.target.value) || 30 })}
                        className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[#667085] block">Max Image uploads limit:</label>
                      <input 
                        type="number" 
                        value={settings.maxImages}
                        onChange={(e) => setSettings({ ...settings, maxImages: parseInt(e.target.value) || 10 })}
                        className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[#667085] block">Mandatory Pre-Publishing Vetting Check:</label>
                      <select 
                        value={settings.requireApprovalBeforePublishing ? "true" : "false"}
                        onChange={(e) => setSettings({ ...settings, requireApprovalBeforePublishing: e.target.value === "true" })}
                        className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none"
                      >
                        <option value="true">Active (Required approval)</option>
                        <option value="false">Inactive (Auto-publish)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[#667085] block">Force re-vetting after major edits:</label>
                      <select 
                        value={settings.requireReModerationAfterMajorEdit ? "true" : "false"}
                        onChange={(e) => setSettings({ ...settings, requireReModerationAfterMajorEdit: e.target.value === "true" })}
                        className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none"
                      >
                        <option value="true">Enforced</option>
                        <option value="false">Optional</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action buttons */}
              <div className="bg-white border rounded-2xl p-4 flex justify-end gap-2 border-[#E4E7EC] shadow-2xs">
                <button 
                  onClick={handleSaveSettings}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 font-bold text-white text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm font-mono"
                >
                  <Save size={14} />
                  <span>Commit System Settings</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: AUDIT LOGS PANEL */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              
              {/* Filters for Logs */}
              <div className="bg-white border border-[#E4E7EC] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search logs by user, action details, event payloads..." 
                    value={searchLog}
                    onChange={(e) => setSearchLog(e.target.value)}
                    className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-rose-400 font-mono"
                  />
                </div>

                <select 
                  value={moduleLogFilter}
                  onChange={(e) => setModuleLogFilter(e.target.value)}
                  className="bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400 font-mono text-[#18181B] w-full sm:w-48"
                >
                  <option value="">All Event Modules</option>
                  <option value="ADVERTISEMENT">Ads / Content</option>
                  <option value="REPORT">Reports / Abuse</option>
                  <option value="WALLET">Wallet / Finance</option>
                  <option value="SYSTEM">Global Settings</option>
                </select>
              </div>

              {/* Logs Datagrid Table */}
              <div className="bg-white border border-[#E4E7EC] rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F8F9FC] text-[#667085] uppercase tracking-wider font-mono border-b border-[#E4E7EC] font-bold text-[10px]">
                        <th className="p-4 pl-6">ID</th>
                        <th className="p-4">Time stamp</th>
                        <th className="p-4">Moderator Staff</th>
                        <th className="p-4">Action Event</th>
                        <th className="p-4">Crawl Module</th>
                        <th className="p-4">IP Address</th>
                        <th className="p-4">Event Description payload</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E7EC] font-mono text-[#18181B]">
                      {filteredLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/60 transition-colors text-[11px]">
                          <td className="p-4 pl-6 font-bold text-slate-500">{log.id}</td>
                          <td className="p-4 text-[#667085]">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="p-4 font-bold">{log.adminName} ({log.role})</td>
                          <td className="p-4 text-rose-700 font-extrabold">{log.action}</td>
                          <td className="p-4 text-slate-500">{log.entityType}</td>
                          <td className="p-4 text-slate-400">{log.ipAddress}</td>
                          <td className="p-4 font-sans text-slate-700 font-semibold">{log.details}</td>
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

    </div>
  );
};
