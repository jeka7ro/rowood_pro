import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, Settings, Search, Loader2, ChevronRight,
  Filter, ArrowUpDown, Download
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';

// Extra Costs defaults
const DEFAULT_EXTRA_COSTS = {
  waste_percent: 5,
  profit_percent: 25,
  manopera_per_mp: 18,
  tva_percent: 21,
};
const EXTRA_COSTS_KEY = 'rowood_extra_costs';

// Fallback manual rates
const DEFAULT_COST_RATES = {
  profil_rama_per_ml: 8.50,
  profil_cercevea_per_ml: 7.20,
  armatura_per_ml: 3.50,
  bagheta_per_ml: 1.80,
  garnitura_per_ml: 0.90,
  sticla_per_mp: 42.00,
  feronerie_fix: 0,
  feronerie_ob: 65.00,
  feronerie_batant: 45.00,
  maner_per_buc: 8.50,
  balamale_per_canat: 12.00,
};

export default function CostAnalysisPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sortBy, setSortBy] = useState('date'); // date, cost, margin

  // All DB entities for pricing
  const [allProfiles, setAllProfiles] = useState([]);
  const [allGlazings, setAllGlazings] = useState([]);
  const [allColors, setAllColors] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [allMechanisms, setAllMechanisms] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  // Settings
  const [costRates, setCostRates] = useState(() => {
    try {
      const saved = localStorage.getItem('rowood_cost_rates');
      return saved ? { ...DEFAULT_COST_RATES, ...JSON.parse(saved) } : DEFAULT_COST_RATES;
    } catch { return DEFAULT_COST_RATES; }
  });
  const [extraCosts, setExtraCosts] = useState(() => {
    try {
      const saved = localStorage.getItem(EXTRA_COSTS_KEY);
      return saved ? { ...DEFAULT_EXTRA_COSTS, ...JSON.parse(saved) } : DEFAULT_EXTRA_COSTS;
    } catch { return DEFAULT_EXTRA_COSTS; }
  });
  const [showSettings, setShowSettings] = useState(false);

  const saveCostRates = (newRates) => {
    setCostRates(newRates);
    localStorage.setItem('rowood_cost_rates', JSON.stringify(newRates));
  };
  const saveExtraCosts = (newEC) => {
    setExtraCosts(newEC);
    localStorage.setItem(EXTRA_COSTS_KEY, JSON.stringify(newEC));
  };

  // Load all data
  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        const [configs, profiles, glazings, colors, materials, mechanisms, products] = await Promise.all([
          base44.entities.Configuration.list('-created_date', 100),
          base44.entities.Profile.filter({ is_active: true }),
          base44.entities.GlazingType.filter({ is_active: true }),
          base44.entities.Color.filter({ is_active: true }),
          base44.entities.Material.filter({ is_active: true }),
          base44.entities.MechanismType.filter({ is_active: true }),
          base44.entities.Product.filter({ is_active: true }),
        ]);
        setOrders(configs.filter(c => c.items && c.items.length > 0));
        setAllProfiles(profiles);
        setAllGlazings(glazings);
        setAllColors(colors);
        setAllMaterials(materials);
        setAllMechanisms(mechanisms);
        setAllProducts(products);
      } catch (err) {
        console.error('Cost Analysis: failed to load', err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  // ═══ CALCULATE COST FOR ONE ITEM ═══
  const calculateItemCost = (item) => {
    const w = parseFloat(item.width) || 0;
    const h = parseFloat(item.height) || 0;
    const area = (w * h) / 1000000;
    const perimeter = 2 * (w + h) / 1000;
    const isFix = item.product_name?.toLowerCase().includes('fix');
    const numSashes = (item.sash_configs?.length) || (isFix ? 0 : 2);

    // Match entities by name
    const profile = item.profile_name ? allProfiles.find(p => p.name === item.profile_name) : null;
    const glazing = item.glazing_name ? allGlazings.find(g => g.name === item.glazing_name) : null;
    const color = item.color_name ? allColors.find(c => c.name === item.color_name) : null;
    const material = item.material_name ? allMaterials.find(m => m.name === item.material_name) : null;
    const product = item.product_name ? allProducts.find(p => p.name === item.product_name) : null;

    // Profile pricing
    const dbProfilRate = profile ? Number(profile.price_per_linear_meter) : 0;
    const rateRama = dbProfilRate > 0 ? dbProfilRate : costRates.profil_rama_per_ml;
    const rateCercevea = dbProfilRate > 0 ? dbProfilRate * 0.85 : costRates.profil_cercevea_per_ml;

    // Glass pricing (product_specific_pricing from Profile has priority)
    const productPricing = profile?.product_specific_pricing?.find(p => p.product_id === product?.id);
    const dbGlassProfile = productPricing ? Number(productPricing.glass_price_per_sqm) : 0;
    const dbGlassGlazing = glazing ? Number(glazing.price_per_sqm) : 0;
    const rateSticla = dbGlassProfile > 0 ? dbGlassProfile : (dbGlassGlazing > 0 ? dbGlassGlazing : costRates.sticla_per_mp);

    // Hardware pricing
    const dbHardware = productPricing ? Number(productPricing.hardware_fixed_price) : 0;
    const rateFeronerie = dbHardware > 0 ? dbHardware : (isFix ? costRates.feronerie_fix : costRates.feronerie_ob);

    // Linear meters (estimate from dimensions)
    const mlRama = perimeter;
    const mlCercevea = isFix ? 0 : perimeter * 0.85;
    const mlArmatura = perimeter * 1.8;
    const mlBagheta = perimeter * 0.7;
    const glassArea = area * (isFix ? 0.8 : 0.65);

    // Base cost
    let costBaza = 
      mlRama * rateRama +
      mlCercevea * rateCercevea +
      mlArmatura * costRates.armatura_per_ml +
      mlBagheta * costRates.bagheta_per_ml +
      perimeter * 2 * costRates.garnitura_per_ml +
      glassArea * rateSticla +
      numSashes * rateFeronerie +
      (isFix ? 0 : numSashes) * costRates.maner_per_buc +
      (isFix ? 0 : numSashes) * costRates.balamale_per_canat;

    // Color adjustments
    if (color) {
      const adj = Number(color.price_adjustment) || 0;
      const perSqm = Number(color.price_per_sqm) || 0;
      costBaza += adj + perSqm * area;
    }

    // Material multiplier
    const matMult = material ? (Number(material.price_multiplier) || 1) : 1;
    costBaza *= matMult;

    // Profile multiplier
    const profMult = profile ? (Number(profile.price_multiplier) || 1) : 1;
    costBaza *= profMult;

    // Extra costs
    const waste = costBaza * (extraCosts.waste_percent / 100);
    const manopera = area * extraCosts.manopera_per_mp;
    const beforeProfit = costBaza + waste + manopera;
    const profit = beforeProfit * (extraCosts.profit_percent / 100);
    const costPerUnit = beforeProfit + profit;
    const total = costPerUnit * (item.quantity || 1);
    const tva = total * (extraCosts.tva_percent / 100);
    const totalCuTVA = total + tva;

    const sellPrice = item.price || 0;
    const margin = sellPrice > 0 ? ((sellPrice - costPerUnit) / sellPrice * 100) : 0;

    const hasRealPrices = dbProfilRate > 0 || dbGlassGlazing > 0 || dbGlassProfile > 0 || dbHardware > 0;

    return {
      costBaza, waste, manopera, profit, costPerUnit, total, tva, totalCuTVA,
      sellPrice, margin, hasRealPrices, area
    };
  };

  // ═══ CALCULATE ORDER TOTALS ═══
  const ordersWithCosts = useMemo(() => {
    if (allProfiles.length === 0 && !loading) return orders.map(o => ({ ...o, costs: null }));

    return orders.map(order => {
      const items = order.items || [];
      let orderCostBaza = 0, orderTotal = 0, orderTotalCuTVA = 0, orderSellPrice = 0;
      let hasAnyRealPrices = false;

      const itemCosts = items.map(item => {
        const c = calculateItemCost(item);
        orderCostBaza += c.costBaza * (item.quantity || 1);
        orderTotal += c.total;
        orderTotalCuTVA += c.totalCuTVA;
        orderSellPrice += (c.sellPrice || 0) * (item.quantity || 1);
        if (c.hasRealPrices) hasAnyRealPrices = true;
        return { ...item, costs: c };
      });

      const orderMargin = orderSellPrice > 0 ? ((orderSellPrice - orderTotal) / orderSellPrice * 100) : 0;

      return {
        ...order,
        itemCosts,
        costs: {
          costBaza: orderCostBaza,
          total: orderTotal,
          totalCuTVA: orderTotalCuTVA,
          sellPrice: orderSellPrice,
          margin: orderMargin,
          hasRealPrices: hasAnyRealPrices,
          itemCount: items.length,
        }
      };
    });
  }, [orders, allProfiles, allGlazings, allColors, allMaterials, allMechanisms, allProducts, extraCosts, costRates]);

  // Filter & sort
  const filteredOrders = useMemo(() => {
    let result = ordersWithCosts;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter(o =>
        o.id?.toLowerCase().includes(s) ||
        o.customer_name?.toLowerCase().includes(s) ||
        o.items?.some(i => i.product_name?.toLowerCase().includes(s))
      );
    }
    result.sort((a, b) => {
      if (sortBy === 'cost') return (b.costs?.total || 0) - (a.costs?.total || 0);
      if (sortBy === 'margin') return (a.costs?.margin || 0) - (b.costs?.margin || 0);
      return new Date(b.created_date || 0).getTime() - new Date(a.created_date || 0).getTime();
    });
    return result;
  }, [ordersWithCosts, searchTerm, sortBy]);

  // Grand totals
  const grandTotals = useMemo(() => {
    return filteredOrders.reduce((acc, o) => ({
      costBaza: acc.costBaza + (o.costs?.costBaza || 0),
      total: acc.total + (o.costs?.total || 0),
      totalCuTVA: acc.totalCuTVA + (o.costs?.totalCuTVA || 0),
      sellPrice: acc.sellPrice + (o.costs?.sellPrice || 0),
      orderCount: acc.orderCount + 1,
      itemCount: acc.itemCount + (o.costs?.itemCount || 0),
    }), { costBaza: 0, total: 0, totalCuTVA: 0, sellPrice: 0, orderCount: 0, itemCount: 0 });
  }, [filteredOrders]);

  const grandMargin = grandTotals.sellPrice > 0 ? ((grandTotals.sellPrice - grandTotals.total) / grandTotals.sellPrice * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="ml-3 text-slate-600">Se încarcă analiza costurilor...</span>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <Calculator className="w-7 h-7 text-emerald-600" />
            Analiză Cost Producție
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Breakdown cost pe fiecare comandă — prețuri reale din Profile, Sticlă, Material, Culoare
          </p>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Settings className="w-4 h-4" /> Setări Extra Costs
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-200">
          <h3 className="text-sm font-bold text-emerald-700 mb-4 uppercase">⚡ Extra Costs — Pierderi, Profit, TVA</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: 'waste_percent', label: 'Pierderi Material %', icon: '♻️' },
              { key: 'profit_percent', label: 'Adaos Comercial %', icon: '💰' },
              { key: 'manopera_per_mp', label: 'Manoperă €/m²', icon: '👷' },
              { key: 'tva_percent', label: 'TVA %', icon: '🏛️' },
            ].map(({ key, label, icon }) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-xs text-emerald-600 font-bold">{icon} {label}</label>
                <input type="number" value={extraCosts[key]} step="0.5"
                  onChange={(e) => saveExtraCosts({ ...extraCosts, [key]: parseFloat(e.target.value) || 0 })}
                  className="px-3 py-2 border border-emerald-200 rounded-lg text-sm font-mono bg-white" />
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-emerald-200">
            <details className="cursor-pointer">
              <summary className="text-xs text-slate-500 font-bold">⚙️ Prețuri Manuale Fallback (doar când lipsesc din DB)</summary>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                {Object.entries(costRates).map(([key, val]) => (
                  <div key={key} className="flex flex-col gap-0.5">
                    <label className="text-[10px] text-slate-400 uppercase">{key.replace(/_/g, ' ')}</label>
                    <input type="number" value={val} step="0.1" onChange={(e) => saveCostRates({ ...costRates, [key]: parseFloat(e.target.value) || 0 })} className="px-2 py-1.5 border border-slate-200 rounded text-xs font-mono" />
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>
      )}

      {/* Grand Totals Dashboard */}
      <div className="grid grid-cols-6 gap-3">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 text-white">
          <p className="text-[10px] text-slate-400 uppercase font-bold">Comenzi</p>
          <p className="text-2xl font-black mt-1">{grandTotals.orderCount}</p>
          <p className="text-xs text-slate-400">{grandTotals.itemCount} elemente</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <p className="text-[10px] text-blue-500 uppercase font-bold">Cost Bază Total</p>
          <p className="text-xl font-black text-blue-800 mt-1">{grandTotals.costBaza.toFixed(0)} <span className="text-xs font-normal">€</span></p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
          <p className="text-[10px] text-amber-500 uppercase font-bold">Cost Production</p>
          <p className="text-xl font-black text-amber-800 mt-1">{grandTotals.total.toFixed(0)} <span className="text-xs font-normal">€</span></p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <p className="text-[10px] text-purple-500 uppercase font-bold">Total cu TVA</p>
          <p className="text-xl font-black text-purple-800 mt-1">{grandTotals.totalCuTVA.toFixed(0)} <span className="text-xs font-normal">€</span></p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
          <p className="text-[10px] text-emerald-500 uppercase font-bold">Valoare Vânzare</p>
          <p className="text-xl font-black text-emerald-800 mt-1">{grandTotals.sellPrice.toFixed(0)} <span className="text-xs font-normal">€</span></p>
        </div>
        <div className={`rounded-xl p-4 border ${grandMargin >= 20 ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' : grandMargin >= 0 ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200' : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'}`}>
          <p className="text-[10px] uppercase font-bold text-slate-500">Marjă Medie</p>
          <p className={`text-xl font-black mt-1 ${grandMargin >= 20 ? 'text-green-800' : grandMargin >= 0 ? 'text-amber-800' : 'text-red-800'}`}>
            {grandTotals.sellPrice > 0 ? `${grandMargin.toFixed(1)}%` : '—'}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Caută comandă, client, produs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm" />
        </div>
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
          {[
            { key: 'date', label: 'Dată' },
            { key: 'cost', label: 'Cost ↓' },
            { key: 'margin', label: 'Marjă ↑' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setSortBy(key)}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${sortBy === key ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="px-4 py-3 text-left">Comandă</th>
              <th className="px-4 py-3 text-left">Client</th>
              <th className="px-4 py-3 text-center">Elem.</th>
              <th className="px-4 py-3 text-right">Cost Bază</th>
              <th className="px-4 py-3 text-right">Cost Producție</th>
              <th className="px-4 py-3 text-right">Total cu TVA</th>
              <th className="px-4 py-3 text-right">Preț Vânzare</th>
              <th className="px-4 py-3 text-center">Marjă</th>
              <th className="px-4 py-3 text-center">Sursă</th>
              <th className="px-4 py-3 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.map((order, idx) => (
              <React.Fragment key={order.id}>
                <tr className={`hover:bg-blue-50/50 cursor-pointer ${selectedOrder === order.id ? 'bg-blue-50' : idx % 2 ? 'bg-slate-50/30' : ''}`}
                    onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}>
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-800">#{order.id?.slice(-8)?.toUpperCase()}</p>
                    <p className="text-[10px] text-slate-400">{order.created_date ? format(parseISO(order.created_date), 'dd MMM yyyy', { locale: ro }) : ''}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{order.customer_name || '—'}</td>
                  <td className="px-4 py-3 text-center font-mono">{order.costs?.itemCount || 0}</td>
                  <td className="px-4 py-3 text-right font-mono">{(order.costs?.costBaza || 0).toFixed(2)} €</td>
                  <td className="px-4 py-3 text-right font-mono font-bold">{(order.costs?.total || 0).toFixed(2)} €</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-purple-700">{(order.costs?.totalCuTVA || 0).toFixed(2)} €</td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-700">{(order.costs?.sellPrice || 0).toFixed(2)} €</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                      (order.costs?.margin || 0) >= 20 ? 'bg-green-100 text-green-700' :
                      (order.costs?.margin || 0) >= 0 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {order.costs?.sellPrice > 0 ? `${(order.costs?.margin || 0).toFixed(1)}%` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-[10px]">{order.costs?.hasRealPrices ? '📊 DB' : '⚙️'}</td>
                  <td className="px-4 py-3 text-center">
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${selectedOrder === order.id ? 'rotate-90' : ''}`} />
                  </td>
                </tr>
                {/* Expanded items */}
                {selectedOrder === order.id && (
                  <tr>
                    <td colSpan={10} className="px-6 py-4 bg-slate-50/80">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-slate-500 border-b border-slate-200">
                            <th className="py-2 text-left font-bold">Produs</th>
                            <th className="py-2 text-left">Profil</th>
                            <th className="py-2 text-left">Sticlă</th>
                            <th className="py-2 text-center">Dim.</th>
                            <th className="py-2 text-center">Cant.</th>
                            <th className="py-2 text-right">Cost Bază</th>
                            <th className="py-2 text-right">Cost/buc</th>
                            <th className="py-2 text-right font-bold">Subtotal</th>
                            <th className="py-2 text-center">Marjă</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(order.itemCosts || []).map((item, j) => (
                            <tr key={j} className="hover:bg-white/50">
                              <td className="py-2 font-bold text-slate-700">{item.product_name}</td>
                              <td className="py-2 text-slate-500">{item.profile_name || '—'}</td>
                              <td className="py-2 text-slate-500">{item.glazing_name || '—'}</td>
                              <td className="py-2 text-center font-mono text-slate-500">{item.width}×{item.height}</td>
                              <td className="py-2 text-center font-mono">{item.quantity || 1}</td>
                              <td className="py-2 text-right font-mono">{(item.costs?.costBaza || 0).toFixed(2)} €</td>
                              <td className="py-2 text-right font-mono font-bold">{(item.costs?.costPerUnit || 0).toFixed(2)} €</td>
                              <td className="py-2 text-right font-mono font-black text-emerald-700">{(item.costs?.totalCuTVA || 0).toFixed(2)} €</td>
                              <td className="py-2 text-center">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  (item.costs?.margin || 0) >= 20 ? 'bg-green-100 text-green-600' :
                                  (item.costs?.margin || 0) >= 0 ? 'bg-amber-100 text-amber-600' :
                                  'bg-red-100 text-red-600'
                                }`}>
                                  {item.costs?.sellPrice > 0 ? `${(item.costs?.margin || 0).toFixed(0)}%` : '—'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Calculator className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nu sunt comenzi confirmate</p>
          </div>
        )}
      </div>
    </div>
  );
}
