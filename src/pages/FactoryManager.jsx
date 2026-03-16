import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Configuration } from '@/entities/Configuration';
import { Product } from '@/entities/Product';
import { Material } from '@/entities/Material';
import { GlazingType } from '@/entities/GlazingType';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Factory, Calendar, ClipboardList, Hammer, 
  ArrowRight, Search, Loader2, PackageOpen, Filter,
  Layers, Wrench, Ruler, Scissors, ChevronRight, Barcode, Settings
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DEFAULT_TECH_SETTINGS = {
  latimeProfilRama: 70,
  latimeProfilCercevea: 80,
  deducereSudura: 3,
  deducereMontaj: 10,
  deducereArmatura: 20, // milimetri scăzuți din cota exterioară a profilului PVC pt armătura interioară
  deducereFalt: 12     // mm adâncime bătaie falț per profil
};

// --- ENGINE PRODUCȚIE AVANSAT (Tip RA Workshop) ---
const AdvancedBOMEngine = (item, techSettings = DEFAULT_TECH_SETTINGS) => {
  const w = parseFloat(item.width) || 0;
  const h = parseFloat(item.height) || 0;
  const isFix = item.product_name?.toLowerCase().includes('fix');
  
  // Constante Industriale încărcate din setările personalizabile
  const { latimeProfilRama, latimeProfilCercevea, deducereSudura, deducereMontaj, deducereArmatura, deducereFalt } = techSettings;
  const isPVC = item.material_name?.toLowerCase().includes('pvc') || true; // Majoritatea folosesc armătură
  
  // RAMA
  const profiles = [
    { reper: 'Ramă Sus (Toc)', q: 1, latimeT: latimeProfilRama, lgBrut: w, unghiSt: 45, unghiDr: 45, cotaNeta: w - deducereSudura*2, tip: item.material_name, codBara: `RM-H-${w}-4545` },
    { reper: 'Ramă Jos (Toc)', q: 1, latimeT: latimeProfilRama, lgBrut: w, unghiSt: 45, unghiDr: 45, cotaNeta: w - deducereSudura*2, tip: item.material_name, codBara: `RM-H-${w}-4545` },
    { reper: 'Ramă Stânga (Toc)', q: 1, latimeT: latimeProfilRama, lgBrut: h, unghiSt: 45, unghiDr: 45, cotaNeta: h - deducereSudura*2, tip: item.material_name, codBara: `RM-V-${h}-4545`},
    { reper: 'Ramă Dreapta (Toc)', q: 1, latimeT: latimeProfilRama, lgBrut: h, unghiSt: 45, unghiDr: 45, cotaNeta: h - deducereSudura*2, tip: item.material_name, codBara: `RM-V-${h}-4545` }
  ];

  // ARMĂTURĂ RAMĂ (Tăiere la 90 grade, mai scurtă cu deducereArmatura)
  if (isPVC) {
    profiles.push({ reper: 'Armătură Ramă Orizontală', q: 2, latimeT: 30, lgBrut: w - deducereArmatura, unghiSt: 90, unghiDr: 90, cotaNeta: w - deducereArmatura, tip: 'Metal', codBara: `AR-H-${w-deducereArmatura}-9090` });
    profiles.push({ reper: 'Armătură Ramă Verticală', q: 2, latimeT: 30, lgBrut: h - deducereArmatura, unghiSt: 90, unghiDr: 90, cotaNeta: h - deducereArmatura, tip: 'Metal', codBara: `AR-V-${h-deducereArmatura}-9090` });
  }

  // CERCEVEA (Daca nu e fix)
  let coteSticla = { w: w - 2*latimeProfilRama - deducereMontaj, h: h - 2*latimeProfilRama - deducereMontaj };
  let lgCerceveaOriz = 0, lgCerceveaVert = 0;
  
  if (!isFix) {
    // Suprapunerea pe falț = lățime ramă - joc + bătaie (aprox 16mm total per cotă)
    lgCerceveaOriz = w - (2 * latimeProfilRama) + 16; 
    lgCerceveaVert = h - (2 * latimeProfilRama) + 16;
    
    profiles.push({ reper: 'Cercevea Orizontală', q: 2, latimeT: latimeProfilCercevea, lgBrut: lgCerceveaOriz, unghiSt: 45, unghiDr: 45, cotaNeta: lgCerceveaOriz - deducereSudura*2, tip: item.material_name, codBara: `CR-H-${lgCerceveaOriz}-4545` });
    profiles.push({ reper: 'Cercevea Verticală', q: 2, latimeT: latimeProfilCercevea, lgBrut: lgCerceveaVert, unghiSt: 45, unghiDr: 45, cotaNeta: lgCerceveaVert - deducereSudura*2, tip: item.material_name, codBara: `CR-V-${lgCerceveaVert}-4545` });
    
    if (isPVC) {
       profiles.push({ reper: 'Armătură Cercevea Orizontală', q: 2, latimeT: 30, lgBrut: lgCerceveaOriz - deducereArmatura, unghiSt: 90, unghiDr: 90, cotaNeta: lgCerceveaOriz - deducereArmatura, tip: 'Metal', codBara: `AC-H-${lgCerceveaOriz-deducereArmatura}-9090` });
       profiles.push({ reper: 'Armătură Cercevea Verticală', q: 2, latimeT: 30, lgBrut: lgCerceveaVert - deducereArmatura, unghiSt: 90, unghiDr: 90, cotaNeta: lgCerceveaVert - deducereArmatura, tip: 'Metal', codBara: `AC-V-${lgCerceveaVert-deducereArmatura}-9090` });
    }

    coteSticla = { 
      w: lgCerceveaOriz - 2*latimeProfilCercevea + 2*deducereFalt - deducereMontaj, 
      h: lgCerceveaVert - 2*latimeProfilCercevea + 2*deducereFalt - deducereMontaj 
    };
  } else {
    // Calcul sticlă pentru element fix 
    coteSticla = {
      w: w - 2*latimeProfilRama + 2*deducereFalt - deducereMontaj,
      h: h - 2*latimeProfilRama + 2*deducereFalt - deducereMontaj
    };
  }

  // BAGHETE STICLĂ
  profiles.push({ reper: 'Baghetă Orizontală', q: 2, latimeT: 20, lgBrut: coteSticla.w + 4, unghiSt: 90, unghiDr: 90, cotaNeta: coteSticla.w, tip: 'Baghetă', codBara: `BG-H-${coteSticla.w}-9090` });
  profiles.push({ reper: 'Baghetă Verticală', q: 2, latimeT: 20, lgBrut: coteSticla.h + 4, unghiSt: 90, unghiDr: 90, cotaNeta: coteSticla.h, tip: 'Baghetă', codBara: `BG-V-${coteSticla.h}-9090` });

  const glassArea = Math.max(0, (coteSticla.w * coteSticla.h) / 1000000);

  // FERONERIE AVANSATĂ
  const hardware = isFix ? [
    { reper: 'Clips Prindere Bagheta', q: 12, cod: 'CL-BAG-90' },
    { reper: 'Bucăți Calare Sticlă (Pod de sticlă)', q: 4, cod: 'CAL-01' },
    { reper: 'Șurub Auto-Filetant 3.9x25', q: 8, cod: 'SRB-3925' }
  ] : [
    { reper: 'Cremon (Transmisie Principală)', q: Math.ceil(h / 1000), cod: `CRM-${h > 1500 ? 'L' : 'S'}` },
    { reper: 'Transmisie de Colț (Corner Drive)', q: 1, cod: 'CRN-DRV' },
    { reper: 'Foarfecă (Oscilo-Batant)', q: 1, cod: `SCIS-${w > 800 ? 'L' : 'S'}` },
    { reper: 'Balama Superioară (Toc+Cercevea)', q: 1, cod: 'BLM-TOP-01' },
    { reper: 'Balama Inferioară (Toc+Cercevea)', q: 1, cod: 'BLM-BTM-01' },
    { reper: 'Blocatori (Puncte Închidere)', q: 2 + Math.floor(h/600), cod: 'BLC-01' },
    { reper: 'Mâner Fereastră (Olive)', q: 1, cod: 'MNR-ALU-01' },
    { reper: 'Cale susținere greutate 2mm/3mm', q: 6, cod: 'CAL-05' },
    { reper: 'Șurub Feronerie 4x35', q: 24, cod: 'SRB-4035' }
  ];

  // SUMAR DETALIAT DE COTE
  const summary = {
    gabarit: { w, h },
    luminaLibera: { w: w - 2*latimeProfilRama, h: h - 2*latimeProfilRama },
    cerceveaNet: isFix ? null : { w: lgCerceveaOriz, h: lgCerceveaVert },
    sticlaCut: coteSticla,
    zonaFalt: deducereFalt
  };

  return { 
    profiles, 
    glass: { w: Math.max(0, coteSticla.w), h: Math.max(0, coteSticla.h), area: glassArea.toFixed(2), type: item.glazing_name || 'Sticlă Necunoscută' }, 
    hardware,
    summary
  };
};

