import React, { useEffect, useState, useCallback } from "react";
import { PresetDimension } from "@/entities/PresetDimension";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, PlusCircle, Edit, Trash2, Scaling, Save } from "lucide-react";

function PresetForm({ isOpen, onOpenChange, onSave, editing }) {
  // NO early returns; hooks always run
  const [form, setForm] = useState({
    name: "",
    category: "all",
    width: 1000,
    height: 1000,
    is_active: true
  });
  const [saving, setSaving] = useState(false);
  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name || "",
        category: editing.category || "all",
        width: editing.width ?? 1000,
        height: editing.height ?? 1000,
        is_active: editing.is_active ?? true
      });
    } else {
      setForm({
        name: "",
        category: "all",
        width: 1000,
        height: 1000,
        is_active: true
      });
    }
  }, [editing, isOpen]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      ...form,
      width: parseInt(String(form.width || 0), 10),
      height: parseInt(String(form.height || 0), 10)
    });
    setSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Editează dimensiune" : "Adaugă dimensiune"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-6">
          <div className="space-y-2">
            <Label>Denumire</Label>
            <Input value={form.name} onChange={e => setField("name", e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categorie</Label>
              <Select value={form.category} onValueChange={v => setField("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate</SelectItem>
                  <SelectItem value="ferestre">Ferestre</SelectItem>
                  <SelectItem value="usi">Uși</SelectItem>
                  <SelectItem value="usi-balcon">Uși balcon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Activ</Label>
              <div className="border rounded px-3 py-2 text-sm bg-slate-50">{form.is_active ? "Da" : "Nu"}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Lățime (mm)</Label>
              <Input type="number" value={form.width} onChange={e => setField("width", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Înălțime (mm)</Label>
              <Input type="number" value={form.height} onChange={e => setField("height", e.target.value)} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Anulează</Button>
            <Button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Salvează
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function PresetDimensionManager() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [toDelete, setToDelete] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const list = await PresetDimension.list("-updated_date", 500);
    setRows(list || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    if (editing?.id) await PresetDimension.update(editing.id, data);
    else await PresetDimension.create(data);
    setFormOpen(false);
    setEditing(null);
    await load();
  };

  const requestDelete = (row) => { setToDelete(row); setDeleteOpen(true); };
  const doDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    await PresetDimension.delete(toDelete.id);
    setDeleting(false);
    setDeleteOpen(false);
    setToDelete(null);
    await load();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Dimensiuni predefinite</h1>
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => { setEditing(null); setFormOpen(true); }}>
          <PlusCircle className="w-4 h-4 mr-2" /> Adaugă
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Se încarcă datele...
        </div>
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nume</TableHead>
                <TableHead>Categorie</TableHead>
                <TableHead>Lățime</TableHead>
                <TableHead>Înălțime</TableHead>
                <TableHead className="text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.id}>
                  <TableCell className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-green-50 border flex items-center justify-center">
                      <Scaling className="w-4 h-4 text-green-700" />
                    </div>
                    <span className="font-medium">{row.name}</span>
                  </TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>{row.width} mm</TableCell>
                  <TableCell>{row.height} mm</TableCell>
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
                <TableRow><TableCell colSpan={5} className="text-center text-slate-500">Nu sunt dimensiuni încă.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <PresetForm
        isOpen={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSave}
        editing={editing}
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