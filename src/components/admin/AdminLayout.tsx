import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { 
  Sparkles, 
  LayoutDashboard, 
  FileText, 
  ShieldAlert, 
  Users, 
  FolderTree, 
  DollarSign, 
  Search, 
  Settings, 
  Menu, 
  X, 
  ShieldCheck, 
  Coins, 
  Layers, 
  Globe, 
  UserCheck, 
  LogOut,
  ChevronRight,
  User,
  Bell
} from 'lucide-react';

export type AdminRole = 'Super Admin' | 'Admin' | 'Moderator' | 'Finance' | 'Support';

interface SidebarItem {
  id: string;
  name: string;
  icon: any;
  roles: AdminRole[];
  badge?: number;
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

interface AdminLayoutProps {
  children: React.ReactNode;
  activeRole: AdminRole;
  setActiveRole: (role: AdminRole) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeRole, setActiveRole }) => {
  const { route, navigateTo } = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Define sidebar menu options grouped by domain
  const menuGroups: SidebarGroup[] = [
    {
      title: 'DASHBOARD',
      items: [
        { id: 'dashboard', name: 'Overview', icon: LayoutDashboard, roles: ['Super Admin', 'Admin', 'Moderator', 'Finance', 'Support'] }
      ]
    },
    {
      title: 'MARKETPLACE',
      items: [
        { id: 'ads', name: 'Advertisements', icon: FileText, roles: ['Super Admin', 'Admin', 'Moderator'], badge: 3 },
        { id: 'moderation', name: 'Moderation Queue', icon: ShieldCheck, roles: ['Super Admin', 'Admin', 'Moderator'], badge: 2 },
        { id: 'reports', name: 'Reports & Abuse', icon: ShieldAlert, roles: ['Super Admin', 'Admin', 'Moderator', 'Support'], badge: 1 }
      ]
    },
    {
      title: 'USERS',
      items: [
        { id: 'users', name: 'User Directory', icon: Users, roles: ['Super Admin', 'Admin', 'Support'] }
      ]
    },
    {
      title: 'CONFIGURATION',
      items: [
        { id: 'categories', name: 'Categories & Filters', icon: FolderTree, roles: ['Super Admin', 'Admin'] }
      ]
    },
    {
      title: 'BUSINESS & FINANCE',
      items: [
        { id: 'promotions', name: 'Promotions Catalog', icon: Sparkles, roles: ['Super Admin', 'Admin', 'Finance'] },
        { id: 'payments', name: 'Fiat Payments', icon: DollarSign, roles: ['Super Admin', 'Admin', 'Finance'] },
        { id: 'wallet', name: 'Wallet Ledger', icon: Coins, roles: ['Super Admin', 'Admin', 'Finance'] }
      ]
    },
    {
      title: 'CONTENT',
      items: [
        { id: 'seo', name: 'SEO Management', icon: Globe, roles: ['Super Admin', 'Admin'] }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'settings', name: 'Global Settings', icon: Settings, roles: ['Super Admin', 'Admin'] },
        { id: 'audit', name: 'Security Audit Logs', icon: Layers, roles: ['Super Admin', 'Admin'] }
      ]
    }
  ];

  const rolesList: AdminRole[] = ['Super Admin', 'Admin', 'Moderator', 'Finance', 'Support'];

  const hasAccess = (itemRoles: AdminRole[]) => {
    return itemRoles.includes(activeRole);
  };

  const currentTab = route.subPath || 'dashboard';

  const handleNav = (tabId: string) => {
    navigateTo(`/admin/${tabId}`);
    setMobileDrawerOpen(false);
  };

  const getBreadcrumb = () => {
    const matched = menuGroups.flatMap(g => g.items).find(i => i.id === currentTab);
    return matched ? matched.name : 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#18181B] flex flex-col antialiased">
      
      {/* Dynamic Simulation Role Banner */}
      <div className="bg-rose-950 text-rose-100 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-rose-900/40 font-mono">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="font-semibold uppercase tracking-wider">ADMIN SIMULATOR CONTROL DECK</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Active Persona Role:</span>
          <div className="flex bg-rose-900/60 rounded-md p-0.5 border border-rose-800">
            {rolesList.map((role) => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  activeRole === role 
                    ? 'bg-rose-600 text-white shadow-sm' 
                    : 'text-rose-300 hover:text-white'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 relative overflow-hidden">
        
        {/* DESKTOP SIDEBAR */}
        <aside 
          className={`hidden md:flex flex-col bg-white border-r border-[#E4E7EC] transition-all duration-300 relative z-20 ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Logo Brand Frame */}
          <div className="p-5 border-b border-[#E4E7EC] flex items-center justify-between gap-3 h-16">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-800 flex items-center justify-center text-white font-bold flex-shrink-0">
                <Sparkles size={18} className="animate-pulse" />
              </div>
              {!sidebarCollapsed && (
                <div className="flex flex-col">
                  <span className="font-bold text-sm tracking-tight text-[#18181B]">DISCREET</span>
                  <span className="text-[10px] text-[#667085] font-semibold tracking-widest font-mono uppercase">Control Panel</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
            {menuGroups.map((group, gIdx) => {
              const visibleItems = group.items.filter(item => hasAccess(item.roles));
              if (visibleItems.length === 0) return null;

              return (
                <div key={gIdx} className="space-y-1.5">
                  {!sidebarCollapsed && (
                    <h5 className="text-[10px] font-bold text-[#667085] tracking-widest uppercase pl-3 mb-2 font-mono">
                      {group.title}
                    </h5>
                  )}
                  {visibleItems.map((item) => {
                    const isActive = currentTab === item.id;
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNav(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative ${
                          isActive 
                            ? 'bg-rose-50 text-rose-700 font-semibold shadow-sm border border-rose-100' 
                            : 'text-[#667085] hover:bg-[#F8F9FC] hover:text-[#18181B]'
                        }`}
                      >
                        <Icon size={18} className={isActive ? 'text-rose-600' : 'text-[#667085]'} />
                        {!sidebarCollapsed && <span className="text-sm">{item.name}</span>}
                        
                        {/* Badges */}
                        {item.badge && !sidebarCollapsed && (
                          <span className="ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                            {item.badge}
                          </span>
                        )}

                        {/* Active Dot indicator on collapsed sidebar */}
                        {isActive && sidebarCollapsed && (
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-rose-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Collapsed Toggle Footer */}
          <div className="p-4 border-t border-[#E4E7EC] flex items-center justify-between gap-3 bg-[#F8F9FC]">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                  MB
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold truncate text-[#18181B]">Marcus Brody</span>
                  <span className="text-[9px] text-[#667085] truncate font-mono uppercase">{activeRole}</span>
                </div>
              </div>
            )}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg border border-[#E4E7EC] bg-white text-[#667085] hover:text-[#18181B] shadow-sm ml-auto"
            >
              <ChevronRight size={14} className={`transform transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
            </button>
          </div>
        </aside>

        {/* MOBILE SLIDE-OUT DRAWER OVERLAY */}
        {mobileDrawerOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          >
            <aside 
              className="w-72 bg-white h-full shadow-2xl flex flex-col relative animate-slide-right"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-[#E4E7EC] flex items-center justify-between h-16 bg-[#F8F9FC]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold">
                    <Sparkles size={16} />
                  </div>
                  <span className="font-extrabold text-sm text-[#18181B]">DISCREET ADMIN</span>
                </div>
                <button 
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-lg text-[#667085] hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {menuGroups.map((group, gIdx) => {
                  const visibleItems = group.items.filter(item => hasAccess(item.roles));
                  if (visibleItems.length === 0) return null;

                  return (
                    <div key={gIdx} className="space-y-1.5">
                      <h5 className="text-[10px] font-bold text-[#667085] tracking-widest pl-3 mb-1 uppercase font-mono">
                        {group.title}
                      </h5>
                      {visibleItems.map((item) => {
                        const isActive = currentTab === item.id;
                        const Icon = item.icon;

                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNav(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                              isActive 
                                ? 'bg-rose-50 text-rose-700 font-semibold' 
                                : 'text-[#667085] hover:bg-[#F8F9FC] hover:text-[#18181B]'
                            }`}
                          >
                            <Icon size={18} className={isActive ? 'text-rose-600' : 'text-[#667085]'} />
                            <span className="text-sm">{item.name}</span>
                            {item.badge && (
                              <span className="ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-[#E4E7EC] bg-[#F8F9FC] flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-extrabold text-xs">
                  MB
                </div>
                <div className="flex flex-col min-w-0 mr-auto">
                  <span className="text-xs font-bold truncate text-[#18181B]">Marcus Brody</span>
                  <span className="text-[10px] text-[#667085] uppercase font-mono">{activeRole}</span>
                </div>
                <button 
                  onClick={() => navigateTo('/')}
                  className="p-1.5 rounded-lg border border-[#E4E7EC] bg-white text-rose-600 hover:text-rose-700 shadow-sm"
                  title="Return to Public Site"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* MAIN BODY LAYOUT */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          
          {/* TOP ACTION HEADER */}
          <header className="sticky top-0 bg-white border-b border-[#E4E7EC] h-16 flex items-center justify-between px-4 sm:px-6 z-10 shadow-sm">
            
            {/* Left Header Box */}
            <div className="flex items-center gap-3 min-w-0">
              <button 
                onClick={() => setMobileDrawerOpen(true)}
                className="md:hidden p-1.5 rounded-lg border border-[#E4E7EC] text-[#667085] hover:text-[#18181B]"
              >
                <Menu size={20} />
              </button>
              
              <div className="hidden md:flex items-center gap-2 text-xs font-medium text-[#667085] font-mono">
                <span>ADMIN</span>
                <ChevronRight size={12} className="text-slate-300" />
                <span className="text-slate-400">PAGES</span>
                <ChevronRight size={12} className="text-slate-300" />
                <span className="text-[#18181B] font-bold tracking-tight uppercase">{getBreadcrumb()}</span>
              </div>
            </div>

            {/* Middle Search Frame */}
            <div className="hidden lg:flex items-center relative max-w-sm w-full mx-8">
              <Search size={16} className="absolute left-3 text-slate-400" />
              <input 
                type="text" 
                placeholder="Global admin database search..." 
                className="w-full bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-rose-400 font-mono transition-all"
              />
            </div>

            {/* Right Quick Controls */}
            <div className="flex items-center gap-4">
              
              {/* Notifications bell */}
              <button className="p-2 text-[#667085] hover:bg-slate-100 rounded-lg relative">
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
              </button>

              {/* Public Site Action Button */}
              <button 
                onClick={() => navigateTo('/')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-[#E4E7EC] text-[#667085] hover:text-[#18181B] rounded-xl text-xs font-semibold bg-white shadow-xs transition-all"
              >
                <span>View Public Site</span>
                <LogOut size={13} />
              </button>

              {/* User Dropdown Frame */}
              <div className="relative">
                <button 
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="flex items-center gap-2 p-1 rounded-xl border border-[#E4E7EC] hover:bg-slate-50 transition-all bg-white shadow-xs"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black text-xs uppercase shadow-sm">
                    {activeRole[0]}
                  </div>
                  <span className="hidden sm:inline text-xs font-bold text-[#18181B] pr-1 font-mono">
                    {activeRole}
                  </span>
                </button>

                {/* Dropdown list for changing Active Role */}
                {showRoleMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-[#E4E7EC] shadow-xl py-1 z-50">
                    <div className="px-3 py-1.5 border-b border-[#E4E7EC] bg-[#F8F9FC]">
                      <span className="text-[10px] font-bold text-[#667085] block font-mono">SIMULATION PERSONA</span>
                    </div>
                    {rolesList.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setActiveRole(r);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs transition-all flex items-center justify-between ${
                          activeRole === r 
                            ? 'bg-rose-50 text-rose-700 font-bold' 
                            : 'text-[#667085] hover:bg-[#F8F9FC] hover:text-[#18181B]'
                        }`}
                      >
                        <span>{r}</span>
                        {activeRole === r && <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </header>

          {/* MAIN PAGE WRAPPER CONTAINER */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in">
            {children}
          </main>

        </div>

      </div>

    </div>
  );
};
