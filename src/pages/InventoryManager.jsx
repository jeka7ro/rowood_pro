import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Package, Plus, Minus, Search, AlertTriangle, TrendingUp, TrendingDown,
  ArrowDownCircle, ArrowUpCircle, Filter, Trash2, Edit2, X, Check
} from 'lucide-react';

// ═══ Categorii Stoc ═══
const STOCK_CATEGORIES = [
  { id: 'profile', name: 'Profile PVC/AL', icon: '🪵', unit: 'ml', color: 'blue' },
  { id: 'armatura', name: 'Armături', icon: '🔩', unit: 'ml', color: 'slate' },
  { id: 'sticla', name: 'Sticlă Termopan', icon: '🧊', unit: 'm²', color: 'cyan' },
  { id: 'feronerie', name: 'Feronerie', icon: '🔧', unit: 'buc', color: 'amber' },
  { id: 'garnituri', name: 'Garnituri', icon: '〰️', unit: 'ml', color: 'purple' },
  { id: 'baghete', name: 'Baghete', icon: '📏', unit: 'ml', color: 'emerald' },
  { id: 'accesorii', name: 'Accesorii', icon: '🔗', unit: 'buc', color: 'orange' },
  { id: 'consumabile', name: 'Consumabile', icon: '📦', unit: 'buc', color: 'rose' },
];

// localStorage helpers
const getInventory = () => {
  try { return JSON.parse(localStorage.getItem('rowood_inventory') || '[]'); } catch { return []; }
};
const saveInventory = (items) => { localStorage.setItem('rowood_inventory', JSON.stringify(items)); };

const getMovements = () => {
  try { return JSON.parse(localStorage.getItem('rowood_movements') || '[]'); } catch { return []; }
};
const saveMovements = (items) => { localStorage.setItem('rowood_movements', JSON.stringify(items)); };

