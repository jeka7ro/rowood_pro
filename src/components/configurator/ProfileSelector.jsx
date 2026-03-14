import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Thermometer, Layers } from 'lucide-react';

export default function ProfileSelector({ profiles, config, updateConfig, selectedMaterial }) {
  // Filtrăm profilurile compatibile cu materialul selectat
  const compatibleProfiles = useMemo(() => {
    if (!config.material_id || !profiles || profiles.length === 0) return [];
    
    return profiles.filter(profile => {
      // Dacă profilul nu are compatible_materials definit, îl arătăm pentru toate materialele
      if (!profile.compatible_materials || profile.compatible_materials.length === 0) {
        return true;
      }
      // Altfel, verificăm dacă materialul curent e în lista de compatibilitate
      return profile.compatible_materials.includes(config.material_id);
    }).sort((a, b) => (a.priority_order || 100) - (b.priority_order || 100));
  }, [profiles, config.material_id]);

  const handleProfileClick = (profileId) => {
    updateConfig('profile_id', profileId);
  };

  if (!config.material_id) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 dark:text-slate-500">
          Te rugăm să selectezi mai întâi un material.
        </p>
      </div>
    );
  }

  if (compatibleProfiles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 dark:text-slate-500">
          Nu există profile disponibile pentru materialul selectat.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Alege Profilul</h3>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Selectează sistemul de profil pentru {selectedMaterial?.name || 'materialul ales'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {compatibleProfiles.map((profile) => {
          const isSelected = profile.id === config.profile_id;
          
          return (
            <Card
              key={profile.id}
              onClick={() => handleProfileClick(profile.id)}
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl rounded-3xl border-2 bg-white dark:bg-slate-800 ${
                isSelected 
                  ? 'border-green-500 dark:border-green-600 shadow-lg shadow-green-500/20 ring-2 ring-green-500/20' 
                  : 'border-slate-200 dark:border-slate-600 hover:border-green-300 dark:hover:border-green-700'
              }`}
            >
              <CardContent className="p-4">
                {/* Imagine profil */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-2xl overflow-hidden mb-3">
                  {profile.image_url ? (
                    <img
                      src={profile.image_url}
                      alt={profile.name}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                    </div>
                  )}
                  
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-green-600 dark:bg-green-500 text-white rounded-full p-1.5 shadow-lg">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Nume și detalii */}
                <h4 className="font-bold text-base text-slate-900 dark:text-slate-50 mb-2 text-center">
                  {profile.name}
                </h4>

                {/* Specificații tehnice */}
                <div className="flex flex-wrap justify-center gap-2 mb-3">
                  {profile.u_value && (
                    <Badge variant="secondary" className="text-xs flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      <Thermometer className="w-3 h-3" />
                      U={profile.u_value}
                    </Badge>
                  )}
                  {profile.installation_depth && (
                    <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {profile.installation_depth}mm
                    </Badge>
                  )}
                  {profile.seals_count && (
                    <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {profile.seals_count} sigilii
                    </Badge>
                  )}
                </div>

                {/* Design type */}
                {profile.design_type && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-2">
                    {profile.design_type}
                  </p>
                )}

                {/* Features */}
                {profile.features && profile.features.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1">
                    {profile.features.slice(0, 3).map((feature, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-[10px] border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                      >
                        {feature}
                      </Badge>
                    ))}
                    {profile.features.length > 3 && (
                      <Badge 
                        variant="outline" 
                        className="text-[10px] border-slate-200 dark:border-slate-600 text-slate-500"
                      >
                        +{profile.features.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Preț multiplicator dacă există */}
                {profile.price_multiplier && profile.price_multiplier !== 1 && (
                  <div className="mt-3 text-center">
                    <Badge className={`text-xs ${
                      profile.price_multiplier > 1 
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' 
                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    }`}>
                      {profile.price_multiplier > 1 ? '+' : ''}{((profile.price_multiplier - 1) * 100).toFixed(0)}% preț
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}