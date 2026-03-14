import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { PlusCircle, Edit, Trash2, Loader2, Settings2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function MechanismForm({ isOpen, onSave, onCancel, mechanism, materials = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    compatible_materials: [],
    min_height: 300,
    max_height: 2500,
    min_sash_width: 300,
    max_sash_width: 1500,
    glass_area_adjustment_percent: 0,
    price_per_piece: 0,
    price_per_linear_meter: 0,
    height_price_grid: [],
    width_price_grid: [],
    is_active: true,
    priority_order: 100
  });
  const [isLoading, setIsLoading] = useState(false);
  const [newGridHeightMin, setNewGridHeightMin] = useState('');
  const [newGridHeightMax, setNewGridHeightMax] = useState('');
  const [newGridPrice, setNewGridPrice] = useState('');
  const [newWidthMin, setNewWidthMin] = useState('');
  const [newWidthMax, setNewWidthMax] = useState('');
  const [newWidthPrice, setNewWidthPrice] = useState('');

  useEffect(() => {
    if (mechanism) {
      setFormData({ 
        ...mechanism, 
        compatible_materials: mechanism.compatible_materials || [],
        height_price_grid: mechanism.height_price_grid || [],
        width_price_grid: mechanism.width_price_grid || [],
        glass_area_adjustment_percent: mechanism.glass_area_adjustment_percent || 0,
        min_sash_width: mechanism.min_sash_width || mechanism.min_width || 300,
        max_sash_width: mechanism.max_sash_width || mechanism.max_width || 1500
      });
      setNewGridHeightMin('');
      setNewGridHeightMax('');
      setNewGridPrice('');
      setNewWidthMin('');
      setNewWidthMax('');
      setNewWidthPrice('');
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        compatible_materials: [],
        min_height: 300,
        max_height: 2500,
        min_sash_width: 300,
        max_sash_width: 1500,
        glass_area_adjustment_percent: 0,
        price_per_piece: 0,
        price_per_linear_meter: 0,
        height_price_grid: [],
        width_price_grid: [],
        is_active: true,
        priority_order: 100
      });
      setNewGridHeightMin('');
      setNewGridHeightMax('');
      setNewGridPrice('');
      setNewWidthMin('');
      setNewWidthMax('');
      setNewWidthPrice('');
    }
  }, [mechanism, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addHeightPrice = () => {
    const minHeight = parseInt(newGridHeightMin);
    const maxHeight = parseInt(newGridHeightMax);
    const price = parseFloat(newGridPrice) || 0;
    if (minHeight >= 0 && maxHeight > minHeight) {
      const newGrid = [...(formData.height_price_grid || []), { min_height: minHeight, max_height: maxHeight, price }]
        .sort((a, b) => a.min_height - b.min_height);
      handleChange('height_price_grid', newGrid);
      setNewGridHeightMin('');
      setNewGridHeightMax('');
      setNewGridPrice('');
    }
  };

  const removeHeightPrice = (index) => {
    const newGrid = formData.height_price_grid.filter((_, i) => i !== index);
    handleChange('height_price_grid', newGrid);
  };

  const addWidthPrice = () => {
    const minSize = parseInt(newWidthMin);
    const maxSize = parseInt(newWidthMax);
    const price = parseFloat(newWidthPrice);
    if (minSize >= 0 && maxSize > minSize && price >= 0) {
      const newGrid = [...(formData.width_price_grid || []), { min_size: minSize, max_size: maxSize, price_per_piece: price }]
        .sort((a, b) => a.min_size - b.min_size);
      handleChange('width_price_grid', newGrid);
      setNewWidthMin('');
      setNewWidthMax('');
      setNewWidthPrice('');
    }
  };

  const removeWidthPrice = (index) => {
    const newGrid = formData.width_price_grid.filter((_, i) => i !== index);
    handleChange('width_price_grid', newGrid);
  };

  const handleMaterialToggle = (materialId) => {
    const current = formData.compatible_materials || [];
    if (current.includes(materialId)) {
      handleChange('compatible_materials', current.filter(id => id !== materialId));
    } else {
      handleChange('compatible_materials', [...current, materialId]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const dataToSave = {
      ...formData,
      min_height: parseFloat(formData.min_height) || 300,
      max_height: parseFloat(formData.max_height) || 2500,
      min_sash_width: parseFloat(formData.min_sash_width) || 300,
      max_sash_width: parseFloat(formData.max_sash_width) || 1500,
      glass_area_adjustment_percent: parseFloat(formData.glass_area_adjustment_percent) || 0,
      price_per_piece: parseFloat(formData.price_per_piece) || 0,
      price_per_linear_meter: parseFloat(formData.price_per_linear_meter) || 0,
      height_price_grid: formData.height_price_grid || [],
      width_price_grid: formData.width_price_grid || [],
      compatible_materials: formData.compatible_materials || [],
      priority_order: parseInt(formData.priority_order) || 100
    };
    await onSave(dataToSave);
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">
            {mechanism ? 'Editează Mecanism' : 'Adaugă Mecanism Nou'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nume Mecanism</Label>
              <Input value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required placeholder="ex: Oscilo-batant" />
            </div>
            <div>
              <Label>Cod Intern</Label>
              <Input value={formData.code} onChange={(e) => handleChange('code', e.target.value)} required placeholder="ex: oscilo-batant" />
            </div>
          </div>

          <div>
            <Label>Descriere</Label>
            <Input value={formData.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Descriere scurtă..." />
          </div>

          {/* Materiale compatibile */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-700">
            <h4 className="font-semibold mb-3 text-amber-800 dark:text-amber-300">Materiale Compatibile</h4>
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
              Selectează materialele pentru care acest mecanism este disponibil.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {materials.map(material => (
                <label key={material.id} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-white dark:hover:bg-slate-800 bg-white/50 dark:bg-slate-800/50">
                  <Checkbox
                    checked={formData.compatible_materials?.includes(material.id)}
                    onCheckedChange={() => handleMaterialToggle(material.id)}
                  />
                  <span className="text-sm font-medium">{material.name}</span>
                </label>
              ))}
            </div>
            {materials.length === 0 && (
              <p className="text-sm text-amber-600">Nu există materiale definite.</p>
            )}
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <h4 className="font-semibold mb-3 text-slate-800 dark:text-slate-200">Dimensiuni Permise per Canat</h4>
            <p className="text-xs text-slate-500 mb-3">
              Aceste limite se aplică pentru fiecare canat individual, nu pentru întreaga fereastră.
            </p>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label className="text-xs">Înălțime Min (mm)</Label>
                <Input type="number" value={formData.min_height} onChange={(e) => handleChange('min_height', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Înălțime Max (mm)</Label>
                <Input type="number" value={formData.max_height} onChange={(e) => handleChange('max_height', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Lățime Min (mm)</Label>
                <Input type="number" value={formData.min_sash_width} onChange={(e) => handleChange('min_sash_width', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Lățime Max (mm)</Label>
                <Input type="number" value={formData.max_sash_width} onChange={(e) => handleChange('max_sash_width', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="p-4 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg border border-cyan-200 dark:border-cyan-700">
            <h4 className="font-semibold mb-2 text-cyan-800 dark:text-cyan-300">Ajustare Suprafață Sticlă</h4>
            <p className="text-xs text-cyan-600 dark:text-cyan-400 mb-3">
              Procentul cu care se reduce suprafața sticlei pentru acest mecanism (ex: 10 = suprafața sticlei - 10%)
            </p>
            <div className="w-48">
              <Label className="text-cyan-700 dark:text-cyan-400">Reducere (%)</Label>
              <Input 
                type="number" 
                step="0.1" 
                value={formData.glass_area_adjustment_percent} 
                onChange={(e) => handleChange('glass_area_adjustment_percent', e.target.value)} 
                placeholder="0"
              />
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
            <h4 className="font-semibold mb-3 text-blue-800 dark:text-blue-300">Prețuri Fixe</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-blue-700 dark:text-blue-400">Preț per Bucată (€)</Label>
                <Input type="number" step="0.01" value={formData.price_per_piece} onChange={(e) => handleChange('price_per_piece', e.target.value)} />
              </div>
              <div>
                <Label className="text-blue-700 dark:text-blue-400">Preț per Metru Liniar (€/ml)</Label>
                <Input type="number" step="0.01" value={formData.price_per_linear_meter} onChange={(e) => handleChange('price_per_linear_meter', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Grilă prețuri pe înălțime */}
          <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
            <h4 className="font-semibold mb-3 text-green-800 dark:text-green-300">Grilă Prețuri pe Înălțime</h4>
            <p className="text-xs text-green-600 dark:text-green-400 mb-3">
              Adaugă prețuri diferite în funcție de înălțimea maximă. Se aplică prețul pentru intervalul corespunzător.
            </p>
            
            {/* Lista prețuri existente */}
            {formData.height_price_grid?.length > 0 && (
              <div className="mb-4 space-y-2">
                {formData.height_price_grid.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-white dark:bg-slate-800 rounded border">
                    <span className="flex-1 text-sm">
                      <strong>{item.min_height || 0} - {item.max_height} mm</strong>
                      {item.price > 0 && <span className="text-slate-500 ml-2">(implicit: {item.price.toFixed(2)} €)</span>}
                    </span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeHeightPrice(index)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Adaugă nou */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label className="text-xs">Înălțime Min (mm)</Label>
                <Input 
                  type="number" 
                  placeholder="ex: 0" 
                  value={newGridHeightMin} 
                  onChange={(e) => setNewGridHeightMin(e.target.value)} 
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Înălțime Max (mm)</Label>
                <Input 
                  type="number" 
                  placeholder="ex: 1500" 
                  value={newGridHeightMax} 
                  onChange={(e) => setNewGridHeightMax(e.target.value)} 
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Preț implicit (€) - opțional</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="opțional" 
                  value={newGridPrice} 
                  onChange={(e) => setNewGridPrice(e.target.value)} 
                />
              </div>
              <Button type="button" variant="outline" onClick={addHeightPrice} className="shrink-0">
                <PlusCircle className="w-4 h-4 mr-1" /> Adaugă
              </Button>
            </div>
          </div>

          {/* Grilă prețuri pe lățime (dimensiuni) */}
          <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
            <h4 className="font-semibold mb-3 text-purple-800 dark:text-purple-300">Grilă Prețuri pe Lățime (Dimensiuni)</h4>
            <p className="text-xs text-purple-600 dark:text-purple-400 mb-3">
              Adaugă intervale de lățime cu prețuri diferite per bucată.
            </p>
            
            {/* Lista prețuri existente */}
            {formData.width_price_grid?.length > 0 && (
              <div className="mb-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">#</TableHead>
                      <TableHead className="text-xs">Min (mm)</TableHead>
                      <TableHead className="text-xs">Max (mm)</TableHead>
                      <TableHead className="text-xs">Preț/bucată (€)</TableHead>
                      <TableHead className="text-xs">Acțiuni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.width_price_grid.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-sm">{index + 1}</TableCell>
                        <TableCell className="text-sm font-medium">{item.min_size}</TableCell>
                        <TableCell className="text-sm font-medium">{item.max_size}</TableCell>
                        <TableCell className="text-sm font-medium">{item.price_per_piece?.toFixed(2)} €</TableCell>
                        <TableCell>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeWidthPrice(index)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Adaugă nou */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label className="text-xs">Min (mm)</Label>
                <Input 
                  type="number" 
                  placeholder="ex: 350" 
                  value={newWidthMin} 
                  onChange={(e) => setNewWidthMin(e.target.value)} 
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Max (mm)</Label>
                <Input 
                  type="number" 
                  placeholder="ex: 500" 
                  value={newWidthMax} 
                  onChange={(e) => setNewWidthMax(e.target.value)} 
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Preț/bucată (€)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="ex: 15.00" 
                  value={newWidthPrice} 
                  onChange={(e) => setNewWidthPrice(e.target.value)} 
                />
              </div>
              <Button type="button" variant="outline" onClick={addWidthPrice} className="shrink-0">
                <PlusCircle className="w-4 h-4 mr-1" /> Adaugă
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <Label>Ordine Afișare</Label>
              <Input type="number" value={formData.priority_order} onChange={(e) => handleChange('priority_order', e.target.value)} className="w-24 mt-1" />
            </div>
            <div className="flex items-center gap-3">
              <Label>Activ</Label>
              <Switch checked={formData.is_active} onCheckedChange={(v) => handleChange('is_active', v)} />
            </div>
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

export default function MechanismManager() {
  const [mechanisms, setMechanisms] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMechanism, setSelectedMechanism] = useState(null);
  const [mechanismToDelete, setMechanismToDelete] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [mechData, matData] = await Promise.all([
        base44.entities.MechanismType.list('priority_order', 200),
        base44.entities.Material.filter({ is_active: true })
      ]);
      setMechanisms(mechData || []);
      setMaterials(matData || []);
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
    if (selectedMechanism) {
      await base44.entities.MechanismType.update(selectedMechanism.id, data);
      
      // Dacă este mecanismul "fix", copiază intervalele de înălțime la batant și oscilo-batant
      if (selectedMechanism.code === 'fix' && data.height_price_grid?.length > 0) {
        const targetMechanisms = mechanisms.filter(m => 
          m.code === 'batant' || m.code === 'oscilo-batant'
        );
        
        for (const mech of targetMechanisms) {
          await base44.entities.MechanismType.update(mech.id, {
            height_price_grid: data.height_price_grid
          });
        }
      }
    } else {
      await base44.entities.MechanismType.create(data);
    }
    await fetchData();
    setIsFormOpen(false);
    setSelectedMechanism(null);
  };

  const handleDelete = async () => {
    if (mechanismToDelete) {
      await base44.entities.MechanismType.delete(mechanismToDelete.id);
      await fetchData();
      setMechanismToDelete(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <Settings2 className="w-6 h-6 text-white" />
            </div>
            Management Mecanisme
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Gestionează tipurile de mecanisme și prețurile asociate</p>
        </div>
        <Button onClick={() => { setSelectedMechanism(null); setIsFormOpen(true); }} className="bg-green-600 hover:bg-green-700">
          <PlusCircle className="w-4 h-4 mr-2" /> Adaugă Mecanism
        </Button>
      </div>

      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mecanism</TableHead>
              <TableHead>Cod</TableHead>
              <TableHead>Dimensiuni (mm)</TableHead>
              <TableHead>Ajust. Sticlă</TableHead>
              <TableHead>Preț/buc</TableHead>
              <TableHead>Preț/ml</TableHead>
              <TableHead>Materiale</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : mechanisms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-slate-500">
                  Nu există mecanisme. Adaugă primul mecanism.
                </TableCell>
              </TableRow>
            ) : (
              mechanisms.map((mech) => (
                <TableRow key={mech.id}>
                  <TableCell>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{mech.name}</div>
                      {mech.description && <div className="text-xs text-slate-500">{mech.description}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{mech.code}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <div>H: {mech.min_height} - {mech.max_height}</div>
                      <div>L/canat: {mech.min_sash_width || mech.min_width || 300} - {mech.max_sash_width || mech.max_width || 1500}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {mech.glass_area_adjustment_percent > 0 ? (
                      <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">
                        -{mech.glass_area_adjustment_percent}%
                      </Badge>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {(mech.price_per_piece || 0).toFixed(2)} €
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {(mech.price_per_linear_meter || 0).toFixed(2)} €/ml
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {mech.compatible_materials?.length > 0 ? (
                        mech.compatible_materials.map(matId => {
                          const mat = materials.find(m => m.id === matId);
                          return mat ? (
                            <Badge key={matId} variant="secondary" className="text-xs">
                              {mat.name}
                            </Badge>
                          ) : null;
                        })
                      ) : (
                        <span className="text-xs text-slate-400">Toate</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={mech.is_active ? 'default' : 'destructive'} className={mech.is_active ? 'bg-green-100 text-green-800' : ''}>
                      {mech.is_active ? 'Activ' : 'Inactiv'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedMechanism(mech); setIsFormOpen(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setMechanismToDelete(mech)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <MechanismForm
        isOpen={isFormOpen}
        mechanism={selectedMechanism}
        materials={materials}
        onSave={handleSave}
        onCancel={() => { setIsFormOpen(false); setSelectedMechanism(null); }}
      />

      <AlertDialog open={!!mechanismToDelete} onOpenChange={() => setMechanismToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ești sigur?</AlertDialogTitle>
            <AlertDialogDescription>
              Mecanismul "{mechanismToDelete?.name}" va fi șters definitiv.
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