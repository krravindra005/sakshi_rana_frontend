import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { AdsService } from '../../services/ads.service';
import { UsersService } from '../../services/users.service';
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
  DollarSign
} from 'lucide-react';

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
    const fetchUserData = async () => {
      // Profile & Wallet
      const prof = UsersService.getProfile();
      setProfile(prof);
      setEditName(prof.name);
      setEditPhone(prof.phone || '');

      setWallet(UsersService.getWallet());
      setTransactions(UsersService.getTransactions());

      // User Ads
      const ads = await AdsService.getMyAds();
      setMyAds(ads);

      // Favorites
      const favIds = UsersService.getFavorites();
      const allAds = await AdsService.getAll();
      const favorited = allAds.filter((ad) => favIds.includes(ad.id));
      setFavoriteAds(favorited);
    };
    fetchUserData();
  }, [activeTab]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (editName) {
      const updated = UsersService.updateProfile({ name: editName, phone: editPhone });
      setProfile(updated);
      alert('Your user profile was updated successfully.');
    }
  };

  const handleTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(topUpAmount);
    if (amount > 0) {
      const updatedWallet = UsersService.updateWalletBalance(amount, 'deposit', `UPI Top-Up Credit Deposit`);
      setWallet(updatedWallet);
      setTransactions(UsersService.getTransactions());
      setTopUpAmount('1000');
      alert(`Credits Added! Successfully topped up ${amount} credits to your advertising wallet.`);
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
                
                {/* Balance cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-sm border border-slate-800 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">ADVERTISER CREDITS</span>
                    <h3 className="text-3xl font-extrabold tracking-tight mt-1.5">{wallet?.balance} Credits</h3>
                    <p className="text-[11px] text-slate-400 mt-2">Valued at 1 INR per Credit.</p>
                  </div>

                  {/* Add Credits form */}
                  <div className="col-span-1 sm:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
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
                </div>

                {/* Ledger list */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-bold text-slate-950 text-base pb-3 border-b border-slate-100 mb-4">Transactions Ledger Logs</h3>
                  
                  <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex justify-between items-center text-xs pb-3 border-b border-slate-50 last:border-0">
                        <div>
                          <p className="font-bold text-slate-800">{tx.description}</p>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{tx.date} &bull; ID: {tx.id}</span>
                        </div>
                        <div className="text-right">
                          <span className={`font-mono font-bold text-sm ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {tx.type === 'deposit' ? '+' : '-'}{tx.amount} Credits
                          </span>
                          <span className="text-[9px] font-semibold text-emerald-500 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 block rounded-md mt-1 w-fit ml-auto">
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
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
