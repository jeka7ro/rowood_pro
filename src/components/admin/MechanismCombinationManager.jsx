import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CheckCircle, Settings, RefreshCw } from 'lucide-react';

// Componenta pentru fiecare canat individual - identică cu cea din MechanismPresets
const SchematicSash = ({ sash, sashIndex, isDoor = false }) => {
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
            // For 'deschidere' (sliding), no specific SVG path is defined here, so it will render as an empty panel.
            // This is intentional as the outline didn't specify a visual for sliding.
        };

        let pathsToDraw = [];
        const direction = sash.direction || 'dreapta'; // Default direction if not specified
        
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
        // A handle is drawn for any non-fix sash type. This includes 'deschidere'.
        if (!sash || sash.type === 'fix' || !sash.type) return null;
        
        return (
             <div
              className={`absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-slate-800 rounded-sm shadow-md transition-colors z-10 ${sash.direction === 'stanga' ? 'left-1' : 'right-1'}`}
              title="Mâner"
            />
        );
    };

    return (
        <div className="relative border-r-2 border-slate-500 last:border-r-0 group transition-all duration-300 h-full flex-1">
            <div className="absolute inset-1 bg-blue-200/30 backdrop-blur-sm rounded-sm"></div>
            <SvgIndicator />
            <Handle />
            {isDoor && sash && sash.type !== 'fix' && (
                <div className={`absolute bottom-1 h-1 w-4 bg-slate-600 rounded-t-sm ${sash.direction === 'stanga' ? 'left-1' : 'right-1'}`}></div>
            )}
        </div>
    );
};

// Componenta care arată o fereastră completă cu mecanismele respective
// Acum acceptă sashConfigs direct, în loc de pattern, pentru a include și direcția mânerului
const WindowPreview = ({ sashConfigs, isEnabled }) => {
    return (
        <div 
            className={`relative w-full aspect-[4/3] border-4 rounded-lg shadow-xl overflow-hidden transition-all ${
                isEnabled 
                    ? 'border-green-600 shadow-green-200' 
                    : 'border-slate-400 opacity-50'
            }`}
            style={{
                backgroundColor: isEnabled ? '#dcfce7' : '#e2e8f0',
                boxShadow: isEnabled 
                    ? '0 10px 15px -3px rgba(34, 197, 94, 0.1), 0 4px 6px -2px rgba(34, 197, 94, 0.05), inset 0 2px 4px 0 rgba(0,0,0,0.1)'
                    : '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05), inset 0 2px 4px 0 rgba(0,0,0,0.1)'
            }}
        >
            <div className="absolute inset-2 flex">
                {sashConfigs.map((sash, index) => (
                    <SchematicSash
                        key={index}
                        sash={sash} // sash now includes type and direction
                        sashIndex={index}
                        isDoor={false}
                    />
                ))}
            </div>
        </div>
    );
};

const MechanismCombinationCard = ({ combination, isEnabled, onToggle }) => {
    // Pentru combinații cu poziții mâner, calculăm sashConfigs corect
    // combination.patternWithHandles va fi un array de { type: 'batant', direction: 'stanga' }
    // combination.pattern va fi un array de 'batant'
    const sashConfigsForPreview = combination.hasHandleVariants 
        ? combination.patternWithHandles 
        : combination.pattern.map((type, index) => ({
              type: type,
              // For simple view, if it's fix, direction doesn't matter for visual.
              // For other types, alternate direction to show handles on both sides,
              // even though it's not a 'specific' handle variant in this view.
              direction: type === 'fix' ? 'dreapta' : (index % 2 === 0 ? 'dreapta' : 'stanga') 
          }));

    return (
        <div className={`p-4 border-2 rounded-lg transition-all ${
            isEnabled ? 'border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800'
        }`}>
            <div className="relative">
                {isEnabled && (
                    <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-green-600" />
                )}
                
                {/* Imaginea ferestrei */}
                <div className="flex items-center justify-center min-h-[120px] mb-4">
                    <WindowPreview sashConfigs={sashConfigsForPreview} isEnabled={isEnabled} />
                </div>
                
                {/* Numele combinației */}
                <h4 className="font-semibold text-center text-slate-800 dark:text-slate-100 mb-2">{combination.name}</h4>
                
                {/* Switch pentru activare/dezactivare */}
                <div className="flex items-center justify-between">
                    <Label htmlFor={`combo-${combination.id}`} className="text-sm text-slate-600 dark:text-slate-400">
                        Activat pe site
                    </Label>
                    <Switch
                        id={`combo-${combination.id}`}
                        checked={isEnabled}
                        onCheckedChange={onToggle}
                    />
                </div>
            </div>
        </div>
    );
};

