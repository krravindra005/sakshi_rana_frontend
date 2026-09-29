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
import { CategoriesView } from './components/admin/CategoriesView';
import { LocationsView } from './components/admin/LocationsView';
import { BusinessView } from './components/admin/BusinessView';
import { SeoView } from './components/admin/SeoView';
import { SettingsView } from './components/admin/SettingsView';
import { AuditLogsView } from './components/admin/AuditLogsView';
import { PointRequestsView } from './components/admin/PointRequestsView';
import { FolderTree, ShieldAlert, Lock, ArrowLeft } from 'lucide-react';

function AppContent() {
  const { route, navigateTo, isLoading } = useRouter();
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  
  // Real reactive auth states
  const [isLoggedIn, setIsLoggedIn] = useState(UsersService.isLoggedIn());
  const [isVerified, setIsVerified] = useState(UsersService.isFullyVerified());
  const [currentUser, setCurrentUser] = useState(UsersService.getProfile());
  const [adminRole, setAdminRole] = useState<AdminRole>('Super Admin');

  useEffect(() => {
    const isConfirmed = localStorage.getItem('age_confirmed_18') === 'true';
    setAgeConfirmed(isConfirmed);
  }, []);

  useEffect(() => {
    const handleAuthStateChange = () => {
      setIsLoggedIn(UsersService.isLoggedIn());
      setIsVerified(UsersService.isFullyVerified());
      setCurrentUser(UsersService.getProfile());
    };
    window.addEventListener('auth_state_changed', handleAuthStateChange);

    // Dynamically fetch and verify latest authenticated user from the database
    if (UsersService.isLoggedIn()) {
      UsersService.fetchCurrentUser().catch(() => {});
    }

    return () => window.removeEventListener('auth_state_changed', handleAuthStateChange);
  }, []);

  const handleAgeConfirm = () => {
    setAgeConfirmed(true);
  };

  const handleAgeReject = () => {
    window.location.href = 'https://www.google.com';
  };

  const isAuthRoute = route.path === '/login' || route.path === '/register';
  const isUserProtectedRoute = route.path === '/post-ad' || route.path === '/dashboard';
  const isAdminRoute = route.path === '/admin' || route.path.startsWith('/admin/');

  // Consistent super_admin role check
  const userRole = (currentUser?.role || currentUser?.roles?.[0])?.toLowerCase().replace(/\s+/g, '_');
  const userRoles = (currentUser?.roles || (currentUser?.role ? [currentUser.role] : [])).map(r => r.toLowerCase().replace(/\s+/g, '_'));
  const isSuperAdmin = isLoggedIn && (userRole === 'super_admin' || userRoles.includes('super_admin'));

  // Synchronize adminRole state with real logged-in user role if available
  useEffect(() => {
    if (currentUser?.role || (currentUser?.roles && currentUser.roles.length > 0)) {
      const roleName = (currentUser.roles?.[0] || currentUser.role)?.toLowerCase().replace(/\s+/g, '_');
      if (roleName === 'super_admin') setAdminRole('Super Admin');
      else if (roleName === 'admin') setAdminRole('Admin');
      else if (roleName === 'moderator') setAdminRole('Moderator');
      else if (roleName === 'finance') setAdminRole('Finance');
      else if (roleName === 'support') setAdminRole('Support');
    }
  }, [currentUser]);

  // Route Guard Redirection Effect (Prevents setState-in-render warning)
  useEffect(() => {
    // 1. Unauthenticated users trying to access protected user or admin routes
    if (!isLoggedIn && (isUserProtectedRoute || isAdminRoute)) {
      const currentFullUrl = window.location.pathname + window.location.search;
      navigateTo(`/login?redirect=${encodeURIComponent(currentFullUrl)}`);
    } 
    // 2. Already authenticated users landing on /login or /register
    else if (isAuthRoute && isLoggedIn && isVerified) {
      const redirect = route.searchParams.redirect ? decodeURIComponent(route.searchParams.redirect) : null;
      if (isSuperAdmin) {
        if (redirect && redirect.startsWith('/admin')) {
          navigateTo(redirect);
        } else {
          navigateTo('/admin/dashboard');
        }
      } else {
        // Advertiser or other non-super-admin
        if (redirect && !redirect.startsWith('/admin')) {
          navigateTo(redirect);
        } else {
          navigateTo('/dashboard');
        }
      }
    } 
    // 3. Super Admin Route Protection: If non-super_admin (such as advertiser) enters admin URL directly, redirect to Customer Dashboard
    else if (isAdminRoute && isLoggedIn && !isSuperAdmin) {
      navigateTo('/dashboard');
    }
  }, [isLoggedIn, isVerified, isUserProtectedRoute, isAdminRoute, isAuthRoute, route.searchParams.redirect, isSuperAdmin]);

  // 1. AUTHENTICATION ROUTE GUARD FOR PROTECTED USER ROUTES
  if (isUserProtectedRoute && !isLoggedIn) {
    return null;
  }

  // 2. AUTHENTICATION & AUTHORIZATION ROUTE GUARD FOR ADMIN ROUTES
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return null;
    }

    if (!isSuperAdmin) {
      // 403 Forbidden Access Page for non-super-admin logged-in users (e.g. advertiser)
      return (
        <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-50">
          <ShieldAlert className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">403 - Access Denied</h1>
          <p className="text-slate-600 max-w-md mb-6 font-mono text-sm">
            Super Admin role required. You do not have permission to access the Super Admin Console.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => navigateTo('/dashboard')} 
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Lock size={16} /> Customer Dashboard
            </button>
            <button 
              onClick={() => navigateTo('/')} 
              className="px-6 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium hover:bg-slate-100 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={16} /> Go to Marketplace
            </button>
          </div>
        </div>
      );
    }

    // Admin layout render
    return (
      <AdminLayout activeRole={adminRole} setActiveRole={setAdminRole}>
        {(route.subPath === 'dashboard' || !route.subPath) && <DashboardView onNavigateToTab={(tab) => navigateTo(`/admin/${tab}`)} />}
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
          <CategoriesView activeRole={adminRole} />
        )}
        {route.subPath === 'locations' && (
          <LocationsView activeRole={adminRole} />
        )}
        {(route.subPath === 'promotions' || route.subPath === 'payments' || route.subPath === 'wallet') && (
          <BusinessView activeRole={adminRole} />
        )}
        {(route.subPath === 'point-requests' || route.subPath === 'ad-points') && (
          <PointRequestsView activeRole={adminRole} />
        )}
        {route.subPath === 'seo' && <SeoView />}
        {route.subPath === 'settings' && <SettingsView onNavigateToAudit={() => navigateTo('/admin/audit')} />}
        {route.subPath === 'audit' && <AuditLogsView />}
      </AdminLayout>
    );
  }

  // 3. AUTH PAGE RENDER (/login or /register)
  if (isAuthRoute) {
    if (isLoggedIn && isVerified) {
      return null;
    }

    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <div className="flex-1">
          <AuthPage initialMode={route.path === '/register' ? 'signup' : 'login'} />
        </div>
        <Footer />
      </div>
    );
  }

  // 4. MAIN PUBLIC MARKETPLACE LAYOUT
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
      ) : isUserProtectedRoute && !isVerified ? (
        <div className="flex-1">
          <AuthPage initialMode="verify_email" />
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

          {/* CLASSIFIED LISTINGS HUB PATH: "/category-city" or "/search" */}
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
