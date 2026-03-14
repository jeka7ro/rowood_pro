import React, { useState, useEffect, useCallback } from 'react';
import { GlazingType } from '@/entities/GlazingType';
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
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function GlazingForm({ isOpen, onSave, onCancel, glazing }) {
  const [formData, setFormData] = useState(
    glazing || {
      name: '',
      panes_count: 2,
      thickness: 24,
      u_value: 1.1,
      price_per_sqm: 0,
      features: [],
      is_active: true,
    }
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Reset form data when `glazing` prop changes (e.g., when editing a different item or adding a new one)
    setFormData(glazing || {
      name: '',
      panes_count: 2,
      thickness: 24,
      u_value: 1.1,
      price_per_sqm: 0,
      features: [],
      is_active: true,
    });
  }, [glazing]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
      <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">{glazing ? 'Editează Tip Sticlă' : 'Adaugă Tip Sticlă Nou'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave}>
          <div className="space-y-4 p-4">
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
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGlazing, setEditingGlazing] = useState(null);
  const [glazingToDelete, setGlazingToDelete] = useState(null);

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
              <TableHead className="text-slate-700 dark:text-slate-300">Nume</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300">Foi Sticlă</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300">Grosime (mm)</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300">Valoare U</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300">Preț/m²</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300">Detalii</TableHead>
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
                <TableRow><TableCell colSpan={8} className="text-center p-8 text-slate-500 dark:text-slate-400">Nu s-au găsit tipuri de sticlă.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}