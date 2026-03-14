import React, { useEffect, useMemo, useState, useCallback } from "react";
import { InstallationCompany } from "@/entities/InstallationCompany";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, Globe, Wrench, MapPin, Loader2 } from "lucide-react";

const EU_COUNTRIES = [
  { code: "RO", name: "România" }, { code: "AT", name: "Austria" }, { code: "BE", name: "Belgia" }, { code: "BG", name: "Bulgaria" },
  { code: "HR", name: "Croația" }, { code: "CY", name: "Cipru" }, { code: "CZ", name: "Cehia" }, { code: "DK", name: "Danemarca" },
  { code: "EE", name: "Estonia" }, { code: "FI", name: "Finlanda" }, { code: "FR", name: "Franța" }, { code: "DE", name: "Germania" },
  { code: "GR", name: "Grecia" }, { code: "HU", name: "Ungaria" }, { code: "IE", name: "Irlanda" }, { code: "IT", name: "Italia" },
  { code: "LV", name: "Letonia" }, { code: "LT", name: "Lituania" }, { code: "LU", name: "Luxemburg" }, { code: "MT", name: "Malta" },
  { code: "NL", name: "Țările de Jos" }, { code: "PL", name: "Polonia" }, { code: "PT", name: "Portugalia" }, { code: "SK", name: "Slovacia" },
  { code: "SI", name: "Slovenia" }, { code: "ES", name: "Spania" }, { code: "SE", name: "Suedia" }
];

function MultiCountryPicker({ value = [], onChange }) {
  const toggle = (code) => {
    const s = new Set(value);
    s.has(code) ? s.delete(code) : s.add(code);
    onChange(Array.from(s));
  };
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-auto border rounded p-3">
      {EU_COUNTRIES.map(c => (
        <label key={c.code} className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={(value||[]).includes(c.code)} onCheckedChange={() => toggle(c.code)} />
          <span className="text-sm">{c.name}</span>
        </label>
      ))}
    </div>
  );
}

