import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Euro, ChevronDown, ChevronUp, ShoppingCart, Loader2, Calculator } from 'lucide-react';

export default function PriceCalculator({
  priceDetails,
  showBreakdown,
  onToggleBreakdown,
  onAddToCart,
  isAddingToCart,
  showAddToCartButton = true
}) {
  return (
    <div className="space-y-4">
      <Card className="shadow-2xl border-none overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[32px]">
        <CardHeader className="bg-gradient-to-br from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 text-white p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Preț Total</CardTitle>
            <Calculator className="w-6 h-6" />
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="text-slate-600 dark:text-slate-400">Preț (fără TVA)</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              €{(priceDetails.totalWithoutTva || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between items-baseline text-sm">
            <span className="text-slate-500 dark:text-slate-400">TVA (21%)</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              +€{(priceDetails.tva || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <Separator className="dark:bg-slate-700" />

          <div className="flex justify-between items-baseline pt-2">
            <span className="text-lg font-semibold text-slate-700 dark:text-slate-300">TOTAL (cu TVA)</span>
            <span className="text-3xl font-bold text-green-600 dark:text-green-400">
              €{(priceDetails.total || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <button
            onClick={onToggleBreakdown}
            className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center justify-center gap-2 mt-4 py-2 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200"
          >
            {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showBreakdown ? 'Ascunde detaliile' : 'Vezi detaliile prețului'}
          </button>

          {showBreakdown && priceDetails.breakdown && priceDetails.breakdown.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
              {priceDetails.breakdown.map((item, index) => (
                <div key={index} className="flex justify-between items-start text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
                  <div className="flex-1">
                    <div className="text-slate-700 dark:text-slate-300 font-medium">{item.label}</div>
                    {item.description && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">{item.description}</div>
                    )}
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 ml-4">
                    €{(item.value || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}

          {showAddToCartButton && (
            <>
              <Separator className="dark:bg-slate-700" />
              <Button
                onClick={onAddToCart}
                disabled={isAddingToCart}
                className="w-full bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-6 text-lg font-semibold mt-4 rounded-2xl shadow-lg shadow-green-500/30 transition-all duration-200"
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Se adaugă...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Adaugă în Coș
                  </>
                )}
              </Button>
            </>
          )}

          {!showAddToCartButton && (
            <div className="bg-blue-50/80 dark:bg-blue-900/30 backdrop-blur-xl border border-blue-200 dark:border-blue-800 rounded-2xl p-4 text-center">
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                Completează configurația pentru a adăuga produsul în coș
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}