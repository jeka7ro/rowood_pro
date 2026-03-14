import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Product } from '@/entities/Product';
import { UploadFile } from '@/integrations/Core';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Edit, Trash2, Loader2, Package, Upload, X, Save, ArrowLeft, Search, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import SlidingConfigurationGraphic from '../components/admin/SlidingConfigurationGraphic';
import MechanismCombinationManager from '../components/admin/MechanismCombinationManager';
import ProductSVGIcon from '../components/common/ProductSVGIcons';

const categoryNames = {
  'ferestre': 'Fereastră',
  'usi': 'Ușă Intrare',
  'usi-balcon': 'Ușă Balcon'
};

// Configurații predefinite pentru culisant
const defaultSlidingConfigurations = [
  {
    name: "Fix + Deschidere",
    sash_count: 2,
    pattern: ["fix", "deschidere"]
  },
  {
    name: "Deschidere + Deschidere",
    sash_count: 2,
    pattern: ["deschidere", "deschidere"]
  },
  {
    name: "Fix + Deschidere + Deschidere + Deschidere + Deschidere + Fix", // Added to make sure there is a 6-sash configuration as well
    sash_count: 6,
    pattern: ["fix", "deschidere", "deschidere", "deschidere", "deschidere", "fix"]
  },
  {
    name: "Fix + Deschidere + Deschidere",
    sash_count: 3,
    pattern: ["fix", "deschidere", "deschidere"]
  },
  {
    name: "Fix + Deschidere + Deschidere + Fix",
    sash_count: 4,
    pattern: ["fix", "deschidere", "deschidere", "fix"]
  }
];

// Helper to create page URLs (mock for now as its source is not specified)
const createPageUrl = (pageName) => {
  switch (pageName) {
    case "AdminDashboard": return "/admin/dashboard";
    case "ProductManager": return "/admin/products";
    default: return "#";
  }
};

