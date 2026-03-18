/**
 * ═══════════════════════════════════════════════════════════════
 *  MOTOR UNIC DE PREȚURI — RoWood
 *  Funcție pură reutilizabilă: Configurator, Bon Consum, CostAnalysis
 * ═══════════════════════════════════════════════════════════════
 *
 *  calculatePrice()  — calcul complet cu breakdown
 *  Intrare: configurație + entități reale din baza de date
 *  Ieșire:  breakdown[], subtotal, extraCosts, profit, totalWithTVA
 */

// ═══ EXTRA COSTS DEFAULTS ═══
const DEFAULT_EXTRA_COSTS = {
  waste_percent: 5,           // % pierderi material
  profit_percent: 25,         // % profit (adaos comercial)
  transport_fixed: 0,         // € transport fix per proiect
  montaj_per_sqm: 0,          // € montaj per m²
  tva_percent: 21,            // % TVA
  // Adaosuri per categorie material
  adaos_profile_percent: 0,
  adaos_glass_percent: 0,
  adaos_hardware_percent: 0,
};

// localStorage key for extra costs settings
const EXTRA_COSTS_KEY = 'rowood_extra_costs';

export function getExtraCosts() {
  try {
    const saved = localStorage.getItem(EXTRA_COSTS_KEY);
    return saved ? { ...DEFAULT_EXTRA_COSTS, ...JSON.parse(saved) } : { ...DEFAULT_EXTRA_COSTS };
  } catch {
    return { ...DEFAULT_EXTRA_COSTS };
  }
}

export function saveExtraCosts(costs) {
  localStorage.setItem(EXTRA_COSTS_KEY, JSON.stringify(costs));
}

/**
 * Calcul principal de preț — funcție pură
 *
 * @param {Object} params
 * @param {number} params.width          - Lățime în mm
 * @param {number} params.height         - Înălțime în mm
 * @param {number} params.quantity       - Cantitate bucăți (default 1)
 * @param {Object} params.product        - Entitate Product
 * @param {Object} params.profile        - Entitate Profile
 * @param {Object} params.glazingType    - Entitate GlazingType
 * @param {Object} params.color          - Entitate Color (opțional)
 * @param {Object} params.material       - Entitate Material
 * @param {Object} params.subMaterial    - Entitate SubMaterial (opțional)
 * @param {Object} params.customColorRule - Color rule for custom HEX/RAL (opțional)
 * @param {Array}  params.sashConfigs    - Array de {type: 'oscilo-batant'} per canat (Configurator)
 * @param {Array}  params.sashMechanisms - Array de mechanism IDs per canat (Bon Consum)
 * @param {Array}  params.mechanisms     - Toate entitățile MechanismType
 * @param {Array}  params.accessories    - Array de entități AccessoryOption selectate
 * @param {Object} params.transportConfig - { include: bool, country: 'RO'|'EXT' }
 * @param {Object} params.installConfig   - { include: bool }
 * @param {Object|null} params.extraCosts - Extra costs override (null = fără extra costs)
 * @param {number} params.minGlassArea   - Suprafață minimă facturare sticlă în m² (default 0)
 *
 * @returns {Object} { breakdown, geometrie, costBaza, extraCostsBreakdown, subtotal, tva, total }
 */
