import React, { useState, useEffect } from 'react';
import { adminAdService, adminUserService, adminReportService, AdminReport } from '../../services/admin.service';
import { Ad, AdvertisementStatus, ModerationStatus, VerificationStatus } from '../../types/ad';
import { User } from '../../types/user';
import { 
  Search, 
  SlidersHorizontal, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  FileText, 
  MoreVertical, 
  Download, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Calendar,
  Contact,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface AdsViewProps {
  activeRole: string;
}

export const AdsView: React.FC<AdsViewProps> = ({ activeRole }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAds, setSelectedAds] = useState<string[]>([]);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedAdStatus, setSelectedAdStatus] = useState('');
  const [selectedModStatus, setSelectedModStatus] = useState('');
  const [selectedVerification, setSelectedVerification] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Detail View State
  const [activeDetailAd, setActiveDetailAd] = useState<Ad | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'images' | 'attributes' | 'contact' | 'advertiser' | 'promotions' | 'reports' | 'history'>('overview');
  const [adAdvertiser, setAdAdvertiser] = useState<User | null>(null);
  const [adReports, setAdReports] = useState<AdminReport[]>([]);
  const [modHistory, setModHistory] = useState<any[]>([]);

  // Modals & Action overlays
  const [confirmModal, setConfirmModal] = useState<{ type: 'approve' | 'reject' | 'request-changes' | 'pause'; id: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Incorrect category classification');
  const [customRejectNote, setCustomRejectNote] = useState('');
  const [changeRequests, setChangeRequests] = useState<string[]>([]);

  // Load all Ads
  const fetchAds = async () => {
    try {
      setLoading(true);
      const all = await adminAdService.getAllAds();
      setAds(all);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  // Fetch contextual details when looking at an ad
  useEffect(() => {
    if (activeDetailAd) {
      // Load advertiser context
      adminUserService.getUserById(activeDetailAd.userId || '').then(u => setAdAdvertiser(u));
      // Load reports linked to ad
      adminReportService.getReports().then(reps => {
        setAdReports(reps.filter(r => r.reportedEntityId === activeDetailAd.id && r.entityType === 'AD'));
      });
      // Load moderation timeline
      adminAdService.getModerationHistory(activeDetailAd.id).then(hist => setModHistory(hist));
    } else {
      setAdAdvertiser(null);
      setAdReports([]);
      setModHistory([]);
    }
  }, [activeDetailAd]);

  const toggleSelectAll = () => {
    if (selectedAds.length === filteredAds.length) {
      setSelectedAds([]);
    } else {
      setSelectedAds(filteredAds.map(a => a.id));
    }
  };

  const toggleSelectAd = (id: string) => {
    if (selectedAds.includes(id)) {
      setSelectedAds(selectedAds.filter(x => x !== id));
    } else {
      setSelectedAds([...selectedAds, id]);
    }
  };

  // Safe checks for viewing contact information
  const canViewContactInfo = () => {
    return ['Super Admin', 'Admin', 'Support'].includes(activeRole);
  };

  // Perform operational state actions
  const handleApprove = async (id: string) => {
    try {
      await adminAdService.updateAdStatus(id, 'published', 'approved', 'Guidelines and safety vetting criteria satisfied.');
      await fetchAds();
      if (activeDetailAd?.id === id) {
        const updated = await adminAdService.getAdById(id);
        setActiveDetailAd(updated);
      }
      setConfirmModal(null);
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const note = customRejectNote ? `${rejectionReason}: ${customRejectNote}` : rejectionReason;
      await adminAdService.updateAdStatus(id, 'rejected', 'rejected', note);
      await fetchAds();
      if (activeDetailAd?.id === id) {
        const updated = await adminAdService.getAdById(id);
        setActiveDetailAd(updated);
      }
      setConfirmModal(null);
      setCustomRejectNote('');
    } catch (err) {
      alert('Error rejecting ad');
    }
  };

  const handleRequestChanges = async (id: string) => {
    try {
      const requested = changeRequests.length > 0 ? `Changes required: ${changeRequests.join(', ')}` : 'Vague content issues';
      await adminAdService.updateAdStatus(id, 'draft', 'changes_requested', requested);
      await fetchAds();
      if (activeDetailAd?.id === id) {
        const updated = await adminAdService.getAdById(id);
        setActiveDetailAd(updated);
      }
      setConfirmModal(null);
      setChangeRequests([]);
    } catch (err) {
      alert('Error requesting changes');
    }
  };

  const handlePause = async (id: string) => {
    try {
      await adminAdService.updateAdStatus(id, 'paused', 'approved', 'Administrative holding pause.');
      await fetchAds();
      if (activeDetailAd?.id === id) {
        const updated = await adminAdService.getAdById(id);
        setActiveDetailAd(updated);
      }
      setConfirmModal(null);
    } catch (err) {
      alert('Error pausing ad');
    }
  };

  // Bulk actions export
  const handleBulkExport = () => {
    const selectedRecords = ads.filter(a => selectedAds.includes(a.id));
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedRecords, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `discreet_ads_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtering Logic
  const filteredAds = ads.filter(ad => {
    const matchesSearch = 
      ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.profileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ad.userId && ad.userId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = !selectedCategory || ad.categorySlug === selectedCategory;
    const matchesCity = !selectedCity || ad.citySlug === selectedCity;
    const matchesAdStatus = !selectedAdStatus || ad.status === selectedAdStatus;
    const matchesModStatus = !selectedModStatus || ad.moderationStatus === selectedModStatus;
    const matchesVerification = !selectedVerification || ad.verification?.status === selectedVerification;

    return matchesSearch && matchesCategory && matchesCity && matchesAdStatus && matchesModStatus && matchesVerification;
  });

  // Pagination bounds
  const totalPages = Math.ceil(filteredAds.length / itemsPerPage) || 1;
  const paginatedAds = filteredAds.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedCity('');
    setSelectedAdStatus('');
    setSelectedModStatus('');
    setSelectedVerification('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#18181B]">Advertisement Registry</h2>
          <p className="text-xs text-[#667085] mt-0.5 font-mono">Monitor, filter, and audit marketplace advertisements</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedAds.length > 0 && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 p-1.5 rounded-xl">
              <span className="text-xs font-bold text-rose-700 pl-2 font-mono">{selectedAds.length} selected</span>
              <button 
                onClick={handleBulkExport}
                className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-all flex items-center gap-1"
              >
                <Download size={13} />
                <span>Export Selected</span>
              </button>
            </div>
          )}
          <button 
            onClick={fetchAds}
            className="p-2 border border-[#E4E7EC] bg-white rounded-xl text-[#667085] hover:text-[#18181B]"
            title="Refresh registry"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white border border-[#E4E7EC] rounded-2xl p-5 shadow-xs space-y-4">
        
        {/* Row 1: Search & Categories */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search box */}
          <div className="md:col-span-2 relative flex items-center">
            <Search size={15} className="absolute left-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Ad ID, Title, Profile, or Advertiser..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-rose-400 font-mono"
            />
          </div>

          {/* Category selection */}
          <select 
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400 font-mono text-[#18181B]"
          >
            <option value="">All Categories</option>
            <option value="call-girls">Call Girls</option>
            <option value="massage">Massage Therapy</option>
            <option value="male-escorts">Male Escorts</option>
            <option value="transsexual">Transsexual</option>
          </select>

          {/* City selection */}
          <select 
            value={selectedCity}
            onChange={(e) => { setSelectedCity(e.target.value); setCurrentPage(1); }}
            className="bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400 font-mono text-[#18181B]"
          >
            <option value="">All Cities</option>
            <option value="delhi">Delhi</option>
            <option value="mumbai">Mumbai</option>
            <option value="bangalore">Bangalore</option>
            <option value="goa">Goa</option>
          </select>

        </div>

        {/* Row 2: Status elements */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Ad status */}
          <select 
            value={selectedAdStatus}
            onChange={(e) => { setSelectedAdStatus(e.target.value); setCurrentPage(1); }}
            className="bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400 font-mono text-[#18181B]"
          >
            <option value="">All Publication Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="paused">Paused</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Moderation status */}
          <select 
            value={selectedModStatus}
            onChange={(e) => { setSelectedModStatus(e.target.value); setCurrentPage(1); }}
            className="bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400 font-mono text-[#18181B]"
          >
            <option value="">All Moderation Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending review</option>
            <option value="rejected">Rejected</option>
            <option value="changes_requested">Changes requested</option>
          </select>

          {/* Verification */}
          <select 
            value={selectedVerification}
            onChange={(e) => { setSelectedVerification(e.target.value); setCurrentPage(1); }}
            className="bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400 font-mono text-[#18181B]"
          >
            <option value="">All Verification Levels</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
            <option value="pending">Vetting in progress</option>
          </select>

        </div>

        {/* Active Chips / Clear actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E4E7EC]">
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] text-[#667085] font-mono mr-1">Active filter badges:</span>
            {selectedCategory && (
              <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-100 flex items-center gap-1">
                <span>Category: {selectedCategory}</span>
                <button onClick={() => setSelectedCategory('')}><X size={10} /></button>
              </span>
            )}
            {selectedCity && (
              <span className="px-2 py-0.5 rounded-lg bg-slate-50 text-slate-700 text-[10px] font-bold border border-slate-100 flex items-center gap-1">
                <span>City: {selectedCity}</span>
                <button onClick={() => setSelectedCity('')}><X size={10} /></button>
              </span>
            )}
            {selectedAdStatus && (
              <span className="px-2 py-0.5 rounded-lg bg-slate-50 text-slate-700 text-[10px] font-bold border border-slate-100 flex items-center gap-1">
                <span>Status: {selectedAdStatus}</span>
                <button onClick={() => setSelectedAdStatus('')}><X size={10} /></button>
              </span>
            )}
            {selectedModStatus && (
              <span className="px-2 py-0.5 rounded-lg bg-slate-50 text-slate-700 text-[10px] font-bold border border-slate-100 flex items-center gap-1">
                <span>Mod: {selectedModStatus}</span>
                <button onClick={() => setSelectedModStatus('')}><X size={10} /></button>
              </span>
            )}
            {!selectedCategory && !selectedCity && !selectedAdStatus && !selectedModStatus && (
              <span className="text-[10px] font-mono text-slate-400">None</span>
            )}
          </div>
          
          <button 
            onClick={clearAllFilters}
            className="text-xs text-rose-600 hover:text-rose-700 font-bold"
          >
            Clear Filters
          </button>
        </div>

      </div>

      {/* ADS DATA GRID / LISTING */}
      <div className="bg-white border border-[#E4E7EC] rounded-2xl shadow-xs overflow-hidden">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8F9FC] text-[#667085] uppercase tracking-wider font-mono border-b border-[#E4E7EC] font-bold text-[10px]">
                <th className="p-4 pl-6 w-12">
                  <input 
                    type="checkbox" 
                    checked={selectedAds.length > 0 && selectedAds.length === filteredAds.length}
                    onChange={toggleSelectAll}
                    className="rounded border-[#E4E7EC] focus:ring-rose-500"
                  />
                </th>
                <th className="p-4">Listing</th>
                <th className="p-4">Category</th>
                <th className="p-4">Location</th>
                <th className="p-4">Advertiser</th>
                <th className="p-4">Audit Status</th>
                <th className="p-4">Verification</th>
                <th className="p-4">Views</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-[#667085] font-mono">
                    <div className="flex flex-col justify-center items-center gap-3">
                      <div className="w-8 h-8 border-3 border-rose-100 border-t-rose-600 rounded-full animate-spin" />
                      <span>Reading encrypted database...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedAds.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-[#667085] font-mono">
                    No advertisements matched search filters.
                  </td>
                </tr>
              ) : (
                paginatedAds.map((ad) => {
                  const isChecked = selectedAds.includes(ad.id);
                  return (
                    <tr key={ad.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 pl-6">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => toggleSelectAd(ad.id)}
                          className="rounded border-[#E4E7EC] focus:ring-rose-500"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={ad.profileImage || ad.images[0]} 
                            alt={ad.profileName} 
                            className="w-10 h-10 object-cover rounded-xl border border-[#E4E7EC]"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-[#18181B] truncate max-w-xs">{ad.title}</span>
                            <span className="text-[10px] text-[#667085] font-mono">Ad ID: {ad.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 capitalize font-semibold text-[#18181B]">
                        {ad.categorySlug.replace('-', ' ')}
                      </td>
                      <td className="p-4 font-mono text-[#667085]">
                        <span className="capitalize">{ad.citySlug}</span>
                        {ad.areaSlug && <span className="text-[10px] block text-slate-400">({ad.areaSlug})</span>}
                      </td>
                      <td className="p-4 font-mono text-[#667085]">
                        <span className="font-bold text-slate-700">{ad.profileName}</span>
                        <span className="text-[10px] block text-slate-400">UID: {ad.userId}</span>
                      </td>
                      <td className="p-4 space-y-1">
                        {/* Ad Status Badge */}
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                            ad.status === 'published' 
                              ? 'bg-green-50 text-green-700 border border-green-100' 
                              : ad.status === 'paused'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}>
                            {ad.status}
                          </span>
                        </div>
                        {/* Moderation Badge */}
                        <div>
                          <span className={`text-[9px] font-mono uppercase ${
                            ad.moderationStatus === 'approved'
                              ? 'text-green-600'
                              : ad.moderationStatus === 'pending'
                              ? 'text-amber-500 animate-pulse'
                              : 'text-rose-600 font-bold'
                          }`}>
                            Mod: {ad.moderationStatus?.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          ad.verification?.status === 'verified' || ad.isVerified
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {ad.verification?.status || (ad.isVerified ? 'verified' : 'unverified')}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-[#18181B]">
                        {(ad.viewsCount || 0).toLocaleString()}
                      </td>
                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => { setActiveDetailAd(ad); setDetailTab('overview'); }}
                            className="p-1.5 border border-[#E4E7EC] text-[#667085] hover:text-[#18181B] bg-white rounded-lg shadow-2xs"
                            title="Audit Detail tabs"
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

        {/* PAGINATION PANEL */}
        <div className="p-4 border-t border-[#E4E7EC] bg-[#F8F9FC] flex items-center justify-between gap-4 text-xs font-mono">
          <span className="text-[#667085]">
            Showing {(currentPage-1)*itemsPerPage + 1} to {Math.min(currentPage*itemsPerPage, filteredAds.length)} of {filteredAds.length} listings
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

      {/* AD DETAIL DRAWER OVERLAY */}
      {activeDetailAd && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end animate-fade-in">
          <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col animate-slide-right overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-[#E4E7EC] flex items-center justify-between bg-[#F8F9FC]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono bg-rose-100 text-rose-700">
                    AD DETAILS
                  </span>
                  <span className="text-xs font-mono text-slate-400">ID: {activeDetailAd.id}</span>
                </div>
                <h3 className="text-base font-bold text-[#18181B] mt-1">{activeDetailAd.title}</h3>
              </div>
              <button 
                onClick={() => setActiveDetailAd(null)}
                className="p-1.5 rounded-lg border border-[#E4E7EC] bg-white text-[#667085] hover:text-[#18181B] shadow-2xs"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Action Bar */}
            <div className="bg-rose-50/50 border-b border-[#E4E7EC] px-6 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-900 font-mono">Current Status:</span>
                <span className="text-xs font-bold font-mono bg-rose-100 text-rose-800 px-2 py-0.5 rounded capitalize">
                  {activeDetailAd.status} (Mod: {activeDetailAd.moderationStatus})
                </span>
              </div>
              <div className="flex gap-2">
                {activeDetailAd.moderationStatus !== 'approved' && (
                  <button 
                    onClick={() => setConfirmModal({ type: 'approve', id: activeDetailAd.id })}
                    className="px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 transition-all text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm"
                  >
                    <Check size={14} />
                    <span>Approve</span>
                  </button>
                )}
                {activeDetailAd.status === 'published' && (
                  <button 
                    onClick={() => setConfirmModal({ type: 'pause', id: activeDetailAd.id })}
                    className="px-3 py-1.5 border border-slate-300 bg-white hover:bg-slate-50 transition-all text-xs font-bold rounded-lg flex items-center gap-1 text-slate-700"
                  >
                    <EyeOff size={14} />
                    <span>Pause</span>
                  </button>
                )}
                {activeDetailAd.moderationStatus !== 'changes_requested' && (
                  <button 
                    onClick={() => setConfirmModal({ type: 'request-changes', id: activeDetailAd.id })}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all"
                  >
                    <AlertCircle size={14} />
                    <span>Request Changes</span>
                  </button>
                )}
                {activeDetailAd.moderationStatus !== 'rejected' && (
                  <button 
                    onClick={() => setConfirmModal({ type: 'reject', id: activeDetailAd.id })}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all"
                  >
                    <X size={14} />
                    <span>Reject Ad</span>
                  </button>
                )}
              </div>
            </div>

            {/* TAB SELECTOR HEADER */}
            <div className="px-6 border-b border-[#E4E7EC] flex gap-4 overflow-x-auto bg-[#F8F9FC]/40">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'images', label: 'Gallery' },
                { id: 'attributes', label: 'Attributes' },
                { id: 'contact', label: 'Secure Contact' },
                { id: 'advertiser', label: 'Advertiser' },
                { id: 'reports', label: `Abuse Logs (${adReports.length})` },
                { id: 'history', label: 'Moderation History' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDetailTab(tab.id as any)}
                  className={`py-3 text-xs font-bold border-b-2 transition-all font-mono whitespace-nowrap ${
                    detailTab === tab.id 
                      ? 'border-rose-600 text-rose-600' 
                      : 'border-transparent text-[#667085] hover:text-[#18181B]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT PANEL */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {detailTab === 'overview' && (
                <div className="space-y-6">
                  {/* Basic Metadata */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[#F8F9FC] rounded-xl border border-[#E4E7EC] font-mono text-xs">
                    <div>
                      <span className="text-[#667085] block">Category:</span>
                      <strong className="text-[#18181B] capitalize font-sans">{activeDetailAd.categorySlug}</strong>
                    </div>
                    <div>
                      <span className="text-[#667085] block">Location:</span>
                      <strong className="text-[#18181B] capitalize font-sans">{activeDetailAd.citySlug}, {activeDetailAd.areaSlug}</strong>
                    </div>
                    <div>
                      <span className="text-[#667085] block">Vetting Status:</span>
                      <strong className="text-[#18181B] capitalize font-sans">{activeDetailAd.moderationStatus}</strong>
                    </div>
                    <div>
                      <span className="text-[#667085] block">Verified Companion:</span>
                      <strong className="text-[#18181B] capitalize font-sans">{activeDetailAd.isVerified ? 'Yes ✓' : 'No'}</strong>
                    </div>
                  </div>

                  {/* Advert text body */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-[#667085] uppercase tracking-wider font-mono">Discreet Description Body</h5>
                    <div className="p-4 border border-[#E4E7EC] bg-slate-50/50 rounded-xl text-xs leading-relaxed text-[#18181B]">
                      {activeDetailAd.description}
                    </div>
                  </div>
                </div>
              )}

              {detailTab === 'images' && (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-950 font-mono">
                    ⚠️ <strong>Audit Policy Directive:</strong> Confirm that no explicit imagery, underage representation, or illegal weapons are included in user uploaded assets. Click on an image to trigger high-res audit pane.
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {activeDetailAd.images.map((img, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#E4E7EC]">
                        <img 
                          src={img} 
                          alt="Companion Vetting" 
                          className="w-full h-40 object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                          <span className="text-[10px] font-mono text-white border border-white px-2 py-1 rounded">Image {idx+1} Safe</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detailTab === 'attributes' && (
                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-[#667085] uppercase tracking-wider font-mono">Dynamic Vetting Attributes</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeDetailAd.attributes ? (
                      Object.entries(activeDetailAd.attributes).map(([key, val]) => (
                        <div key={key} className="p-3 border border-[#E4E7EC] rounded-xl bg-[#F8F9FC] flex justify-between items-center text-xs">
                          <span className="text-[#667085] capitalize font-mono">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <strong className="text-[#18181B] font-bold">
                            {Array.isArray(val) ? val.join(', ') : String(val)}
                          </strong>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#667085] font-mono">No specific attributes linked.</p>
                    )}
                  </div>
                </div>
              )}

              {detailTab === 'contact' && (
                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-[#667085] uppercase tracking-wider font-mono">Sensitive Contact Details Vetting</h5>
                  
                  {canViewContactInfo() ? (
                    <div className="p-4 border border-[#E4E7EC] bg-[#F8F9FC] rounded-xl space-y-3 font-mono text-xs">
                      <div className="flex justify-between border-b border-[#E4E7EC] pb-2">
                        <span>Direct Telephone:</span>
                        <strong className="text-rose-700 text-sm">{activeDetailAd.contact?.phone || 'None'}</strong>
                      </div>
                      <div className="flex justify-between border-b border-[#E4E7EC] pb-2">
                        <span>WhatsApp Vetted ID:</span>
                        <strong className="text-green-600 font-bold">{activeDetailAd.contact?.whatsapp || 'None'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Public Email Address:</span>
                        <strong className="text-slate-800">{activeDetailAd.contact?.email || 'None'}</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 border border-rose-100 bg-rose-50 text-rose-950 rounded-xl flex items-center gap-3">
                      <EyeOff size={18} className="text-rose-600 flex-shrink-0 animate-bounce" />
                      <div>
                        <h6 className="font-bold text-xs font-mono">PERMISSION MASK ACTIVE</h6>
                        <p className="text-[10px] mt-0.5 text-rose-800 font-mono">
                          Only Super Admin, Admin, and Support roles are authorized to view companion telephone numbers and email registries to prevent identity mining.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'advertiser' && (
                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-[#667085] uppercase tracking-wider font-mono">Linked Advertiser Profile</h5>
                  
                  {adAdvertiser ? (
                    <div className="p-4 border border-[#E4E7EC] rounded-xl flex items-center gap-4">
                      <img 
                        src={adAdvertiser.profile.avatar} 
                        alt={adAdvertiser.profile.name} 
                        className="w-12 h-12 rounded-full border"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-xs min-w-0 font-mono">
                        <h6 className="font-bold text-[#18181B] font-sans text-sm">{adAdvertiser.profile.name}</h6>
                        <p className="text-slate-400">UID: {adAdvertiser.id}</p>
                        <p className="text-slate-500 mt-1">Status: <span className="text-rose-600 font-bold">{adAdvertiser.status}</span></p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 font-mono">Locating advertiser details...</p>
                  )}
                </div>
              )}

              {detailTab === 'reports' && (
                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-[#667085] uppercase tracking-wider font-mono">Linked Content Abuse Reports ({adReports.length})</h5>
                  
                  {adReports.length === 0 ? (
                    <p className="text-xs text-[#667085] font-mono">No abuse flags reported on this listing. Perfect compliance history!</p>
                  ) : (
                    <div className="space-y-3 font-mono text-xs">
                      {adReports.map((r) => (
                        <div key={r.id} className="p-3 border border-rose-100 bg-rose-50/50 rounded-xl">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-rose-700">{r.id}</span>
                            <span className="uppercase text-[10px] bg-rose-100 text-rose-800 px-1.5 rounded">{r.priority} priority</span>
                          </div>
                          <p className="mt-1 text-[#18181B] font-semibold">{r.reason}</p>
                          <p className="mt-0.5 text-[#667085] text-[11px] font-sans italic">"{r.description}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'history' && (
                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-[#667085] uppercase tracking-wider font-mono">Administrative Vetting Audit History</h5>
                  
                  <div className="relative border-l-2 border-[#E4E7EC] ml-3 pl-4 space-y-4 text-xs">
                    {modHistory.map((item, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-6 top-1.5 w-2 h-2 rounded-full bg-rose-600" />
                        <div className="font-mono text-[10px] text-slate-400">{new Date(item.date).toLocaleString()}</div>
                        <div className="font-bold text-[#18181B] capitalize mt-0.5">{item.action} by {item.moderator}</div>
                        <p className="text-[#667085] italic mt-0.5">"{item.reason}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* CONFIRM ACTION MODAL OVERLAY */}
      {confirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E4E7EC] shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle size={24} className="animate-pulse" />
              <h4 className="font-bold text-base text-[#18181B] capitalize">{confirmModal.type} Action Confirmation</h4>
            </div>

            <p className="text-xs text-[#667085] leading-relaxed">
              You are modifying the administrative status of advertisement <strong>{confirmModal.id}</strong>. This action is tracked in read-only audit databases.
            </p>

            {/* Reject Form Input */}
            {confirmModal.type === 'reject' && (
              <div className="space-y-3 font-mono text-xs">
                <label className="block text-[#667085]">Configured Reject Category Template:</label>
                <select 
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2"
                >
                  <option value="Incorrect category classification">Incorrect Category Classification</option>
                  <option value="Suspected fraudulent representation">Suspected Fraudulent Identity</option>
                  <option value="Explicit/Underage asset imagery upload">Explicit NSFW Content Violation</option>
                  <option value="Out of boundaries geo specifications">Deceptive Geo-coordinates</option>
                </select>

                <label className="block text-[#667085] mt-2">Additional Vetting Vouch Note:</label>
                <textarea 
                  rows={2}
                  placeholder="Detail notes about image flaws or safety indicators..."
                  value={customRejectNote}
                  onChange={(e) => setCustomRejectNote(e.target.value)}
                  className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl p-3"
                />
              </div>
            )}

            {/* Request Changes Checks */}
            {confirmModal.type === 'request-changes' && (
              <div className="space-y-3 font-mono text-xs">
                <label className="block text-[#667085] font-bold">Select correction mandates for the advertiser:</label>
                {[
                  'Image quality / blurry assets',
                  'Incorrect listing category description',
                  'Contact telephone formatting issue',
                  'Missing age guidelines declaration',
                  'Verification selfie required resubmit'
                ].map(issue => (
                  <div key={issue} className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id={issue}
                      checked={changeRequests.includes(issue)}
                      onChange={(e) => {
                        if (e.target.checked) setChangeRequests([...changeRequests, issue]);
                        else setChangeRequests(changeRequests.filter(x => x !== issue));
                      }}
                      className="rounded border-[#E4E7EC] text-rose-600 focus:ring-rose-500"
                    />
                    <label htmlFor={issue} className="text-slate-700 text-[11px]">{issue}</label>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-[#E4E7EC]">
              <button 
                onClick={() => { setConfirmModal(null); setChangeRequests([]); }}
                className="px-4 py-2 border border-[#E4E7EC] rounded-xl text-xs font-bold text-[#667085] hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (confirmModal.type === 'approve') handleApprove(confirmModal.id);
                  if (confirmModal.type === 'reject') handleReject(confirmModal.id);
                  if (confirmModal.type === 'request-changes') handleRequestChanges(confirmModal.id);
                  if (confirmModal.type === 'pause') handlePause(confirmModal.id);
                }}
                className="px-4 py-2 bg-[#18181B] hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all"
              >
                Confirm Mandate
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