export default function MechanismCombinationManager({ product, materials, onSave, autoSave = true }) {
    const [combinations, setCombinations] = useState([]);
    const [enabledCombinations, setEnabledCombinations] = useState(new Set());
    const [showHandleVariants, setShowHandleVariants] = useState(false);
    
    // Pentru produse culisante, filtrele sunt doar fix și deschidere
    const [mechanismFilters, setMechanismFilters] = useState(
        product?.supports_sliding 
            ? { fix: true, deschidere: true }
            : { fix: true, batant: true, 'oscilo-batant': true }
    );

    useEffect(() => {
        const typeLabels = {
            'fix': 'Fix',
            'batant': 'Batant',
            'oscilo-batant': 'O-B',
            'deschidere': 'Culisant' // Added label for sliding type
        };

        const getCompatibleMaterials = () => materials.filter(m => 
            !product.compatible_materials?.length || 
            product.compatible_materials.includes(m.id)
        );

        const sashCount = product?.sashes || 1;

        // Generăm combinațiile SIMPLE - doar mecanisme, fără poziții mâner
        const generateSimpleCombinations = () => {
            if (!product || !materials.length) return [];

            const compatibleMats = getCompatibleMaterials();
            if (!compatibleMats.length) return [];

            // DIFERENȚIERE PENTRU PRODUSE CULISANTE
            let availableTypes;
            if (product.supports_sliding) {
                availableTypes = ['fix', 'deschidere']; // Doar pentru culisante
            } else {
                const materialOpeningTypes = compatibleMats[0]?.opening_types || [];
                availableTypes = [...new Set([...materialOpeningTypes, 'fix', 'batant', 'oscilo-batant'])];
            }
            
            if (sashCount === 1) {
                return availableTypes.map((type) => ({
                    name: typeLabels[type], // Use updated typeLabels
                    pattern: [type],
                    id: [type].join('-'),
                    hasHandleVariants: false
                }));
            }

            const generateCombinationsRecursive = (types, count) => {
                if (count === 1) {
                    return types.map((type) => [type]);
                }

                const combos = [];
                for (const type of types) {
                    const subCombinations = generateCombinationsRecursive(types, count - 1);
                    for (const subCombination of subCombinations) {
                        combos.push([type, ...subCombination]);
                    }
                }
                return combos;
            };

            const allCombos = generateCombinationsRecursive(availableTypes, sashCount);

            return allCombos.map((pattern) => {
                const name = pattern.map((type) => typeLabels[type]).join(' + ');
                return {
                    name,
                    pattern,
                    id: pattern.join('-'),
                    hasHandleVariants: false
                };
            });
        };

        // Generăm TOATE combinațiile incluzând poziții mâner
        const generateCombinationsWithHandles = () => {
            if (!product || !materials.length) return [];

            const compatibleMats = getCompatibleMaterials();
            if (!compatibleMats.length) return [];

            // DIFERENȚIERE PENTRU PRODUSE CULISANTE
            let availableTypes;
            if (product.supports_sliding) {
                availableTypes = ['fix', 'deschidere']; // Doar pentru culisante
            } else {
                const materialOpeningTypes = compatibleMats[0]?.opening_types || [];
                availableTypes = [...new Set([...materialOpeningTypes, 'fix', 'batant', 'oscilo-batant'])];
            }
            
            const sashCount = product.sashes || 1;

            const generateCombinationsRecursive = (currentSashIndex) => {
                if (currentSashIndex === sashCount) {
                    return [[]]; // Base case: returns an array containing an empty array
                }

                const combos = [];
                const nextCombinations = generateCombinationsRecursive(currentSashIndex + 1);

                for (const type of availableTypes) {
                    const handleOptions = (type === 'fix') 
                        ? [{ type: 'fix', direction: 'dreapta' }] // 'fix' has no actual handle, assign a default direction for structure
                        : (type === 'deschidere') // New condition for sliding mechanism
                            ? [{ type: 'deschidere', direction: 'dreapta' }] // Sliding might not have L/R handle variants in the same way, pick one.
                            : [{ type: type, direction: 'stanga' }, { type: type, direction: 'dreapta' }]; // Existing batant/oscilo-batant

                    for (const handleConfig of handleOptions) {
                        for (const subCombination of nextCombinations) {
                            combos.push([handleConfig, ...subCombination]);
                        }
                    }
                }
                return combos;
            };

            const allCombosWithHandles = generateCombinationsRecursive(0);

            return allCombosWithHandles.map((patternWithHandles) => {
                const name = patternWithHandles.map((sash) => {
                    const typeLabel = typeLabels[sash.type];
                    // Name logic updated for 'deschidere' to not show (S/D)
                    return (sash.type === 'fix' || sash.type === 'deschidere') 
                        ? typeLabel 
                        : `${typeLabel}(${sash.direction === 'stanga' ? 'S' : 'D'})`;
                }).join(' + ');

                // The ID needs to uniquely represent the handle variant combination
                const patternId = patternWithHandles.map(s => `${s.type}-${s.direction}`).join('-');

                return {
                    name,
                    pattern: patternWithHandles.map(s => s.type), // Base pattern (types only) for saving
                    patternWithHandles: patternWithHandles, // Detailed pattern (type + direction) for display
                    id: patternId,
                    hasHandleVariants: true
                };
            });
        };

        // Alegem ce combinații să generăm
        const allCombos = showHandleVariants ? generateCombinationsWithHandles() : generateSimpleCombinations();
        setCombinations(allCombos);

        // Setăm combinațiile activate pe baza produsului
        const currentEnabled = new Set();
        if (product?.allowed_mechanism_combinations?.length) {
            product.allowed_mechanism_combinations.forEach(productCombo => {
                if (productCombo.is_enabled) {
                    if (showHandleVariants) {
                        allCombos.forEach(generatedCombo => {
                            if (JSON.stringify(generatedCombo.pattern) === JSON.stringify(productCombo.pattern)) {
                                currentEnabled.add(generatedCombo.id);
                            }
                        });
                    } else {
                        currentEnabled.add(productCombo.pattern.join('-'));
                    }
                }
            });
        } else {
            // Dacă nu sunt setate, activăm toate ca default
            allCombos.forEach(combo => {
                currentEnabled.add(combo.id);
            });
        }
        setEnabledCombinations(currentEnabled);
    }, [product, materials, showHandleVariants]);

    // NOTE: Am eliminat useEffect-ul de inițializare care suprascria combinațiile salvate
    // Starea e corect inițializată în useEffect-ul de mai sus, pe baza product.allowed_mechanism_combinations

    // Filtrarea combinațiilor pe baza filtrelor selectate
    const filteredCombinations = combinations.filter(combo => {
        // Pentru combinații simple (fără poziții mâner)
        if (!combo.hasHandleVariants) {
            return combo.pattern.some(type => mechanismFilters[type]);
        } 
        // Pentru combinații cu poziții mâner
        else {
            return combo.patternWithHandles.some(sash => mechanismFilters[sash.type]);
        }
    });

    const handleFilterChange = (mechanismType) => {
        setMechanismFilters(prev => ({
            ...prev,
            [mechanismType]: !prev[mechanismType]
        }));
    };

    const resetFilters = () => {
        if (product?.supports_sliding) {
            setMechanismFilters({ fix: true, deschidere: true });
        } else {
            setMechanismFilters({ fix: true, batant: true, 'oscilo-batant': true });
        }
    };

    const selectAllFilters = () => {
        if (product?.supports_sliding) {
            setMechanismFilters({ fix: true, deschidere: true });
        } else {
            setMechanismFilters({ fix: true, batant: true, 'oscilo-batant': true });
        }
    };

    const deselectAllFilters = () => {
        if (product?.supports_sliding) {
            setMechanismFilters({ fix: false, deschidere: false });
        } else {
            setMechanismFilters({ fix: false, batant: false, 'oscilo-batant': false });
        }
    };

    const handleToggle = async (comboId, isEnabled) => {
        const newEnabled = new Set(enabledCombinations);
        if (isEnabled) {
            newEnabled.add(comboId);
        } else {
            newEnabled.delete(comboId);
        }
        setEnabledCombinations(newEnabled);

        // Auto-save logic - SALVĂM TOATE combinațiile cu starea lor de activare
        let allowedCombinationsToSave = [];

        if (showHandleVariants) {
            // Pentru variantele cu mâner, colectăm pattern-urile unice de bază
            const uniqueBasePatternsMap = new Map(); 

            combinations.forEach(combo => {
                const patternKey = JSON.stringify(combo.pattern);
                const isComboEnabled = newEnabled.has(combo.id);
                
                if (!uniqueBasePatternsMap.has(patternKey)) {
                    uniqueBasePatternsMap.set(patternKey, {
                        pattern: combo.pattern,
                        name: combo.pattern.map(type => {
                            const typeLabels = {
                                'fix': 'Fix',
                                'batant': 'Batant',
                                'oscilo-batant': 'O-B',
                                'deschidere': 'Culisant' 
                            };
                            return typeLabels[type];
                        }).join(' + '),
                        is_enabled: isComboEnabled
                    });
                } else {
                    // Dacă există deja pattern-ul, activăm dacă oricare dintre variante e activă
                    const existing = uniqueBasePatternsMap.get(patternKey);
                    if (isComboEnabled) {
                        existing.is_enabled = true;
                    }
                }
            });
            allowedCombinationsToSave = Array.from(uniqueBasePatternsMap.values());
        } else {
            // Când arătăm combinații simple, salvăm TOATE cu starea lor
            allowedCombinationsToSave = combinations.map(combo => ({
                pattern: combo.pattern,
                name: combo.name,
                is_enabled: newEnabled.has(combo.id)
            }));
        }

        // DEBUG: Verifică ce se salvează
        console.log('[MechanismCombinationManager] handleToggle - allowedCombinationsToSave:', allowedCombinationsToSave);
        console.log('[MechanismCombinationManager] handleToggle - showHandleVariants:', showHandleVariants);
        console.log('[MechanismCombinationManager] handleToggle - comboId:', comboId, 'isEnabled:', isEnabled);
        console.log('[MechanismCombinationManager] handleToggle - combinations.length:', combinations.length);
        console.log('[MechanismCombinationManager] handleToggle - newEnabled size:', newEnabled.size);

        if (typeof onSave === 'function') {
            console.log('[MechanismCombinationManager] ✅ Apelez onSave cu:', allowedCombinationsToSave.length, 'combinații');
            onSave(allowedCombinationsToSave);
        } else {
            console.error('[MechanismCombinationManager] ❌ onSave NU este funcție!');
        }

        // Salvăm în localStorage (înlocuiesc base44.entities.Product.update)
        if (product?.id) {
            try {
                localStorage.setItem(
                    `product_mechanisms_${product.id}`,
                    JSON.stringify(allowedCombinationsToSave)
                );
                console.log('[MechanismCombinationManager] ✅ Salvat în localStorage pentru produsul', product.id);
            } catch (error) {
                console.error('LocalStorage save failed:', error);
            }
        }
    };

    const enabledCount = Array.from(enabledCombinations).filter(id => 
        filteredCombinations.some(combo => combo.id === id)
    ).length;
    const totalCount = filteredCombinations.length;

    return (
        <Card className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100">
                            <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            Gestionare Mecanisme
                        </CardTitle>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Selectează care combinații să fie disponibile în configurator pentru acest produs.
                        </p>
                    </div>
                    <div className="text-right">
                        <Badge variant="outline" className="mb-2">
                            {enabledCount} din {totalCount} active
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                {/* Opțiunea pentru afișarea variantelor cu mâner */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                                <Settings className="w-4 h-4" />
                                Variante Poziții Mâner
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                {showHandleVariants ? 
                                    'Se afișează toate variantele incluzând pozițiile mânerelor (stânga/dreapta)' :
                                    'Se afișează doar tipurile de mecanisme (fără poziții mâner specifice).'}
                            </p>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showHandleVariants}
                                onChange={(e) => setShowHandleVariants(e.target.checked)}
                                className="accent-blue-600 w-4 h-4"
                            />
                            <span className="text-sm text-blue-800 dark:text-blue-300 font-medium">Toate pozițiile</span>
                        </label>
                    </div>
                </div>

                {/* Filtre pentru tipuri de mecanisme */}
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 rounded-xl border border-amber-200 dark:border-amber-700">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Filtrează după Tip Mecanism
                    </h4>
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Afișează doar tipurile relevante pentru tipul de produs */}
                        {product?.supports_sliding ? (
                            // Pentru produse culisante
                            <>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={mechanismFilters.fix}
                                        onChange={() => handleFilterChange('fix')}
                                        className="accent-amber-600 w-4 h-4"
                                    />
                                    <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Fix</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={mechanismFilters.deschidere}
                                        onChange={() => handleFilterChange('deschidere')}
                                        className="accent-amber-600 w-4 h-4"
                                    />
                                    <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Culisant</span>
                                </label>
                            </>
                        ) : (
                            // Pentru produse standard
                            <>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={mechanismFilters.fix}
                                        onChange={() => handleFilterChange('fix')}
                                        className="accent-amber-600 w-4 h-4"
                                    />
                                    <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Fix</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={mechanismFilters.batant}
                                        onChange={() => handleFilterChange('batant')}
                                        className="accent-amber-600 w-4 h-4"
                                    />
                                    <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Batant</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={mechanismFilters['oscilo-batant']}
                                        onChange={() => handleFilterChange('oscilo-batant')}
                                        className="accent-amber-600 w-4 h-4"
                                    />
                                    <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Oscilo-Batant</span>
                                </label>
                            </>
                        )}

                        <div className="ml-auto flex gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={selectAllFilters} // This now correctly handles product type
                                className="text-xs"
                            >
                                Toate
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={deselectAllFilters} // This now correctly handles product type
                                className="text-xs"
                            >
                                Niciuna
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={resetFilters} // This already handles the product type
                                className="text-xs"
                            >
                                Reset
                            </Button>
                        </div>
                    </div>

                    {totalCount < combinations.length && (
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-2">
                            Se afișează {totalCount} din {combinations.length} combinații
                        </p>
                    )}
                </div>

                {/* Grid cu combinațiile - optimizat pentru spațiu */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {filteredCombinations.map((combination) => {
                        const isEnabled = enabledCombinations.has(combination.id);
                        return (
                            <MechanismCombinationCard
                                key={combination.id}
                                combination={combination}
                                isEnabled={isEnabled}
                                onToggle={(checked) => handleToggle(combination.id, checked)}
                            />
                        );
                    })}
                </div>

                {filteredCombinations.length === 0 && (
                    <div className="text-center py-8">
                        <div className="text-slate-400 dark:text-slate-500 text-lg mb-2">📭</div>
                        <p className="text-slate-600 dark:text-slate-400">Nu există combinații care să corespundă filtrelor selectate.</p>
                        <Button onClick={resetFilters} className="mt-4" variant="outline">
                            Resetează filtrele
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}