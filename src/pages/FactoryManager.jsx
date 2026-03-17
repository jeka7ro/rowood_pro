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
  Layers, Wrench, Ruler, Scissors, ChevronRight, Barcode, Settings,
  Maximize2, X
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

// ═══ PRODUCTION FLOW SYSTEM ═══
// 8 Etape Standard de Producție (RA Workshop + Fenestra + Klaes)
const PRODUCTION_STAGES = [
  { id: 'debitare', name: 'Debitare', icon: '✂️', desc: 'Tăiere profile la cotă (CNC)', color: 'emerald', dept: 'CNC' },
  { id: 'armare', name: 'Armare', icon: '🔩', desc: 'Inserare armătură metalică', color: 'slate', dept: 'Armare' },
  { id: 'sudare', name: 'Sudare', icon: '🔥', desc: 'Sudare colțuri cadru + cercevea', color: 'orange', dept: 'Sudare' },
  { id: 'curatare', name: 'Curățare', icon: '🧹', desc: 'Curățare suduri + colțuri', color: 'cyan', dept: 'Curățare' },
  { id: 'feronerie', name: 'Montaj Feronerie', icon: '🔧', desc: 'Balamale, mânere, încuietori', color: 'amber', dept: 'Feronerie' },
  { id: 'geam', name: 'Geam', icon: '🪟', desc: 'Inserare pachet sticlă + baghete', color: 'sky', dept: 'Geam' },
  { id: 'qc', name: 'Control Calitate', icon: '✅', desc: 'Verificare funcționalitate + aspect', color: 'purple', dept: 'QC' },
  { id: 'expediere', name: 'Expediere', icon: '📦', desc: 'Ambalare + încărcare + livrare', color: 'blue', dept: 'Expediere' }
];

