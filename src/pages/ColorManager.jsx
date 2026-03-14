
import React, { useState, useEffect, useCallback } from 'react';
import { Color, Material, SubMaterial } from '@/entities/all';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Edit, Trash2, Loader2, Palette } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '../components/translations/TranslationProvider';

function ColorForm({ isOpen, onSave, onCancel, color, materials = [], subMaterials = [] }) {
  const [formData, setFormData] = useState(
    color || {
      name: '',
      hex_code: '#ffffff',
      ral_code: '',
      compatible_materials: [], // ARRAY DE MATERIAL IDS
      sub_material_id: '',
      price_adjustment: 0,
      price_multiplier: 1,
      price_per_sqm: 0,
      is_premium: false,
      is_active: true,
      special_type: undefined
    }
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize formData. If 'color' object is provided, use its values, otherwise use defaults.
    const initialData = color ? {
      ...color,
      compatible_materials: color.compatible_materials || [], // Ensure it's an array
    } : {
      name: '',
      hex_code: '#ffffff',
      ral_code: '',
      compatible_materials: [],
      sub_material_id: '',
      price_adjustment: 0,
      price_multiplier: 1,
      price_per_sqm: 0,
      is_premium: false,
      is_active: true,
      special_type: undefined
    };
    setFormData(initialData);
  }, [color, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleMaterialToggle = (materialId) => {
    setFormData(prev => {
      const currentCompatibleMaterials = prev.compatible_materials || []; // Ensure it's an array
      const updatedCompatibleMaterials = currentCompatibleMaterials.includes(materialId)
        ? currentCompatibleMaterials.filter(id => id !== materialId)
        : [...currentCompatibleMaterials, materialId];
      
      // If the previously selected sub_material_id is no longer valid
      // because the single compatible material was deselected, clear it.
      let updatedSubMaterialId = prev.sub_material_id;
      if (
        currentCompatibleMaterials.length === 1 &&
        currentCompatibleMaterials[0] === materialId && // The one material that was selected is now deselected
        updatedCompatibleMaterials.length === 0
      ) {
        updatedSubMaterialId = '';
      } else if (
        currentCompatibleMaterials.length === 1 &&
        currentCompatibleMaterials[0] !== materialId && // A different material was deselected
        updatedCompatibleMaterials.length === 1 && // And now there's still only one material, but it's different
        prev.sub_material_id // If there was a sub material selected
      ) {
        // Clear sub_material_id if the single compatible material changed
        updatedSubMaterialId = '';
      } else if (updatedCompatibleMaterials.length > 1) {
        // If more than one material is selected, sub_material_id is not applicable
        updatedSubMaterialId = '';
      }

      return {
        ...prev,
        compatible_materials: updatedCompatibleMaterials,
        sub_material_id: updatedSubMaterialId,
      };
    });
  };

  const handleSelectAllMaterials = () => {
    setFormData(prev => ({
      ...prev,
      compatible_materials: materials.map(m => m.id),
      sub_material_id: '' // Clear sub-material when multiple are selected
    }));
  };

  const handleDeselectAllMaterials = () => {
    setFormData(prev => ({
      ...prev,
      compatible_materials: [],
      sub_material_id: ''
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const dataToSave = {
        ...formData,
        price_adjustment: parseFloat(formData.price_adjustment || 0),
        price_multiplier: parseFloat(formData.price_multiplier || 1),
        price_per_sqm: parseFloat(formData.price_per_sqm || 0),
        // If compatible_materials is empty, material_id should be null (available for all).
        // If it has exactly one material, material_id should be that material's ID.
        // If it has multiple, material_id should be null (as it's managed by compatible_materials).
        material_id: formData.compatible_materials?.length === 1 ? formData.compatible_materials[0] : null,
    };
    if (!dataToSave.special_type) {
      delete dataToSave.special_type;
    }
    await onSave(dataToSave);
    setIsLoading(false);
  };

  // Sub-materials are only available if exactly one parent material is selected
  const availableSubMaterials = formData.compatible_materials?.length === 1
    ? subMaterials.filter(sm => sm.parent_material_id === formData.compatible_materials[0])
    : [];

  const allMaterialsSelected = materials.length > 0 && formData.compatible_materials?.length === materials.length;

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">{color ? 'Editează Culoare' : 'Adaugă Culoare Nouă'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 pt-4">
          {/* Tip special (opțional) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="special_type" className="text-slate-700 dark:text-slate-300">Tip special (opțional)</Label>
              <Select
                value={formData.special_type || 'none'}
                onValueChange={(v) => handleChange('special_type', v === 'none' ? undefined : v)}
              >
                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                  <SelectValue placeholder="Standard" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                  <SelectItem value="none">Standard</SelectItem>
                  <SelectItem value="custom_ral">RAL la cerere (regulă de preț)</SelectItem>
                  <SelectItem value="custom_hex">Culoare Custom HEX (regulă de preț)</SelectItem>
                </SelectContent>
              </Select>
              {formData.special_type && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Această înregistrare nu reprezintă o nuanță concretă, ci o regulă de preț aplicată când clientul alege {formData.special_type === 'custom_ral' ? 'cod RAL la cerere' : 'culoare HEX custom'}.
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">Nume</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
            </div>
          </div>

          {/* Culoare de preview (folosită doar vizual pentru card în Admin) */}
          <div>
            <Label htmlFor="hex_code" className="text-slate-700 dark:text-slate-300">Culoare (preview)</Label>
            <div className="flex items-center gap-2">
              <Input type="color" id="hex_code" value={formData.hex_code} onChange={(e) => handleChange('hex_code', e.target.value)} className="w-12 h-10 p-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600" />
              <Input value={formData.hex_code} onChange={(e) => handleChange('hex_code', e.target.value)} className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
            </div>
            {formData.special_type && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pentru tipurile speciale, hex-ul de aici este doar pentru previzualizare.</p>
            )}
          </div>

          {/* RAL code input - ascuns/ignorat pentru tip special */}
          {!formData.special_type && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ral_code" className="text-slate-700 dark:text-slate-300">Cod RAL (opțional)</Label>
                <Input id="ral_code" value={formData.ral_code} onChange={(e) => handleChange('ral_code', e.target.value)} className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
              </div>
            </div>
          )}
          
          {/* Materiale Compatibile - MULTI-SELECT cu checkbox-uri verzi */}
          <div className="p-4 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">Materiale Compatibile</h4>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllMaterials}
                    disabled={allMaterialsSelected}
                    className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Selectează toate
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDeselectAllMaterials}
                    disabled={!formData.compatible_materials || formData.compatible_materials.length === 0}
                    className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Deselectează toate
                  </Button>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Selectează materialele pentru care această culoare este disponibilă. Dacă nu selectezi niciunul, culoarea va fi disponibilă pentru toate materialele.</p>
              
              <div className="grid grid-cols-2 gap-3">
                {materials.map(material => (
                  <Label key={material.id} className="flex items-center space-x-2 cursor-pointer p-2 rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.compatible_materials?.includes(material.id) || false}
                      onChange={() => handleMaterialToggle(material.id)}
                      className="rounded border-slate-400 dark:border-slate-500 text-green-600 focus:ring-green-500 focus:ring-offset-0"
                    />
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{material.name}</span>
                  </Label>
                ))}
              </div>
              
              {(!formData.compatible_materials || formData.compatible_materials.length === 0) && (
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded p-3">
                  <p className="text-blue-800 dark:text-blue-300 text-sm">
                    <strong>Notă:</strong> Această culoare va fi disponibilă pentru toate materialele din sistem.
                  </p>
                </div>
              )}
          </div>

          {/* Sub-Material Specific - apare doar când e exact UN material selectat */}
          {formData.compatible_materials?.length === 1 && availableSubMaterials.length > 0 && (
            <div>
              <Label htmlFor="sub_material_id" className="text-slate-700 dark:text-slate-300">Sub-Material Specific (opțional)</Label>
              <Select value={formData.sub_material_id || ''} onValueChange={(value) => handleChange('sub_material_id', value)}>
                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                  <SelectValue placeholder="Alege sub-materialul..." />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                  <SelectItem value={null}>General (toate sub-materialele)</SelectItem>
                  {availableSubMaterials.map(sm => (
                    <SelectItem key={sm.id} value={sm.id}>{sm.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price_adjustment" className="text-slate-700 dark:text-slate-300">Ajustare Fixă (€)</Label>
              <Input id="price_adjustment" type="number" step="0.01" value={formData.price_adjustment} onChange={(e) => handleChange('price_adjustment', e.target.value)} className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <Label htmlFor="price_multiplier" className="text-slate-700 dark:text-slate-300">Multiplicator Preț (ex: 1.1)</Label>
              <Input id="price_multiplier" type="number" step="0.01" min="0" value={formData.price_multiplier} onChange={(e) => handleChange('price_multiplier', e.target.value)} className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <Label htmlFor="price_per_sqm" className="text-slate-700 dark:text-slate-300">Cost Suplimentar per m² (€)</Label>
              <Input id="price_per_sqm" type="number" step="0.01" min="0" value={formData.price_per_sqm} onChange={(e) => handleChange('price_per_sqm', e.target.value)} className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
            </div>
          </div>
          
          {/* Înlocuire checkbox-uri cu Switch verzi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">
              <Label htmlFor="is_premium" className="text-slate-700 dark:text-slate-300 cursor-pointer">Culoare Premium</Label>
              <Switch
                id="is_premium"
                checked={formData.is_premium}
                onCheckedChange={(v) => handleChange('is_premium', v)}
                className="data-[state=checked]:bg-green-600"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">
              <Label htmlFor="is_active" className="text-slate-700 dark:text-slate-300 cursor-pointer">Activ</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(v) => handleChange('is_active', v)}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="outline" onClick={onCancel} className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
              Anulează
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Salvează Modificări
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ColorManager() {
  const [colors, setColors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [subMaterials, setSubMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [colorToDelete, setColorToDelete] = useState(null);
  const { t } = useTranslation();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [colorsData, materialsData, subMaterialsData] = await Promise.all([
          Color.list('-created_date', 200),
          Material.list(),
          SubMaterial.list()
      ]);
      setColors(colorsData);
      setMaterials(materialsData);
      setSubMaterials(subMaterialsData);
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
    if (selectedColor) {
      await Color.update(selectedColor.id, data);
    } else {
      await Color.create(data);
    }
    await fetchData();
    setIsFormOpen(false);
    setSelectedColor(null);
  };

  const handleDelete = async () => {
    if (colorToDelete) {
      await Color.delete(colorToDelete.id);
      await fetchData();
      setColorToDelete(null);
    }
  };

  const getMaterialName = (id) => materials.find(m => m.id === id)?.name || 'N/A';
  const getSubMaterialName = (id) => subMaterials.find(sm => sm.id === id)?.name || 'N/A';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Management Culori</h1>
          <p className="text-slate-600 dark:text-slate-400">Gestionează culorile disponibile pentru configurator.</p>
        </div>
        <Button onClick={() => { setSelectedColor(null); setIsFormOpen(true); }} className="bg-green-600 hover:bg-green-700 text-white">
          <PlusCircle className="mr-2 h-4 w-4" /> Adaugă Culoare
        </Button>
      </div>

      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 dark:border-slate-700">
              <TableHead className="text-slate-700 dark:text-slate-300">Culoare</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300">Asociere</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300">Preț</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300">Status</TableHead>
              <TableHead className="text-right text-slate-700 dark:text-slate-300">Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan="5" className="text-center text-slate-500 dark:text-slate-400"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
            ) : (
              colors.map((color) => (
                <TableRow key={color.id} className="border-slate-200 dark:border-slate-700">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* SWATCH: gradient pentru RAL/Custom, altfel culoarea clasică */}
                      <div
                        className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 shadow-inner"
                        style={
                          color.special_type === 'custom_ral'
                            ? {
                                background:
                                  'conic-gradient(at 50% 50%, #ff0000, #ff7f00, #ffff00, #00ff00, #00ffff, #0000ff, #8b00ff, #ff0000)'
                              }
                            : color.special_type === 'custom_hex'
                            ? {
                                background:
                                  'linear-gradient(135deg, #ff0040, #ff9900, #ffee00, #00e676, #00ccff, #3f51b5, #9c27b0)'
                              }
                            : { backgroundColor: color.hex_code }
                        }
                      ></div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">{color.name}</div>
                        {color.ral_code && <div className="text-xs text-slate-500 dark:text-slate-400">{color.ral_code}</div>}
                        {color.special_type === 'custom_ral' && (
                          <Badge variant="secondary" className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">RAL la cerere</Badge>
                        )}
                        {color.special_type === 'custom_hex' && (
                          <Badge variant="secondary" className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">HEX Custom</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                      {color.compatible_materials && color.compatible_materials.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {color.compatible_materials.slice(0, 2).map(materialId => {
                            const material = materials.find(m => m.id === materialId);
                            return material ? (
                              <Badge key={materialId} variant="secondary" className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                {material.name}
                              </Badge>
                            ) : null;
                          })}
                          {color.compatible_materials.length > 2 && (
                            <Badge variant="outline" className="text-xs border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                              +{color.compatible_materials.length - 2}
                            </Badge>
                          )}
                          {color.compatible_materials.length === 1 && color.sub_material_id && (
                              <Badge variant="secondary" className="text-xs ml-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                &gt; {getSubMaterialName(color.sub_material_id)}
                              </Badge>
                          )}
                        </div>
                      ) : color.material_id ? ( // Fallback for old data if compatible_materials is not present
                        <Badge variant="secondary" className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">{getMaterialName(color.material_id)} {color.sub_material_id ? `> ${getSubMaterialName(color.sub_material_id)}` : ''}</Badge>
                      ) : ( // If no compatible_materials and no old material_id, assume general
                        <Badge variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">Toate Materialele</Badge>
                      )}
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">
                    <div className="text-sm">
                      {color.price_adjustment !== 0 && <div>Fix: {color.price_adjustment}€</div>}
                      {color.price_multiplier !== 1 && <div>Mult: x{color.price_multiplier}</div>}
                      {color.price_per_sqm > 0 && <div>/m²: {color.price_per_sqm}€</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={color.is_active
                        ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
                        : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700"}
                    >
                      {color.is_active ? 'Activ' : 'Inactiv'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedColor(color); setIsFormOpen(true); }} className="hover:bg-slate-100 dark:hover:bg-slate-800">
                      <Edit className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setColorToDelete(color)} className="hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
      
      {isFormOpen && (
          <ColorForm
            color={selectedColor}
            materials={materials}
            subMaterials={subMaterials}
            onSave={handleSave}
            onCancel={() => setIsFormOpen(false)}
            isOpen={isFormOpen}
          />
      )}

      <AlertDialog open={!!colorToDelete} onOpenChange={() => setColorToDelete(null)}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-slate-100">Ești sigur?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Această acțiune va șterge definitiv culoarea "{colorToDelete?.name}". Această acțiune nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Șterge</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
