import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lead, Deal, Activity, Contact, Order } from '@/entities/all';
import { 
  Users, 
  TrendingUp, 
  Target, 
  Calendar, 
  UserPlus,
  DollarSign,
  Clock,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useTranslation } from '../components/translations/TranslationProvider';

export default function CRMDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    totalDeals: 0,
    dealsPipeline: 0,
    activitiestoday: 0,
    contactsTotal: 0,
    conversionRate: 0,
    avgDealValue: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [
        allLeads,
        allDeals,
        allActivities,
        allContacts,
        allOrders
      ] = await Promise.all([
        Lead.list('-created_date', 100),
        Deal.list('-created_date', 100),
        Activity.list('-created_date', 10),
        Contact.list('-created_date', 100),
        Order.list('-created_date', 100)
      ]);

      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      
      const newLeadsThisWeek = allLeads.filter(lead => 
        new Date(lead.created_date) >= startOfWeek
      );

      const pipelineDeals = allDeals.filter(deal => 
        !['closed_won', 'closed_lost'].includes(deal.stage)
      );

      const todayActivities = allActivities.filter(activity =>
        new Date(activity.created_date).toDateString() === new Date().toDateString()
      );

      const wonDeals = allDeals.filter(deal => deal.stage === 'closed_won');
      const totalLeadsConverted = wonDeals.length;
      const conversionRate = allLeads.length > 0 ? (totalLeadsConverted / allLeads.length * 100) : 0;
      
      const avgDealValue = wonDeals.length > 0 
        ? wonDeals.reduce((sum, deal) => sum + deal.value, 0) / wonDeals.length 
        : 0;

      setStats({
        totalLeads: allLeads.length,
        newLeads: newLeadsThisWeek.length,
        totalDeals: allDeals.length,
        dealsPipeline: pipelineDeals.reduce((sum, deal) => sum + deal.value, 0),
        activitiesToday: todayActivities.length,
        contactsTotal: allContacts.length,
        conversionRate: Math.round(conversionRate),
        avgDealValue: Math.round(avgDealValue)
      });

      setRecentActivities(allActivities.slice(0, 5));
      
      const upcoming = allActivities
        .filter(activity => activity.due_date && !activity.completed)
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
        .slice(0, 5);
      setUpcomingTasks(upcoming);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Lead-uri',
      value: stats.totalLeads,
      change: `+${stats.newLeads} săptămâna aceasta`,
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      changePositive: true
    },
    {
      title: 'Pipeline Vânzări',
      value: `€${stats.dealsPipeline.toLocaleString()}`,
      change: `${stats.totalDeals} tranzacții active`,
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-600',
      iconBg: 'bg-green-100',
      changePositive: true
    },
    {
      title: 'Rată Conversie',
      value: `${stats.conversionRate}%`,
      change: 'Din total lead-uri',
      icon: Target,
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      changePositive: true
    },
    {
      title: 'Valoare Medie Deal',
      value: `€${stats.avgDealValue.toLocaleString()}`,
      change: 'Pe tranzacție închisă',
      icon: DollarSign,
      gradient: 'from-amber-500 to-orange-600',
      iconBg: 'bg-amber-100',
      changePositive: true
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Se încarcă dashboard-ul CRM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header modern cu gradient */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Sparkles className="w-10 h-10" />
              CRM Dashboard
            </h1>
            <p className="text-indigo-100 text-lg">Centralizare vânzări și relații cu clienții</p>
          </div>
          <Button onClick={loadDashboardData} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reîmprospătează
          </Button>
        </div>
      </div>

      {/* Stats Grid - Modern Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-none bg-white overflow-hidden relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.iconBg} w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-7 h-7 bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`} />
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <h3 className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">{stat.title}</h3>
              <p className="text-4xl font-bold text-slate-900 mb-2">{stat.value}</p>
              <p className={`text-sm ${stat.changePositive ? 'text-green-600' : 'text-slate-600'} flex items-center gap-1`}>
                {stat.changePositive && <TrendingUp className="w-4 h-4" />}
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions - Modern Design */}
      <Card className="shadow-xl border-none">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <CardTitle className="text-xl font-bold text-slate-800">⚡ Acțiuni Rapide</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild className="h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all">
              <Link to={createPageUrl("LeadManager")} className="flex items-center justify-center gap-3">
                <UserPlus className="w-5 h-5" /> 
                <span className="font-semibold">Lead Nou</span>
              </Link>
            </Button>
            <Button asChild className="h-16 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transition-all">
              <Link to={createPageUrl("DealManager")} className="flex items-center justify-center gap-3">
                <TrendingUp className="w-5 h-5" /> 
                <span className="font-semibold">Deals</span>
              </Link>
            </Button>
            <Button asChild className="h-16 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all">
              <Link to={createPageUrl("ActivityManager")} className="flex items-center justify-center gap-3">
                <Calendar className="w-5 h-5" /> 
                <span className="font-semibold">Activitate</span>
              </Link>
            </Button>
            <Button asChild className="h-16 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 shadow-lg hover:shadow-xl transition-all">
              <Link to={createPageUrl("ContactManager")} className="flex items-center justify-center gap-3">
                <Users className="w-5 h-5" /> 
                <span className="font-semibold">Contacte</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activities & Tasks - Modern Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-xl border-none">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-3 text-slate-800">
              <Clock className="w-6 h-6 text-blue-600" />
              Activități Recente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="group flex items-start gap-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl hover:shadow-md transition-all duration-200 border border-slate-100">
                    <div className={`w-3 h-3 rounded-full mt-2 shadow-lg ${
                      activity.type === 'call' ? 'bg-gradient-to-br from-green-400 to-green-600' :
                      activity.type === 'email' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                      activity.type === 'meeting' ? 'bg-gradient-to-br from-purple-400 to-purple-600' : 
                      'bg-gradient-to-br from-gray-400 to-gray-600'
                    }`}></div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{activity.subject}</p>
                      <p className="text-sm text-slate-600 capitalize mt-1">{activity.type}</p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(activity.created_date).toLocaleString('ro-RO')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Nu există activități recente</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-xl border-none">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardTitle className="flex items-center gap-3 text-slate-800">
              <AlertCircle className="w-6 h-6 text-amber-600" />
              Task-uri Programate
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {upcomingTasks.length > 0 ? (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="group flex items-start gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl hover:shadow-md transition-all duration-200 border border-amber-100">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 mt-2 shadow-lg"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 group-hover:text-amber-600 transition-colors">{task.subject}</p>
                      <p className="text-sm text-slate-600 mt-1">📅 {new Date(task.due_date).toLocaleDateString('ro-RO')}</p>
                      <p className="text-xs text-slate-500 capitalize mt-1">
                        Prioritate: <span className={`font-semibold ${
                          task.priority === 'high' ? 'text-red-600' :
                          task.priority === 'normal' ? 'text-blue-600' : 'text-green-600'
                        }`}>{task.priority}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Nu există task-uri programate</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}