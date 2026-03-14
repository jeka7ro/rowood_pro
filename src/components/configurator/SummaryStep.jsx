import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SummaryItem = ({ label, value }) => (
  <div className="flex justify-between py-3 border-b border-slate-200">
    <dt className="text-slate-600">{label}</dt>
    <dd className="font-semibold text-slate-800">{value || '-'}</dd>
  </div>
);

export default function SummaryStep({ config, data, price }) {
  const product = data.products.find(p => p.id === config.product_id);
  const material = data.materials.find(m => m.id === config.material_id);
  const color = data.colors.find(c => c.id === config.color_id);
  const glazing = data.glazingTypes.find(g => g.id === config.glazing_id);

  return (
    <Card className="shadow-xl border-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-slate-800">4. Sumar Configurație</CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-4">Detaliile Produsului Tău</h3>
          <dl className="space-y-1">
            <SummaryItem label="Produs" value={product?.name} />
            <SummaryItem label="Dimensiuni" value={`${config.width}mm x ${config.height}mm`} />
            <SummaryItem label="Material" value={material?.name} />
            <SummaryItem label="Culoare" value={color?.name} />
            <SummaryItem label="Tip Sticlă" value={glazing?.name} />
            <SummaryItem label="Deschidere" value={config.opening_type?.replace(/_/g, ' ')} />
          </dl>
        </div>
        <div className="flex flex-col justify-between p-6 bg-slate-100 rounded-lg">
          <div>
            <Label htmlFor="quantity">Cantitate</Label>
            <Input id="quantity" type="number" min="1" defaultValue="1" className="mt-1 w-24" />
          </div>
          <div className="text-right mt-8">
            <p className="text-slate-600">Preț Total (TVA inclus)</p>
            <p className="text-4xl font-bold text-blue-700">
              {price.toLocaleString('ro-RO', { style: 'currency', currency: 'RON' })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}