function CompanyForm({ isOpen, onOpenChange, onSave, editing }) {
  // Hooks declared once; no early return
  const [form, setForm] = useState({
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    website: "",
    address_street: "",
    address_city: "",
    address_postal_code: "",
    address_country: "",
    countries_served: [],
    regions_served: [],
    services: [],
    languages_spoken: [],
    certifications: [],
    average_cost_per_sqm: 0,
    notes: "",
    is_active: true,
    priority_order: 100
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        company_name: editing.company_name || "",
        contact_person: editing.contact_person || "",
        email: editing.email || "",
        phone: editing.phone || "",
        website: editing.website || "",
        address_street: editing.address_street || "",
        address_city: editing.address_city || "",
        address_postal_code: editing.address_postal_code || "",
        address_country: editing.address_country || "",
        countries_served: editing.countries_served || [],
        regions_served: editing.regions_served || [],
        services: editing.services || [],
        languages_spoken: editing.languages_spoken || [],
        certifications: editing.certifications || [],
        average_cost_per_sqm: editing.average_cost_per_sqm ?? 0,
        notes: editing.notes || "",
        is_active: editing.is_active ?? true,
        priority_order: editing.priority_order ?? 100
      });
    } else {
      setForm((prev) => ({ ...prev, countries_served: [], regions_served: [], services: [], languages_spoken: [], certifications: [] }));
    }
  }, [editing, isOpen]);

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const parseCommaList = (str) => (str || "").split(",").map(s => s.trim()).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      ...form,
      average_cost_per_sqm: parseFloat(String(form.average_cost_per_sqm || 0)),
      priority_order: parseInt(String(form.priority_order || 100), 10) || 100
    });
    setSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Editează companie de montaj" : "Adaugă companie de montaj"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nume companie</Label>
              <Input value={form.company_name} onChange={e => setField("company_name", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Persoană contact</Label>
              <Input value={form.contact_person} onChange={e => setField("contact_person", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setField("email", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input value={form.phone} onChange={e => setField("phone", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input value={form.website} onChange={e => setField("website", e.target.value)} />
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Stradă</Label>
              <Input value={form.address_street} onChange={e => setField("address_street", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Oraș</Label>
              <Input value={form.address_city} onChange={e => setField("address_city", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Cod poștal</Label>
              <Input value={form.address_postal_code} onChange={e => setField("address_postal_code", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Țară</Label>
              <Input value={form.address_country} onChange={e => setField("address_country", e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Țări deservite (UE)</Label>
            <MultiCountryPicker value={form.countries_served} onChange={(v) => setField("countries_served", v)} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Regiuni (listă separată prin virgulă)</Label>
              <Input value={(form.regions_served || []).join(", ")} onChange={e => setField("regions_served", parseCommaList(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Servicii (listă separată prin virgulă)</Label>
              <Input value={(form.services || []).join(", ")} onChange={e => setField("services", parseCommaList(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Limbi vorbite (listă separată prin virgulă)</Label>
              <Input value={(form.languages_spoken || []).join(", ")} onChange={e => setField("languages_spoken", parseCommaList(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Certificări (listă separată prin virgulă)</Label>
              <Input value={(form.certifications || []).join(", ")} onChange={e => setField("certifications", parseCommaList(e.target.value))} />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Cost mediu (~ €/m²)</Label>
              <Input type="number" step="0.01" value={form.average_cost_per_sqm} onChange={e => setField("average_cost_per_sqm", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Prioritate listare</Label>
              <Input type="number" value={form.priority_order} onChange={e => setField("priority_order", e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={!!form.is_active} onCheckedChange={v => setField("is_active", v)} />
              <span>Activ</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Note</Label>
            <Input value={form.notes} onChange={e => setField("notes", e.target.value)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Anulează</Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={saving}>
              {saving ? "Se salvează..." : "Salvează"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function InstallationCompanyManager() {
  // Hooks first; no early return
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterCountry, setFilterCountry] = useState("all");
  const [search, setSearch] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await InstallationCompany.list("priority_order");
      setItems(list || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    return (items || [])
      .filter(i => filterCountry === "all" || (i.countries_served || []).includes(filterCountry))
      .filter(i => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          (i.company_name || "").toLowerCase().includes(q) ||
          (i.contact_person || "").toLowerCase().includes(q) ||
          (i.address_city || "").toLowerCase().includes(q) ||
          (i.address_country || "").toLowerCase().includes(q)
        );
      })
      .sort((a,b) => (a.priority_order ?? 100) - (b.priority_order ?? 100));
  }, [items, filterCountry, search]);

  const onSave = async (data) => {
    if (editing) {
      await InstallationCompany.update(editing.id, data);
    } else {
      await InstallationCompany.create(data);
    }
    setIsFormOpen(false);
    setEditing(null);
    load();
  };

  const onDelete = async () => {
    if (!toDelete) return;
    await InstallationCompany.delete(toDelete.id);
    setToDelete(null);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wrench className="w-6 h-6 text-green-600" /> Companii de Montaj (UE)
        </h1>
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => { setEditing(null); setIsFormOpen(true); }}>
          <PlusCircle className="w-4 h-4 mr-2" /> Adaugă companie
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtre</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>Țară</Label>
            <Select value={filterCountry} onValueChange={setFilterCountry}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Alege țara" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate</SelectItem>
                {EU_COUNTRIES.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Căutare</Label>
            <Input className="mt-2" placeholder="Caută după nume, persoană, oraș..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lista companiilor</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-3 text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin" /> Se încarcă...
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Companie</TableHead>
                    <TableHead>Țări</TableHead>
                    <TableHead>Adresă</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Acțiuni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="font-semibold">{c.company_name}</div>
                        <div className="text-xs text-slate-500">Prioritate: {c.priority_order ?? 100} • {c.is_active ? "Activ" : "Inactiv"}</div>
                        {c.website && <div className="text-xs text-blue-600 truncate max-w-[220px]"><a href={c.website} target="_blank" rel="noreferrer">{c.website}</a></div>}
                      </TableCell>
                      <TableCell className="min-w-[220px]">
                        <div className="flex flex-wrap gap-1">
                          {(c.countries_served || []).map(code => {
                            const nm = EU_COUNTRIES.find(x => x.code === code)?.name || code;
                            return <Badge key={code} variant="secondary">{nm}</Badge>;
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[220px]">
                        <div className="text-sm">
                          {c.address_street && <div>{c.address_street}</div>}
                          {(c.address_city || c.address_postal_code) && <div>{c.address_postal_code ? `${c.address_postal_code} ` : ""}{c.address_city}</div>}
                          {c.address_country && <div className="text-slate-500">{c.address_country}</div>}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[220px]">
                        <div className="text-sm">
                          {c.contact_person && <div>{c.contact_person}</div>}
                          {c.email && <div className="text-xs text-slate-600">{c.email}</div>}
                          {c.phone && <div className="text-xs text-slate-600">{c.phone}</div>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => { setEditing(c); setIsFormOpen(true); }}>
                            <Edit className="w-4 h-4 mr-1" /> Editează
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => setToDelete(c)}>
                            <Trash2 className="w-4 h-4 mr-1" /> Șterge
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-500">Nu există companii pentru filtrul curent.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CompanyForm
        isOpen={isFormOpen}
        onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditing(null); }}
        onSave={onSave}
        editing={editing}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmă ștergerea</AlertDialogTitle>
            <AlertDialogDescription>
              Ești sigur că vrei să ștergi compania „{toDelete?.company_name}”?
            </AlertDialogDescription>
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