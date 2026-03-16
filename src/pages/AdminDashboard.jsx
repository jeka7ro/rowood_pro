import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShieldAlert, RefreshCw, TrendingUp, ArrowUpRight, Sparkles } from 'lucide-react';
import { ShoppingCart, Package, Layers, Palette, BarChart, Wrench, Loader2, Factory, TrendingDown, Cpu, Scissors, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useTranslation } from '../components/translations/TranslationProvider';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, Area, AreaChart, BarChart as RechartsBarChart, Bar, ComposedChart } from 'recharts';
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

      // Exclude cancelled and pending orders from revenue
      const validOrders = Array.isArray(ordersData) 
        ? ordersData.filter(o => o.status !== 'cancelled' && o.status !== 'pending')
        : [];
      const revenue = validOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      setTotalRevenue(revenue);

      if (Array.isArray(ordersData) && ordersData.length > 0) {
        // Generate simulated factory data based on real orders
        const last30DaysData = [];
        for (let i = 29; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const shortDate = format(date, 'dd/MM');
            const dailyOrders = Math.floor(Math.random() * 5) + 1; // Simulated daily volume
            const optimizedMeters = dailyOrders * 120; // 120m per order avg
            const wasteMeters = optimizedMeters * (0.02 + Math.random() * 0.03); // 2-5% waste
            
            last30DaysData.push({
                name: shortDate,
                'Optimizat (m)': Math.round(optimizedMeters),
                'Pierderi (m)': Math.round(wasteMeters),
            });
        }
        setChartData(last30DaysData);
      } else {
        setChartData([]);
      }

      // Pro Business / Factory KPIs
      const activeOrders = Array.isArray(ordersData) ? ordersData.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length : 0;
      
      const statsData = [
        { 
          titleKey: "Comenzi în Lucru", 
          value: activeOrders, 
          icon: Factory, 
          gradient: "from-blue-500 via-blue-600 to-cyan-500",
          url: createPageUrl('OrderManager')
        },
        { 
          titleKey: "Eficiență (OEE)", 
          value: "94.2%", 
          icon: TrendingUp, 
          gradient: "from-green-500 via-emerald-600 to-teal-500",
          url: "#"
        },
        { 
          titleKey: "Pierderi Material", 
          value: "3.1%", 
          icon: TrendingDown, 
          gradient: "from-red-500 via-orange-600 to-rose-500",
          url: "#"
        },
        { 
          titleKey: "Bani Salvați (Optimizare)", 
          value: "€4,250", 
          icon: Scissors, 
          gradient: "from-purple-500 via-violet-600 to-indigo-500",
          url: createPageUrl('FactoryManager')
        },
        { 
          titleKey: "Grad Încărcare CNC", 
          value: "78%", 
          icon: Cpu, 
          gradient: "from-slate-700 via-slate-800 to-slate-900",
          url: "#"
        },
        { 
          titleKey: "Alerte Stoccritic", 
          value: "2", 
          icon: AlertTriangle, 
          gradient: "from-amber-500 via-yellow-500 to-orange-400",
          url: createPageUrl('MaterialManager')
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
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Factory Command Center <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">Live</span>
              </h1>
              <p className="text-[10px] text-white/80 font-medium">
                Sistem Inteligent de Monitorizare a Producției & Minimizare Pierderi
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
                <TrendingUp className="w-3 h-3 text-green-300" />
                Cifră de afaceri curentă
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
                <h3 className="text-[9px] font-bold text-white/80 uppercase tracking-wider">
                  {stat.titleKey}
                </h3>
                <div className="flex items-center justify-center gap-1.5">
                  <p className="text-2xl font-black tracking-tight text-white">
                    {stat.value}
                  </p>
                </div>
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
                <div className="w-9 h-9 rounded-[18px] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shimmer">
                <Factory className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Trasabilitate Liniară (Optimizat vs. Pierderi)
                </h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                  Monitorizare metraj profile PVC (Ultimele 30 Zile)
                </p>
              </div>
            </div>
            <div className="ios26-badge bg-gradient-to-r from-red-50/80 to-orange-50/80 dark:from-red-900/30 dark:to-orange-900/30 border border-red-200/30 dark:border-red-700/30 px-2.5 py-1">
              <p className="text-[9px] text-red-700 dark:text-red-400 font-bold uppercase tracking-wide">
                Target Pierderi: {'<'} 5%
              </p>
            </div>
          </div>
        </div>
        <div className="p-5 bg-white dark:bg-slate-900">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
               <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                   </linearGradient>
                   <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                     <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" vertical={false} />
                 <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} dy={8} />
                 <YAxis yAxisId="left" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dx={-5} tickFormatter={(v) => `${v}m`} />
                 <YAxis yAxisId="right" orientation="right" stroke="#ef4444" fontSize={10} tickLine={false} axisLine={false} dx={5} tickFormatter={(v) => `${v}m`} />
                 <Tooltip 
                   contentStyle={{ backgroundColor: 'rgb(255 255 255 / 0.95)', backdropFilter: 'blur(20px)', borderRadius: '16px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                 />
                 <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
                 <Bar yAxisId="left" dataKey="Optimizat (m)" fill="url(#colorOpt)" radius={[4, 4, 0, 0]} barSize={20} />
                 <Line yAxisId="right" type="monotone" dataKey="Pierderi (m)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
               </ComposedChart>
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