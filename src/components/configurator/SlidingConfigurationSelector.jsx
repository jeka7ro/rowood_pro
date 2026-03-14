
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Plus } from 'lucide-react';
import RealisticSlidingGraphic from '../admin/RealisticSlidingGraphic';

const SlidingSchemeCard = ({ config, isSelected, onSelect, index }) => {
    // Mapare scheme la litere pentru afișare
    const schemaLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    const schemaName = `Schema ${schemaLetters[index] || index + 1}`;
    
    return (
        <div
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl rounded-2xl border-3 p-6 relative ${
                isSelected 
                    ? 'border-blue-600 bg-blue-50 shadow-lg scale-105' 
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
            }`}
            onClick={onSelect}
        >
            {isSelected && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center z-10 shadow-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                </div>
            )}
            
            {/* Preview-ul schemei */}
            <div className="mb-4">
                <RealisticSlidingGraphic 
                    pattern={config.pattern} 
                    schemaName={schemaName}
                    showDimensions={false}
                />
            </div>
            
            {/* Informații schemă */}
            <div className="text-center space-y-2">
                <h4 className="font-bold text-slate-800 text-lg">{config.name}</h4>
                <div className="flex justify-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                        {config.sash_count} canaturi
                    </Badge>
                    <Badge 
                        className={`text-xs ${isSelected ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-700'}`}
                    >
                        {config.pattern.filter(p => p === 'deschidere').length} mobile
                    </Badge>
                </div>
                
                {/* Limitări dimensiuni */}
                {(config.min_width || config.max_width || config.min_height || config.max_height) && (
                    <div className="text-xs text-slate-500 space-y-1">
                        {(config.min_width || config.max_width) && (
                            <div>
                                Lățime: {config.min_width || 0} - {config.max_width || '∞'} mm
                            </div>
                        )}
                        {(config.min_height || config.max_height) && (
                            <div>
                                Înălțime: {config.min_height || 0} - {config.max_height || '∞'} mm
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default function SlidingConfigurationSelector({ configurations, currentPattern, onSelect }) {
    if (!configurations || configurations.length === 0) return null;
    
    // Găsesc configurația selectată curent
    const getCurrentConfigIndex = () => {
        if (!currentPattern || currentPattern.length === 0) return -1;
        return configurations.findIndex(config => 
            JSON.stringify(config.pattern) === JSON.stringify(currentPattern)
        );
    };
    
    const selectedIndex = getCurrentConfigIndex();
    
    return (
        <div className="space-y-6">
            {/* Titlu principal inspirat din poză */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Scheme de deschidere realizabile</h2>
                <p className="text-slate-600">Selectează configurația dorită pentru ușa culisantă</p>
            </div>
            
            {/* Grid cu scheme */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {configurations.map((config, index) => (
                    <SlidingSchemeCard
                        key={index}
                        config={config}
                        isSelected={selectedIndex === index}
                        onSelect={() => onSelect(config)}
                        index={index}
                    />
                ))}
            </div>
            
            {/* Informații suplimentare */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-blue-800 mb-2">Simboluri folosite:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-100 border border-slate-400 rounded flex items-center justify-center">
                            <Plus className="w-4 h-4 text-slate-600" />
                        </div>
                        <span className="text-blue-700">Canat fix (nu se deschide)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 border-2 border-green-600 rounded flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 16 16" className="text-green-600">
                                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" fill="none"/>
                            </svg>
                        </div>
                        <span className="text-blue-700">Canat mobil (se poate deschide)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
