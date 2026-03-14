import React, { useState, useEffect } from 'react';
import { CompanySettings } from '@/entities/CompanySettings';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Building } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function CompanySettingsManager() {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const allSettings = await CompanySettings.list();
      if (allSettings.length > 0) {
        setSettings(allSettings[0]);
      } else {
        setSettings({
          company_name: '',
          fiscal_code: '',
          trade_register: '',
          vat_number: '',
          address_street: '',
          address_city: '',
          address_county: '',
          address_postal_code: '',
          address_country: 'România',
          phone: '',
          email: '',
          website: '',
          bank_name: '',
          iban: '',
          company_logo_url: ''
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (settings.id) {
        await CompanySettings.update(settings.id, settings);
      } else {
        await CompanySettings.create(settings);
      }
      alert('Setările companiei au fost salvate cu succes!');
      loadSettings();
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Eroare la salvarea setărilor.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building className="w-6 h-6" />
            Date Companie pentru Facturi
          </h1>
          <p className="text-muted-foreground">Configurează datele companiei care vor apărea pe facturi și comenzi.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Salvează Setările
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informații Generale</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_name">Nume Companie *</Label>
              <Input id="company_name" name="company_name" value={settings?.company_name || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="fiscal_code">Cod Fiscal (CUI) *</Label>
              <Input id="fiscal_code" name="fiscal_code" value={settings?.fiscal_code || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="trade_register">Nr. Registrul Comerțului</Label>
              <Input id="trade_register" name="trade_register" value={settings?.trade_register || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="vat_number">Cod TVA</Label>
              <Input id="vat_number" name="vat_number" value={settings?.vat_number || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" name="phone" value={settings?.phone || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={settings?.email || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" value={settings?.website || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="company_logo_url">URL Logo Companie</Label>
              <Input id="company_logo_url" name="company_logo_url" value={settings?.company_logo_url || ''} onChange={handleInputChange} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adresă Sediu</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="address_street">Strada și Număr</Label>
              <Input id="address_street" name="address_street" value={settings?.address_street || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="address_city">Oraș</Label>
              <Input id="address_city" name="address_city" value={settings?.address_city || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="address_county">Județ</Label>
              <Input id="address_county" name="address_county" value={settings?.address_county || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="address_postal_code">Cod Poștal</Label>
              <Input id="address_postal_code" name="address_postal_code" value={settings?.address_postal_code || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="address_country">Țară</Label>
              <Input id="address_country" name="address_country" value={settings?.address_country || ''} onChange={handleInputChange} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Date Bancare</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bank_name">Nume Bancă</Label>
              <Input id="bank_name" name="bank_name" value={settings?.bank_name || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="iban">IBAN</Label>
              <Input id="iban" name="iban" value={settings?.iban || ''} onChange={handleInputChange} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}