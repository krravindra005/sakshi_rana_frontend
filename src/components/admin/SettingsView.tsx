import React, { useState, useEffect } from 'react';
import { adminSettingsService, AdminSettings } from '../../services/admin.service';
import { 
  Settings, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Sliders, 
  ShieldCheck, 
  Coins, 
  Lock, 
  Mail, 
  Globe, 
  Layers, 
  Loader2,
  X
} from 'lucide-react';

interface SettingsViewProps {
  onNavigateToAudit?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigateToAudit }) => {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const allSettings = await adminSettingsService.getSettings();
      setSettings(allSettings);
    } catch (err: any) {
      console.error('Error fetching global settings:', err);
      showNotification('Failed to load global settings from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    if (!settings) return;
    try {
      setIsSaving(true);
      await adminSettingsService.saveSettings(settings);
      showNotification('Global platform settings committed and synchronized successfully!', 'success');
      await loadSettings();
    } catch (err: any) {
      showNotification(err?.message || 'Error saving global settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* FEEDBACK BANNER */}
      {feedback && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-mono transition-all animate-fade-in ${
          feedback.type === 'success' 
            ? 'bg-green-50/90 border-green-200 text-green-800' 
            : 'bg-rose-50/90 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            <span className="font-bold">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="opacity-60 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#18181B]">Global System Settings</h2>
          <p className="text-xs text-[#667085] mt-0.5 font-mono">Control environment parameters, moderation enforcement thresholds, points economy, and access policies</p>
        </div>
        <div className="flex items-center gap-2 self-end">
          <button 
            onClick={loadSettings}
            disabled={loading}
            className="p-2 border border-[#E4E7EC] bg-white rounded-xl text-[#667085] hover:text-[#18181B] flex items-center gap-1.5 text-xs font-mono disabled:opacity-50"
            title="Reload settings from database"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Reload</span>
          </button>
          <button 
            onClick={handleSaveSettings}
            disabled={isSaving || loading || !settings}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save All Settings</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-[#E4E7EC] shadow-xs">
          <div className="flex flex-col items-center justify-center gap-3 text-[#667085] font-mono text-xs">
            <Loader2 size={24} className="animate-spin text-rose-600" />
            <span>Syncing system configuration engines from database...</span>
          </div>
        </div>
      ) : settings ? (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. General Environment Parameters */}
            <div className="bg-white border border-[#E4E7EC] rounded-2xl p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-[#667085] uppercase tracking-wider font-mono border-b pb-2 flex items-center gap-2">
                <Sliders size={14} className="text-rose-600" />
                <span>General Environment Parameters</span>
              </h4>
              <div className="space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <label className="text-[#667085] block font-semibold">Marketplace Platform Name:</label>
                  <input 
                    type="text" 
                    value={settings.site_name || ''}
                    onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                    className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400 font-sans font-medium"
                    placeholder="e.g. VIP Classifieds Network"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#667085] block font-semibold">Compliance & Contact Email:</label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="email" 
                      value={settings.contact_email || ''}
                      onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                      className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-rose-400"
                      placeholder="compliance@discreet-escorts.in"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[#667085] block font-semibold">Default Country:</label>
                    <input 
                      type="text" 
                      value={settings.default_country || ''}
                      onChange={(e) => setSettings({ ...settings, default_country: e.target.value })}
                      className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400"
                      placeholder="India"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#667085] block font-semibold">System Currency:</label>
                    <input 
                      type="text" 
                      value={settings.currency || ''}
                      onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                      className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400"
                      placeholder="INR"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Content & Moderation Rules */}
            <div className="bg-white border border-[#E4E7EC] rounded-2xl p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-[#667085] uppercase tracking-wider font-mono border-b pb-2 flex items-center gap-2">
                <ShieldCheck size={14} className="text-rose-600" />
                <span>Moderation & Vetting Policies</span>
              </h4>
              <div className="space-y-3 font-mono text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[#667085] block font-semibold">Default Expiration (Days):</label>
                    <input 
                      type="number" 
                      min="1"
                      max="365"
                      value={settings.default_expiration_days || 30}
                      onChange={(e) => setSettings({ ...settings, default_expiration_days: parseInt(e.target.value) || 30 })}
                      className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#667085] block font-semibold">Max Image Uploads Limit:</label>
                    <input 
                      type="number" 
                      min="1"
                      max="50"
                      value={settings.max_images || 10}
                      onChange={(e) => setSettings({ ...settings, max_images: parseInt(e.target.value) || 10 })}
                      className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[#667085] block font-semibold">Pre-Publishing Review Check:</label>
                  <select 
                    value={settings.require_ad_approval ? "true" : "false"}
                    onChange={(e) => setSettings({ ...settings, require_ad_approval: e.target.value === "true" })}
                    className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400"
                  >
                    <option value="true">Enforced (Hold for human moderator review)</option>
                    <option value="false">Automatic (Publish directly without review)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#667085] block font-semibold">Re-Moderation on Major Edit:</label>
                  <select 
                    value={settings.require_remoderation_after_major_edit ? "true" : "false"}
                    onChange={(e) => setSettings({ ...settings, require_remoderation_after_major_edit: e.target.value === "true" })}
                    className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400"
                  >
                    <option value="true">Enforced (Send edited ad back to pending queue)</option>
                    <option value="false">Bypass (Keep ad live after edits)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. System Governance & Access Policy */}
            <div className="bg-white border border-[#E4E7EC] rounded-2xl p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-[#667085] uppercase tracking-wider font-mono border-b pb-2 flex items-center gap-2">
                <Lock size={14} className="text-rose-600" />
                <span>System Access & Availability</span>
              </h4>
              <div className="space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <label className="text-[#667085] block font-semibold">Maintenance Mode Barrier:</label>
                  <select 
                    value={settings.maintenance_mode ? "true" : "false"}
                    onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.value === "true" })}
                    className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none font-bold ${
                      settings.maintenance_mode 
                        ? 'bg-rose-50 border-rose-300 text-rose-700' 
                        : 'bg-[#F8F9FC] border-[#E4E7EC] text-green-700'
                    }`}
                  >
                    <option value="false">Operational (Public traffic accessible)</option>
                    <option value="true">Active Maintenance (Block public traffic, admin-only)</option>
                  </select>
                  <p className="text-[10px] text-[#667085]">
                    When active, public visitors see the maintenance page while administrators can still access management routes.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[#667085] block font-semibold">New User Registration:</label>
                  <select 
                    value={settings.allow_registration ? "true" : "false"}
                    onChange={(e) => setSettings({ ...settings, allow_registration: e.target.value === "true" })}
                    className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400 font-bold"
                  >
                    <option value="true">Allowed (Open self-service registration)</option>
                    <option value="false">Closed (Disallow new accounts)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 4. Points & Economics Configuration */}
            <div className="bg-white border border-[#E4E7EC] rounded-2xl p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-[#667085] uppercase tracking-wider font-mono border-b pb-2 flex items-center gap-2">
                <Coins size={14} className="text-rose-600" />
                <span>Points Economy & Wallet Thresholds</span>
              </h4>
              <div className="space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <label className="text-[#667085] block font-semibold">Daily Ad Points Deduction (Points / Day):</label>
                  <input 
                    type="number" 
                    min="0"
                    value={settings.ad_points_per_day !== undefined ? settings.ad_points_per_day : 10}
                    onChange={(e) => setSettings({ ...settings, ad_points_per_day: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400"
                  />
                  <p className="text-[10px] text-[#667085]">
                    Cost in points deducted daily to keep an active advertisement published in the marketplace.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[#667085] block font-semibold">Minimum Points Withdrawal Requirement:</label>
                  <input 
                    type="number" 
                    min="0"
                    value={settings.min_withdrawal_points !== undefined ? settings.min_withdrawal_points : 500}
                    onChange={(e) => setSettings({ ...settings, min_withdrawal_points: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400"
                  />
                  <p className="text-[10px] text-[#667085]">
                    Threshold required before a merchant or advertiser can submit points redemption requests.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Save Bar */}
          <div className="bg-white border border-[#E4E7EC] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="text-xs text-[#667085] font-mono">
              All settings are saved directly to the database and take effect immediately.
            </div>
            <button 
              onClick={handleSaveSettings}
              disabled={isSaving || loading}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 font-bold text-white text-xs rounded-xl flex items-center gap-2 transition-all shadow-sm font-mono w-full sm:w-auto justify-center disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>Commit System Settings</span>
            </button>
          </div>

        </div>
      ) : null}

    </div>
  );
};