export function calculatePrice({
  width = 0,
  height = 0,
  quantity = 1,
  product = null,
  profile = null,
  glazingType = null,
  color = null,
  material = null,
  subMaterial = null,
  customColorRule = null,
  sashConfigs = [],        // from Configurator
  sashMechanisms = [],     // from Bon Consum
  mechanisms = [],
  accessories = [],
  transportConfig = null,
  installConfig = null,
  extraCosts = null,       // null = skip extra costs, {} = use defaults
  minGlassArea = 0,        // facturare minimă sticlă
} = {}) {
  const w = Number(width) || 0;
  const h = Number(height) || 0;
  const qty = Number(quantity) || 1;

  if (!product || !material || w === 0 || h === 0) {
    return {
      breakdown: [],
      geometrie: { area: 0, outerPerimeter: 0, sashPerimeter: 0, totalProfilePerimeter: 0, sashWidth: 0, sashCount: 1 },
      costBaza: 0,
      extraCostsBreakdown: [],
      subtotal: 0,
      tva: 0,
      total: 0,
    };
  }

  // ═══ GEOMETRIE ═══
  const area = (w * h) / 1_000_000;  // m²
  const sashCount = product.sashes || 1;
  const sashWidth = w / sashCount;
  const outerPerimeter = 2 * (w + h) / 1000;           // ml
  const sashPerimeter = 2 * (sashWidth + h) / 1000;     // ml
  const totalProfilePerimeter = outerPerimeter + (sashPerimeter * sashCount);

  const geometrie = { area, outerPerimeter, sashPerimeter, totalProfilePerimeter, sashWidth, sashCount };

  // ═══ PRODUCT SPECIFIC PRICING ═══
  let productPricing = null;
  if (profile && Array.isArray(profile.product_specific_pricing)) {
    productPricing = profile.product_specific_pricing.find(p => p.product_id === product.id);
  }

  const breakdown = [];
  let runningTotal = 0;

  // ─── 1. FERONERIE FIXĂ ───
  const hardwareFixedPrice = Number(productPricing?.hardware_fixed_price) || 0;
  if (hardwareFixedPrice > 0) {
    breakdown.push({
      category: 'Feronerie', item: 'Cost fix montaj feronerie',
      calc: 'Preț fix per produs', price: hardwareFixedPrice, type: 'hardware'
    });
    runningTotal += hardwareFixedPrice;
  }

  // ─── 2. PROFIL (per metru liniar) ───
  const profilePPM = Number(profile?.price_per_linear_meter) || 0;
  if (profilePPM > 0) {
    const profileCost = totalProfilePerimeter * profilePPM;
    breakdown.push({
      category: 'Profil', item: profile.name,
      calc: `Ramă ${outerPerimeter.toFixed(2)} + ${sashCount}×${sashPerimeter.toFixed(2)} = ${totalProfilePerimeter.toFixed(2)} ml × ${profilePPM} €/ml`,
      price: profileCost, type: 'profile'
    });
    runningTotal += profileCost;
  }

  // ─── 3. STICLĂ (per m²) ───
  // Priority: product_specific_pricing.glass_price_per_sqm → glazingType.price_per_sqm
  let glassPricePerSqm = Number(productPricing?.glass_price_per_sqm) || Number(glazingType?.price_per_sqm) || 0;
  if (glassPricePerSqm > 0) {
    // Per-sash glass area with mechanism adjustment
    let totalGlassArea = 0;
    const glassDetails = [];

    for (let i = 0; i < sashCount; i++) {
      const areaPerSash = (sashWidth * h) / 1_000_000;
      
      // Check mechanism glass area adjustment
      let adjustmentPercent = 0;
      if (sashMechanisms[i]) {
        const mech = mechanisms.find(m => m.id === sashMechanisms[i]);
        adjustmentPercent = Number(mech?.glass_area_adjustment_percent) || 0;
      }
      
      let adjustedArea = areaPerSash * (1 - adjustmentPercent / 100);
      // Facturare minimă
      if (minGlassArea > 0 && adjustedArea < minGlassArea) {
        adjustedArea = minGlassArea;
      }
      totalGlassArea += adjustedArea;
      glassDetails.push(`C${i+1}: ${adjustedArea.toFixed(3)}`);
    }

    const glassCost = totalGlassArea * glassPricePerSqm;
    breakdown.push({
      category: 'Sticlă', item: glazingType?.name || 'Termopan',
      calc: `(${glassDetails.join(' + ')}) = ${totalGlassArea.toFixed(3)} m² × ${glassPricePerSqm} €/m²`,
      price: glassCost, type: 'glass'
    });
    runningTotal += glassCost;
  }

  // ─── 4. CULOARE ───
  const activeColor = color || customColorRule;
  if (activeColor) {
    const colorAdj = Number(activeColor.price_adjustment) || 0;
    if (colorAdj > 0) {
      breakdown.push({
        category: 'Culoare', item: activeColor.name || 'Culoare',
        calc: 'Ajustare fixă', price: colorAdj, type: 'color'
      });
      runningTotal += colorAdj;
    }
    const colorPerSqm = Number(activeColor.price_per_sqm) || 0;
    if (colorPerSqm > 0) {
      const colorAreaCost = area * colorPerSqm;
      breakdown.push({
        category: 'Culoare', item: `${activeColor.name || 'Culoare'} (per m²)`,
        calc: `${area.toFixed(2)} m² × ${colorPerSqm} €/m²`, price: colorAreaCost, type: 'color'
      });
      runningTotal += colorAreaCost;
    }
  }

  // ─── 5. MULTIPLICATOR PROFIL ───
  const profileMult = Number(profile?.price_multiplier) || 1;
  if (profileMult !== 1) {
    const adj = runningTotal * (profileMult - 1);
    breakdown.push({
      category: 'Ajustare', item: `Multiplicator profil ${profile.name}`,
      calc: `${((profileMult - 1) * 100).toFixed(0)}%`, price: adj, type: 'multiplier'
    });
    runningTotal += adj;
  }

  // ─── 6. MULTIPLICATOR MATERIAL ───
  const matMult = Number(material?.price_multiplier) || 1;
  if (matMult !== 1) {
    const adj = runningTotal * (matMult - 1);
    breakdown.push({
      category: 'Ajustare', item: `Multiplicator material ${material.name}`,
      calc: `${((matMult - 1) * 100).toFixed(0)}%`, price: adj, type: 'multiplier'
    });
    runningTotal += adj;
  }

  // ─── 7. MECANISME ───
  // Support both Configurator (sashConfigs with .type) and Bon Consum (sashMechanisms with IDs)
  const mechanismHeightPricing = productPricing?.mechanism_height_pricing || {};

  if (sashConfigs.length > 0) {
    // Configurator style: sash_configs[].type → mechanismHeightPricing lookup
    sashConfigs.forEach((sashConfig, idx) => {
      const mechType = sashConfig?.type || 'fix';
      const mechHeightRanges = mechanismHeightPricing[mechType];
      if (Array.isArray(mechHeightRanges) && mechHeightRanges.length > 0) {
        const match = mechHeightRanges
          .sort((a, b) => (a.max_height || 0) - (b.max_height || 0))
          .find(r => h >= (r.min_height || 0) && h <= (r.max_height || 9999));
        if (match && match.price_per_piece > 0) {
          breakdown.push({
            category: 'Mecanism', item: `Canat ${idx+1} (${mechType})`,
            calc: `Înălțime ${match.min_height || 0}-${match.max_height}mm → ${match.price_per_piece} €`,
            price: match.price_per_piece, type: 'mechanism'
          });
          runningTotal += match.price_per_piece;
        }
      }
    });
  } else if (sashMechanisms.length > 0) {
    // Bon Consum style: sashMechanisms[] with mechanism IDs
    sashMechanisms.forEach((mechId, idx) => {
      if (!mechId) return;
      const mech = mechanisms.find(m => m.id === mechId);
      if (!mech) return;

      // Priority 1: profile → product_specific_pricing → mechanism_height_pricing
      const mechRanges = mechanismHeightPricing[mech.code];
      if (Array.isArray(mechRanges) && mechRanges.length > 0) {
        const match = mechRanges
          .sort((a, b) => (a.max_height || 0) - (b.max_height || 0))
          .find(r => h >= (r.min_height || 0) && h <= r.max_height);
        if (match && match.price_per_piece > 0) {
          breakdown.push({
            category: 'Mecanism', item: `Canat ${idx+1}: ${mech.name} (${match.min_height || 0}-${match.max_height}mm)`,
            calc: `${match.price_per_piece} €/canat`, price: match.price_per_piece, type: 'mechanism'
          });
          runningTotal += match.price_per_piece;
          return;
        }
      }

      // Priority 2: mechanism's own height_price_grid
      if (Array.isArray(mech.height_price_grid) && mech.height_price_grid.length > 0) {
        const gridItem = mech.height_price_grid.find(g => h <= g.max_height);
        if (gridItem && gridItem.price > 0) {
          breakdown.push({
            category: 'Mecanism', item: `Canat ${idx+1}: ${mech.name}`,
            calc: `Grilă până la ${gridItem.max_height}mm`, price: gridItem.price, type: 'mechanism'
          });
          runningTotal += gridItem.price;
          return;
        }
      }

      // Priority 3: fallback to per-piece / per-ml
      if (Number(mech.price_per_piece) > 0) {
        breakdown.push({
          category: 'Mecanism', item: `Canat ${idx+1}: ${mech.name}`,
          calc: 'Preț per bucată', price: Number(mech.price_per_piece), type: 'mechanism'
        });
        runningTotal += Number(mech.price_per_piece);
      }
      if (Number(mech.price_per_linear_meter) > 0) {
        const mechCost = sashPerimeter * Number(mech.price_per_linear_meter);
        breakdown.push({
          category: 'Mecanism', item: `Canat ${idx+1}: ${mech.name} (per ml)`,
          calc: `${sashPerimeter.toFixed(2)} ml × ${mech.price_per_linear_meter} €/ml`,
          price: mechCost, type: 'mechanism'
        });
        runningTotal += mechCost;
      }
    });
  }

  // ─── 8. SUB-MATERIAL MULTIPLICATOR ───
  const subMatMult = Number(subMaterial?.price_multiplier) || 1;
  if (subMatMult !== 1) {
    const adj = runningTotal * (subMatMult - 1);
    breakdown.push({
      category: 'Ajustare', item: `Sub-material ${subMaterial.name}`,
      calc: `${((subMatMult - 1) * 100).toFixed(1)}%`, price: adj, type: 'multiplier'
    });
    runningTotal += adj;
  }

  // ─── 9. MULTIPLICATOR CULOARE ───
  const colorMult = Number(activeColor?.price_multiplier) || 1;
  if (colorMult !== 1) {
    const adj = runningTotal * (colorMult - 1);
    breakdown.push({
      category: 'Ajustare', item: `Multiplicator culoare ${activeColor.name}`,
      calc: `${((colorMult - 1) * 100).toFixed(0)}%`, price: adj, type: 'multiplier'
    });
    runningTotal += adj;
  }

  // ─── 10. ACCESORII ───
  if (accessories.length > 0) {
    accessories.forEach(acc => {
      const price = Number(acc.price) || 0;
      if (price > 0) {
        breakdown.push({
          category: 'Accesoriu', item: acc.name,
          calc: 'Preț fix', price, type: 'accessory'
        });
        runningTotal += price;
      }
    });
  }

  // ─── 11. TRANSPORT ───
  if (transportConfig?.include && material && product) {
    const matProductPricing = material.product_specific_pricing?.find(p => p.product_id === product.id);
    const profileProductPricing = productPricing;
    const pricing = matProductPricing || profileProductPricing;
    if (pricing) {
      const pricePerSqm = transportConfig.country === 'RO'
        ? Number(pricing.transport_ro_price_per_sqm) || 0
        : Number(pricing.transport_external_price_per_sqm) || 0;
      const transportCost = area * pricePerSqm;
      if (transportCost > 0) {
        breakdown.push({
          category: 'Transport', item: `Transport ${transportConfig.country}`,
          calc: `${area.toFixed(2)} m² × ${pricePerSqm} €/m²`, price: transportCost, type: 'transport'
        });
        runningTotal += transportCost;
      }
    }
  }

  // ─── 12. MONTAJ ───
  if (installConfig?.include && material && product) {
    const matProductPricing = material.product_specific_pricing?.find(p => p.product_id === product.id);
    const installPrice = Number(matProductPricing?.installation_price) || Number(matProductPricing?.hardware_fixed_price) || 0;
    if (installPrice > 0) {
      breakdown.push({
        category: 'Montaj', item: 'Montaj Profesional',
        calc: 'Preț fix', price: installPrice, type: 'installation'
      });
      runningTotal += installPrice;
    }
  }

  // ═══ COST BAZĂ (înainte de extra costs) ═══
  const costBaza = runningTotal;

  // ═══ EXTRA COSTS (opțional — doar pentru CostAnalysis / rapoarte) ═══
  const extraCostsBreakdown = [];
  let costWithExtras = costBaza;

  if (extraCosts !== null) {
    const ec = { ...DEFAULT_EXTRA_COSTS, ...(typeof extraCosts === 'object' ? extraCosts : {}) };

    // A. Pierderi material (waste)
    if (ec.waste_percent > 0) {
      const wasteCost = costBaza * (ec.waste_percent / 100);
      extraCostsBreakdown.push({
        category: 'Pierderi Material', calc: `${ec.waste_percent}% din ${costBaza.toFixed(2)} €`,
        price: wasteCost
      });
      costWithExtras += wasteCost;
    }

    // B. Adaos per categorie
    if (ec.adaos_profile_percent > 0) {
      const profileTotal = breakdown.filter(b => b.type === 'profile').reduce((s, b) => s + b.price, 0);
      const adj = profileTotal * (ec.adaos_profile_percent / 100);
      extraCostsBreakdown.push({ category: 'Adaos Profile', calc: `${ec.adaos_profile_percent}%`, price: adj });
      costWithExtras += adj;
    }
    if (ec.adaos_glass_percent > 0) {
      const glassTotal = breakdown.filter(b => b.type === 'glass').reduce((s, b) => s + b.price, 0);
      const adj = glassTotal * (ec.adaos_glass_percent / 100);
      extraCostsBreakdown.push({ category: 'Adaos Sticlă', calc: `${ec.adaos_glass_percent}%`, price: adj });
      costWithExtras += adj;
    }
    if (ec.adaos_hardware_percent > 0) {
      const hwTotal = breakdown.filter(b => b.type === 'hardware' || b.type === 'mechanism').reduce((s, b) => s + b.price, 0);
      const adj = hwTotal * (ec.adaos_hardware_percent / 100);
      extraCostsBreakdown.push({ category: 'Adaos Feronerie', calc: `${ec.adaos_hardware_percent}%`, price: adj });
      costWithExtras += adj;
    }

    // C. Manoperă per m²
    if (ec.montaj_per_sqm > 0) {
      const labourCost = area * ec.montaj_per_sqm;
      extraCostsBreakdown.push({
        category: 'Manoperă Producție', calc: `${area.toFixed(2)} m² × ${ec.montaj_per_sqm} €/m²`,
        price: labourCost
      });
      costWithExtras += labourCost;
    }

    // D. PROFIT (adaos comercial) — pe rezultat
    if (ec.profit_percent > 0) {
      const profitAmount = costWithExtras * (ec.profit_percent / 100);
      extraCostsBreakdown.push({
        category: 'Profit (Adaos)', calc: `${ec.profit_percent}% din ${costWithExtras.toFixed(2)} €`,
        price: profitAmount
      });
      costWithExtras += profitAmount;
    }

    // E. Transport fix per proiect (împărțit la qty)
    if (ec.transport_fixed > 0) {
      const perUnit = ec.transport_fixed / qty;
      extraCostsBreakdown.push({
        category: 'Transport (fix)', calc: `${ec.transport_fixed} € ÷ ${qty} buc`,
        price: perUnit
      });
      costWithExtras += perUnit;
    }
  }

  // ═══ TVA ═══
  const tvaPercent = extraCosts !== null ? (extraCosts?.tva_percent ?? 21) : 21;
  const subtotalPerUnit = costWithExtras;
  const subtotalTotal = subtotalPerUnit * qty;
  const tva = subtotalTotal * (tvaPercent / 100);
  const total = subtotalTotal + tva;

  return {
    breakdown,
    geometrie,
    costBaza,
    extraCostsBreakdown,
    subtotal: subtotalTotal,
    subtotalPerUnit,
    tva,
    tvaPercent,
    total,
    totalPerUnit: subtotalPerUnit + (subtotalPerUnit * tvaPercent / 100),
    quantity: qty,
  };
}
