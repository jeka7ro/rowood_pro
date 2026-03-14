import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function MaterialSelector({ materials, subMaterials, config, updateConfig, selectedMaterial }) {
  const handleMaterialClick = (materialId) => {
    updateConfig('material_id', materialId);
  };

  const handleSubMaterialClick = (subMaterialId) => {
    updateConfig('sub_material_id', subMaterialId);
  };

  // Debug logging
  useEffect(() => {
    console.log('[MaterialSelector] Config material_id:', config.material_id);
    console.log('[MaterialSelector] Selected Material:', selectedMaterial);
    console.log('[MaterialSelector] Compatible SubMaterials:', subMaterials);
  }, [config.material_id, selectedMaterial, subMaterials]);

  return (
    <div>
      <h3 className="text-2xl font-bold text-slate-50 dark:text-slate-50 mb-2">Alege Materialul</h3>
      <p className="text-slate-300 dark:text-slate-300 mb-6">
        Selectează materialul principal pentru fereastra sau ușa ta
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {materials.map((material) => {
          const isSelected = material.id === config.material_id;
          return (
            <Card
              key={material.id}
              onClick={() => handleMaterialClick(material.id)}
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl rounded-3xl border-2 bg-white dark:bg-slate-800 ${
                isSelected 
                  ? 'border-green-500 dark:border-green-600 shadow-lg shadow-green-500/20' 
                  : 'border-slate-200 dark:border-slate-600 hover:border-green-300 dark:hover:border-green-700'
              }`}
            >
              <CardContent className="p-3">
                <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-2xl overflow-hidden mb-2">
                  <img
                    src={material.image_url || 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop'}
                    alt={material.name}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 bg-green-600 dark:bg-green-500 text-white rounded-full p-1 shadow-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-50 mb-1 text-center">{material.name}</h4>
                <p className="text-[10px] text-slate-600 dark:text-slate-300 line-clamp-2 min-h-[2rem] text-center">
                  {material.description || 'Material premium'}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Force re-render with key when material changes */}
      {config.material_id && selectedMaterial && subMaterials.length > 0 && (
        <div key={`submaterials-${config.material_id}`} className="mt-8 animate-fade-in-up">
          <h3 className="text-2xl font-bold text-slate-50 dark:text-slate-50 mb-2">
            Alege Tipul de {selectedMaterial.name}
          </h3>
          <p className="text-slate-300 dark:text-slate-300 mb-6">
            Selectează esența de lemn preferată
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {subMaterials.map((subMaterial) => {
              const isSelected = subMaterial.id === config.sub_material_id;
              return (
                <Card
                  key={subMaterial.id}
                  onClick={() => handleSubMaterialClick(subMaterial.id)}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-xl rounded-3xl border-2 bg-white dark:bg-slate-800 ${
                    isSelected 
                      ? 'border-green-500 dark:border-green-600 shadow-lg shadow-green-500/20' 
                      : 'border-slate-200 dark:border-slate-600 hover:border-green-300 dark:hover:border-green-700'
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-2xl overflow-hidden mb-2">
                      <img
                        src={subMaterial.image_url || 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop'}
                        alt={subMaterial.name}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 bg-green-600 dark:bg-green-500 text-white rounded-full p-1 shadow-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-50 mb-1 text-center">{subMaterial.name}</h4>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 text-center">
                      {subMaterial.price_multiplier > 1 
                        ? `+${((subMaterial.price_multiplier - 1) * 100).toFixed(0)}%` 
                        : 'Standard'}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}