import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GlazingType } from '@/entities/GlazingType';
import { Profile } from '@/entities/Profile';
import { Material } from '@/entities/Material';
import { UploadFile } from '@/integrations/Core';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
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
import { PlusCircle, Edit, Trash2, Loader2, Upload, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function GlazingForm({ isOpen, onSave, onCancel, glazing }) {
  const buildForm = (g) => ({
    name: g?.name || '',
    panes_count: g?.panes_count ?? 2,
    thickness: g?.thickness ?? 24,
    u_value: g?.u_value ?? 1.1,
    price_per_sqm: g?.price_per_sqm ?? 0,
    features: g?.features || [],
    compatible_profiles: g?.compatible_profiles || [],
    image_url: g?.image_url || '',
    is_active: g?.is_active ?? true,
    tip: g?.tip || '',
  });

  const [formData, setFormData] = useState(() => buildForm(glazing));
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [materialFilter, setMaterialFilter] = useState('');

  useEffect(() => {
    Profile.filter({}).then(data => setProfiles(data || [])).catch(() => setProfiles([]));
    Material.filter({}).then(data => setMaterials(data || [])).catch(() => setMaterials([]));
  }, []);

  useEffect(() => {
    setFormData(buildForm(glazing));
    setMaterialFilter('');
  }, [glazing]);

  const toggleProfile = (profileId) => {
    const current = formData.compatible_profiles || [];
    const updated = current.includes(profileId)
      ? current.filter(id => id !== profileId)
      : [...current, profileId];
    handleChange('compatible_profiles', updated);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await UploadFile({ file });
      handleChange('image_url', result.file_url);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredProfiles = materialFilter
    ? profiles.filter(p => Array.isArray(p.compatible_materials) && p.compatible_materials.includes(materialFilter))
    : profiles;

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const dataToSave = { 
        ...formData,
        panes_count: parseInt(formData.panes_count),
        thickness: parseFloat(formData.thickness),
        u_value: parseFloat(formData.u_value),
        price_per_sqm: parseFloat(formData.price_per_sqm) || 0,
        features: Array.isArray(formData.features) ? formData.features : formData.features.split(',').map(f => f.trim()).filter(f => f !== '')
    };
    await onSave(dataToSave);
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">{glazing ? 'Editează Tip Sticlă' : 'Adaugă Tip Sticlă Nou'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="space-y-4 p-4 overflow-y-auto flex-1">
            <div>
              <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">Nume Tip Sticlă</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="panes_count" className="text-slate-700 dark:text-slate-300">Nr. Foi Sticlă</Label>
                    <Input id="panes_count" type="number" value={formData.panes_count} onChange={(e) => handleChange('panes_count', e.target.value)} className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
                </div>
                <div>
                    <Label htmlFor="thickness" className="text-slate-700 dark:text-slate-300">Grosime (mm)</Label>
                    <Input id="thickness" type="number" step="0.1" value={formData.thickness} onChange={(e) => handleChange('thickness', e.target.value)} className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="u_value" className="text-slate-700 dark:text-slate-300">Valoare U</Label>
                    <Input id="u_value" type="number" step="0.01" value={formData.u_value} onChange={(e) => handleChange('u_value', e.target.value)} className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
                </div>
                <div>
                    <Label htmlFor="price_per_sqm" className="text-slate-700 dark:text-slate-300">Preț per m² (€)</Label>
                    <Input id="price_per_sqm" type="number" step="0.01" value={formData.price_per_sqm} onChange={(e) => handleChange('price_per_sqm', e.target.value)} className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
                </div>
            </div>
            <div>
                <Label htmlFor="features" className="text-slate-700 dark:text-slate-300">Caracteristici (separate prin virgulă)</Label>
                <Input id="features" value={Array.isArray(formData.features) ? formData.features.join(', ') : (formData.features || '')} onChange={(e) => handleChange('features', e.target.value)} className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
            </div>
            {profiles.length > 0 && (
              <div>
                {/* Filtru rapid dupa material */}
                <div className="mb-2">
                  <Label className="text-slate-700 dark:text-slate-300 text-xs mb-1 block">Filtreaza dupa material</Label>
                  <select
                    value={materialFilter}
                    onChange={e => setMaterialFilter(e.target.value)}
                    className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">-- Toate materialele --</option>
                    {materials.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-slate-700 dark:text-slate-300">Profile Compatibile</Label>
                  <button
                    type="button"
                    onClick={() => {
                      const filteredIds = filteredProfiles.map(p => p.id);
                      const allSelected = filteredIds.every(id => (formData.compatible_profiles || []).includes(id));
                      const current = formData.compatible_profiles || [];
                      if (allSelected) {
                        handleChange('compatible_profiles', current.filter(id => !filteredIds.includes(id)));
                      } else {
                        handleChange('compatible_profiles', [...new Set([...current, ...filteredIds])]);
                      }
                    }}
                    className="text-xs text-green-600 hover:text-green-800 font-medium underline"
                  >
                    {filteredProfiles.length > 0 && filteredProfiles.every(p => (formData.compatible_profiles || []).includes(p.id))
                      ? 'Deselectează Toate'
                      : 'Selectează Toate'}
                  </button>
                </div>
                <div className="border border-slate-200 dark:border-slate-700 rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                  {filteredProfiles.length === 0
                    ? <p className="text-xs text-slate-400">Niciun profil pentru materialul selectat.</p>
                    : filteredProfiles.map(profile => (
                      <label key={profile.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={(formData.compatible_profiles || []).includes(profile.id)}
                          onChange={() => toggleProfile(profile.id)}
                          className="w-4 h-4 accent-green-600"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {profile.name}
                          {profile.type && <span className="ml-1 text-xs text-slate-400">({profile.type})</span>}
                        </span>
                      </label>
                    ))
                  }
                </div>
              </div>
            )}
            {/* Upload imagine */}
            <div>
              <Label className="text-slate-700 dark:text-slate-300 mb-1 block">Imagine Sticlă</Label>
              <div className="flex items-start gap-3">
                {formData.image_url ? (
                  <div className="relative">
                    <img src={formData.image_url} alt="preview" className="w-20 h-20 object-cover rounded-md border border-slate-200" />
                    <button
                      type="button"
                      onClick={() => handleChange('image_url', '')}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
                    ><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-md flex items-center justify-center text-slate-400">
                    <Upload className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1">
                  <label className="cursor-pointer">
                    <div className="text-sm px-3 py-2 border border-slate-300 rounded-md hover:bg-slate-50 text-center">
                      {isUploading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : 'Alege imagine'}
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploading} />
                  </label>
                  <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="is_active" className="text-slate-700 dark:text-slate-300">Activ</Label>
                <Switch id="is_active" checked={formData.is_active} onCheckedChange={(value) => handleChange('is_active', value)} />
            </div>
          </div>
          <DialogFooter className="mt-4 p-4 border-t border-slate-200 dark:border-slate-700">
            <DialogClose asChild><Button type="button" variant="outline">Anulează</Button></DialogClose>
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvează Tip Sticlă
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function GlazingManager() {
  const [glazingTypes, setGlazingTypes] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGlazing, setEditingGlazing] = useState(null);
  const [glazingToDelete, setGlazingToDelete] = useState(null);

  const profileNameMap = useMemo(() => {
    const m = {};
    allProfiles.forEach(p => { m[p.id] = p.name; });
    return m;
  }, [allProfiles]);

  const fetchGlazingTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      const allGlazingTypes = await GlazingType.list('-created_date', 100);
      setGlazingTypes(allGlazingTypes);
    } catch (error) {
      console.error("Failed to fetch glazing types", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGlazingTypes();
    Profile.filter({}).then(data => setAllProfiles(data || [])).catch(() => setAllProfiles([]));
  }, [fetchGlazingTypes]);

  const handleSave = async (formData) => {
    if (editingGlazing) {
      await GlazingType.update(editingGlazing.id, formData);
    } else {
      await GlazingType.create(formData);
    }
    await fetchGlazingTypes();
    setIsFormOpen(false);
    setEditingGlazing(null);
  };
  
  const handleDelete = async () => {
    if (glazingToDelete) {
        await GlazingType.delete(glazingToDelete.id);
        await fetchGlazingTypes();
        setGlazingToDelete(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Management Tipuri Sticlă</h1>
        <Button onClick={() => { setEditingGlazing(null); setIsFormOpen(true); }} className="bg-green-600 hover:bg-green-700">
          <PlusCircle className="w-4 h-4 mr-2" /> Adaugă Tip Sticlă
        </Button>
      </div>

      <GlazingForm isOpen={isFormOpen} glazing={editingGlazing} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />
      
      <AlertDialog open={!!glazingToDelete} onOpenChange={() => setGlazingToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Ești sigur?</AlertDialogTitle>
                <AlertDialogDescription>
                    Acest tip de sticlă va fi șters definitiv.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Anulează</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Șterge</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <TableHead className="w-12"></TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300">Nume</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300">Foi Sticlă</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300">Grosime (mm)</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300">Valoare U</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300">Preț/m²</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300">Detalii</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300">Profile Compatibile</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300">Status</TableHead>
              <TableHead className="text-right text-slate-700 dark:text-slate-300">Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="text-center p-8"><Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" /></TableCell></TableRow>
            ) : glazingTypes.length > 0 ? (
              glazingTypes.map((glazing) => (
                <TableRow key={glazing.id} className="border-slate-200 dark:border-slate-700">
                  <TableCell>
                    <div className="w-10 h-10 rounded overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 flex items-center justify-center">
                      <img 
                        src={glazing.image_url || '/glass_default.png'} 
                        alt={glazing.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = '/glass_default.png'; }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">{glazing.name}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{glazing.panes_count}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{glazing.thickness ?? '—'} mm</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{glazing.u_value}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {(glazing.price_per_sqm || 0).toFixed(2)} €/m²
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400 max-w-[200px]">
                    {glazing.features && glazing.features.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {glazing.features.map((f, i) => (
                          <Badge key={i} variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">{f}</Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400 max-w-[180px]">
                    {Array.isArray(glazing.compatible_profiles) && glazing.compatible_profiles.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {glazing.compatible_profiles.map((pid) => (
                          <Badge key={pid} variant="outline" className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200">
                            {profileNameMap[pid] || pid}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                      <Badge variant={glazing.is_active ? 'default' : 'destructive'} className={glazing.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {glazing.is_active ? 'Activ' : 'Inactiv'}
                      </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => {setEditingGlazing(glazing); setIsFormOpen(true)}}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => setGlazingToDelete(glazing)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow><TableCell colSpan={10} className="text-center p-8 text-slate-500 dark:text-slate-400">Nu s-au găsit tipuri de sticlă.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}