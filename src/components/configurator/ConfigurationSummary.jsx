import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Package, Palette, Layers, Settings, Sprout } from 'lucide-react';

export default function ConfigurationSummary({ config, data }) {
  const product = data.products.find(p => p.id === config.product_id);
  const material = data.materials.find(m => m.id === config.material_id);
  const subMaterial = data.subMaterials.find(sm => sm.id === config.sub_material_id);
  const profile = data.profiles?.find(p => p.id === config.profile_id);
  const color = data.colors.find(c => c.id === config.color_id);
  const selectedAccessories = data.accessories.filter(acc => config.accessories.includes(acc.id));

  const hasSubMaterialsForMaterial = material ? data.subMaterials.filter(sm => sm.parent_material_id === material.id).length > 0 : false;
  const allowsColorSelection = material ? material.allows_color_selection : true;

  const isConfigurationComplete = 
    product && 
    material && 
    profile &&
    (subMaterial || !hasSubMaterialsForMaterial) && 
    (color || config.custom_ral_code || config.custom_hex_code || !allowsColorSelection);

  const SummaryItem = ({ icon: Icon, label, value, description }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-800 dark:text-slate-200">{label}</span>
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
        </div>
        <div className="text-slate-900 dark:text-slate-100 font-semibold">{value}</div>
        {description && <div className="text-sm text-slate-500 dark:text-slate-400">{description}</div>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {!isConfigurationComplete && (
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-300">
              <Settings className="w-5 h-5" />
              <span className="font-semibold">Configurația nu este completă</span>
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
              Te rugăm să completezi toate opțiunile necesare în taburile anterioare.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="text-2xl text-slate-800 dark:text-slate-100">Sumarul Configurației</CardTitle>
          <p className="text-slate-600 dark:text-slate-400">Verifică toate opțiunile selectate înainte de finalizare</p>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {product && (
            <SummaryItem
              icon={Package}
              label="Produs"
              value={product.name}
              description={`${config.width}mm × ${config.height}mm`}
            />
          )}

          {material && (
            <SummaryItem
              icon={Palette}
              label="Material"
              value={material.name}
              description={material.description}
            />
          )}

          {subMaterial && (
            <SummaryItem
              icon={Sprout}
              label="Tip Lemn"
              value={subMaterial.name}
              description={`Multiplicator preț: x${subMaterial.price_multiplier}`}
            />
          )}

          {profile && (
            <SummaryItem
              icon={Layers}
              label="Profil"
              value={profile.name}
              description={`${profile.installation_depth}mm, U=${profile.u_value}`}
            />
          )}
          
          {(color || config.custom_ral_code || config.custom_hex_code) && (
            <SummaryItem
              icon={Palette}
              label="Culoare"
              value={
                color 
                  ? color.name 
                  : config.custom_hex_code 
                    ? `HEX Custom: ${config.custom_hex_code}`
                    : `RAL Custom: ${config.custom_ral_code}`
              }
              description={color ? `Ajustare: ${color.price_adjustment || 0}€` : 'Taxă culoare specială'}
            />
          )}

          {selectedAccessories.length > 0 && (
            <>
              <Separator className="dark:bg-slate-700" />
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Accesorii Selectate ({selectedAccessories.length})
                </h4>
                <div className="grid gap-2">
                  {selectedAccessories.map((accessory) => (
                    <div key={accessory.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                      <span className="text-slate-800 dark:text-slate-200">{accessory.name}</span>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">+{accessory.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator className="dark:bg-slate-700" />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <span className="text-blue-600 dark:text-blue-400 font-medium">Suprafața totală</span>
              <div className="text-xl font-bold text-blue-800 dark:text-blue-300">
                {((config.width * config.height) / 1000000).toFixed(2)} m²
              </div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <span className="text-green-600 dark:text-green-400 font-medium">Cantitatea</span>
              <div className="text-xl font-bold text-green-800 dark:text-green-300">
                {config.quantity} {config.quantity === 1 ? 'bucată' : 'bucăți'}
              </div>
            </div>
          </div>

          {config.special_requirements && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Cerințe Speciale</h4>
              <p className="text-yellow-700 dark:text-yellow-400 text-sm">{config.special_requirements}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}