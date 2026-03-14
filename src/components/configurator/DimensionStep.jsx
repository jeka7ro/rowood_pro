import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Package } from 'lucide-react';

export default function DimensionStep({ products, config, updateConfig }) {
  const selectedProduct = products.find(p => p.id === config.product_id);

  const handleDimensionChange = (field, value) => {
    if (!selectedProduct) return;
    const numericValue = parseInt(value, 10);
    const min = selectedProduct[`min_${field}`];
    const max = selectedProduct[`max_${field}`];

    if (!isNaN(numericValue) && numericValue >= min && numericValue <= max) {
      updateConfig(field, numericValue);
    } else {
        // Handle invalid input, maybe show a temporary message or just don't update
        // For now, let's allow typing but the validation logic could be improved.
         updateConfig(field, value);
    }
  };

  return (
    <Card className="shadow-xl border-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-slate-800">1. Alege Produsul și Dimensiunile</CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-8">
        <div>
          <Label className="text-lg font-semibold mb-4 block">Tip Produs</Label>
          <RadioGroup
            value={config.product_id}
            onValueChange={(value) => updateConfig('product_id', value)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {products.map((product) => (
              <Label
                key={product.id}
                htmlFor={product.id}
                className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${
                  config.product_id === product.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200'
                }`}
              >
                <Package className="w-8 h-8 mb-2 text-blue-600" />
                <span className="font-semibold text-slate-800">{product.name}</span>
                <RadioGroupItem value={product.id} id={product.id} className="sr-only" />
              </Label>
            ))}
          </RadioGroup>
        </div>
        
        <div className="space-y-6">
          <Label className="text-lg font-semibold block">Dimensiuni (în mm)</Label>
          <div className="space-y-4">
            <div>
              <Label htmlFor="width">Lățime</Label>
              <Input
                id="width"
                type="number"
                value={config.width}
                onChange={(e) => handleDimensionChange('width', e.target.value)}
                min={selectedProduct?.min_width}
                max={selectedProduct?.max_width}
                className="mt-1"
              />
              {selectedProduct && <p className="text-xs text-slate-500 mt-1">Min: {selectedProduct.min_width}mm, Max: {selectedProduct.max_width}mm</p>}
            </div>
            <div>
              <Label htmlFor="height">Înălțime</Label>
              <Input
                id="height"
                type="number"
                value={config.height}
                onChange={(e) => handleDimensionChange('height', e.target.value)}
                min={selectedProduct?.min_height}
                max={selectedProduct?.max_height}
                className="mt-1"
              />
              {selectedProduct && <p className="text-xs text-slate-500 mt-1">Min: {selectedProduct.min_height}mm, Max: {selectedProduct.max_height}mm</p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}