export default function InventoryManager() {
  const [inventory, setInventory] = useState(getInventory);
  const [movements, setMovements] = useState(getMovements);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddMovement, setShowAddMovement] = useState(null); // 'intrare' | 'iesire' or null
  const [selectedItem, setSelectedItem] = useState(null);
  const [editId, setEditId] = useState(null);

  // Form state
  const [newItem, setNewItem] = useState({ name: '', category: 'profile', unit: 'ml', min_stock: 0, price: 0 });
  const [newMovement, setNewMovement] = useState({ item_id: '', type: 'intrare', quantity: 0, price: 0, supplier: '', invoice: '', order_id: '', note: '' });

  // Calculate stock balances
  const stockBalances = useMemo(() => {
    const balances = {};
    inventory.forEach(item => { balances[item.id] = { ...item, sold: 0, valoare: 0 }; });
    movements.forEach(m => {
      if (balances[m.item_id]) {
        if (m.type === 'intrare') {
          balances[m.item_id].sold += m.quantity;
          balances[m.item_id].valoare += m.quantity * m.price;
        } else {
          balances[m.item_id].sold -= m.quantity;
        }
      }
    });
    return Object.values(balances);
  }, [inventory, movements]);

  const filteredItems = stockBalances.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'all' || item.category === activeCategory;
    return matchSearch && matchCat;
  });

  const lowStockItems = stockBalances.filter(i => i.sold <= i.min_stock && i.min_stock > 0);
  const totalValue = stockBalances.reduce((s, i) => s + Math.max(0, i.valoare), 0);
  const totalItems = stockBalances.length;

  const addItem = () => {
    const item = { ...newItem, id: Date.now().toString(), created: new Date().toISOString() };
    const updated = [...inventory, item];
    setInventory(updated);
    saveInventory(updated);
    setNewItem({ name: '', category: 'profile', unit: 'ml', min_stock: 0, price: 0 });
    setShowAddItem(false);
  };

  const deleteItem = (id) => {
    const updated = inventory.filter(i => i.id !== id);
    setInventory(updated);
    saveInventory(updated);
    const updatedMov = movements.filter(m => m.item_id !== id);
    setMovements(updatedMov);
    saveMovements(updatedMov);
  };

  const addMovement = () => {
    const mov = { ...newMovement, id: Date.now().toString(), date: new Date().toISOString(), user: 'Admin' };
    const updated = [...movements, mov];
    setMovements(updated);
    saveMovements(updated);
    setNewMovement({ item_id: '', type: 'intrare', quantity: 0, price: 0, supplier: '', invoice: '', order_id: '', note: '' });
    setShowAddMovement(null);
  };

  const catColor = (cat) => STOCK_CATEGORIES.find(c => c.id === cat)?.color || 'slate';
  const catIcon = (cat) => STOCK_CATEGORIES.find(c => c.id === cat)?.icon || '📦';
  const catUnit = (cat) => STOCK_CATEGORIES.find(c => c.id === cat)?.unit || 'buc';

  const formatDate = (iso) => {
    try { return new Date(iso).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } 
    catch { return iso; }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-3">
              <Package className="w-7 h-7 text-emerald-400" /> Gestiune Stocuri
            </h1>
            <p className="text-slate-400 text-sm mt-1">Intrări • Ieșiri • Sold Curent • Alerte Reaprovizionare</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddMovement('intrare')} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
              <ArrowDownCircle className="w-4 h-4" /> Intrare
            </Button>
            <Button onClick={() => setShowAddMovement('iesire')} className="bg-orange-500 hover:bg-orange-600 text-white gap-1">
              <ArrowUpCircle className="w-4 h-4" /> Ieșire
            </Button>
            <Button onClick={() => setShowAddItem(true)} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 gap-1">
              <Plus className="w-4 h-4" /> Articol Nou
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Total Articole</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{totalItems}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Valoare Stoc</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">{totalValue.toFixed(0)} <span className="text-sm font-normal">€</span></p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Mișcări Luna</p>
            <p className="text-2xl font-black text-blue-700 mt-1">{movements.length}</p>
          </div>
          <div className={`rounded-xl p-4 border shadow-sm ${lowStockItems.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <p className="text-[10px] uppercase font-bold text-slate-400">Alerte Stoc</p>
            <p className={`text-2xl font-black mt-1 ${lowStockItems.length > 0 ? 'text-red-700' : 'text-green-700'}`}>
              {lowStockItems.length > 0 ? `⚠️ ${lowStockItems.length}` : '✅ 0'}
            </p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h3 className="text-sm font-bold text-red-800 flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" /> Stoc Sub Minim — Necesită Reaprovizionare
            </h3>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map(item => (
                <Badge key={item.id} variant="outline" className="bg-white text-red-700 border-red-300 text-xs">
                  {catIcon(item.category)} {item.name}: {item.sold.toFixed(1)} / {item.min_stock} {catUnit(item.category)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Search + Category Filters */}
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input placeholder="Caută articol..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setActiveCategory('all')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${activeCategory === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              Toate
            </button>
            {STOCK_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${activeCategory === cat.id ? `bg-${cat.color}-600 text-white` : `bg-${cat.color}-50 text-${cat.color}-700 hover:bg-${cat.color}-100`}`}>
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 text-white text-xs">
                <th className="px-4 py-3 text-left">Articol</th>
                <th className="px-4 py-3 text-center">Categorie</th>
                <th className="px-4 py-3 text-right">Sold Curent</th>
                <th className="px-4 py-3 text-right">Stoc Minim</th>
                <th className="px-4 py-3 text-right">Valoare</th>
                <th className="px-4 py-3 text-right">Status</th>
                <th className="px-4 py-3 text-center">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    {inventory.length === 0 ? (
                      <div className="space-y-2">
                        <Package className="w-10 h-10 mx-auto text-slate-300" />
                        <p className="font-bold">Niciun articol în stoc</p>
                        <p className="text-xs">Apasă "Articol Nou" pentru a adăuga primul produs</p>
                      </div>
                    ) : 'Nu s-au găsit rezultate.'}
                  </td>
                </tr>
              )}
              {filteredItems.map((item, i) => {
                const isLow = item.sold <= item.min_stock && item.min_stock > 0;
                return (
                  <tr key={item.id} className={`hover:bg-blue-50/30 ${i % 2 === 0 ? '' : 'bg-slate-50/30'} ${isLow ? 'bg-red-50/40' : ''}`}>
                    <td className="px-4 py-3 font-bold text-slate-800">
                      {catIcon(item.category)} {item.name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className={`text-[10px] bg-${catColor(item.category)}-50 text-${catColor(item.category)}-700 border-${catColor(item.category)}-200`}>
                        {STOCK_CATEGORIES.find(c => c.id === item.category)?.name || item.category}
                      </Badge>
                    </td>
                    <td className={`px-4 py-3 text-right font-mono font-black text-lg ${isLow ? 'text-red-600' : 'text-slate-800'}`}>
                      {item.sold.toFixed(1)} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-400">
                      {item.min_stock > 0 ? `${item.min_stock} ${item.unit}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-700 font-bold">
                      {item.valoare > 0 ? `${item.valoare.toFixed(0)} €` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isLow ? (
                        <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">⚠️ Sub minim</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">✅ OK</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-1 justify-center">
                        <button onClick={() => { setSelectedItem(item); setNewMovement(prev => ({ ...prev, item_id: item.id, type: 'intrare' })); setShowAddMovement('intrare'); }}
                          className="p-1.5 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200" title="Intrare">
                          <Plus className="w-3 h-3" />
                        </button>
                        <button onClick={() => { setSelectedItem(item); setNewMovement(prev => ({ ...prev, item_id: item.id, type: 'iesire' })); setShowAddMovement('iesire'); }}
                          className="p-1.5 rounded bg-orange-100 text-orange-700 hover:bg-orange-200" title="Ieșire">
                          <Minus className="w-3 h-3" />
                        </button>
                        <button onClick={() => deleteItem(item.id)}
                          className="p-1.5 rounded bg-red-100 text-red-600 hover:bg-red-200" title="Șterge">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Recent Movements */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" /> Ultimele Mișcări
            </h3>
            <Badge variant="outline" className="text-[10px]">{movements.length} operațiuni</Badge>
          </div>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {movements.length === 0 && (
              <div className="px-4 py-6 text-center text-slate-400 text-sm">Nicio mișcare înregistrată</div>
            )}
            {[...movements].reverse().slice(0, 20).map((m) => {
              const item = inventory.find(i => i.id === m.item_id);
              return (
                <div key={m.id} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50/50">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${m.type === 'intrare' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                    {m.type === 'intrare' ? <ArrowDownCircle className="w-4 h-4" /> : <ArrowUpCircle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{item?.name || 'Articol necunoscut'}</p>
                    <p className="text-[10px] text-slate-400">
                      {m.type === 'intrare' ? `Furnizor: ${m.supplier || '—'}` : `Comandă: ${m.order_id || '—'}`}
                      {m.note && ` • ${m.note}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-bold ${m.type === 'intrare' ? 'text-emerald-700' : 'text-orange-700'}`}>
                      {m.type === 'intrare' ? '+' : '-'}{m.quantity} {item?.unit || ''}
                    </p>
                    <p className="text-[10px] text-slate-400">{formatDate(m.date)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ Modal: Adaugă Articol ═══ */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg">Articol Nou în Stoc</h3>
              <button onClick={() => setShowAddItem(false)} className="p-1 text-slate-400 hover:text-red-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label className="text-xs font-bold text-slate-600">Denumire Articol</Label>
                <Input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} placeholder="Ex: Profil IDEAL 4000 Ramă" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-slate-600">Categorie</Label>
                  <select value={newItem.category} onChange={(e) => { const cat = STOCK_CATEGORIES.find(c => c.id === e.target.value); setNewItem({ ...newItem, category: e.target.value, unit: cat?.unit || 'buc' }); }} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-md text-sm">
                    {STOCK_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-600">Unitate Măsură</Label>
                  <Input value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-slate-600">Stoc Minim (alertă)</Label>
                  <Input type="number" value={newItem.min_stock} onChange={(e) => setNewItem({ ...newItem, min_stock: parseFloat(e.target.value) || 0 })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-600">Preț Referință (€)</Label>
                  <Input type="number" step="0.01" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })} className="mt-1" />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddItem(false)}>Anulează</Button>
              <Button onClick={addItem} disabled={!newItem.name} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Check className="w-4 h-4 mr-1" /> Adaugă Articol
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Modal: Intrare / Ieșire ═══ */}
      {showAddMovement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className={`p-6 border-b flex items-center justify-between ${showAddMovement === 'intrare' ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'}`}>
              <h3 className="font-bold text-lg flex items-center gap-2">
                {showAddMovement === 'intrare' ? <><ArrowDownCircle className="w-5 h-5 text-emerald-600" /> Recepție Marfă (Intrare)</> : <><ArrowUpCircle className="w-5 h-5 text-orange-600" /> Consum / Ieșire</>}
              </h3>
              <button onClick={() => setShowAddMovement(null)} className="p-1 text-slate-400 hover:text-red-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label className="text-xs font-bold text-slate-600">Articol</Label>
                <select value={newMovement.item_id} onChange={(e) => setNewMovement({ ...newMovement, item_id: e.target.value, type: showAddMovement })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-md text-sm">
                  <option value="">— Selectează articol —</option>
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>{catIcon(item.category)} {item.name} ({item.unit})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-slate-600">Cantitate</Label>
                  <Input type="number" step="0.1" value={newMovement.quantity} onChange={(e) => setNewMovement({ ...newMovement, quantity: parseFloat(e.target.value) || 0 })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-600">Preț Unitar (€)</Label>
                  <Input type="number" step="0.01" value={newMovement.price} onChange={(e) => setNewMovement({ ...newMovement, price: parseFloat(e.target.value) || 0 })} className="mt-1" />
                </div>
              </div>
              {showAddMovement === 'intrare' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-bold text-slate-600">Furnizor</Label>
                    <Input value={newMovement.supplier} onChange={(e) => setNewMovement({ ...newMovement, supplier: e.target.value })} placeholder="Nume furnizor" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-600">Nr. Factură</Label>
                    <Input value={newMovement.invoice} onChange={(e) => setNewMovement({ ...newMovement, invoice: e.target.value })} placeholder="Ex: FA-1234" className="mt-1" />
                  </div>
                </div>
              ) : (
                <div>
                  <Label className="text-xs font-bold text-slate-600">Nr. Comandă (opțional)</Label>
                  <Input value={newMovement.order_id} onChange={(e) => setNewMovement({ ...newMovement, order_id: e.target.value })} placeholder="Ex: CMD #160835BA" className="mt-1" />
                </div>
              )}
              <div>
                <Label className="text-xs font-bold text-slate-600">Observații</Label>
                <Input value={newMovement.note} onChange={(e) => setNewMovement({ ...newMovement, note: e.target.value })} placeholder="Note adiționale..." className="mt-1" />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddMovement(null)}>Anulează</Button>
              <Button onClick={addMovement} disabled={!newMovement.item_id || newMovement.quantity <= 0}
                className={showAddMovement === 'intrare' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}>
                <Check className="w-4 h-4 mr-1" /> {showAddMovement === 'intrare' ? 'Înregistrează Intrare' : 'Înregistrează Ieșire'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
