import React, { useState, useEffect } from 'react';
import { adminAdService, adminModerationService, adminUserService } from '../../services/admin.service';
import { Ad } from '../../types/ad';
import { User } from '../../types/user';
import { 
  Check, 
  X, 
  AlertCircle, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  MapPin, 
  User as UserIcon,
  HelpCircle,
  FileText,
  ThumbsUp,
  Image,
  RefreshCw
} from 'lucide-react';

export const ModerationView: React.FC = () => {
  const [queue, setQueue] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [advertiser, setAdvertiser] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Rejection overlay
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('Incorrect category classification');
  const [rejectDetails, setRejectDetails] = useState('');

  // Request changes overlay
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [changeChecklists, setChangeChecklists] = useState<string[]>([]);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const pending = await adminModerationService.getModerationQueue();
      setQueue(pending);
      if (pending.length > 0) {
        setSelectedAd(pending[0]);
      } else {
        setSelectedAd(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  useEffect(() => {
    if (selectedAd && selectedAd.userId) {
      adminUserService.getUserById(selectedAd.userId).then(u => setAdvertiser(u)).catch(() => setAdvertiser(null));
    } else {
      setAdvertiser(null);
    }
  }, [selectedAd]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleApprove = async () => {
    if (!selectedAd || isProcessing) return;
    try {
      setIsProcessing(true);
      await adminAdService.approveAd(selectedAd.id, 'Fully approved in routine compliance audit.');
      showNotification(`Listing "${selectedAd.title}" successfully approved and published!`, 'success');
      const updatedQueue = queue.filter(a => a.id !== selectedAd.id);
      setQueue(updatedQueue);
      setSelectedAd(updatedQueue.length > 0 ? updatedQueue[0] : null);
    } catch (err: any) {
      showNotification(err?.message || 'Error approving advertisement', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedAd || isProcessing) return;
    try {
      setIsProcessing(true);
      const fullNote = rejectDetails ? `${rejectReason}: ${rejectDetails}` : rejectReason;
      await adminAdService.rejectAd(selectedAd.id, fullNote);
      showNotification(`Listing #${selectedAd.id} rejected. Reason logged in audit records.`, 'success');
      setShowRejectModal(false);
      setRejectDetails('');
      const updatedQueue = queue.filter(a => a.id !== selectedAd.id);
      setQueue(updatedQueue);
      setSelectedAd(updatedQueue.length > 0 ? updatedQueue[0] : null);
    } catch (err: any) {
      showNotification(err?.message || 'Error rejecting advertisement', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!selectedAd || isProcessing) return;
    try {
      setIsProcessing(true);
      const issuesNote = changeChecklists.length > 0 ? `Issues to resolve: ${changeChecklists.join(', ')}` : 'Content requires revision';
      await adminAdService.requestChanges(selectedAd.id, issuesNote);
      showNotification(`Revision request dispatched for Listing #${selectedAd.id}.`, 'success');
      setShowChangesModal(false);
      setChangeChecklists([]);
      const updatedQueue = queue.filter(a => a.id !== selectedAd.id);
      setQueue(updatedQueue);
      setSelectedAd(updatedQueue.length > 0 ? updatedQueue[0] : null);
    } catch (err: any) {
      showNotification(err?.message || 'Error requesting changes', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 font-mono text-xs text-slate-400 gap-3">
        <div className="w-8 h-8 border-3 border-rose-100 border-t-rose-600 rounded-full animate-spin" />
        <span>Syncing active moderation queues...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#18181B]">Discreet Moderation Workspace</h2>
          <p className="text-xs text-[#667085] mt-0.5 font-mono">Process new and edited companion listings swiftly while preserving strict compliance safeguards</p>
        </div>
        <button 
          onClick={fetchQueue}
          disabled={loading || isProcessing}
          className="p-2 border border-[#E4E7EC] bg-white rounded-xl text-[#667085] hover:text-[#18181B] self-end flex items-center gap-1.5 font-mono text-xs disabled:opacity-50"
          title="Sync queue"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* FEEDBACK NOTIFICATION BANNER */}
      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-mono border flex items-center gap-2.5 transition-all ${
          feedback.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {feedback.type === 'success' ? <Check size={16} className="text-green-600 flex-shrink-0" /> : <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />}
          <span className="font-semibold">{feedback.message}</span>
        </div>
      )}

      {queue.length === 0 ? (
        <div className="bg-white border border-[#E4E7EC] p-12 text-center rounded-2xl flex flex-col items-center max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
            <ThumbsUp size={22} />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Moderation Queue Clean!</h3>
          <p className="text-xs text-slate-400 font-mono leading-relaxed">
            All user created listings and photo verification files have been vetted against standard marketplace terms. Enjoy the tranquility!
          </p>
          <button 
            onClick={fetchQueue}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-mono font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <RefreshCw size={13} />
            <span>Check For New Submissions</span>
          </button>
        </div>
      ) : (
        /* TRIPLE COLUMN WORKSPACE GRID */
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-stretch">
          
          {/* COLUMN 1: PENDING QUEUE LIST (1/4 width) */}
          <div className="bg-white border border-[#E4E7EC] rounded-2xl p-4 flex flex-col gap-4 shadow-xs h-[650px]">
            <h4 className="text-xs font-bold text-[#667085] uppercase tracking-wider font-mono">Pending Reviews ({queue.length})</h4>
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
              {queue.map(ad => {
                const isSelected = selectedAd?.id === ad.id;
                const adImage = ad.profileImage || (ad.images && ad.images[0]) || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600';
                return (
                  <button
                    key={ad.id}
                    onClick={() => setSelectedAd(ad)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 relative ${
                      isSelected 
                        ? 'bg-rose-50 border-rose-200 text-rose-800' 
                        : 'border-[#E4E7EC] bg-white hover:bg-[#F8F9FC] text-[#667085]'
                    }`}
                  >
                    <img 
                      src={adImage} 
                      alt={ad.profileName || ad.title} 
                      className="w-10 h-10 object-cover rounded-lg border flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 text-xs flex-1">
                      <h6 className={`font-bold truncate ${isSelected ? 'text-rose-950' : 'text-[#18181B]'}`}>{ad.title}</h6>
                      <span className="text-[10px] font-mono block mt-0.5 capitalize text-slate-500">
                        {ad.citySlug || 'India'} • {ad.categorySlug || 'Escorts'}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* COLUMN 2: CORE CONTENT AUDIT FRAME (2/4 width) */}
          {selectedAd && (
            <div className="xl:col-span-2 bg-white border border-[#E4E7EC] rounded-2xl p-6 flex flex-col gap-5 shadow-xs overflow-y-auto h-[650px] scrollbar-thin">
              
              {/* Category, Location Header */}
              <div className="flex justify-between items-center bg-[#F8F9FC] p-3 border rounded-xl border-[#E4E7EC] font-mono text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">Category:</span>
                  <strong className="text-[#18181B] capitalize">{selectedAd.categorySlug || 'Classified'}</strong>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={13} className="text-rose-600" />
                  <span className="text-slate-400">Metro:</span>
                  <strong className="text-[#18181B] capitalize">{selectedAd.citySlug || 'Metro City'}</strong>
                </div>
              </div>

              {/* Title & Description Vetting */}
              <div className="space-y-3">
                <h3 className="font-bold text-[#18181B] text-base border-b pb-2">{selectedAd.title}</h3>
                <div className="text-xs text-[#667085] leading-relaxed p-4 bg-slate-50 border border-slate-100 rounded-xl whitespace-pre-wrap">
                  {selectedAd.description || 'No description provided.'}
                </div>
              </div>

              {/* Interactive gallery checklist */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-[#667085] uppercase tracking-wider font-mono">Asset Imagery Gallery</h5>
                <div className="grid grid-cols-2 gap-3">
                  {(selectedAd.images && selectedAd.images.length > 0 ? selectedAd.images : [selectedAd.coverImage || selectedAd.profileImage]).filter(Boolean).map((img, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden border border-[#E4E7EC] bg-slate-100">
                      <img 
                        src={img} 
                        alt="Audited Attachment" 
                        className="w-full h-40 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/60 rounded text-[9px] font-mono text-white">
                        Frame {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom specs */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-[#667085] uppercase tracking-wider font-mono">Dynamic Vetting Attributes</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  {selectedAd.attributes && Object.entries(selectedAd.attributes).length > 0 ? (
                    Object.entries(selectedAd.attributes).map(([key, val]) => (
                      <div key={key} className="p-2.5 border border-[#E4E7EC] bg-[#F8F9FC] rounded-xl flex justify-between">
                        <span className="text-[#667085] capitalize">{key}</span>
                        <strong className="text-[#18181B]">{Array.isArray(val) ? val.join(', ') : String(val || 'N/A')}</strong>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-slate-400 text-xs italic sm:col-span-2">No custom attributes recorded.</div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* COLUMN 3: ADVERTISER DETAILS + CONTROLLER (1/4 width) */}
          {selectedAd && (
            <div className="bg-white border border-[#E4E7EC] rounded-2xl p-5 flex flex-col justify-between shadow-xs h-[650px]">
              
              {/* Context container */}
              <div className="space-y-5">
                <h4 className="text-xs font-bold text-[#667085] uppercase tracking-wider font-mono">Compliance Context</h4>
                
                {/* Advertiser details card */}
                {advertiser ? (
                  <div className="p-4 border border-[#E4E7EC] bg-[#F8F9FC] rounded-xl space-y-2">
                    <span className="text-[10px] font-mono text-[#667085] uppercase block">Advertiser Account</span>
                    <div className="flex items-center gap-3">
                      <img 
                        src={advertiser.profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(advertiser.name || 'User')}&background=random`} 
                        alt={advertiser.profile?.name || advertiser.name || 'User'} 
                        className="w-10 h-10 rounded-full object-cover border"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 font-mono text-xs">
                        <h6 className="font-bold text-[#18181B] truncate">{advertiser.profile?.name || advertiser.name}</h6>
                        <span className="text-[10px] text-[#667085] block truncate">{advertiser.email}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Status: <span className="font-bold text-green-700 capitalize">{advertiser.status || 'Active'}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-[#E4E7EC] bg-[#F8F9FC] rounded-xl text-center">
                    <p className="text-xs text-slate-400 font-mono">Advertiser # {selectedAd.userId || 'N/A'}</p>
                  </div>
                )}

                {/* Guidelines Checklist block */}
                <div className="space-y-2 text-[11px] font-mono text-slate-500">
                  <span className="text-[10px] font-bold text-[#667085] uppercase block">Mandate audit guidelines:</span>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded border-[#E4E7EC] text-rose-600 focus:ring-rose-500" />
                    <span>Age threshold verified (18+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded border-[#E4E7EC] text-rose-600 focus:ring-rose-500" />
                    <span>Safe location boundary check</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded border-[#E4E7EC] text-rose-600 focus:ring-rose-500" />
                    <span>Excludes abusive terms & prohibited media</span>
                  </div>
                </div>

              </div>

              {/* Control Deck Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-[#E4E7EC]">
                <button 
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="w-full py-2.5 bg-green-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-sm disabled:opacity-50"
                >
                  <Check size={14} />
                  <span>{isProcessing ? 'Processing...' : 'Approve & Publish'}</span>
                </button>
                
                <button 
                  onClick={() => setShowChangesModal(true)}
                  disabled={isProcessing}
                  className="w-full py-2.5 bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-amber-700 transition-all disabled:opacity-50"
                >
                  <AlertCircle size={14} />
                  <span>Request Modifications</span>
                </button>

                <button 
                  onClick={() => setShowRejectModal(true)}
                  disabled={isProcessing}
                  className="w-full py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-rose-700 transition-all disabled:opacity-50"
                >
                  <X size={14} />
                  <span>Reject Listing</span>
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* REJECT DIALOG */}
      {showRejectModal && selectedAd && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E4E7EC] shadow-2xl p-6 space-y-4">
            
            <h4 className="font-bold text-base text-rose-700 font-mono">Reject Listing Reason Mandate</h4>
            <p className="text-xs text-[#667085] leading-relaxed">
              Confirm rejection of advertisement ID <strong>{selectedAd.id}</strong>.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <label className="block text-[#667085]">Rejection Type:</label>
              <select 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400"
              >
                <option value="Incorrect category classification">Incorrect Category Classification</option>
                <option value="Suspected fraudulent representation">Suspected Fraudulent Identity</option>
                <option value="Explicit/Underage asset imagery upload">NSFW Policy Breach</option>
                <option value="Out of boundaries geo specifications">Deceptive Coordinates</option>
              </select>

              <label className="block text-[#667085]">Additional audit note:</label>
              <textarea 
                rows={2}
                placeholder="Details of visual flaws or description policy breaches..."
                value={rejectDetails}
                onChange={(e) => setRejectDetails(e.target.value)}
                className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl p-3 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#E4E7EC]">
              <button 
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-[#E4E7EC] rounded-xl text-xs font-bold text-[#667085]"
              >
                Cancel
              </button>
              <button 
                onClick={handleReject}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>

          </div>
        </div>
      )}

      {/* REQUEST MODIFICATIONS DIALOG */}
      {showChangesModal && selectedAd && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E4E7EC] shadow-2xl p-6 space-y-4">
            
            <h4 className="font-bold text-base text-amber-700 font-mono">Modifications Requirement Sheet</h4>
            <p className="text-xs text-[#667085] leading-relaxed">
              Define the required revisions for advertisement ID <strong>{selectedAd.id}</strong>.
            </p>

            <div className="space-y-3 font-mono text-xs">
              {[
                'Blurry imagery assets / high pixel distortions',
                'Incorrect companion category selected',
                'Verify WhatsApp telephone number formats',
                'Refine geo location to specify correct district area'
              ].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id={`mod-${item}`}
                    checked={changeChecklists.includes(item)}
                    onChange={(e) => {
                      if (e.target.checked) setChangeChecklists([...changeChecklists, item]);
                      else setChangeChecklists(changeChecklists.filter(x => x !== item));
                    }}
                    className="rounded border-[#E4E7EC] text-rose-600 focus:ring-rose-500"
                  />
                  <label htmlFor={`mod-${item}`} className="text-slate-700 text-[11px]">{item}</label>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#E4E7EC]">
              <button 
                onClick={() => setShowChangesModal(false)}
                className="px-4 py-2 border border-[#E4E7EC] rounded-xl text-xs font-bold text-[#667085]"
              >
                Cancel
              </button>
              <button 
                onClick={handleRequestChanges}
                className="px-4 py-2 bg-[#18181B] text-white rounded-xl text-xs font-bold"
              >
                Dispatch Correction Request
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
