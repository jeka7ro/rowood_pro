import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, ArrowRight, CheckCircle } from "lucide-react";
import SlidingConfigurationGraphic from "../admin/SlidingConfigurationGraphic";

// Componentă pentru un canat individual cu styling îmbunătățit
const SingleSash = ({ type, index, total }) => {
  const isFixed = type === 'fix';
  const isBatant = type === 'batant';
  const isOsciloBatant = type === 'oscilo-batant';
  
  // Determinăm direcția bazată pe poziție (stânga/dreapta alternant)
  const opensLeft = index % 2 === 0;
  
  return (
    <div className="relative flex-1 h-32 border-4 border-slate-400 bg-blue-100/50 rounded-sm">
      {/* Fundal sticlă */}
      <div className="absolute inset-2 bg-blue-50/80 rounded-sm" />
      
      {/* Icon pentru canat fix - plus mare în centru */}
      {isFixed && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-12 h-12 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      )}
      
      {/* Icon pentru batant - săgeată simplă */}
      {isBatant && (
        <svg className="absolute inset-2 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {opensLeft ? (
            <>
              <line x1="95" y1="10" x2="10" y2="50" stroke="#64748b" strokeWidth="2" />
              <line x1="95" y1="90" x2="10" y2="50" stroke="#64748b" strokeWidth="2" />
              {/* Mâner */}
              <rect x="8" y="45" width="4" height="10" fill="#1e293b" rx="1" />
            </>
          ) : (
            <>
              <line x1="5" y1="10" x2="90" y2="50" stroke="#64748b" strokeWidth="2" />
              <line x1="5" y1="90" x2="90" y2="50" stroke="#64748b" strokeWidth="2" />
              {/* Mâner */}
              <rect x="88" y="45" width="4" height="10" fill="#1e293b" rx="1" />
            </>
          )}
        </svg>
      )}
      
      {/* Icon pentru oscilo-batant - săgeată dublă */}
      {isOsciloBatant && (
        <svg className="absolute inset-2 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {opensLeft ? (
            <>
              {/* Săgeată principală (batant) */}
              <line x1="95" y1="10" x2="10" y2="50" stroke="#64748b" strokeWidth="2" />
              <line x1="95" y1="90" x2="10" y2="50" stroke="#64748b" strokeWidth="2" />
              {/* Săgeată oscilo (top) */}
              <line x1="10" y1="90" x2="50" y2="10" stroke="#64748b" strokeWidth="1.5" />
              <line x1="90" y1="90" x2="50" y2="10" stroke="#64748b" strokeWidth="1.5" />
              {/* Mâner */}
              <rect x="8" y="45" width="4" height="10" fill="#1e293b" rx="1" />
            </>
          ) : (
            <>
              {/* Săgeată principală (batant) */}
              <line x1="5" y1="10" x2="90" y2="50" stroke="#64748b" strokeWidth="2" />
              <line x1="5" y1="90" x2="90" y2="50" stroke="#64748b" strokeWidth="2" />
              {/* Săgeată oscilo (top) */}
              <line x1="10" y1="90" x2="50" y2="10" stroke="#64748b" strokeWidth="1.5" />
              <line x1="90" y1="90" x2="50" y2="10" stroke="#64748b" strokeWidth="1.5" />
              {/* Mâner */}
              <rect x="88" y="45" width="4" height="10" fill="#1e293b" rx="1" />
            </>
          )}
        </svg>
      )}
      
      {/* Separator între canaturi (doar dacă nu e ultimul) */}
      {index < total - 1 && (
        <div className="absolute top-0 -right-2 bottom-0 w-4 border-l-4 border-slate-400" />
      )}
    </div>
  );
};

// Grafic pentru combinații de mecanisme standard
const StandardMechanismGraphic = ({ pattern }) => {
  if (!pattern || pattern.length === 0) return null;

  return (
    <div className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-slate-200 dark:border-slate-600">
      <div className="flex gap-0" style={{ height: '140px' }}>
        {pattern.map((type, index) => (
          <SingleSash 
            key={index} 
            type={type} 
            index={index} 
            total={pattern.length}
          />
        ))}
      </div>
    </div>
  );
};

function buildSashConfigs(pattern = []) {
  return pattern.map((type, idx) => {
    const isFixed = type === "fix";
    const direction = isFixed ? undefined : (idx % 2 === 0 ? "stanga" : "dreapta");
    return { type, ...(direction ? { direction } : {}) };
  });
}

