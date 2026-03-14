import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function PaymentPage() {
  const [orderId, setOrderId] = useState(null);
  const [order, setOrder] = useState(null);
  const [processors, setProcessors] = useState([]);
  const [selectedProcessor, setSelectedProcessor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Get order ID from URL
        const params = new URLSearchParams(window.location.search);
        const orderIdFromUrl = params.get('orderId');
        
        if (!orderIdFromUrl) {
          setError('ID comandă lipsește');
          setIsLoading(false);
          return;
        }

        setOrderId(orderIdFromUrl);

        // Load order and processors
        const [orderData, processorsData] = await Promise.all([
          base44.entities.Order.filter({ id: orderIdFromUrl }),
          base44.entities.PaymentProcessor.filter({ is_active: true }, 'priority_order', 50)
        ]);

        if (!orderData || orderData.length === 0) {
          setError('Comanda nu a fost găsită');
          setIsLoading(false);
          return;
        }

        setOrder(orderData[0]);
        setProcessors(processorsData);

        // Set default processor
        const defaultProc = processorsData.find(p => p.is_default);
        if (defaultProc) {
          setSelectedProcessor(defaultProc.id);
        } else if (processorsData.length > 0) {
          setSelectedProcessor(processorsData[0].id);
        }

      } catch (err) {
        console.error('Failed to load payment data:', err);
        setError('Eroare la încărcarea datelor');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handlePayment = async () => {
    if (!selectedProcessor || !order) return;

    setIsProcessing(true);
    try {
      const processor = processors.find(p => p.id === selectedProcessor);

      // Create payment transaction record
      const transaction = await base44.entities.PaymentTransaction.create({
        order_id: order.id,
        processor_id: processor.id,
        processor_name: processor.processor_name,
        amount: order.total_amount,
        currency: 'EUR',
        status: 'pending',
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        metadata: {
          order_number: order.order_number
        }
      });

      // În funcție de procesor, redirecționăm sau procesăm
      if (processor.processor_name === 'transfer_bancar') {
        // Pentru transfer bancar, redirecționăm direct la pagina de succes cu instrucțiuni
        window.location.href = createPageUrl('PaymentSuccess') + `?orderId=${order.id}&transactionId=${transaction.id}&method=transfer`;
      } else if (processor.processor_name === 'viva_wallet') {
        // VIVA WALLET - Redirecționare către pagina de plată
        // În producție, aici ai face request către API-ul Viva Wallet
        alert('🚀 Redirecționare către Viva Wallet...\n\nÎn producție, aici vei fi redirecționat către pagina de plată Viva Wallet.');
        
        // Exemplu URL pentru test (trebuie înlocuit cu URL-ul real de la Viva)
        // window.location.href = `https://demo.vivapayments.com/web/checkout?ref=${transaction.id}`;
        
        // Pentru demo, simulăm succes
        setTimeout(() => {
          window.location.href = createPageUrl('PaymentSuccess') + `?orderId=${order.id}&transactionId=${transaction.id}&method=viva_wallet`;
        }, 2000);
        
      } else if (processor.processor_name === 'stripe') {
        // STRIPE - Redirecționare către Checkout Session
        alert('🚀 Redirecționare către Stripe...\n\nÎn producție, aici vei fi redirecționat către Stripe Checkout.');
        
        // Pentru demo
        setTimeout(() => {
          window.location.href = createPageUrl('PaymentSuccess') + `?orderId=${order.id}&transactionId=${transaction.id}&method=stripe`;
        }, 2000);
        
      } else {
        // Alte procesoare
        alert(`🚀 Redirecționare către ${processor.display_name}...\n\nIntegrarea pentru ${processor.processor_name} va fi implementată.`);
        
        setTimeout(() => {
          window.location.href = createPageUrl('PaymentSuccess') + `?orderId=${order.id}&transactionId=${transaction.id}&method=${processor.processor_name}`;
        }, 2000);
      }

    } catch (err) {
      console.error('Payment error:', err);
      setError('Eroare la procesarea plății. Te rugăm să încerci din nou.');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-slate-600">Se încarcă opțiunile de plată...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Eroare</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <Button onClick={() => window.location.href = createPageUrl('MyOrders')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi la Comenzi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Înapoi
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Metode de Plată */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <CreditCard className="w-6 h-6" />
                  Alege Metoda de Plată
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {processors.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                    <p className="text-slate-600">
                      Nu există metode de plată disponibile momentan.
                    </p>
                    <p className="text-sm text-slate-500 mt-2">
                      Te rugăm să contactezi echipa de suport.
                    </p>
                  </div>
                ) : (
                  <RadioGroup value={selectedProcessor} onValueChange={setSelectedProcessor}>
                    <div className="space-y-3">
                      {processors.map((processor) => (
                        <div
                          key={processor.id}
                          className={`relative flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedProcessor === processor.id
                              ? 'border-green-600 bg-green-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                          onClick={() => setSelectedProcessor(processor.id)}
                        >
                          <RadioGroupItem value={processor.id} id={processor.id} className="mt-1" />
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {processor.logo_url ? (
                                <img src={processor.logo_url} alt="" className="w-12 h-8 object-contain" />
                              ) : (
                                <CreditCard className="w-6 h-6 text-slate-400" />
                              )}
                              <div>
                                <Label htmlFor={processor.id} className="text-lg font-semibold cursor-pointer">
                                  {processor.display_name}
                                </Label>
                                {processor.is_default && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    Recomandat
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {processor.description && (
                              <p className="text-sm text-slate-600 mt-2">
                                {processor.description}
                              </p>
                            )}

                            {processor.environment === 'test' && (
                              <p className="text-xs text-orange-600 mt-2 font-medium">
                                ⚠️ Mod Test - Nicio plată reală nu va fi procesată
                              </p>
                            )}
                          </div>

                          {selectedProcessor === processor.id && (
                            <CheckCircle2 className="w-6 h-6 text-green-600 absolute top-4 right-4" />
                          )}
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}

                <Separator className="my-6" />

                <Button
                  onClick={handlePayment}
                  disabled={!selectedProcessor || isProcessing || processors.length === 0}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Se procesează...
                    </>
                  ) : (
                    <>
                      Continuă la Plată
                      <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-slate-500 text-center mt-4">
                  🔒 Plățile sunt procesate securizat prin partenerii noștri autorizați
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sumar Comandă */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Sumar Comandă</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Comandă:</span>
                    <span className="font-medium">#{order.order_number || order.id.slice(-8).toUpperCase()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Client:</span>
                    <span className="font-medium">{order.customer_name}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total de plată:</span>
                  <span className="text-green-600">
                    {order.total_amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                  <p className="text-blue-800">
                    💡 <strong>Notă:</strong> După finalizarea plății, vei primi un email de confirmare cu detaliile comenzii.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}