import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  BarChart3, 
  Users, 
  Eye, 
  ShoppingCart, 
  TrendingUp, 
  Clock,
  RefreshCw,
  Loader2,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Calendar,
  UserCheck,
  UserX,
  UsersRound,
  Sparkles,
  ListFilter,
  ExternalLink,
  MapPin,
  Chrome,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { format, subDays, parseISO, addHours } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useTranslation } from '../components/translations/TranslationProvider';

const COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const activityTypeLabels = {
  page_view: 'Vizualizare Pagină',
  login: 'Autentificare',
  logout: 'Deconectare',
  signup: 'Înregistrare',
  configurator_start: 'Configurator Început',
  configurator_complete: 'Configurator Finalizat',
  add_to_cart: 'Adăugat în Coș',
  remove_from_cart: 'Șters din Coș',
  checkout_start: 'Checkout Început',
  order_placed: 'Comandă Plasată',
  product_view: 'Vizualizare Produs'
};

const deviceIcons = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  unknown: Globe
};

const convertToRomaniaTime = (utcDateString) => {
  const date = new Date(utcDateString);
  const year = date.getUTCFullYear();
  
  const dstStart = new Date(Date.UTC(year, 2, 31));
  dstStart.setUTCDate(31 - dstStart.getUTCDay());
  dstStart.setUTCHours(1, 0, 0, 0);
  
  const dstEnd = new Date(Date.UTC(year, 9, 31));
  dstEnd.setUTCDate(31 - dstEnd.getUTCDay());
  dstEnd.setUTCHours(1, 0, 0, 0);
  
  const isDST = date >= dstStart && date < dstEnd;
  const hoursOffset = isDST ? 3 : 2;
  
  return addHours(date, hoursOffset);
};

