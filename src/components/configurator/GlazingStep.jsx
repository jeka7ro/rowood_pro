import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Layers } from 'lucide-react';

const OptionCard = ({ option, isSelected, onSelect, children }) => (
    <Label
      htmlFor={option.id}
      className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 flex flex-col items-start ${
        isSelected ? 'border-blue-600 bg-blue-50' : 'border-slate-200'
      }`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center">
          <Layers className="w-3 h-3" />
        </div>
      )}
      <RadioGroupItem value={option.id} id={option.id} className="sr-only" />
      {children}
    </Label>
);

export default function GlazingStep({ glazingTypes, product, config, updateConfig }) {
  return (
    <Card className="shadow-xl border-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-slate-800">3. Alege Sticla și Tipul de Deschidere</CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-8">
        <div>
          <Label className="text-lg font-semibold mb-4 block">Tip Sticlă</Label>
          <RadioGroup
            value={config.glazing_id}
            onValueChange={(value) => updateConfig('glazing_id', value)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {glazingTypes.map((glazing) => (
              <OptionCard key={glazing.id} option={glazing} isSelected={config.glazing_id === glazing.id}>
                <h3 className="font-bold text-slate-800">{glazing.name}</h3>
                <p className="text-sm text-slate-600 mt-1">U-value: {glazing.u_value}</p>
                <p className="text-xs text-slate-500 mt-1">{glazing.features.join(', ')}</p>
                <p className="text-sm font-semibold text-blue-700 mt-4">x{glazing.price_multiplier} preț</p>
              </OptionCard>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label className="text-lg font-semibold mb-4 block">Tip Deschidere</Label>
          <RadioGroup
            value={config.opening_type}
            onValueChange={(value) => updateConfig('opening_type', value)}
            className="space-y-2"
          >
            {product?.opening_types.map((type) => (
              <Label key={type} htmlFor={type} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50">
                <RadioGroupItem value={type} id={type} />
                <span className="font-medium text-slate-700 capitalize">{type.replace(/_/g, ' ')}</span>
              </Label>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}