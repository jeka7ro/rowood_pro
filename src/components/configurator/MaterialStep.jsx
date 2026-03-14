import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check } from 'lucide-react';

const OptionCard = ({ option, isSelected, onSelect, children }) => (
  <Label
    htmlFor={option.id}
    className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 flex flex-col items-start ${
      isSelected ? 'border-blue-600 bg-blue-50' : 'border-slate-200'
    }`}
  >
    {isSelected && (
      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center">
        <Check className="w-3 h-3" />
      </div>
    )}
    <RadioGroupItem value={option.id} id={option.id} className="sr-only" />
    {children}
  </Label>
);

export default function MaterialStep({ materials, colors, config, updateConfig }) {
  const compatibleColors = colors.filter(c => c.material_id === config.material_id);

  return (
    <Card className="shadow-xl border-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-slate-800">2. Alege Materialul și Culoarea</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <Label className="text-lg font-semibold mb-4 block">Material Profil</Label>
          <RadioGroup
            value={config.material_id}
            onValueChange={(value) => {
              updateConfig('material_id', value);
              updateConfig('color_id', null); // Reset color on material change
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {materials.map((material) => (
              <OptionCard key={material.id} option={material} isSelected={config.material_id === material.id}>
                <h3 className="font-bold text-slate-800">{material.name}</h3>
                <p className="text-sm text-slate-600 mt-1">{material.description}</p>
                <p className="text-sm font-semibold text-blue-700 mt-4">x{material.price_multiplier} preț</p>
              </OptionCard>
            ))}
          </RadioGroup>
        </div>

        {config.material_id && (
          <div>
            <Label className="text-lg font-semibold mb-4 block">Culoare</Label>
            <RadioGroup
              value={config.color_id}
              onValueChange={(value) => updateConfig('color_id', value)}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
            >
              {compatibleColors.map((color) => (
                <Label
                  key={color.id}
                  htmlFor={color.id}
                  className={`relative flex flex-col items-center justify-center p-2 rounded-lg border-2 cursor-pointer ${
                    config.color_id === color.id ? 'border-blue-600' : 'border-transparent'
                  }`}
                >
                  <div className="w-full h-12 rounded-md" style={{ backgroundColor: color.hex_code }}></div>
                  <span className="text-sm mt-2 text-center font-medium">{color.name}</span>
                  <RadioGroupItem value={color.id} id={color.id} className="sr-only" />
                </Label>
              ))}
            </RadioGroup>
          </div>
        )}
      </CardContent>
    </Card>
  );
}