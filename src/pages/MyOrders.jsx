
import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card'; // Changed CardHeader to CardContent
import { Loader2, ShoppingCart, ArrowRight, LogIn, AlertCircle, RefreshCw, Lock, Package, Calendar, ChevronRight } from 'lucide-react'; // Added Lock, Package, Calendar, ChevronRight
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns'; // Added parseISO
import { ro } from 'date-fns/locale';
import { useTranslation } from '../components/translations/TranslationProvider';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import { createPageUrl } from '@/utils';

const statusColors = {
    pending: "bg-yellow-500", // Adjusted to be more solid for the new design
    confirmed: "bg-blue-600",
    in_production: "bg-purple-600",
    ready: "bg-indigo-600",
    delivered: "bg-green-600",
    cancelled: "bg-red-600",
};

const statusNames = {
    pending: 'În Așteptare',
    confirmed: 'Confirmată',
    in_production: 'În Producție',
    ready: 'Gata de Livrare',
    delivered: 'Livrată',
    cancelled: 'Anulată'
};

export default function MyOrdersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // Error can now be 'NOT_AUTHENTICATED', 'NETWORK_ERROR', 'GENERIC_FETCH_ERROR', or null
  const [user, setUser] = useState(null); // Keep user state, though error handling now uses string for simplicity

  const fetchUserAndOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null); // Reset error state on new fetch attempt
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser); // Update user state
      if (currentUser && currentUser.email) {
        const userOrders = await base44.entities.Order.filter({ customer_email: currentUser.email }, '-created_date');
        setOrders(userOrders);
      } else {
        setError('NOT_AUTHENTICATED');
      }
    } catch (e) {
      console.error("Error fetching user/orders:", e);
      if (e.message && e.message.includes("Network Error")) {
        setError('NETWORK_ERROR');
      } else if (e.response && e.response.status === 401) {
        setError('NOT_AUTHENTICATED');
      }
      else {
        setError('GENERIC_FETCH_ERROR');
      }
    } finally {
      setIsLoading(false);
    }
  }, []); // No 't' dependency needed as t is not directly used in this callback for setting error string

  useEffect(() => {
    fetchUserAndOrders();
  }, [fetchUserAndOrders]);

  const handleLogin = () => {
    const nextUrl = window.location.href;
    base44.auth.redirectToLogin(nextUrl);
  };

  const handleOrderClick = (orderId) => {
    navigate(createPageUrl(`OrderDetails?order_id=${orderId}`));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {t('myOrdersTitle')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {t('myOrdersDescription')}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-green-600" />
          </div>
        ) : error === 'NOT_AUTHENTICATED' ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700">
            <Lock className="w-20 h-20 mx-auto text-slate-300 dark:text-slate-600 mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t('myOrdersNotLoggedIn')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              Pentru a vedea comenzile tale, te rugăm să te autentifici.
            </p>
            <Button onClick={handleLogin} size="lg" className="bg-green-600 hover:bg-green-700 px-8 rounded-xl">
              <LogIn className="w-5 h-5 mr-2" />
              Autentifică-te
            </Button>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-red-50 dark:bg-slate-900 rounded-3xl shadow-lg border border-red-200 dark:border-red-800">
            <AlertCircle className="w-20 h-20 mx-auto text-red-500 mb-6" />
            <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-3">
              {t('myOrdersErrorTitle')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              {t('myOrdersErrorFetching')}
            </p>
            <Button onClick={fetchUserAndOrders} className="bg-red-600 hover:bg-red-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reîncearcă
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700">
            <Package className="w-20 h-20 mx-auto text-slate-300 dark:text-slate-600 mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t('myOrdersNoOrdersTitle')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              {t('myOrdersNoOrdersDescription')}
            </p>
            <Link to={createPageUrl("Configurator")}>
              <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8 rounded-xl">
                Începe Configurarea
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card
                key={order.id}
                onClick={() => handleOrderClick(order.id)}
                className="cursor-pointer hover:shadow-2xl transition-all duration-300 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {t('myOrdersOrderNumber')} {order.order_number || order.id.slice(-8).toUpperCase()}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span>{format(parseISO(order.created_date), 'dd MMMM yyyy, HH:mm', { locale: ro })}</span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{t('myOrdersTotal')}</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {order.total_amount.toLocaleString('de-DE', { 
                            style: 'currency', 
                            currency: 'EUR',
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Badge className={`${statusColors[order.status]} text-white font-semibold px-3 py-1 rounded-full`}>
                          {statusNames[order.status]}
                        </Badge>
                        <Badge className={`${order.payment_status === 'paid' ? 'bg-green-600' : 'bg-yellow-600'} text-white font-semibold px-3 py-1 rounded-full`}>
                          {t('paymentStatus')}: {order.payment_status === 'paid' ? 'Plătit' : 'Neplătit'}
                        </Badge>
                      </div>

                      <ChevronRight className="w-6 h-6 text-slate-400 dark:text-slate-500 hidden md:block" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
