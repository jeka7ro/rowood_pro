import React from 'react';
import { Plus } from 'lucide-react';

const Arrow = ({ direction }) => {
    if (!direction) return null;
    
    // Săgeată simplă, fără fundal
    return (
        <div className="w-6 h-6 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" className="text-slate-700">
                {direction === 'left' && (
                    <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                )}
                {direction === 'right' && (
                    <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                )}
            </svg>
        </div>
    );
};

export default function SlidingConfigurationGraphic({ pattern }) {
    if (!pattern || pattern.length === 0) return null;

    // Logic pentru direcții exact ca în Schema C
    const getDirections = (p) => {
        const directions = [];
        if (p.length === 2) {
            if (p[0] === 'fix' && p[1] === 'deschidere') directions.push(null, 'left');
            else if (p[0] === 'deschidere' && p[1] === 'fix') directions.push('right', null);
            else if (p[0] === 'deschidere' && p[1] === 'deschidere') directions.push('right', 'left');
        } else if (p.length === 3 && p[0] === 'fix' && p[1] === 'deschidere' && p[2] === 'deschidere') {
            directions.push(null, 'right', 'left');
        } else if (p.length === 4 && p[0] === 'fix' && p[1] === 'deschidere' && p[2] === 'deschidere' && p[3] === 'fix') {
            directions.push(null, 'left', 'right', null);
        } else if (p.length === 6) {
            // Fix + Deschidere + Deschidere + Deschidere + Deschidere + Fix  
            directions.push(null, 'left', 'left', 'right', 'right', null);
        } else {
            // Default
            p.forEach((type, index) => {
                if (type === 'deschidere') {
                    directions.push(index < p.length / 2 ? 'left' : 'right');
                } else {
                    directions.push(null);
                }
            });
        }
        return directions;
    };
    
    const directions = getDirections(pattern);

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Container exterior gri închis ca în Schema C */}
            <div className="bg-slate-400 border-4 border-slate-500 rounded-lg p-2 shadow-lg relative">
                {/* Compartimentele interioare */}
                <div className="flex gap-1 h-16">
                    {pattern.map((type, index) => (
                        <div 
                            key={index}
                            className={`relative flex-1 rounded-sm flex items-center justify-center ${
                                type === 'fix' 
                                    ? 'bg-slate-300 border-2 border-slate-400' 
                                    : 'bg-green-400 border-4 border-green-700'
                            }`}
                        >
                            {type === 'fix' ? (
                                <Plus className="w-5 h-5 text-slate-600" strokeWidth={3} />
                            ) : (
                                <Arrow direction={directions[index]} />
                            )}
                        </div>
                    ))}
                </div>
                
                {/* Dimensiune verticală dreapta */}
                <div className="absolute -right-8 top-0 bottom-0 flex items-center">
                    <div className="transform rotate-90 text-xs text-slate-600 whitespace-nowrap font-medium">
                        max 2.3 m
                    </div>
                </div>
            </div>
            
            {/* Dimensiune orizontală jos */}
            <div className="flex justify-center mt-2">
                <div className="text-xs text-slate-600 font-medium">
                    max 6.5 m
                </div>
            </div>
        </div>
    );
}