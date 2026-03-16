import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function AdvancedHardwareSelector({ config, updateConfig }) {
  const handles = [
    { id: 'standard', name: 'Mâner Standard' },
    { id: 'design', name: 'Design Modern (Secustik)' },
    { id: 'hidden', name: 'Mâner Îngropat / Minimalist' }
  ];

  const handleColors = [
    { id: '#FFFFFF', name: 'Alb' },
    { id: '#A9A9A9', name: 'Titan / Argintiu' },
    { id: '#8B4513', name: 'Maro', dark: true },
    { id: '#000000', name: 'Negru Mat', dark: true },
    { id: '#D4AF37', name: 'Auriu / Șampanie' }
  ];

  const hinges = [
    { id: 'standard', name: 'Balamale Standard (Vizibile)' },
    { id: 'hidden', name: 'Balamale Ascunse' },
    { id: 'heavy', name: 'Balamale Purtătoare 3D (Uși)' }
  ];

  const locks = [
    { id: 'standard', name: 'Închidere Standard' },
    { id: 'security_rc1', name: 'Securitate RC1 (Mushroom)' },
    { id: 'security_rc2', name: 'Securitate RC2' }
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Feronerie și Accesorii Detaliate</h3>
        <p className="text-slate-500 text-sm">Personalizează elementele funcționale și estetice ale produsului tău.</p>
      </div>

      <Accordion type="single" collapsible className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-4">
        <AccordionItem value="handles" className="border-b-0">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
              </div>
              <span className="font-semibold">Control Mânere</span>
              {(config.handle_type || config.handle_color) && (
                  <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 border-none">Personalizat</Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 space-y-6">
            <div className="space-y-3">
              <Label className="text-slate-600 dark:text-slate-400">Model Mâner</Label>
              <Select value={config.handle_type || 'standard'} onValueChange={(val) => updateConfig('handle_type', val)}>
                <SelectTrigger className="w-full text-left bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Alege tipul de mâner..." />
                </SelectTrigger>
                <SelectContent>
                  {handles.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-slate-600 dark:text-slate-400">Culoare Mâner (3D)</Label>
              <div className="flex flex-wrap gap-3">
                {handleColors.map(color => (
                  <button
                    key={color.id}
                    onClick={() => updateConfig('handle_color', color.id)}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                        (config.handle_color || '#FFFFFF') === color.id 
                            ? 'border-blue-500 scale-110 shadow-md ring-4 ring-blue-50 dark:ring-blue-900/30' 
                            : 'border-transparent shadow-sm hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.id }}
                    title={color.name}
                  >
                     {(config.handle_color || '#FFFFFF') === color.id && (
                        <svg className={`w-5 h-5 ${color.dark ? 'text-white' : 'text-slate-800'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                     )}
                  </button>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
     </Accordion>

     <Accordion type="single" collapsible className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-4 mt-4">
        <AccordionItem value="hinges-locks" className="border-b-0">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <span className="font-semibold">Balamale și Închideri</span>
              {(config.hinge_type !== 'standard' || config.lock_type !== 'standard') && (
                 <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 border-none">Securizat</Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 space-y-6">
            <div className="space-y-3">
              <Label className="text-slate-600 dark:text-slate-400">Vizibilitate Balamale (3D)</Label>
              <Select value={config.hinge_type || 'standard'} onValueChange={(val) => updateConfig('hinge_type', val)}>
                <SelectTrigger className="w-full text-left bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Alege..." />
                </SelectTrigger>
                <SelectContent>
                  {hinges.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-slate-600 dark:text-slate-400">Sistem de Închidere (Feronerie Perimetrală)</Label>
              <Select value={config.lock_type || 'standard'} onValueChange={(val) => updateConfig('lock_type', val)}>
                <SelectTrigger className="w-full text-left bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Alege un sistem..." />
                </SelectTrigger>
                <SelectContent>
                  {locks.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
