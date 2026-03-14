import React, { useState, useEffect, useCallback } from 'react';
import { HomePageContent } from '@/entities/HomePageContent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const languages = [
  { code: 'ro', name: 'Română' },
  { code: 'en', name: 'Engleză' },
  { code: 'de', name: 'Germană' },
  { code: 'fr', name: 'Franceză' },
];

export default function ContentManager() {
  const [content, setContent] = useState(null);
  const [selectedLang, setSelectedLang] = useState('ro');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadContent = useCallback(async (lang) => {
    setIsLoading(true);
    try {
      const results = await HomePageContent.filter({ language_code: lang });
      if (results.length > 0) {
        setContent(results[0]);
      } else {
        // Create a new empty content object if none exists
        setContent({ language_code: lang });
      }
    } catch (error) {
      console.error('Failed to load content:', error);
      alert('Eroare la încărcarea conținutului.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent(selectedLang);
  }, [selectedLang, loadContent]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContent(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (content.id) {
        // Update existing content
        const { id, ...dataToUpdate } = content;
        await HomePageContent.update(id, dataToUpdate);
      } else {
        // Create new content
        await HomePageContent.create(content);
      }
      alert('Conținutul a fost salvat cu succes!');
      loadContent(selectedLang); // Reload to get the ID if it was a new entry
    } catch (error) {
      console.error('Failed to save content:', error);
      alert('Eroare la salvarea conținutului.');
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
          <h1 className="text-2xl font-bold">Management Conținut Site</h1>
          <p className="text-muted-foreground">Editează textele și imaginile de pe paginile publice.</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedLang} onValueChange={setSelectedLang}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selectează limba" />
            </SelectTrigger>
            <SelectContent>
              {languages.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvează Modificările
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Pagina Principală (Hero Section)</CardTitle>
          <CardDescription>Titlurile și imaginea din secțiunea principală a paginii de start.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="heroTitle">Titlu Principal</Label>
            <Input id="heroTitle" name="heroTitle" value={content?.heroTitle || ''} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heroSubtitle">Subtitlu</Label>
            <Input id="heroSubtitle" name="heroSubtitle" value={content?.heroSubtitle || ''} onChange={handleInputChange} />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="heroImage">URL Imagine Principală</Label>
            <Input id="heroImage" name="heroImage" value={content?.heroImage || ''} onChange={handleInputChange} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informații Sumar Comandă</CardTitle>
          <CardDescription>Textele afișate în sumarul comenzii și pe pagina de configurare.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderInfoTitle">Titlu Secțiune (ex: Informații importante)</Label>
              <Input id="orderInfoTitle" name="orderInfoTitle" value={content?.orderInfoTitle || ''} onChange={handleInputChange} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderInfoPoint1">Punct 1</Label>
                <Input id="orderInfoPoint1" name="orderInfoPoint1" value={content?.orderInfoPoint1 || ''} onChange={handleInputChange} placeholder="• Prețurile includ TVA" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderInfoPoint2">Punct 2</Label>
                <Input id="orderInfoPoint2" name="orderInfoPoint2" value={content?.orderInfoPoint2 || ''} onChange={handleInputChange} placeholder="• Transport și montaj se calculează separat" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderInfoPoint3">Punct 3</Label>
                <Input id="orderInfoPoint3" name="orderInfoPoint3" value={content?.orderInfoPoint3 || ''} onChange={handleInputChange} placeholder="• Veți fi contactat pentru programarea livrării" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderInfoPoint4">Punct 4</Label>
                <Input id="orderInfoPoint4" name="orderInfoPoint4" value={content?.orderInfoPoint4 || ''} onChange={handleInputChange} placeholder="• Termenul de livrare: 3-4 săptămâni" />
              </div>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Date de Contact & Footer</CardTitle>
          <CardDescription>Informațiile de contact afișate în subsolul site-ului.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email</Label>
            <Input id="contactEmail" name="contactEmail" value={content?.contactEmail || ''} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Telefon</Label>
            <Input id="contactPhone" name="contactPhone" value={content?.contactPhone || ''} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactAddress">Adresă</Label>
            <Input id="contactAddress" name="contactAddress" value={content?.contactAddress || ''} onChange={handleInputChange} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="contactCity">Oraș</Label>
            <Input id="contactCity" name="contactCity" value={content?.contactCity || ''} onChange={handleInputChange} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="contactCountry">Țară</Label>
            <Input id="contactCountry" name="contactCountry" value={content?.contactCountry || ''} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workingHours">Program de lucru</Label>
            <Input id="workingHours" name="workingHours" value={content?.workingHours || ''} onChange={handleInputChange} />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="companyDescription">Descriere companie (footer)</Label>
            <Input id="companyDescription" name="companyDescription" value={content?.companyDescription || ''} onChange={handleInputChange} />
          </div>
        </CardContent>
      </Card>

    </div>
  );
}