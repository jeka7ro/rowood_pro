
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { PromotionEvent } from "@/entities/PromotionEvent";
import { Product } from "@/entities/Product";
import { Material } from "@/entities/Material";
import { SubMaterial } from "@/entities/SubMaterial";
import { Color } from "@/entities/Color";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import MultiSelectPicker from "@/components/admin/MultiSelectPicker";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, Percent, Calendar, Eye, EyeOff } from "lucide-react";

function ItemDiscountRow({ row, onChange, products, materials, subMaterials, colors, onRemove }) {
  const [scope, setScope] = useState(row.scope || "product");
  const [itemId, setItemId] = useState(row.item_id || "");
  const [p, setP] = useState(row.discount_percent || 0);
  const [f, setF] = useState(row.discount_fixed || 0);

  useEffect(() => {
    onChange && onChange({ scope, item_id: itemId, discount_percent: Number(p) || 0, discount_fixed: Number(f) || 0 });
  }, [scope, itemId, p, f, onChange]); // eslint-disable-line

  const source = scope === "product" ? products
    : scope === "material" ? materials
    : scope === "sub_material" ? subMaterials
    : colors;

  return (
    <div className="grid md:grid-cols-6 gap-3 items-end">
      <div className="md:col-span-2">
        <Label>Tip</Label>
        <select className="w-full border rounded px-3 py-2" value={scope} onChange={(e) => { setScope(e.target.value); setItemId(""); }}>
          <option value="product">Produs</option>
          <option value="material">Material</option>
          <option value="sub_material">Tip lemn</option>
          <option value="color">Culoare</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <Label>Element</Label>
        <select className="w-full border rounded px-3 py-2" value={itemId} onChange={(e) => setItemId(e.target.value)}>
          <option value="">Alege...</option>
          {source.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
      </div>
      <div>
        <Label>%</Label>
        <Input type="number" step="0.1" value={p} onChange={(e) => setP(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <Label>€ fix</Label>
          <Input type="number" step="0.01" value={f} onChange={(e) => setF(e.target.value)} />
        </div>
        <Button type="button" variant="destructive" onClick={onRemove} className="self-end">Șterge</Button>
      </div>
    </div>
  );
}

function PromotionForm({ isOpen, onOpenChange, onSave, editing, dataSources }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    is_active: true,
    show_on_homepage: false,
    priority_order: 100,
    selected_products: [],
    selected_materials: [],
    selected_sub_materials: [],
    selected_colors: [],
    global_discount_percent: 0,
    global_discount_fixed: 0,
    item_discounts: [],
    banner_image_url: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(editing ? {
      name: editing.name || "",
      description: editing.description || "",
      start_date: editing.start_date || "",
      end_date: editing.end_date || "",
      is_active: editing.is_active ?? true,
      show_on_homepage: editing.show_on_homepage ?? false,
      priority_order: editing.priority_order ?? 100,
      selected_products: editing.selected_products || [],
      selected_materials: editing.selected_materials || [],
      selected_sub_materials: editing.selected_sub_materials || [],
      selected_colors: editing.selected_colors || [],
      global_discount_percent: editing.global_discount_percent ?? 0,
      global_discount_fixed: editing.global_discount_fixed ?? 0,
      item_discounts: editing.item_discounts || [],
      banner_image_url: editing.banner_image_url || ""
    } : {
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      is_active: true,
      show_on_homepage: false,
      priority_order: 100,
      selected_products: [],
      selected_materials: [],
      selected_sub_materials: [],
      selected_colors: [],
      global_discount_percent: 0,
      global_discount_fixed: 0,
      item_discounts: [],
      banner_image_url: ""
    });
  }, [editing, isOpen]);

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const addRow = () => setField("item_discounts", [...(form.item_discounts || []), { scope: "product", item_id: "", discount_percent: 0, discount_fixed: 0 }]);
  const updateRow = (idx, row) => {
    const arr = [...(form.item_discounts || [])];
    arr[idx] = row;
    setField("item_discounts", arr);
  };
  const removeRow = (idx) => {
    const arr = [...(form.item_discounts || [])];
    arr.splice(idx, 1);
    setField("item_discounts", arr);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      ...form,
      priority_order: parseInt(String(form.priority_order || 100), 10) || 100,
      global_discount_percent: Number(form.global_discount_percent || 0),
      global_discount_fixed: Number(form.global_discount_fixed || 0)
    });
    setSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto overscroll-contain p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{editing ? "Editează promoție" : "Adaugă promoție"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-6 px-6 pb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nume</Label>
              <Input value={form.name} onChange={(e) => setField("name", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Prioritate</Label>
              <Input type="number" value={form.priority_order} onChange={(e) => setField("priority_order", e.target.value)} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Descriere</Label>
              <Input value={form.description} onChange={(e) => setField("description", e.target.value)} />
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Start</Label>
              <Input type="date" value={form.start_date} onChange={(e) => setField("start_date", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Final</Label>
              <Input type="date" value={form.end_date} onChange={(e) => setField("end_date", e.target.value)} required />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={!!form.is_active} onCheckedChange={(v) => setField("is_active", v)} />
              <span>Activă</span>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={!!form.show_on_homepage} onCheckedChange={(v) => setField("show_on_homepage", v)} />
              <span>Afișează pe prima pagină</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <MultiSelectPicker
              label="Produse"
              items={dataSources.products.map(p => ({ id: p.id, name: p.name, subtitle: p.category }))}
              selected={form.selected_products}
              onChange={(v) => setField("selected_products", v)}
            />
            <MultiSelectPicker
              label="Materiale"
              items={dataSources.materials.map(m => ({ id: m.id, name: m.name }))}
              selected={form.selected_materials}
              onChange={(v) => setField("selected_materials", v)}
            />
            <MultiSelectPicker
              label="Tipuri de lemn"
              items={dataSources.subMaterials.map(sm => ({ id: sm.id, name: sm.name, subtitle: dataSources.materials.find(m => m.id === sm.parent_material_id)?.name }))}
              selected={form.selected_sub_materials}
              onChange={(v) => setField("selected_sub_materials", v)}
            />
            <MultiSelectPicker
              label="Culori"
              items={dataSources.colors.map(c => ({ id: c.id, name: c.name, subtitle: c.ral_code ? `RAL ${c.ral_code}` : "" }))}
              selected={form.selected_colors}
              onChange={(v) => setField("selected_colors", v)}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Percent className="w-4 h-4" /> Discount global</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>% pentru toate</Label>
                <Input type="number" step="0.1" value={form.global_discount_percent} onChange={(e) => setField("global_discount_percent", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>€ fix pe articol</Label>
                <Input type="number" step="0.01" value={form.global_discount_fixed} onChange={(e) => setField("global_discount_fixed", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Banner (URL imagine)</Label>
                <Input placeholder="https://..." value={form.banner_image_url} onChange={(e) => setField("banner_image_url", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Discounturi specifice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(form.item_discounts || []).map((r, idx) => (
                <ItemDiscountRow
                  key={idx}
                  row={r}
                  onChange={(row) => updateRow(idx, row)}
                  products={dataSources.products}
                  materials={dataSources.materials}
                  subMaterials={dataSources.subMaterials}
                  colors={dataSources.colors}
                  onRemove={() => removeRow(idx)}
                />
              ))}
              <Button type="button" variant="outline" onClick={addRow}>
                Adaugă rând discount
              </Button>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Anulează</Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={saving}>
              {saving ? "Se salvează..." : "Salvează promoția"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function PromotionManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [sources, setSources] = useState({ products: [], materials: [], subMaterials: [], colors: [] });
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, mats, subs, cols, promos] = await Promise.all([
        Product.list(), Material.list(), SubMaterial.list(), Color.list(), PromotionEvent.list("priority_order")
      ]);
      setSources({ products: prods || [], materials: mats || [], subMaterials: subs || [], colors: cols || [] });
      setItems(promos || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const computeStatus = (p) => {
    const now = new Date().toISOString().slice(0,10);
    if (!p.is_active) return "inactivă";
    if (p.start_date > now) return "viitoare";
    if (p.end_date < now) return "expirată";
    return "activă";
  };

  const filtered = useMemo(() => {
    return (items || [])
      .filter(p => statusFilter === "all" || computeStatus(p) === statusFilter)
      .filter(p => (p.name || "").toLowerCase().includes(search.trim().toLowerCase()))
      .sort((a,b) => (a.priority_order ?? 100) - (b.priority_order ?? 100));
  }, [items, statusFilter, search]);

  const onSave = async (data) => {
    if (editing) await PromotionEvent.update(editing.id, data);
    else await PromotionEvent.create(data);
    setIsFormOpen(false);
    setEditing(null);
    loadAll();
  };

  const onDelete = async () => {
    if (!toDelete) return;
    await PromotionEvent.delete(toDelete.id);
    setToDelete(null);
    loadAll();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Percent className="w-6 h-6 text-green-600" /> Promoții</h1>
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => { setEditing(null); setIsFormOpen(true); }}>
          <PlusCircle className="w-4 h-4 mr-2" /> Adaugă promoție
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtre</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>Stare</Label>
            <select className="mt-2 w-full border rounded px-3 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Toate</option>
              <option value="activă">Active</option>
              <option value="viitoare">Viitoare</option>
              <option value="expirată">Expirate</option>
              <option value="inactivă">Inactive</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <Label>Căutare</Label>
            <Input className="mt-2" placeholder="Caută după nume..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evenimente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nume</TableHead>
                  <TableHead>Perioadă</TableHead>
                  <TableHead>Stare</TableHead>
                  <TableHead>Global</TableHead>
                  <TableHead>Afișare</TableHead>
                  <TableHead className="text-right">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs text-slate-500">Ordine: {p.priority_order ?? 100}</div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{p.start_date} — {p.end_date}</TableCell>
                    <TableCell>
                      <Badge className={
                        computeStatus(p) === "activă" ? "bg-green-100 text-green-800" :
                        computeStatus(p) === "viitoare" ? "bg-blue-100 text-blue-800" :
                        computeStatus(p) === "expirată" ? "bg-slate-200 text-slate-800" : "bg-amber-100 text-amber-800"
                      }>
                        {computeStatus(p)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {p.global_discount_percent || p.global_discount_fixed
                        ? <div className="text-sm">
                            {p.global_discount_percent ? <div>-{p.global_discount_percent}%</div> : null}
                            {p.global_discount_fixed ? <div>-€{p.global_discount_fixed}</div> : null}
                          </div>
                        : <span className="text-xs text-slate-500">—</span>}
                    </TableCell>
                    <TableCell>
                      {p.show_on_homepage ? <Badge className="bg-green-100 text-green-800"><Eye className="w-3 h-3 mr-1" /> Homepage</Badge>
                        : <Badge variant="secondary"><EyeOff className="w-3 h-3 mr-1" /> Ascuns</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditing(p); setIsFormOpen(true); }}>
                          <Edit className="w-4 h-4 mr-1" /> Editează
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setToDelete(p)}>
                          <Trash2 className="w-4 h-4 mr-1" /> Șterge
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500">Nu există promoții pentru filtrul curent.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <PromotionForm
        isOpen={isFormOpen}
        onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditing(null); }}
        onSave={onSave}
        editing={editing}
        dataSources={sources}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmă ștergerea</AlertDialogTitle>
            <AlertDialogDescription>Sigur vrei să ștergi promoția „{toDelete?.name}”?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">Șterge</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
