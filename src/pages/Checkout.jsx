import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, User as UserIcon, MapPin, CreditCard, ArrowLeft, Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Lista țărilor UE (fără România) pentru validare VAT
const EU_COUNTRIES = [
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgia' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'CY', name: 'Cipru' },
  { code: 'CZ', name: 'Cehia' },
  { code: 'DE', name: 'Germania' },
  { code: 'DK', name: 'Danemarca' },
  { code: 'EE', name: 'Estonia' },
  { code: 'ES', name: 'Spania' },
  { code: 'FI', name: 'Finlanda' },
  { code: 'FR', name: 'Franța' },
  { code: 'GR', name: 'Grecia' },
  { code: 'HR', name: 'Croația' },
  { code: 'HU', name: 'Ungaria' },
  { code: 'IE', name: 'Irlanda' },
  { code: 'IT', name: 'Italia' },
  { code: 'LT', name: 'Lituania' },
  { code: 'LU', name: 'Luxemburg' },
  { code: 'LV', name: 'Letonia' },
  { code: 'MT', name: 'Malta' },
  { code: 'NL', name: 'Olanda' },
  { code: 'PL', name: 'Polonia' },
  { code: 'PT', name: 'Portugalia' },
  { code: 'SE', name: 'Suedia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SK', name: 'Slovacia' },
];

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '' });

  const [formData, setFormData] = useState({
    customer_type: 'individual',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    company_name: '',
    cui_prefix: 'RO',
    cui_number: '',
    reg_com: '',
    billing_address: {
      street: '',
      city: '',
      postal_code: '',
      country: 'România'
    },
    delivery_address: {
      street: '',
      city: '',
      postal_code: '',
      country: 'România'
    },
    use_billing_for_delivery: true
  });

  // State pentru validare VAT UE
  const [vatValidation, setVatValidation] = useState({
    isValidating: false,
    isValid: null, // null = nu s-a verificat, true = valid, false = invalid
    companyName: null,
    companyAddress: null,
    error: null
  });
  const [isVatExempt, setIsVatExempt] = useState(false);

  // State pentru validare ANAF (firme România)
  const [anafValidation, setAnafValidation] = useState({
    isValidating: false,
    isValid: null,
    error: null
  });

  const showAlert = (title, message) => {
    setAlertDialog({ isOpen: true, title, message });
  };

  // Verifică dacă țara de facturare este în UE (dar nu România)
  const isEuCountry = useMemo(() => {
    const country = formData.billing_address?.country?.toLowerCase() || '';
    return EU_COUNTRIES.some(c => 
      country.includes(c.name.toLowerCase()) || 
      country === c.code.toLowerCase()
    );
  }, [formData.billing_address?.country]);

  // Validare VAT prin backend function (VIES SOAP API)
  const validateVatNumber = async () => {
    if (!formData.cui_prefix || !formData.cui_number) {
      showAlert('Câmp obligatoriu', 'Te rugăm să completezi codul VAT.');
      return;
    }

    const countryCode = formData.cui_prefix.toUpperCase();
    if (countryCode === 'RO') {
      showAlert('Info', 'Pentru România nu se aplică scutirea de TVA intra-comunitar.');
      return;
    }

    if (!EU_COUNTRIES.some(c => c.code === countryCode)) {
      showAlert('Eroare', 'Codul de țară nu este valid pentru UE.');
      return;
    }

    setVatValidation({ isValidating: true, isValid: null, companyName: null, companyAddress: null, error: null });

    try {
      const response = await base44.functions.invoke('validateVat', {
        countryCode: countryCode,
        vatNumber: formData.cui_number
      });

      const result = response.data;

      if (result.valid) {
        setVatValidation({
          isValidating: false,
          isValid: true,
          companyName: result.companyName || null,
          companyAddress: result.companyAddress || null,
          error: null
        });
        setIsVatExempt(true);
        
        // Auto-completează datele companiei dacă au fost returnate (și nu sunt "---")
        const hasValidName = result.companyName && result.companyName !== '---';
        const hasValidAddress = result.companyAddress && result.companyAddress !== '---';
        
        if (hasValidName || hasValidAddress) {
          setFormData(prev => {
            const updates = { ...prev };
            if (hasValidName) {
              updates.company_name = result.companyName;
            }
            if (hasValidAddress) {
              // Parsează adresa pentru a extrage strada, orașul, codul poștal
              const addressParts = result.companyAddress.split('\n').filter(p => p.trim() && p.trim() !== '---');
              if (addressParts.length > 0) {
                updates.billing_address = { ...prev.billing_address };
                // Prima linie = strada
                updates.billing_address.street = addressParts[0].trim();
                // A doua linie poate conține cod poștal și oraș
                if (addressParts.length > 1) {
                  const cityLine = addressParts[1].trim();
                  // Încercăm să extragem codul poștal (numere la început)
                  const postalMatch = cityLine.match(/^(\d{4,6})\s*(.*)$/);
                  if (postalMatch) {
                    updates.billing_address.postal_code = postalMatch[1];
                    updates.billing_address.city = postalMatch[2].trim();
                  } else {
                    updates.billing_address.city = cityLine;
                  }
                }
              }
            }
            // Setează țara din prefixul VAT
            const countryName = EU_COUNTRIES.find(c => c.code === countryCode)?.name;
            if (countryName) {
              updates.billing_address = { ...(updates.billing_address || prev.billing_address), country: countryName };
            }
            return updates;
          });
        } else {
          // Chiar dacă nu avem date companie, setăm cel puțin țara
          const countryName = EU_COUNTRIES.find(c => c.code === countryCode)?.name;
          if (countryName) {
            setFormData(prev => ({
              ...prev,
              billing_address: { ...prev.billing_address, country: countryName }
            }));
          }
        }
      } else {
        setVatValidation({
          isValidating: false,
          isValid: false,
          companyName: null,
          companyAddress: null,
          error: result.error || 'Numărul VAT nu este valid.'
        });
        setIsVatExempt(false);
      }
    } catch (error) {
      console.error('VAT validation error:', error);
      setVatValidation({
        isValidating: false,
        isValid: false,
        companyName: null,
        companyAddress: null,
        error: 'Eroare la verificarea VAT. Te rugăm să încerci din nou.'
      });
      setIsVatExempt(false);
    }
  };

  // Resetează validarea VAT și ANAF când se schimbă prefixul sau numărul
  useEffect(() => {
    setVatValidation({ isValidating: false, isValid: null, companyName: null, companyAddress: null, error: null });
    setAnafValidation({ isValidating: false, isValid: null, error: null });
    setIsVatExempt(false);
  }, [formData.cui_prefix, formData.cui_number]);

  // Funcție de Căutare Automată Firmă RO
  const validateAnafCui = async (cuiNumber) => {
    if (!cuiNumber || cuiNumber.length < 2) return;
    
    setAnafValidation({ isValidating: true, isValid: null, error: null });

    try {
      const cleanCui = cuiNumber.toString().replace(/[^0-9]/g, '');
      const today = new Date().toISOString().split('T')[0];
      const payload = [{ cui: parseInt(cleanCui, 10), data: today }];

      const response = await fetch('/api/anaf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Eroare HTTP de la proxy');
      }

      const data = await response.json();

      // API-ul ANAF v9 returnează direct array-ul 'found' fără status 'cod' de bază
      if (data.found && data.found.length > 0) {
        const companyData = data.found[0].date_generale;

        setAnafValidation({
          isValidating: false,
          isValid: true,
          error: null
        });

        setFormData(prev => {
          const updates = { ...prev };
          if (companyData.denumire) updates.company_name = companyData.denumire;
          if (companyData.nrRegCom) updates.reg_com = companyData.nrRegCom;

          if (companyData.adresa) {
            updates.billing_address = { ...prev.billing_address };
            const parts = companyData.adresa.split(',');
            if (parts.length > 0) {
               updates.billing_address.city = parts[0].trim();
               updates.billing_address.street = parts.slice(1).join(',').trim() || companyData.adresa;
            } else {
               updates.billing_address.street = companyData.adresa;
            }
          }
          return updates;
        });
      } else {
        setAnafValidation({
          isValidating: false,
          isValid: false,
          error: 'CUI invalid sau inexistent la ANAF.'
        });
      }
    } catch (error) {
      console.error('ANAF validation error:', error);
      setAnafValidation({
        isValidating: false,
        isValid: false,
        error: 'Eroare la conectarea cu ANAF.'
      });
    }
  };

  const handleCuiBlur = (e) => {
    const cuiVal = e.target.value.trim();
    if (formData.cui_prefix === 'RO' && cuiVal.length >= 2) {
       validateAnafCui(cuiVal);
    }
  };

  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      try {
        // Citim sesiunea locală
        const localSession = JSON.parse(localStorage.getItem('local_auth_session') || 'null');
        const items = JSON.parse(localStorage.getItem('rowood_cart') || '[]');

        if (localSession) {
          setFormData(prev => ({
            ...prev,
            customer_name: localSession.full_name || '',
            customer_email: localSession.email || '',
          }));
        }

        setCartItems(items);
      } catch (error) {
        console.error('Failed to load cart:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, []);

  // Calculăm totalul produselor - extrage TVA dacă este scutit
  const cartTotalProducts = useMemo(() => {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return total;
  }, [cartItems]);

  // Calculăm TVA-ul (21% din total fără TVA)
  const vatAmount = useMemo(() => {
    if (isVatExempt) return 0;
    // Prețurile includ deja TVA, deci calculăm invers
    // Total = Net + 21% => Net = Total / 1.21 => TVA = Total - Net
    return cartTotalProducts - (cartTotalProducts / 1.21);
  }, [cartTotalProducts, isVatExempt]);

  // Totalul net (fără TVA) - pentru afișare
  const netTotal = useMemo(() => {
    return cartTotalProducts / 1.21;
  }, [cartTotalProducts]);

  const transportInstallationTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const config = item.configuration || {};
      let extra = 0;
      
      // Calculăm transport și montaj din configurație
      if (config.include_transport && config.transport_cost) {
        extra += config.transport_cost;
      }
      if (config.include_installation && config.installation_cost) {
        extra += config.installation_cost;
      }
      
      return sum + (extra * item.quantity);
    }, 0);
  }, [cartItems]);

  // Totalul final - scade TVA dacă este scutit
  const finalTotal = useMemo(() => {
    if (isVatExempt) {
      // Returnează totalul fără TVA
      return netTotal + (transportInstallationTotal / 1.21);
    }
    return cartTotalProducts + transportInstallationTotal;
  }, [cartTotalProducts, transportInstallationTotal, isVatExempt, netTotal]);

  const validateForm = () => {
    if (!formData.customer_name.trim()) {
      showAlert('Câmp obligatoriu', 'Te rugăm să completezi numele.');
      return false;
    }
    if (!formData.customer_email.trim()) {
      showAlert('Câmp obligatoriu', 'Te rugăm să completezi email-ul.');
      return false;
    }
    if (!formData.customer_phone.trim()) {
      showAlert('Câmp obligatoriu', 'Te rugăm să completezi telefonul.');
      return false;
    }

    if (formData.customer_type === 'business') {
      if (!formData.company_name?.trim()) {
        showAlert('Câmp obligatoriu', 'Te rugăm să completezi numele companiei.');
        return false;
      }
      if (!formData.cui_number?.trim()) {
        showAlert('Câmp obligatoriu', 'Te rugăm să completezi CUI-ul.');
        return false;
      }
      if (!formData.reg_com?.trim()) {
        showAlert('Câmp obligatoriu', 'Te rugăm să completezi numărul de înregistrare.');
        return false;
      }
    }

    if (!formData.billing_address?.street?.trim()) {
      showAlert('Câmp obligatoriu', 'Te rugăm să completezi adresa de facturare.');
      return false;
    }
    if (!formData.billing_address?.city?.trim()) {
      showAlert('Câmp obligatoriu', 'Te rugăm să completezi orașul pentru facturare.');
      return false;
    }
    if (!formData.billing_address?.postal_code?.trim()) {
      showAlert('Câmp obligatoriu', 'Te rugăm să completezi codul poștal pentru facturare.');
      return false;
    }
    if (!formData.billing_address?.country?.trim()) {
      showAlert('Câmp obligatoriu', 'Te rugăm să completezi țara pentru facturare.');
      return false;
    }

    if (!formData.use_billing_for_delivery) {
      if (!formData.delivery_address?.street?.trim()) {
        showAlert('Câmp obligatoriu', 'Te rugăm să completezi adresa de livrare.');
        return false;
      }
      if (!formData.delivery_address?.city?.trim()) {
        showAlert('Câmp obligatoriu', 'Te rugăm să completezi orașul pentru livrare.');
        return false;
      }
      if (!formData.delivery_address?.postal_code?.trim()) {
        showAlert('Câmp obligatoriu', 'Te rugăm să completezi codul poștal pentru livrare.');
        return false;
      }
      if (!formData.delivery_address?.country?.trim()) {
        showAlert('Câmp obligatoriu', 'Te rugăm să completezi țara pentru livrare.');
        return false;
      }
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setIsPlacingOrder(true);
    try {
      const itemsToProcess = [...cartItems];
      const [products, colors, materials, glazingTypes] = await Promise.all([
        base44.entities.Product.list(),
        base44.entities.Color.list(),
        base44.entities.Material.list(),
        base44.entities.GlazingType.list()
      ]);

      // 1. Creare și Salvare Configurații
      const savedConfigurations = await Promise.all(itemsToProcess.map(async (item) => {
        const configData = {
          product_id: item.product_id,
          material_id: item.configuration.material_id,
          sub_material_id: item.configuration.sub_material_id,
          color_id: item.configuration.color_id,
          custom_ral_code: item.configuration.custom_ral_code,
          glazing_id: item.configuration.glazing_id,
          width: item.configuration.width,
          height: item.configuration.height,
          opening_type: item.configuration.opening_type_summary || item.configuration.opening_type || 'standard',
          sash_configs: item.configuration.sash_configs || [],
          accessories: item.configuration.accessories || [],
          quantity: item.quantity,
          calculated_price: item.price,
          additional_options: item.configuration.additional_options || {},
          image_url: item.configuration.image_url || item.image_url,
          product_image_url: item.image_url,
          special_requirements: item.configuration.special_requirements || '',
          include_transport: item.configuration.include_transport || false,
          include_installation: item.configuration.include_installation || false,
          delivery_country: item.configuration.delivery_country || 'RO'
        };
        return await base44.entities.Configuration.create(configData);
      }));

        // Build configuration snapshots for FactoryManager (embedded on Order)
        const configuration_snapshots = itemsToProcess.map((item) => {
          const config = item.configuration || {};
          const product = products.find(p => p.id === item.product_id);
          const material = materials.find(m => m.id === config.material_id);
          const glazing = glazingTypes.find(g => g.id === config.glazing_id);
          const color = colors.find(c => c.id === config.color_id);
          return {
            product_name: product?.name || item.product_name || 'Produs',
            width: config.width || 800,
            height: config.height || 1200,
            quantity: item.quantity || 1,
            material_name: material?.name || 'PVC',
            glazing_name: glazing?.name || 'Sticlă Dublă',
            sash_configs: config.sash_configs || [],
            opening_type_summary: config.opening_type_summary || '',
            price: item.price || 0,
            color_name: color?.name || config.color_name || '',
            color_hex: color?.hex_code || config.color_hex || '',
            image_url: config.image_url || item.image_url || '',
          };
        });

        // 2. Creare Comandă CU STATUS PENDING_PAYMENT (NU confirmed!)
        const orderData = {
          customer_type: formData.customer_type,
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          company_name: formData.customer_type === 'business' ? formData.company_name : undefined,
          cui: formData.customer_type === 'business' ? formData.cui_prefix + formData.cui_number : undefined,
          reg_com: formData.customer_type === 'business' ? formData.reg_com : undefined,
          billing_address: formData.billing_address,
          delivery_address: formData.use_billing_for_delivery ? formData.billing_address : formData.delivery_address,
          configurations: savedConfigurations.map(config => config.id),
          configuration_snapshots: configuration_snapshots,
          notes: '[CONFIG_SNAPSHOTS]' + JSON.stringify(configuration_snapshots),
          total_amount: finalTotal,
          transport_cost: isVatExempt ? transportInstallationTotal / 1.21 : transportInstallationTotal,
          extra_total: isVatExempt ? transportInstallationTotal / 1.21 : transportInstallationTotal,
          status: 'pending',
          payment_status: 'pending',
          vat_exempt: isVatExempt,
          vat_country: isVatExempt ? formData.cui_prefix : null
        };
      const newOrder = await base44.entities.Order.create(orderData);

      // 3. Ștergere Coș
      localStorage.removeItem('rowood_cart');

      // 4. NU TRIMITE EMAILURI ÎNCĂ - doar la plată confirmată!
      // Emailurile se vor trimite din Payment/PaymentSuccess după confirmare

      // 5. REDIRECT DOAR la pagina de plată - NU la OrderSuccess!
      window.location.href = createPageUrl('Payment') + `?orderId=${newOrder.id}`;

    } catch (error) {
      console.error('Failed to place order:', error);
      showAlert('Eroare', 'A apărut o eroare la plasarea comenzii. Te rugăm să încerci din nou.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Se încarcă coșul...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingCart className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Coșul tău este gol</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Adaugă produse în coș pentru a continua</p>
              <Button onClick={() => window.location.href = createPageUrl('Products')}>
                Explorează Produsele
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Înapoi la Coș
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formular Client */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tip Client */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <UserIcon className="w-5 h-5" />
                  Tip Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.customer_type}
                  onValueChange={(value) => setFormData({ ...formData, customer_type: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="individual" id="individual" />
                    <Label htmlFor="individual" className="text-slate-900 dark:text-slate-100">Persoană Fizică</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="business" id="business" />
                    <Label htmlFor="business" className="text-slate-900 dark:text-slate-100">Persoană Juridică</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Informații Client */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-slate-100">Informații de Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.customer_type === 'business' && (
                  <>
                    <div>
                      <Label htmlFor="company_name" className="text-slate-900 dark:text-slate-100">Nume Companie *</Label>
                      <Input
                        id="company_name"
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        placeholder="SC Exemplu SRL"
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cui" className="text-slate-900 dark:text-slate-100">
                          {isEuCountry ? 'VAT Number (EU) *' : 'CUI *'}
                        </Label>
                        <div className="flex gap-2">
                          <select
                            className="w-20 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                            value={formData.cui_prefix}
                            onChange={(e) => setFormData({ ...formData, cui_prefix: e.target.value })}
                          >
                            <option value="RO">RO</option>
                            {EU_COUNTRIES.map(c => (
                              <option key={c.code} value={c.code}>{c.code}</option>
                            ))}
                          </select>
                          <Input
                            id="cui"
                            className="flex-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                            value={formData.cui_number}
                            onChange={(e) => setFormData({ ...formData, cui_number: e.target.value })}
                            onBlur={handleCuiBlur}
                            placeholder={formData.cui_prefix === 'RO' ? '12345678' : 'VAT Number'}
                          />
                        </div>

                        {/* Rezultat validare ANAF pt RO */}
                        {formData.cui_prefix === 'RO' && anafValidation.isValidating && (
                           <div className="mt-2 text-sm text-slate-500 flex items-center gap-2">
                             <Loader2 className="w-4 h-4 animate-spin" /> Se preiau datele de la ANAF...
                           </div>
                        )}
                        {formData.cui_prefix === 'RO' && anafValidation.isValid === true && (
                           <div className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                             <CheckCircle2 className="w-4 h-4" /> Datele companiei au fost completate automat.
                           </div>
                        )}
                        {formData.cui_prefix === 'RO' && anafValidation.isValid === false && (
                           <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                             <XCircle className="w-4 h-4" /> {anafValidation.error}
                           </div>
                        )}
                        
                        {/* Buton verificare VAT pentru țări UE (nu RO) */}
                        {formData.cui_prefix !== 'RO' && formData.cui_number && (
                          <div className="mt-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={validateVatNumber}
                              disabled={vatValidation.isValidating}
                              className="w-full"
                            >
                              {vatValidation.isValidating ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Se verifică în VIES...
                                </>
                              ) : (
                                'Verifică VAT (VIES)'
                              )}
                            </Button>
                            
                            {/* Rezultat validare - VALID */}
                            {vatValidation.isValid === true && (
                              <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span className="font-medium">VAT Valid!</span>
                                </div>
                                {vatValidation.companyName && vatValidation.companyName !== '---' && (
                                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                    {vatValidation.companyName}
                                  </p>
                                )}
                                {vatValidation.companyAddress && vatValidation.companyAddress !== '---' && (
                                  <p className="text-xs text-green-600 dark:text-green-400">
                                    {vatValidation.companyAddress}
                                  </p>
                                )}
                                {(!vatValidation.companyName || vatValidation.companyName === '---') && (
                                  <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1 italic">
                                    Această țară nu furnizează date de companie prin VIES
                                  </p>
                                )}
                                <Badge className="mt-2 bg-green-600">
                                  Scutire TVA aplicată
                                </Badge>
                              </div>
                            )}
                            
                            {/* Rezultat validare - INVALID */}
                            {vatValidation.isValid === false && (
                              <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                                  <XCircle className="w-4 h-4" />
                                  <span className="font-medium">VAT Invalid</span>
                                </div>
                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                  {vatValidation.error}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Info pentru companii UE */}
                        {formData.cui_prefix !== 'RO' && !vatValidation.isValid && !vatValidation.isValidating && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Verifică VAT-ul pentru scutire TVA intra-comunitar
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="reg_com" className="text-slate-900 dark:text-slate-100">
                          {formData.cui_prefix === 'RO' ? 'Nr. Reg. Com. *' : 'Nr. Înregistrare'}
                        </Label>
                        <Input
                          id="reg_com"
                          value={formData.reg_com}
                          onChange={(e) => setFormData({ ...formData, reg_com: e.target.value })}
                          placeholder={formData.cui_prefix === 'RO' ? 'J40/1234/2020' : 'Optional'}
                          className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                          required={formData.cui_prefix === 'RO'}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="customer_name" className="text-slate-900 dark:text-slate-100">
                    {formData.customer_type === 'business' ? 'Persoană de Contact *' : 'Nume Complet *'}
                  </Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="Ion Popescu"
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer_email" className="text-slate-900 dark:text-slate-100">Email *</Label>
                    <Input
                      id="customer_email"
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                      placeholder="email@example.com"
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_phone" className="text-slate-900 dark:text-slate-100">Telefon *</Label>
                    <Input
                      id="customer_phone"
                      type="tel"
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                      placeholder="+40 712 345 678"
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Adresă Facturare */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <MapPin className="w-5 h-5" />
                  Adresă de Facturare
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="billing_street" className="text-slate-900 dark:text-slate-100">Strada, Număr *</Label>
                  <Input
                    id="billing_street"
                    value={formData.billing_address.street}
                    onChange={(e) => setFormData({
                      ...formData,
                      billing_address: { ...formData.billing_address, street: e.target.value }
                    })}
                    placeholder="Str. Exemplu, nr. 123"
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="billing_city" className="text-slate-900 dark:text-slate-100">Oraș *</Label>
                    <Input
                      id="billing_city"
                      value={formData.billing_address.city}
                      onChange={(e) => setFormData({
                        ...formData,
                        billing_address: { ...formData.billing_address, city: e.target.value }
                      })}
                      placeholder="București"
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="billing_postal" className="text-slate-900 dark:text-slate-100">Cod Poștal *</Label>
                    <Input
                      id="billing_postal"
                      value={formData.billing_address.postal_code}
                      onChange={(e) => setFormData({
                        ...formData,
                        billing_address: { ...formData.billing_address, postal_code: e.target.value }
                      })}
                      placeholder="012345"
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="billing_country" className="text-slate-900 dark:text-slate-100">Țara *</Label>
                    <Input
                      id="billing_country"
                      value={formData.billing_address.country}
                      onChange={(e) => setFormData({
                        ...formData,
                        billing_address: { ...formData.billing_address, country: e.target.value }
                      })}
                      placeholder="România"
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Adresă Livrare */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <MapPin className="w-5 h-5" />
                  Adresă de Livrare
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="use_billing"
                    checked={formData.use_billing_for_delivery}
                    onCheckedChange={(checked) => setFormData({ ...formData, use_billing_for_delivery: checked })}
                  />
                  <Label htmlFor="use_billing" className="cursor-pointer text-slate-900 dark:text-slate-100">
                    Aceeași cu adresa de facturare
                  </Label>
                </div>

                {!formData.use_billing_for_delivery && (
                  <>
                    <div>
                      <Label htmlFor="delivery_street" className="text-slate-900 dark:text-slate-100">Strada, Număr *</Label>
                      <Input
                        id="delivery_street"
                        value={formData.delivery_address.street}
                        onChange={(e) => setFormData({
                          ...formData,
                          delivery_address: { ...formData.delivery_address, street: e.target.value }
                        })}
                        placeholder="Str. Exemplu, nr. 123"
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="delivery_city" className="text-slate-900 dark:text-slate-100">Oraș *</Label>
                        <Input
                          id="delivery_city"
                          value={formData.delivery_address.city}
                          onChange={(e) => setFormData({
                            ...formData,
                            delivery_address: { ...formData.delivery_address, city: e.target.value }
                          })}
                          placeholder="București"
                          className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="delivery_postal" className="text-slate-900 dark:text-slate-100">Cod Poștal *</Label>
                        <Input
                          id="delivery_postal"
                          value={formData.delivery_address.postal_code}
                          onChange={(e) => setFormData({
                            ...formData,
                            delivery_address: { ...formData.delivery_address, postal_code: e.target.value }
                          })}
                          placeholder="012345"
                          className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="delivery_country" className="text-slate-900 dark:text-slate-100">Țara *</Label>
                        <Input
                          id="delivery_country"
                          value={formData.delivery_address.country}
                          onChange={(e) => setFormData({
                            ...formData,
                            delivery_address: { ...formData.delivery_address, country: e.target.value }
                          })}
                          placeholder="România"
                          className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sumar Comandă */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <CreditCard className="w-5 h-5" />
                  Sumar Comandă
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        {item.product_name} × {item.quantity}
                      </span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {(item.price * item.quantity).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator className="bg-slate-200 dark:bg-slate-700" />

                <div className="space-y-2">
                  {isVatExempt ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Subtotal (fără TVA):</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {netTotal.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          TVA (scutit UE):
                        </span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          0,00 €
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Subtotal (fără TVA):</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {netTotal.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">TVA (21%):</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {vatAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                        </span>
                      </div>
                    </>
                  )}

                  {transportInstallationTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Transport & Montaj:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {(isVatExempt ? transportInstallationTotal / 1.21 : transportInstallationTotal).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </div>
                  )}
                </div>

                <Separator className="bg-slate-200 dark:bg-slate-700" />

                <div className="flex justify-between text-lg font-bold">
                  <span className="text-slate-900 dark:text-slate-100">
                    Total {isVatExempt ? '(fără TVA)' : '(cu TVA)'}:
                  </span>
                  <span className="text-green-600 dark:text-green-400">
                    {finalTotal.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>

                {isVatExempt && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-medium">Scutire TVA intra-comunitar aplicată</span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      VAT verificat prin VIES - {formData.cui_prefix}{formData.cui_number}
                    </p>
                  </div>
                )}

                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Se plasează comanda...
                    </>
                  ) : (
                    'Plasează Comanda'
                  )}
                </Button>

                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
                  Prin plasarea comenzii, ești de acord cu termenii și condițiile noastre.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Alert Dialog */}
      <AlertDialog open={alertDialog.isOpen} onOpenChange={(open) => setAlertDialog({ ...alertDialog, isOpen: open })}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-slate-100">{alertDialog.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">{alertDialog.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertDialog({ ...alertDialog, isOpen: false })}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}