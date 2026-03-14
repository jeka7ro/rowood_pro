import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Order } from '@/entities/Order';
import { Auth } from '@/entities';
import { CompanySettings } from '@/entities/CompanySettings';
import { Product } from '@/entities/Product';
import { Material } from '@/entities/Material';
import { SubMaterial } from '@/entities/SubMaterial';
import { Color } from '@/entities/Color';
import { GlazingType } from '@/entities/GlazingType';
import { AccessoryOption } from '@/entities/AccessoryOption';
import { CartItem } from '@/entities/CartItem';
import { Configuration } from '@/entities/Configuration'; // Added import for Configuration entity
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Download, Package, Ruler, AlertCircle, Layers, Shield, Thermometer, ImageOff } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { createPageUrl } from '@/utils';
import ImageLightbox from '../components/ui/ImageLightbox';
import ProductViewer from '../components/configurator/ProductViewer';

const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    in_production: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    ready: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const statusNames = {
    pending: 'În Așteptare',
    confirmed: 'Confirmată',
    in_production: 'În Producție',
    ready: 'Gata de Livrare',
    delivered: 'Livrată',
    cancelled: 'Anulată'
};

export default function OrderDetailsPage() {
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [relatedData, setRelatedData] = useState(null);
  const [companySettings, setCompanySettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const openLightbox = (src, alt = "Previzualizare") => setLightboxImage({ src, alt });
  const closeLightbox = () => setLightboxImage(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const urlParams = new URLSearchParams(location.search);
        const orderId = urlParams.get('order_id');
        if (!orderId) {
          window.location.href = createPageUrl('MyOrders');
          return;
        }

        const currentUser = await Auth.me();

        const orderRes = await Order.get(orderId);
        if (!orderRes) {
          setError('Comanda nu a fost găsită.');
          setIsLoading(false);
          return;
        }

        if (orderRes.customer_email !== currentUser.email && currentUser.role !== 'admin') {
          setError('Nu aveți permisiunea să accesați această comandă.');
          setIsLoading(false);
          return;
        }
        
        setOrder(orderRes);

        const [
          companySettingsRes,
          products,
          materials,
          subMaterials,
          colors,
          glazingTypes,
          accessories,
          allCartItems
        ] = await Promise.all([
          CompanySettings.list(),
          Product.list(),
          Material.list(),
          SubMaterial.list(),
          Color.list(),
          GlazingType.list(),
          AccessoryOption.list(),
          CartItem.filter({ order_id: orderId })
        ]);
        
        setCompanySettings(companySettingsRes[0] || null);
        setRelatedData({ products, materials, subMaterials, colors, glazingTypes, accessories });

        let displayItems = allCartItems.map(item => {
            const realProduct = products.find(p => p.id === item.product_id);
            
            // PRIORITATE MAXIMĂ PENTRU TOATE SURSELE DE IMAGINE
            const availableImages = [
              item.configuration && item.configuration.image_url,           // Din configurația salvată
              item.image_url,                          // Din cart item direct
              realProduct && realProduct.configurator_image_urls && realProduct.configurator_image_urls[0], // Din produs - configurator
              realProduct && realProduct.image_urls && realProduct.image_urls[0],            // Din produs - catalog
              realProduct && realProduct.image_url                   // Din produs - imagine principală
            ].filter(Boolean); // Eliminăm valorile null/undefined
            
            return {
              ...item,
              product_name: (realProduct && realProduct.name) || item.product_name,
              display_image_url: availableImages[0]
            };
        });

        // Fallback: if no CartItems saved, load configurations from order.configurations IDs
        // This handles older orders where 'configurations' might store Configuration IDs
        if (displayItems.length === 0 && Array.isArray(orderRes.configurations) && orderRes.configurations.length > 0) {
          const configDocs = (await Promise.all(
            orderRes.configurations.map(async (confId) => {
              try { return await Configuration.get(confId); } catch { return null; }
            })
          )).filter(Boolean); // Filter out any configurations that failed to load

          displayItems = configDocs.map((config, index) => {
            const realProduct = products.find(p => p.id === config.product_id);
            const imageUrl =
              config.image_url ||
              (realProduct?.configurator_image_urls?.[0]) ||
              (realProduct?.image_urls?.[0]) ||
              config.product_image_url; // Original product image from config itself

            return {
              id: config.id || `conf-${index}`,
              product_id: config.product_id,
              product_name: realProduct?.name || `Produs #${index + 1}`,
              price: config.calculated_price || 0, // Default to 0 if not available
              quantity: config.quantity || 1,
              configuration: config,
              image_url: imageUrl, // Store on the item for consistency
              display_image_url: imageUrl // Use for display
            };
          });
        }
        
        setCartItems(displayItems);

      } catch (err) {
        console.error("Failed to load order details:", err);
        setError(`A apărut o eroare la încărcarea comenzii: ${err.message || 'Eroare de rețea'}. Vă rugăm reîncărcați pagina.`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, [location.search]);

  const generatePDF = async (type) => {
    if (!order || !cartItems.length) {
      alert("Datele comenzii nu sunt complet încărcate.");
      return;
    }
    
    setIsDownloading(true);

    try {
      const { generateOrderConfirmationPDF } = await import('../components/utils/pdfGenerator');
      
      const pdfDoc = await generateOrderConfirmationPDF(
        order, 
        cartItems, 
        relatedData, 
        companySettings,
        type === 'proforma' // isProforma boolean
      );
      
      const fileName = `${type === 'proforma' ? 'Factura_Proforma' : 'Comanda'}_RoWood_${order.order_number || order.id.slice(-8)}.pdf`;
      pdfDoc.save(fileName);

    } catch (err) {
      console.error("PDF Generation failed:", err);
      alert("A apărut o eroare la generarea PDF-ului. Vă rugăm încercați din nou.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPDF = (type) => {
    generatePDF(type);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 dark:text-green-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Se încarcă detaliile comenzii...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center max-w-md p-8 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <AlertCircle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3">Eroare</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">{error}</p>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link to={createPageUrl('MyOrders')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi la Comenzile Mele
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center max-w-md p-8 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <AlertCircle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3">Comandă nu a fost găsită</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">Nu am putut încărca detaliile comenzii.</p>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link to={createPageUrl('MyOrders')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi la Comenzile Mele
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <ImageLightbox src={lightboxImage?.src} alt={lightboxImage?.alt} onClose={closeLightbox} />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Button asChild variant="outline" className="border-slate-300 dark:border-slate-600">
            <Link to={createPageUrl('MyOrders')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi la Comenzile Mele
            </Link>
          </Button>

          <div className="flex gap-3">
            <Button
              onClick={() => handleDownloadPDF('order')}
              disabled={isDownloading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Descarcă Broșură Comandă
            </Button>
            <Button
              onClick={() => handleDownloadPDF('proforma')}
              disabled={isDownloading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Descarcă Factură Proformă
            </Button>
          </div>
        </div>

        <Card className="mb-6 shadow-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <CardHeader className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <CardTitle className="text-2xl text-slate-800 dark:text-slate-100">
                  Comanda #{order.order_number || order.id.slice(-8).toUpperCase()}
                </CardTitle>
                <p className="text-slate-500 dark:text-slate-400">
                  Plasată pe {format(new Date(order.created_date), 'd MMMM yyyy, HH:mm', { locale: ro })}
                </p>
              </div>
              <div className="text-right">
                <Badge className={`${statusColors[order.status]} text-base mb-2`}>
                  {statusNames[order.status]}
                </Badge>
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                  {order.total_amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Client</h3>
              <div className="text-slate-600 dark:text-slate-400 space-y-1">
                <p className="font-medium text-slate-900 dark:text-slate-100">{order.customer_name}</p>
                {order.customer_type === 'business' && order.company_name && (
                  <p className="font-medium text-blue-600 dark:text-blue-400">{order.company_name}</p>
                )}
                <p>{order.customer_email}</p>
                <p>{order.customer_phone}</p>
                {order.customer_type === 'business' && order.cui && (
                  <p className="text-sm">CUI: {order.cui}</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Adresa de Livrare</h3>
              <div className="text-slate-600 dark:text-slate-400 space-y-1">
                <p>{order.delivery_address?.street || 'Nu este specificată'}</p>
                <p>{order.delivery_address?.postal_code} {order.delivery_address?.city}</p>
                <p>{order.delivery_address?.country || 'România'}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Status Plată</h3>
              <div className="text-slate-600 dark:text-slate-400 space-y-1">
                <Badge variant={order.payment_status === 'paid' ? 'success' : 'destructive'}>
                  {order.payment_status === 'paid' ? 'Plătit' : 'În așteptare'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Produsele Comandate</h2>

        <div className="space-y-6">
          {cartItems && cartItems.length > 0 ? cartItems.map((item, itemIndex) => {
            const config = item.configuration || {};
            const realProduct = relatedData?.products?.find(p => p.id === config.product_id);
            const material = relatedData?.materials?.find(m => m.id === config.material_id);
            const subMaterial = relatedData?.subMaterials?.find(sm => sm.id === config.sub_material_id);
            const color = relatedData?.colors?.find(c => c.id === config.color_id);
            const glazing = relatedData?.glazingTypes?.find(g => g.id === config.glazing_id);
            const accessories = config.accessories ? config.accessories.map(accId => relatedData?.accessories?.find(a => a.id === accId)?.name).filter(Boolean) : [];
            
            // The imageUrl is no longer directly used for the ProductViewer, but might be useful for other contexts or fallbacks
            const imageUrl = item.display_image_url; 

            return (
              <Card key={item.id} className="shadow-lg overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* VIZUALIZARE CONFIGURATOR - Exact ca în configurator */}
                    <div className="space-y-4">
                      <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-slate-200 dark:border-slate-600 p-4">
                        <ProductViewer
                          product={realProduct}
                          width={config.width || 1200}
                          height={config.height || 1400}
                          material={material}
                          subMaterial={subMaterial}
                          color={color}
                          glazing={glazing}
                          sashConfigs={config.sash_configs || []}
                          isDoor={realProduct?.category === 'usi' || realProduct?.category === 'usi-balcon'}
                          individualSashWidths={config.individual_sash_widths || []}
                          useIndividualWidths={config.use_individual_widths || false}
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{item.product_name}</h3>
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <Ruler className="w-4 h-4 text-slate-500 dark:text-slate-400"/>
                          <span className="text-lg">{config?.width || 1200}mm × {config?.height || 1400}mm</span>
                          <span className="text-slate-500 dark:text-slate-400">
                            ({((config?.width || 1200) * (config?.height || 1400) / 1000000).toFixed(2)} m²)
                          </span>
                        </div>
                        <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                          {item.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                        </div>
                        <Badge variant="secondary" className="text-base bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {item.quantity} {item.quantity === 1 ? 'bucată' : 'bucăți'}
                        </Badge>
                      </div>
                    </div>

                    {/* SECȚIUNEA CU SPECIFICAȚIILE */}
                    <div className="space-y-6">
                      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                          <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          Specificații Tehnice
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
                            <Layers className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                            <div className="font-bold text-slate-800 dark:text-slate-100">Sticlă</div>
                            <div className="text-slate-600 dark:text-slate-400">{glazing?.name || 'Dublă'}</div>
                          </div>
                          <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
                            <Thermometer className="w-6 h-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
                            <div className="font-bold text-slate-800 dark:text-slate-100">U-Value</div>
                            <div className="text-slate-600 dark:text-slate-400">{glazing?.u_value || 'N/A'}</div>
                          </div>
                          <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
                            <Shield className="w-6 h-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                            <div className="font-bold text-slate-800 dark:text-slate-100">Profil</div>
                            <div className="text-slate-600 dark:text-slate-400">{material?.name || 'PVC'}{subMaterial ? ` (${subMaterial.name})` : ''}</div>
                          </div>
                          <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
                            <div className="w-6 h-6 mx-auto mb-2" style={{ backgroundColor: color?.hex_code || '#cccccc', borderRadius: '50%' }}></div>
                            <div className="font-bold text-slate-800 dark:text-slate-100">Culoare</div>
                            <div className="text-slate-600 dark:text-slate-400">{color?.name || config.custom_ral_code || 'Standard'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Tip deschidere */}
                      {config.opening_type_summary && (
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg p-4 shadow-sm">
                          <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Tip Deschidere</h4>
                          <p className="text-slate-700 dark:text-slate-300 capitalize">{config.opening_type_summary}</p>
                        </div>
                      )}

                      {/* Accesorii */}
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg p-4 shadow-sm">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Accesorii Incluse</h4>
                        {accessories.length > 0 ? (
                          <ul className="space-y-3">
                            {accessories.map((acc, i) => (
                              <li key={i} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                                <div className="w-2 h-2 bg-green-600 dark:bg-green-500 rounded-full flex-shrink-0"></div>
                                <span className="font-medium">{acc}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-slate-500 dark:text-slate-400 text-sm">Nu sunt accesorii selectate</p>
                        )}
                      </div>

                      {/* Cerințe speciale */}
                      {config.special_requirements && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                          <h4 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">Cerințe Speciale</h4>
                          <p className="text-yellow-700 dark:text-yellow-300 text-sm">{config.special_requirements}</p>
                        </div>
                      )}
                    </div>

                  </div>
                </CardContent>
              </Card>
            );
          }) : (
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <CardContent className="p-6 text-center text-slate-500 dark:text-slate-400">
                <Package className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-100">Nu s-au găsit produse</h3>
                <p>Nu s-au găsit produse pentru această comandă.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="mt-8 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700">
          <CardHeader>
            <CardTitle className="text-lg text-amber-900 dark:text-amber-400">Informații Importante</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-amber-800 dark:text-amber-300 text-sm">
              <li>Termenul de livrare este de 3-4 săptămâni de la confirmarea comenzii</li>
              <li>Montajul este inclus în preț și se realizează de către echipa noastră</li>
              <li>Plata se poate face în rate prin partenerii noștri financiari</li>
              <li>Pentru modificări sau anulări, vă rugăm să ne contactați în primele 24 de ore</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}