import React, { useState, useEffect, useCallback } from 'react';
import { Material } from '@/entities/Material';
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
import { PlusCircle, Edit, Trash2, Loader2, Layers, Upload, X, Save, ArrowLeft, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '../components/translations/TranslationProvider';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const openingTypeOptions = [
  { id: 'fix', label: 'Fix' },
  { id: 'batant', label: 'Batant' },
  { id: 'oscilo-batant', label: 'Oscilo-Batant' },
  { id: 'culisant', label: 'Culisant' }
];

const defaultDimensionRanges = [
  { min_size: 350, max_size: 500, price_per_piece: 0 },
  { min_size: 500, max_size: 700, price_per_piece: 0 },
  { min_size: 700, max_size: 1000, price_per_piece: 0 },
  { min_size: 1000, max_size: 1200, price_per_piece: 0 },
  { min_size: 1200, max_size: 1400, price_per_piece: 0 },
  { min_size: 1400, max_size: 1800, price_per_piece: 0 },
  { min_size: 1800, max_size: 2200, price_per_piece: 0 },
  { min_size: 2200, max_size: 2600, price_per_piece: 0 },
];

const defaultPricingByType = {
  'oscilo-batant': [25.00, 35.00, 45.00, 55.00, 65.00, 75.00, 85.00, 95.00],
  'batant': [20.00, 30.00, 40.00, 50.00, 60.00, 70.00, 80.00, 90.00],
  'fix': [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],
  'culisant': [30.00, 40.00, 50.00, 60.00, 70.00, 80.00, 90.00, 100.00]
};

function MaterialForm({ material, onSave, onCancel, isOpen }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(
    material || {
      name: '',
      description: '',
      image_url: '',
      opening_types: [],
      opening_type_pricing: [],
      price_multiplier: 1.0,
      is_active: true,
      allows_color_selection: true,
    }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    let initialFormData;
    if (material) {
      initialFormData = {
        name: material.name || '',
        description: material.description || '',
        image_url: material.image_url || '',
        opening_types: material.opening_types || [],
        opening_type_pricing: material.opening_type_pricing || [],
        price_multiplier: material.price_multiplier || 1.0,
        allows_color_selection: typeof material.allows_color_selection === 'boolean' ? material.allows_color_selection : true,
        is_active: typeof material.is_active === 'boolean' ? material.is_active : true,
      };
    } else {
      initialFormData = {
        name: '',
        description: '',
        image_url: '',
        opening_types: [],
        opening_type_pricing: [],
        price_multiplier: 1.0,
        is_active: true,
        allows_color_selection: true,
      };
    }

    const syncedPricing = (initialFormData.opening_type_pricing || []).filter(p => initialFormData.opening_types.includes(p.type));
    
    initialFormData.opening_types.forEach(type => {
      if (!syncedPricing.some(p => p.type === type)) {
        const defaultPrices = defaultPricingByType[type] || defaultPricingByType['fix'];
        const dimensionRanges = defaultDimensionRanges.map((range, index) => ({
          ...range,
          price_per_piece: defaultPrices[index] || 0
        }));
        
        syncedPricing.push({ 
          type: type, 
          dimension_ranges: dimensionRanges
        });
      } else {
          const existingEntry = syncedPricing.find(p => p.type === type);
          if (!existingEntry.dimension_ranges || existingEntry.dimension_ranges.length === 0) {
              const defaultPrices = defaultPricingByType[type] || defaultPricingByType['fix'];
              existingEntry.dimension_ranges = defaultDimensionRanges.map((range, index) => ({
                  ...range,
                  price_per_piece: defaultPrices[index] || 0
              }));
          }
          if (existingEntry.hasOwnProperty('price_adjustment')) delete existingEntry.price_adjustment;
          if (existingEntry.hasOwnProperty('price_multiplier')) delete existingEntry.price_multiplier;
      }
    });
    initialFormData.opening_type_pricing = syncedPricing;

    setFormData(initialFormData);
  }, [material]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleOpeningTypeChange = (type, isChecked) => {
    setFormData((prev) => {
      const currentTypes = prev.opening_types || [];
      const newTypes = isChecked
        ? [...currentTypes, type]
        : currentTypes.filter(t => t !== type);
      
      const newState = { ...prev, opening_types: newTypes };

      const existingPricing = Array.isArray(prev.opening_type_pricing) ? prev.opening_type_pricing : [];
      const syncedPricing = existingPricing.filter(p => newTypes.includes(p.type));
      
      newTypes.forEach(t => {
          if (!syncedPricing.some(p => p.type === t)) {
              const defaultPrices = defaultPricingByType[t] || defaultPricingByType['fix'];
              const dimensionRanges = defaultDimensionRanges.map((range, index) => ({
                  ...range,
                  price_per_piece: defaultPrices[index] || 0
              }));
              
              syncedPricing.push({ 
                  type: t, 
                  dimension_ranges: dimensionRanges
              });
          }
      });
      
      newState.opening_type_pricing = syncedPricing;
      
      return newState;
    });
  };

  const handleDimensionRangeChange = (mechanismType, rangeIndex, field, value) => {
    setFormData(prev => {
      const existingPricing = Array.isArray(prev.opening_type_pricing) ? [...prev.opening_type_pricing] : [];
      const mechanismIndex = existingPricing.findIndex(p => p.type === mechanismType);
      
      if (mechanismIndex > -1) {
        const updatedMechanism = { ...existingPricing[mechanismIndex] };
        const updatedRanges = [...(updatedMechanism.dimension_ranges || [])];
        
        if (updatedRanges[rangeIndex]) {
          updatedRanges[rangeIndex] = {
            ...updatedRanges[rangeIndex],
            [field]: field === 'price_per_piece' ? (parseFloat(value) || 0) : (parseInt(value) || 0)
          };
        }
        
        updatedMechanism.dimension_ranges = updatedRanges;
        existingPricing[mechanismIndex] = updatedMechanism;
      }
      
      return { ...prev, opening_type_pricing: existingPricing };
    });
  };

  const addDimensionRange = (mechanismType) => {
    setFormData(prev => {
      const existingPricing = [...(prev.opening_type_pricing || [])];
      const mechanismIndex = existingPricing.findIndex(p => p.type === mechanismType);
      
      if (mechanismIndex > -1) {
        const updatedMechanism = { ...existingPricing[mechanismIndex] };
        const existingRanges = updatedMechanism.dimension_ranges || [];
        
        const lastRange = existingRanges.length > 0 ? existingRanges[existingRanges.length - 1] : null;
        const newRange = {
          min_size: lastRange ? lastRange.max_size : 350,
          max_size: lastRange ? lastRange.max_size + 200 : 550,
          price_per_piece: 0
        };
        
        updatedMechanism.dimension_ranges = [...existingRanges, newRange];
        existingPricing[mechanismIndex] = updatedMechanism;
      }
      
      return { ...prev, opening_type_pricing: existingPricing };
    });
  };

  const removeDimensionRange = (mechanismType, rangeIndex) => {
    setFormData(prev => {
      const existingPricing = [...(prev.opening_type_pricing || [])];
      const mechanismIndex = existingPricing.findIndex(p => p.type === mechanismType);
      
      if (mechanismIndex > -1) {
        const updatedMechanism = { ...existingPricing[mechanismIndex] };
        const updatedRanges = [...(updatedMechanism.dimension_ranges || [])];
        updatedRanges.splice(rangeIndex, 1);
        
        updatedMechanism.dimension_ranges = updatedRanges;
        existingPricing[mechanismIndex] = updatedMechanism;
      }
      
      return { ...prev, opening_type_pricing: existingPricing };
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const result = await UploadFile({ file });
      setFormData(prev => ({ ...prev, image_url: result.file_url }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Eroare la încărcarea imaginii');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const clearImage = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const dataToSave = { 
          ...formData,
          price_multiplier: parseFloat(formData.price_multiplier),
          opening_type_pricing: formData.opening_type_pricing.map(item => ({
              ...item,
              dimension_ranges: item.dimension_ranges?.map(range => ({
                  ...range,
                  min_size: parseInt(range.min_size) || 0,
                  max_size: parseInt(range.max_size) || 0,
                  price_per_piece: parseFloat(range.price_per_piece) || 0
              })) || []
          }))
      };
      await onSave(dataToSave);
    } catch (error) {
      console.error('Error saving material:', error);
    }
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
            className="fixed right-0 top-0 h-full w-full max-w-6xl bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col"
          >
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {material ? 'Editează Material' : 'Material Nou'}
                  </h2>
                  <p className="text-green-100 text-sm">
                    Configurează materialul, prețurile și mecanismele
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

            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSave} className="p-6 space-y-6">
                
                <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    Informații de Bază
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                        Nume Material *
                      </Label>
                      <Input 
                        id="name" 
                        value={formData.name} 
                        onChange={(e) => handleChange('name', e.target.value)} 
                        required 
                        className="mt-1 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                        placeholder="ex: PVC Premium, Lemn de Stejar"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                        Descriere
                      </Label>
                      <Textarea 
                        id="description" 
                        value={formData.description} 
                        onChange={(e) => handleChange('description', e.target.value)}
                        className="mt-1 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" 
                        rows={3}
                        placeholder="Descriere detaliată a materialului"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Informații Prețuri</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Prețurile specifice per produs (sticlă, montaj, transport, mecanisme) se configurează acum în <strong>Management Profile</strong>.
                    Aici se definesc doar tipurile de mecanisme disponibile pentru material și prețurile pe dimensiuni.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                    Mecanisme
                  </h3>
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">Tipuri de Mecanisme Disponibile</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {openingTypeOptions.map(option => (
                        <div key={option.id} className="flex items-center space-x-2 p-3 bg-white dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600">
                          <Checkbox
                            id={option.id}
                            checked={formData.opening_types?.includes(option.id) || false}
                            onCheckedChange={(checked) => handleOpeningTypeChange(option.id, checked)}
                          />
                          <Label htmlFor={option.id} className="cursor-pointer text-slate-700 dark:text-slate-300">{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {formData.opening_types && formData.opening_types.length > 0 && (
                      <div className="mt-6 space-y-6">
                        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Configurare Prețuri pe Dimensiuni (Lățime)</h4>
                        
                        {formData.opening_type_pricing.map((mechanism) => {
                          const dimensionRanges = mechanism?.dimension_ranges || [];
                          
                          return (
                            <Card key={mechanism.type} className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
                              <CardHeader className="py-4">
                                <CardTitle className="text-base capitalize flex items-center justify-between text-slate-900 dark:text-slate-100">
                                  <span>{openingTypeOptions.find(opt => opt.id === mechanism.type)?.label || mechanism.type}</span>
                                  <Button
                                    type="button"
                                    onClick={() => addDimensionRange(mechanism.type)}
                                    size="sm"
                                    variant="outline"
                                    className="text-xs py-1 h-auto"
                                  >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Adaugă Interval
                                  </Button>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                                      <tr>
                                        <th className="text-left p-3 font-medium text-slate-700 dark:text-slate-300">#</th>
                                        <th className="text-left p-3 font-medium text-slate-700 dark:text-slate-300">Min (mm)</th>
                                        <th className="text-left p-3 font-medium text-slate-700 dark:text-slate-300">Max (mm)</th>
                                        <th className="text-left p-3 font-medium text-slate-700 dark:text-slate-300">Preț/bucată (€)</th>
                                        <th className="text-center p-3 font-medium text-slate-700 dark:text-slate-300">Acțiuni</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {dimensionRanges.map((range, index) => (
                                        <tr key={`${mechanism.type}-${index}`} className="border-b border-slate-100 dark:border-slate-700 last:border-b-0">
                                          <td className="p-3 font-medium text-slate-600 dark:text-slate-400">{index + 1}</td>
                                          <td className="p-3">
                                            <Input
                                              type="number"
                                              value={range.min_size || ''}
                                              onChange={(e) => handleDimensionRangeChange(mechanism.type, index, 'min_size', e.target.value)}
                                              className="w-24 text-xs h-8 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                                              min="0"
                                            />
                                          </td>
                                          <td className="p-3">
                                            <Input
                                              type="number"
                                              value={range.max_size || ''}
                                              onChange={(e) => handleDimensionRangeChange(mechanism.type, index, 'max_size', e.target.value)}
                                              className="w-24 text-xs h-8 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                                              min="0"
                                            />
                                          </td>
                                          <td className="p-3">
                                            <Input
                                              type="number"
                                              step="0.01"
                                              value={range.price_per_piece || ''}
                                              onChange={(e) => handleDimensionRangeChange(mechanism.type, index, 'price_per_piece', e.target.value)}
                                              className="w-28 text-xs h-8 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                                              min="0"
                                            />
                                          </td>
                                          <td className="p-3 text-center">
                                            <Button
                                              type="button"
                                              onClick={() => removeDimensionRange(mechanism.type, index)}
                                              size="icon"
                                              variant="ghost"
                                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </td>
                                        </tr>
                                      ))}
                                      {dimensionRanges.length === 0 && (
                                        <tr>
                                          <td colSpan={5} className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                                            Nu există intervale configurate
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    Imagine Material
                  </h3>
                  
                  {formData.image_url && (
                    <div className="relative inline-block">
                      <img 
                        src={formData.image_url} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg border-2 border-slate-200" 
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full shadow-lg"
                        onClick={clearImage}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="file"
                        id="imageUpload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploadingImage}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        disabled={isUploadingImage}
                        className="w-full border-dashed border-2 py-8 hover:bg-green-50"
                      >
                        {isUploadingImage ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Se încarcă...
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="w-6 h-6 text-slate-400" />
                            <span>Încarcă Imagine</span>
                            <span className="text-xs text-slate-500">PNG, JPG sau GIF</span>
                          </div>
                        )}
                      </Button>
                    </div>
                    
                    <div>
                      <Label htmlFor="image_url" className="text-sm font-medium text-slate-700">
                        Sau introduceți URL-ul imaginii
                      </Label>
                      <Input 
                        id="image_url" 
                        value={formData.image_url} 
                        onChange={(e) => handleChange('image_url', e.target.value)}
                        placeholder="https://example.com/material.jpg"
                        className="mt-1 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    Setări
                  </h3>
                  
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600">
                    <div>
                      <Label htmlFor="is_active" className="font-medium text-slate-700 dark:text-slate-300">
                        Material Activ
                      </Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Materialul va fi disponibil în configurator
                      </p>
                    </div>
                    <Switch 
                      id="is_active" 
                      checked={formData.is_active} 
                      onCheckedChange={(value) => handleChange('is_active', value)} 
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600">
                    <div>
                      <Label htmlFor="allows_color_selection" className="font-medium text-slate-700 dark:text-slate-300">
                        Permite Selectarea Culorilor
                      </Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Utilizatorii pot alege o culoare pentru acest material
                      </p>
                    </div>
                    <Switch 
                      id="allows_color_selection" 
                      checked={formData.allows_color_selection} 
                      onCheckedChange={(value) => handleChange('allows_color_selection', value)} 
                    />
                  </div>
                </div>
              </form>
            </div>

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
                disabled={isLoading || isUploadingImage}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {material ? 'Actualizează' : 'Creează'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function MaterialManager() {
  const { t } = useTranslation();
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materialToDelete, setMaterialToDelete] = useState(null);

  const fetchMaterials = useCallback(async () => {
    setIsLoading(true);
    try {
      const allMaterials = await Material.list('-created_date', 100);
      setMaterials(allMaterials);
    } catch (error) {
      console.error("Failed to fetch materials", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleSave = async (formData) => {
    if (editingMaterial) {
      await Material.update(editingMaterial.id, formData);
    } else {
      await Material.create(formData);
    }
    await fetchMaterials();
    setIsFormOpen(false);
    setEditingMaterial(null);
  };

  const handleDelete = async () => {
    if (materialToDelete) {
        await Material.delete(materialToDelete.id);
        await fetchMaterials();
        setMaterialToDelete(null);
    }
  };

  const openEditForm = (material) => {
    setEditingMaterial(material);
    setIsFormOpen(true);
  };

  const openNewForm = () => {
    setEditingMaterial(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingMaterial(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <Layers className="w-6 h-6 text-white" />
            </div>
            Management Materiale
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Gestionează materialele, prețurile și mecanismele asociate</p>
        </div>
        <Button onClick={openNewForm} className="bg-green-600 hover:bg-green-700 shadow-lg">
          <PlusCircle className="w-4 h-4 mr-2" />
          Adaugă Material
        </Button>
      </div>

      <MaterialForm
        material={editingMaterial}
        onSave={handleSave}
        onCancel={closeForm}
        isOpen={isFormOpen}
      />

      <AlertDialog open={!!materialToDelete} onOpenChange={() => setMaterialToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Ești sigur?</AlertDialogTitle>
                <AlertDialogDescription>
                    Această acțiune nu poate fi anulată. Materialul "{materialToDelete?.name}" va fi șters definitiv.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Anulează</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Șterge
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Material</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Preț Bază (Info)</TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center p-12">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    <p className="text-slate-500">Se încarcă materialele...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : materials.length > 0 ? (
              materials.map((material) => (
                <TableRow key={material.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-slate-200 dark:border-slate-700">
                  <TableCell>
                    <div className="flex items-center gap-4">
                      {material.image_url ? (
                          <img
                            src={material.image_url}
                            alt={material.name}
                            className="w-12 h-12 object-cover rounded-lg bg-slate-100 border"
                          />
                      ) : (
                          <div className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-lg border">
                              <Layers className="w-6 h-6 text-slate-400" />
                          </div>
                      )}
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{material.name}</div>
                        {material.description && (
                          <div className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs">
                            {material.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{material.base_price}€/m²</div>
                    {material.promo_price && (
                      <div className="text-sm text-green-600 dark:text-green-400">Promo: {material.promo_price}€/m²</div>
                    )}
                  </TableCell>
                  <TableCell>
                      <Badge
                        variant={material.is_active ? 'default' : 'destructive'}
                        className={material.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {material.is_active ? 'Activ' : 'Inactiv'}
                      </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditForm(material)}
                        className="hover:bg-green-50 hover:text-green-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-red-50 hover:text-red-700"
                        onClick={() => setMaterialToDelete(material)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center p-12">
                    <div className="flex flex-col items-center gap-3">
                      <Layers className="h-12 w-12 text-slate-300" />
                      <div>
                        <p className="font-medium text-slate-600">Nu există materiale</p>
                        <p className="text-sm text-slate-500">Adaugă primul material pentru a începe</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}