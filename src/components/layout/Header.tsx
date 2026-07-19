import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAdvancedSearch } from '../../context/AdvancedSearchContext';
import { CategoriesService } from '../../services/categories.service';
import { LocationsService } from '../../services/locations.service';
import { UsersService } from '../../services/users.service';
import { Category } from '../../types/category';
import { City } from '../../types/location';
import { 
  Sparkles, 
  MapPin, 
  ChevronDown, 
  PlusCircle, 
  User, 
  Search, 
  Menu, 
  X, 
  ShieldCheck, 
  LogOut, 
  FolderHeart,
  Settings,
  HelpCircle,
  SlidersHorizontal,
  LogIn
} from 'lucide-react';

export const Header: React.FC = () => {
  const { route, navigateTo } = useRouter();
  const { openSearch } = useAdvancedSearch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real reactive auth states
  const [isLoggedIn, setIsLoggedIn] = useState(UsersService.isLoggedIn());
  const [currentUser, setCurrentUser] = useState(UsersService.getProfile());
  const [wallet, setWallet] = useState(UsersService.getWallet());

  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  const megaMenuRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Subscribe to auth state updates and fetch data
  useEffect(() => {
    CategoriesService.getAll().then(setCategories);
    LocationsService.getCities().then(setCities);

    const handleAuthStateChange = () => {
      setIsLoggedIn(UsersService.isLoggedIn());
      setCurrentUser(UsersService.getProfile());
      setWallet(UsersService.getWallet());
    };
    window.addEventListener('auth_state_changed', handleAuthStateChange);
    return () => window.removeEventListener('auth_state_changed', handleAuthStateChange);
  }, []);


  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setIsMegaMenuOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setIsLocationDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo('/category-city', { q: searchQuery.trim() });
      setSearchQuery('');
    }
  };

  const handleSelectCity = (citySlug: string) => {
    setIsLocationDropdownOpen(false);
    // Find active category slug or default to first category, or just search by city
    const activeCategory = route.category || 'call-girls';
    navigateTo(`/${activeCategory}/${citySlug}`);
  };

  const currentCityName = cities.find(c => c.slug === route.city)?.name || 'Select Location';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigateTo('/')}
              className="flex items-center gap-2 text-slate-900 group"
              id="header-logo"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 text-amber-400 font-bold transition-transform group-hover:scale-105">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight font-sans">
                AURA<span className="text-amber-500 font-light text-sm tracking-wider uppercase ml-1">Classifieds</span>
              </span>
            </button>

            {/* Desktop Location Selector */}
            <div className="hidden md:relative" ref={locationRef}>
              <button
                id="location-selector-btn"
                onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-lg border border-slate-200/50 transition"
              >
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{currentCityName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Location Dropdown */}
              {isLocationDropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-xl bg-white border border-slate-100 shadow-lg py-2 z-50">
                  <p className="text-xs font-semibold text-slate-400 px-4 py-1 uppercase tracking-wider font-mono">Popular Cities</p>
                  <div className="max-h-64 overflow-y-auto mt-1">
                    {cities.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => handleSelectCity(city.slug)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition flex items-center justify-between ${
                          route.city === city.slug ? 'text-indigo-600 font-semibold bg-indigo-50/30' : 'text-slate-700'
                        }`}
                      >
                        <span>{city.name}</span>
                        <span className="text-xs text-slate-400 font-mono">{city.activeAdsCount} ads</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center flex-1 max-w-sm relative">
            <input
              id="desktop-search-input"
              type="text"
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={() => openSearch({ q: searchQuery || undefined })}
              className="w-full pl-9 pr-10 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-500 focus:bg-white transition cursor-pointer"
              readOnly
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <button
              type="button"
              onClick={() => openSearch({ q: searchQuery || undefined })}
              className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 transition"
              title="Advanced Search"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-3" ref={megaMenuRef}>
            {/* Mega Menu Toggle */}
            <div className="relative">
              <button
                id="mega-menu-trigger"
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                className={`flex items-center gap-1 py-2 px-3 text-sm font-medium rounded-lg transition ${
                  isMegaMenuOpen ? 'text-slate-900 bg-slate-50' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Categories</span>
                <ChevronDown className={`w-4 h-4 transition ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega Menu Container */}
              {isMegaMenuOpen && (
                <div className="absolute right-0 lg:-right-36 mt-2 w-[540px] rounded-2xl bg-white border border-slate-100 shadow-xl p-5 grid grid-cols-2 gap-4 z-50">
                  {categories.map((cat) => (
                    <div key={cat.id} className="border-r border-slate-50 last:border-0 pr-3">
                      <h4 
                        onClick={() => {
                          setIsMegaMenuOpen(false);
                          navigateTo(`/${cat.slug}/delhi`);
                        }}
                        className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5 cursor-pointer hover:text-indigo-600"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {cat.name}
                      </h4>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        {cat.popularCities.slice(0, 4).map((city) => (
                          <button
                            key={city}
                            onClick={() => {
                              setIsMegaMenuOpen(false);
                              const citySlug = city.toLowerCase();
                              navigateTo(`/${cat.slug}/${citySlug}`);
                            }}
                            className="text-left text-xs text-slate-500 hover:text-indigo-600 transition truncate py-0.5"
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="col-span-2 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">All companion listings are verified. No direct explicit contents are hosted.</span>
                    <button 
                      onClick={() => { setIsMegaMenuOpen(false); navigateTo('/safety'); }}
                      className="text-indigo-600 hover:underline font-semibold"
                    >
                      Safety Center
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => navigateTo('/safety')}
              className="py-2 px-3 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg transition"
            >
              Safety Guide
            </button>
          </nav>

          {/* CTA & Account actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            
            {/* Post Ad CTA */}
            <button
              id="btn-post-ad"
              onClick={() => navigateTo('/post-ad')}
              className="hidden md:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs lg:text-sm py-2 px-3 lg:px-4 rounded-lg shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Your Ad</span>
            </button>

            {/* Account Selector */}
            {isLoggedIn ? (
              <div className="relative" ref={profileRef}>
                <button
                  id="profile-dropdown-btn"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 pr-1 hidden md:block" />
                </button>

                {/* Account Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-100 shadow-xl py-2 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-mono text-slate-500">Wallet: {wallet.balance.toLocaleString()} {wallet.currency}</span>
                      </div>
                    </div>
                    
                    <div className="p-1">
                      <button
                        onClick={() => { setIsProfileDropdownOpen(false); navigateTo('/dashboard', { tab: 'ads' }); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition"
                      >
                        <FolderHeart className="w-4 h-4 text-slate-400" />
                        My Advertisements
                      </button>
                      <button
                        onClick={() => { setIsProfileDropdownOpen(false); navigateTo('/dashboard', { tab: 'favorites' }); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition"
                      >
                        <FolderHeart className="w-4 h-4 text-slate-400" />
                        Favorite Collections
                      </button>
                      <button
                        onClick={() => { setIsProfileDropdownOpen(false); navigateTo('/dashboard', { tab: 'wallet' }); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        Wallet & Promotions
                      </button>
                      <button
                        onClick={() => { setIsProfileDropdownOpen(false); navigateTo('/dashboard', { tab: 'profile' }); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        Profile Settings
                      </button>
                    </div>
                    <div className="border-t border-slate-50 p-1">
                      <button
                        onClick={() => { setIsProfileDropdownOpen(false); UsersService.logout(); navigateTo('/'); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50/50 rounded-lg transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="header-signin-btn"
                onClick={() => navigateTo('/')}
                className="py-2 px-4 border border-indigo-200 hover:bg-indigo-50/30 text-indigo-700 font-semibold text-xs lg:text-sm rounded-lg transition"
              >
                Sign In
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg md:hidden transition"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white animate-in slide-in-from-top-4 duration-200">
          <div className="px-4 pt-3 pb-6 space-y-4">
            
            {/* Mobile Post Ad CTA */}
            <button
              onClick={() => { setIsMobileMenuOpen(false); navigateTo('/post-ad'); }}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm transition"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Post Your Ad</span>
            </button>

            {/* Mobile Location */}
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1.5 uppercase font-mono tracking-wider">Select Location</p>
              <div className="grid grid-cols-3 gap-2">
                {cities.slice(0, 6).map((city) => (
                  <button
                    key={city.id}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSelectCity(city.slug);
                    }}
                    className={`py-1.5 px-2 text-xs text-center border rounded-lg font-medium transition ${
                      route.city === city.slug 
                        ? 'bg-slate-900 text-white border-slate-900' 
                        : 'bg-slate-50 text-slate-700 border-slate-200/60 hover:bg-slate-100'
                    }`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Search */}
            <form onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(e); setIsMobileMenuOpen(false); }} className="relative">
              <input
                id="mobile-search-input"
                type="text"
                placeholder="Search premium ads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={() => { setIsMobileMenuOpen(false); openSearch({ q: searchQuery || undefined }); }}
                className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none cursor-pointer"
                readOnly
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => { setIsMobileMenuOpen(false); openSearch({ q: searchQuery || undefined }); }}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
                title="Advanced Search"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </form>

            {/* Mobile Categories */}
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2 uppercase font-mono tracking-wider">Browse Categories</p>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigateTo(`/${cat.slug}/delhi`);
                    }}
                    className="w-full flex items-center justify-between py-2 px-3 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition"
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs text-slate-400 font-mono">{cat.listingCount} ads</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
              <button
                onClick={() => { setIsMobileMenuOpen(false); navigateTo('/safety'); }}
                className="flex items-center gap-2 py-2 px-3 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition text-left w-full"
              >
                <HelpCircle className="w-4.5 h-4.5 text-slate-400" />
                Trust & Safety Center
              </button>
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); navigateTo('/dashboard'); }}
                    className="flex items-center gap-2 py-2 px-3 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition text-left w-full"
                  >
                    <User className="w-4.5 h-4.5 text-slate-400" />
                    My Account
                  </button>
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); UsersService.logout(); navigateTo('/'); }}
                    className="flex items-center gap-2 py-2 px-3 text-sm text-rose-600 hover:bg-rose-50/50 rounded-lg transition text-left w-full"
                  >
                    <LogOut className="w-4.5 h-4.5 text-rose-400" />
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setIsMobileMenuOpen(false); navigateTo('/'); }}
                  className="flex items-center gap-2 py-2 px-3 text-sm text-indigo-600 hover:bg-indigo-50/50 rounded-lg font-bold transition text-left w-full"
                >
                  <LogIn className="w-4.5 h-4.5 text-indigo-500" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
