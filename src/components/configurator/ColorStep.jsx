import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Palette, AlertCircle, Info } from 'lucide-react';

const isValidHex = (hex) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
const isValidRal = (ral) => /^\d{4}$/.test(ral);

export default function ColorStep({ config, updateConfig, selectedMaterial, compatibleColors }) {
  const [hexInput, setHexInput] = useState(config.custom_hex_code || '#ffffff');
  const [ralInput, setRalInput] = useState(config.custom_ral_code || '');

  useEffect(() => {
    console.log('[ColorStep] Rendered with:', {
      material: selectedMaterial?.name,
      material_id: config.material_id,
      sub_material_id: config.sub_material_id,
      compatibleColors: compatibleColors.length,
      colorNames: compatibleColors.map(c => c.name)
    });
  }, [selectedMaterial, config.material_id, config.sub_material_id, compatibleColors]);

  const scrollToPreview = () => {
    // Scroll către preview doar pe mobil/tabletă (sub 1024px)
    if (window.innerWidth < 1024) {
      const previewElement = document.getElementById('config-preview');
      if (previewElement) {
        setTimeout(() => {
          previewElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center'
          });
        }, 100);
      }
    }
  };

  const handleColorSelect = (colorId) => {
    updateConfig('color_id', colorId);
    scrollToPreview();
  };

  const handleHexPickerChange = (value) => {
    setHexInput(value);
    updateConfig('custom_hex_code', value);
    setRalInput('');
    scrollToPreview();
  };

  const handleRalChange = (value) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    setRalInput(numericValue);
    
    if (isValidRal(numericValue)) {
      updateConfig('custom_ral_code', numericValue);
      setHexInput('#ffffff');
      scrollToPreview();
    } else if (numericValue === '') {
      updateConfig('custom_ral_code', '');
    }
  };

  const selectedColor = compatibleColors.find(c => c.id === config.color_id);
  const hasCustomHex = config.custom_hex_code && isValidHex(config.custom_hex_code);
  const hasCustomRal = config.custom_ral_code && isValidRal(config.custom_ral_code);

  if (!selectedMaterial) {
    return (
      <div className="text-center py-12">
        <Palette className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
        <p className="text-slate-600 dark:text-slate-400">Selectează mai întâi un material</p>
      </div>
    );
  }

  if (!selectedMaterial.allows_color_selection) {
    return (
      <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-600">
        <AlertCircle className="w-16 h-16 mx-auto text-blue-500 mb-4" />
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
          Material Fără Selecție Culoare
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Materialul <strong>{selectedMaterial.name}</strong> vine în culoarea sa naturală și nu necesită selecție de culoare.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Alege Culoarea Profilului</h3>
      <p className="text-slate-700 dark:text-slate-300 mb-8">
        Selectează o culoare predefinită sau alege o culoare personalizată din paletar
      </p>

      {compatibleColors.length > 0 ? (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Culori Predefinite
            <Badge variant="secondary" className="rounded-full">{compatibleColors.length}</Badge>
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {compatibleColors.map((color) => {
              const isSelected = color.id === config.color_id;
              return (
                <Card
                  key={color.id}
                  onClick={() => handleColorSelect(color.id)}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-xl rounded-3xl border-2 bg-white dark:bg-slate-800 hover:scale-105 ${
                    isSelected 
                      ? 'border-green-500 dark:border-green-600 shadow-lg shadow-green-500/20 scale-105' 
                      : 'border-slate-200 dark:border-slate-600 hover:border-green-300 dark:hover:border-green-700'
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="relative aspect-square rounded-2xl overflow-hidden mb-2 border-2 border-slate-200 dark:border-slate-600 shadow-inner" style={{ backgroundColor: color.hex_code }}>
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-green-600 dark:bg-green-500 text-white rounded-full p-1 shadow-lg">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <p className="font-semibold text-xs text-slate-900 dark:text-slate-50 text-center leading-tight">{color.name}</p>
                    {color.ral_code && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center mt-1">RAL {color.ral_code}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mb-8 p-6 bg-blue-50/80 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700 rounded-3xl backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                Nu există culori predefinite pentru acest material
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Te rugăm să alegi o culoare personalizată din paletar sau introduci un cod RAL mai jos.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Culoare Personalizată
        </h4>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="rounded-3xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-5">
              <Label className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3 block">Cod HEX Personalizat</Label>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={hexInput}
                    onChange={(e) => handleHexPickerChange(e.target.value)}
                    className="w-20 h-20 rounded-2xl border-2 border-slate-300 dark:border-slate-600 cursor-pointer shadow-lg hover:scale-105 transition-transform"
                    title="Alege culoarea"
                  />
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={hexInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setHexInput(val);
                        if (isValidHex(val)) {
                          updateConfig('custom_hex_code', val);
                          setRalInput('');
                        }
                      }}
                      className="rounded-xl bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                      placeholder="#FF5733"
                    />
                    {hexInput && !isValidHex(hexInput) && (
                      <p className="text-xs text-red-500 mt-1">Format invalid (ex: #FF5733)</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-5">
              <Label className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3 block">Cod RAL Personalizat</Label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="9016"
                    value={ralInput}
                    onChange={(e) => handleRalChange(e.target.value)}
                    maxLength={4}
                    className="rounded-xl bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                  />
                  {ralInput && !isValidRal(ralInput) && (
                    <p className="text-xs text-red-500 mt-1">Cod RAL invalid (4 cifre)</p>
                  )}
                </div>
                {hasCustomRal && (
                  <div className="w-14 h-14 rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-slate-200 dark:bg-slate-700 flex items-center justify-center shadow-lg">
                    <span className="text-[10px] font-mono text-slate-600 dark:text-slate-300 text-center leading-tight">RAL<br/>{config.custom_ral_code}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}