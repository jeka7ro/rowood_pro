import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, PlusCircle, Edit, Trash2, Palette, Wrench } from "lucide-react";

// For this quick scaffold, we mock the DB calls until the entity is formally written
import { base44 } from "@/api/base44Client";

const HardwareOption = {
  list: async () => base44.get('/hardware_components'),
  create: async (data) => base44.post('/hardware_components', data),
  update: async (id, data) => base44.patch(`/hardware_components?id=eq.${id}`, data),
  delete: async (id) => base44.delete(`/hardware_components?id=eq.${id}`)
};

export default function HardwareManager() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [toDelete, setToDelete] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: "",
    type: "handle",
    hex_color: "#FFFFFF",
    cost_per_unit: 0,
    is_active: true
  });
  const [saving, setSaving] = useState(false);
  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Safely load or catch if table doesn't exist yet
      const { data } = await HardwareOption.list();
      setRows(data || []);
    } catch (e) {
      console.log("Hardware components table might not exist yet.", e);
      setRows([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name || "",
        type: editing.type || "handle",
        hex_color: editing.hex_color || "#FFFFFF",
        cost_per_unit: editing.cost_per_unit || 0,
        is_active: editing.is_active ?? true
      });
    } else {
      setForm({ name: "", type: "handle", hex_color: "#FFFFFF", cost_per_unit: 0, is_active: true });
    }
  }, [editing, formOpen]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, cost_per_unit: parseFloat(form.cost_per_unit) };
      if (editing?.id) await HardwareOption.update(editing.id, payload);
      else await HardwareOption.create(payload);
      setFormOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      alert("A apărut o eroare la salvare. Asigură-te că scriptul SQL a fost rulat în Supabase.");
    }
    setSaving(false);
  };

  const requestDelete = (row) => { setToDelete(row); setDeleteOpen(true); };
  const doDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    await HardwareOption.delete(toDelete.id);
    setDeleting(false);
    setDeleteOpen(false);
    setToDelete(null);
    await load();
  };

  const getTypeName = (t) => {
    switch(t) {
       case 'handle': return 'Mâner';
       case 'hinge': return 'Balamale';
       case 'lock': return 'Închidere';
       default: return t;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
           <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Wrench className="w-8 h-8 text-indigo-500" />
              Categorii Feronerie & Culori
           </h1>
           <p className="text-slate-500 text-sm mt-1">Gestionează mânerele, balamalele și culorile afișate în Configuratorul Avansat.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md" onClick={() => { setEditing(null); setFormOpen(true); }}>
          <PlusCircle className="w-4 h-4 mr-2" /> Adaugă Model/Culoare
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800">
                <TableHead>Denumire</TableHead>
                <TableHead>Tip Feronerie</TableHead>
                <TableHead>Culoare (Hex)</TableHead>
                <TableHead>Cost Suplimentar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">{row.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-slate-600">{getTypeName(row.type)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full border border-slate-300 shadow-sm" style={{ backgroundColor: row.hex_color || '#fff' }}></div>
                        <span className="text-xs text-slate-500 font-mono">{row.hex_color || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-700 dark:text-slate-300">{(row.cost_per_unit || 0).toFixed(2)} €</TableCell>
                  <TableCell>{row.is_active ? <Badge className="bg-green-100 text-green-800">Activ</Badge> : <Badge variant="secondary">Inactiv</Badge>}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditing(row); setFormOpen(true); }}>
                        <Edit className="w-4 h-4 text-slate-500" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => requestDelete(row)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <Palette className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    Baza de date este goală. Rulează mai întâi scriptul `supabase_migration_v1.sql` în Supabase!<br/>Apoi apasă butonul "Adaugă".
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* MODAL Adăugare / Editare */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-none shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <Wrench className="w-5 h-5 text-indigo-500" />
                {editing ? "Editează Feroneria" : "Adaugă Feronerie Nouă"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label>Denumire (ex: Mâner Secustik, Alb Mat)</Label>
              <Input value={form.name} onChange={e => setField("name", e.target.value)} required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label>Tip componentă</Label>
                <Select value={form.type} onValueChange={v => setField("type", v)}>
                    <SelectTrigger>
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="handle">Mâner</SelectItem>
                    <SelectItem value="hinge">Balamale</SelectItem>
                    <SelectItem value="lock">Închidere</SelectItem>
                    </SelectContent>
                </Select>
                </div>
                
                <div className="space-y-2">
                    <Label>Culoare (Cod Hexazecimal)</Label>
                    <div className="flex items-center gap-2">
                        <Input type="color" className="w-12 h-10 p-1 bg-white dark:bg-slate-800" value={form.hex_color} onChange={e => setField("hex_color", e.target.value)} />
                        <Input type="text" value={form.hex_color} onChange={e => setField("hex_color", e.target.value)} placeholder="#FFFFFF" className="font-mono text-sm uppercase" />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
              <Label>Supra-Cost (€) — adaos peste prețul de bază</Label>
              <Input type="number" step="0.01" value={form.cost_per_unit} onChange={e => setField("cost_per_unit", e.target.value)} />
            </div>

            <div className="flex items-center justify-between mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
               <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Activ în Configurator</p>
                  <p className="text-xs text-slate-500">Apare ca opțiune pentru client</p>
               </div>
               <Switch checked={!!form.is_active} onCheckedChange={v => setField("is_active", v)} />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Anulează</Button>
              <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Salvează
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Doriti stergerea definitivă?</AlertDialogTitle>
            <AlertDialogDescription>Această acțiune va șterge "{toDelete?.name}" din catalogul curent.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Renunță</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-red-600 hover:bg-red-700 rounded-xl" disabled={deleting}>
              {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2"/>} Confirm Ștergerea
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