// --- COMPONENTĂ GRAFICĂ TEHNICĂ (Planșă) ---
// @ts-ignore
const TechnicalDrawing = ({ w, h, isFix, isDoor, summary }) => {
  const scale = Math.min(300 / w, 400 / h);
  const drawW = w * scale;
  const drawH = h * scale;
  
  // Proporții vizuale false dar sugestive pentru SVG
  const frameThick = 25; 
  const sashThick = 20;
  
  // Pentru uși, mânerul e fixat la cota de 1050mm, altfel la jumătate
  const handleYPos = isDoor ? drawH - (1050 * scale) : drawH/2;

  return (
    <div className="relative border-4 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center p-8 h-full min-h-[500px]">
      <div className="relative mb-12">
         {/* EXTERIOR (Gabarit Total) Cotă Top */}
         <div className="absolute -top-12 left-0 right-0 flex items-center justify-center">
            <div className="h-[1px] w-full bg-blue-600 relative opacity-60">
               <div className="absolute left-0 -top-1.5 w-[1px] h-3 bg-blue-600"></div>
               <div className="absolute right-0 -top-1.5 w-[1px] h-3 bg-blue-600"></div>
            </div>
            <span className="absolute -top-6 text-sm font-black text-blue-700 bg-slate-50 px-2 rounded-full border border-blue-100">{w} mm</span>
         </div>
         
         {/* EXTERIOR (Gabarit Total) Cotă Dreapta */}
         <div className="absolute top-0 bottom-0 -right-12 flex flex-col items-center justify-center">
            <div className="w-[1px] h-full bg-blue-600 relative opacity-60">
               <div className="absolute top-0 -left-1.5 h-[1px] w-3 bg-blue-600"></div>
               <div className="absolute bottom-0 -left-1.5 h-[1px] w-3 bg-blue-600"></div>
            </div>
            <span className="absolute -right-16 text-sm font-black text-blue-700 bg-slate-50 px-2 rounded-full border border-blue-100 rotate-90">{h} mm</span>
         </div>

         {/* INTERIOR Cotă (Cercevea sau Lumină) Top - Dacă avem spațiu vizual */}
         {summary && (
           <div className="absolute -top-5 left-[25px] right-[25px] flex items-center justify-center z-10">
              <div className="h-[1px] w-full bg-emerald-500 relative opacity-70">
                 <div className="absolute left-0 -top-1.5 w-[1px] h-3 bg-emerald-500"></div>
                 <div className="absolute right-0 -top-1.5 w-[1px] h-3 bg-emerald-500"></div>
              </div>
              <span className="absolute -top-4 text-[10px] font-bold text-emerald-700 bg-slate-50 px-1">{isFix ? summary.luminaLibera.w : summary.cerceveaNet.w} mm</span>
           </div>
         )}
         
         {/* The Drawing SVG */}
         <svg width={drawW} height={drawH} className="drop-shadow-xl overflow-visible">
            {/* Outer Frame (Toc) */}
            <rect x="0" y="0" width={drawW} height={drawH} fill="#f8fafc" stroke="#475569" strokeWidth="2" />
            
            {/* Falț Toc (Lumina) - Lăsăm prag de aluminiu la uși jos */}
            <rect x={frameThick} y={frameThick} width={drawW - frameThick*2} height={drawH - frameThick - (isDoor ? 10 : frameThick)} fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
            
            {isDoor && (
              <>
                {/* Prag aluminiu jos pentru uși */}
                <rect x={frameThick} y={drawH - 10} width={drawW - frameThick*2} height={10} fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
              </>
            )}
            
            {/* Sash (Cercevea) if not fix */}
            {!isFix && (
              <>
                 {/* Gabarit Cercevea (Overlap peste ramă) */}
                 <rect x={frameThick - 4} y={frameThick - 4} width={drawW - (frameThick-4)*2} height={drawH - (frameThick-4) - (isDoor ? 8 : frameThick-4)} fill="#ffffff" stroke="#64748b" strokeWidth="1.5" />
                 
                 {/* Sticlă Cercevea */}
                 <rect x={frameThick + sashThick} y={frameThick + sashThick} width={drawW - (frameThick+sashThick)*2} height={drawH - (frameThick+sashThick) - (isDoor ? 8 + sashThick : frameThick+sashThick)} fill="#bae6fd" stroke="#7dd3fc" strokeWidth="1" opacity="0.8" />
                 
                 {/* Mâner de Operare */}
                 <rect x={drawW - frameThick*1.2} y={handleYPos - 15} width={4} height={isDoor ? 50 : 30} fill="#334155" rx="2" />
                 
                 {/* Linii Deschidere (Balamale în dreapta, deschidere spre stânga = standard) */}
                 <polygon points={`${frameThick-4},${handleYPos} ${drawW - frameThick+4},${frameThick-4} ${drawW - frameThick+4},${drawH - (isDoor ? 8 : frameThick-4)}`} fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="5 5" opacity="0.6"/>
              </>
            )}

             {isFix && (
               <>
                 {/* Sticlă Fixă */}
                 <rect x={frameThick + 5} y={frameThick + 5} width={drawW - (frameThick+5)*2} height={drawH - (frameThick+5) - (isDoor ? 15 : frameThick+5)} fill="#bae6fd" stroke="#7dd3fc" strokeWidth="1" opacity="0.8" />
               </>
             )}
            
            {/* Diagonale sudură ramă exterioară */}
            <line x1="0" y1="0" x2={frameThick} y2={frameThick} stroke="#94a3b8" strokeWidth="1" />
            <line x1={drawW} y1="0" x2={drawW - frameThick} y2={frameThick} stroke="#94a3b8" strokeWidth="1" />
            <line x1="0" y1={drawH} x2={frameThick} y2={drawH - frameThick} stroke="#94a3b8" strokeWidth="1" />
            <line x1={drawW} y1={drawH} x2={drawW - frameThick} y2={drawH - frameThick} stroke="#94a3b8" strokeWidth="1" />
         </svg>
      </div>
      
      {/* Detalii Tabelare sub desen */}
      {summary && (
        <div className="w-full max-w-sm mt-8 border border-slate-200 rounded-lg overflow-hidden bg-white text-xs">
           <div className="bg-slate-100 px-3 py-2 font-bold text-slate-700 border-b border-slate-200 flex justify-between">
             <span>Sumar Cote Fabricație</span>
             <Badge className="bg-blue-600 text-[9px]">GATA DE UZ</Badge>
           </div>
           <div className="divide-y divide-slate-100">
             <div className="px-3 py-1.5 flex justify-between"><span className="text-slate-500">Lumină Ramă:</span> <span className="font-mono font-bold">{summary.luminaLibera.w} × {summary.luminaLibera.h}</span></div>
             {!isFix && (
               <div className="px-3 py-1.5 flex justify-between"><span className="text-slate-500">Lățime Totală Cercevea:</span> <span className="font-mono font-bold text-emerald-700">{summary.cerceveaNet.w}</span></div>
             )}
             <div className="px-3 py-1.5 flex justify-between bg-cyan-50/50"><span className="text-slate-600 font-medium">Cotă Tăiere Sticlă:</span> <span className="font-mono font-black text-cyan-800">{summary.sticlaCut.w} × {summary.sticlaCut.h}</span></div>
           </div>
        </div>
      )}

      <Badge className="absolute bottom-2 left-2 bg-slate-800 opacity-30 hover:opacity-100 transition-opacity">Scară Generată Vizual</Badge>
    </div>
  );
};

