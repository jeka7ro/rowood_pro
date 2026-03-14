import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Thermometer, Ruler, CheckCircle } from "lucide-react";

// Componentă pentru indicatori de rating (eficiență energetică, izolare fonică)
const RatingIndicator = ({ level, color = "blue", label }) => {
  const dots = [1, 2, 3, 4, 5];
  const filledDots = Math.min(Math.max(level || 0, 0), 5);
  
  const colorClasses = {
    blue: "bg-blue-500 dark:bg-blue-400",
    green: "bg-green-500 dark:bg-green-400",
    yellow: "bg-yellow-500 dark:bg-yellow-400",
    red: "bg-red-500 dark:bg-red-400"
  };

  return (
    <div className="space-y-1">
      <div className="text-xs text-slate-600 dark:text-slate-400">{label}</div>
      <div className="flex gap-1">
        {dots.map((dot) => (
          <div
            key={dot}
            className={`w-2 h-2 rounded-full ${
              dot <= filledDots ? colorClasses[color] : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default function GlazingSelector({ glazingTypes = [], config, updateConfig }) {
  const selectedId = config?.glazing_id || "";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Alege Tipul de Sticlă</h3>
        <p className="text-slate-600 dark:text-slate-400">
          Alege tipul de sticlă în funcție de necesitățile tale de izolare termică și fonică
        </p>
      </div>

      {glazingTypes.length === 0 ? (
        <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-3xl border border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 text-center">
          Nu există tipuri de sticlă configurate.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {glazingTypes.map((glazing) => {
            const isSelected = selectedId === glazing.id;
            
            // Calculăm nivelul de eficiență pe baza U-value (mai mic = mai bun)
            const energyEfficiency = glazing.u_value 
              ? (glazing.u_value <= 0.7 ? 5 : glazing.u_value <= 1.0 ? 4 : glazing.u_value <= 1.3 ? 3 : glazing.u_value <= 2.0 ? 2 : 1)
              : 3;
            
            // Calculăm izolarea fonică pe baza numărului de foi și grosime
            const soundInsulation = glazing.panes_count >= 3 ? 4 : glazing.panes_count === 2 ? 3 : 2;

            return (
              <button
                key={glazing.id}
                onClick={() => updateConfig("glazing_id", glazing.id)}
                className={`relative border-2 rounded-3xl p-5 cursor-pointer transition-all text-left ${
                  isSelected
                    ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 shadow-lg shadow-blue-500/20"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900 hover:shadow-md"
                }`}
              >
                {isSelected && (
                  <CheckCircle className="absolute -top-2 -right-2 w-7 h-7 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 rounded-full z-10 shadow-md" />
                )}
                
                {/* Header cu nume și multiplicator */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 pr-2">{glazing.name}</h3>
                  {glazing.price_multiplier && glazing.price_multiplier !== 1 && (
                    <Badge 
                      variant="secondary" 
                      className={`text-xs font-semibold ${
                        glazing.price_multiplier > 1.5 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      x{glazing.price_multiplier}
                    </Badge>
                  )}
                </div>

                {/* Specificații tehnice principale */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                      <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{glazing.panes_count || 1}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Foi sticlă</div>
                  </div>

                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                      <Thermometer className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{glazing.u_value || 'N/A'}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">U-value</div>
                  </div>

                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                      <Ruler className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{glazing.thickness || 24}mm</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Grosime</div>
                  </div>
                </div>

                {/* Caracteristici (features) */}
                {glazing.features && glazing.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {glazing.features.map((feature, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className="text-xs font-medium bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Indicatori de eficiență */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <RatingIndicator 
                    level={energyEfficiency} 
                    color="green" 
                    label="Eficiență energetică"
                  />
                  <RatingIndicator 
                    level={soundInsulation} 
                    color="blue" 
                    label="Izolare fonică"
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}