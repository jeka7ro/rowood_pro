import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Save, 
  AlertTriangle, 
  CheckCircle2, 
  Coins, 
  Layers, 
  GlassWater, 
  Settings2, 
  Palette, 
  Box,
  Search,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

const ENTITIES = {
  PROFILE: 'Profile',
  GLAZING: 'GlazingType',
  MECHANISM: 'MechanismType',
  COLOR: 'Color',
  MATERIAL: 'Material'
};

export default function PricingCenter() {
  const [data, setData] = useState({
    profiles: [],
    glazingTypes: [],
    mechanisms: [],
    colors: [],
    materials: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('summary');

  // Track modified items to show a "Save All" button or individual save states
  const [modifiedItems, setModifiedItems] = useState({}); // { 'entity_id': { ...data } }

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [profiles, glazing, mechanisms, colors, materials] = await Promise.all([
        base44.entities.Profile.list(),
        base44.entities.GlazingType.list(),
        base44.entities.MechanismType.list(),
        base44.entities.Color.list(),
        base44.entities.Material.list()
      ]);

      setData({
        profiles: profiles || [],
        glazingTypes: glazing || [],
        mechanisms: mechanisms || [],
        colors: colors || [],
        materials: materials || []
      });
    } catch (error) {
      console.error("Failed to fetch pricing data:", error);
      toast.error("Eroare la încărcarea prețurilor");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePriceChange = (entity, id, field, value) => {
    const numValue = parseFloat(value) || 0;
    
    // Update local state for immediate feedback
    setData(prev => ({
      ...prev,
      [entity]: prev[entity].map(item => item.id === id ? { ...item, [field]: numValue } : item)
    }));

    // Mark as modified
    setModifiedItems(prev => ({
      ...prev,
      [`${entity}_${id}`]: { entity, id, field, value: numValue }
    }));
  };

  const handleBulkUpdate = (entityKey, priceField, value) => {
    const numValue = parseFloat(value) || 0;
    const items = data[entityKey];
    
    if (items.length === 0) return;

    // Update local data for feedback
    setData(prev => ({
      ...prev,
      [entityKey]: prev[entityKey].map(item => ({ ...item, [priceField]: numValue }))
    }));

    // Mark all as modified
    setModifiedItems(prev => {
      const next = { ...prev };
      items.forEach(item => {
        next[`${entityKey}_${item.id}`] = { entity: entityKey, id: item.id, field: priceField, value: numValue };
      });
      return next;
    });
    
    toast.info(`S-a aplicat prețul ${numValue} € pentru toate cele ${items.length} elemente din categoria ${entityKey}. Nu uita să salvezi.`);
  };

  const saveAllForCategory = async (entityKey) => {
    const keysToSave = Object.keys(modifiedItems).filter(key => key.startsWith(`${entityKey}_`));
    if (keysToSave.length === 0) return;

    setIsSaving(true);
    try {
      const entityName = ENTITIES[entityKey.toUpperCase().replace('S', '')] || entityKey;
      
      // Perform updates in parallel
      await Promise.all(keysToSave.map(key => {
        const mod = modifiedItems[key];
        return base44.entities[entityName].update(mod.id, { [mod.field]: mod.value });
      }));

      setModifiedItems(prev => {
        const next = { ...prev };
        keysToSave.forEach(key => delete next[key]);
        return next;
      });
      toast.success(`S-au salvat ${keysToSave.length} elemente în categoria ${entityKey}`);
    } catch (error) {
      console.error("Bulk save error:", error);
      toast.error("Eroare la salvarea în masă");
    } finally {
      setIsSaving(false);
    }
  };

  const saveItem = async (entityKey, id) => {
    const key = `${entityKey}_${id}`;
    const modification = modifiedItems[key];
    if (!modification) return;

    setIsSaving(true);
    try {
      const entityName = ENTITIES[entityKey.toUpperCase().replace('S', '')] || entityKey;
      
      await base44.entities[entityName].update(id, { [modification.field]: modification.value });
      
      setModifiedItems(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      toast.success("Preț actualizat");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Eroare la salvare");
    } finally {
      setIsSaving(false);
    }
  };

  const missingPrices = useMemo(() => {
    const missing = [];
    
    // Profiles
    data.profiles.forEach(p => { 
      // Price check
      if (!p.price_per_linear_meter) {
        missing.push({ ...p, type: 'Profile', field: 'price_per_linear_meter', category: 'profiles', reason: 'Preț lipsă', severity: 'error' }); 
      }
      
      // Configuration Blockers
      if (!p.compatible_materials || p.compatible_materials.length === 0) {
        missing.push({ ...p, type: 'Profile', field: 'compatible_materials', category: 'profiles', reason: 'Fără materiale compatibile (Blochează configuratorul)', severity: 'critical' });
      }
      if (!p.default_glazing_id && (!p.product_specific_pricing || p.product_specific_pricing.length === 0)) {
        missing.push({ ...p, type: 'Profile', field: 'default_glazing_id', category: 'profiles', reason: 'Fără sticlă setată (Blochează configuratorul)', severity: 'critical' });
      }
    });

    // Glazing
    data.glazingTypes.forEach(g => { 
      if (!g.price_per_sqm) {
        missing.push({ ...g, type: 'Sticlă', field: 'price_per_sqm', category: 'glazingTypes', reason: 'Preț lipsă', severity: 'error' }); 
      }
    });

    // Mechanisms
    data.mechanisms.forEach(m => { 
      const hasGrid = m.height_price_grid && m.height_price_grid.length > 0;
      if (!m.price_per_piece && !m.price_per_linear_meter && !hasGrid) {
        missing.push({ ...m, type: 'Mecanism', field: 'price_per_piece', category: 'mechanisms', reason: 'Preț/Grilă lipsă', severity: 'error' }); 
      }
    });

    // Colors
    data.colors.forEach(c => { 
      if (!c.price_adjustment && c.price_multiplier === 1 && !c.price_per_sqm) {
        missing.push({ ...c, type: 'Culoare', field: 'price_adjustment', category: 'colors', reason: 'Nicio ajustare preț', severity: 'warning' }); 
      }
    });

    // Materials
    data.materials.forEach(m => { 
      if (!m.base_price) {
        missing.push({ ...m, type: 'Material', field: 'base_price', category: 'materials', reason: 'Preț lipsă', severity: 'error' }); 
      }
    });

    return missing;
  }, [data]);

  const stats = {
    total: data.profiles.length + data.glazingTypes.length + data.mechanisms.length + data.colors.length + data.materials.length,
    missing: missingPrices.filter(m => m.severity !== 'warning').length,
    critical: missingPrices.filter(m => m.severity === 'critical').length,
    complete: (data.profiles.length + data.glazingTypes.length + data.mechanisms.length + data.colors.length + data.materials.length) - missingPrices.length
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium">Se încarcă centrul de prețuri...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Coins className="w-7 h-7 text-white" />
            </div>
            Centru de Control Prețuri
          </h1>
          <p className="text-slate-500 mt-2">Gestionare centralizată și verificarea completitudinii prețurilor pentru configurator</p>
        </div>

        <div className="flex gap-4">
          <Card className={`bg-white dark:bg-slate-800 border-red-100 shadow-sm ${stats.critical > 0 ? 'ring-2 ring-red-500 ring-offset-2' : ''}`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stats.critical > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                {stats.critical > 0 ? <AlertTriangle className="w-5 h-5 text-red-600" /> : <CheckCircle2 className="w-5 h-5 text-green-600" />}
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Blocaje (Critice)</p>
                <p className={`text-2xl font-black ${stats.critical > 0 ? 'text-red-600' : 'text-green-600'}`}>{stats.critical}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-amber-100 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                <Coins className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Prețuri Lipsă</p>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.missing}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 mb-6">
          <TabsTrigger value="summary" className="px-6 flex gap-2">
            <AlertTriangle className="w-4 h-4" /> Rezumat Alertă
            {missingPrices.length > 0 && <Badge variant="destructive" className="ml-1 h-5 px-1.5 min-w-[20px]">{missingPrices.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="profiles" className="px-6 flex gap-2">
            <Layers className="w-4 h-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="glazing" className="px-6 flex gap-2">
            <GlassWater className="w-4 h-4" /> Sticlă
          </TabsTrigger>
          <TabsTrigger value="mechanisms" className="px-6 flex gap-2">
            <Settings2 className="w-4 h-4" /> Mecanisme
          </TabsTrigger>
          <TabsTrigger value="colors" className="px-6 flex gap-2">
            <Palette className="w-4 h-4" /> Culori
          </TabsTrigger>
          <TabsTrigger value="materials" className="px-6 flex gap-2">
            <Box className="w-4 h-4" /> Materiale
          </TabsTrigger>
        </TabsList>

        {/* SUMMARY TAB - MISSING PRICES & BLOCKERS */}
        <TabsContent value="summary">
          <Card className="border-red-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" /> Probleme de Configurare & Prețuri
              </CardTitle>
              <CardDescription>
                Aceste elemente au prețul 0 sau setări incomplete (ex: fără sticlă) care **blochează** configuratorul pentru clientul final.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {missingPrices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-lg font-bold text-green-800">Totul este în regulă!</p>
                  <p className="text-slate-500">Toate elementele active au prețuri și configurări complete.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Prioritate</TableHead>
                      <TableHead>Categorie</TableHead>
                      <TableHead>Element</TableHead>
                      <TableHead>Problemă Detectată</TableHead>
                      <TableHead>Acțiune</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {missingPrices.sort((a, b) => {
                      const order = { critical: 0, error: 1, warning: 2 };
                      return order[a.severity] - order[b.severity];
                    }).map((item, idx) => (
                      <TableRow key={`${item.type}_${item.id}_${idx}`} className="hover:bg-red-50/30 transition-colors">
                        <TableCell>
                          {item.severity === 'critical' ? (
                            <Badge className="bg-red-600 hover:bg-red-600">CRITIC</Badge>
                          ) : item.severity === 'error' ? (
                            <Badge variant="destructive">EROARE</Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-600">Atenție</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-white">{item.type}</Badge>
                        </TableCell>
                        <TableCell className="font-bold text-slate-900">{item.name}</TableCell>
                        <TableCell>
                          <span className={`${item.severity === 'critical' ? 'text-red-700 font-bold' : 'text-slate-600'} text-sm`}>
                            {item.reason}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                            onClick={() => setActiveTab(item.category)}
                          >
                            Rezolvă <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROFILES TAB */}
        <TabsContent value="profiles">
          <PricingTable 
            title="Prețuri Profile" 
            description="Gestionare preț per metru liniar cursiv (€/ml)"
            items={data.profiles}
            priceField="price_per_linear_meter"
            entityKey="profiles"
            onPriceChange={handlePriceChange}
            onBulkUpdate={handleBulkUpdate}
            onSave={saveItem}
            onSaveAll={saveAllForCategory}
            modifiedItems={modifiedItems}
          />
        </TabsContent>

        {/* GLAZING TAB */}
        <TabsContent value="glazing">
          <PricingTable 
            title="Prețuri Sticlă" 
            description="Gestionare preț per metru pătrat (€/m²)"
            items={data.glazingTypes}
            priceField="price_per_sqm"
            entityKey="glazingTypes"
            onPriceChange={handlePriceChange}
            onBulkUpdate={handleBulkUpdate}
            onSave={saveItem}
            onSaveAll={saveAllForCategory}
            modifiedItems={modifiedItems}
          />
        </TabsContent>

        {/* MECHANISMS TAB */}
        <TabsContent value="mechanisms">
          <PricingTable 
            title="Prețuri Mecanisme" 
            description="Gestionare preț per bucată sau per ML cursiv"
            items={data.mechanisms}
            priceField="price_per_piece"
            entityKey="mechanisms"
            onPriceChange={handlePriceChange}
            onBulkUpdate={handleBulkUpdate}
            onSave={saveItem}
            onSaveAll={saveAllForCategory}
            modifiedItems={modifiedItems}
          />
        </TabsContent>

        {/* COLORS TAB */}
        <TabsContent value="colors">
          <PricingTable 
            title="Prețuri Culori" 
            description="Ajustare fixă, multiplicator sau preț/m²"
            items={data.colors}
            priceField="price_adjustment"
            entityKey="colors"
            onPriceChange={handlePriceChange}
            onBulkUpdate={handleBulkUpdate}
            onSave={saveItem}
            onSaveAll={saveAllForCategory}
            modifiedItems={modifiedItems}
          />
        </TabsContent>

        {/* MATERIALS TAB */}
        <TabsContent value="materials">
          <PricingTable 
            title="Prețuri Materiale" 
            description="Bază de calcul pentru costul materialului per m²"
            items={data.materials}
            priceField="base_price"
            entityKey="materials"
            onPriceChange={handlePriceChange}
            onBulkUpdate={handleBulkUpdate}
            onSave={saveItem}
            onSaveAll={saveAllForCategory}
            modifiedItems={modifiedItems}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PricingTable({ title, description, items, priceField, entityKey, onPriceChange, onBulkUpdate, onSave, onSaveAll, modifiedItems }) {
  const [filter, setFilter] = useState('');
  const [bulkPrice, setBulkPrice] = useState('');
  
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(filter.toLowerCase()) || 
    (item.code && item.code.toLowerCase().includes(filter.toLowerCase()))
  );

  const modifiedCount = Object.keys(modifiedItems).filter(k => k.startsWith(`${entityKey}_`)).length;

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b pb-4">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="flex-1">
            <CardTitle className="text-xl flex items-center gap-2">
              {title}
              {modifiedCount > 0 && <Badge className="bg-amber-500">{modifiedCount} modificări nesalvate</Badge>}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
            {/* SEARCH */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Caută..." 
                className="pl-8 bg-white h-9" 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>

            {/* BULK ACTIONS */}
            <div className="flex items-center gap-2 bg-indigo-50/50 p-1.5 rounded-lg border border-indigo-100">
              <Input 
                type="number"
                placeholder="Preț unic (€)"
                className="w-32 h-8 text-sm font-bold bg-white"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
              />
              <Button 
                size="sm" 
                variant="outline"
                className="h-8 bg-indigo-600 text-white hover:bg-indigo-700 border-none"
                onClick={() => {
                  if (bulkPrice) onBulkUpdate(entityKey, priceField, bulkPrice);
                }}
              >
                Setează tot
              </Button>
            </div>

            {/* SAVE ALL */}
            {modifiedCount > 0 && (
              <Button 
                size="sm" 
                className="h-9 bg-green-600 hover:bg-green-700 shadow-md animate-pulse"
                onClick={() => onSaveAll(entityKey)}
              >
                <Save className="w-4 h-4 mr-2" /> Salvează Tot ({modifiedCount})
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/30">
              <TableHead className="w-[300px]">Nume / Cod</TableHead>
              <TableHead>Preț Actual</TableHead>
              <TableHead>Modifică Preț (€)</TableHead>
              <TableHead className="text-right">Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500 italic">
                  Nu am găsit niciun element care să corespundă căutării.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => {
                const isModified = !!modifiedItems[`${entityKey}_${item.id}`];
                const isZero = !item[priceField];
                
                return (
                  <TableRow key={item.id} className={`${isZero ? 'bg-red-50/20' : ''} ${isModified ? 'bg-amber-50/30' : ''} transition-colors`}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{item.name}</span>
                        {item.code && <span className="text-xs text-slate-500 font-mono">{item.code}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${isZero ? 'text-red-600' : 'text-slate-700'}`}>
                          {item[priceField] ? `${parseFloat(item[priceField]).toFixed(2)} €` : '0.00 €'}
                        </span>
                        {isZero && <Badge variant="destructive" className="text-[10px] h-4 px-1">Lipsește</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 max-w-[160px]">
                        <Input 
                          type="number"
                          step="0.01"
                          value={item[priceField] || ''}
                          className={`h-9 font-bold ${isModified ? 'border-amber-500 focus-visible:ring-amber-500' : ''}`}
                          onChange={(e) => onPriceChange(entityKey, item.id, priceField, e.target.value)}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Aplică acest preț la toate"
                          className="h-8 w-8 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50"
                          onClick={() => onBulkUpdate(entityKey, priceField, item[priceField])}
                        >
                          <Layers className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm"
                        variant={isModified ? 'default' : 'ghost'}
                        disabled={!isModified}
                        onClick={() => onSave(entityKey, item.id)}
                        className={isModified ? 'bg-green-600 hover:bg-green-700' : 'text-slate-400'}
                      >
                        <Save className="w-4 h-4 mr-1" /> {isModified ? 'Salvează' : 'Fără modificări'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