export default function Analytics() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7');
  const [userFilter, setUserFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.ActivityLog.list('-created_date', 2000);
      setLogs(data || []);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    const days = parseInt(dateRange);
    const cutoff = subDays(new Date(), days);
    
    let filtered = logs.filter(log => new Date(log.created_date) >= cutoff);
    
    if (userFilter === 'anonymous') {
      filtered = filtered.filter(log => !log.user_id || log.user_id === null);
    } else if (userFilter === 'authenticated') {
      filtered = filtered.filter(log => log.user_id && log.user_id !== null);
    }

    if (activityTypeFilter !== 'all') {
      filtered = filtered.filter(log => log.activity_type === activityTypeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.page_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ip_address?.includes(searchTerm) ||
        log.browser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.country?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [logs, dateRange, userFilter, activityTypeFilter, searchTerm]);

  const stats = useMemo(() => {
    const uniqueUsers = new Set(filteredLogs.filter(l => l.user_email).map(l => l.user_email)).size;
    const uniqueSessions = new Set(filteredLogs.map(l => l.session_id)).size;
    const anonymousSessions = new Set(filteredLogs.filter(l => !l.user_id).map(l => l.session_id)).size;
    const authenticatedSessions = uniqueSessions - anonymousSessions;
    const pageViews = filteredLogs.filter(l => l.activity_type === 'page_view').length;
    const conversions = filteredLogs.filter(l => l.activity_type === 'order_placed').length;
    const avgDuration = filteredLogs
      .filter(l => l.duration_seconds)
      .reduce((sum, l) => sum + l.duration_seconds, 0) / 
      filteredLogs.filter(l => l.duration_seconds).length || 0;

    return {
      uniqueUsers,
      uniqueSessions,
      anonymousSessions,
      authenticatedSessions,
      pageViews,
      conversions,
      avgDuration: Math.round(avgDuration),
      conversionRate: uniqueSessions > 0 ? ((conversions / uniqueSessions) * 100).toFixed(1) : 0
    };
  }, [filteredLogs]);

  const activityByType = useMemo(() => {
    const counts = {};
    filteredLogs.forEach(log => {
      counts[activityTypeLabels[log.activity_type] || log.activity_type] = (counts[activityTypeLabels[log.activity_type] || log.activity_type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredLogs]);

  const deviceBreakdown = useMemo(() => {
    const counts = {};
    filteredLogs.forEach(log => {
      counts[log.device_type || 'unknown'] = (counts[log.device_type || 'unknown'] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredLogs]);

  const userTypeBreakdown = useMemo(() => {
    const anonymous = filteredLogs.filter(l => !l.user_id).length;
    const authenticated = filteredLogs.filter(l => l.user_id).length;
    return [
      { name: t('analytics.anonymous'), value: anonymous },
      { name: t('analytics.authenticated'), value: authenticated }
    ];
  }, [filteredLogs, t]);

  const pageViewsOverTime = useMemo(() => {
    const days = parseInt(dateRange);
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = filteredLogs.filter(l => 
        l.activity_type === 'page_view' && 
        format(parseISO(l.created_date), 'yyyy-MM-dd') === dateStr
      ).length;
      data.push({
        date: format(date, 'dd MMM', { locale: ro }),
        views: count
      });
    }
    return data;
  }, [filteredLogs, dateRange]);

  const topPages = useMemo(() => {
    const pageCounts = {};
    filteredLogs
      .filter(l => l.activity_type === 'page_view' && l.page_name)
      .forEach(log => {
        pageCounts[log.page_name] = (pageCounts[log.page_name] || 0) + 1;
      });
    return Object.entries(pageCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredLogs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gray-200 dark:border-slate-700 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">{t('loadingAnalytics')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full" style={{backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')"}}></div>
        </div>
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1 tracking-tight">{t('analytics.title')}</h1>
              <p className="text-blue-100 text-sm">{t('analytics.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-40 h-9 bg-white/10 border-white/20 text-white text-xs rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <UsersRound className="w-3.5 h-3.5" />
                    {t('analytics.allVisitors')}
                  </div>
                </SelectItem>
                <SelectItem value="anonymous">
                  <div className="flex items-center gap-2">
                    <UserX className="w-3.5 h-3.5" />
                    {t('analytics.anonymousOnly')}
                  </div>
                </SelectItem>
                <SelectItem value="authenticated">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5" />
                    {t('analytics.authenticatedOnly')}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32 h-9 bg-white/10 border-white/20 text-white text-xs rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{t('analytics.today')}</SelectItem>
                <SelectItem value="7">{t('analytics.last7Days')}</SelectItem>
                <SelectItem value="30">{t('analytics.last30Days')}</SelectItem>
                <SelectItem value="90">{t('analytics.last90Days')}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadLogs} size="sm" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-md rounded-xl h-9">
              <RefreshCw className="w-3.5 h-3.5 mr-2" />
              {t('refresh')}
            </Button>
          </div>
        </div>
      </div>

      {/* User Filter Info Badge */}
      {userFilter !== 'all' && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-[32px]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {userFilter === 'anonymous' ? (
                  <>
                    <UserX className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <p className="text-blue-800 dark:text-blue-300 font-medium text-sm">
                      {t('analytics.showingAnonymous')}
                    </p>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <p className="text-green-800 dark:text-green-300 font-medium text-sm">
                      {t('analytics.showingAuthenticated')}
                    </p>
                  </>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setUserFilter('all')}
                className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl h-8 text-xs"
              >
                {t('analytics.resetFilter')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card !p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[32px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">{t('analytics.totalSessions')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.uniqueSessions}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <Badge variant="outline" className="text-[10px] border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full">
                  <UserX className="w-2.5 h-2.5 mr-1" />
                  {stats.anonymousSessions}
                </Badge>
                <Badge variant="outline" className="text-[10px] border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                  <UserCheck className="w-2.5 h-2.5 mr-1" />
                  {stats.authenticatedSessions}
                </Badge>
              </div>
            </div>
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="stat-card !p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[32px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">{t('analytics.pageViews')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.pageViews}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-1">{t('analytics.totalPageViews')}</p>
            </div>
            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="stat-card !p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[32px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">{t('analytics.conversions')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.conversions}</p>
              <p className="text-[10px] text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-2.5 h-2.5" />
                {stats.conversionRate}%
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="stat-card !p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[32px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">{t('analytics.avgTime')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.avgDuration}s</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-1">{t('analytics.onPage')}</p>
            </div>
            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="macos-window bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-[32px] overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{t('analytics.viewsEvolution')}</h3>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={pageViewsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:!stroke-slate-700" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" className="dark:!stroke-slate-500" fontSize={10} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} dy={6} />
                <YAxis stroke="#94a3b8" className="dark:!stroke-slate-500" fontSize={10} tickLine={false} axisLine={false} dx={-5} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgb(255 255 255 / 0.95)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', padding: '8px 12px', fontSize: '11px' }}
                  wrapperClassName="dark:[&_div]:!bg-slate-800/95 dark:[&_div]:!text-gray-200"
                />
                <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="macos-window bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-[32px] overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{t('analytics.activityTypes')}</h3>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={activityByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:!stroke-slate-700" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" className="dark:!stroke-slate-500" fontSize={10} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} dy={6} />
                <YAxis stroke="#94a3b8" className="dark:!stroke-slate-500" fontSize={10} tickLine={false} axisLine={false} dx={-5} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgb(255 255 255 / 0.95)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', padding: '8px 12px', fontSize: '11px' }}
                  wrapperClassName="dark:[&_div]:!bg-slate-800/95 dark:[&_div]:!text-gray-200"
                />
                <Bar dataKey="value" fill="#16a34a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="macos-window bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-[32px] overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Monitor className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{t('analytics.devices')}</h3>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={deviceBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgb(255 255 255 / 0.95)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '12px' }} wrapperClassName="dark:[&_div]:!bg-slate-800/95 dark:[&_div]:!text-gray-200" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="macos-window bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-[32px] overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{t('analytics.userTypes')}</h3>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={userTypeBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#f97316" />
                  <Cell fill="#16a34a" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgb(255 255 255 / 0.95)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '12px' }} wrapperClassName="dark:[&_div]:!bg-slate-800/95 dark:[&_div]:!text-gray-200" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="macos-window bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-[32px] overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{t('analytics.topPages')}</h3>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900">
            <div className="space-y-2 max-h-[240px] overflow-y-auto">
              {topPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gray-800 dark:bg-slate-700 text-white text-[10px] w-5 h-5 flex items-center justify-center p-0 rounded-full">{index + 1}</Badge>
                    <span className="font-medium text-gray-800 dark:text-gray-200 text-xs">{page.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-full">{page.count}</Badge>
                </div>
              ))}
              {topPages.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-6 text-sm">{t('noDataAvailable')}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TABEL EVENIMENTE DETALIATE */}
      <div className="macos-window bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-[32px] overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Jurnal Complet Evenimente</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Toate activitățile cu IP, locație și ora României</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                placeholder="Caută (pagină, email, IP, oraș, țară)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 h-9 text-xs rounded-xl"
              />
              <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
                <SelectTrigger className="w-48 h-9 text-xs rounded-xl">
                  <SelectValue placeholder="Filtrează tip activitate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <ListFilter className="w-3.5 h-3.5" />
                      Toate Tipurile
                    </div>
                  </SelectItem>
                  {Object.entries(activityTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="secondary" className="h-9 px-3 rounded-full">
                {filteredLogs.length} evenimente
              </Badge>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800 sticky top-0 z-10">
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Data & Ora (RO)</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Tip Activitate</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Utilizator</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Pagină</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Dispozitiv</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Browser</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Locație</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Durată</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Referrer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {filteredLogs.slice(0, 500).map((log) => {
                  const DeviceIcon = deviceIcons[log.device_type] || Globe;
                  const romaniaTime = convertToRomaniaTime(log.created_date);
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                          <div className="text-xs">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {format(romaniaTime, 'dd MMM yyyy', { locale: ro })}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">
                              {format(romaniaTime, 'HH:mm:ss')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant="outline" className="text-xs rounded-full">
                          {activityTypeLabels[log.activity_type] || log.activity_type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {log.user_email ? (
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                            <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{log.user_email}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <UserX className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Anonim ({log.session_id?.slice(0, 8)})
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-900 dark:text-gray-100 font-mono">
                          {log.page_name || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <DeviceIcon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                          <span className="text-xs text-gray-700 dark:text-gray-300 capitalize">
                            {log.device_type || 'unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Chrome className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                          <span className="text-xs text-gray-700 dark:text-gray-300">
                            {log.browser || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs space-y-1">
                          {(log.country || log.city) ? (
                            <>
                              {log.country && (
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-3 h-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                  <span className="text-gray-700 dark:text-gray-300">
                                    {log.city ? `${log.city}, ${log.country}` : log.country}
                                  </span>
                                </div>
                              )}
                              {log.ip_address && (
                                <div className="text-gray-500 dark:text-gray-400 font-mono text-[10px] pl-5">
                                  {log.ip_address}
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {log.duration_seconds ? (
                          <Badge variant="secondary" className="text-[10px] rounded-full">
                            {log.duration_seconds}s
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        {log.referrer ? (
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 truncate">
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{log.referrer}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">Direct</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredLogs.length === 0 && (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Nu s-au găsit evenimente cu criteriile selectate</p>
              </div>
            )}
            {filteredLogs.length > 500 && (
              <div className="p-4 text-center border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Se afișează primele 500 din {filteredLogs.length} evenimente. Folosește filtrele pentru a restrânge rezultatele.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}