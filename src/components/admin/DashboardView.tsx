import React, { useState, useEffect } from 'react';
import { 
  adminDashboardService, 
  adminAdService, 
  adminReportService, 
  adminPaymentService,
  AdminReport 
} from '../../services/admin.service';
import { Ad } from '../../types/ad';
import { Payment } from '../../types/user';
import { 
  Users, 
  FileText, 
  ShieldAlert, 
  Sparkles, 
  Coins, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Eye, 
  CheckCircle, 
  ChevronRight,
  ShieldAlert as ReportIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend
} from 'recharts';

interface DashboardViewProps {
  onNavigateToTab: (tabId: string, param?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateToTab }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [pendingAds, setPendingAds] = useState<Ad[]>([]);
  const [recentReports, setRecentReports] = useState<AdminReport[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [met, chart, allAds, reports, payments] = await Promise.all([
          adminDashboardService.getOverviewMetrics(),
          adminDashboardService.getAnalyticsData(),
          adminAdService.getAllAds(),
          adminReportService.getReports(),
          adminPaymentService.getPayments()
        ]);

        setMetrics(met);
        setChartData(chart);
        
        // Filter pending ads
        setPendingAds(allAds.filter(a => a.moderationStatus === 'pending').slice(0, 5));
        setRecentReports(reports.slice(0, 5));
        setRecentPayments(payments.slice(0, 5));
      } catch (err) {
        console.error('Error loading dashboard analytics', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading || !metrics || !chartData) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-[#E4E7EC] rounded-md animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 4, 5].map(i => (
            <div key={i} className="h-28 bg-white border border-[#E4E7EC] rounded-2xl p-5 animate-pulse space-y-3">
              <div className="h-4 w-20 bg-[#E4E7EC] rounded" />
              <div className="h-8 w-12 bg-[#E4E7EC] rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-white border border-[#E4E7EC] rounded-2xl animate-pulse" />
          <div className="h-80 bg-white border border-[#E4E7EC] rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Color arrays for Donut Chart
  const PIE_COLORS = ['#E11D48', '#BE123C', '#F43F5E', '#FDA4AF'];

  return (
    <div className="space-y-8">
      
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#18181B]">Discreet Operations Command</h1>
          <p className="text-xs text-[#667085] mt-1 font-mono">Real-time indicators & market compliance console</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[#E4E7EC] text-[#18181B] px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 font-mono">
            <Clock size={12} className="text-[#667085]" />
            <span>Server Time: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* TOTAL USERS */}
        <div 
          onClick={() => onNavigateToTab('users')}
          className="bg-white border border-[#E4E7EC] rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-[#667085] tracking-wider uppercase font-mono">Total Platform Users</span>
            <div className="p-2 rounded-xl bg-slate-50 text-slate-700 group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-[#18181B]">{metrics.totalUsers}</h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-green-600 font-bold font-mono">
              <ArrowUpRight size={14} />
              <span>+{metrics.newUsers} this week</span>
            </div>
          </div>
        </div>

        {/* TOTAL ADS */}
        <div 
          onClick={() => onNavigateToTab('ads')}
          className="bg-white border border-[#E4E7EC] rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-[#667085] tracking-wider uppercase font-mono">Total Advertisements</span>
            <div className="p-2 rounded-xl bg-slate-50 text-slate-700 group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors">
              <FileText size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-[#18181B]">{metrics.totalAds}</h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-[#667085] font-semibold font-mono">
              <span className="text-green-600 font-bold">{metrics.publishedAds} live</span>
              <span>• {metrics.totalAds - metrics.publishedAds} other</span>
            </div>
          </div>
        </div>

        {/* PENDING MODERATION */}
        <div 
          onClick={() => onNavigateToTab('moderation')}
          className="bg-white border border-[#E4E7EC] rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-[#667085] tracking-wider uppercase font-mono">Awaiting Review</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-[#18181B]">{metrics.pendingModeration}</h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-bold font-mono text-amber-600">
              <span className="animate-pulse flex h-2 w-2 rounded-full bg-amber-500" />
              <span>Critical moderation load</span>
            </div>
          </div>
        </div>

        {/* OPEN REPORTS */}
        <div 
          onClick={() => onNavigateToTab('reports')}
          className="bg-white border border-[#E4E7EC] rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-[#667085] tracking-wider uppercase font-mono">Abuse Reports</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700 group-hover:bg-rose-100 transition-colors">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-rose-600">{metrics.openReports}</h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-rose-600 font-bold font-mono">
              <ArrowDownRight size={14} />
              <span>Pending resolution queue</span>
            </div>
          </div>
        </div>

      </div>

      {/* CHARTS CONTAINER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* REVENUE LINE / AREA CHART */}
        <div className="lg:col-span-2 bg-white border border-[#E4E7EC] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-sm font-bold text-[#18181B] uppercase tracking-wide">Promotions Ledger & Revenue</h4>
              <p className="text-[11px] text-[#667085] font-mono">Completed payments & direct top-up sales (INR)</p>
            </div>
            <span className="text-xs font-bold font-mono text-green-700 bg-green-50 px-2.5 py-1 rounded-xl">
              Total: ₹{metrics.totalRevenue.toLocaleString()}
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.revenueLedger} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#BE123C" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#BE123C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E7EC" />
                <XAxis dataKey="name" stroke="#667085" fontSize={10} tickLine={false} />
                <YAxis stroke="#667085" fontSize={10} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#BE123C" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CATEGORY DISTRIBUTION DONUT */}
        <div className="bg-white border border-[#E4E7EC] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-[#18181B] uppercase tracking-wide">Category Market share</h4>
            <p className="text-[11px] text-[#667085] font-mono">Distribution of active published listings</p>
          </div>
          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.categoriesShare}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.categoriesShare.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className="text-xs text-[#667085] font-mono block">Volume Weight</span>
              <span className="text-lg font-black text-[#18181B]">100%</span>
            </div>
          </div>
          {/* Pie Chart Legend list */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#667085] pt-2 border-t border-[#E4E7EC]">
            {chartData.categoriesShare.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                <span className="truncate">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CITY DEMOGRAPHICS BAR CHART */}
        <div className="bg-white border border-[#E4E7EC] rounded-2xl p-5 shadow-xs">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-[#18181B] uppercase tracking-wide">Geo Demographics (Ads by City)</h4>
            <p className="text-[11px] text-[#667085] font-mono">Vetting of listings located in primary metros</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.cityDemographics} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E7EC" />
                <XAxis dataKey="name" stroke="#667085" fontSize={10} tickLine={false} />
                <YAxis stroke="#667085" fontSize={10} tickLine={false} />
                <Tooltip />
                <Bar dataKey="ads" fill="#BE123C" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GROWTH PROGRESS MULTI-BAR */}
        <div className="bg-white border border-[#E4E7EC] rounded-2xl p-5 shadow-xs">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h4 className="text-sm font-bold text-[#18181B] uppercase tracking-wide">User Registration Speed</h4>
              <p className="text-[11px] text-[#667085] font-mono">Aggregated daily advertiser signups</p>
            </div>
            <span className="text-[10px] font-mono text-[#667085]">Daily Average: 12</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.userGrowth} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E7EC" />
                <XAxis dataKey="name" stroke="#667085" fontSize={10} tickLine={false} />
                <YAxis stroke="#667085" fontSize={10} tickLine={false} />
                <Tooltip />
                <Bar dataKey="advertisers" name="Advertisers" fill="#18181B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="moderators" name="Mods/Staff" fill="#E11D48" radius={[4, 4, 0, 0]} />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'monospace' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* BOTTOM OPERATIONAL FEEDS SECTION */}
      <div className="space-y-6">
        
        {/* PENDING MODERATION ROW */}
        <div className="bg-white border border-[#E4E7EC] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#E4E7EC] flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-[#18181B] uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Pending Moderation Queue</span>
              </h4>
              <p className="text-[11px] text-[#667085] font-mono mt-0.5">Discreet listings requiring identity & guidelines evaluation</p>
            </div>
            <button 
              onClick={() => onNavigateToTab('moderation')}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
            >
              <span>Launch workspace</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8F9FC] text-[#667085] uppercase tracking-wider font-mono border-b border-[#E4E7EC] font-bold text-[10px]">
                  <th className="p-4 pl-6">Advertisement</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Advertiser ID</th>
                  <th className="p-4">Submission Status</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC]">
                {pendingAds.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-mono">
                      Queue clear! All active listings have been evaluated.
                    </td>
                  </tr>
                ) : (
                  pendingAds.map((ad) => (
                    <tr key={ad.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <img 
                            src={ad.profileImage || ad.images[0]} 
                            alt={ad.profileName} 
                            className="w-10 h-10 object-cover rounded-lg border border-[#E4E7EC]"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex flex-col">
                            <span className="font-bold text-[#18181B] max-w-xs truncate">{ad.title}</span>
                            <span className="text-[10px] text-[#667085] font-mono">ID: {ad.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 capitalize text-[#18181B] font-semibold">{ad.categorySlug.replace('-', ' ')}</td>
                      <td className="p-4 capitalize text-[#667085] font-mono">{ad.citySlug}</td>
                      <td className="p-4 font-mono text-[#667085]">{ad.userId}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono bg-amber-50 text-amber-700 border border-amber-100">
                          PENDING VETTING
                        </span>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <button 
                          onClick={() => onNavigateToTab('moderation')}
                          className="px-3 py-1.5 bg-[#18181B] text-white hover:bg-rose-600 transition-all font-bold rounded-lg text-[10px]"
                        >
                          Review Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* BOTTOM DOUBLE GRID - RECENT REPORTS & RECENT PAYMENTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* RECENT REPORTS */}
          <div className="bg-white border border-[#E4E7EC] rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-4 border-b border-[#E4E7EC] flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#18181B] uppercase tracking-wide flex items-center gap-1.5">
                  <ReportIcon size={14} className="text-rose-500 animate-pulse" />
                  <span>Recent Safety Alerts</span>
                </h4>
                <button 
                  onClick={() => onNavigateToTab('reports')}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-bold"
                >
                  View all
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F8F9FC] text-[#667085] uppercase tracking-wider font-mono border-b border-[#E4E7EC] font-bold text-[9px]">
                      <th className="p-3 pl-4">ID</th>
                      <th className="p-3">Reason</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E7EC] font-mono">
                    {recentReports.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3 pl-4 text-slate-500 font-bold">{r.id}</td>
                        <td className="p-3 font-sans font-bold text-[#18181B] truncate max-w-[120px]" title={r.reason}>
                          {r.reason}
                        </td>
                        <td className="p-3 uppercase">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                            r.priority === 'high' || r.priority === 'critical'
                              ? 'bg-rose-100 text-rose-700' 
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {r.priority}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-[9px] font-bold uppercase text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RECENT PAYMENTS */}
          <div className="bg-white border border-[#E4E7EC] rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-4 border-b border-[#E4E7EC] flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#18181B] uppercase tracking-wide flex items-center gap-1.5">
                  <Coins size={14} className="text-green-600" />
                  <span>Recent Credits Top-ups</span>
                </h4>
                <button 
                  onClick={() => onNavigateToTab('payments')}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-bold"
                >
                  View ledger
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F8F9FC] text-[#667085] uppercase tracking-wider font-mono border-b border-[#E4E7EC] font-bold text-[9px]">
                      <th className="p-3 pl-4">Order ID</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Provider</th>
                      <th className="p-3">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E7EC] font-mono">
                    {recentPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3 pl-4 text-slate-500 font-bold">{p.orderId}</td>
                        <td className="p-3 font-bold text-[#18181B]">₹{p.amount}</td>
                        <td className="p-3 text-[#667085]">{p.paymentMethod}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            p.paymentStatus === 'completed' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            {p.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
