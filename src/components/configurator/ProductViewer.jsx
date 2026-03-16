import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Settings, MoveHorizontal, MoveVertical, RectangleHorizontal, Check, Plus } from 'lucide-react';
import RealisticSlidingGraphic from '../admin/RealisticSlidingGraphic';
import BlueprintViewer from './BlueprintViewer';
import ProductViewer3D from './ProductViewer3D';
import { motion } from 'framer-motion';

// ADD: helper to slightly darken/lighten a hex color
function shadeHexColor(hex, percent) {
  if (!hex) return '#94a3b8'; // Default slate-400
  let H = hex.replace('#', '');
  if (H.length === 3) H = H.split('').map(c => c + c).join(''); // Expand short hex to full
  const num = parseInt(H, 16);

  let r = (num >> 16) + Math.round(2.55 * percent);
  let g = ((num >> 8) & 0x00FF) + Math.round(2.55 * percent);
  let b = (num & 0x0000FF) + Math.round(2.55 * percent);

  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

const SchematicSash = ({ sash, onConfigChange, availableOpeningTypes, isDoor, sashIndex, onSashWidthChange, sashWidth, useIndividualWidths, totalWidth, profileColor, glassColor, hardware }) => {
  const [initialWidth, setInitialWidth] = useState(null);

  const openingLabels = {
    'fix': 'Fix',
    'batant': 'Batant',
    'oscilo-batant': 'Oscilo-Batant',
    'deschidere': 'Culisant'
  };

  const handleSashDragStart = () => {
    setInitialWidth(sashWidth);
  };

  const handleSashDragEnd = () => {
    setInitialWidth(null);
  };

  const handleSashDrag = (event, info) => {
    if (!initialWidth || !useIndividualWidths || !onSashWidthChange) return;

    const scaleFactor = 2;
    const deltaX = info.offset.x * scaleFactor;
    let newWidth = Math.round(initialWidth + deltaX);
    newWidth = Math.max(300, Math.min(3000, newWidth));
    onSashWidthChange(sashIndex, newWidth);
  };

  const SvgIndicator = () => {
    if (!sash || !sash.type || sash.type === 'fix') return null;

    const commonProps = {
      stroke: 'rgba(51, 65, 85, 0.4)',
      strokeWidth: "1",
      fill: 'none',
      vectorEffect: 'non-scaling-stroke'
    };

    const isLeft = sash.direction === 'stanga';
    
    // Architecturally, dashed/solid lines point TO the handle. 
    // If handle is left (stanga), lines converge at X=0 Y=50
    // If handle is right, lines converge at X=100 Y=50
    const paths = {
      batant: isLeft ? ["M 100 0 L 0 50 L 100 100"] : ["M 0 0 L 100 50 L 0 100"],
      'oscilo-batant': isLeft 
        ? ["M 100 0 L 0 50 L 100 100", "M 0 100 L 50 0 L 100 100"]
        : ["M 0 0 L 100 50 L 0 100", "M 0 100 L 50 0 L 100 100"]
    };

    const pathsToDraw = paths[sash.type] || [];

    return (
      <svg className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
        {pathsToDraw.map((d, i) => <path key={i} d={d} {...commonProps} />)}
      </svg>
    );
  };

  const Handle = () => {
    if (!sash || sash.type === 'fix' || !sash.type) return null;
    const isLeft = sash.direction === 'stanga';
    
    // Toggle handle direction on click
    const toggleHandle = (e) => {
        e.stopPropagation();
        if (onConfigChange) {
            onConfigChange({ direction: isLeft ? 'dreapta' : 'stanga' });
        }
    };

    return (
      <button
        onClick={toggleHandle}
        className={`absolute top-1/2 -translate-y-1/2 w-8 h-12 z-30 flex flex-col items-center justify-center cursor-pointer group/handle transition-transform hover:scale-110 ${isLeft ? 'left-1' : 'right-1'}`}
        title="Schimbă poziția mânerului"
      >
        <div className={`relative w-4 h-12 flex flex-col items-center drop-shadow-md`}>
            {/* Baseplate */}
            <div className="w-2.5 h-10 bg-gradient-to-b from-slate-100 to-slate-400 rounded-full border border-slate-500 absolute top-1/2 -translate-y-1/2 group-hover/handle:from-blue-100 group-hover/handle:to-blue-300 transition-colors"></div>
            {/* Lever */}
            <div 
                className={`w-7 h-2.5 rounded-full border border-slate-500 absolute top-1/2 -translate-y-1/2 shadow-sm transition-colors ${isLeft ? 'left-1' : 'right-1'}`}
                style={{
                  background: hardware?.handleColor ? `linear-gradient(to right, ${hardware.handleColor}, ${shadeHexColor(hardware.handleColor, -30)})` : 'linear-gradient(to right, #e2e8f0, #94a3b8)'
                }}
            ></div>
        </div>
      </button>
    );
  };

  const Hinges = () => {
    if (!sash || sash.type === 'fix' || !sash.type) return null;
    const isLeft = sash.direction === 'stanga';
    const hingeClass = isLeft ? 'right-0.5' : 'left-0.5';

    return (
      <>
        <div className={`absolute top-6 w-1 h-8 bg-gradient-to-b from-slate-200 to-slate-400 rounded-sm border border-slate-500 shadow-sm z-10 ${hingeClass}`}></div>
        <div className={`absolute bottom-6 w-1 h-8 bg-gradient-to-b from-slate-200 to-slate-400 rounded-sm border border-slate-500 shadow-sm z-10 ${hingeClass}`}></div>
      </>
    );
  };

  const sashStyle = useIndividualWidths && sashWidth && totalWidth ?
    { width: `${(sashWidth / totalWidth) * 100}%` } :
    { flex: 1 };

  const dropdownContent = (
    <DropdownMenuContent align="end" className="rounded-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <DropdownMenuLabel className="text-slate-900 dark:text-slate-100">Configurare Canat</DropdownMenuLabel>
      <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
      <DropdownMenuLabel className="text-xs text-slate-600 dark:text-slate-400">Tip Deschidere</DropdownMenuLabel>
      {availableOpeningTypes
        .filter(type => type !== 'deschidere' && type !== 'culisant')
        .map(type => (
          <DropdownMenuItem key={type} onSelect={() => onConfigChange({ type })} className="text-slate-700 dark:text-slate-300 cursor-pointer">
            <div className="flex items-center justify-between w-full">
              <span>{openingLabels[type] || type}</span>
              {sash.type === type && <Check className="w-4 h-4 text-green-600" />}
            </div>
          </DropdownMenuItem>
        ))}
      {sash.type !== 'fix' && (
        <>
          <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
          <DropdownMenuLabel className="text-xs text-slate-600 dark:text-slate-400">Poziție Mâner</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => onConfigChange({ direction: 'stanga' })} className="text-slate-700 dark:text-slate-300 cursor-pointer">
            <div className="flex items-center justify-between w-full">
              <span>Stânga</span>
              {sash.direction === 'stanga' && <Check className="w-4 h-4 text-green-600" />}
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onConfigChange({ direction: 'dreapta' })} className="text-slate-700 dark:text-slate-300 cursor-pointer">
            <div className="flex items-center justify-between w-full">
              <span>Dreapta</span>
              {sash.direction === 'dreapta' && <Check className="w-4 h-4 text-green-600" />}
            </div>
          </DropdownMenuItem>
        </>
      )}
    </DropdownMenuContent>
  );

  return (
    <div
      className="relative border-r-[10px] last:border-r-0 group transition-all duration-300 h-full"
      style={{
        ...sashStyle,
        borderRightColor: profileColor || '#64748B'
      }}
    >
      {useIndividualWidths && onSashWidthChange && (
        <motion.div
          drag="x"
          onDragStart={handleSashDragStart}
          onDrag={handleSashDrag}
          onDragEnd={handleSashDragEnd}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0}
          dragMomentum={false}
          className="absolute top-0 -right-[5px] bottom-0 w-[10px] cursor-col-resize z-40 flex items-center justify-center group/drag hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-2xl transition-all duration-200"
        >
          <div className="w-1 h-8 bg-orange-400 group-hover/drag:bg-orange-600 rounded-full transition-colors shadow-sm"></div>
        </motion.div>
      )}

      {/* Rendering Realistic Sash */}
      {(!sash || sash.type === 'fix') ? (
        // Fixed Sash: Just Glass
        <div 
          className="absolute inset-1.5 rounded-lg pointer-events-none overflow-hidden"
          style={{ 
            backgroundColor: glassColor || 'rgba(233, 238, 245, 0.75)',
            boxShadow: 'inset 0 0 12px rgba(0,0,0,0.1), inset 1px 1px 2px rgba(255,255,255,0.8)',
            border: '2px solid rgba(0,0,0,0.05)'
          }}
        >
          {/* Glass shine */}
          <div className="absolute inset-0 opacity-40 bg-gradient-to-tr from-transparent via-white to-transparent" style={{ transform: 'rotate(-45deg) scale(1.5)', backgroundSize: '150% 150%' }}></div>
        </div>
      ) : (
        // Playable Sash: Inner Frame + Glass
        <div 
          className="absolute inset-[4px] rounded-lg border-[6px] md:border-[8px] sm:border-[5px] pointer-events-none shadow-sm flex items-center justify-center p-0.5 md:p-1"
          style={{ 
            borderColor: profileColor || '#f1f5f9',
            boxShadow: 'inset 1px 1px 3px rgba(255,255,255,0.7), inset -1px -1px 3px rgba(0,0,0,0.3), 0 2px 5px rgba(0,0,0,0.3)'
          }}
        >
          <div 
            className="w-full h-full rounded-sm pointer-events-none relative overflow-hidden"
            style={{ 
              backgroundColor: glassColor || 'rgba(233, 238, 245, 0.75)',
              boxShadow: 'inset 0 0 8px rgba(0,0,0,0.2)',
              border: '1px solid rgba(0,0,0,0.2)'
            }}
          >
            {/* Glass shine */}
            <div className="absolute inset-0 opacity-50 bg-gradient-to-tr from-transparent via-white to-transparent" style={{ transform: 'rotate(-45deg) scale(1.5)', backgroundSize: '150% 150%' }}></div>
          </div>
        </div>
      )}

      <SvgIndicator />
      <Handle />
      <Hinges />

      <div className="absolute top-1 right-1 z-30">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 bg-white/80 hover:bg-white rounded-2xl shadow-md transition-all duration-200 opacity-90 hover:opacity-100 hover:scale-110 backdrop-blur-xl border border-slate-200 group-hover:block" title="Setări Canat">
              <Settings className="w-4 h-4 text-indigo-700" />
            </button>
          </DropdownMenuTrigger>
          {dropdownContent}
        </DropdownMenu>
      </div>

      {(sash.type === 'fix' || !sash.type) && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                title="Adaugă Deschidere" 
                className="pointer-events-auto p-4 bg-slate-100/40 hover:bg-white/80 rounded-full shadow-lg transition-all duration-300 backdrop-blur-md group/plus border border-white/50 cursor-pointer hover:scale-110"
              >
                <Plus className="w-8 h-8 text-indigo-900/40 group-hover/plus:text-indigo-800 transition-colors" strokeWidth={2.5} />
              </button>
            </DropdownMenuTrigger>
            {dropdownContent}
          </DropdownMenu>
        </div>
      )}

      {isDoor && sash && sash.type !== 'fix' && (
        <div className={`absolute bottom-2 h-2 w-8 bg-slate-600 rounded-t-xl ${sash.direction === 'stanga' ? 'left-2' : 'right-2'}`}></div>
      )}

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <Badge variant="secondary" className="text-xs bg-white/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
          {openingLabels[sash.type] || sash.type}
        </Badge>
      </div>
    </div>
  );
};