function derivePresets(product, material) {
  const presets = [];

  if (!product) return presets;

  // Citim override-ul din localStorage dacă există (salvat de MechanismCombinationManager)
  let allowedCombinations = product.allowed_mechanism_combinations;
  if (product.id) {
    try {
      const override = localStorage.getItem(`product_mechanisms_${product.id}`);
      if (override) {
        allowedCombinations = JSON.parse(override);
        console.log('[MechanismPresets] Citit din localStorage:', allowedCombinations.length, 'combinații');
      }
    } catch (e) {
      console.warn('[MechanismPresets] Eroare citire localStorage:', e);
    }
  }

  // DEBUG logging
  console.log('[MechanismPresets] Product data:', {
    id: product.id,
    name: product.name,
    sashes: product.sashes,
    allowed_combinations: allowedCombinations,
    combinations_count: allowedCombinations?.length
  });

  if (product.supports_sliding) {
    if (Array.isArray(product.sliding_configurations) && product.sliding_configurations.length > 0) {
      product.sliding_configurations.forEach((c) => {
        presets.push({
          key: `sliding-${c.name}-${(c.pattern || []).join("-")}`,
          label: c.name,
          description: `${c.sash_count} canaturi`,
          pattern: c.pattern,
          isSliding: true
        });
      });
    } else {
      const fallback = ["deschidere", "fix"];
      presets.push({
        key: "sliding-fallback-2",
        label: "Culisant standard 2 canaturi",
        description: "1 deschidere + 1 fix",
        pattern: fallback,
        isSliding: true
      });
    }
    return presets;
  }

  if (Array.isArray(allowedCombinations) && allowedCombinations.length > 0) {
    const enabledCombos = allowedCombinations.filter((c) => c.is_enabled !== false);
    console.log('[MechanismPresets] Enabled combinations:', enabledCombos.length, enabledCombos);
    
    enabledCombos.forEach((c, idx) => {
      presets.push({
        key: `std-allowed-${idx}-${(c.pattern || []).join("-")}`,
        label: c.name || `Preset ${(idx + 1)}`,
        description: `${(c.pattern || []).length} canaturi`,
        pattern: c.pattern || [],
        isSliding: false
      });
    });
    
    console.log('[MechanismPresets] Generated presets from combinations:', presets.length);
  } else {
    console.log('[MechanismPresets] No allowed_mechanism_combinations found, using fallback logic');
    const sashes = product.sashes || 1;
    const openingTypes = material?.opening_types || ["fix", "batant", "oscilo-batant"];

    if (sashes === 1) {
      presets.push({
        key: "std-1-fix",
        label: "Fix",
        description: "1 fix",
        pattern: ["fix"],
        isSliding: false
      });
      const openType = openingTypes.includes("oscilo-batant") ? "oscilo-batant" : (openingTypes[1] || "batant");
      presets.push({
        key: "std-1-open",
        label: openType === "oscilo-batant" ? "Oscilo-Batant" : "Batant",
        description: `1 ${openType}`,
        pattern: [openType],
        isSliding: false
      });
    } else if (sashes === 2) {
      const openType = openingTypes.includes("oscilo-batant") ? "oscilo-batant" : (openingTypes[1] || "batant");
      const openLabel = openType === "oscilo-batant" ? "O-B" : "Batant";
      
      presets.push({
        key: "std-2-both-fix",
        label: "Fix + Fix",
        description: "2 fix",
        pattern: ["fix", "fix"],
        isSliding: false
      });
      presets.push({
        key: "std-2-both-open",
        label: `${openLabel} + ${openLabel}`,
        description: `2 ${openType}`,
        pattern: [openType, openType],
        isSliding: false
      });
      presets.push({
        key: "std-2-mix",
        label: `Fix + ${openLabel}`,
        description: `1 fix, 1 ${openType}`,
        pattern: ["fix", openType],
        isSliding: false
      });
    } else {
      const openType = openingTypes.includes("oscilo-batant") ? "oscilo-batant" : (openingTypes[1] || "batant");
      const pattern = Array.from({ length: sashes }, (_, i) => (i === Math.floor(sashes / 2) ? openType : "fix"));
      presets.push({
        key: `std-${sashes}-center-open`,
        label: "Deschidere centrală",
        description: `${sashes} canaturi`,
        pattern,
        isSliding: false
      });
      presets.push({
        key: `std-${sashes}-all-fix`,
        label: "Toate fixe",
        description: `${sashes} canaturi`,
        pattern: Array.from({ length: sashes }, () => "fix"),
        isSliding: false
      });
    }
  }

  return presets;
}

export default function MechanismPresets({
  product,
  selectedMaterial,
  currentSashConfigs = [],
  config,
  updateConfig,
  onPresetSelect,
}) {
  const presets = derivePresets(product, selectedMaterial);

  const handleSelect = (pattern) => {
    const sashConfigs = buildSashConfigs(pattern || []);
    if (typeof onPresetSelect === "function") {
      onPresetSelect(sashConfigs);
    } else if (typeof updateConfig === "function") {
      updateConfig("sash_configs", sashConfigs);
    }
  };

  const currentPattern = (currentSashConfigs || []).map((s) => s?.type || "fix").join("-");
  const isSelected = (pattern) => pattern.join("-") === currentPattern;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-6">
        <div className="mb-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
            <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Alege Tipul de Mecanism
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Selectează combinația de mecanisme pentru canaturile ferestrei/ușii.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets.map((p) => {
            const selected = isSelected(p.pattern);
            return (
              <button
                key={p.key}
                onClick={() => handleSelect(p.pattern)}
                className={`relative border-2 rounded-xl p-4 transition-all hover:shadow-lg ${
                  selected 
                    ? 'border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30 shadow-md' 
                    : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-500'
                }`}
              >
                {selected && (
                  <CheckCircle className="absolute top-3 right-3 w-6 h-6 text-blue-600 dark:text-blue-400 z-10" />
                )}
                
                <div className="mb-3">
                  {p.isSliding ? (
                    <SlidingConfigurationGraphic pattern={p.pattern} />
                  ) : (
                    <StandardMechanismGraphic pattern={p.pattern} />
                  )}
                </div>

                <div className="text-center">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{p.label}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">{p.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        {presets.length === 0 && (
          <div className="text-center text-slate-500 dark:text-slate-400 py-8">
            Nu există preseturi definite pentru acest produs.
          </div>
        )}
      </div>
    </div>
  );
}