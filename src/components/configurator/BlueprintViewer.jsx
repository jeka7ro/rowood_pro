import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Info, X, Maximize2, Minimize2, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

function shadeHexColor(hex, percent) {
  if (!hex) return '#94a3b8';
  let H = hex.replace('#', '');
  if (H.length === 3) H = H.split('').map(c => c + c).join('');
  const num = parseInt(H, 16);
  let r = (num >> 16) + Math.round(2.55 * percent);
  let g = ((num >> 8) & 0x00FF) + Math.round(2.55 * percent);
  let b = (num & 0x0000FF) + Math.round(2.55 * percent);
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1).padStart(6, '0');
}

// Helper for Dimension Lines
const DimensionLine = ({ start, end, label, offset, direction = 'horizontal' }) => {
    const isHorz = direction === 'horizontal';
    
    // Calculate coordinates based on offset
    const x1 = isHorz ? start : offset;
    const y1 = isHorz ? offset : start;
    const x2 = isHorz ? end : offset;
    const y2 = isHorz ? offset : end;
    
    // Tick marks
    const tickPath = isHorz 
        ? `M ${x1} ${y1-5} L ${x1} ${y1+5} M ${x2} ${y2-5} L ${x2} ${y2+5}`
        : `M ${x1-5} ${y1} L ${x1+5} ${y1} M ${x2-5} ${y2} L ${x2+5} ${y2}`;
        
    // Text position
    const textX = isHorz ? (x1 + x2) / 2 : offset - 10;
    const textY = isHorz ? offset - 8 : (y1 + y2) / 2;

    return (
        <g className="dimension-line" stroke="#64748B" strokeWidth="1" fill="none">
            {/* Main Line */}
            <line x1={x1} y1={y1} x2={x2} y2={y2} />
            {/* Ticks */}
            <path d={tickPath} strokeWidth="1.5" />
            {/* Label */}
            <text 
                x={textX} 
                y={textY} 
                textAnchor="middle" 
                alignmentBaseline="middle"
                transform={!isHorz ? `rotate(-90 ${textX} ${textY})` : ''}
                fill="#334155"
                stroke="none"
                fontSize="12"
                fontWeight="500"
                fontFamily="system-ui, sans-serif"
            >
                {label}
            </text>
        </g>
    );
};

