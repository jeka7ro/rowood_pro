import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Edit, Trash2, Loader2, Layers, Upload, X, ChevronDown, ChevronUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible';

function ProfileForm({ isOpen, onSave, onCancel, profile, materials = [], glazingTypes = [], products = [], mechanisms = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    u_value: 0.91,
    design_type: '',
    installation_depth: 70,
    glass_panes_count: 2,
    default_glazing_id: '',
    features: [],
    price_per_linear_meter: 0,
    price_multiplier: 1,
    compatible_materials: [],
    product_specific_pricing: [],
    is_active: true,
    priority_order: 100
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [expandedProducts, setExpandedProducts] = useState({});
  const [expandedMechanisms, setExpandedMechanisms] = useState({});

  useEffect(() => {
    if (profile) {
      setFormData({
        ...profile,
        features: profile.features || [],
        compatible_materials: profile.compatible_materials || [],
        product_specific_pricing: profile.product_specific_pricing || [],
        glass_panes_count: profile.glass_panes_count || profile.seals_count || 2,
        default_glazing_id: profile.default_glazing_id || '',
        price_per_linear_meter: profile.price_per_linear_meter || 0
      });
    } else {
      setFormData({
        name: '',
        image_url: '',
        u_value: 0.91,
        design_type: '',
        installation_depth: 70,
        glass_panes_count: 2,
        default_glazing_id: '',
        features: [],
        price_per_linear_meter: 0,
        price_multiplier: 1,
        compatible_materials: [],
        product_specific_pricing: [],
        is_active: true,
        priority_order: 100
      });
    }
  }, [profile, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      handleChange('image_url', result.file_url);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      handleChange('features', [...formData.features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    handleChange('features', formData.features.filter((_, i) => i !== index));
  };

  const handleMaterialToggle = (materialId) => {
    const current = formData.compatible_materials || [];
    if (current.includes(materialId)) {
      handleChange('compatible_materials', current.filter(id => id !== materialId));
    } else {
      handleChange('compatible_materials', [...current, materialId]);
    }
  };

  const toggleProductPricing = (productId) => {
    const current = formData.product_specific_pricing || [];
    const exists = current.find(p => p.product_id === productId);
    if (exists) {
      handleChange('product_specific_pricing', current.filter(p => p.product_id !== productId));
      setExpandedProducts(prev => ({ ...prev, [productId]: false }));
    } else {
      handleChange('product_specific_pricing', [...current, {
        product_id: productId,
        glass_price_per_sqm: 0,
        hardware_fixed_price: 0,
        transport_ro_price_per_sqm: 0,
        transport_external_price_per_sqm: 0,
        mechanism_pricing: { fix: 0, batant: 0, 'oscilo-batant': 0, deschidere: 0 }
      }]);
      // Auto-expand when enabling
      setExpandedProducts(prev => ({ ...prev, [productId]: true }));
    }
  };

  const updateProductPricing = (productId, field, value) => {
    const current = formData.product_specific_pricing || [];
    const updated = current.map(p => {
      if (p.product_id === productId) {
        return { ...p, [field]: parseFloat(value) || 0 };
      }
      return p;
    });
    handleChange('product_specific_pricing', updated);
  };

  const updateMechanismPricing = (productId, mechCode, value) => {
    const current = formData.product_specific_pricing || [];
    const updated = current.map(p => {
      if (p.product_id === productId) {
        return {
          ...p,
          mechanism_pricing: {
            ...(p.mechanism_pricing || {}),
            [mechCode]: parseFloat(value) || 0
          }
        };
      }
      return p;
    });
    handleChange('product_specific_pricing', updated);
  };

  const updateGlazingPrice = (productId, glazingId, value) => {
    const current = formData.product_specific_pricing || [];
    const updated = current.map(p => {
      if (p.product_id === productId) {
        return {
          ...p,
          glazing_prices: {
            ...(p.glazing_prices || {}),
            [glazingId]: parseFloat(value) || 0
          }
        };
      }
      return p;
    });
    handleChange('product_specific_pricing', updated);
  };

  const toggleExpanded = (productId) => {
    setExpandedProducts(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  const toggleMechanismExpanded = (productId, mechCode) => {
    const key = `${productId}_${mechCode}`;
    setExpandedMechanisms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateMechanismHeightPricing = (productId, mechCode, heightRanges) => {
    const current = formData.product_specific_pricing || [];
    const updated = current.map(p => {
      if (p.product_id === productId) {
        return {
          ...p,
          mechanism_height_pricing: {
            ...(p.mechanism_height_pricing || {}),
            [mechCode]: heightRanges
          }
        };
      }
      return p;
    });
    handleChange('product_specific_pricing', updated);
  };

  const setMechanismHeightPrice = (productId, mechCode, minHeight, maxHeight, price) => {
    const current = formData.product_specific_pricing || [];
    const productPricing = current.find(p => p.product_id === productId);
    const currentHeightPricing = productPricing?.mechanism_height_pricing?.[mechCode] || [];
    
    const existingIndex = currentHeightPricing.findIndex(r => r.min_height === minHeight && r.max_height === maxHeight);
    let newRanges;
    if (existingIndex > -1) {
      newRanges = currentHeightPricing.map((r, i) => 
        i === existingIndex ? { ...r, price_per_piece: parseFloat(price) || 0 } : r
      );
    } else {
      newRanges = [...currentHeightPricing, { min_height: minHeight, max_height: maxHeight, price_per_piece: parseFloat(price) || 0 }]
        .sort((a, b) => a.min_height - b.min_height);
    }
    
    updateMechanismHeightPricing(productId, mechCode, newRanges);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const dataToSave = {
      ...formData,
      u_value: parseFloat(formData.u_value) || 0,
      installation_depth: parseFloat(formData.installation_depth) || 0,
      glass_panes_count: parseInt(formData.glass_panes_count) || 2,
      default_glazing_id: formData.default_glazing_id || null,
      price_per_linear_meter: parseFloat(formData.price_per_linear_meter) || 0,
      price_multiplier: parseFloat(formData.price_multiplier) || 1,
      priority_order: parseInt(formData.priority_order) || 100
    };
    await onSave(dataToSave);
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">
            {profile ? 'Editează Profil' : 'Adaugă Profil Nou'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-6 pt-4">
          {/* Informații de bază */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nume Profil</Label>
              <Input value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required />
            </div>
            <div>
              <Label>Tip Design</Label>
              <Input value={formData.design_type} onChange={(e) => handleChange('design_type', e.target.value)} placeholder="ex: Aspect unghiular" />
            </div>
          </div>

          {/* Imagine */}
          <div>
            <Label>Imagine Profil</Label>
            <div className="flex items-center gap-4 mt-2">
              {formData.image_url && (
                <img src={formData.image_url} alt="Preview" className="w-24 h-24 object-cover rounded-lg border" />
              )}
              <div className="relative">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={isUploading} />
                <Button type="button" variant="outline" disabled={isUploading}>
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                  Încarcă Imagine
                </Button>
              </div>
            </div>
          </div>

          {/* Specificații tehnice */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label>Valoare U</Label>
              <Input type="number" step="0.01" value={formData.u_value} onChange={(e) => handleChange('u_value', e.target.value)} />
            </div>
            <div>
              <Label>Adâncime Instalare (mm)</Label>
              <Input type="number" value={formData.installation_depth} onChange={(e) => handleChange('installation_depth', e.target.value)} />
            </div>
            <div>
              <Label>Nr. Foi de Sticlă</Label>
              <Select value={String(formData.glass_panes_count)} onValueChange={(v) => { handleChange('glass_panes_count', parseInt(v)); handleChange('default_glazing_id', ''); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 foaie</SelectItem>
                  <SelectItem value="2">2 foi</SelectItem>
                  <SelectItem value="3">3 foi</SelectItem>
                  <SelectItem value="4">4 foi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Multiplicator Preț</Label>
              <Input type="number" step="0.01" value={formData.price_multiplier} onChange={(e) => handleChange('price_multiplier', e.target.value)} />
            </div>
          </div>

          {/* Selector Tip Sticlă - filtrat pe numărul de foi */}
          <div>
            <Label>Tip Sticlă Implicit</Label>
            <Select value={formData.default_glazing_id || ''} onValueChange={(v) => handleChange('default_glazing_id', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selectează tipul de sticlă..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>-- Fără selecție --</SelectItem>
                {glazingTypes
                  .filter(g => g.panes_count === formData.glass_panes_count)
                  .map(g => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name} ({g.panes_count} foi, {g.thickness}mm)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">
              Se afișează doar tipurile de sticlă cu {formData.glass_panes_count} {formData.glass_panes_count === 1 ? 'foaie' : 'foi'}
            </p>
          </div>

          {/* Preț per metru liniar */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
            <Label className="text-blue-800 dark:text-blue-300">Preț per Metru Liniar (€/ml)</Label>
            <Input 
              type="number" 
              step="0.01" 
              value={formData.price_per_linear_meter} 
              onChange={(e) => handleChange('price_per_linear_meter', e.target.value)} 
              className="mt-2"
            />
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              Prețul se calculează pe baza perimetrului. Ex: geam 1m×1m = 4 ml (2×(1+1))
            </p>
          </div>

          {/* Caracteristici */}
          <div>
            <Label>Caracteristici</Label>
            <div className="flex flex-wrap gap-2 mt-2 mb-2">
              {formData.features.map((feature, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {feature}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeFeature(index)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="Adaugă caracteristică..." onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} />
              <Button type="button" variant="outline" onClick={addFeature}>Adaugă</Button>
            </div>
          </div>

          {/* Materiale compatibile */}
          <div>
            <Label>Materiale Compatibile</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {materials.map(material => (
                <label key={material.id} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.compatible_materials?.includes(material.id)}
                    onChange={() => handleMaterialToggle(material.id)}
                    className="accent-green-600"
                  />
                  <span className="text-sm">{material.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Prețuri Specifice per Produs */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">Prețuri Specifice per Produs</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Configurează prețurile pentru sticlă, montaj, transport și mecanisme. <strong>Toate prețurile sunt fără TVA.</strong>
            </p>
            
            <div className="space-y-3">
              {products.map(product => {
                const pricing = formData.product_specific_pricing?.find(p => p.product_id === product.id);
                const isEnabled = !!pricing;
                const isExpanded = expandedProducts[product.id] !== false;
                
                return (
                  <div key={product.id} className={`border rounded-lg ${isEnabled ? 'border-green-400 bg-white dark:bg-slate-800' : 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50'}`}>
                    <div className="flex items-center justify-between p-3">
                      <label className="flex items-center gap-3 cursor-pointer flex-1">
                        <Checkbox
                          checked={isEnabled}
                          onCheckedChange={() => toggleProductPricing(product.id)}
                        />
                        <span className="font-medium">{product.name}</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                        {product.supports_sliding && <Badge variant="outline" className="text-xs">Culisant</Badge>}
                        {isEnabled && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => toggleExpanded(product.id)}>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {isEnabled && isExpanded && (
                      <div className="px-3 pb-3 space-y-4 border-t pt-3">
                        {/* Prețuri de bază */}
                        <div>
                          <h5 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Prețuri de Bază (fără TVA)</h5>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs">Montaj Fix (€)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={pricing?.hardware_fixed_price || ''}
                                onChange={(e) => updateProductPricing(product.id, 'hardware_fixed_price', e.target.value)}
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Transport RO (€/m²)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={pricing?.transport_ro_price_per_sqm || ''}
                                onChange={(e) => updateProductPricing(product.id, 'transport_ro_price_per_sqm', e.target.value)}
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Transport Extern (€/m²)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={pricing?.transport_external_price_per_sqm || ''}
                                onChange={(e) => updateProductPricing(product.id, 'transport_external_price_per_sqm', e.target.value)}
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Prețuri Mecanisme pe Înălțime (€/bucată per canat) */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              Prețuri Mecanisme (€/bucată per canat, fără TVA)
                            </h5>
                            {/* Import Prețuri Dropdown */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="text-xs">
                                  <Upload className="w-3 h-3 mr-1" /> Importă Prețuri
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel className="text-xs">Copiază din alt produs</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {products
                                  .filter(p => p.id !== product.id && formData.product_specific_pricing?.some(pp => pp.product_id === p.id && pp.mechanism_height_pricing))
                                  .map(sourceProduct => {
                                    const sourcePricing = formData.product_specific_pricing?.find(pp => pp.product_id === sourceProduct.id);
                                    const hasPrices = sourcePricing?.mechanism_height_pricing && Object.keys(sourcePricing.mechanism_height_pricing).length > 0;
                                    if (!hasPrices) return null;
                                    return (
                                      <DropdownMenuItem 
                                        key={sourceProduct.id}
                                        onClick={() => {
                                          // Copiază mechanism_height_pricing de la sourceProduct la product.id curent
                                          const current = formData.product_specific_pricing || [];
                                          const updated = current.map(p => {
                                            if (p.product_id === product.id) {
                                              return {
                                                ...p,
                                                mechanism_height_pricing: { ...sourcePricing.mechanism_height_pricing }
                                              };
                                            }
                                            return p;
                                          });
                                          handleChange('product_specific_pricing', updated);
                                        }}
                                      >
                                        {sourceProduct.name}
                                      </DropdownMenuItem>
                                    );
                                  })}
                                {!products.some(p => p.id !== product.id && formData.product_specific_pricing?.some(pp => pp.product_id === p.id && pp.mechanism_height_pricing && Object.keys(pp.mechanism_height_pricing).length > 0)) && (
                                  <DropdownMenuItem disabled className="text-xs text-slate-400">
                                    Nu există prețuri de importat
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <p className="text-xs text-slate-500 mb-3">
                            Selectează un mecanism pentru a configura prețurile pe intervale de înălțime.
                          </p>
                          <div className="space-y-2">
                            {mechanisms.map(mech => {
                              const mechKey = `${product.id}_${mech.code}`;
                              const isMechExpanded = expandedMechanisms[mechKey];
                              const heightGrid = mech.height_price_grid || [];
                              const savedPrices = pricing?.mechanism_height_pricing?.[mech.code] || [];
                              
                              return (
                                <div key={mech.id} className="border rounded-lg bg-slate-50 dark:bg-slate-700">
                                  <div 
                                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg"
                                    onClick={() => toggleMechanismExpanded(product.id, mech.code)}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm">{mech.name}</span>
                                      <Badge variant="outline" className="text-xs">{mech.code}</Badge>
                                      {savedPrices.length > 0 && (
                                        <Badge className="bg-green-100 text-green-700 text-xs">
                                          {savedPrices.length} prețuri setate
                                        </Badge>
                                      )}
                                    </div>
                                    {isMechExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </div>
                                  
                                  {isMechExpanded && (
                                    <div className="px-3 pb-3 border-t">
                                      {heightGrid.length === 0 ? (
                                        <p className="text-xs text-slate-500 py-2">
                                          Nu există intervale de înălțime definite pentru acest mecanism. 
                                          Configurează-le în Management Mecanisme.
                                        </p>
                                      ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
                                          {heightGrid.map((range, idx) => {
                                                // Căutăm prețul salvat - intervalele din mecanism pot avea min_height undefined
                                                const rangeMin = range.min_height || 0;
                                                const savedPrice = savedPrices.find(p => 
                                                  (p.min_height || 0) === rangeMin && p.max_height === range.max_height
                                                );
                                                const displayValue = savedPrice?.price_per_piece !== undefined && savedPrice?.price_per_piece !== null 
                                                  ? savedPrice.price_per_piece 
                                                  : '';
                                                return (
                                                  <div key={idx}>
                                                    <Label className="text-xs">
                                                      {rangeMin} - {range.max_height} mm
                                                    </Label>
                                                    <Input
                                                      type="number"
                                                      step="0.01"
                                                      value={displayValue}
                                                      onChange={(e) => setMechanismHeightPrice(product.id, mech.code, rangeMin, range.max_height, e.target.value)}
                                                      placeholder={range.price > 0 ? `${range.price} €` : '0.00'}
                                                    />
                                                  </div>
                                                );
                                              })}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <Label>Activ</Label>
            <Switch checked={formData.is_active} onCheckedChange={(v) => handleChange('is_active', v)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>Anulează</Button>
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvează
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ProfileManager() {
  const [profiles, setProfiles] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [glazingTypes, setGlazingTypes] = useState([]);
  const [products, setProducts] = useState([]);
  const [mechanisms, setMechanisms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileToDelete, setProfileToDelete] = useState(null);
  const [filterMaterialId, setFilterMaterialId] = useState('all');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [profilesData, materialsData, glazingData, productsData, mechData] = await Promise.all([
        base44.entities.Profile.list('priority_order', 200),
        base44.entities.Material.list(),
        base44.entities.GlazingType.filter({ is_active: true }),
        base44.entities.Product.filter({ is_active: true }),
        base44.entities.MechanismType.filter({ is_active: true })
      ]);
      setProfiles(profilesData || []);
      setMaterials(materialsData || []);
      setGlazingTypes(glazingData || []);
      setProducts(productsData || []);
      setMechanisms(mechData || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (data) => {
    if (selectedProfile) {
      await base44.entities.Profile.update(selectedProfile.id, data);
    } else {
      await base44.entities.Profile.create(data);
    }
    await fetchData();
    setIsFormOpen(false);
    setSelectedProfile(null);
  };

  const handleDelete = async () => {
    if (profileToDelete) {
      await base44.entities.Profile.delete(profileToDelete.id);
      await fetchData();
      setProfileToDelete(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Layers className="w-6 h-6 text-white" />
            </div>
            Management Profile
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Gestionează profilele disponibile în configurator</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={filterMaterialId} onValueChange={setFilterMaterialId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrează după material" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate materialele</SelectItem>
              {materials.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => { setSelectedProfile(null); setIsFormOpen(true); }} className="bg-green-600 hover:bg-green-700">
            <PlusCircle className="w-4 h-4 mr-2" /> Adaugă Profil
          </Button>
        </div>
      </div>

      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Profil</TableHead>
              <TableHead>Valoare U</TableHead>
              <TableHead>Adâncime</TableHead>
              <TableHead>Foi Sticlă</TableHead>
              <TableHead>Preț/ml</TableHead>
              <TableHead>Multiplicator</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : profiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                  Nu există profile. Adaugă primul profil.
                </TableCell>
              </TableRow>
            ) : (
              profiles
                .filter(profile => {
                  if (filterMaterialId === 'all') return true;
                  return profile.compatible_materials?.includes(filterMaterialId);
                })
                .map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {profile.image_url ? (
                        <img src={profile.image_url} alt={profile.name} className="w-12 h-12 object-cover rounded-lg border" />
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Layers className="w-6 h-6 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold">{profile.name}</div>
                        <div className="text-xs text-slate-500">{profile.design_type}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      ≥ {profile.u_value}
                    </Badge>
                  </TableCell>
                  <TableCell>{profile.installation_depth} mm</TableCell>
                  <TableCell>{profile.glass_panes_count || profile.seals_count || 2}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {(profile.price_per_linear_meter || 0).toFixed(2)} €/ml
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {profile.price_multiplier !== 1 && (
                      <Badge variant="secondary">
                        {profile.price_multiplier > 1 ? '+' : ''}{((profile.price_multiplier - 1) * 100).toFixed(0)}%
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={profile.is_active ? 'default' : 'destructive'} className={profile.is_active ? 'bg-green-100 text-green-800' : ''}>
                      {profile.is_active ? 'Activ' : 'Inactiv'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedProfile(profile); setIsFormOpen(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setProfileToDelete(profile)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <ProfileForm
        isOpen={isFormOpen}
        profile={selectedProfile}
        materials={materials}
        glazingTypes={glazingTypes}
        products={products}
        mechanisms={mechanisms}
        onSave={handleSave}
        onCancel={() => { setIsFormOpen(false); setSelectedProfile(null); }}
      />

      <AlertDialog open={!!profileToDelete} onOpenChange={() => setProfileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ești sigur?</AlertDialogTitle>
            <AlertDialogDescription>
              Profilul "{profileToDelete?.name}" va fi șters definitiv.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Șterge</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}