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
import { Settings, MoveHorizontal, MoveVertical, RectangleHorizontal, Check } from 'lucide-react';
import RealisticSlidingGraphic from '../admin/RealisticSlidingGraphic';
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

const SchematicSash = ({ sash, onConfigChange, availableOpeningTypes, isDoor, sashIndex, onSashWidthChange, sashWidth, useIndividualWidths, totalWidth, profileColor, glassColor }) => {
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
    if (!sash || !sash.type) return null;

    const commonProps = {
      stroke: 'rgba(51, 65, 85, 0.7)',
      strokeWidth: "1.5",
      fill: 'none',
      vectorEffect: 'non-scaling-stroke'
    };

    const paths = {
      fix: [
        "M 35 50 L 65 50",
        "M 50 35 L 50 65"
      ],
      batant: {
        stanga: "M 90 10 L 10 50 L 90 90",
        dreapta: "M 10 10 L 90 50 L 10 90"
      },
      'oscilo-batant': {
        stanga: ["M 90 10 L 10 50 L 90 90", "M 10 90 L 50 10 L 90 90"],
        dreapta: ["M 10 10 L 90 50 L 10 90", "M 10 90 L 50 10 L 90 90"]
      }
    };

    let pathsToDraw = [];
    const direction = sash.direction || 'dreapta';

    if (sash.type === 'fix') {
      pathsToDraw = paths.fix;
    } else if (sash.type === 'batant') {
      const pathData = paths.batant[direction];
      if (pathData) pathsToDraw.push(pathData);
    } else if (sash.type === 'oscilo-batant') {
      const pathData = paths['oscilo-batant'][direction];
      if (pathData) pathsToDraw = pathData;
    }

    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        {pathsToDraw.map((d, i) => <path key={i} d={d} {...commonProps} />)}
      </svg>
    );
  };

  const Handle = () => {
    if (!sash || sash.type === 'fix' || !sash.type) return null;

    return (
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-10 bg-slate-800 rounded-xl shadow-md transition-colors z-10 ${sash.direction === 'stanga' ? 'left-2' : 'right-2'}`}
        title="Mâner"
      />
    );
  };

  const sashStyle = useIndividualWidths && sashWidth && totalWidth ?
    { width: `${(sashWidth / totalWidth) * 100}%` } :
    { flex: 1 };

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

      <div
        className="absolute inset-3 rounded-xl pointer-events-none"
        style={{ backgroundColor: glassColor || 'rgba(233, 238, 245, 0.75)' }}
      ></div>

      <SvgIndicator />
      <Handle />

      <div className="absolute top-1 right-1 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 bg-white/70 hover:bg-white rounded-2xl shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-xl">
              <Settings className="w-4 h-4 text-slate-700" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <DropdownMenuLabel className="text-slate-900 dark:text-slate-100">Configurare Canat</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
            <DropdownMenuLabel className="text-xs text-slate-600 dark:text-slate-400">Tip Deschidere</DropdownMenuLabel>
            {availableOpeningTypes
              .filter(type => type !== 'deschidere' && type !== 'culisant')
              .map(type => (
                <DropdownMenuItem key={type} onSelect={() => onConfigChange({ type })} className="text-slate-700 dark:text-slate-300">
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
                <DropdownMenuItem onSelect={() => onConfigChange({ direction: 'stanga' })} className="text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-between w-full">
                    <span>Stânga</span>
                    {sash.direction === 'stanga' && <Check className="w-4 h-4 text-green-600" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onConfigChange({ direction: 'dreapta' })} className="text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-between w-full">
                    <span>Dreapta</span>
                    {sash.direction === 'dreapta' && <Check className="w-4 h-4 text-green-600" />}
                  </div>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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

export default function ProductViewer({ product, width, height, material, subMaterial, color, glazing, sashConfigs, onSashConfigChange, isDoor, updateConfig, individualSashWidths, useIndividualWidths }) {
  const [initialDragDimensions, setInitialDragDimensions] = useState(null);

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
    <Card className="shadow-xl border-none overflow-hidden backdrop-blur-xl">
      <CardContent className="p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-b-[32px]">
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
              className="absolute inset-0 flex border-[10px] rounded-[32px] shadow-2xl overflow-hidden backdrop-blur-sm"
              style={{
                borderColor: frameColor,
                backgroundColor: 'transparent',
                boxShadow: `0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04), inset 0 2px 4px 0 rgba(0,0,0,0.06)`
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
      </CardContent>
    </Card>
  );
}