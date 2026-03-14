import React, { useState, useEffect } from 'react';
import { Order } from '@/entities/Order';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, FileText, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function OrderSuccessPage() {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    
    if (orderId) {
      loadOrderDetails(orderId);
    } else {
      // Dacă nu avem ID comandă, mergi la My Orders
      window.location.href = createPageUrl('MyOrders');
    }
  }, []);

  const loadOrderDetails = async (orderId) => {
    setIsLoading(true);
    try {
      const orderData = await Order.filter({ id: orderId });
      if (orderData && orderData.length > 0) {
        setOrder(orderData[0]);
      } else {
        // Comandă nu găsită
        console.error("Comanda nu a fost găsită:", orderId);
        window.location.href = createPageUrl('MyOrders');
      }
    } catch (error) {
      console.error('Error loading order:', error);
      window.location.href = createPageUrl('MyOrders');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p>Comanda nu a putut fi găsită.</p>
        <Button asChild className="mt-4">
          <Link to={createPageUrl('MyOrders')}>Vezi Comenzile Mele</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-green-100 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* SUCCESS HEADER */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-600 text-white rounded-full mb-6 shadow-lg">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            🎉 Felicitări! Comanda a fost plasată cu succes!
          </h1>
          <p className="text-xl text-green-700 mb-2">
            Comanda dvs. <span className="font-mono font-bold">#{order.order_number || order.id.slice(-8).toUpperCase()}</span> a fost înregistrată
          </p>
          <p className="text-green-600">
            Data plasării: {new Date(order.created_date).toLocaleDateString('ro-RO', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* ORDER SUMMARY CARD */}
        <Card className="shadow-xl border-green-200 mb-8">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
            <CardTitle className="text-2xl flex items-center gap-3">
              <CheckCircle className="w-8 h-8" />
              Rezumat Comandă
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalii Client</h3>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Nume:</strong> {order.customer_name}</p>
                  <p><strong>Email:</strong> {order.customer_email}</p>
                  <p><strong>Telefon:</strong> {order.customer_phone}</p>
                  {order.company_name && (
                    <p><strong>Companie:</strong> {order.company_name}</p>
                  )}
                  {order.cui && (
                    <p><strong>CUI:</strong> {order.cui}</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Adresa de Livrare</h3>
                <div className="text-gray-600">
                  {order.delivery_address?.street && <p>{order.delivery_address.street}</p>}
                  {order.delivery_address?.city && <p>{order.delivery_address.city}, {order.delivery_address.postal_code}</p>}
                  {order.delivery_address?.country && <p>{order.delivery_address.country}</p>}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="flex justify-between items-center text-2xl font-bold text-green-700">
                <span>TOTAL COMANDĂ:</span>
                <span>{order.total_amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NEXT STEPS */}
        <Card className="shadow-lg mb-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Ce urmează?</h3>
            <div className="space-y-3 text-gray-600">
              <p>✅ Ați primit un email de confirmare cu toate detaliile comenzii</p>
              <p>📞 Echipa noastră vă va contacta în curând pentru confirmarea finală</p>
              <p>📋 Veți primi o factură proformă pentru avans</p>
              <p>🏗️ Produsele vor intra în producție după confirmarea avansului</p>
              <p>🚚 Termenul de livrare estimat: 21-28 zile lucrătoare</p>
            </div>
          </CardContent>
        </Card>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => {
              setIsDownloading(true);
              window.open(`${createPageUrl('OrderPDF')}?order_id=${order.id}`, '_blank');
              setIsDownloading(false);
            }}
            className="bg-green-600 hover:bg-green-700 text-lg py-3"
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Download className="w-5 h-5 mr-2" />
            )}
            Descarcă Confirmarea (PDF)
          </Button>
          
          <Button asChild variant="outline" className="text-lg py-3">
            <Link to={createPageUrl('MyOrders')}>
              <FileText className="w-5 h-5 mr-2" />
              Vezi Toate Comenzile
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="text-lg py-3">
            <Link to={createPageUrl('Configurator')}>
              <Plus className="w-5 h-5 mr-2" />
              Configurează Altceva
            </Link>
          </Button>
        </div>

        {/* BACK TO SITE */}
        <div className="text-center mt-8">
          <Button asChild variant="link" className="text-green-600">
            <Link to={createPageUrl('Home')}>
              <ArrowRight className="w-4 h-4 mr-2" />
              Înapoi la Site
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}