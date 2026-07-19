import React, { useState, useEffect } from 'react';
import { RouterProvider, useRouter } from './context/RouterContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { AgeGate } from './components/layout/AgeGate';
import { AdvancedSearchProvider } from './context/AdvancedSearchContext';
import { AdvancedSearchModal } from './components/advanced-search/AdvancedSearchModal';

// Marketplace subpages
import { HeroSearch } from './components/marketplace/HeroSearch';
import { CategoryGrid } from './components/marketplace/CategoryGrid';
import { CityBrowse } from './components/marketplace/CityBrowse';
import { FeaturedAds } from './components/marketplace/FeaturedAds';
import { LatestAds } from './components/marketplace/LatestAds';
import { PopularSeoLinks } from './components/marketplace/PopularSeoLinks';

// Faceted Classified listings grid
import { ListingGrid } from './components/listings/ListingGrid';
// Classified detail view
import { ListingDetail } from './components/listings/ListingDetail';
// Multi-step publication wizard
import { PostAdWizard } from './components/forms/PostAdWizard';
// Advertiser / consumer dashboard
import { UserDashboard } from './components/dashboard/UserDashboard';
// Trust & Safety resources
import { SafetyGuide } from './components/safety/SafetyGuide';
// Legal papers
import { LegalPages } from './components/legal/LegalPages';

// Secure Auth and Verification
import { AuthPage } from './components/auth/AuthPage';
import { UsersService } from './services/users.service';

// Admin Panel Core Components
import { AdminLayout, AdminRole } from './components/admin/AdminLayout';
import { DashboardView } from './components/admin/DashboardView';
import { AdsView } from './components/admin/AdsView';
import { UsersView } from './components/admin/UsersView';
import { ModerationView } from './components/admin/ModerationView';
import { ReportsView } from './components/admin/ReportsView';
import { BusinessView } from './components/admin/BusinessView';
import { SeoView } from './components/admin/SeoView';
import { SettingsView } from './components/admin/SettingsView';
import { FolderTree } from 'lucide-react';

function AppContent() {
  const { route, navigateTo, isLoading } = useRouter();
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  
  // Real reactive auth states
  const [isLoggedIn, setIsLoggedIn] = useState(UsersService.isLoggedIn());
  const [isVerified, setIsVerified] = useState(UsersService.isFullyVerified());
  const [adminRole, setAdminRole] = useState<AdminRole>('Super Admin');

  useEffect(() => {
    const isConfirmed = localStorage.getItem('age_confirmed_18') === 'true';
    setAgeConfirmed(isConfirmed);
  }, []);

  useEffect(() => {
    const handleAuthStateChange = () => {
      setIsLoggedIn(UsersService.isLoggedIn());
      setIsVerified(UsersService.isFullyVerified());
    };
    window.addEventListener('auth_state_changed', handleAuthStateChange);
    return () => window.removeEventListener('auth_state_changed', handleAuthStateChange);
  }, []);

  const handleAgeConfirm = () => {
    setAgeConfirmed(true);
  };

  const handleAgeReject = () => {
    // Discreetly redirect minors away
    window.location.href = 'https://www.google.com';
  };

  const showAuthGate = !isLoggedIn || !isVerified;
  const isAdminRoute = route.path === '/admin';

  if (isAdminRoute) {
    return (
      <AdminLayout activeRole={adminRole} setActiveRole={setAdminRole}>
        {route.subPath === 'dashboard' && <DashboardView />}
        {route.subPath === 'ads' && <AdsView activeRole={adminRole} />}
        {route.subPath === 'moderation' && <ModerationView />}
        {route.subPath === 'reports' && <ReportsView />}
        {route.subPath === 'users' && (
          <UsersView 
            activeRole={adminRole} 
            onNavigateToTab={(tab) => navigateTo(`/admin/${tab}`)} 
          />
        )}
        {route.subPath === 'categories' && (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#E4E7EC] font-mono text-xs text-[#667085]">
            <FolderTree className="mx-auto mb-3 text-rose-600 animate-bounce" size={32} />
            Categories & dynamic attribute schemas config table (Vetted in Schema Foundation stage).
          </div>
        )}
        {(route.subPath === 'promotions' || route.subPath === 'payments' || route.subPath === 'wallet') && (
          <BusinessView activeRole={adminRole} />
        )}
        {route.subPath === 'seo' && <SeoView />}
        {(route.subPath === 'settings' || route.subPath === 'audit') && <SettingsView />}
      </AdminLayout>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-indigo-500 selection:text-white">
      
      {/* AgeGate verification overlay barrier */}
      <AgeGate 
        onConfirm={handleAgeConfirm} 
        onReject={handleAgeReject} 
        onPageChange={(path) => navigateTo(path)} 
      />

      {/* Advanced Search Overlay */}
      <AdvancedSearchModal />

      {/* Global Header navigation bar */}
      <Header />

      {/* Main loading router skeleton placeholder */}
      {isLoading ? (
        <div className="flex-1 flex flex-col justify-center items-center py-24 bg-[#fcfcfd]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mt-4">
            Securing discreet connection...
          </p>
        </div>
      ) : showAuthGate ? (
        <div className="flex-1">
          <AuthPage initialMode={!isLoggedIn ? 'login' : 'verify_email'} />
        </div>
      ) : (
        <div className="flex-1">
          
          {/* HOME SCREEN PATH: "/" */}
          {route.path === '/' && (
            <div className="space-y-12 sm:space-y-16 pb-16 bg-[#fcfcfd]">
              <HeroSearch />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                <CategoryGrid />
                <CityBrowse />
                <FeaturedAds />
                <LatestAds />
                <PopularSeoLinks />
              </div>
            </div>
          )}

          {/* CLASSIFIED LISTINGS HUB PATH: "/category-city" */}
          {route.path === '/category-city' && (
            <ListingGrid 
              categorySlug={route.category} 
              citySlug={route.city} 
            />
          )}

          {/* CLASSIFIED DETAIL VIEW PATH: "/ad" */}
          {route.path === '/ad' && (
            <ListingDetail 
              slug={route.adSlug || ''} 
            />
          )}

          {/* USER DASHBOARD PATH: "/dashboard" */}
          {route.path === '/dashboard' && (
            <UserDashboard 
              initialTab={route.subPath} 
            />
          )}

          {/* MULTI-STEP CREATION WIZARD PATH: "/post-ad" */}
          {route.path === '/post-ad' && (
            <PostAdWizard />
          )}

          {/* TRUST & SAFETY GUIDE PATH: "/safety" or "/report" */}
          {(route.path === '/safety' || route.path === '/report') && (
            <SafetyGuide />
          )}

          {/* TERMS & AGREEMENTS PATH: "/terms" */}
          {route.path === '/terms' && (
            <LegalPages type="terms" />
          )}

          {/* PRIVACY STATEMENTS PATH: "/privacy" */}
          {route.path === '/privacy' && (
            <LegalPages type="privacy" />
          )}

        </div>
      )}

      {/* Global Footer metadata & support disclosures */}
      <Footer />

    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AdvancedSearchProvider>
        <AppContent />
      </AdvancedSearchProvider>
    </RouterProvider>
  );
}