// --- MOTOR OPTIMIZARE LINIARĂ (1D Bin Packing pe bare de 6m) ---
// @ts-ignore
const CuttingOptimization = ({ profiles, quantity = 1, barLength = 6000 }) => {
  // 1. Pregătim toate piesele (înmulțim cu cantitatea de ferestre)
  const allPieces = [];
  profiles.forEach(p => {
    for (let i = 0; i < p.q * quantity; i++) {
        // adăugăm 5mm toleranță tăiere (grosime pânză)
      allPieces.push({ ...p, cutLength: p.lgBrut + 5 });
    }
  });

  // 2. Grupăm pe tipuri de profil (ex: Ramă vs Cercevea vs Baghetă)
  const groupedPieces = allPieces.reduce((acc, p) => {
    const key = p.tip + ' - ' + p.reper.split(' ')[0]; // ex: "PVC - Ramă"
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  // 3. Rulăm First Fit Decreasing (FFD) pt fiecare grup
  const optimizationResults = Object.entries(groupedPieces).map(([groupName, pieces]) => {
    // Sortăm descrescător după lungime
    pieces.sort((a, b) => b.cutLength - a.cutLength);
    
    const bars = [];
    pieces.forEach(piece => {
      // Căutăm prima bară unde încape (First Fit)
      const targetBar = bars.find(b => b.remaining >= piece.cutLength);
      if (targetBar) {
        targetBar.cuts.push(piece);
        targetBar.remaining -= piece.cutLength;
      } else {
        // Bară nouă
        bars.push({
          remaining: barLength - piece.cutLength,
          cuts: [piece]
        });
      }
    });
    
    return { groupName, bars };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300 print:mt-12">
      <div className="flex items-center justify-between mb-6">
         <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
           <PackageOpen className="w-5 h-5 text-indigo-600"/> Optimizare Liniară CNC
         </h3>
         <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">Bare Standard: {barLength / 1000}m</Badge>
      </div>

      {optimizationResults.map((result, idx) => {
        const totalWaste = result.bars.reduce((sum, b) => sum + b.remaining, 0);
        const totalAllocated = result.bars.length * barLength;
        const efficiency = ((totalAllocated - totalWaste) / totalAllocated * 100).toFixed(1);

        return (
          <div key={idx} className="bg-white border text-sm border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
               <span className="font-bold text-slate-700">{result.groupName}</span>
               <div className="flex gap-4">
                 <span className="text-slate-500">Bare vizate: <strong>{result.bars.length} buc</strong></span>
                 <span className={Number(efficiency) > 85 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>Randament: {efficiency}%</span>
               </div>
            </div>
            <div className="p-4 space-y-5">
               {result.bars.map((bar, bIdx) => (
                 <div key={bIdx} className="space-y-1">
                   <div className="flex justify-between text-xs text-slate-500 mb-1">
                     <span>Bară #{bIdx + 1} ({barLength}mm)</span>
                     <span>Rest (Rebut): <span className="text-red-500 font-bold">{bar.remaining}mm</span></span>
                   </div>
                   {/* Reprezentare vizuală bară */}
                   <div className="h-10 w-full bg-slate-100 rounded-md border border-slate-300 flex overflow-hidden">
                      {bar.cuts.map((cut, cIdx) => {
                         const pct = (cut.lgBrut / barLength) * 100;
                         // Generate slight color variation
                         const isFrame = cut.reper.includes('Ramă');
                         const isSash = cut.reper.includes('Cercevea');
                         let colorCls = "bg-slate-300";
                         if (isFrame) colorCls = "bg-blue-400 border-blue-500";
                         else if (isSash) colorCls = "bg-sky-400 border-sky-500";
                         else colorCls = "bg-indigo-400 border-indigo-500";

                         return (
                           <div key={cIdx} style={{ width: `${pct}%` }} className={`h-full border-r ${colorCls} flex flex-col items-center justify-center text-[10px] text-white font-bold px-1 relative group cursor-crosshair`}>
                              <span className="truncate w-full text-center">{cut.lgBrut}</span>
                              {/* Tooltip on hover */}
                              <div className="absolute hidden group-hover:block bottom-full mb-2 bg-slate-800 text-white text-xs p-2 rounded whitespace-nowrap z-10">
                                {cut.reper} ({cut.codBara})
                              </div>
                           </div>
                         )
                      })}
                      {/* Rest material (Waste) */}
                      {bar.remaining > 0 && (
                        <div style={{ width: `${(bar.remaining / barLength) * 100}%` }} className="h-full bg-stripes-red bg-red-50 flex items-center justify-center text-[10px] text-red-400 font-bold">
                           {bar.remaining}
                        </div>
                      )}
                   </div>
                 </div>
               ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function FactoryManager() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // UI State pt Master-Detail
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('grafica'); // grafica | taiere | sticla | feronerie

  // State Setări Tehnologice (Persistente)
  const [techSettings, setTechSettings] = useState(() => {
    const saved = localStorage.getItem('rowood_tech_settings');
    const parsedObj = saved ? JSON.parse(saved) : {};
    return { ...DEFAULT_TECH_SETTINGS, ...parsedObj }; // Mereu ia valorile default pt cheile lipsa
  });

  const handleSettingsChange = (key, value) => {
    const newSettings = { ...techSettings, [key]: Number(value) };
    setTechSettings(newSettings);
    localStorage.setItem('rowood_tech_settings', JSON.stringify(newSettings));
  };

  const [resolvedItems, setResolvedItems] = useState([]);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false);

  const fetchProductionOrders = async () => {
    setIsLoading(true);
    try {
      const allOrders = await base44.entities.Order.list();
      // Show ALL orders, not just paid+confirmed (so user can see all)
      const factoryOrders = allOrders
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      setOrders(factoryOrders);
    } catch (error) {
      console.error("Error fetching factory orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load real configurations when an order is selected
  const loadOrderConfigurations = useCallback(async (order) => {
    setIsLoadingConfigs(true);
    try {
      // STRATEGY 0 (BEST): Use configuration_snapshots embedded on Order (new orders)
      // Check direct field first, then try JSON encoded in notes
      let snapshots = order.configuration_snapshots;
      if (!Array.isArray(snapshots) || snapshots.length === 0) {
        // Try parsing from notes field (base44 workaround - notes is a string field that persists)
        if (order.notes && typeof order.notes === 'string' && order.notes.startsWith('[CONFIG_SNAPSHOTS]')) {
          try {
            snapshots = JSON.parse(order.notes.replace('[CONFIG_SNAPSHOTS]', ''));
          } catch(e) {
            console.warn('Failed to parse config snapshots from notes:', e);
          }
        }
      }
      if (Array.isArray(snapshots) && snapshots.length > 0) {
        setResolvedItems(snapshots);
        setIsLoadingConfigs(false);
        return;
      }

      // FALLBACK for older orders without snapshots: try API lookups
      const [products, materials, glazingTypes] = await Promise.all([
        Product.list(),
        Material.list(),
        GlazingType.list(),
      ]);

      let rawItems = [];

      // Strategy 1: CartItem by order_id
      try {
        const cartItems = await base44.entities.CartItem.filter({ order_id: order.id });
        if (cartItems && cartItems.length > 0) {
          rawItems = cartItems.map(item => {
            const config = item.configuration || {};
            const product = products.find(p => p.id === (config.product_id || item.product_id));
            const material = materials.find(m => m.id === config.material_id);
            const glazing = glazingTypes.find(g => g.id === config.glazing_id);
            return {
              product_name: product?.name || item.product_name || 'Produs',
              width: config.width || 800,
              height: config.height || 1200,
              quantity: item.quantity || 1,
              material_name: material?.name || 'PVC',
              glazing_name: glazing?.name || 'Sticlă',
              sash_configs: config.sash_configs || [],
              opening_type_summary: config.opening_type_summary || '',
            };
          });
        }
      } catch (e) {
        console.log('CartItem by order_id failed');
      }

      // Strategy 2: Configuration entities by ID
      if (rawItems.length === 0) {
        const configIds = order.configurations || [];
        for (const confId of configIds) {
          try {
            const config = await Configuration.get(confId);
            if (config) {
              const product = products.find(p => p.id === config.product_id);
              const material = materials.find(m => m.id === config.material_id);
              const glazing = glazingTypes.find(g => g.id === config.glazing_id);
              rawItems.push({
                product_name: product?.name || 'Produs',
                width: config.width || 800,
                height: config.height || 1200,
                quantity: config.quantity || 1,
                material_name: material?.name || 'PVC',
                glazing_name: glazing?.name || 'Sticlă',
                sash_configs: config.sash_configs || [],
                opening_type_summary: config.opening_type_summary || '',
              });
            }
          } catch { /* skip failed */ }
        }
      }

      setResolvedItems(rawItems);
    } catch (error) {
      console.error("Error loading configurations:", error);
      setResolvedItems([]);
    } finally {
      setIsLoadingConfigs(false);
    }
  }, []);

  useEffect(() => {
    fetchProductionOrders();
  }, []);

  // FILTERS
  const filteredOrders = orders.filter(o => 
    o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  // VIEW: LISTA COMENZI GATA DE PRODUS (Main Page)
  if (!selectedOrder) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
             <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <Factory className="w-8 h-8 text-blue-600" />
              Sistem Producție & CNC
            </h1>
            <p className="text-slate-500 mt-1">Centru industrial de comandă pentru listele de tăiere, sticlă și feronerie.</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="bg-white p-1 rounded-md border border-slate-200 shadow-sm relative">
               <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                 type="text"
                 placeholder="Căutare comandă..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="pl-9 pr-4 py-2 w-64 text-sm bg-transparent border-none focus:outline-none focus:ring-0"
               />
             </div>

             <Sheet>
               <SheetTrigger asChild>
                 <Button variant="outline" className="bg-white gap-2 shadow-sm font-semibold max-h-[42px]">
                    <Settings className="w-4 h-4"/>
                    Setări Producție
                 </Button>
               </SheetTrigger>
               <SheetContent className="overflow-y-auto">
                 <SheetHeader>
                   <SheetTitle className="flex items-center gap-2 text-xl"><Settings className="w-5 h-5 text-indigo-600"/> Parametri Tehnologici</SheetTitle>
                   <SheetDescription>
                     Ajustează deducerile de fabricare. Ele se vor aplica global pe toate calculele viitoare din tab-urile tehnologice.
                   </SheetDescription>
                 </SheetHeader>
                 
                 <div className="grid gap-6 py-6">
                   <div className="space-y-4 rounded-lg bg-slate-50 p-4 border border-slate-100">
                     <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Profile & Tâmplărie</h4>
                     <div className="grid gap-2">
                       <Label>Lățime Profil Ramă (mm)</Label>
                       <Input type="number" value={techSettings.latimeProfilRama} onChange={(e) => handleSettingsChange('latimeProfilRama', e.target.value)} />
                     </div>
                     <div className="grid gap-2">
                       <Label>Lățime Profil Cercevea (mm)</Label>
                       <Input type="number" value={techSettings.latimeProfilCercevea} onChange={(e) => handleSettingsChange('latimeProfilCercevea', e.target.value)} />
                     </div>
                   </div>

                   <div className="space-y-4 rounded-lg bg-slate-50 p-4 border border-slate-100">
                     <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Deduceri (Calcule Sticlă & Tăiere)</h4>
                     <div className="grid gap-2">
                       <Label>Deducere Topire Sudură PVC (mm)</Label>
                       <p className="text-[10px] text-slate-500 mb-1 leading-snug">Cât se pierde la sudura de colț a PVC-ului. La lemn este de obicei 0.</p>
                       <Input type="number" value={techSettings.deducereSudura} onChange={(e) => handleSettingsChange('deducereSudura', e.target.value)} />
                     </div>
                     <div className="grid gap-2">
                       <Label>Joc de Montaj Sticlă / Spațiu Calare (mm)</Label>
                       <p className="text-[10px] text-slate-500 mb-1 leading-snug">Deducere totală aplicată cotei de sticlă pentru a acomoda podurile de calare.</p>
                       <Input type="number" value={techSettings.deducereMontaj} onChange={(e) => handleSettingsChange('deducereMontaj', e.target.value)} />
                     </div>
                   </div>
                 </div>
               </SheetContent>
             </Sheet>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <Card className="col-span-1 border-slate-200 shadow-sm hover:shadow-md transition-all">
             <CardContent className="p-6">
                <p className="text-sm font-medium text-slate-500">Comenzi Gata</p>
                <p className="text-3xl font-bold text-slate-900">{filteredOrders.length}</p>
             </CardContent>
           </Card>
           <Card className="col-span-1 border-slate-200 shadow-sm hover:shadow-md transition-all">
             <CardContent className="p-6">
                <p className="text-sm font-medium text-slate-500">Unelte Tăiere (CNC)</p>
                <p className="text-3xl font-bold text-emerald-600">Online</p>
             </CardContent>
           </Card>
        </div>

        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-12 text-center text-slate-500"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-400" /></div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-slate-500">Nu există comenzi pentru validat tehnic.</div>
            ) : (
              filteredOrders.map(order => (
                <div 
                  key={order.id} 
                  className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer"
                  onClick={() => { setSelectedOrder(order); setActiveItemIndex(0); setActiveTab('grafica'); loadOrderConfigurations(order); }}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-slate-100 items-center justify-center border border-slate-200 flex shrink-0">
                      <ClipboardList className="w-6 h-6 text-slate-600 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">#{order.order_number || order.id.slice(-8).toUpperCase()}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1 font-medium">{order.customer_name}</span>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-1">{format(parseISO(order.created_date), 'dd MMM yyyy', { locale: ro })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-slate-500 mb-0.5">Linii Producție</p>
                    <div className="flex items-center gap-2 justify-end">
                      <Badge variant="outline" className="bg-white">{order.configurations?.length || 0} repere</Badge>
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    );
  }

  // FIȘĂ DE PRODUCȚIE - MASTER / DETAIL VIEW
  // Folosim configurațiile reale încărcate din baza de date
  const orderItems = resolvedItems;

  if (isLoadingConfigs) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-slate-600 font-medium">Se încarcă configurațiile comenzii...</p>
      </div>
    );
  }

  if (orderItems.length === 0) {
    return (
      <div className="p-12 text-center">
        <PackageOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <p className="text-slate-600 font-medium text-lg">Această comandă nu are configurații salvate.</p>
        <Button variant="outline" className="mt-4" onClick={() => setSelectedOrder(null)}>← Înapoi la Comenzi</Button>
      </div>
    );
  }

  const activeItem = orderItems[activeItemIndex] || orderItems[0];
  const bomData = activeItem ? AdvancedBOMEngine(activeItem, techSettings) : null;
  const isFix = activeItem?.product_name?.toLowerCase().includes('fix');
  const isDoor = activeItem?.product_name?.toLowerCase().includes('uș') || activeItem?.product_name?.toLowerCase().includes('ua') || activeItem?.product_name?.toLowerCase().includes('usa');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* HEADER FIȘĂ */}
      <div className="bg-slate-900 py-4 px-6 md:px-8 text-white flex justify-between items-center shadow-md z-10 print:hidden">
        <div className="flex items-center gap-6">
           <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800 px-2" onClick={() => setSelectedOrder(null)}>
             <ArrowRight className="w-5 h-5 mr-2 rotate-180" /> Dashboard
           </Button>
           <div className="h-6 w-px bg-slate-700 hidden md:block"></div>
           <div>
             <h2 className="text-lg font-bold flex items-center gap-2">
               CMD: #{selectedOrder.order_number || selectedOrder.id.slice(-8).toUpperCase()}
               <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">Plătită</Badge>
             </h2>
             <p className="text-xs text-slate-400">Client: {selectedOrder.customer_name}</p>
           </div>
        </div>
        <div className="flex gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => window.print()}>
              Export PDF CNC
            </Button>
        </div>
      </div>

      {/* MASTER-DETAIL GRID */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* SIDEBAR - POSITIONs (Master) */}
        <div className="w-full md:w-80 bg-white border-r border-slate-200 overflow-y-auto shrink-0 print:hidden shadow-[4px_0_24px_-15px_rgba(0,0,0,0.1)] z-0">
          <div className="p-4 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Linii de Fabricat ({resolvedItems.length})</span>
            {resolvedItems.length > 0 && (
              <Badge variant="outline" className="text-[9px] bg-green-50 text-green-700 border-green-200 uppercase">Date Reale din Comandă</Badge>
            )}
          </div>
          <div className="divide-y divide-slate-100">
            {orderItems.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => { setActiveItemIndex(idx); setActiveTab('grafica'); }}
                className={`p-4 cursor-pointer transition-all border-l-4 ${idx === activeItemIndex ? 'bg-blue-50/50 border-blue-600' : 'border-transparent hover:bg-slate-50'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`font-bold text-sm ${idx === activeItemIndex ? 'text-blue-700' : 'text-slate-700'}`}>Poz. {idx + 1}</span>
                  <Badge variant="outline" className={idx === activeItemIndex ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}>x{item.quantity}</Badge>
                </div>
                <p className="text-sm font-medium text-slate-800 line-clamp-1">{item.product_name}</p>
                <p className="text-xs text-slate-500 mt-1">Cotă Golaș: {item.width}x{item.height} mm</p>
              </div>
            ))}
          </div>
        </div>

        {/* WORKSPACE - DETAILS (Detail) */}
        <div className="flex-1 bg-slate-50/50 overflow-y-auto p-4 md:p-8">
           {activeItem && bomData && (
             <div className="max-w-5xl mx-auto space-y-6">
               
               {/* ITEM SUMMARY HEADER */}
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6 print:border-b-2 print:rounded-none print:shadow-none">
                 <div>
                   <h1 className="text-2xl font-bold text-slate-900 mb-1">Poziția {activeItemIndex + 1}: {activeItem.product_name}</h1>
                   <div className="flex gap-4 text-sm text-slate-600 mt-3">
                     <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-md"><Ruler className="w-4 h-4 text-blue-600"/> L: {activeItem.width} x H: {activeItem.height} mm</span>
                     <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-md"><Layers className="w-4 h-4 text-emerald-600"/> {activeItem.material_name}</span>
                   </div>
                 </div>
                 <div className="text-left sm:text-right border-t sm:border-none pt-4 sm:pt-0">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Volum</p>
                    <p className="text-3xl font-black text-slate-800">{activeItem.quantity} <span className="text-lg text-slate-400 font-medium">UNITĂȚI</span></p>
                 </div>
               </div>

               {/* CUSTOM TABS FOR INDUSTRIAL SETTINGS */}
               <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">
                 <div className="flex border-b border-slate-100 bg-slate-50/50 overflow-x-auto print:hidden">
                    <button onClick={() => setActiveTab('grafica')} className={`px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'grafica' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                      <Ruler className="w-4 h-4"/> Grafică & Cote
                    </button>
                    <button onClick={() => setActiveTab('taiere')} className={`px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'taiere' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                      <Scissors className="w-4 h-4"/> Listă Debitări Profil
                    </button>
                    <button onClick={() => setActiveTab('optimizare')} className={`px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'optimizare' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                      <PackageOpen className="w-4 h-4"/> Optimizare Bare (6m)
                    </button>
                    <button onClick={() => setActiveTab('sticla')} className={`px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'sticla' ? 'border-cyan-600 text-cyan-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                      <Layers className="w-4 h-4"/> Sticlă Termopan
                    </button>
                    <button onClick={() => setActiveTab('feronerie')} className={`px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'feronerie' ? 'border-orange-600 text-orange-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                      <Wrench className="w-4 h-4"/> Feronerie Montaj
                    </button>
                    <button onClick={() => setActiveTab('etichete')} className={`px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'etichete' ? 'border-purple-600 text-purple-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                      <Barcode className="w-4 h-4"/> Etichete / Coduri Bare
                    </button>
                 </div>

                 <div className="p-6">
                   {/* TAB 1: Grafica */}
                   <div className={`animate-in fade-in duration-300 ${activeTab === 'grafica' ? 'block' : 'hidden print:block'}`}>
                      <div className="print:pb-8">
                        <h3 className="hidden print:flex text-lg font-bold mb-4 items-center gap-2"><Ruler className="w-5 h-5"/> Planșă Tehnică & Cote</h3>
                        <TechnicalDrawing w={activeItem.width} h={activeItem.height} isFix={isFix} isDoor={isDoor} summary={bomData.summary} />
                      </div>
                   </div>

                   {/* TAB 2: Tăieri (CNC Optimization Table) */}
                   <div className={`animate-in fade-in duration-300 print:mt-12 print:break-before-page ${activeTab === 'taiere' ? 'block' : 'hidden print:block'}`}>
                       <h3 className="hidden print:flex text-lg font-bold mb-4 items-center gap-2"><Scissors className="w-5 h-5"/> Listă Tăieri Pentru CNC</h3>
                       <div className="overflow-x-auto">
                         <table className="w-full text-left text-sm whitespace-nowrap">
                           <thead>
                             <tr className="bg-slate-100 text-slate-600">
                               <th className="px-4 py-3 rounded-tl-lg">Cod CNC (Barcode)</th>
                               <th className="px-4 py-3">Piesă / Reper</th>
                               <th className="px-4 py-3 text-center">Cant. / Fereastră</th>
                               <th className="px-4 py-3 text-right">Cotă Brută (L)</th>
                               <th className="px-4 py-3 text-center">Tăiere St | Dr</th>
                               <th className="px-4 py-3 rounded-tr-lg text-right font-bold text-emerald-700">TOTAL BUC (x{activeItem.quantity})</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                             {bomData.profiles.map((p, i) => (
                               <tr key={i} className="hover:bg-slate-50 transition-colors">
                                 <td className="px-4 py-3 font-mono text-xs text-slate-500">
                                   <div className="flex items-center gap-2">
                                     <Barcode className="w-4 h-4 text-slate-300" />
                                     {p.codBara}
                                   </div>
                                 </td>
                                 <td className="px-4 py-3 font-semibold text-slate-800">{p.reper}</td>
                                 <td className="px-4 py-3 text-center text-slate-600">{p.q}</td>
                                 <td className="px-4 py-3 text-right font-bold text-slate-900">{p.lgBrut} mm</td>
                                 <td className="px-4 py-3 text-center font-mono text-xs text-slate-400 bg-slate-50/50">
                                   {p.unghiSt}° / \ {p.unghiDr}°
                                 </td>
                                 <td className="px-4 py-3 text-right font-black text-emerald-700">{p.q * activeItem.quantity}</td>
                               </tr>
                             ))}
                           </tbody>
                         </table>
                       </div>
                     </div>

                   {/* TAB 2.5: Optimizare Liniară Bare */}
                   <div className={`animate-in fade-in duration-300 print:break-before-page ${activeTab === 'optimizare' ? 'block' : 'hidden print:block'}`}>
                        <CuttingOptimization profiles={bomData.profiles} quantity={activeItem.quantity} barLength={6000} />
                   </div>

                   {/* TAB 3: Sticla */}
                   <div className={`animate-in fade-in duration-300 print:mt-12 print:break-inside-avoid ${activeTab === 'sticla' ? 'block' : 'hidden print:block'}`}>
                       <h3 className="hidden print:flex text-lg font-bold mb-4 items-center gap-2"><Layers className="w-5 h-5"/> Comandă Sticlă</h3>
                       
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-cyan-50/50 p-6 rounded-xl border border-cyan-100">
                          <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Dimensiuni de Fabricație</p>
                            <div className="space-y-4">
                               <div className="flex justify-between items-end border-b border-cyan-200 pb-2">
                                 <span className="text-slate-600">Lățime sticlă:</span>
                                 <span className="font-bold text-xl text-slate-900">{bomData.glass.w} mm</span>
                               </div>
                               <div className="flex justify-between items-end border-b border-cyan-200 pb-2">
                                 <span className="text-slate-600">Înălțime sticlă:</span>
                                 <span className="font-bold text-xl text-slate-900">{bomData.glass.h} mm</span>
                               </div>
                               <div className="flex justify-between items-end border-b border-cyan-200 pb-2">
                                 <span className="text-slate-600">Suprafață per panou:</span>
                                 <span className="font-bold text-lg text-cyan-700">{bomData.glass.area} m²</span>
                               </div>
                            </div>
                          </div>
                          <div className="bg-white p-6 rounded-lg shadow-sm border border-cyan-100">
                             <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Compoziție</p>
                             <h4 className="font-bold text-lg text-slate-800 mb-4">{bomData.glass.type}</h4>
                             
                             <div className="mt-auto bg-slate-800 text-white p-4 rounded-lg">
                               <p className="text-xs text-slate-300 mb-1">TOTAL MP DE COMANDAT (Pentru toate {activeItem.quantity} unități)</p>
                               <p className="text-3xl font-black">{(bomData.glass.area * activeItem.quantity).toFixed(2)} m²</p>
                             </div>
                          </div>
                       </div>
                     </div>

                   {/* TAB 4: Feronerie */}
                   <div className={`animate-in fade-in duration-300 print:mt-12 print:break-inside-avoid ${activeTab === 'feronerie' ? 'block' : 'hidden print:block'}`}>
                       <h3 className="hidden print:flex text-lg font-bold mb-4 items-center gap-2"><Wrench className="w-5 h-5"/> Listă Feronerie și Consumabile</h3>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                          {bomData.hardware.map((hw, i) => (
                            <div key={i} className="flex items-center justify-between py-3 border-b border-dashed border-slate-200">
                               <div>
                                 <p className="font-semibold text-slate-800">{hw.reper}</p>
                                 <p className="font-mono text-xs text-orange-600">{hw.cod}</p>
                               </div>
                               <div className="text-right">
                                 <p className="text-sm text-slate-500">{hw.q} buc/unitate</p>
                                 <p className="font-black text-slate-900 text-lg">{hw.q * activeItem.quantity} <span className="text-sm font-semibold text-slate-500">Total</span></p>
                               </div>
                             </div>
                           ))}
                        </div>

                     </div>

                   {/* TAB 5: Etichete (Barcode/QR) */}
                   <div className={`animate-in fade-in duration-300 print:mt-12 print:break-before-page ${activeTab === 'etichete' ? 'block' : 'hidden print:block'}`}>
                       <div className="flex items-center justify-between mb-6">
                         <h3 className="hidden print:flex md:flex text-lg font-bold items-center gap-2"><Barcode className="w-5 h-5"/> Generare Etichete Piese</h3>
                         <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50" onClick={() => window.print()}>
                            Tipărește Pagina de Etichete
                         </Button>
                       </div>
                       
                       <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 print:grid-cols-4">
                          {bomData.profiles.slice().sort((a,b) => b.lgBrut - a.lgBrut).map((p, i) => (
                            Array.from({ length: p.q * activeItem.quantity }).map((_, copyIndex) => (
                                <div key={`${i}-${copyIndex}`} className="border-2 border-slate-800 rounded-md p-3 bg-white flex flex-col justify-between break-inside-avoid">
                                   <div className="flex justify-between items-start mb-2">
                                      <span className="text-[10px] font-bold uppercase text-slate-500">CMD: #{selectedOrder?.order_number || selectedOrder.id.slice(-8).toUpperCase()}</span>
                                      <span className="text-[10px] font-bold text-slate-400">Piesa: {activeItemIndex + 1}</span>
                                   </div>
                                   <h4 className="font-bold text-slate-900 leading-tight mb-1 text-sm">{p.reper}</h4>
                                   <div className="flex justify-between items-end mb-3">
                                     <span className="text-xs text-slate-600">{p.tip}</span>
                                     <span className="font-black text-lg">{p.lgBrut} <span className="text-xs">mm</span></span>
                                   </div>
                                   
                                   {/* Fake Barcode Generation (CSS Hack) */}
                                   <div className="w-full flex-col flex items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded">
                                      <div className="h-8 w-full bg-[linear-gradient(to_right,#000_1px,transparent_1px,#000_3px,transparent_3px,#000_4px,transparent_4px,#000_6px,transparent_6px,#000_7px,transparent_7px,#000_9px,transparent_9px,#000_10px,transparent_10px,#000_11px,transparent_11px,#000_14px,transparent_14px,#000_15px,transparent_15px)] bg-[length:15px_100%] opacity-80" />
                                      <span className="font-mono text-[9px] text-slate-500 mt-1 tracking-widest">{p.codBara}-{copyIndex+1}</span>
                                   </div>
                                </div>
                            ))
                          ))}
                       </div>
                     </div>
                  </div>
               </div>

             </div>
           )}
        </div>
      </div>
    </div>
  );
}
