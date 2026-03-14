import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Truck, Wrench, MapPin, Phone, Mail, Globe, ExternalLink } from 'lucide-react';
import { InstallationCompany } from '@/entities/InstallationCompany';
import { Button } from '@/components/ui/button';

const countries = [
  { code: 'RO', name: 'România', flag: '🇷🇴' },
  { code: 'DE', name: 'Germania', flag: '🇩🇪' },
  { code: 'FR', name: 'Franța', flag: '🇫🇷' },
  { code: 'IT', name: 'Italia', flag: '🇮🇹' },
  { code: 'ES', name: 'Spania', flag: '🇪🇸' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'HU', name: 'Ungaria', flag: '🇭🇺' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  // Add more countries as needed
];

export default function TransportInstallationSelector({ config, updateConfig, selectedMaterial, selectedProduct, priceDetails }) {
  const [installationCompanies, setInstallationCompanies] = useState([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

  useEffect(() => {
    const fetchInstallationCompanies = async () => {
      if (config.include_installation && config.delivery_country !== 'RO') {
        setIsLoadingCompanies(true);
        try {
          const companies = await InstallationCompany.filter(
            { 
              is_active: true,
              countries_served: { $contains: config.delivery_country }
            },
            'priority_order'
          );
          setInstallationCompanies(companies);
        } catch (error) {
          console.error('Error fetching installation companies:', error);
          setInstallationCompanies([]);
        } finally {
          setIsLoadingCompanies(false);
        }
      }
    };

    fetchInstallationCompanies();
  }, [config.include_installation, config.delivery_country]);

  // Calculate transport and installation prices
  const getTransportPrice = () => {
    if (!selectedMaterial || !selectedProduct || !config.include_transport) return 0;
    
    const productPricing = selectedMaterial.product_specific_pricing?.find(p => p.product_id === selectedProduct.id);
    if (!productPricing) return 0;
    
    const area = (config.width * config.height) / 1000000;
    const pricePerSqm = config.delivery_country === 'RO' 
      ? productPricing.transport_ro_price_per_sqm || 0
      : productPricing.transport_external_price_per_sqm || 0;
    
    return area * pricePerSqm;
  };

  const getInstallationPrice = () => {
    if (!selectedMaterial || !selectedProduct || !config.include_installation || config.delivery_country !== 'RO') return 0;
    
    const productPricing = selectedMaterial.product_specific_pricing?.find(p => p.product_id === selectedProduct.id);
    return productPricing?.hardware_fixed_price || 0;
  };

  const selectedCountry = countries.find(c => c.code === config.delivery_country);

  return (
    <div className="space-y-6">
      {/* Country Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Țara de Livrare
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="text-sm font-medium">Selectează țara unde dorești livrarea</Label>
          <Select value={config.delivery_country} onValueChange={(value) => {
            updateConfig('delivery_country', value);
            // Reset installation if switching from/to RO
            if ((config.delivery_country === 'RO' && value !== 'RO') || 
                (config.delivery_country !== 'RO' && value === 'RO')) {
              updateConfig('include_installation', false);
            }
          }}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Selectează țara" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <span className="flex items-center gap-2">
                    <span>{country.flag}</span>
                    {country.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Transport Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Transport
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="include-transport"
              checked={config.include_transport}
              onCheckedChange={(checked) => updateConfig('include_transport', checked)}
            />
            <div className="flex-1">
              <Label htmlFor="include-transport" className="text-sm font-medium cursor-pointer">
                Inclunde Transport
              </Label>
              {config.include_transport && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">
                      Transport către {selectedCountry?.flag} {selectedCountry?.name}
                    </span>
                    <Badge variant="secondary">
                      {getTransportPrice().toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </Badge>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Calculat pe baza suprafeței totale: {((config.width * config.height) / 1000000).toFixed(2)} m²
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Installation Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Montaj
          </CardTitle>
        </CardHeader>
        <CardContent>
          {config.delivery_country === 'RO' ? (
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="include-installation"
                checked={config.include_installation}
                onCheckedChange={(checked) => updateConfig('include_installation', checked)}
              />
              <div className="flex-1">
                <Label htmlFor="include-installation" className="text-sm font-medium cursor-pointer">
                  Inclunde Montaj Profesional
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  Montaj realizat de echipa noastră de specialiști în România
                </p>
                {config.include_installation && (
                  <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-800">Montaj Profesional</span>
                      <Badge variant="secondary">
                        {getInstallationPrice().toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="include-installation-external"
                  checked={config.include_installation}
                  onCheckedChange={(checked) => updateConfig('include_installation', checked)}
                />
                <div className="flex-1">
                  <Label htmlFor="include-installation-external" className="text-sm font-medium cursor-pointer">
                    Doresc Informații despre Montaj
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Vei primi lista cu companiile partenere din {selectedCountry?.name}
                  </p>
                </div>
              </div>

              {config.include_installation && (
                <div className="mt-4 space-y-4">
                  <h4 className="font-medium text-slate-800">Companii de Montaj Recomandate în {selectedCountry?.name}</h4>
                  
                  {isLoadingCompanies ? (
                    <div className="text-center py-4">
                      <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Se încarcă companiile...</p>
                    </div>
                  ) : installationCompanies.length > 0 ? (
                    <div className="space-y-3">
                      {installationCompanies.map((company) => (
                        <Card key={company.id} className="border border-slate-200">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h5 className="font-semibold text-slate-800">{company.company_name}</h5>
                                <p className="text-sm text-slate-600">{company.contact_person}</p>
                                
                                <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-600">
                                  {company.email && (
                                    <div className="flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      <a href={`mailto:${company.email}`} className="hover:text-blue-600">
                                        {company.email}
                                      </a>
                                    </div>
                                  )}
                                  {company.phone && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      <a href={`tel:${company.phone}`} className="hover:text-blue-600">
                                        {company.phone}
                                      </a>
                                    </div>
                                  )}
                                  {company.website && (
                                    <div className="flex items-center gap-1">
                                      <Globe className="w-3 h-3" />
                                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 flex items-center gap-1">
                                        Website <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </div>
                                  )}
                                </div>

                                {company.services && company.services.length > 0 && (
                                  <div className="mt-2">
                                    <div className="flex flex-wrap gap-1">
                                      {company.services.map((service, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                          {service}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {company.languages_spoken && company.languages_spoken.length > 0 && (
                                  <p className="text-xs text-slate-500 mt-1">
                                    Limbi: {company.languages_spoken.join(', ')}
                                  </p>
                                )}
                              </div>

                              {company.average_cost_per_sqm > 0 && (
                                <div className="text-right">
                                  <Badge variant="secondary">
                                    ~{company.average_cost_per_sqm}€/m²
                                  </Badge>
                                  <p className="text-xs text-slate-500 mt-1">Cost orientativ</p>
                                </div>
                              )}
                            </div>

                            {company.notes && (
                              <p className="text-xs text-slate-600 mt-3 p-2 bg-slate-50 rounded">
                                {company.notes}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-500">
                      <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nu sunt înregistrate companii pentru această țară momentan.</p>
                      <p className="text-xs mt-1">Te rugăm să ne contactezi pentru recomandări personalizate.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}