// Helper: Get/Set production flow data from localStorage
const getFlowData = (orderId) => {
  try {
    const data = localStorage.getItem(`rowood_flow_${orderId}`);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
};
const setFlowData = (orderId, data) => {
  localStorage.setItem(`rowood_flow_${orderId}`, JSON.stringify(data));
};

// Production Flow Component
function ProductionFlow({ orderId, orderNumber }) {
  const [flowData, setFlowState] = React.useState(() => getFlowData(orderId));
  const [expandedStage, setExpandedStage] = React.useState(null);
  const [noteText, setNoteText] = React.useState('');

  const persist = (newData) => { setFlowState(newData); setFlowData(orderId, newData); };

  const currentUser = 'Admin'; // TODO: Replace with Auth.me()

  const handlePreia = (stageId) => {
    const now = new Date().toISOString();
    const updated = { ...flowData, [stageId]: { ...flowData[stageId], status: 'in_lucru', preluat_de: currentUser, preluat_la: now } };
    persist(updated);
  };

  const handlePreda = (stageId) => {
    const now = new Date().toISOString();
    const stg = flowData[stageId] || {};
    const updated = { ...flowData, [stageId]: { ...stg, status: 'finalizat', predat_de: currentUser, predat_la: now, note: noteText || stg.note } };
    persist(updated);
    setNoteText('');
    setExpandedStage(null);
  };

  const handleReject = (stageId) => {
    const now = new Date().toISOString();
    const stg = flowData[stageId] || {};
    const updated = { ...flowData, [stageId]: { ...stg, status: 'respins', predat_de: currentUser, predat_la: now, note: noteText || 'Respins - necesită reluare' } };
    persist(updated);
    setNoteText('');
  };

  // Find current active stage
  const getActiveStageIndex = () => {
    for (let i = 0; i < PRODUCTION_STAGES.length; i++) {
      const stg = flowData[PRODUCTION_STAGES[i].id];
      if (!stg || stg.status !== 'finalizat') return i;
    }
    return PRODUCTION_STAGES.length; // All done
  };
  const activeIdx = getActiveStageIndex();
  const completedCount = PRODUCTION_STAGES.filter(s => flowData[s.id]?.status === 'finalizat').length;
  const progress = Math.round((completedCount / PRODUCTION_STAGES.length) * 100);

  const formatDT = (iso) => {
    if (!iso) return '—';
    try { return format(new Date(iso), 'dd.MM.yyyy HH:mm', { locale: ro }); } catch { return iso; }
  };
  const calcDuration = (start, end) => {
    if (!start || !end) return null;
    const ms = new Date(end) - new Date(start);
    const mins = Math.floor(ms / 60000);
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    const rm = mins % 60;
    return `${hrs}h ${rm}m`;
  };

  const statusColors = {
    'finalizat': 'bg-emerald-500',
    'in_lucru': 'bg-blue-500 animate-pulse',
    'respins': 'bg-red-500',
  };

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Factory className="w-5 h-5 text-blue-600" /> Flow Producție
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {completedCount === PRODUCTION_STAGES.length
              ? '✅ Toate etapele finalizate — gata de livrare!'
              : `Etapa ${activeIdx + 1}/${PRODUCTION_STAGES.length} — ${PRODUCTION_STAGES[activeIdx]?.name || 'Finalizat'}`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-slate-800">{progress}%</p>
          <p className="text-[10px] text-slate-400 uppercase">Progres</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
      </div>

      {/* Timeline */}
      <div className="relative">
        {PRODUCTION_STAGES.map((stage, idx) => {
          const stg = flowData[stage.id] || {};
          const isCurrent = idx === activeIdx;
          const isDone = stg.status === 'finalizat';
          const isRejected = stg.status === 'respins';
          const isWorking = stg.status === 'in_lucru';
          const isFuture = idx > activeIdx && !isDone;
          const isExpanded = expandedStage === stage.id;
          const duration = calcDuration(stg.preluat_la, stg.predat_la);

          return (
            <div key={stage.id} className="relative flex gap-4 pb-1">
              {/* Vertical line */}
              {idx < PRODUCTION_STAGES.length - 1 && (
                <div className={`absolute left-[15px] top-[32px] w-0.5 h-[calc(100%-24px)] ${isDone ? 'bg-emerald-300' : 'bg-slate-200'}`} />
              )}

              {/* Circle */}
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 mt-1
                ${isDone ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-300' : ''}
                ${isWorking ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-400 animate-pulse' : ''}
                ${isRejected ? 'bg-red-100 text-red-700 ring-2 ring-red-300' : ''}
                ${isCurrent && !isWorking && !isRejected ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-300' : ''}
                ${isFuture ? 'bg-slate-100 text-slate-400' : ''}
              `}>
                {isDone ? '✓' : stage.icon}
              </div>

              {/* Content */}
              <div className={`flex-1 pb-4 ${isFuture ? 'opacity-50' : ''}`}>
                <div
                  className={`rounded-xl border p-3 cursor-pointer transition-all
                    ${isDone ? 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50' : ''}
                    ${isWorking ? 'bg-blue-50/50 border-blue-200 hover:bg-blue-50 shadow-sm' : ''}
                    ${isRejected ? 'bg-red-50/50 border-red-200 hover:bg-red-50' : ''}
                    ${isCurrent && !isWorking && !isRejected ? 'bg-amber-50/50 border-amber-200 hover:bg-amber-50 shadow-sm' : ''}
                    ${isFuture ? 'bg-slate-50 border-slate-100' : ''}
                  `}
                  onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-slate-800 flex items-center gap-2">
                        {stage.name}
                        <span className="text-[10px] font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{stage.dept}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{stage.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {duration && <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{duration}</span>}
                      {stg.status && <span className={`w-2.5 h-2.5 rounded-full ${statusColors[stg.status] || 'bg-slate-300'}`} />}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-2">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-white rounded-lg p-2.5 border border-slate-100">
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Preluat de</p>
                          <p className="font-bold text-slate-800 mt-0.5">{stg.preluat_de || '—'}</p>
                          <p className="text-slate-400 font-mono text-[10px]">{formatDT(stg.preluat_la)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-2.5 border border-slate-100">
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Predat de</p>
                          <p className="font-bold text-slate-800 mt-0.5">{stg.predat_de || '—'}</p>
                          <p className="text-slate-400 font-mono text-[10px]">{formatDT(stg.predat_la)}</p>
                        </div>
                      </div>
                      {stg.note && (
                        <div className="bg-amber-50 rounded-lg p-2 text-xs text-amber-800 border border-amber-200">
                          <strong>Notă:</strong> {stg.note}
                        </div>
                      )}

                      {/* Actions */}
                      {(isCurrent || isRejected) && !isDone && (
                        <div className="space-y-2 pt-1">
                          {!isWorking && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handlePreia(stage.id); }}
                              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <Hammer className="w-4 h-4" /> PREIA COMANDA — {stage.name}
                            </button>
                          )}
                          {isWorking && (
                            <>
                              <input
                                type="text"
                                placeholder="Observații la predare (opțional)..."
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handlePreda(stage.id); }}
                                  className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                  ✓ FINALIZEAZĂ & PREDĂ
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleReject(stage.id); }}
                                  className="py-2 px-4 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-bold rounded-lg transition-colors"
                                >
                                  ✗ Respinge
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// --- ENGINE PRODUCȚIE AVANSAT (Tip RA Workshop) ---
const AdvancedBOMEngine = (item, techSettings = DEFAULT_TECH_SETTINGS) => {
  const w = parseFloat(item.width) || 0;
  const h = parseFloat(item.height) || 0;
  const isFix = item.product_name?.toLowerCase().includes('fix');
  const isDoor = item.product_name?.toLowerCase().includes('balcon') || item.product_name?.toLowerCase().includes('ușă') || item.product_name?.toLowerCase().includes('usa');
  
  // Constante Industriale încărcate din setările personalizabile
  const { latimeProfilRama, latimeProfilCercevea, deducereSudura, deducereMontaj, deducereArmatura, deducereFalt } = techSettings;
  const isPVC = item.material_name?.toLowerCase().includes('pvc') || true; // Majoritatea folosesc armătură
  
  // RAMA
  const posNr = String(item._posIndex || 1).padStart(3, '0');
  const profiles = [
    { reper: 'Ramă Sus (Toc)', q: 1, latimeT: latimeProfilRama, lgBrut: w, unghiSt: 45, unghiDr: 45, cotaNeta: w - deducereSudura*2, tip: item.material_name, codBara: `RM-H-${w}-4545`, pozitie: `${posNr}.Top`, categorie: 'Ramă (Toc)' },
    { reper: 'Ramă Jos (Toc)', q: 1, latimeT: latimeProfilRama, lgBrut: w, unghiSt: 45, unghiDr: 45, cotaNeta: w - deducereSudura*2, tip: item.material_name, codBara: `RM-H-${w}-4545`, pozitie: `${posNr}.Bottom`, categorie: 'Ramă (Toc)' },
    { reper: 'Ramă Stânga (Toc)', q: 1, latimeT: latimeProfilRama, lgBrut: h, unghiSt: 45, unghiDr: 45, cotaNeta: h - deducereSudura*2, tip: item.material_name, codBara: `RM-V-${h}-4545`, pozitie: `${posNr}.Left`, categorie: 'Ramă (Toc)' },
    { reper: 'Ramă Dreapta (Toc)', q: 1, latimeT: latimeProfilRama, lgBrut: h, unghiSt: 45, unghiDr: 45, cotaNeta: h - deducereSudura*2, tip: item.material_name, codBara: `RM-V-${h}-4545`, pozitie: `${posNr}.Right`, categorie: 'Ramă (Toc)' }
  ];

  // ARMĂTURĂ RAMĂ (Tăiere la 90 grade, mai scurtă cu deducereArmatura)
  if (isPVC) {
    profiles.push({ reper: 'Armătură Ramă Orizontală', q: 2, latimeT: 30, lgBrut: w - deducereArmatura, unghiSt: 90, unghiDr: 90, cotaNeta: w - deducereArmatura, tip: 'Metal', codBara: `AR-H-${w-deducereArmatura}-9090`, pozitie: `${posNr}.Top+Bot`, categorie: 'Armătură' });
    profiles.push({ reper: 'Armătură Ramă Verticală', q: 2, latimeT: 30, lgBrut: h - deducereArmatura, unghiSt: 90, unghiDr: 90, cotaNeta: h - deducereArmatura, tip: 'Metal', codBara: `AR-V-${h-deducereArmatura}-9090`, pozitie: `${posNr}.Left+Right`, categorie: 'Armătură' });
  }

  // CERCEVEA (Daca nu e fix)
  let coteSticla = { w: w - 2*latimeProfilRama - deducereMontaj, h: h - 2*latimeProfilRama - deducereMontaj };
  let lgCerceveaOriz = 0, lgCerceveaVert = 0;
  
  if (!isFix) {
    // Suprapunerea pe falț = lățime ramă - joc + bătaie (aprox 16mm total per cotă)
    lgCerceveaOriz = w - (2 * latimeProfilRama) + 16; 
    lgCerceveaVert = h - (2 * latimeProfilRama) + 16;
    
    profiles.push({ reper: 'Cercevea Orizontală', q: 2, latimeT: latimeProfilCercevea, lgBrut: lgCerceveaOriz, unghiSt: 45, unghiDr: 45, cotaNeta: lgCerceveaOriz - deducereSudura*2, tip: item.material_name, codBara: `CR-H-${lgCerceveaOriz}-4545`, pozitie: `${posNr}.A:Top+Bot`, categorie: 'Cercevea' });
    profiles.push({ reper: 'Cercevea Verticală', q: 2, latimeT: latimeProfilCercevea, lgBrut: lgCerceveaVert, unghiSt: 45, unghiDr: 45, cotaNeta: lgCerceveaVert - deducereSudura*2, tip: item.material_name, codBara: `CR-V-${lgCerceveaVert}-4545`, pozitie: `${posNr}.A:Left+Right`, categorie: 'Cercevea' });
    
    if (isPVC) {
       profiles.push({ reper: 'Armătură Cercevea Orizontală', q: 2, latimeT: 30, lgBrut: lgCerceveaOriz - deducereArmatura, unghiSt: 90, unghiDr: 90, cotaNeta: lgCerceveaOriz - deducereArmatura, tip: 'Metal', codBara: `AC-H-${lgCerceveaOriz-deducereArmatura}-9090`, pozitie: `${posNr}.A:Top+Bot`, categorie: 'Armătură' });
       profiles.push({ reper: 'Armătură Cercevea Verticală', q: 2, latimeT: 30, lgBrut: lgCerceveaVert - deducereArmatura, unghiSt: 90, unghiDr: 90, cotaNeta: lgCerceveaVert - deducereArmatura, tip: 'Metal', codBara: `AC-V-${lgCerceveaVert-deducereArmatura}-9090`, pozitie: `${posNr}.A:Left+Right`, categorie: 'Armătură' });
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
  profiles.push({ reper: 'Baghetă Orizontală', q: 2, latimeT: 20, lgBrut: coteSticla.w + 4, unghiSt: 90, unghiDr: 90, cotaNeta: coteSticla.w, tip: 'Baghetă', codBara: `BG-H-${coteSticla.w}-9090`, pozitie: `${posNr}.A:Top+Bot`, categorie: 'Baghetă' });
  profiles.push({ reper: 'Baghetă Verticală', q: 2, latimeT: 20, lgBrut: coteSticla.h + 4, unghiSt: 90, unghiDr: 90, cotaNeta: coteSticla.h, tip: 'Baghetă', codBara: `BG-V-${coteSticla.h}-9090`, pozitie: `${posNr}.A:Left+Right`, categorie: 'Baghetă' });

  const glassArea = Math.max(0, (coteSticla.w * coteSticla.h) / 1000000);

  // ═══════════════════════════════════════════════════
  // FERONERIE COMPLETĂ (Nivel Profesional RA Workshop)
  // ═══════════════════════════════════════════════════
  const hardware = [];

  if (isFix) {
    hardware.push(
      { reper: 'Clips Prindere Baghetă', q: 12, cod: 'CL-BAG-90', categorie: 'Fixare', descriere: 'Clipsuri din plastic pentru fixarea baghetei de sticlă' },
      { reper: 'Bucăți Calare Sticlă', q: 4, cod: 'CAL-01', categorie: 'Montaj', descriere: 'Cale din polietilenă pentru poziționarea sticlei în falțul ramei' },
      { reper: 'Garnitură EPDM Sticlă Interioară', q: 1, cod: `GRN-INT-${Math.ceil((2*(coteSticla.w+coteSticla.h))/1000)}m`, categorie: 'Etanșare', descriere: `Garnitură din cauciuc EPDM, lungime: ${Math.ceil(2*(coteSticla.w+coteSticla.h))} mm`, lgBrut: 2*(coteSticla.w+coteSticla.h) },
      { reper: 'Garnitură EPDM Sticlă Exterioară', q: 1, cod: `GRN-EXT-${Math.ceil((2*(coteSticla.w+coteSticla.h))/1000)}m`, categorie: 'Etanșare', descriere: `Garnitură exterioară din EPDM`, lgBrut: 2*(coteSticla.w+coteSticla.h) },
      { reper: 'Capac Drenaj Exterior', q: 2, cod: 'DRN-CAP-W', categorie: 'Drenaj', descriere: 'Capace albe de protecție a orificiilor de drenaj' },
      { reper: 'Șurub Auto-Filetant 3.9x25', q: 8, cod: 'SRB-3925', categorie: 'Șuruburi', descriere: 'Șuruburi fixare cadru fix' }
    );
  } else {
    // === FERONERIE OSCILO-BATANT ===
    const cremoane = Math.ceil(h / 800);
    hardware.push(
      { reper: 'Cremon Principal (Transmisie Centrală)', q: 1, cod: `CRM-${h > 1500 ? 'LONG' : 'STD'}-${h}`, categorie: 'Feronerie OB', descriere: `Transmisie principală oscilo-batant, înălțime ${h}mm` },
      { reper: 'Prelungitor Cremon', q: Math.max(0, cremoane - 1), cod: `CRM-EXT-${Math.ceil(h/3)}`, categorie: 'Feronerie OB', descriere: 'Prelungitor cremon pentru ferestre înalte' },
      { reper: 'Transmisie de Colț (Corner Drive)', q: 2, cod: 'CRN-DRV-01', categorie: 'Feronerie OB', descriere: 'Transmisie la 90° pentru colțurile cercevelei' },
      { reper: 'Foarfecă Oscilo-Batant', q: 1, cod: `SCIS-${w > 800 ? 'LONG' : 'STD'}-${w}`, categorie: 'Feronerie OB', descriere: `Foarfecă pentru deschidere oscilobatantă, lățime ${w}mm` },
      { reper: 'Limitator Deschidere', q: 1, cod: 'LIM-OB-01', categorie: 'Feronerie OB', descriere: 'Limitator unghi maxim deschidere (siguranță)' }
    );
    
    // === BALAMALE ===
    hardware.push(
      { reper: 'Balama Superioară (Foarfecă Toc)', q: 1, cod: 'BLM-SUP-TOC', categorie: 'Balamale', descriere: 'Balama superioară montată pe toc, articulație foarfecă' },
      { reper: 'Balama Superioară (Foarfecă Cercevea)', q: 1, cod: 'BLM-SUP-CRC', categorie: 'Balamale', descriere: 'Balama superioară montată pe cercevea' },
      { reper: 'Balama Inferioară Toc', q: 1, cod: 'BLM-INF-TOC', categorie: 'Balamale', descriere: 'Balama inferioară montată pe toc (pivot principal)' },
      { reper: 'Balama Inferioară Cercevea', q: 1, cod: 'BLM-INF-CRC', categorie: 'Balamale', descriere: 'Balama inferioară montată pe cercevea' },
      { reper: 'Capac Balama Inferioară', q: 2, cod: 'CAP-BLM-INF', categorie: 'Balamale', descriere: 'Capace decorative din plastic pentru balamaua inferioară' }
    );

    // === PUNCTE ÎNCHIDERE & BLOCATOARE ===
    const nrBlocatori = 2 + Math.floor(h / 500); // mai mulți pe ferestre înalte
    hardware.push(
      { reper: 'Punct de Închidere (Zavor/Ciupercă)', q: nrBlocatori, cod: 'BLC-CPC-01', categorie: 'Închidere', descriere: `Puncte de închidere tip ciupercă anti-efracție (${nrBlocatori} puncte)` },
      { reper: 'Plăcuță Închidere (Contrapiesa)', q: nrBlocatori, cod: 'BLC-CPT-01', categorie: 'Închidere', descriere: 'Contrapiesele montate pe toc' },
      { reper: 'Închizător Micro-Ventilație', q: 1, cod: 'MV-01', categorie: 'Închidere', descriere: 'Permite aerisire în poziția de micro-ventilație' }
    );

    // === MÂNER ===
    hardware.push(
      { reper: 'Mâner Fereastră (Olive) cu Cheie', q: 1, cod: 'MNR-ALU-SEC', categorie: 'Mâner', descriere: 'Mâner din aluminiu cu blocare cu cheie, culoare conform comandă' },
      { reper: 'Plăcuță Mâner', q: 1, cod: 'PLQ-MNR-01', categorie: 'Mâner', descriere: 'Plăcuță suport mâner cu rozetă' },
      { reper: 'Șurub Mâner M5x45', q: 2, cod: 'SRB-MNR-M545', categorie: 'Mâner', descriere: 'Șuruburi fixare mâner pe cercevea' }
    );

    // === ETANȘARE & GARNITURI ===
    const perimCercevea = 2 * (lgCerceveaOriz + lgCerceveaVert);
    const perimRama = 2 * (w + h);
    hardware.push(
      { reper: 'Garnitură Bătaie (Cercevea-Toc)', q: 1, cod: `GRN-BAT-${Math.ceil(perimCercevea/1000)}m`, categorie: 'Etanșare', descriere: `Garnitură din EPDM pe cercevea (perim: ${perimCercevea}mm)`, lgBrut: perimCercevea },
      { reper: 'Garnitură Centrală (Sticlă-Cercevea)', q: 1, cod: `GRN-CTR-${Math.ceil(perimCercevea/1000)}m`, categorie: 'Etanșare', descriere: `Garnitură mediană sticlă, lungime: ${perimCercevea}mm`, lgBrut: perimCercevea },
      { reper: 'Garnitură Exterioară Toc', q: 1, cod: `GRN-EXT-TOC-${Math.ceil(perimRama/1000)}m`, categorie: 'Etanșare', descriere: `Garnitură exterioară pe rama tocului, lungime: ${perimRama}mm`, lgBrut: perimRama }
    );

    // === DRENAJ & VENTILAȚIE ===
    hardware.push(
      { reper: 'Capac Drenaj Exterior', q: 2, cod: 'DRN-CAP-W', categorie: 'Drenaj', descriere: 'Capace de protecție a orificiilor de drenaj' },
      { reper: 'Capac Cameră Egalizare', q: 2, cod: 'DRN-EGL-01', categorie: 'Drenaj', descriere: 'Capace de acoperire cameră de egalizare presiune' },
      { reper: 'Grile Ventilație (opțional)', q: isDoor ? 0 : 1, cod: 'VENT-GRL-01', categorie: 'Drenaj', descriere: 'Grilă ventilație integrată (dacă este cerută)' }
    );

    // === ACCESORII MONTAJ ===
    hardware.push(
      { reper: 'Cale Susținere Greutate 2mm', q: 4, cod: 'CAL-2MM', categorie: 'Montaj', descriere: 'Cale din polietilenă pentru susținere greutate sticlă' },
      { reper: 'Cale Susținere Greutate 3mm', q: 4, cod: 'CAL-3MM', categorie: 'Montaj', descriere: 'Cale din polietilenă 3mm' },
      { reper: 'Cale Susținere Greutate 5mm', q: 2, cod: 'CAL-5MM', categorie: 'Montaj', descriere: 'Cale din polietilenă 5mm (pentru sticlă grea)' },
      { reper: 'Clips Prindere Baghetă', q: Math.ceil((2*(coteSticla.w+coteSticla.h))/150), cod: 'CL-BAG-90', categorie: 'Montaj', descriere: 'Clipsuri pentru fixarea baghetelor de sticlă' },
      { reper: 'Buton Ridicare Cercevea', q: isDoor ? 1 : 0, cod: 'BTN-RDC-01', categorie: 'Montaj', descriere: 'Buton ridicare pentru uși de balcon (compensare greutate)' }
    );

    // === FIXARE & ȘURUBURI ===
    hardware.push(
      { reper: 'Șurub Feronerie 4x35', q: 20 + nrBlocatori * 2, cod: 'SRB-4035', categorie: 'Șuruburi', descriere: 'Șuruburi fixare feronerie pe profil PVC' },
      { reper: 'Șurub Balama 5x40', q: 8, cod: 'SRB-5040', categorie: 'Șuruburi', descriere: 'Șuruburi de fixare balamale (rezistență ridicată)' },
      { reper: 'Șurub Auto-Filetant 3.9x25', q: 6, cod: 'SRB-3925', categorie: 'Șuruburi', descriere: 'Șuruburi suplimentare diverse' }
    );
  }

  // Filtru: elimină componentele cu cantitate 0
  const filteredHardware = hardware.filter(h => h.q > 0);

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
    hardware: filteredHardware,
    summary
  };
};

// --- COMPONENTĂ GRAFICĂ TEHNICĂ (Planșă) ---
// @ts-ignore
const TechnicalDrawing = ({ w, h, isFix, isDoor, summary, sashConfigs, productName }) => {
  const scale = Math.min(300 / w, 400 / h);
  const drawW = w * scale;
  const drawH = h * scale;
  
  const frameThick = 25; 
  const sashThick = 20;
  const mullionW = 12; // montant intermediar
  
  // Determinare număr canaturi din: sash_configs > product_name > default 1
  let numSashes = 1;
  if (Array.isArray(sashConfigs) && sashConfigs.length > 0) {
    numSashes = sashConfigs.length;
  } else if (productName) {
    const pn = productName.toLowerCase();
    if (pn.includes('tripl')) numSashes = 3;
    else if (pn.includes('dubl') || pn.includes('double')) numSashes = 2;
  }
  if (isFix) numSashes = 1; // fix = un singur panou

  // Calcul lățime per canat
  const innerW = drawW - frameThick * 2;
  const totalMullions = numSashes - 1;
  const sashWidth = (innerW - totalMullions * mullionW) / numSashes;
  
  const handleYPos = isDoor ? drawH - (1050 * scale) : drawH / 2;
  const bottomFrame = isDoor ? 10 : frameThick;
  const innerH = drawH - frameThick - bottomFrame;

  // Build sash rectangles
  const sashes = [];
  for (let i = 0; i < numSashes; i++) {
    const x = frameThick + i * (sashWidth + mullionW);
    const sashConf = sashConfigs?.[i] || {};
    const openType = sashConf.opening_type || (i === 0 ? 'turn' : 'tilt_turn');
    const hingeSide = sashConf.hinge_side || (i === 0 ? 'left' : 'right');
    sashes.push({ x, w: sashWidth, openType, hingeSide, index: i });
  }

  return (
    <div className="relative border-4 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center p-8 h-full min-h-[500px]">
      <div className="relative mb-12">
         {/* Cotă exterioară TOP */}
         <div className="absolute -top-12 left-0 right-0 flex items-center justify-center">
            <div className="h-[1px] w-full bg-blue-600 relative opacity-60">
               <div className="absolute left-0 -top-1.5 w-[1px] h-3 bg-blue-600"></div>
               <div className="absolute right-0 -top-1.5 w-[1px] h-3 bg-blue-600"></div>
            </div>
            <span className="absolute -top-6 text-sm font-black text-blue-700 bg-slate-50 px-2 rounded-full border border-blue-100">{w} mm</span>
         </div>
         
         {/* Cotă exterioară DREAPTA */}
         <div className="absolute top-0 bottom-0 -right-12 flex flex-col items-center justify-center">
            <div className="w-[1px] h-full bg-blue-600 relative opacity-60">
               <div className="absolute top-0 -left-1.5 h-[1px] w-3 bg-blue-600"></div>
               <div className="absolute bottom-0 -left-1.5 h-[1px] w-3 bg-blue-600"></div>
            </div>
            <span className="absolute -right-16 text-sm font-black text-blue-700 bg-slate-50 px-2 rounded-full border border-blue-100 rotate-90">{h} mm</span>
         </div>

         {/* Cotă interioară TOP */}
         {summary && (
           <div className="absolute -top-5 left-[25px] right-[25px] flex items-center justify-center z-10">
              <div className="h-[1px] w-full bg-emerald-500 relative opacity-70">
                 <div className="absolute left-0 -top-1.5 w-[1px] h-3 bg-emerald-500"></div>
                 <div className="absolute right-0 -top-1.5 w-[1px] h-3 bg-emerald-500"></div>
              </div>
              <span className="absolute -top-4 text-[10px] font-bold text-emerald-700 bg-slate-50 px-1">{isFix ? summary.luminaLibera.w : summary.cerceveaNet.w} mm</span>
           </div>
         )}
         
         {/* SVG Drawing */}
         <svg width={drawW} height={drawH} className="drop-shadow-xl overflow-visible">
            {/* Cadru exterior (Toc) */}
            <rect x="0" y="0" width={drawW} height={drawH} fill="#f8fafc" stroke="#475569" strokeWidth="2" />
            
            {/* Lumina ramei */}
            <rect x={frameThick} y={frameThick} width={innerW} height={innerH} fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
            
            {isDoor && (
              <rect x={frameThick} y={drawH - 10} width={innerW} height={10} fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
            )}
            
            {/* Montanți intermediari (mullions) */}
            {Array.from({ length: totalMullions }).map((_, mi) => {
              const mx = frameThick + (mi + 1) * sashWidth + mi * mullionW;
              return (
                <rect key={`mullion-${mi}`} x={mx} y={frameThick} width={mullionW} height={innerH} fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
              );
            })}

            {/* Canaturi */}
            {!isFix && sashes.map((sash) => {
              const sy = frameThick - 4;
              const sh = innerH + 8;
              const sx = sash.x - 4;
              const sw = sash.w + 8;
              const glassX = sash.x + sashThick;
              const glassY = frameThick + sashThick;
              const glassW = sash.w - sashThick * 2;
              const glassH = innerH - sashThick * 2;
              const midY = frameThick + innerH / 2;
              
              // Handle position
              const hx = sash.hingeSide === 'left' ? sash.x + sash.w - 6 : sash.x + 2;
              const hy = isDoor ? drawH - (1050 * scale) - 15 : midY - 15;
              
              // Opening lines
              let openingPoints = '';
              if (sash.hingeSide === 'left') {
                // Balamale stânga, mâner dreapta
                openingPoints = `${sash.x + sash.w + 4},${midY} ${sash.x - 4},${sy} ${sash.x - 4},${sy + sh}`;
              } else {
                // Balamale dreapta, mâner stânga
                openingPoints = `${sash.x - 4},${midY} ${sash.x + sash.w + 4},${sy} ${sash.x + sash.w + 4},${sy + sh}`;
              }
              
              return (
                <g key={`sash-${sash.index}`}>
                  {/* Cercevea (gabarit) */}
                  <rect x={sx} y={sy} width={sw} height={sh} fill="#ffffff" stroke="#64748b" strokeWidth="1.5" />
                  {/* Sticlă */}
                  <rect x={glassX} y={glassY} width={glassW} height={glassH} fill="#bae6fd" stroke="#7dd3fc" strokeWidth="1" opacity="0.8" />
                  {/* ═══ LITERA CANAT (A, B, C...) ═══ */}
                  <text x={glassX + glassW/2} y={glassY + glassH/2 + 6} textAnchor="middle" fill="#1e40af" fontSize="18" fontWeight="900" fontFamily="monospace" opacity="0.35">{String.fromCharCode(65 + sash.index)}</text>
                  {/* Mâner */}
                  <rect x={hx} y={hy} width={4} height={isDoor ? 50 : 30} fill="#334155" rx="2" />
                  {/* Linii deschidere */}
                  <polygon points={openingPoints} fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="5 5" opacity="0.5" />
                </g>
              );
            })}

            {isFix && (
              <>
                <rect x={frameThick + 5} y={frameThick + 5} width={innerW - 10} height={innerH - 10} fill="#bae6fd" stroke="#7dd3fc" strokeWidth="1" opacity="0.8" />
                <text x={drawW/2} y={drawH/2 + 6} textAnchor="middle" fill="#1e40af" fontSize="18" fontWeight="900" fontFamily="monospace" opacity="0.35">A</text>
              </>
            )}
            
            {/* Diagonale sudură */}
            <line x1="0" y1="0" x2={frameThick} y2={frameThick} stroke="#94a3b8" strokeWidth="1" />
            <line x1={drawW} y1="0" x2={drawW - frameThick} y2={frameThick} stroke="#94a3b8" strokeWidth="1" />
            <line x1="0" y1={drawH} x2={frameThick} y2={drawH - frameThick} stroke="#94a3b8" strokeWidth="1" />
            <line x1={drawW} y1={drawH} x2={drawW - frameThick} y2={drawH - frameThick} stroke="#94a3b8" strokeWidth="1" />
            
            {/* ═══ UNGHIURI SUDURĂ ═══ */}
            <text x={6} y={14} fill="#94a3b8" fontSize="7" fontFamily="monospace">45°</text>
            <text x={drawW - 22} y={14} fill="#94a3b8" fontSize="7" fontFamily="monospace">45°</text>
            <text x={6} y={drawH - 6} fill="#94a3b8" fontSize="7" fontFamily="monospace">45°</text>
            <text x={drawW - 22} y={drawH - 6} fill="#94a3b8" fontSize="7" fontFamily="monospace">45°</text>
            
            {/* ═══ LĂȚIMI INDIVIDUALE PER CANAT (RA Workshop style: A=400, B=600) ═══ */}
            {numSashes > 1 && sashes.map((sash) => {
              const sashRealW = Math.round((w - 2 * 70) / numSashes); // approx real width per sash
              const cx = sash.x + sash.w / 2;
              return (
                <g key={`dim-${sash.index}`}>
                  {/* Dimension line per pane */}
                  <line x1={sash.x} y1={drawH + 8} x2={sash.x + sash.w} y2={drawH + 8} stroke="#475569" strokeWidth="0.8" />
                  <line x1={sash.x} y1={drawH + 4} x2={sash.x} y2={drawH + 12} stroke="#475569" strokeWidth="0.8" />
                  <line x1={sash.x + sash.w} y1={drawH + 4} x2={sash.x + sash.w} y2={drawH + 12} stroke="#475569" strokeWidth="0.8" />
                  <text x={cx} y={drawH + 22} textAnchor="middle" fill="#334155" fontSize="9" fontWeight="700" fontFamily="monospace">{sashRealW}</text>
                </g>
              );
            })}
            
            {/* Total width dimension at bottom */}
            {numSashes > 1 && (
              <g>
                <line x1={0} y1={drawH + 30} x2={drawW} y2={drawH + 30} stroke="#1e40af" strokeWidth="1" />
                <line x1={0} y1={drawH + 26} x2={0} y2={drawH + 34} stroke="#1e40af" strokeWidth="1" />
                <line x1={drawW} y1={drawH + 26} x2={drawW} y2={drawH + 34} stroke="#1e40af" strokeWidth="1" />
                <text x={drawW/2} y={drawH + 44} textAnchor="middle" fill="#1e40af" fontSize="10" fontWeight="900" fontFamily="monospace">L={w}</text>
              </g>
            )}
         </svg>
      </div>
      
      {/* Detalii Tabelare */}
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
             {numSashes > 1 && (
               <div className="px-3 py-1.5 flex justify-between bg-amber-50/50"><span className="text-slate-600 font-medium">Canaturi:</span> <span className="font-mono font-bold text-amber-800">{numSashes} buc</span></div>
             )}
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
  const [activeTab, setActiveTab] = useState('taiere'); // taiere | sticla | feronerie | etichete
  const [fullscreenDrawing, setFullscreenDrawing] = useState(false);

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
                  onClick={() => { setSelectedOrder(order); setActiveItemIndex(0); setActiveTab('taiere'); loadOrderConfigurations(order); }}
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

      {/* FULLSCREEN DRAWING MODAL */}
      {fullscreenDrawing && activeItem && bomData && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8 print:hidden" onClick={() => setFullscreenDrawing(false)}>
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-auto p-8 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setFullscreenDrawing(false)} className="absolute top-4 right-4 bg-slate-100 hover:bg-red-100 hover:text-red-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors z-10">
              <X className="w-5 h-5"/>
            </button>
            <h2 className="text-lg font-black text-slate-800 mb-1">Planșă Tehnică — {activeItem.product_name}</h2>
            <p className="text-sm text-slate-400 mb-6">{activeItem.width} × {activeItem.height} mm • {activeItem.material_name} • {bomData.glass.type}</p>
            <div className="flex justify-center">
              <TechnicalDrawing w={activeItem.width} h={activeItem.height} isFix={isFix} isDoor={isDoor} summary={bomData.summary} sashConfigs={activeItem.sash_configs} productName={activeItem.product_name} />
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-slate-400 uppercase">Gabarit</p><p className="font-mono font-black text-lg">{activeItem.width} × {activeItem.height}</p></div>
              {bomData.summary?.luminaLibera && <div className="bg-blue-50 rounded-lg p-3"><p className="text-blue-400 uppercase">Lumină Ramă</p><p className="font-mono font-black text-lg text-blue-700">{bomData.summary.luminaLibera.w} × {bomData.summary.luminaLibera.h}</p></div>}
              <div className="bg-cyan-50 rounded-lg p-3"><p className="text-cyan-500 uppercase">Cotă Sticlă</p><p className="font-mono font-black text-lg text-cyan-800">{bomData.summary?.sticlaCut?.w} × {bomData.summary?.sticlaCut?.h}</p></div>
              <div className="bg-emerald-50 rounded-lg p-3"><p className="text-emerald-500 uppercase">Arie Sticlă</p><p className="font-mono font-black text-lg text-emerald-700">{bomData.glass.area} m²</p></div>
            </div>
          </div>
        </div>
      )}

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
                onClick={() => { setActiveItemIndex(idx); setActiveTab('taiere'); }}
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
        <div className="flex-1 bg-slate-50/50 overflow-y-auto p-4 md:p-6">
           {activeItem && bomData && (
             <div className="max-w-6xl mx-auto space-y-5">
               
               {/* ═══ HEADER + QUICK SPECS ═══ */}
               <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                 {/* Product title bar */}
                 <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-4 flex items-center justify-between">
                   <div>
                     <h1 className="text-xl font-bold">Poz. {activeItemIndex + 1} — {activeItem.product_name}</h1>
                     <p className="text-slate-300 text-sm mt-1">{activeItem.material_name} • {activeItem.glazing_name || 'Sticlă Standard'} {activeItem.color_name ? `• ${activeItem.color_name}` : ''}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-3xl font-black">{activeItem.quantity}<span className="text-sm font-medium text-slate-400 ml-1">buc</span></p>
                   </div>
                 </div>

                 {/* Quick spec grid */}
                 <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-slate-100 border-b border-slate-100">
                   <div className="p-4 text-center">
                     <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Gabarit</p>
                     <p className="text-lg font-black text-slate-800 mt-1">{activeItem.width} × {activeItem.height}</p>
                     <p className="text-[10px] text-slate-400">mm</p>
                   </div>
                   <div className="p-4 text-center">
                     <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Profile</p>
                     <p className="text-lg font-black text-blue-700 mt-1">{bomData.profiles.length}</p>
                     <p className="text-[10px] text-slate-400">tipuri repere</p>
                   </div>
                   <div className="p-4 text-center">
                     <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Sticlă</p>
                     <p className="text-lg font-black text-cyan-700 mt-1">{bomData.glass.area} m²</p>
                     <p className="text-[10px] text-slate-400">per unitate</p>
                   </div>
                   <div className="p-4 text-center">
                     <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Feronerie</p>
                     <p className="text-lg font-black text-orange-700 mt-1">{bomData.hardware.length}</p>
                     <p className="text-[10px] text-slate-400">componente</p>
                   </div>
                   <div className="p-4 text-center bg-emerald-50/50">
                     <p className="text-[10px] text-emerald-600 uppercase tracking-widest font-bold">Total Piese</p>
                     <p className="text-lg font-black text-emerald-700 mt-1">{bomData.profiles.reduce((s,p) => s + p.q, 0) + bomData.hardware.reduce((s,h) => s + h.q, 0)}</p>
                     <p className="text-[10px] text-emerald-500">per unitate</p>
                   </div>
                 </div>

                 {/* Drawing + Key Dimensions side by side */}
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                   {/* LEFT: Technical Drawing (takes 2/3) — CLICKABLE */}
                   <div className="lg:col-span-2 p-6 border-r border-slate-100 cursor-pointer group relative" onClick={() => setFullscreenDrawing(true)}>
                     <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center gap-1">
                       <Maximize2 className="w-3 h-3"/> Click = Mărire
                     </div>
                     <TechnicalDrawing w={activeItem.width} h={activeItem.height} isFix={isFix} isDoor={isDoor} summary={bomData.summary} sashConfigs={activeItem.sash_configs} productName={activeItem.product_name} />
                   </div>
                   {/* RIGHT: Key dimensions panel */}
                   <div className="p-4 bg-slate-50/80 space-y-3">
                     <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-1.5"><Ruler className="w-3.5 h-3.5"/> Cote Fabricație</h3>
                     
                     <div className="space-y-2">
                       <div className="bg-white rounded-lg p-3 border border-slate-200">
                         <p className="text-[10px] text-slate-400 uppercase">Gabarit Exterior</p>
                         <p className="font-mono font-black text-lg text-slate-800">{activeItem.width} × {activeItem.height}</p>
                       </div>
                       {bomData.summary?.luminaLibera && (
                         <div className="bg-white rounded-lg p-3 border border-slate-200">
                           <p className="text-[10px] text-slate-400 uppercase">Lumină Ramă</p>
                           <p className="font-mono font-black text-lg text-blue-700">{bomData.summary.luminaLibera.w} × {bomData.summary.luminaLibera.h}</p>
                         </div>
                       )}
                       {bomData.summary?.cerceveaNet && (
                         <div className="bg-white rounded-lg p-3 border border-slate-200">
                           <p className="text-[10px] text-emerald-500 uppercase">Cercevea Netă</p>
                           <p className="font-mono font-black text-lg text-emerald-700">{bomData.summary.cerceveaNet.w} × {bomData.summary.cerceveaNet.h}</p>
                         </div>
                       )}
                       <div className="bg-cyan-50 rounded-lg p-3 border border-cyan-200">
                         <p className="text-[10px] text-cyan-600 uppercase">Cotă Tăiere Sticlă</p>
                         <p className="font-mono font-black text-lg text-cyan-800">{bomData.summary?.sticlaCut?.w} × {bomData.summary?.sticlaCut?.h}</p>
                       </div>
                       <div className="bg-slate-800 rounded-lg p-3 text-white">
                         <p className="text-[10px] text-slate-400 uppercase">Sticlă Totală</p>
                         <p className="font-mono font-black text-2xl">{(bomData.glass.area * activeItem.quantity).toFixed(2)} <span className="text-sm font-normal text-slate-400">m²</span></p>
                       </div>
                     </div>

                     {/* Mini material info */}
                     <div className="pt-2 space-y-1.5">
                       <div className="flex justify-between text-xs"><span className="text-slate-400">Material</span><span className="font-bold text-slate-700">{activeItem.material_name}</span></div>
                       <div className="flex justify-between text-xs"><span className="text-slate-400">Sticlă</span><span className="font-bold text-slate-700">{bomData.glass.type}</span></div>
                       {activeItem.color_name && <div className="flex justify-between text-xs"><span className="text-slate-400">Culoare</span><span className="font-bold text-slate-700 flex items-center gap-1">{activeItem.color_hex && <span className="w-3 h-3 rounded-full inline-block border border-slate-200" style={{backgroundColor: activeItem.color_hex}}></span>}{activeItem.color_name}</span></div>}
                       <div className="flex justify-between text-xs"><span className="text-slate-400">Tip</span><span className="font-bold text-slate-700">{isFix ? 'Fix' : (isDoor ? 'Ușă Balcon' : 'Oscilo-Batant')}</span></div>
                     </div>
                   </div>
                 </div>
               </div>

               {/* DETAILED PRODUCTION TABS */}
               <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">
                 <div className="flex border-b border-slate-100 bg-slate-50/50 overflow-x-auto print:hidden">
                    <button onClick={() => setActiveTab('taiere')} className={`px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'taiere' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                      <Scissors className="w-4 h-4"/> Debitări Profil
                    </button>
                    <button onClick={() => setActiveTab('optimizare')} className={`px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'optimizare' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                      <PackageOpen className="w-4 h-4"/> Optimizare Bare (6m)
                    </button>
                    <button onClick={() => setActiveTab('sticla')} className={`px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'sticla' ? 'border-cyan-600 text-cyan-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                      <Layers className="w-4 h-4"/> Sticlă Termopan
                    </button>
                    <button onClick={() => setActiveTab('feronerie')} className={`px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'feronerie' ? 'border-orange-600 text-orange-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                      <Wrench className="w-4 h-4"/> Feronerie ({bomData.hardware.length})
                    </button>
                    <button onClick={() => setActiveTab('etichete')} className={`px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'etichete' ? 'border-purple-600 text-purple-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                      <Barcode className="w-4 h-4"/> Etichete
                    </button>
                    <button onClick={() => setActiveTab('flow')} className={`px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'flow' ? 'border-rose-600 text-rose-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                      <Factory className="w-4 h-4"/> Flow Producție
                    </button>
                 </div>

                 <div className="p-6">

                    {/* TAB 1: Tăieri Profil (RA Workshop Style) */}
                    <div className={`animate-in fade-in duration-300 print:mt-12 print:break-before-page ${activeTab === 'taiere' ? 'block' : 'hidden print:block'}`}>
                        <h3 className="hidden print:flex text-lg font-bold mb-4 items-center gap-2"><Scissors className="w-5 h-5"/> Cutting Size — Profile Order</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead>
                              <tr className="bg-slate-800 text-white text-[11px]">
                                <th className="px-2 py-2.5 rounded-tl-lg text-center w-8">Nr.</th>
                                <th className="px-2 py-2.5">Cod CNC</th>
                                <th className="px-2 py-2.5">Piesă / Designație</th>
                                <th className="px-2 py-2.5 text-center">Poziție</th>
                                <th className="px-2 py-2.5 text-center">Categorie</th>
                                <th className="px-2 py-2.5 text-center">Q</th>
                                <th className="px-2 py-2.5 text-right">Lungime</th>
                                <th className="px-2 py-2.5 text-right">Cotă Netă</th>
                                <th className="px-2 py-2.5 text-center bg-slate-700/80 border-l border-slate-600">1°</th>
                                <th className="px-2 py-2.5 text-center bg-slate-700/80 border-r border-slate-600">2°</th>
                                <th className="px-2 py-2.5 rounded-tr-lg text-right font-bold text-emerald-300">Total (×{activeItem.quantity})</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {bomData.profiles.map((p, i) => {
                                const catColors = { 'Ramă (Toc)': 'bg-blue-50 text-blue-700 border-blue-200', 'Cercevea': 'bg-amber-50 text-amber-700 border-amber-200', 'Armătură': 'bg-slate-100 text-slate-600 border-slate-200', 'Baghetă': 'bg-purple-50 text-purple-700 border-purple-200' };
                                return (
                                  <tr key={i} className={`hover:bg-blue-50/50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                                    <td className="px-2 py-2 text-center font-bold text-slate-400">{i + 1}</td>
                                    <td className="px-2 py-2 font-mono text-[10px] text-slate-400"><div className="flex items-center gap-1"><Barcode className="w-3 h-3 text-slate-300" />{p.codBara}</div></td>
                                    <td className="px-2 py-2 font-semibold text-slate-800 text-[11px]">{p.reper}</td>
                                    <td className="px-2 py-2 text-center font-mono text-[10px] text-indigo-600 font-bold">{p.pozitie}</td>
                                    <td className="px-2 py-2 text-center"><span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${catColors[p.categorie] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>{p.categorie}</span></td>
                                    <td className="px-2 py-2 text-center font-bold text-slate-700">{p.q}</td>
                                    <td className="px-2 py-2 text-right font-bold text-slate-900">{p.lgBrut} mm</td>
                                    <td className="px-2 py-2 text-right text-slate-400 font-mono text-[10px]">{p.cotaNeta} mm</td>
                                    <td className="px-2 py-2 text-center font-mono font-bold bg-slate-50/80 text-slate-600 border-l border-slate-100">{p.unghiSt}°</td>
                                    <td className="px-2 py-2 text-center font-mono font-bold bg-slate-50/80 text-slate-600 border-r border-slate-100">{p.unghiDr}°</td>
                                    <td className="px-2 py-2 text-right font-black text-emerald-700 text-sm">{p.q * activeItem.quantity}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot>
                              <tr className="bg-slate-100 border-t-2 border-slate-300">
                                <td colSpan={6} className="px-2 py-3 text-right font-bold text-slate-500 text-[11px]">{bomData.profiles.length} tipuri repere</td>
                                <td colSpan={4} className="px-2 py-3"></td>
                                <td className="px-2 py-3 text-right font-black text-base text-emerald-800">{bomData.profiles.reduce((s,p) => s + p.q * activeItem.quantity, 0)} buc</td>
                              </tr>
                            </tfoot>
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

                   {/* TAB 4: Feronerie — Grupat pe Categorii */}
                   <div className={`animate-in fade-in duration-300 print:mt-12 print:break-inside-avoid ${activeTab === 'feronerie' ? 'block' : 'hidden print:block'}`}>
                       <h3 className="hidden print:flex text-lg font-bold mb-4 items-center gap-2"><Wrench className="w-5 h-5"/> Listă Feronerie și Consumabile</h3>
                       
                       {/* Summary stats */}
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                         <div className="bg-slate-100 rounded-lg p-3 text-center">
                           <p className="text-xs text-slate-500">Componente unice</p>
                           <p className="text-2xl font-black text-slate-800">{bomData.hardware.length}</p>
                         </div>
                         <div className="bg-orange-50 rounded-lg p-3 text-center">
                           <p className="text-xs text-orange-600">Total piese / unitate</p>
                           <p className="text-2xl font-black text-orange-700">{bomData.hardware.reduce((s, h) => s + h.q, 0)}</p>
                         </div>
                         <div className="bg-emerald-50 rounded-lg p-3 text-center">
                           <p className="text-xs text-emerald-600">Total piese x{activeItem.quantity}</p>
                           <p className="text-2xl font-black text-emerald-700">{bomData.hardware.reduce((s, h) => s + h.q, 0) * activeItem.quantity}</p>
                         </div>
                         <div className="bg-blue-50 rounded-lg p-3 text-center">
                           <p className="text-xs text-blue-600">Categorii</p>
                           <p className="text-2xl font-black text-blue-700">{[...new Set(bomData.hardware.map(h => h.categorie))].length}</p>
                         </div>
                       </div>

                       {/* Grouped by category */}
                       <div className="space-y-6">
                         {Object.entries(
                           bomData.hardware.reduce((acc, hw) => {
                             const cat = hw.categorie || 'General';
                             if (!acc[cat]) acc[cat] = [];
                             acc[cat].push(hw);
                             return acc;
                           }, {})
                         ).map(([category, items]) => {
                           const catColors = {
                             'Feronerie OB': 'bg-blue-600', 'Balamale': 'bg-indigo-600', 'Închidere': 'bg-red-600',
                             'Mâner': 'bg-amber-600', 'Etanșare': 'bg-teal-600', 'Drenaj': 'bg-cyan-600',
                             'Montaj': 'bg-purple-600', 'Șuruburi': 'bg-slate-600', 'Fixare': 'bg-slate-500'
                           };
                           const color = catColors[category] || 'bg-slate-500';
                           return (
                             <div key={category} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                               <div className={`${color} px-4 py-2.5 flex justify-between items-center`}>
                                 <span className="font-bold text-white text-sm tracking-wide uppercase">{category}</span>
                                 <span className="text-white/80 text-xs">{items.length} repere</span>
                               </div>
                               <div className="divide-y divide-slate-100">
                                 {items.map((hw, i) => (
                                   <div key={i} className="px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-4">
                                     <div className="flex-1 min-w-0">
                                       <p className="font-semibold text-slate-800 text-sm">{hw.reper}</p>
                                       {hw.descriere && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{hw.descriere}</p>}
                                     </div>
                                     <div className="text-right shrink-0">
                                       <span className="font-mono text-[10px] text-orange-500 block">{hw.cod}</span>
                                       <div className="flex items-center gap-2 mt-1">
                                         <span className="text-xs text-slate-400">{hw.q}/u</span>
                                         <span className="font-black text-slate-900">{hw.q * activeItem.quantity}</span>
                                       </div>
                                     </div>
                                   </div>
                                 ))}
                               </div>
                             </div>
                           );
                         })}
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

                    {/* TAB 6: Flow Producție */}
                    <div className={`animate-in fade-in duration-300 ${activeTab === 'flow' ? 'block' : 'hidden'}`}>
                      <ProductionFlow orderId={selectedOrder?.id || 'unknown'} orderNumber={selectedOrder?.order_number || ''} />
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
