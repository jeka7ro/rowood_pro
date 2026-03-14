import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Ruler, MoveHorizontal, MoveVertical, Settings } from 'lucide-react';
import { PresetDimension } from '@/entities/PresetDimension';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export default function DimensionControls({
  product,
  config,
  updateConfig,
  sashConfigs = [],
  onSashConfigChange,
  selectedMaterial,
  individualSashWidths,
  useIndividualWidths,
  onIndividualSashWidthChange,
  onToggleIndividualWidths,
  hideMechanismPresets = false
}) {
  const [filteredPresets, setFilteredPresets] = useState([]);

  useEffect(() => {
    const fetchPresets = async () => {
      if (!product) return;
      try {
        const allActivePresets = await PresetDimension.filter({ is_active: true });
        const applicablePresets = allActivePresets.filter(
          (p) => p.category === 'all' || p.category === product.category
        );
        setFilteredPresets(applicablePresets);
      } catch (e) {
        console.error("Failed to load preset dimensions", e);
        setFilteredPresets([]);
      }
    };
    fetchPresets();
  }, [product]);

  const handlePresetSelect = (preset) => {
    updateConfig('width', preset.width);
    updateConfig('height', preset.height);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Dimensiuni Predefinite</h3>
        <p className="text-slate-600 dark:text-slate-400">
          Alege o dimensiune standard sau personalizează
        </p>
      </div>

      {/* Preset Dimensions */}
      {filteredPresets.length > 0 && (
        <div className="p-5 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Ruler className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Dimensiuni Predefinite</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredPresets.map((preset) => (
              <Button
                key={preset.id}
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect(preset)}
                className="h-auto py-3 px-4 text-center rounded-2xl border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900"
              >
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{preset.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {preset.width} × {preset.height} mm
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Main Dimensions */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Label htmlFor="width" className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
            <MoveHorizontal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Lățime
          </Label>
          <div className="space-y-4">
            <Slider
              id="width"
              min={product?.min_width || 400}
              max={product?.max_width || 4000}
              step={10}
              value={[config.width]}
              onValueChange={(values) => updateConfig('width', values[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Min: {product?.min_width || 400} mm</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{config.width} mm</span>
              <span>Max: {product?.max_width || 4000} mm</span>
            </div>
            <Input
              type="number"
              value={config.width}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) || e.target.value === '') {
                  updateConfig('width', val || '');
                }
              }}
              onBlur={(e) => {
                const val = parseInt(e.target.value, 10);
                const min = product?.min_width || 400;
                const max = product?.max_width || 4000;
                if (!isNaN(val)) {
                  updateConfig('width', Math.min(Math.max(val, min), max));
                } else {
                  updateConfig('width', min);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = parseInt(e.target.value, 10);
                  const min = product?.min_width || 400;
                  const max = product?.max_width || 4000;
                  if (!isNaN(val)) {
                    updateConfig('width', Math.min(Math.max(val, min), max));
                  } else {
                    updateConfig('width', min);
                  }
                  e.target.blur();
                }
              }}
              min={product?.min_width || 400}
              max={product?.max_width || 4000}
              className="text-center bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="height" className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
            <MoveVertical className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Înălțime
          </Label>
          <div className="space-y-4">
            <Slider
              id="height"
              min={product?.min_height || 600}
              max={product?.max_height || 2800}
              step={10}
              value={[config.height]}
              onValueChange={(values) => updateConfig('height', values[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Min: {product?.min_height || 600} mm</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{config.height} mm</span>
              <span>Max: {product?.max_height || 2800} mm</span>
            </div>
            <Input
              type="number"
              value={config.height}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) || e.target.value === '') {
                  updateConfig('height', val || '');
                }
              }}
              onBlur={(e) => {
                const val = parseInt(e.target.value, 10);
                const min = product?.min_height || 600;
                const max = product?.max_height || 2800;
                if (!isNaN(val)) {
                  updateConfig('height', Math.min(Math.max(val, min), max));
                } else {
                  updateConfig('height', min);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = parseInt(e.target.value, 10);
                  const min = product?.min_height || 600;
                  const max = product?.max_height || 2800;
                  if (!isNaN(val)) {
                    updateConfig('height', Math.min(Math.max(val, min), max));
                  } else {
                    updateConfig('height', min);
                  }
                  e.target.blur();
                }
              }}
              min={product?.min_height || 600}
              max={product?.max_height || 2800}
              className="text-center bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
      </div>

      {/* Bifă pentru Dimensiuni Individuale pe Canat */}
      {product && !product.supports_sliding && sashConfigs && sashConfigs.length > 1 && (
        <div className="mt-8">
          <div className="flex items-center justify-between p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-3xl border border-blue-200 dark:border-blue-700/50">
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Dimensiuni Individuale pe Canat</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Permite setarea unei lățimi diferite pentru fiecare canat
              </p>
            </div>
            <Switch
              checked={useIndividualWidths || false}
              onCheckedChange={(checked) => onToggleIndividualWidths && onToggleIndividualWidths(checked)}
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          {useIndividualWidths && onIndividualSashWidthChange && (
            <div className="mt-4 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700">
              <h5 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Lățimi Individuale per Canat</h5>
              <div className="space-y-4">
                {sashConfigs.map((sash, index) => {
                  const currentWidth = individualSashWidths?.[index] || Math.floor(config.width / sashConfigs.length);
                  const minSashWidth = 300;
                  const maxSashWidth = Math.min(1500, Math.floor((product.max_width || 4000) / sashConfigs.length));

                  return (
                    <div key={index} className="flex items-center gap-4">
                      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 w-16">
                        Canat {index + 1}:
                      </Label>
                      <div className="flex-1">
                        <Slider
                          min={minSashWidth}
                          max={maxSashWidth}
                          step={10}
                          value={[currentWidth]}
                          onValueChange={(values) => onIndividualSashWidthChange(index, values[0])}
                          className="w-full"
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 w-20 text-right">
                        {currentWidth} mm
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* INFORMAȚII FINALE - Lățime Maximă și Suprafața */}
      <div className="mt-8 grid md:grid-cols-2 gap-4">
        <div className="p-5 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/30 dark:to-orange-800/20 rounded-3xl border border-orange-200 dark:border-orange-700/50">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-orange-900 dark:text-orange-100">Lățime Totală Maximă Permisă</span>
            <span className="text-xl font-bold text-orange-950 dark:text-orange-50">
              {product?.max_width || 4000} mm
            </span>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/30 dark:to-indigo-800/20 rounded-3xl border border-indigo-200 dark:border-indigo-700/50">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-indigo-900 dark:text-indigo-100">Suprafața Totală</span>
            <span className="text-xl font-bold text-indigo-950 dark:text-indigo-50">
              {((config.width * config.height) / 1000000).toFixed(2)} m²
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}