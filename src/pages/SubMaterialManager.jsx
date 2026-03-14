import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, Loader2, Layers, Upload, X } from "lucide-react";
import { SubMaterial } from "@/entities/SubMaterial";
import { Material } from "@/entities/Material";
import { UploadFile } from "@/integrations/Core";

function SubMaterialForm({ isOpen, onOpenChange, onSave, subMaterial, materials }) {
  const [formData, setFormData] = useState({
    name: "",
    parent_material_id: "",
    image_url: "",
    price_multiplier: 1.0,
    price_per_sqm: 0,
    is_active: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState("");

  useEffect(() => {
    const initial = subMaterial ? {
      name: subMaterial.name || "",
      parent_material_id: subMaterial.parent_material_id || "",
      image_url: subMaterial.image_url || "",
      price_multiplier: subMaterial.price_multiplier ?? 1.0,
      price_per_sqm: subMaterial.price_per_sqm ?? 0,
      is_active: subMaterial.is_active ?? true
    } : {
      name: "",
      parent_material_id: "",
      image_url: "",
      price_multiplier: 1.0,
      price_per_sqm: 0,
      is_active: true
    };
    setFormData(initial);
    setTempImageUrl(initial.image_url || "");
  }, [subMaterial, isOpen]);

  const handleChange = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, image_url: file_url }));
      setTempImageUrl(file_url);
    } finally {
      setIsUploading(false);
    }
  };

  const applyExternalImage = () => {
    if (tempImageUrl?.trim()) {
      setFormData(prev => ({ ...prev, image_url: tempImageUrl.trim() }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave({
      ...formData,
      price_multiplier: parseFloat(String(formData.price_multiplier || 1)),
      price_per_sqm: parseFloat(String(formData.price_per_sqm || 0))
    });
    setIsSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">
            {subMaterial ? "Editează Sub-Material" : "Adaugă Sub-Material"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sm-name" className="text-slate-700 dark:text-slate-300">Nume</Label>
              <Input 
                id="sm-name" 
                value={formData.name} 
                onChange={(e) => handleChange("name", e.target.value)} 
                required 
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">Material părinte</Label>
              <div className="border rounded-xl p-4 space-y-2 max-h-64 overflow-y-auto bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                {materials.map((m) => (
                  <div key={m.id} className="flex items-center space-x-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <Checkbox
                      id={`mat-${m.id}`}
                      checked={formData.parent_material_id === m.id}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleChange("parent_material_id", m.id);
                        }
                      }}
                      className="border-slate-400 dark:border-slate-500"
                    />
                    <label
                      htmlFor={`mat-${m.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 text-slate-700 dark:text-slate-300"
                    >
                      {m.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sm-mult" className="text-slate-700 dark:text-slate-300">Multiplicator preț</Label>
              <Input 
                id="sm-mult" 
                type="number" 
                step="0.01" 
                min="0" 
                value={formData.price_multiplier}
                onChange={(e) => handleChange("price_multiplier", e.target.value)} 
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sm-pps" className="text-slate-700 dark:text-slate-300">Preț pe m² (EUR)</Label>
              <Input 
                id="sm-pps" 
                type="number" 
                step="0.01" 
                min="0" 
                value={formData.price_per_sqm}
                onChange={(e) => handleChange("price_per_sqm", e.target.value)} 
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-slate-700 dark:text-slate-300">Imagine textură</Label>
            {formData.image_url ? (
              <div className="relative w-32 h-32">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-md border border-slate-300 dark:border-slate-600"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={() => { handleChange("image_url", ""); setTempImageUrl(""); }}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <Upload className="w-4 h-4" />
                  <span>Încarcă imagine</span>
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                </label>
                <span className="text-xs text-slate-500 dark:text-slate-400">sau URL</span>
                <Input
                  placeholder="https://..."
                  value={tempImageUrl}
                  onChange={(e) => setTempImageUrl(e.target.value)}
                  className="max-w-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                />
                <Button type="button" variant="outline" onClick={applyExternalImage} className="border-slate-300 dark:border-slate-600">
                  Aplică
                </Button>
              </div>
            )}
            {isUploading && (
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Se încarcă...
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-300 dark:border-slate-600 p-3 bg-slate-50 dark:bg-slate-800">
            <div>
              <div className="font-medium text-slate-900 dark:text-slate-100">Activ</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Control vizibilitate în configurator</div>
            </div>
            <Switch checked={!!formData.is_active} onCheckedChange={(v) => handleChange("is_active", v)} />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-slate-300 dark:border-slate-600">
              Anulează
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-green-600 hover:bg-green-700">
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvează
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function SubMaterialManager() {
  const [items, setItems] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [subs, mats] = await Promise.all([SubMaterial.list("-updated_date", 500), Material.list()]);
    setItems(subs || []);
    setMaterials(mats || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openNew = () => { setEditing(null); setIsFormOpen(true); };
  const openEdit = (row) => { setEditing(row); setIsFormOpen(true); };

  const handleSave = async (data) => {
    if (editing?.id) {
      await SubMaterial.update(editing.id, data);
    } else {
      await SubMaterial.create(data);
    }
    setIsFormOpen(false);
    setEditing(null);
    await loadData();
  };

  const askDelete = (row) => { setToDelete(row); setDeleteOpen(true); };
  const doDelete = async () => {
    if (!toDelete) return;
    setIsDeleting(true);
    await SubMaterial.delete(toDelete.id);
    setIsDeleting(false);
    setDeleteOpen(false);
    setToDelete(null);
    await loadData();
  };

  const materialName = useCallback((id) => materials.find(m => m.id === id)?.name || "-", [materials]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Management Sub-Materiale</h1>
        <Button onClick={openNew} className="bg-green-600 hover:bg-green-700">
          <PlusCircle className="w-4 h-4 mr-2" /> Adaugă Sub-Material
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" /> Se încarcă datele...
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-slate-700">
                <TableHead className="text-slate-700 dark:text-slate-300">Nume</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Material părinte</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Multiplicator</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Preț/m²</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Status</TableHead>
                <TableHead className="text-right text-slate-700 dark:text-slate-300">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.id} className="border-slate-200 dark:border-slate-700">
                  <TableCell className="flex items-center gap-3">
                    {row.image_url ? (
                      <img src={row.image_url} alt={row.name} className="w-10 h-10 rounded object-cover border border-slate-300 dark:border-slate-600" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 flex items-center justify-center">
                        <Layers className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{row.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{row.id}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{materialName(row.parent_material_id)}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">x{(row.price_multiplier ?? 1).toFixed(2)}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{(row.price_per_sqm ?? 0).toFixed(2)} €</TableCell>
                  <TableCell>
                    {row.is_active ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Activ</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">Inactiv</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(row)} className="border-slate-300 dark:border-slate-600">
                        <Edit className="w-4 h-4 mr-1" /> Editează
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => askDelete(row)}>
                        <Trash2 className="w-4 h-4 mr-1" /> Șterge
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500 dark:text-slate-400">
                    Nu există sub-materiale încă.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <SubMaterialForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSave}
        subMaterial={editing}
        materials={materials}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-slate-100">Confirmare ștergere</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Ștergi "{toDelete?.name}"? Această acțiune nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-300 dark:border-slate-600">Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}