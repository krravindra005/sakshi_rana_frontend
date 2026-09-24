import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { AdsService } from '../../services/ads.service';
import { UsersService } from '../../services/users.service';
import { WalletService } from '../../services/wallet.service';
import { FavoritesService } from '../../services/favorites.service';
import { Ad } from '../../types/ad';
import { UserProfile, UserWallet, WalletTransaction } from '../../types/user';
import { 
  FolderHeart, 
  Heart, 
  Wallet, 
  Settings, 
  Lock, 
  Trash2, 
  Pause, 
  Play, 
  TrendingUp, 
  PlusCircle, 
  Eye, 
  ShieldAlert, 
  Check, 
  Smartphone,
  ChevronRight,
  ListFilter,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Send,
  Flame,
  Coins,
  CheckCircle2,
  XCircle,
  X
} from 'lucide-react';
import { PointsService } from '../../services/points.service';
import { PointRequest, AdPointRequirements } from '../../types/api';

interface UserDashboardProps {
  initialTab?: string;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ initialTab }) => {
  const { route, navigateTo } = useRouter();
  
  // Tabs: 'ads', 'favorites', 'wallet', 'profile', 'security'
  const [activeTab, setActiveTab] = useState<string>(initialTab || route.subPath || 'ads');

  // Local state
  const [myAds, setMyAds] = useState<Ad[]>([]);
  const [favoriteAds, setFavoriteAds] = useState<Ad[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  
  // Point Requests & Ad Point Requirements
  const [pointRequests, setPointRequests] = useState<PointRequest[]>([]);
  const [adPointStats, setAdPointStats] = useState<AdPointRequirements | null>(null);
  const [fundingMode, setFundingMode] = useState<'request' | 'topup'>('request');
  const [requestPointsAmount, setRequestPointsAmount] = useState('500');
  const [requestPointsReason, setRequestPointsReason] = useState('');
  const [isSubmittingPointRequest, setIsSubmittingPointRequest] = useState(false);
  const [pointRequestFeedback, setPointRequestFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'credit' | 'debit'>('all');
  
  // Wallet top-up form
  const [topUpAmount, setTopUpAmount] = useState('1000');
  
  // Form edit states
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // 1. Sync active tab on subpath change
  useEffect(() => {
    if (route.subPath) {
      setActiveTab(route.subPath);
    }
  }, [route.subPath]);

  // 2. Fetch all user data
  useEffect(() => {
    let mounted = true;
    const fetchUserData = async () => {
      // Profile & Wallet
      const prof = UsersService.getProfile();
      if (mounted) {
        setProfile(prof);
        setEditName(prof.name);
        setEditPhone(prof.phone || '');
      }

      try {
        const w = await WalletService.getWallet();
        if (mounted) setWallet({ balance: w.balance || 0, currency: w.currency_code || 'Credits' });
      } catch {
        if (mounted) setWallet(UsersService.getWallet());
      }

      try {
        const txs = await WalletService.getTransactions();
        if (mounted) {
          setTransactions(txs.map((tx: any) => ({
            id: String(tx.id || tx.uuid),
            amount: Number(tx.amount || 0),
            type: tx.type || 'deposit',
            direction: tx.direction || (tx.type === 'deposit' || tx.type === 'admin_credit' ? 'credit' : 'debit'),
            description: tx.description || 'Wallet transaction',
            date: tx.created_at ? new Date(tx.created_at).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'Today',
            status: tx.status || 'completed',
            balance_before: tx.balance_before,
            balance_after: tx.balance_after,
            reference_id: tx.reference_id,
          })));
        }
      } catch {
        if (mounted) setTransactions(UsersService.getTransactions());
      }

      // Point Requests & Ad Stats
      try {
        const [reqs, adStats] = await Promise.all([
          PointsService.getMyRequests(),
          PointsService.getAdPointsRequirement(),
        ]);
        if (mounted) {
          setPointRequests(reqs);
          setAdPointStats(adStats);
        }
      } catch (err) {
        console.error('Failed to load point stats:', err);
      }

      // User Ads
      try {
        const ads = await AdsService.getMyAds();
        if (mounted) setMyAds(ads);
      } catch {
        if (mounted) setMyAds([]);
      }

      // Favorites
      try {
        const favs = await FavoritesService.getAll();
        if (mounted) setFavoriteAds(favs);
      } catch {
        if (mounted) setFavoriteAds([]);
      }
    };
    fetchUserData();
    return () => { mounted = false; };
  }, [activeTab]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editName) {
      const updated = await UsersService.updateProfile({ name: editName, phone: editPhone });
      setProfile(updated);
      alert('Your user profile was updated successfully.');
    }
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(topUpAmount);
    if (amount > 0) {
      const updatedWallet = await UsersService.updateWalletBalance(amount, 'deposit', `UPI Top-Up Credit Deposit`);
      setWallet(updatedWallet);
      const txs = await WalletService.getTransactions();
      setTransactions(txs.map((tx: any) => ({
        id: String(tx.id || tx.uuid),
        amount: Number(tx.amount || 0),
        type: tx.type || 'deposit',
        description: tx.description || 'Wallet transaction',
        date: tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-US') : 'Today',
        status: tx.status || 'completed'
      })));
      setTopUpAmount('1000');
      alert(`Credits Top Up Order Initialized! Amount: ${amount} credits.`);
    }
  };

  const handlePointRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const points = parseFloat(requestPointsAmount);
    if (!points || points <= 0) {
      setPointRequestFeedback({ type: 'error', text: 'Please enter a valid points quantity greater than 0.' });
      return;
    }

    try {
      setIsSubmittingPointRequest(true);
      setPointRequestFeedback(null);
      await PointsService.submitRequest(points, requestPointsReason);
      setPointRequestFeedback({
        type: 'success',
        text: `Point request for ${points} Points submitted successfully! Super Admin will review your request.`,
      });
      setRequestPointsReason('');

      // Refresh data
      const [reqs, adStats, w, txs] = await Promise.all([
        PointsService.getMyRequests(),
        PointsService.getAdPointsRequirement(),
        WalletService.getWallet(),
        WalletService.getTransactions()
      ]);
      setPointRequests(reqs);
      setAdPointStats(adStats);
      setWallet({ balance: w.balance || 0, currency: w.currency_code || 'Credits' });
      setTransactions(txs.map((tx: any) => ({
        id: String(tx.id || tx.uuid),
        amount: Number(tx.amount || 0),
        type: tx.type || 'deposit',
        direction: tx.direction || (tx.type === 'deposit' || tx.type === 'admin_credit' ? 'credit' : 'debit'),
        description: tx.description || 'Wallet transaction',
        date: tx.created_at ? new Date(tx.created_at).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Today',
        status: tx.status || 'completed',
        balance_before: tx.balance_before,
        balance_after: tx.balance_after,
        reference_id: tx.reference_id,
      })));
    } catch (err: any) {
      setPointRequestFeedback({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to submit point request. Please try again.',
      });
    } finally {
      setIsSubmittingPointRequest(false);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (confirm('Are you sure you want to delete this advertisement publication permanently? This cannot be undone.')) {
      const deleted = await AdsService.deleteAd(adId);
      if (deleted) {
        setMyAds(myAds.filter((ad) => ad.id !== adId));
      }
    }
  };

  const handlePromoteAd = (ad: Ad) => {
    try {
      // Deduct promotion credits
      const updatedWallet = UsersService.updateWalletBalance(
        500, 
        'spend', 
        `Promoted "${ad.profileName}" to Featured publication`
      );
      setWallet(updatedWallet);
      setTransactions(UsersService.getTransactions());
      alert(`Promotion Active! "${ad.profileName}" has been promoted to Featured for the next 7 days.`);
    } catch (err: any) {
      alert(err.message || 'Failed to apply promotion.');
    }
  };

  return (
    <div className="bg-[#fcfcfd] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Dashboard Title Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Account</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Manage your publisher advertisements, favorite companion portfolios, and promotion wallets.</p>
          </div>
          
          <button
            onClick={() => navigateTo('/post-ad')}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Advertisement</span>
          </button>
        </div>

        {/* WORKSPACE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* NAVIGATION SIDEBAR */}
          <aside className="space-y-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm h-fit">
            
            {/* Short Profile summary card */}
            {profile && (
              <div className="p-3 mb-4 rounded-xl bg-slate-50 border border-slate-100/50 text-center">
                <div className="w-14 h-14 bg-slate-900 text-white font-bold rounded-full overflow-hidden mx-auto mb-2.5">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    profile.name[0]
                  )}
                </div>
                <h4 className="font-bold text-slate-900 text-sm leading-tight truncate">{profile.name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{profile.email}</p>
                {wallet && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex items-center justify-between text-xs font-semibold text-slate-700 font-mono">
                    <span>Balance:</span>
                    <span className="text-indigo-600">{wallet.balance} Credits</span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => { setActiveTab('ads'); navigateTo('/dashboard/ads'); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition ${
                activeTab === 'ads' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PlusCircle className="w-4.5 h-4.5 shrink-0" />
                <span>My Advertisements</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${activeTab === 'ads' ? 'bg-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                {myAds.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('favorites'); navigateTo('/dashboard/favorites'); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition ${
                activeTab === 'favorites' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4.5 h-4.5 shrink-0" />
                <span>Favorite Collections</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${activeTab === 'favorites' ? 'bg-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                {favoriteAds.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('wallet'); navigateTo('/dashboard/wallet'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl transition ${
                activeTab === 'wallet' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Wallet className="w-4.5 h-4.5 shrink-0" />
              <span>Wallet & Transactions</span>
            </button>

            <button
              onClick={() => { setActiveTab('profile'); navigateTo('/dashboard/profile'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl transition ${
                activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Settings className="w-4.5 h-4.5 shrink-0" />
              <span>Publisher Profile Settings</span>
            </button>

            <button
              onClick={() => { setActiveTab('security'); navigateTo('/dashboard/security'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl transition ${
                activeTab === 'security' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Lock className="w-4.5 h-4.5 shrink-0" />
              <span>Security Logs & 2FA</span>
            </button>
          </aside>

          {/* MAIN TAB CONTENT DISPLAY */}
          <main className="col-span-1 lg:col-span-3 space-y-6">
            
            {/* SUB-TAB 1: MY ADS */}
            {activeTab === 'ads' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900">My Advertisement Publications</h2>
                  <span className="text-xs font-mono text-slate-400 font-semibold">{myAds.length} registered listings</span>
                </div>

                {myAds.length === 0 ? (
                  <div className="text-center py-12 max-w-sm mx-auto space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                      <ListFilter className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-800">No active postings yet</h3>
                    <p className="text-slate-500 text-xs">Publish your first independent companion or therapeutic massage advertisement to begin generating view metrics.</p>
                    <button
                      onClick={() => navigateTo('/post-ad')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-sm"
                    >
                      Post Ad Wizard
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myAds.map((ad) => (
                      <div 
                        key={ad.id} 
                        className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
                      >
                        <div className="flex gap-3.5 items-center">
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                            <img src={ad.profileImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <span className="text-[9px] font-bold font-mono tracking-wide text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/20 uppercase">
                              Pending Review
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm mt-1">{ad.title}</h4>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mt-0.5">
                              <span className="capitalize">{ad.citySlug}</span>
                              <span>&bull;</span>
                              <span className="capitalize">{ad.categorySlug.replace('-', ' ')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions buttons */}
                        <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 justify-end">
                          <button
                            onClick={() => navigateTo(`/ad/${ad.slug}`)}
                            className="p-2 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                            title="Preview listing page"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                          
                          <button
                            onClick={() => handlePromoteAd(ad)}
                            className="p-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-sm"
                            title="Boost listing views"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Promote</span>
                          </button>

                          <button
                            onClick={() => handleDeleteAd(ad.id)}
                            className="p-2 hover:bg-rose-50 border border-slate-200 text-rose-600 hover:text-rose-700 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                            title="Delete publication"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 2: FAVORITES */}
            {activeTab === 'favorites' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900">Saved Favorites</h2>
                  <span className="text-xs font-mono text-slate-400 font-semibold">{favoriteAds.length} files saved</span>
                </div>

                {favoriteAds.length === 0 ? (
                  <div className="text-center py-12 max-w-sm mx-auto space-y-2">
                    <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                      <Heart className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-800">No saved favorites yet</h3>
                    <p className="text-slate-500 text-xs">Tap the heart icon on any classified companion profile card to build your customized collection.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {favoriteAds.map((ad) => (
                      <div 
                        key={ad.id} 
                        onClick={() => navigateTo(`/ad/${ad.slug}`)}
                        className="group bg-slate-50/50 rounded-xl border border-slate-100/80 p-3 flex gap-3 cursor-pointer hover:bg-slate-100/30 transition duration-200"
                      >
                        <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                          <img src={ad.profileImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-0.5 overflow-hidden">
                          <div>
                            <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition truncate text-xs sm:text-sm">
                              {ad.profileName}
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">
                              {ad.title}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono capitalize">
                            <span>{ad.citySlug} &bull; {ad.attributes.bodyType}</span>
                            <span className="font-bold text-indigo-600">View Profile &rarr;</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 3: WALLET */}
            {activeTab === 'wallet' && (
              <div className="space-y-6">
                
                {/* 1. TOP BALANCE & ACQUISITION DECK */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left: Advertiser Credits Card (Matches Image 2) */}
                  <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-sm border border-slate-800 relative overflow-hidden flex flex-col justify-between min-h-[180px]">
                    <div className="absolute right-0 top-0 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
                        ADVERTISER CREDITS
                      </span>
                      <h3 className="text-3xl font-extrabold tracking-tight mt-1.5 font-mono">
                        {wallet?.balance ?? 0} Credits
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-2">Valued at 1 INR per Credit.</p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Daily Burn:</span>
                      <span className="font-bold text-amber-400">
                        {adPointStats?.user_daily_burn_rate ?? adPointStats?.daily_points_required ?? 50} pts/day
                      </span>
                    </div>
                  </div>

                  {/* Right: Dual Acquisition Form (Request Points from Admin / Top-up UPI) */}
                  <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setFundingMode('request')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition ${
                            fundingMode === 'request'
                              ? 'bg-white text-indigo-600 shadow-xs'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          Request Points from Admin
                        </button>
                        <button
                          type="button"
                          onClick={() => setFundingMode('topup')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition ${
                            fundingMode === 'topup'
                              ? 'bg-white text-indigo-600 shadow-xs'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          Deposit Advertising Credits (UPI)
                        </button>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                        {fundingMode === 'request' ? 'Admin Grant' : 'Instant Top-Up'}
                      </span>
                    </div>

                    {/* Mode A: Request Points from Super Admin */}
                    {fundingMode === 'request' && (
                      <form onSubmit={handlePointRequestSubmit} className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-semibold text-slate-500">Quick Select:</span>
                          {[100, 500, 5000].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setRequestPointsAmount(String(amt))}
                              className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition ${
                                requestPointsAmount === String(amt)
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                              }`}
                            >
                              ${amt.toLocaleString()}
                            </button>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="relative flex items-center border border-slate-200 rounded-xl bg-slate-50 px-3 focus-within:border-indigo-500 focus-within:bg-white">
                            <Coins className="w-4 h-4 text-slate-400 absolute left-3.5" />
                            <input
                              id="request-points-input"
                              type="number"
                              required
                              min="1"
                              max="100000"
                              value={requestPointsAmount}
                              onChange={(e) => setRequestPointsAmount(e.target.value)}
                              className="w-full pl-6 py-2 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-800 font-semibold"
                              placeholder="Points (e.g. 500)"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <input
                              type="text"
                              value={requestPointsReason}
                              onChange={(e) => setRequestPointsReason(e.target.value)}
                              placeholder="Purpose (e.g. 5-day Mumbai ad campaign)"
                              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                          <p className="text-[10px] text-slate-400">
                            Submit point request for Super Admin review. Points credit automatically to your existing wallet upon approval.
                          </p>
                          <button
                            type="submit"
                            disabled={isSubmittingPointRequest}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-5 rounded-xl transition shadow flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0"
                          >
                            <Send size={13} />
                            <span>{isSubmittingPointRequest ? 'Submitting...' : 'Submit Request'}</span>
                          </button>
                        </div>

                        {pointRequestFeedback && (
                          <div className={`p-2.5 rounded-xl text-xs font-mono font-medium flex items-center gap-2 ${
                            pointRequestFeedback.type === 'success' 
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>
                            {pointRequestFeedback.type === 'success' ? (
                              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                            ) : (
                              <XCircle size={14} className="text-rose-600 shrink-0" />
                            )}
                            <span>{pointRequestFeedback.text}</span>
                          </div>
                        )}
                      </form>
                    )}

                    {/* Mode B: Direct UPI Top-up (Matches Image 2 exactly) */}
                    {fundingMode === 'topup' && (
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm mb-3">Deposit Advertising Credits</h3>
                        <form onSubmit={handleTopUp} className="flex gap-3">
                          <div className="flex-1 relative flex items-center border border-slate-200 rounded-xl bg-slate-50 px-3">
                            <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5" />
                            <input
                              id="top-up-credits-input"
                              type="number"
                              required
                              min="100"
                              value={topUpAmount}
                              onChange={(e) => setTopUpAmount(e.target.value)}
                              className="w-full pl-6 py-2 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-800 font-semibold"
                              placeholder="Credits"
                            />
                          </div>
                          <button
                            id="btn-topup-submit"
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 px-6 rounded-xl transition shadow"
                          >
                            Top-up UPI
                          </button>
                        </form>
                        <p className="text-[10px] text-slate-400 mt-2">Instant credit deposits. Accepted via all major UPI, Netbanking, and Wallets.</p>
                      </div>
                    )}

                  </div>

                </div>

                {/* 2. ADVERTISEMENT POINTS CONSUMPTION & RUNWAY CARD */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                        <Flame className="w-4 h-4 text-amber-500" />
                        <span>Daily Advertisement Points Consumption</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Active advertisements consume daily points automatically according to the configured system rate.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 w-fit">
                      Rate: {adPointStats?.daily_points_required ?? 50} Points / Day
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Available Points</span>
                      <span className="text-xl font-mono font-extrabold text-slate-900">
                        {wallet?.balance ?? 0}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Daily Points Required</span>
                      <span className="text-xl font-mono font-extrabold text-indigo-600">
                        {adPointStats?.daily_points_required ?? 50} <span className="text-xs font-normal text-slate-400">/ ad</span>
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Points Already Used</span>
                      <span className="text-xl font-mono font-extrabold text-slate-600">
                        {adPointStats?.points_already_used ?? 0}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Remaining Ad Runway</span>
                      <span className={`text-xl font-mono font-extrabold ${
                        (adPointStats?.estimated_days_remaining ?? 0) > 3 ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        ~{adPointStats?.estimated_days_remaining ?? 0} <span className="text-xs font-normal text-slate-400">Days</span>
                      </span>
                    </div>
                  </div>

                  {/* Runway advice alert */}
                  <div className={`p-3 rounded-xl text-xs font-mono flex items-center justify-between gap-3 ${
                    (wallet?.balance ?? 0) >= (adPointStats?.daily_points_required ?? 50)
                      ? 'bg-emerald-50/70 border border-emerald-100 text-emerald-800'
                      : 'bg-amber-50/70 border border-amber-100 text-amber-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        (wallet?.balance ?? 0) >= (adPointStats?.daily_points_required ?? 50) ? 'bg-emerald-500' : 'bg-amber-500'
                      }`} />
                      <span>
                        {(wallet?.balance ?? 0) >= (adPointStats?.daily_points_required ?? 50)
                          ? `You have sufficient point balance for ~${adPointStats?.estimated_days_remaining ?? 0} continuous publication days.`
                          : 'Your point balance is below the daily running rate. Request points or deposit credits to ensure your ads are not paused.'}
                      </span>
                    </div>
                    {fundingMode !== 'request' && (
                      <button
                        onClick={() => setFundingMode('request')}
                        className="underline font-bold hover:opacity-80 shrink-0"
                      >
                        Request Points &rarr;
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. MY POINT REQUESTS TABLE */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-bold text-slate-950 text-base">My Point Requests to Super Admin</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Track point allocation ticket statuses and review outcomes</p>
                    </div>
                    <span className="text-xs font-mono text-slate-400 font-semibold">
                      {pointRequests.length} Requests
                    </span>
                  </div>

                  {pointRequests.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400 font-mono space-y-2">
                      <Coins className="w-8 h-8 text-slate-300 mx-auto" />
                      <p>You haven't requested any points from the Super Admin yet.</p>
                      <button
                        onClick={() => { setFundingMode('request'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="text-indigo-600 font-bold hover:underline"
                      >
                        Submit your first Point Request &uarr;
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pointRequests.map((req) => (
                        <div 
                          key={req.id} 
                          className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">
                                {Number(req.points).toLocaleString()} Points
                              </span>
                              {req.status === 'pending' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                  Pending Review
                                </span>
                              )}
                              {req.status === 'approved' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <Check size={11} className="text-emerald-600" />
                                  Approved & Credited
                                </span>
                              )}
                              {req.status === 'rejected' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                  <X size={11} className="text-rose-600" />
                                  Declined
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-600 mt-1">
                              {req.reason || 'General campaign points request'}
                            </p>

                            <div className="text-[10px] text-slate-400 font-mono mt-1 flex flex-wrap gap-2">
                              <span>Submitted: {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'Today'}</span>
                              <span>&bull;</span>
                              <span>Ticket #{req.id}</span>
                              {req.admin_notes && (
                                <>
                                  <span>&bull;</span>
                                  <span className="italic text-slate-500">Admin: {req.admin_notes}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            {req.status === 'approved' && (
                              <span className="font-mono font-bold text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                                +{req.points} Credited
                              </span>
                            )}
                            {req.status === 'pending' && (
                              <span className="text-[11px] text-slate-400 font-mono">
                                Awaiting Admin
                              </span>
                            )}
                            {req.status === 'rejected' && (
                              <span className="text-[11px] text-rose-500 font-mono font-medium">
                                Not Credited
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. TRANSACTIONS LEDGER LOGS (Matches Image 2 heading & layout) */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <h3 className="font-bold text-slate-950 text-base">Transactions Ledger Logs</h3>
                    
                    {/* Direction filter pills */}
                    <div className="flex gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
                      {(['all', 'credit', 'debit'] as const).map((dir) => (
                        <button
                          key={dir}
                          onClick={() => setLedgerFilter(dir)}
                          className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold capitalize transition ${
                            ledgerFilter === dir
                              ? 'bg-white text-indigo-600 shadow-xs'
                              : 'text-slate-400 hover:text-slate-700'
                          }`}
                        >
                          {dir === 'all' ? 'All Moves' : dir === 'credit' ? '+ Credits' : '- Debits'}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
                    {transactions
                      .filter((tx) => ledgerFilter === 'all' || tx.direction === ledgerFilter)
                      .map((tx) => (
                        <div key={tx.id} className="flex justify-between items-center text-xs pb-3 border-b border-slate-50 last:border-0">
                          <div>
                            <p className="font-bold text-slate-800">{tx.description}</p>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                              {tx.date} &bull; ID: {tx.id}
                              {tx.balance_before !== undefined && tx.balance_after !== undefined && (
                                <> &bull; Bal: {tx.balance_before} &rarr; {tx.balance_after} Credits</>
                              )}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className={`font-mono font-bold text-sm ${
                              tx.direction === 'credit' || tx.type === 'deposit' || tx.type === 'admin_credit'
                                ? 'text-emerald-600'
                                : 'text-rose-600'
                            }`}>
                              {tx.direction === 'credit' || tx.type === 'deposit' || tx.type === 'admin_credit' ? '+' : '-'}
                              {tx.amount} Credits
                            </span>
                            <span className="text-[9px] font-semibold text-emerald-500 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 block rounded-md mt-1 w-fit ml-auto">
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      ))}

                    {transactions.length === 0 && (
                      <div className="py-8 text-center text-xs text-slate-400 font-mono">
                        No transactions recorded yet.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* SUB-TAB 4: PROFILE EDIT */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="pb-4 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900">Publisher Profile Configurations</h2>
                  <p className="text-slate-500 text-xs mt-0.5">Edit credentials used for verification audits and advertiser registration.</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Full Name</label>
                    <input
                      id="edit-profile-name"
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:bg-white transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={profile?.email || ''}
                      className="w-full text-sm bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-slate-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400">Contact support to update verified advertiser email addresses.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Primary Helpline Phone</label>
                    <input
                      id="edit-profile-phone"
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:bg-white transition"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <button
                      id="profile-save-submit"
                      type="submit"
                      className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 px-6 rounded-xl transition shadow"
                    >
                      Save Configuration
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SUB-TAB 5: SECURITY */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="pb-4 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900">Privacy & Security Controls</h2>
                  <p className="text-slate-500 text-xs mt-0.5">Control two-factor authentication and inspect active account sessions.</p>
                </div>

                {/* 2FA Panel */}
                <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex gap-3">
                    <div className="p-2.5 bg-white border border-indigo-100 text-indigo-600 rounded-xl shrink-0 h-fit shadow-sm">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Two-Factor Authentication (2FA)</h4>
                      <p className="text-slate-500 text-xs mt-0.5">Secure advertiser logins by requiring a verification code sent to your mobile.</p>
                    </div>
                  </div>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-1.5 px-3.5 rounded-lg transition shadow-sm shrink-0">
                    Activate 2FA
                  </button>
                </div>

                {/* Security audit list */}
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-3">Active Sessions Log</h3>
                  <div className="space-y-2 font-mono text-[11px] text-slate-500 bg-slate-50 p-4 border border-slate-100 rounded-xl">
                    <div className="flex justify-between py-1 border-b border-slate-200/50">
                      <span>IP Address: 192.168.1.1 (Current)</span>
                      <span className="text-emerald-600 font-bold uppercase">ACTIVE</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/50">
                      <span>IP Address: 110.22.45.109 (Jul 18, 02:08)</span>
                      <span>Chrome / Linux</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>IP Address: 99.4.102.50 (Jul 12, 10:14)</span>
                      <span>Safari / macOS</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </main>
        </div>

      </div>
    </div>
  );
};
