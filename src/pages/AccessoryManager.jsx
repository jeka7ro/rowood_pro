import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AccessoryOption } from "@/entities/AccessoryOption";
import { Product } from "@/entities/Product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Loader2, PlusCircle, Edit, Trash2, Wrench, Upload, Check } from "lucide-react";
import { UploadFile } from "@/integrations/Core";

function AccessoryForm({ isOpen, onOpenChange, onSave, editing, products }) {
  // NO early returns; hooks always run
  const [form, setForm] = useState({
    name: "",
    category: "maner",
    description: "",
    price: 0,
    image_url: "",
    compatible_products: [],
    is_required: false,
    is_active: true
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name || "",
        category: editing.category || "maner",
        description: editing.description || "",
        price: editing.price ?? 0,
        image_url: editing.image_url || "",
        compatible_products: Array.isArray(editing.compatible_products) ? editing.compatible_products : [],
        is_required: !!editing.is_required,
        is_active: editing.is_active ?? true
      });
    } else {
      setForm({
        name: "",
        category: "maner",
        description: "",
        price: 0,
        image_url: "",
        compatible_products: [],
        is_required: false,
        is_active: true
      });
    }
  }, [editing, isOpen]);

  const toggleProduct = (id) => {
    setForm(prev => {
      const set = new Set(prev.compatible_products || []);
      set.has(id) ? set.delete(id) : set.add(id);
      return { ...prev, compatible_products: Array.from(set) };
    });
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setField("image_url", file_url);
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      ...form,
      price: parseFloat(String(form.price || 0))
    });
    setSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">{editing ? "Editează accesoriu" : "Adaugă accesoriu"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">Nume</Label>
              <Input value={form.name} onChange={e => setField("name", e.target.value)} required className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">Categorie</Label>
              <Select value={form.category} onValueChange={v => setField("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="maner">Mâner</SelectItem>
                  <SelectItem value="yala">Yală</SelectItem>
                  <SelectItem value="balamale">Balamale</SelectItem>
                  <SelectItem value="praguri">Praguri</SelectItem>
                  <SelectItem value="izolatie">Izolație</SelectItem>
                  <SelectItem value="jaluzele">Jaluzele</SelectItem>
                  <SelectItem value="plase">Plase</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300">Descriere</Label>
            <Input value={form.description} onChange={e => setField("description", e.target.value)} className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">Preț (€)</Label>
              <Input type="number" step="0.01" value={form.price} onChange={e => setField("price", e.target.value)} className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">Imagine</Label>
              <div className="flex items-center gap-2">
                <Input value={form.image_url} onChange={e => setField("image_url", e.target.value)} placeholder="https://..." className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 cursor-pointer bg-white dark:bg-slate-700">
                  <Upload className="w-4 h-4" />
                  <input type="file" className="hidden" onChange={handleUpload} />
                  {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                </label>
              </div>
              {form.image_url && (
                <div className="mt-2">
                  <img src={form.image_url} alt="preview" className="h-20 w-20 object-cover rounded border" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300">Produse compatibile</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-44 overflow-auto p-2 border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-800">
              {products.map(p => {
                const active = (form.compatible_products || []).includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProduct(p.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded border text-sm ${active ? "bg-green-50 dark:bg-green-900/30 border-green-600 dark:border-green-600 text-slate-900 dark:text-slate-100" : "bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"}`}
                  >
                    <span className="truncate">{p.name}</span>
                    {active && <Check className="w-4 h-4 text-green-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-300 dark:border-slate-600 p-3 bg-slate-50 dark:bg-slate-800">
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">Obligatoriu</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Trebuie selectat</div>
              </div>
              <Switch checked={!!form.is_required} onCheckedChange={v => setField("is_required", v)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-300 dark:border-slate-600 p-3 bg-slate-50 dark:bg-slate-800">
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">Activ</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Vizibil în configurator</div>
              </div>
              <Switch checked={!!form.is_active} onCheckedChange={v => setField("is_active", v)} />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Anulează</Button>
            <Button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wrench className="w-4 h-4 mr-2" />}
              Salvează
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AccessoryManager() {
  const [rows, setRows] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [toDelete, setToDelete] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [list, plist] = await Promise.all([
      AccessoryOption.list("-updated_date", 500),
      Product.list("-name", 1000)
    ]);
    setRows(list || []);
    setProducts(plist || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    if (editing?.id) await AccessoryOption.update(editing.id, data);
    else await AccessoryOption.create(data);
    setFormOpen(false);
    setEditing(null);
    await load();
  };

  const requestDelete = (row) => { setToDelete(row); setDeleteOpen(true); };
  const doDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    await AccessoryOption.delete(toDelete.id);
    setDeleting(false);
    setDeleteOpen(false);
    setToDelete(null);
    await load();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Management Accesorii</h1>
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => { setEditing(null); setFormOpen(true); }}>
          <PlusCircle className="w-4 h-4 mr-2" /> Adaugă accesoriu
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
              <TableRow className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <TableHead className="text-slate-700 dark:text-slate-300">Accesoriu</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Categorie</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Preț</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Compatibilitate</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Status</TableHead>
                <TableHead className="text-right text-slate-700 dark:text-slate-300">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.id} className="border-slate-200 dark:border-slate-700">
                  <TableCell className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded border border-slate-300 dark:border-slate-600 overflow-hidden bg-slate-50 dark:bg-slate-800">
                      {row.image_url ? <img src={row.image_url} alt={row.name} className="h-full w-full object-cover" /> : <Wrench className="w-5 h-5 m-2 text-slate-400" />}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{row.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 max-w-[360px] truncate">{row.description}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{row.category}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{(row.price || 0).toFixed(2)} €</TableCell>
                  <TableCell>
                    {(row.compatible_products || []).length > 0
                      ? <Badge variant="secondary">{row.compatible_products.length} produse</Badge>
                      : <span className="text-slate-400">Toate</span>}
                  </TableCell>
                  <TableCell>{row.is_active ? <Badge className="bg-green-100 text-green-800">Activ</Badge> : <Badge variant="secondary">Inactiv</Badge>}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setEditing(row); setFormOpen(true); }}>
                        <Edit className="w-4 h-4 mr-1" /> Editează
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => requestDelete(row)}>
                        <Trash2 className="w-4 h-4 mr-1" /> Șterge
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-slate-500 dark:text-slate-400">Nu sunt accesorii încă.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <AccessoryForm
        isOpen={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSave}
        editing={editing}
        products={products}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmă ștergerea</AlertDialogTitle>
            <AlertDialogDescription>Ștergi “{toDelete?.name}”?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-red-600 hover:bg-red-700" disabled={deleting}>
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}