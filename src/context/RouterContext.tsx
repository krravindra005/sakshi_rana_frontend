import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface RouteInfo {
  path: string; // e.g. "/", "/call-girls/delhi", "/ad/aria-premium-companion-delhi", "/dashboard"
  category?: string; // parsed from /[category]/[city]
  city?: string; // parsed from /[category]/[city]
  adSlug?: string; // parsed from /ad/[slug]
  subPath?: string; // e.g. "ads", "favorites", "wallet", "profile" from /dashboard/[subPath]
  searchParams: Record<string, string>;
}

interface RouterContextType {
  route: RouteInfo;
  navigateTo: (path: string, queryParams?: Record<string, string | string[]>) => void;
  setQueryParams: (params: Record<string, string | string[] | null>) => void;
  isLoading: boolean;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

// Helper to parse current URL into RouteInfo
const parseUrl = (): RouteInfo => {
  const pathname = window.location.pathname;
  const search = window.location.search;
  const searchParamsObj = new URLSearchParams(search);
  const searchParams: Record<string, string> = {};
  
  searchParamsObj.forEach((value, key) => {
    searchParams[key] = value;
  });

  const segments = pathname.split('/').filter(Boolean);
  const routeInfo: RouteInfo = {
    path: pathname,
    searchParams,
  };

  if (segments.length === 0) {
    // Homepage
    routeInfo.path = '/';
  } else if (segments[0] === 'login') {
    routeInfo.path = '/login';
  } else if (segments[0] === 'register' || segments[0] === 'signup') {
    routeInfo.path = '/register';
  } else if (segments[0] === 'search') {
    routeInfo.path = '/category-city';
  } else if (segments[0] === 'ad' && segments[1]) {
    // /ad/[slug]
    routeInfo.path = '/ad';
    routeInfo.adSlug = segments[1];
  } else if (segments[0] === 'dashboard') {
    // /dashboard or /dashboard/[subPath]
    routeInfo.path = '/dashboard';
    routeInfo.subPath = segments[1] || 'ads'; // defaults to ads
  } else if (segments[0] === 'admin') {
    // /admin, /admin/[subPath], /admin/[subPath]/[id]
    routeInfo.path = '/admin';
    routeInfo.subPath = segments[1] || 'dashboard';
    if (segments[2]) {
      routeInfo.adSlug = segments[2];
    }
  } else if (segments[0] === 'post-ad') {
    routeInfo.path = '/post-ad';
  } else if (segments[0] === 'safety') {
    routeInfo.path = '/safety';
  } else if (segments[0] === 'report') {
    routeInfo.path = '/report';
  } else if (segments[0] === 'terms') {
    routeInfo.path = '/terms';
  } else if (segments[0] === 'privacy') {
    routeInfo.path = '/privacy';
  } else if (segments.length === 2) {
    // /[category]/[city]
    routeInfo.path = '/category-city';
    routeInfo.category = segments[0];
    routeInfo.city = segments[1];
  } else if (segments.length === 1) {
    // /[category]
    routeInfo.path = '/category-city';
    routeInfo.category = segments[0];
  }

  return routeInfo;
};

export const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<RouteInfo>(parseUrl());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseUrl());
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigateTo = (path: string, queryParams?: Record<string, string | string[]>) => {
    setIsLoading(true);
    
    // Construct query string
    let queryString = '';
    if (queryParams && Object.keys(queryParams).length > 0) {
      const qParams = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, val]) => {
        if (Array.isArray(val)) {
          val.forEach(v => qParams.append(key, v));
        } else if (val) {
          qParams.append(key, val);
        }
      });
      const str = qParams.toString();
      if (str) queryString = `?${str}`;
    }

    const targetUrl = `${path}${queryString}`;
    window.history.pushState(null, '', targetUrl);
    setRoute(parseUrl());
    
    // Smooth scroll to top and fast simulate transition
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  };

  const setQueryParams = (params: Record<string, string | string[] | null>) => {
    const currentParams = new URLSearchParams(window.location.search);
    
    Object.entries(params).forEach(([key, val]) => {
      if (val === null) {
        currentParams.delete(key);
      } else if (Array.isArray(val)) {
        currentParams.delete(key);
        val.forEach(v => currentParams.append(key, v));
      } else {
        currentParams.set(key, val);
      }
    });

    const queryString = currentParams.toString();
    const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`;
    
    window.history.replaceState(null, '', newUrl);
    setRoute(parseUrl());
  };

  return (
    <RouterContext.Provider value={{ route, navigateTo, setQueryParams, isLoading }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};
