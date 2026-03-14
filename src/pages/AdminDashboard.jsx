import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShieldAlert, RefreshCw, TrendingUp, ArrowUpRight, Sparkles } from 'lucide-react';
import { ShoppingCart, Package, Layers, Palette, BarChart, Wrench, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useTranslation } from '../components/translations/TranslationProvider';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, Area, AreaChart } from 'recharts';
import { format, parseISO, subDays } from 'date-fns';

async function staggeredFetch(fetchers) {
    const results = [];
    for (const fetcher of fetchers) {
        try {
            results.push(await fetcher());
        } catch (error) {
            console.warn("A fetch operation failed during staggered fetch:", error);
            results.push([]);
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return results;
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!user || user.role !== 'admin') {
        throw new Error('Not authorized');
      }

      const dataFetchers = [
        () => base44.entities.Order.list(),
        () => base44.entities.Product.list(),
        () => base44.entities.Material.list(),
        () => base44.entities.Color.list(),
        () => base44.entities.GlazingType.list(),
        () => base44.entities.AccessoryOption.list()
      ];

      const [
          ordersData, 
          productsData, 
          materialsData,
          colorsData,
          glazingData,
          accessoriesData
      ] = await staggeredFetch(dataFetchers);

      const revenue = Array.isArray(ordersData) 
        ? ordersData.reduce((sum, order) => sum + (order.total_amount || 0), 0)
        : 0;
      setTotalRevenue(revenue);

      if (Array.isArray(ordersData) && ordersData.length > 0) {
        const salesByDay = ordersData.reduce((acc, order) => {
            const date = format(parseISO(order.created_date), 'yyyy-MM-dd');
            if (!acc[date]) {
                acc[date] = 0;
            }
            acc[date] += (typeof order.total_amount === 'number' ? order.total_amount : 0);
            return acc;
        }, {});

        const last30DaysData = [];
        for (let i = 29; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const formattedDate = format(date, 'yyyy-MM-dd');
            const shortDate = format(date, 'dd/MM');
            
            last30DaysData.push({
                name: shortDate,
                [t('adminDashboard.sales')]: salesByDay[formattedDate] || 0,
            });
        }
        setChartData(last30DaysData);
      } else {
        setChartData([]);
      }

      const statsData = [
        { 
          titleKey: "adminDashboard.totalOrders", 
          value: Array.isArray(ordersData) ? ordersData.length : 0, 
          icon: ShoppingCart, 
          gradient: "from-blue-500 via-blue-600 to-cyan-500",
          iconBg: "from-blue-50 to-cyan-50",
          url: createPageUrl('OrderManager')
        },
        { 
          titleKey: "adminDashboard.products", 
          value: Array.isArray(productsData) ? productsData.length : 0, 
          icon: Package, 
          gradient: "from-green-500 via-emerald-600 to-teal-500",
          iconBg: "from-green-50 to-emerald-50",
          url: createPageUrl('ProductManager')
        },
        { 
          titleKey: "adminDashboard.materials", 
          value: Array.isArray(materialsData) ? materialsData.length : 0, 
          icon: Layers, 
          gradient: "from-orange-500 via-amber-600 to-yellow-500",
          iconBg: "from-orange-50 to-amber-50",
          url: createPageUrl('MaterialManager')
        },
        { 
          titleKey: "adminDashboard.colors", 
          value: Array.isArray(colorsData) ? colorsData.length : 0, 
          icon: Palette, 
          gradient: "from-purple-500 via-violet-600 to-indigo-500",
          iconBg: "from-purple-50 to-violet-50",
          url: createPageUrl('ColorManager')
        },
        { 
          titleKey: "adminDashboard.glazingTypes", 
          value: Array.isArray(glazingData) ? glazingData.length : 0, 
          icon: BarChart, 
          gradient: "from-pink-500 via-rose-600 to-red-500",
          iconBg: "from-pink-50 to-rose-50",
          url: createPageUrl('GlazingManager')
        },
        { 
          titleKey: "adminDashboard.accessories", 
          value: Array.isArray(accessoriesData) ? accessoriesData.length : 0, 
          icon: Wrench, 
          gradient: "from-cyan-500 via-sky-600 to-blue-500",
          iconBg: "from-cyan-50 to-sky-50",
          url: createPageUrl('AccessoryManager')
        },
      ];

      setStats(statsData);

    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
      if (err.message === 'Not authorized') {
        setError('Not authorized');
      } else if (err.message && err.message.includes("Network Error")) {
        setError(t('error'));
      } else {
        setError(t('error'));
      }
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
          <div className="text-center">
            <div className="relative">
              <div className="w-12 h-12 border-3 border-gray-200 dark:border-slate-700 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-medium">{t('loadingDashboard')}</p>
          </div>
        </div>
      );
  }
  
  if (error === 'Not authorized') {
      return (
        <div className="flex flex-col items-center justify-center h-screen text-center bg-red-50 dark:bg-slate-950">
            <div className="macos-window p-8 max-w-md bg-white dark:bg-slate-900">
              <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('error')}</h1>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
            </div>
        </div>
      );
  }

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center bg-red-50 dark:bg-slate-950">
            <div className="macos-window p-8 max-w-md bg-white dark:bg-slate-900">
              <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('error')}</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <Button onClick={fetchData} className="btn-ios26 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('refresh')}
              </Button>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* 🌊 HERO HEADER + REVENUE - AMBELE VERZI PE ACELAȘI RÂND */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in-up">
        {/* HERO HEADER - VERDE */}
        <div className="liquid-glass glow p-4 bg-gradient-to-br from-green-500/90 via-emerald-600/90 to-teal-600/90 backdrop-blur-3xl rounded-[32px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[18px] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shimmer">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                {t('adminDashboard.title')}
              </h1>
              <p className="text-[10px] text-white/70 font-medium">
                {t('adminDashboard.subtitle')}
              </p>
            </div>
          </div>
          <Button 
            onClick={fetchData} 
            size="sm"
            className="btn-ios26 bg-white/10 hover:bg-white/20 border border-white/20 text-white h-8 px-3"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span className="text-xs">{t('refresh')}</span>
          </Button>
        </div>

        {/* REVENUE CARD - VERDE */}
        <div className="liquid-glass glow p-4 bg-gradient-to-br from-green-500/90 via-emerald-600/90 to-teal-600/90 backdrop-blur-3xl rounded-[32px]">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                  <p className="text-white/90 text-[10px] font-bold uppercase tracking-wide">
                    {t('adminDashboard.totalRevenue')}
                  </p>
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-1 tracking-tight">
                €{totalRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-white/70 text-xs font-medium flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3" />
                {t('adminDashboard.fromAllOrders')}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-[24px] border border-white/20 flex items-center justify-center shimmer">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
      
      {/* 📊 STATS GRID - ICON STÂNGA, REST CENTRAT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {stats.map((stat, index) => (
          <Link to={stat.url} key={index} className="group">
            <div className="liquid-glass glow p-3 bg-gradient-to-br from-green-500/90 via-emerald-600/90 to-teal-600/90 backdrop-blur-3xl rounded-[24px] h-full refract animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
              {/* ICON STÂNGA */}
              <div className="mb-2 w-9 h-9 rounded-[18px] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shimmer">
                {stat.icon && <stat.icon className="w-4 h-4 text-white" />}
              </div>
              
              {/* CONTENT CENTRAT */}
              <div className="space-y-0.5 text-center">
                <h3 className="text-[8px] font-bold text-white/70 uppercase tracking-wider">
                  {t(stat.titleKey)}
                </h3>
                <div className="flex items-center justify-center gap-1.5">
                  <p className="text-xl font-bold text-white">
                    {stat.value}
                  </p>
                  <ArrowUpRight className="w-3 h-3 text-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <p className="text-[8px] text-white/60 font-medium">
                  {stat.value === 0 ? t('adminDashboard.noElements') : `${stat.value === 1 ? t('adminDashboard.element') : t('adminDashboard.elements')}`}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 📈 SALES CHART - DARK MODE COMPATIBLE */}
      <div className="macos-window animate-fade-in-up bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-gray-50/60 to-white/60 dark:from-slate-800/60 dark:to-slate-900/60 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[18px] bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shimmer">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  {t('adminDashboard.salesEvolution')}
                </h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                  {t('analytics.last30Days')}
                </p>
              </div>
            </div>
            <div className="ios26-badge bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200/30 dark:border-green-700/30 px-2.5 py-1">
              <p className="text-[9px] text-green-700 dark:text-green-400 font-bold uppercase tracking-wide">
                {t('adminDashboard.lastQuarter')}
              </p>
            </div>
          </div>
        </div>
        <div className="p-5 bg-white dark:bg-slate-900">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8"
                  className="dark:stroke-slate-500"
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={{ stroke: '#e2e8f0' }}
                  dy={8}
                />
                <YAxis 
                  stroke="#94a3b8"
                  className="dark:stroke-slate-500"
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `€${value.toLocaleString()}`}
                  dx={-5}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgb(255 255 255 / 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    padding: '8px 12px',
                    fontSize: '11px'
                  }}
                  wrapperClassName="dark:[&_div]:!bg-slate-800/95 dark:[&_div]:!text-gray-200"
                  formatter={(value, name) => [`€${value.toLocaleString()}`, name]}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b', fontSize: '10px' }}
                  labelClassName="dark:!text-gray-200"
                />
                <Area 
                  type="monotone" 
                  dataKey={t('adminDashboard.sales')}
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  fill="url(#colorSales)"
                  dot={{ fill: '#10b981', r: 3, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center liquid-glass bg-gray-50 dark:bg-slate-800">
              <div className="text-center">
                <BarChart className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-semibold text-sm mb-1">
                  {t('adminDashboard.noDataToDisplay')}
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs">
                  {t('adminDashboard.ordersWillAppear')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}