export default function BlueprintViewer({ 
    product, 
    width = 1000, 
    height = 1000, 
    color, 
    sashConfigs = [],
    individualSashWidths = [],
    useIndividualWidths = false,
    hardware = {}
}) {
    const [showSpecs, setShowSpecs] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    if (!product) return null;

    // Viewbox setup to provide padding for dimension lines
    // Adjusted padding for optimal fit
    const padding = 100;
    const vbWidth = width + padding * 2;
    const vbHeight = height + padding * 2;

    // Actual frame dimensions
    const frameT = 60; // 60mm outer frame
    const mullionW = 80; // 80mm mullion

    // Colors
    const baseColor = color?.hex_code || '#F8FAFC';
    const darkStroke = shadeHexColor(baseColor, -20);
    const lightFill = shadeHexColor(baseColor, 10);

    const numSashes = sashConfigs.length || 1;
    let sashesData = [];
    
    let currentSectionX = padding;
    
    if (useIndividualWidths && individualSashWidths.length === numSashes) {
        for (let i = 0; i < numSashes; i++) {
            const sectionW = individualSashWidths[i];
            const leftSub = i === 0 ? frameT : mullionW / 2;
            const rightSub = i === (numSashes - 1) ? frameT : mullionW / 2;
            const glassW = sectionW - leftSub - rightSub;
            
            sashesData.push({
                x: currentSectionX + leftSub,
                w: glassW,
                sectionX: currentSectionX,
                sectionW: sectionW,
                label: String.fromCharCode(65 + i) // A, B, C...
            });
            currentSectionX += sectionW;
        }
    } else {
        const totalInnerW = width - (frameT * 2) - (mullionW * (numSashes - 1));
        const glassW = totalInnerW / numSashes;
        
        for (let i = 0; i < numSashes; i++) {
            const leftSub = i === 0 ? frameT : mullionW / 2;
            const rightSub = i === (numSashes - 1) ? frameT : mullionW / 2;
            const sectionW = glassW + leftSub + rightSub;

             sashesData.push({
                x: currentSectionX + leftSub,
                w: glassW,
                sectionX: currentSectionX,
                sectionW: sectionW,
                label: String.fromCharCode(65 + i)
            });
            currentSectionX += sectionW;
        }
    }

    const OpeningIndicators = ({ sash, x, w, y, h }) => {
        if (!sash || !sash.type || sash.type === 'fix') return null;

        const cx = x + w/2;
        const cy = y + h/2;

        if (sash.type === 'batant') {
            const hx = sash.direction === 'stanga' ? x + w : x;
            return (
                <path 
                    d={`M ${x} ${y} L ${hx} ${y+h/2} L ${x+w} ${y} M ${x} ${y+h} L ${hx} ${y+h/2} L ${x+w} ${y+h}`} 
                    stroke="#94A3B8" strokeWidth="2" strokeDasharray="5,5" fill="none" 
                />
            );
        }

        if (sash.type === 'oscilo-batant') {
            const hx = sash.direction === 'stanga' ? x + w : x;
            return (
                <g stroke="#94A3B8" strokeWidth="2" strokeDasharray="5,5" fill="none">
                    {/* Batant */}
                    <path d={`M ${x} ${y} L ${hx} ${y+h/2} L ${x} ${y+h}`} />
                    <path d={`M ${x+w} ${y} L ${hx} ${y+h/2} L ${x+w} ${y+h}`} />
                    {/* Oscilo */}
                    <path d={`M ${x} ${y+h} L ${x+w/2} ${y} L ${x+w} ${y+h}`} />
                </g>
            );
        }
        return null;
    };

    const SvgContent = ({ inPortal = false }) => (
        <svg 
            className={`drop-shadow-sm transition-all duration-300 ${inPortal ? 'w-[90vw] h-[90vh] md:w-[85vw] md:h-[85vh] cursor-grab active:cursor-grabbing' : 'w-full h-full max-h-[600px] cursor-zoom-in hover:scale-[1.02]'}`} 
            viewBox={`0 0 ${vbWidth} ${vbHeight}`} 
            preserveAspectRatio="xMidYMid meet"
            style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E2E8F0' }}
            onClick={() => !inPortal && setIsFullscreen(true)}
        >
        {/* --- Grid Background --- */}
        <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#F1F5F9" strokeWidth="1"/>
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* --- Dimensions --- */}
        {/* Overall Width (Top) */}
        <DimensionLine 
            start={padding} 
            end={padding + width} 
            offset={padding - 30} 
            label={`W = ${width.toFixed(1)}`} 
        />
        
        {/* Overall Height (Left) */}
        <DimensionLine 
            start={padding} 
            end={padding + height} 
            offset={padding - 30} 
            direction="vertical"
            label={`H = ${height.toFixed(1)}`} 
        />

        {/* Individual Sash Widths (Bottom) */}
        {numSashes > 1 && sashesData.map((s, i) => (
            <DimensionLine 
                key={`dw-${i}`}
                start={s.sectionX} 
                end={s.sectionX + s.sectionW} 
                offset={padding + height + 30} 
                label={s.sectionW.toFixed(1)} 
            />
        ))}

        {/* --- Frame Drawing --- */}
        <g transform={`translate(${padding}, ${padding})`}>
            {/* Outer Frame Background */}
            <rect x="0" y="0" width={width} height={height} fill={baseColor} stroke={darkStroke} strokeWidth="2" />
            
            {/* Inner Glass Area Background */}
            <rect x={frameT} y={frameT} width={width - frameT*2} height={height - frameT*2} fill={lightFill} stroke={darkStroke} />

            {/* Mullions and Sashes */}
            {sashesData.map((s, i) => {
                 // Draw Mullion to the right if not the last
                 const isLast = i === sashesData.length - 1;
                 
                 return (
                     <g key={`sash-group-${i}`}>
                         {/* Sash Glass Area */}
                         <rect 
                            x={s.x - padding} 
                            y={frameT} 
                            width={s.w} 
                            height={height - frameT*2} 
                            fill="#E0F2FE" // Light blue glass tint
                            stroke="#38BDF8" 
                            strokeOpacity="0.5"
                         />
                         
                         {/* Opening Indicators */}
                         <OpeningIndicators 
                            sash={sashConfigs[i]} 
                            x={s.x - padding} 
                            y={frameT} 
                            w={s.w} 
                            h={height - frameT*2} 
                         />

                         {/* Sash Label (A, B, C) */}
                         <circle cx={s.x - padding + s.w/2} cy={height/2 - 20} r="15" fill="#FFFFFF" stroke="#CBD5E1" />
                         <text 
                             x={s.x - padding + s.w/2} 
                             y={height/2 - 20} 
                             textAnchor="middle" 
                             alignmentBaseline="middle"
                             fontSize="16"
                             fontWeight="bold"
                             fill="#1E293B"
                         >{s.label}</text>

                         {/* Mullion Body */}
                         {!isLast && (
                             <rect 
                                 x={s.x - padding + s.w} 
                                 y={frameT} 
                                 width={mullionW} 
                                 height={height - frameT*2} 
                                 fill={baseColor} 
                                 stroke={darkStroke} 
                             />
                         )}
                     </g>
                 );
            })}
        </g>

        {/* Title overlay */}
        <g transform={`translate(20, ${vbHeight - 20})`}>
            <rect x="0" y="-25" width="200" height="30" fill="#1E293B" rx="4" />
            <text x="100" y="-10" textAnchor="middle" alignmentBaseline="middle" fill="white" fontSize="14" fontWeight="bold">
                Vedere din interior
            </text>
        </g>
    </svg>
    );

    return (
        <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-[#F8FAFC] rounded-b-[32px] overflow-hidden p-4 relative group">
            <div className="w-full h-full flex items-center justify-center relative">
                <SvgContent />
                
                {/* Expand Button Overlay */}
                {!isFullscreen && (
                    <button 
                        onClick={() => setIsFullscreen(true)}
                        className="absolute bottom-4 right-4 p-2 bg-white/80 backdrop-blur shadow-md rounded-lg text-slate-600 hover:text-slate-900 border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Mărește imaginea"
                    >
                        <Maximize2 size={20} />
                    </button>
                )}
            </div>

            {/* Fullscreen Overlay strictly bound to document body using Portal */}
            {isFullscreen && typeof window !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[99999] bg-slate-900/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in zoom-in-95 duration-200 isolation-auto">
                    <button 
                        onClick={() => setIsFullscreen(false)}
                        className="absolute top-4 right-4 md:top-6 md:right-6 p-3 bg-slate-800/80 hover:bg-slate-700/80 text-white rounded-full backdrop-blur-md transition-colors z-[100000] shadow-lg border border-slate-700"
                        title="Închide vizualizarea"
                    >
                        <X size={28} />
                    </button>
                    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
                        <TransformWrapper
                            initialScale={1}
                            minScale={0.5}
                            maxScale={5}
                            centerOnInit={true}
                            wheel={{ step: 0.1 }}
                        >
                            {({ zoomIn, zoomOut, resetTransform }) => (
                                <>
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-800/80 backdrop-blur-md p-2 rounded-2xl border border-slate-700/50 shadow-2xl z-[100000]">
                                        <button onClick={() => zoomOut()} className="p-3 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors" title="Micșorează">
                                            <ZoomOut size={24} />
                                        </button>
                                        <button onClick={() => resetTransform()} className="p-3 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors" title="Resetează">
                                            <Move size={24} />
                                        </button>
                                        <button onClick={() => zoomIn()} className="p-3 text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors" title="Mărește">
                                            <ZoomIn size={24} />
                                        </button>
                                    </div>
                                    <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                                        <SvgContent inPortal={true} />
                                    </TransformComponent>
                                </>
                            )}
                        </TransformWrapper>
                    </div>
                </div>,
                document.body
            )}

            {/* Info Button */}
            <button 
                onClick={() => setShowSpecs(!showSpecs)}
                className="absolute top-6 right-6 p-2 bg-white dark:bg-slate-800 shadow-md rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-50 hover:text-emerald-600 transition-colors z-10"
                title="Specificații Tehnice"
            >
                <Info size={24} />
            </button>

            {/* Technical Specifications Overlay */}
            {showSpecs && (
                <div className="absolute top-16 right-6 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-4 z-20 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-2 mb-3">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Specificații Tehnice</h4>
                        <button onClick={() => setShowSpecs(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Lățime Totală:</span>
                            <span className="text-slate-700 dark:text-slate-200 font-medium">{width} mm</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Înălțime Totală:</span>
                            <span className="text-slate-700 dark:text-slate-200 font-medium">{height} mm</span>
                        </div>
                        {color && (
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 dark:text-slate-400">Culoare:</span>
                                <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full border border-slate-300 shadow-inner" style={{ backgroundColor: color.hex_code }}></span>
                                    <span className="text-slate-700 dark:text-slate-200 font-medium">{color.name || 'Standard'}</span>
                                </div>
                            </div>
                        )}
                        <div className="border-t border-slate-100 dark:border-slate-700 my-2 pt-3">
                            <span className="text-slate-500 dark:text-slate-400 font-bold block mb-2 uppercase text-xs tracking-wider">Feronerie</span>
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-500 dark:text-slate-400">Culoare Mâner:</span>
                                <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full border border-slate-300 shadow-inner" style={{ backgroundColor: hardware.handleColor || '#ffffff' }}></span>
                                </div>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-500 dark:text-slate-400">Design Mâner:</span>
                                <span className="text-slate-700 dark:text-slate-200 font-medium capitalize">{hardware.handleType || 'standard'}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-500 dark:text-slate-400">Balamale:</span>
                                <span className="text-slate-700 dark:text-slate-200 font-medium capitalize">{hardware.hingeType || 'vizibile'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Securitate:</span>
                                <span className="text-slate-700 dark:text-slate-200 font-medium capitalize">{hardware.lockType || 'standard'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

