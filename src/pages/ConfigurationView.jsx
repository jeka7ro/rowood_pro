
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CartItem } from '@/entities/CartItem';
import { Product } from '@/entities/Product';
import { Material } from '@/entities/Material';
import { SubMaterial } from '@/entities/SubMaterial';
import { Color } from '@/entities/Color';
import { GlazingType } from '@/entities/GlazingType';
import { AccessoryOption } from '@/entities/AccessoryOption';
import { Order } from '@/entities/Order';
import { User } from '@/entities/User';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, Download, Package, Ruler, Palette, Layers, Settings } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function ConfigurationViewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [configItem, setConfigItem] = useState(null);
  const [relatedData, setRelatedData] = useState({});
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const urlParams = new URLSearchParams(location.search);
  const configId = urlParams.get('config_id');
  const orderId = urlParams.get('order_id');

  const loadConfigurationData = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      if (currentUser.role !== 'admin') {
        navigate(createPageUrl('Home'));
        return;
      }
      setUser(currentUser);

      // Încarcă configurația
      const config = await CartItem.filter({ id: configId });
      if (!config || config.length === 0) {
        alert('Configurația nu a fost găsită.');
        navigate(createPageUrl('OrderManager'));
        return;
      }
      setConfigItem(config[0]);

      // Încarcă comanda
      if (orderId) {
        const orderData = await Order.filter({ id: orderId });
        if (orderData && orderData.length > 0) {
          setOrder(orderData[0]);
        }
      }

      // Încarcă toate datele de referință
      const [products, materials, subMaterials, colors, glazingTypes, accessories] = await Promise.all([
        Product.list(),
        Material.list(),
        SubMaterial.list(),
        Color.list(),
        GlazingType.list(),
        AccessoryOption.list()
      ]);

      setRelatedData({
        products,
        materials,
        subMaterials,
        colors,
        glazingTypes,
        accessories
      });

    } catch (error) {
      console.error("Eroare la încărcarea datelor de configurație:", error);
      alert('A apărut o eroare la încărcarea datelor.');
    } finally {
      setIsLoading(false);
    }
  }, [configId, orderId, navigate]); // Added navigate to useCallback dependencies

  useEffect(() => {
    loadConfigurationData();
  }, [loadConfigurationData]); // Dependency array updated to depend on the memoized function

  const downloadPDF = async () => {
    try {
      const { InvokeLLM } = await import('@/integrations/Core');
      
      const configDetails = getConfigurationDetails();
      
      await InvokeLLM({
        prompt: `Creează un document PDF profesional pentru această comandă de ferestre/uși cu următoarele detalii:
        
        DETALII COMANDĂ:
        ${order ? `Numărul comenzii: ${order.order_number}` : ''}
        ${order ? `Client: ${order.customer_name}` : ''}
        ${order ? `Email: ${order.customer_email}` : ''}
        ${order ? `Telefon: ${order.customer_phone}` : ''}
        ${order && order.company_name ? `Companie: ${order.company_name}` : ''}
        ${order && order.cui ? `CUI: ${order.cui}` : ''}
        
        CONFIGURAȚIE PRODUS:
        ${configDetails}
        
        Preț total: ${configItem.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
        Cantitate: ${configItem.quantity}
        
        Formatează documentul ca un PDF profesional cu logo RoWood, cu secțiuni clare și layout atractiv pentru o ofertă comercială.`,
        response_json_schema: {
          type: "object",
          properties: {
            pdf_url: { type: "string" }
          }
        }
      });
      
    } catch (error) {
      console.error("Eroare la generarea PDF:", error);
      alert('A apărut o eroare la generarea PDF-ului.');
    }
  };

  const getConfigurationDetails = () => {
    if (!configItem || !relatedData.products) return '';

    const config = configItem.configuration;
    const product = relatedData.products.find(p => p.id === config.product_id);
    const material = relatedData.materials.find(m => m.id === config.material_id);
    const subMaterial = relatedData.subMaterials.find(sm => sm.id === config.sub_material_id);
    const color = relatedData.colors.find(c => c.id === config.color_id);
    const glazing = relatedData.glazingTypes.find(g => g.id === config.glazing_id);
    const selectedAccessories = relatedData.accessories.filter(acc => config.accessories?.includes(acc.id));

    let details = '';
    if (product) details += `Produs: ${product.name}\n`;
    details += `Dimensiuni: ${config.width}mm × ${config.height}mm (${((config.width * config.height) / 1000000).toFixed(2)} m²)\n`;
    if (material) details += `Material: ${material.name}\n`;
    if (subMaterial) details += `Tip lemn: ${subMaterial.name}\n`;
    if (color) details += `Culoare: ${color.name}\n`;
    if (config.custom_ral_code) details += `Culoare personalizată: RAL ${config.custom_ral_code}\n`;
    if (glazing) details += `Sticlă: ${glazing.name}\n`;
    if (config.opening_type_summary) details += `Tip deschidere: ${config.opening_type_summary}\n`;
    if (selectedAccessories.length > 0) {
      details += `Accesorii: ${selectedAccessories.map(acc => acc.name).join(', ')}\n`;
    }
    if (config.special_requirements) details += `Cerințe speciale: ${config.special_requirements}\n`;

    return details;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!configItem) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-slate-800 mb-3">Configurația nu a fost găsită</h2>
        <Button onClick={() => navigate(createPageUrl('OrderManager'))}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Înapoi la Comenzi
        </Button>
      </div>
    );
  }

  const config = configItem.configuration;
  const product = relatedData.products?.find(p => p.id === config.product_id);
  const material = relatedData.materials?.find(m => m.id === config.material_id);
  const subMaterial = relatedData.subMaterials?.find(sm => sm.id === config.sub_material_id);
  const color = relatedData.colors?.find(c => c.id === config.color_id);
  const glazing = relatedData.glazingTypes?.find(g => g.id === config.glazing_id);
  const selectedAccessories = relatedData.accessories?.filter(acc => config.accessories?.includes(acc.id)) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Detalii Configurație</h1>
          {order && (
            <p className="text-slate-600 mt-1">
              Comanda #{order.order_number} - {order.customer_name}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Button onClick={downloadPDF} className="bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" />
            Descarcă PDF
          </Button>
          <Button variant="outline" onClick={() => navigate(createPageUrl('OrderManager'))}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Înapoi
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Detalii Produs */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Informații Produs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {product && (
                <div>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-slate-600">{product.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-600 font-medium text-sm">Lățime</span>
                  <div className="text-xl font-bold text-blue-800">{config.width}mm</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-600 font-medium text-sm">Înălțime</span>
                  <div className="text-xl font-bold text-blue-800">{config.height}mm</div>
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <span className="text-green-600 font-medium text-sm">Suprafața totală</span>
                <div className="text-xl font-bold text-green-800">
                  {((config.width * config.height) / 1000000).toFixed(2)} m²
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600">Cantitate:</span>
                <Badge className="bg-slate-100 text-slate-800 text-lg px-3 py-1">
                  {configItem.quantity} {configItem.quantity === 1 ? 'bucată' : 'bucăți'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Material și Culoare */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-orange-600" />
                Material și Finisaje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {material && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Material:</span>
                  <span className="font-semibold">{material.name}</span>
                </div>
              )}
              
              {subMaterial && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Tip lemn:</span>
                  <span className="font-semibold">{subMaterial.name}</span>
                </div>
              )}
              
              {color && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Culoare:</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: color.hex_code }}
                    />
                    <span className="font-semibold">{color.name}</span>
                  </div>
                </div>
              )}
              
              {config.custom_ral_code && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Culoare personalizată:</span>
                  <span className="font-semibold">RAL {config.custom_ral_code}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detalii Tehnice */}
        <div className="space-y-6">
          {/* Sticlă */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600" />
                Specificații Sticlă
              </CardTitle>
            </CardHeader>
            <CardContent>
              {glazing ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tip:</span>
                    <span className="font-semibold">{glazing.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Foi sticlă:</span>
                    <span className="font-semibold">{glazing.panes_count}</span>
                  </div>
                  {glazing.u_value && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">U-value:</span>
                      <span className="font-semibold">{glazing.u_value}</span>
                    </div>
                  )}
                  {glazing.thickness && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Grosime:</span>
                      <span className="font-semibold">{glazing.thickness}mm</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500">Nu a fost specificat tip de sticlă</p>
              )}
            </CardContent>
          </Card>

          {/* Accesorii */}
          {selectedAccessories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-600" />
                  Accesorii ({selectedAccessories.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedAccessories.map((accessory) => (
                    <div key={accessory.id} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <div>
                        <span className="font-medium">{accessory.name}</span>
                        {accessory.description && (
                          <p className="text-sm text-slate-600">{accessory.description}</p>
                        )}
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        +{accessory.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informații suplimentare */}
          <Card>
            <CardHeader>
              <CardTitle>Detalii Suplimentare</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {config.opening_type_summary && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Tip deschidere:</span>
                  <span className="font-semibold capitalize">{config.opening_type_summary}</span>
                </div>
              )}
              
              {config.handle_position && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Poziție mâner:</span>
                  <span className="font-semibold capitalize">{config.handle_position}</span>
                </div>
              )}

              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>PREȚ TOTAL:</span>
                <span className="text-green-600">
                  {configItem.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Cerințe speciale */}
          {config.special_requirements && (
            <Card>
              <CardHeader>
                <CardTitle>Cerințe Speciale</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 bg-yellow-50 p-3 rounded">
                  {config.special_requirements}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
