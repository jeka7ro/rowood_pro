import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, Plus, X } from "lucide-react";

function groupByCategory(list) {
  const map = {};
  (list || []).forEach((item) => {
    const key = item.category || "altele";
    if (!map[key]) map[key] = [];
    map[key].push(item);
  });
  return map;
}

export default function AccessorySelector({ accessories = [], config, addAccessory, removeAccessory }) {
  const selectedIds = Array.isArray(config?.accessories) ? config.accessories : [];
  const grouped = groupByCategory(accessories);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Wrench className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Accesorii disponibile</h3>
      </div>

      {Object.keys(grouped).length === 0 && (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <CardContent className="py-6 text-slate-500 dark:text-slate-400">
            Momentan nu sunt accesorii disponibile pentru acest produs.
          </CardContent>
        </Card>
      )}

      <div className="space-y-8">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">{category.replaceAll("-", " ")}</Badge>
              <span className="text-slate-500 dark:text-slate-400 text-sm">({items.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((acc) => {
                const isSelected = selectedIds.includes(acc.id);
                return (
                  <Card 
                    key={acc.id} 
                    className={`border-2 rounded-3xl overflow-hidden transition-all ${
                      isSelected 
                        ? "border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/20" 
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-slate-900 dark:text-slate-100">{acc.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {acc.image_url && (
                        <div className="h-28 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <img src={acc.image_url} alt={acc.name} className="h-full w-full object-cover" />
                        </div>
                      )}
                      {acc.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">{acc.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {Number(acc.price || 0).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                        </span>
                        {!isSelected ? (
                          <Button size="sm" onClick={() => addAccessory(acc.id)} className="gap-1 bg-green-600 hover:bg-green-700 rounded-xl">
                            <Plus className="w-4 h-4" /> Adaugă
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => removeAccessory(acc.id)} className="gap-1 rounded-xl border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                            <X className="w-4 h-4" /> Elimină
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}