export default function ProductViewer({ product, width, height, material, subMaterial, color, glazing, sashConfigs, onSashConfigChange, isDoor, updateConfig, individualSashWidths, useIndividualWidths, hardware }) {
  const [initialDragDimensions, setInitialDragDimensions] = useState(null);
  const [viewMode, setViewMode] = useState('2d'); // '2d', 'blueprint', '3d'

  const actualWidth = useIndividualWidths && individualSashWidths?.length > 0 ?
    individualSashWidths.reduce((sum, w) => sum + (w || 0), 0) : width;

  const frameColor = color ? color.hex_code : '#D1D5DB';
  const innerProfileColor = shadeHexColor(frameColor, -15);
  const glassBackgroundColor = shadeHexColor(frameColor, 60); // Lighter version for glass area
  const aspectRatio = actualWidth && height ? actualWidth / height : 4 / 3;

  if (!product) {
    return (
      <Card className="rounded-b-[32px] border-none shadow-xl overflow-hidden">
        <CardContent className="h-[600px] flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-b-[32px]">
          <div className="w-24 h-24 bg-white dark:bg-slate-700 rounded-[32px] flex items-center justify-center mb-6 shadow-lg">
            <RectangleHorizontal className="w-12 h-12 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Selectează un Produs</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Pentru a începe, alege un produs din panoul de configurare. Vizualizarea va apărea aici.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleDragStart = () => {
    setInitialDragDimensions({
      width: actualWidth,
      height,
      individualWidths: [...(individualSashWidths || [])]
    });
  };

  const handleDragEnd = () => {
    setInitialDragDimensions(null);
  };

  const handleDragWidth = (event, info) => {
    if (!initialDragDimensions || !updateConfig) return;

    const scaleFactor = 2;
    const deltaX = info.offset.x * scaleFactor;

    const minWidth = product.min_width || 600;
    const maxWidth = product.max_width || 3000;

    if (useIndividualWidths && initialDragDimensions.individualWidths?.length > 0) {
      const newIndividualWidths = [...initialDragDimensions.individualWidths];
      const lastIndex = newIndividualWidths.length - 1;
      let newLastWidth = Math.round(initialDragDimensions.individualWidths[lastIndex] + deltaX);

      newLastWidth = Math.max(300, Math.min(1500, newLastWidth));
      newIndividualWidths[lastIndex] = newLastWidth;

      const totalNewWidth = newIndividualWidths.reduce((sum, w) => sum + w, 0);
      if (totalNewWidth <= maxWidth) {
        updateConfig('individual_sash_widths', newIndividualWidths);
      }
    } else {
      let newWidth = Math.round(initialDragDimensions.width + deltaX);
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      updateConfig('width', newWidth);
    }
  };

  const handleDragHeight = (event, info) => {
    if (!initialDragDimensions || !updateConfig) return;

    const scaleFactor = 2;
    const deltaY = info.offset.y * scaleFactor;

    const minHeight = product.min_height || 600;
    const maxHeight = product.max_height || 2800;

    let newHeight = Math.round(initialDragDimensions.height + deltaY);
    newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
    updateConfig('height', newHeight);
  };

  const handleSashWidthChange = (sashIndex, newWidth) => {
    if (!updateConfig) return;
    const newWidths = [...(individualSashWidths || [])];

    const maxSashWidth = Math.min(1500, product.max_width || 3000);
    const constrainedWidth = Math.max(300, Math.min(maxSashWidth, newWidth));

    newWidths[sashIndex] = constrainedWidth;

    const totalWidth = newWidths.reduce((sum, w) => sum + w, 0);
    const maxTotalWidth = product.max_width || 3000;

    if (totalWidth <= maxTotalWidth) {
      updateConfig('individual_sash_widths', newWidths);
    }
  };

  const availableOpeningTypes = product.supports_sliding
    ? ['fix', 'deschidere']
    : material?.opening_types || ['fix', 'batant', 'oscilo-batant'];

  if (product.supports_sliding) {
    const pattern = sashConfigs.map(s => s.type);
    return (
      <Card className="shadow-xl border-none overflow-hidden backdrop-blur-xl">
        <CardContent className="p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 min-h-[400px] rounded-b-[32px]">
          <div className="w-full max-w-lg relative">
            <div className="absolute -top-8 left-0 right-0 flex justify-center">
              <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 px-3 py-1.5 rounded-full backdrop-blur-xl shadow-sm">
                <MoveHorizontal className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{actualWidth} mm</span>
              </div>
            </div>
            <div className="absolute top-0 bottom-0 -left-4 flex items-center -translate-x-full">
              <div className="flex items-center gap-2 -rotate-90 bg-white/60 dark:bg-slate-800/60 px-3 py-1.5 rounded-full backdrop-blur-xl shadow-sm">
                <MoveVertical className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{height} mm</span>
              </div>
            </div>
            <RealisticSlidingGraphic
              pattern={pattern}
              sashes={sashConfigs}
              isCompact={false}
              frameColor={frameColor}
              glassColor="rgba(233,238,245,0.65)"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-none overflow-hidden backdrop-blur-xl md:col-span-2">
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
        <button 
          onClick={() => setViewMode('2d')} 
          className={`flex-1 py-3 text-sm font-medium transition-colors ${viewMode === '2d' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}
        >
          Schematic 2D
        </button>
        <button 
          onClick={() => setViewMode('blueprint')} 
          className={`flex-1 py-3 text-sm font-medium transition-colors border-l border-slate-200 dark:border-slate-800 ${viewMode === 'blueprint' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}
        >
          Tehnic (Cote)
        </button>
        <button 
          onClick={() => setViewMode('3d')} 
          className={`flex-1 py-3 text-sm font-medium transition-colors border-l border-slate-200 dark:border-slate-800 ${viewMode === '3d' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}
        >
          Interactiv 3D
        </button>
      </div>

      <CardContent className="p-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-b-[32px] overflow-hidden">
        
        {viewMode === 'blueprint' && (
           <BlueprintViewer 
              product={product} 
              width={actualWidth} 
              height={height} 
              color={color} 
              sashConfigs={sashConfigs} 
              individualSashWidths={useIndividualWidths ? individualSashWidths : []}
              useIndividualWidths={useIndividualWidths}
              hardware={hardware}
           />
        )}

        {viewMode === '3d' && (
           <ProductViewer3D 
              product={product} 
              width={actualWidth} 
              height={height} 
              color={color} 
              sashConfigs={sashConfigs} 
              individualSashWidths={useIndividualWidths ? individualSashWidths : []}
              useIndividualWidths={useIndividualWidths}
              hardware={hardware}
           />
        )}

        {viewMode === '2d' && (
        <div className="w-full relative p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg flex flex-col items-center justify-center relative">

          <div className="absolute left-0 top-0 bottom-0 flex items-center -translate-x-full pr-4">
            <div className="flex items-center gap-2 -rotate-90 bg-white/60 dark:bg-slate-800/60 px-3 py-1.5 rounded-full backdrop-blur-xl shadow-sm">
              <MoveVertical className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{height} mm</span>
            </div>
          </div>

          <div
            className="relative w-full max-w-md"
            style={{
              aspectRatio: aspectRatio,
              minHeight: '300px'
            }}
          >
            {updateConfig && (
              <>
                <motion.div
                  drag="x"
                  onDragStart={handleDragStart}
                  onDrag={handleDragWidth}
                  onDragEnd={handleDragEnd}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0}
                  dragMomentum={false}
                  className="absolute top-0 -right-2 bottom-0 w-4 cursor-col-resize z-50 flex items-center justify-center group/global hover:bg-blue-100/50 dark:hover:bg-blue-900/30 rounded-2xl transition-all duration-200"
                >
                  <div className="w-1 h-8 bg-blue-400 group-hover/global:bg-blue-600 rounded-full transition-colors shadow-lg"></div>
                </motion.div>

                <motion.div
                  drag="y"
                  onDragStart={handleDragStart}
                  onDrag={handleDragHeight}
                  onDragEnd={handleDragEnd}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0}
                  dragMomentum={false}
                  className="absolute left-0 -bottom-2 right-0 h-4 cursor-row-resize z-50 flex items-center justify-center group/global hover:bg-blue-100/50 dark:hover:bg-blue-900/30 rounded-2xl transition-all duration-200"
                >
                  <div className="h-1 w-8 bg-blue-400 group-hover/global:bg-blue-600 rounded-full transition-colors shadow-lg"></div>
                </motion.div>
              </>
            )}

              <div
                className="absolute inset-0 flex border-[12px] md:border-[16px] rounded-[16px] shadow-2xl overflow-hidden backdrop-blur-sm"
                style={{
                  borderColor: frameColor,
                  backgroundColor: 'transparent',
                  // Enhance the outer frame 3D bevel look
                  boxShadow: `inset 2px 2px 6px rgba(255,255,255,0.4), inset -2px -2px 6px rgba(0,0,0,0.4), 0 20px 25px -5px rgba(0,0,0,0.3)`
                }}
              >
              {sashConfigs && sashConfigs.length > 0 ? (
                sashConfigs.map((sash, index) => (
                  <SchematicSash
                    key={index}
                    sash={sash}
                    sashIndex={index}
                    sashWidth={individualSashWidths?.[index]}
                    totalWidth={actualWidth}
                    onConfigChange={(newSashData) => onSashConfigChange(index, newSashData)}
                    onSashWidthChange={handleSashWidthChange}
                    availableOpeningTypes={availableOpeningTypes}
                    isDoor={isDoor}
                    useIndividualWidths={useIndividualWidths}
                    profileColor={innerProfileColor}
                    glassColor={glassBackgroundColor}
                    hardware={hardware}
                  />
                ))
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm p-4 text-center">
                  Selectează un material pentru a vedea opțiunile de deschidere.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 px-3 py-1.5 rounded-full backdrop-blur-xl shadow-sm">
            <MoveHorizontal className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {useIndividualWidths && individualSashWidths?.length > 0
                ? `${individualSashWidths.join(' + ')} = ${actualWidth} mm`
                : `${actualWidth} mm`}
            </span>
          </div>
        </div>
        </div>
        )}
      </CardContent>
    </Card>
  );
}