// --- New component to hold the reusable form fields ---
function ProductDetailsFormFields({
  formData,
  onFormDataChange,
  onImageUpload,
  onRemoveImage,
  isUploadingImage,
  isUploadingConfigImage,
  showFullWidthDimensions = false, // New prop to control dimension display
  profiles = [] // Lista de profile disponibile
}) {
  const handleChange = (field, value) => {
    onFormDataChange((prev) => ({ ...prev, [field]: value }));
  };

  const handleSlidingConfigChange = (index, field, value) => {
    const newConfigs = [...formData.sliding_configurations];
    const numericValue = value === '' ? null : parseFloat(value);
    newConfigs[index] = { ...newConfigs[index], [field]: numericValue };
    handleChange('sliding_configurations', newConfigs);
  };

  // Effect for populating default sliding configurations
  useEffect(() => {
    if (formData.supports_sliding && formData.sliding_configurations?.length === 0) {
      const newConfigs = defaultSlidingConfigurations.map(config => ({
        ...config,
        min_width: formData.min_width,
        max_width: formData.max_width,
        min_height: formData.min_height,
        max_height: formData.max_height,
      }));
      onFormDataChange(prev => ({
        ...prev,
        sliding_configurations: newConfigs
      }));
    }
  }, [formData.supports_sliding, formData.sliding_configurations?.length, formData.min_width, formData.max_width, formData.min_height, formData.max_height, onFormDataChange]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
          Informații de Bază
        </h3>
        <div>
          <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">Nume Produs</Label>
          <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
        </div>
        <div>
          <Label htmlFor="category" className="text-slate-700 dark:text-slate-300">Categorie</Label>
          <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(categoryNames).map(([key, name]) => (
                <SelectItem key={key} value={key}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="description" className="text-slate-700 dark:text-slate-300">Descriere</Label>
          <Textarea id="description" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
          Specificații Tehnice
        </h3>

        {/* Configurație Canaturi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="sashes" className="text-slate-700 dark:text-slate-300">Nr. Canaturi (implicit)</Label>
            <Input id="sashes" type="number" value={formData.sashes} onChange={(e) => handleChange('sashes', e.target.value)} className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
          </div>
          <div>
            <Label htmlFor="min_sashes" className="text-slate-700 dark:text-slate-300">Minim Canaturi</Label>
            <Input id="min_sashes" type="number" value={formData.min_sashes} onChange={(e) => handleChange('min_sashes', e.target.value)} className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
          </div>
          <div>
            <Label htmlFor="max_sashes" className="text-slate-700 dark:text-slate-300">Maxim Canaturi</Label>
            <Input id="max_sashes" type="number" value={formData.max_sashes} onChange={(e) => handleChange('max_sashes', e.target.value)} className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600">
          <Label htmlFor="allow_custom_sash_count" className="text-slate-700 dark:text-slate-300">Permite clientului să aleagă numărul de canaturi</Label>
          <Switch id="allow_custom_sash_count" checked={formData.allow_custom_sash_count} onCheckedChange={(value) => handleChange('allow_custom_sash_count', value)} />
        </div>

        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600">
          <Label htmlFor="supports_sliding" className="text-slate-700 dark:text-slate-300">Suportă mecanisme culisant</Label>
          <Switch id="supports_sliding" checked={formData.supports_sliding} onCheckedChange={(value) => handleChange('supports_sliding', value)} />
        </div>

        {/* Configurări Preț per Canat - pentru TOATE produsele */}
        <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurații Canaturi și Prețuri
          </h3>

          {/* Checkbox pentru dimensiuni individuale */}
          <div className="mb-6">
            <label className="flex items-center gap-3 p-4 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 bg-white dark:bg-slate-700">
              <input
                type="checkbox"
                checked={formData.allow_individual_sash_dimensions || false}
                onChange={(e) => handleChange('allow_individual_sash_dimensions', e.target.checked)}
                className="accent-blue-600 w-5 h-5"
              />
              <div>
                <span className="font-medium text-slate-800 dark:text-slate-100">Permite Dimensiuni Individuale pe Canat</span>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Permite clientului să seteze lățimi diferite pentru fiecare canat
                </p>
              </div>
            </label>
          </div>

          {/* Prețuri per canat pentru produse STANDARD (non-sliding) */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="fixed_sash_price" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Preț per Canat Fix (€)
              </Label>
              <Input
                id="fixed_sash_price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.fixed_sash_price || ''}
                onChange={(e) => handleChange('fixed_sash_price', parseFloat(e.target.value) || 0)}
                className="mt-1 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cost fix pentru fiecare canat fără deschidere</p>
            </div>

            <div>
              <Label htmlFor="opening_sash_price" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Preț per Canat cu Deschidere (€)
              </Label>
              <Input
                id="opening_sash_price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.opening_sash_price || ''}
                onChange={(e) => handleChange('opening_sash_price', parseFloat(e.target.value) || 0)}
                className="mt-1 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cost fix pentru fiecare canat cu mecanism de deschidere</p>
            </div>
          </div>

          {/* Prețuri per canat pentru produse CULISANTE (sliding) */}
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
            <h4 className="font-medium text-green-800 dark:text-green-300 mb-3">Prețuri Speciale pentru Sisteme Culisante</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="sliding_fixed_sash_price" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Preț per Canat Fix Culisant (€)
                </Label>
                <Input
                  id="sliding_fixed_sash_price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.sliding_fixed_sash_price || ''}
                  onChange={(e) => handleChange('sliding_fixed_sash_price', parseFloat(e.target.value) || 0)}
                  className="mt-1 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <Label htmlFor="sliding_opening_sash_price" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Preț per Canat Culisant cu Deschidere (€)
                </Label>
                <Input
                  id="sliding_opening_sash_price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.sliding_opening_sash_price || ''}
                  onChange={(e) => handleChange('sliding_opening_sash_price', parseFloat(e.target.value) || 0)}
                  className="mt-1 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Limitări dimensiuni individuale per canat */}
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="min_sash_width" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Lățime Minimă per Canat (mm)
              </Label>
              <Input
                id="min_sash_width"
                type="number"
                placeholder="200"
                value={formData.min_sash_width || ''}
                onChange={(e) => handleChange('min_sash_width', parseInt(e.target.value) || 200)}
                className="mt-1 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <Label htmlFor="max_sash_width" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Lățime Maximă per Canat (mm)
              </Label>
              <Input
                id="max_sash_width"
                type="number"
                placeholder="3000"
                value={formData.max_sash_width || ''}
                onChange={(e) => handleChange('max_sash_width', parseInt(e.target.value) || 3000)}
                className="mt-1 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

        </div>


        {/* Configurații Culisant */}
        {formData.supports_sliding && (
          <Card className="mt-4 bg-blue-50/50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800 dark:text-blue-300">Configurații Culisant Predefined</CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-400">
                Acestea sunt configurațiile disponibile. Setează limitele de dimensiuni pentru fiecare.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.sliding_configurations.map((config, index) => (
                <div key={index} className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-800 dark:text-slate-100">{config.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{config.sash_count} canaturi</p>
                    </div>
                  </div>
                  <SlidingConfigurationGraphic pattern={config.pattern} />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-blue-100 dark:border-blue-800">
                    <div>
                      <Label htmlFor={`sc-min-width-${index}`} className="text-xs text-slate-700 dark:text-slate-300">Lățime Min (mm)</Label>
                      <Input id={`sc-min-width-${index}`} type="number" value={config.min_width || ''} onChange={(e) => handleSlidingConfigChange(index, 'min_width', e.target.value)} className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
                    </div>
                    <div>
                      <Label htmlFor={`sc-max-width-${index}`} className="text-xs text-slate-700 dark:text-slate-300">Lățime Max (mm)</Label>
                      <Input id={`sc-max-width-${index}`} type="number" value={config.max_width || ''} onChange={(e) => handleSlidingConfigChange(index, 'max_width', e.target.value)} className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
                    </div>
                    <div>
                      <Label htmlFor={`sc-min-height-${index}`} className="text-xs text-slate-700 dark:text-slate-300">Înălțime Min (mm)</Label>
                      <Input id={`sc-min-height-${index}`} type="number" value={config.min_height || ''} onChange={(e) => handleSlidingConfigChange(index, 'min_height', e.target.value)} className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
                    </div>
                    <div>
                      <Label htmlFor={`sc-max-height-${index}`} className="text-xs text-slate-700 dark:text-slate-300">Înălțime Max (mm)</Label>
                      <Input id={`sc-max-height-${index}`} type="number" value={config.max_height || ''} onChange={(e) => handleSlidingConfigChange(index, 'max_height', e.target.value)} className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Dimensiuni - DOAR pentru produse NON-culisante */}
        {showFullWidthDimensions && !formData.supports_sliding && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_width" className="text-slate-700 dark:text-slate-300">Lățime Min (mm)</Label>
              <Input id="min_width" type="number" value={formData.min_width} onChange={(e) => handleChange('min_width', e.target.value)} className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <Label htmlFor="max_width" className="text-slate-700 dark:text-slate-300">Lățime Max (mm)</Label>
              <Input id="max_width" type="number" value={formData.max_width} onChange={(e) => handleChange('max_width', e.target.value)} className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <Label htmlFor="min_height" className="text-slate-700 dark:text-slate-300">Înălțime Min (mm)</Label>
              <Input id="min_height" type="number" value={formData.min_height} onChange={(e) => handleChange('min_height', e.target.value)} className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <Label htmlFor="max_height" className="text-slate-700 dark:text-slate-300">Înălțime Max (mm)</Label>
              <Input id="max_height" type="number" value={formData.max_height} onChange={(e) => handleChange('max_height', e.target.value)} className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
            </div>
          </div>
        )}

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Notă:</strong>
            {formData.supports_sliding
              ? ' Pentru produse culisante, dimensiunile se setează individual pentru fiecare configurație de mai sus. '
              : ' Dimensiunile sunt aplicate pentru toate configurațiile acestui produs. '
            }
            Mecanismele (tipurile de deschidere) și prețurile asociate se configurează acum în secțiunea <strong>Management Materiale</strong>.
          </p>
        </div>
      </div>

      {/* Catalog Images Section */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <div className="w-2 h-2 bg-red-600 rounded-full"></div>
          Imagini Produs
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">Imaginile care vor fi afișate în catalogul de produse</p>
        <div className="flex flex-wrap gap-2">
          {(formData.image_urls || []).map((url, index) => (
            <div key={index} className="relative">
              <img src={url} alt={`Catalog ${index + 1}`} className="w-20 h-20 object-cover rounded-lg border" />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full shadow-lg"
                onClick={() => onRemoveImage(index, 'catalog')}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
        <div className="relative">
          <input
            type="file"
            id="catalogImageUpload"
            accept="image/*"
            onChange={(e) => onImageUpload(e, 'catalog')}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploadingImage}
          />
          <Button type="button" variant="outline" disabled={isUploadingImage} className="w-full border-dashed py-6 hover:bg-green-50">
            {isUploadingImage ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Se încarcă...</>
            ) : (
              <><Upload className="w-4 h-4 mr-2" /> Adaugă Imagine</>
            )}
          </Button>
        </div>
      </div>

      {/* Configurator Images Section */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
          Imagini Configurator
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">Imaginile care vor fi afișate doar în configurator</p>
        <div className="flex flex-wrap gap-2">
          {(formData.configurator_image_urls || []).map((url, index) => (
            <div key={index} className="relative">
              <img src={url} alt={`Configurator ${index + 1}`} className="w-20 h-20 object-cover rounded-lg border" />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full shadow-lg"
                onClick={() => onRemoveImage(index, 'configurator')}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
        <div className="relative">
          <input
            type="file"
            id="configuratorImageUpload"
            accept="image/*"
            onChange={(e) => onImageUpload(e, 'configurator')}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploadingConfigImage}
          />
          <Button type="button" variant="outline" disabled={isUploadingConfigImage} className="w-full border-dashed py-6 hover:bg-blue-50">
            {isUploadingConfigImage ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Se încarcă...</>
            ) : (
              <><Upload className="w-4 h-4 mr-2" /> Adaugă Imagine Configurator</>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
          Setări & Vizibilitate
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600">
            <Label htmlFor="is_active" className="text-slate-700 dark:text-slate-300">Activ</Label>
            <Switch id="is_active" checked={formData.is_active} onCheckedChange={(value) => handleChange('is_active', value)} />
          </div>
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600">
            <Label htmlFor="is_featured" className="text-slate-700 dark:text-slate-300">Recomandat</Label>
            <Switch id="is_featured" checked={formData.is_featured} onCheckedChange={(value) => handleChange('is_featured', value)} />
          </div>
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600">
            <Label htmlFor="is_on_promotion" className="text-slate-700 dark:text-slate-300">În Promoție</Label>
            <Switch id="is_on_promotion" checked={formData.is_on_promotion} onCheckedChange={(value) => handleChange('is_on_promotion', value)} />
          </div>
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600">
            <Label htmlFor="show_on_homepage" className="text-slate-700 dark:text-slate-300">Prima Pagină</Label>
            <Switch id="show_on_homepage" checked={formData.show_on_homepage} onCheckedChange={(value) => handleChange('show_on_homepage', value)} />
          </div>
        </div>
      </div>
    </div>
  );
}


// --- ProductForm (now only for creating new products in a modal) ---
function ProductForm({ onSave, onCancel, isOpen }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'ferestre',
    min_width: 500,
    max_width: 2000,
    min_height: 500,
    max_height: 2500,
    sashes: 1,
    min_sashes: 1,
    max_sashes: 1,
    allow_custom_sash_count: false,
    supports_sliding: false,
    allow_individual_sash_dimensions: false, // Now global
    min_sash_width: 200,
    max_sash_width: 3000,
    fixed_sash_price: 0, // New field for standard products
    opening_sash_price: 0, // New field for standard products
    sliding_fixed_sash_price: 0,
    sliding_opening_sash_price: 0,
    sliding_configurations: [],
    allowed_mechanism_combinations: [], // Initialize for new products
    description: '',
    image_urls: [],
    configurator_image_urls: [],
    is_active: true,
    is_featured: false,
    is_on_promotion: false,
    show_on_homepage: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingConfigImage, setIsUploadingConfigImage] = useState(false);

  const handleFormDataChange = (updater) => {
    // If updater is a function, call it with the previous state
    if (typeof updater === 'function') {
      setFormData(updater);
    } else {
      // Otherwise, assume it's an object to merge
      setFormData((prev) => ({ ...prev, ...updater }));
    }
  };

  const handleImageUpload = async (event, imageType = 'catalog') => {
    const file = event.target.files[0];
    if (!file) return;

    if (imageType === 'catalog') {
      setIsUploadingImage(true);
    } else {
      setIsUploadingConfigImage(true);
    }

    try {
      const result = await UploadFile({ file });
      const fieldName = imageType === 'catalog' ? 'image_urls' : 'configurator_image_urls';
      const currentUrls = formData[fieldName] || [];
      setFormData(prev => ({
        ...prev,
        [fieldName]: [...currentUrls, result.file_url]
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Eroare la încărcarea imaginii. Încercați din nou.');
    } finally {
      if (imageType === 'catalog') {
        setIsUploadingImage(false);
      } else {
        setIsUploadingConfigImage(false);
      }
    }
  };

  const removeImage = (index, imageType = 'catalog') => {
    const fieldName = imageType === 'catalog' ? 'image_urls' : 'configurator_image_urls';
    const newUrls = (formData[fieldName] || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [fieldName]: newUrls }));
  };

  const parseNumericFields = (data) => {
    const dataToProcess = { ...data };
    for (const field of ['min_width', 'max_width', 'min_height', 'max_height', 'sashes', 'min_sashes', 'max_sashes', 'fixed_sash_price', 'opening_sash_price', 'sliding_fixed_sash_price', 'sliding_opening_sash_price', 'min_sash_width', 'max_sash_width']) {
      dataToProcess[field] = parseFloat(dataToProcess[field]);
    }
    if (dataToProcess.sliding_configurations) {
      dataToProcess.sliding_configurations = dataToProcess.sliding_configurations.map(config => ({
        ...config,
        min_width: config.min_width ? parseFloat(config.min_width) : null,
        max_width: config.max_width ? parseFloat(config.max_width) : null,
        min_height: config.min_height ? parseFloat(config.min_height) : null,
        max_height: config.max_height ? parseFloat(config.max_height) : null,
      }));
    }
    return dataToProcess;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const dataToSave = parseNumericFields(formData);
    await onSave(dataToSave);
    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onCancel}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-4xl bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    Produs Nou
                  </h2>
                  <p className="text-green-100 text-sm">
                    Configurează detaliile noului produs (prețurile se definesc în materiale)
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCancel}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSave} className="p-6 space-y-6">
                <ProductDetailsFormFields
                  formData={formData}
                  onFormDataChange={handleFormDataChange}
                  onImageUpload={handleImageUpload}
                  onRemoveImage={removeImage}
                  isUploadingImage={isUploadingImage}
                  isUploadingConfigImage={isUploadingConfigImage}
                  showFullWidthDimensions={true} // For new products, show full width dimensions
                />
              </form>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-6 flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Anulează
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading || isUploadingImage || isUploadingConfigImage}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Creează Produs
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


// --- ProductManager (main component) ---
export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewProductFormOpen, setIsNewProductFormOpen] = useState(false); // For adding new products (modal)
  const [editingProductId, setEditingProductId] = useState(null); // For editing existing products (page view)
  const [productToDelete, setProductToDelete] = useState(null);

  // For the new editing view
  const editingProduct = products.find(p => p.id === editingProductId);
  const [editFormData, setEditFormData] = useState(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingConfigImage, setIsUploadingConfigImage] = useState(false);

  // Mock materials for MechanismCombinationManager, as fetching logic is not provided
  // In a real app, this would be fetched from the backend.
  const materials = [
    { id: 'mat1', name: 'Aluminiu', mechanisms: [{ id: 'mech1', name: 'Simplă' }, { id: 'mech2', name: 'Dublă' }] },
    { id: 'mat2', name: 'PVC', mechanisms: [{ id: 'mech3', name: 'Batantă' }, { id: 'mech4', name: 'Pivotantă' }] },
    { id: 'mat3', name: 'Lemn', mechanisms: [{ id: 'mech5', name: 'Oscilobatantă' }] },
  ];

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const [allProducts, allProfiles] = await Promise.all([
        Product.list('-created_date', 200),
        base44.entities.Profile.list('priority_order', 100)
      ]);
      setProducts(allProducts);
      setProfiles(allProfiles || []);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (editingProduct) {
      // Initialize edit form data when an existing product is selected for editing
      const initialData = {
        name: editingProduct.name || '',
        category: editingProduct.category || 'ferestre',
        min_width: editingProduct.min_width || 500,
        max_width: editingProduct.max_width || 2000,
        min_height: editingProduct.min_height || 500,
        max_height: editingProduct.max_height || 2500,
        sashes: editingProduct.sashes || 1,
        min_sashes: editingProduct.min_sashes || 1,
        max_sashes: editingProduct.max_sashes || 1,
        allow_custom_sash_count: typeof editingProduct.allow_custom_sash_count === 'boolean' ? editingProduct.allow_custom_sash_count : false,
        supports_sliding: typeof editingProduct.supports_sliding === 'boolean' ? editingProduct.supports_sliding : false,
        allow_individual_sash_dimensions: typeof editingProduct.allow_individual_sash_dimensions === 'boolean' ? editingProduct.allow_individual_sash_dimensions : false,
        min_sash_width: editingProduct.min_sash_width ?? 200,
        max_sash_width: editingProduct.max_sash_width ?? 3000,
        fixed_sash_price: editingProduct.fixed_sash_price ?? 0,
        opening_sash_price: editingProduct.opening_sash_price ?? 0,
        sliding_fixed_sash_price: editingProduct.sliding_fixed_sash_price ?? 0,
        sliding_opening_sash_price: editingProduct.sliding_opening_sash_price ?? 0,
        sliding_configurations: editingProduct.sliding_configurations?.map(config => ({
          ...config,
          min_width: config.min_width ?? editingProduct.min_width,
          max_width: config.max_width ?? editingProduct.max_width,
          min_height: config.min_height ?? editingProduct.min_height,
          max_height: config.max_height ?? editingProduct.max_height,
        })) || [],
        allowed_mechanism_combinations: Array.isArray(editingProduct.allowed_mechanism_combinations) ? editingProduct.allowed_mechanism_combinations : [],
        description: editingProduct.description || '',
        image_urls: editingProduct.image_urls || [],
        configurator_image_urls: editingProduct.configurator_image_urls || [],
        is_active: typeof editingProduct.is_active === 'boolean' ? editingProduct.is_active : true,
        is_featured: typeof editingProduct.is_featured === 'boolean' ? editingProduct.is_featured : false,
        is_on_promotion: typeof editingProduct.is_on_promotion === 'boolean' ? editingProduct.is_on_promotion : false,
        show_on_homepage: typeof editingProduct.show_on_homepage === 'boolean' ? editingProduct.show_on_homepage : false,
        compatible_profiles: editingProduct.compatible_profiles || [],
      };
      
      console.log('[ProductManager] Inițializare editFormData pentru:', editingProduct.name, 'cu mecanisme:', initialData.allowed_mechanism_combinations);
      setEditFormData(initialData);
    } else {
      setEditFormData(null);
    }
  }, [editingProduct]);

  // Handler for saving new product from modal
  const handleSaveNewProduct = async (formData) => {
    await Product.create(formData);
    await fetchProducts();
    closeNewProductForm();
  };

  // Handler for saving edited product from the page view
  const handleSaveEditedProduct = async () => {
    if (!editingProduct || !editFormData) return;
    setIsEditLoading(true);

    const dataToSave = { ...editFormData };
    
    // DEBUG: Verifică ce mecanisme se salvează
    console.log('[ProductManager] Salvare produs - allowed_mechanism_combinations:', dataToSave.allowed_mechanism_combinations);
    console.log('[ProductManager] Salvare produs - editFormData complet:', editFormData);

    // Parse numeric fields
    for (const field of ['min_width', 'max_width', 'min_height', 'max_height', 'sashes', 'min_sashes', 'max_sashes', 'fixed_sash_price', 'opening_sash_price', 'sliding_fixed_sash_price', 'sliding_opening_sash_price', 'min_sash_width', 'max_sash_width']) {
      dataToSave[field] = parseFloat(dataToSave[field]);
    }

    // Parse numeric fields inside sliding_configurations
    if (dataToSave.sliding_configurations) {
      dataToSave.sliding_configurations = dataToSave.sliding_configurations.map(config => ({
        ...config,
        min_width: config.min_width ? parseFloat(config.min_width) : null,
        max_width: config.max_width ? parseFloat(config.max_width) : null,
        min_height: config.min_height ? parseFloat(config.min_height) : null,
        max_height: config.max_height ? parseFloat(config.max_height) : null,
      }));
    }

    try {
      console.log('[ProductManager] Trimit la backend:', dataToSave);
      await Product.update(editingProduct.id, dataToSave);
      await fetchProducts(); // Refresh products to show updated data
      alert("Produs actualizat cu succes!");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Eroare la salvare: " + error.message);
    } finally {
      setIsEditLoading(false);
    }
  };

  const openEditProductPage = (product) => {
    setEditingProductId(product.id);
  };

  const closeEditProductPage = () => {
    setEditingProductId(null);
  };

  const openNewProductForm = () => {
    setIsNewProductFormOpen(true);
  };

  const closeNewProductForm = () => {
    setIsNewProductFormOpen(false);
  };

  const handleDelete = async () => {
    if (productToDelete) {
      await Product.delete(productToDelete.id);
      await fetchProducts();
      setProductToDelete(null);
    }
  };

  const handleImageUploadForEdit = async (event, imageType = 'catalog') => {
    const file = event.target.files[0];
    if (!file) return;

    if (imageType === 'catalog') {
      setIsUploadingImage(true);
    } else {
      setIsUploadingConfigImage(true);
    }

    try {
      const result = await UploadFile({ file });
      const fieldName = imageType === 'catalog' ? 'image_urls' : 'configurator_image_urls';
      const currentUrls = editFormData[fieldName] || [];
      setEditFormData(prev => ({
        ...prev,
        [fieldName]: [...currentUrls, result.file_url]
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Eroare la încărcarea imaginii. Încercați din nou.');
    } finally {
      if (imageType === 'catalog') {
        setIsUploadingImage(false);
      } else {
        setIsUploadingConfigImage(false);
      }
    }
  };

  const removeImageForEdit = (index, imageType = 'catalog') => {
    const fieldName = imageType === 'catalog' ? 'image_urls' : 'configurator_image_urls';
    const newUrls = (editFormData[fieldName] || []).filter((_, i) => i !== index);
    setEditFormData(prev => ({ ...prev, [fieldName]: newUrls }));
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    categoryNames[p.category].toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render dedicated edit page if editingProductId is set
  if (editingProduct && editFormData) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={closeEditProductPage}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Înapoi la Listă
              </Button>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Editare: {editingProduct.name}</h1>
            </div>
            <Button
              onClick={handleSaveEditedProduct}
              disabled={isEditLoading || isUploadingImage || isUploadingConfigImage}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              {isEditLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Salvează Modificările
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6"> {/* Changed to xl:grid-cols-2 as MechanismCombinationManager moves */}
          <div className="xl:col-span-2 space-y-6"> {/* This column now spans the full width if we remove the other column */}
            {/* Product Details Form Fields */}
            <ProductDetailsFormFields
              formData={editFormData}
              onFormDataChange={setEditFormData}
              onImageUpload={handleImageUploadForEdit}
              onRemoveImage={removeImageForEdit}
              isUploadingImage={isUploadingImage}
              isUploadingConfigImage={isUploadingConfigImage}
              showFullWidthDimensions={true} // Show dimensions when editing (for non-sliding products)
              profiles={profiles}
            />

            {/* NOUA SECȚIUNE - Gestionare Mecanisme */}
            {editingProduct && !editingProduct.supports_sliding && editFormData && (
              <MechanismCombinationManager
                  key={editingProduct.id}
                  product={{
                    ...editingProduct,
                    allowed_mechanism_combinations: editFormData.allowed_mechanism_combinations || []
                  }}
                  materials={materials}
                  onSave={(allowedCombinations) => {
                      console.log('[ProductManager] onSave apelat cu:', allowedCombinations);
                      setEditFormData(prev => ({
                          ...prev,
                          allowed_mechanism_combinations: allowedCombinations
                      }));
                  }}
                  autoSave={false}
              />
            )}
          </div>
          {/* The xl:col-span-1 for MechanismCombinationManager is removed as per the new structure */}
        </div>
      </div>
    );
  }

  // Render the list view if not editing a product
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            Management Produse
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Gestionează produsele de bază pentru configurator</p>
        </div>
        <Button onClick={openNewProductForm} className="bg-green-600 hover:bg-green-700 shadow-lg">
          <PlusCircle className="w-4 h-4 mr-2" /> Adaugă Produs
        </Button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          placeholder="Caută după nume sau categorie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 text-base py-3"
        />
      </div>

      {/* ProductForm modal for creating new products */}
      <ProductForm
        onSave={handleSaveNewProduct}
        onCancel={closeNewProductForm}
        isOpen={isNewProductFormOpen}
      />

      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ești sigur?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune nu poate fi anulată. Produsul "{productToDelete?.name}" va fi șters definitiv.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Șterge</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Produs</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Categorie</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Dimensiuni</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center p-12"><Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" /></TableCell></TableRow>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-slate-200 dark:border-slate-700">
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-lg border border-slate-200 dark:border-slate-600 p-1">
                        <ProductSVGIcon product={product} className="w-full h-full" />
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{categoryNames[product.category]}</TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      <div>{product.min_width}-{product.max_width}mm (L)</div>
                      <div className="text-slate-500 dark:text-slate-400">{product.min_height}-{product.max_height}mm (H)</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.is_active ? 'default' : 'destructive'} className={product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {product.is_active ? 'Activ' : 'Inactiv'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditProductPage(product)} className="hover:bg-green-50 hover:text-green-700">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="hover:bg-red-50 hover:text-red-700" onClick={() => setProductToDelete(product)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={5} className="text-center p-12 text-slate-500 dark:text-slate-400">Nu s-au găsit produse.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}