import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, Package, CreditCard, Home, Download } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function PaymentSuccessPage() {
  const [order, setOrder] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams(window.location.search);
        const orderIdParam = params.get('orderId');
        const transactionIdParam = params.get('transactionId');
        const methodParam = params.get('method');

        if (!orderIdParam) {
          window.location.href = createPageUrl('MyOrders');
          return;
        }

        setPaymentMethod(methodParam || '');

        const [orderData, transactionData] = await Promise.all([
          base44.entities.Order.filter({ id: orderIdParam }),
          transactionIdParam ? base44.entities.PaymentTransaction.filter({ id: transactionIdParam }) : Promise.resolve([])
        ]);

        if (orderData && orderData.length > 0) {
          const currentOrder = orderData[0];
          setOrder(currentOrder);
          
          // Update order payment status AND status to confirmed
          await base44.entities.Order.update(currentOrder.id, {
            payment_status: 'paid',
            status: 'confirmed'  // NOW we confirm the order!
          });

          // SEND CONFIRMATION EMAILS NOW (after payment confirmed)
          if (!emailSent) {
            try {
              // Email către client
              await base44.integrations.Core.SendEmail({
                to: currentOrder.customer_email,
                subject: `✅ Plată Confirmată - Comandă RoWood #${currentOrder.order_number || currentOrder.id.slice(-8)}`,
                body: `
                  <h2>🎉 Plata a fost confirmată cu succes!</h2>
                  <p>Bună ${currentOrder.customer_name},</p>
                  <p>Plata pentru comanda ta <strong>#${currentOrder.order_number || currentOrder.id.slice(-8)}</strong> a fost procesată cu succes.</p>
                  <p><strong>Total plătit:</strong> ${currentOrder.total_amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</p>
                  
                  <h3>Ce urmează?</h3>
                  <ul>
                    <li>✅ Comanda ta a intrat în producție</li>
                    <li>📞 Echipa noastră te va contacta pentru detalii</li>
                    <li>📋 Vei primi factură proformă</li>
                    <li>🚚 Livrare estimată: 21-28 zile lucrătoare</li>
                  </ul>
                  
                  <br>
                  <p>Mulțumim pentru încredere,<br>Echipa RoWood</p>
                `
              });

              // Email către admini
              const admins = await base44.entities.User.filter({ role: 'admin' });
              if (admins && admins.length > 0) {
                const adminEmails = admins.map(admin => admin.email);
                await base44.integrations.Core.SendEmail({
                  to: adminEmails.join(','),
                  subject: `💰 PLATĂ CONFIRMATĂ: Comandă #${currentOrder.order_number || currentOrder.id.slice(-8).toUpperCase()}`,
                  body: `
                    <h2>💰 Plată Confirmată!</h2>
                    <p>Comanda <strong>#${currentOrder.order_number || currentOrder.id.slice(-8).toUpperCase()}</strong> a fost plătită!</p>
                    <p><strong>Client:</strong> ${currentOrder.customer_name} (${currentOrder.customer_email})</p>
                    <p><strong>Sumă plătită:</strong> ${currentOrder.total_amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</p>
                    <p><strong>Metodă:</strong> ${methodParam || 'necunoscută'}</p>
                    <br>
                    <a href="${window.location.origin}${createPageUrl('OrderManager')}" style="display: inline-block; padding: 12px 24px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 6px;">Vezi în Admin Panel</a>
                  `
                });
              }

              setEmailSent(true);
            } catch (emailError) {
              console.error("Email sending failed:", emailError);
            }
          }
        }

        if (transactionData && transactionData.length > 0) {
          setTransaction(transactionData[0]);
          
          // Update transaction status
          await base44.entities.PaymentTransaction.update(transactionData[0].id, {
            status: 'completed',
            payment_date: new Date().toISOString()
          });
        }

      } catch (err) {
        console.error('Failed to load payment success data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [emailSent]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-slate-600">Confirmăm plata...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white text-center py-8">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <CardTitle className="text-3xl">🎉 Plata Confirmată!</CardTitle>
            <p className="text-green-100 mt-2">Comanda ta a fost plasată cu succes</p>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            {order && (
              <>
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 text-center">
                  <p className="text-xl text-slate-800 mb-2">
                    Comanda <span className="font-bold text-green-700">#{order.order_number || order.id.slice(-8).toUpperCase()}</span> a fost confirmată!
                  </p>
                  <p className="text-sm text-slate-600">
                    ✅ Plata a fost procesată cu succes
                  </p>
                  <p className="text-sm text-slate-600">
                    📧 Vei primi un email de confirmare în câteva momente
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Detalii Comandă
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Client:</span>
                        <span className="font-medium">{order.customer_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Email:</span>
                        <span className="font-medium">{order.customer_email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total Plătit:</span>
                        <span className="font-bold text-green-600">
                          {order.total_amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {transaction && (
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Detalii Plată
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Metoda:</span>
                          <span className="font-medium capitalize">{transaction.processor_name?.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Status:</span>
                          <span className="font-medium text-green-600">✓ Finalizată</span>
                        </div>
                        {transaction.transaction_id && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">ID Tranzacție:</span>
                            <span className="font-medium text-xs">{transaction.transaction_id}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {paymentMethod === 'transfer' && (
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-800 mb-3">
                      📋 Instrucțiuni pentru Transfer Bancar
                    </h3>
                    <div className="text-sm text-blue-900 space-y-2">
                      <p>Te rugăm să efectuezi transferul bancar la următoarele detalii:</p>
                      <div className="bg-white p-4 rounded border-2 border-blue-400 mt-3">
                        <div className="grid gap-2">
                          <div><strong>Beneficiar:</strong> RoWood SRL</div>
                          <div><strong>IBAN:</strong> RO49 AAAA 1B31 0075 9384 0000</div>
                          <div><strong>Bancă:</strong> Banca Transilvania</div>
                          <div><strong>Sumă:</strong> {order.total_amount.toFixed(2)} EUR</div>
                          <div><strong>Referință:</strong> Comandă #{order.order_number || order.id.slice(-8).toUpperCase()}</div>
                        </div>
                      </div>
                      <p className="mt-3 text-xs">
                        ⚠️ Comanda va intra în producție după confirmarea plății în contul nostru bancar.
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 rounded-lg p-6 border-2 border-slate-200">
                  <h3 className="font-semibold text-slate-800 mb-3">📦 Ce urmează?</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">
                    <li>✅ Ai primit email de confirmare cu toate detaliile</li>
                    <li>🏗️ Comanda ta a intrat în producție</li>
                    <li>📞 Echipa noastră te va contacta pentru confirmarea finală</li>
                    <li>📋 Vei primi factură proformă pentru evidență</li>
                    <li>🚚 Livrare estimată: 21-28 zile lucrătoare</li>
                  </ol>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button
                    onClick={() => window.open(`${createPageUrl('OrderPDF')}?order_id=${order.id}`, '_blank')}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Descarcă Confirmarea (PDF)
                  </Button>
                  
                  <Button asChild className="flex-1 bg-green-600 hover:bg-green-700" size="lg">
                    <Link to={createPageUrl('MyOrders')}>
                      <Package className="w-5 h-5 mr-2" />
                      Vezi Comenzile Mele
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="flex-1" size="lg">
                    <Link to={createPageUrl('Home')}>
                      <Home className="w-5 h-5 mr-2" />
                      Pagina Principală
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}