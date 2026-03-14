
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";

export default function MultiSelectPicker({ label, items = [], selected = [], onChange, placeholder = "Selectează...", className = "" }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(i =>
      (i.name || "").toLowerCase().includes(q) ||
      (i.subtitle || "").toLowerCase().includes(q)
    );
  }, [items, query]);

  const toggle = (id) => {
    const set = new Set(selected || []);
    set.has(id) ? set.delete(id) : set.add(id);
    onChange && onChange(Array.from(set));
  };

  const clearAll = () => onChange && onChange([]);

  return (
    <div className={className}>
      {label && <div className="mb-2 text-sm font-medium text-slate-700">{label}</div>}
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-between w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <span className="truncate mr-2">
              {selected?.length ? `${selected.length} selectate` : placeholder}
            </span>
            <ChevronDown className="w-4 h-4 opacity-70" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-3 z-[1100] max-h-[70vh] overflow-auto"
          align="start"
          side="bottom"
          sideOffset={6}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => { e.stopPropagation(); setOpen(false); }}
          onPointerDownOutside={(e) => { e.preventDefault(); }}    // keep popover open inside Dialogs
          onInteractOutside={(e) => { e.preventDefault(); }}      // avoid instant close
        >
          <div
            className="space-y-3"
            onMouseDownCapture={(e) => e.stopPropagation()}
            onTouchStartCapture={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Caută..." />
            <div className="max-h-60 overflow-auto space-y-2 pr-1">
              {filtered.map((i) => (
                <label key={i.id} className="flex items-center gap-3 cursor-pointer">
                  <Checkbox checked={selected?.includes(i.id)} onCheckedChange={() => toggle(i.id)} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{i.name}</div>
                    {i.subtitle && <div className="text-xs text-slate-500">{i.subtitle}</div>}
                  </div>
                  {i.badge && <Badge variant="secondary">{i.badge}</Badge>}
                </label>
              ))}
              {filtered.length === 0 && <div className="text-sm text-slate-500">Niciun rezultat.</div>}
            </div>
            <div className="flex justify-between">
              <Button type="button" variant="ghost" onClick={clearAll}>Golește</Button>
              <Button type="button" onClick={() => setOpen(false)}>Închide</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {selected?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selected.slice(0, 6).map(id => {
            const it = items.find(x => x.id === id);
            return <Badge key={id} variant="secondary" className="text-xs">{it?.name || id}</Badge>;
          })}
          {selected.length > 6 && <Badge variant="outline" className="text-xs">+{selected.length - 6}</Badge>}
        </div>
      )}
    </div>
  );
}
