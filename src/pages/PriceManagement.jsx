import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { unpackGlazingMeta } from '@/utils/glazingMeta';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Calculator, Loader2, Package, Palette, Layers, Settings2, Sparkles, RefreshCw, Receipt, ExternalLink, ChevronDown, ChevronUp, FileSpreadsheet } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ProductGraphic from '@/components/configurator/ProductGraphic';

// Funcție pentru export Excel cu imagine
const exportToExcel = async (config, priceSimulation, selectedProduct, selectedMaterial, selectedProfile, selectedColor, selectedGlazing, sashMechanisms, mechanisms) => {
  const { breakdown, subtotal, tva, total, area, outerPerimeter, sashPerimeter, totalProfilePerimeter, sashWidth, sashCount } = priceSimulation;
  
  // Generează SVG pentru imagine
  const svgElement = document.getElementById('product-preview-svg');
  let imageBase64 = '';
  if (svgElement) {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    imageBase64 = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }
  
  // Construiește datele pentru Excel (CSV format)
  let csvContent = '\uFEFF'; // BOM pentru UTF-8
  
  // Header
  csvContent += 'BON CONSUM - SIMULARE PREȚ\n';
  csvContent += `Data: ${new Date().toLocaleDateString('ro-RO')}\n\n`;
  
  // Configurație
  csvContent += 'CONFIGURAȚIE\n';
  csvContent += `Produs,${selectedProduct?.name || '-'}\n`;
  csvContent += `Dimensiuni,${config.width} x ${config.height} mm\n`;
  csvContent += `Suprafață,${area.toFixed(2)} m²\n`;
  csvContent += `Nr. Canate,${sashCount}\n`;
  csvContent += `Material,${selectedMaterial?.name || '-'}\n`;
  csvContent += `Profil,${selectedProfile?.name || '-'}\n`;
  csvContent += `Sticlă,${selectedGlazing?.name || '-'}\n`;
  csvContent += `Culoare,${selectedColor?.name || '-'}\n`;
  
  // Mecanisme per canat
  if (sashMechanisms?.length > 0) {
    const mechNames = sashMechanisms.map((mechId, idx) => {
      const mech = mechanisms.find(m => m.id === mechId);
      return mech ? `C${idx+1}: ${mech.name}` : null;
    }).filter(Boolean).join('; ');
    csvContent += `Mecanisme,${mechNames || '-'}\n`;
  }
  csvContent += '\n';
  
  // Calcule intermediare
  csvContent += 'CALCULE INTERMEDIARE\n';
  csvContent += `Perimetru ramă exterioară,${outerPerimeter?.toFixed(2) || 0} ml\n`;
  csvContent += `Lățime per canat,${Math.round(sashWidth || 0)} mm\n`;
  csvContent += `Perimetru per canat,${sashPerimeter?.toFixed(2) || 0} ml\n`;
  csvContent += `Total perimetru profil,${totalProfilePerimeter?.toFixed(2) || 0} ml\n\n`;
  
  // Detalii calcul
  csvContent += 'DETALII CALCUL PREȚ\n';
  csvContent += 'Categorie,Componentă,Calcul,Preț (€)\n';
  breakdown.forEach(item => {
    csvContent += `"${item.category}","${item.item}","${item.calc}",${item.price.toFixed(2)}\n`;
  });
  csvContent += '\n';
  
  // Totaluri
  csvContent += 'TOTALURI\n';
  csvContent += `Subtotal (fără TVA),,${subtotal.toFixed(2)} €\n`;
  csvContent += `TVA (21%),,${tva.toFixed(2)} €\n`;
  csvContent += `TOTAL,,${total.toFixed(2)} €\n`;
  
  // Descarcă fișierul
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `bon_consum_${selectedProduct?.name || 'simulare'}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function PriceManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [colors, setColors] = useState([]);
  const [glazingTypes, setGlazingTypes] = useState([]);
  const [mechanisms, setMechanisms] = useState([]);

  // Configurație pentru simulare
  const [config, setConfig] = useState({
    product_id: '',
    material_id: '',
    profile_id: '',
    color_id: '',
    glazing_id: '',
    sash_mechanisms: [], // Array cu mecanismul pentru fiecare canat
    width: 1000,
    height: 1400
  });

  // Stări pentru carduri colapsabile
  const [openCards, setOpenCards] = useState({
    profiles: false,
    glazing: false,
    mechanisms: false,
    materials: false
  });

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [prod, mat, prof, col, glaz, mech] = await Promise.all([
          base44.entities.Product.filter({ is_active: true }),
          base44.entities.Material.filter({ is_active: true }),
          base44.entities.Profile.filter({ is_active: true }),
          base44.entities.Color.filter({ is_active: true }),
          base44.entities.GlazingType.filter({ is_active: true }),
          base44.entities.MechanismType.filter({ is_active: true })
        ]);
        setProducts(prod || []);
        setMaterials(mat || []);
        setProfiles(prof || []);
        setColors(col || []);
        setGlazingTypes((glaz || []).map(unpackGlazingMeta));
        setMechanisms(mech || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const selectedProduct = useMemo(() => products.find(p => p.id === config.product_id), [products, config.product_id]);
  const selectedMaterial = useMemo(() => materials.find(m => m.id === config.material_id), [materials, config.material_id]);
  const selectedProfile = useMemo(() => profiles.find(p => p.id === config.profile_id), [profiles, config.profile_id]);
  const selectedColor = useMemo(() => colors.find(c => c.id === config.color_id), [colors, config.color_id]);
  const selectedGlazing = useMemo(() => glazingTypes.find(g => g.id === config.glazing_id), [glazingTypes, config.glazing_id]);
  
  // Numărul de canate din produs
  const sashCount = selectedProduct?.sashes || 1;
  
  // Inițializează mecanismele per canat când se schimbă produsul
  useEffect(() => {
    if (selectedProduct && sashCount > 0) {
      setConfig(prev => ({
        ...prev,
        sash_mechanisms: Array(sashCount).fill('') // Reset mecanisme pentru fiecare canat
      }));
    }
  }, [selectedProduct, sashCount]);

  // Materiale filtrate pe baza produsului selectat
  const filteredMaterials = useMemo(() => {
    if (!selectedProduct) return materials;
    return materials.filter(m => 
      !selectedProduct.compatible_materials?.length || 
      selectedProduct.compatible_materials.includes(m.id)
    );
  }, [materials, selectedProduct]);

  // Profile filtrate pe baza materialului selectat
  const filteredProfiles = useMemo(() => {
    if (!selectedMaterial) return profiles;
    return profiles.filter(p => 
      !p.compatible_materials?.length || 
      p.compatible_materials.includes(selectedMaterial.id)
    );
  }, [profiles, selectedMaterial]);

  // Sticlă filtrată pe baza profilului ales
  const filteredGlazingTypes = useMemo(() => {
    if (!selectedProfile) return glazingTypes;
    return glazingTypes.filter(g => 
      Array.isArray(g.compatible_profiles) 
        ? g.compatible_profiles.includes(selectedProfile.id)
        : g.panes_count === selectedProfile.glass_panes_count // fallback backwards compatible
    );
  }, [glazingTypes, selectedProfile]);

  // Culori filtrate pe baza materialului
  const filteredColors = useMemo(() => {
    if (!selectedMaterial) return colors;
    return colors.filter(c => 
      !c.compatible_materials?.length || 
      c.compatible_materials.includes(selectedMaterial.id) ||
      c.material_id === selectedMaterial.id
    );
  }, [colors, selectedMaterial]);

  // Reset cascadă când se schimbă selecția
  const handleConfigChange = (field, value) => {
    setConfig(prev => {
      const newConfig = { ...prev, [field]: value };

      // Reset în cascadă
      if (field === 'product_id') {
        newConfig.material_id = '';
        newConfig.profile_id = '';
        newConfig.glazing_id = '';
        newConfig.color_id = '';
        newConfig.sash_mechanisms = [];
      } else if (field === 'material_id') {
        newConfig.profile_id = '';
        newConfig.glazing_id = '';
        newConfig.color_id = '';
      } else if (field === 'profile_id') {
        // Setează automat sticla din profilul selectat
        const profile = profiles.find(p => p.id === value);
        newConfig.glazing_id = profile?.default_glazing_id || '';
      }

      return newConfig;
    });
  };

  // Funcție pentru actualizarea mecanismului unui canat
  const updateSashMechanism = (sashIndex, mechanismId) => {
    setConfig(prev => {
      const newMechanisms = [...prev.sash_mechanisms];
      newMechanisms[sashIndex] = mechanismId;
      return { ...prev, sash_mechanisms: newMechanisms };
    });
  };

  // Calcul preț simulat
  const dimensionValidation = useMemo(() => {
    const width = Number(config.width) || 0;
    const height = Number(config.height) || 0;
    const errors = [];

    if (selectedProduct) {
      if (selectedProduct.min_width && width < selectedProduct.min_width) {
        errors.push(`Lățimea minimă pentru ${selectedProduct.name} este ${selectedProduct.min_width} mm`);
      }
      if (selectedProduct.max_width && width > selectedProduct.max_width) {
        errors.push(`Lățimea maximă pentru ${selectedProduct.name} este ${selectedProduct.max_width} mm`);
      }
      if (selectedProduct.min_height && height < selectedProduct.min_height) {
        errors.push(`Înălțimea minimă pentru ${selectedProduct.name} este ${selectedProduct.min_height} mm`);
      }
      if (selectedProduct.max_height && height > selectedProduct.max_height) {
        errors.push(`Înălțimea maximă pentru ${selectedProduct.name} este ${selectedProduct.max_height} mm`);
      }
    }

    // Validare pentru fiecare mecanism selectat - lățimea per canat
    const sashWidth = width / sashCount; // Lățime per canat

    config.sash_mechanisms.forEach((mechId, idx) => {
      if (mechId) {
        const mech = mechanisms.find(m => m.id === mechId);
        if (mech) {
          const minSashWidth = mech.min_sash_width || mech.min_width || 300;
          const maxSashWidth = mech.max_sash_width || mech.max_width || 1500;

          if (sashWidth < minSashWidth) {
            errors.push(`Canat ${idx + 1}: Lățimea per canat (${Math.round(sashWidth)} mm) este sub minimul de ${minSashWidth} mm pentru ${mech.name}`);
          }
          if (sashWidth > maxSashWidth) {
            errors.push(`Canat ${idx + 1}: Lățimea per canat (${Math.round(sashWidth)} mm) depășește maximul de ${maxSashWidth} mm pentru ${mech.name}`);
          }
          if (mech.min_height && height < mech.min_height) {
            errors.push(`Canat ${idx + 1}: Înălțimea minimă pentru ${mech.name} este ${mech.min_height} mm`);
          }
          if (mech.max_height && height > mech.max_height) {
            errors.push(`Canat ${idx + 1}: Înălțimea maximă pentru ${mech.name} este ${mech.max_height} mm`);
          }
        }
      }
    });

    return errors;
  }, [config.width, config.height, config.sash_mechanisms, selectedProduct, mechanisms]);

  const priceSimulation = useMemo(() => {
    const width = Number(config.width) || 0;
    const height = Number(config.height) || 0;
    const area = (width * height) / 1000000; // m²
    
    // Perimetru ramă exterioară (tocul ferestrei)
    const outerPerimeter = 2 * (width + height) / 1000; // ml
    
    // Lățime per canat
    const sashWidth = width / sashCount;
    
    // Perimetru per canat (fiecare geam/ramă interioară)
    const sashPerimeter = 2 * (sashWidth + height) / 1000; // ml
    
    // Perimetru total profil = ramă exterioară + toate ramele interioare (canate)
    const totalProfilePerimeter = outerPerimeter + (sashPerimeter * sashCount);

    const breakdown = [];
    let total = 0;

    // Prețuri din PROFILE -> product_specific_pricing (mutat din Material)
    if (selectedProfile && selectedProduct && Array.isArray(selectedProfile.product_specific_pricing)) {
      const productPricing = selectedProfile.product_specific_pricing.find(p => p.product_id === selectedProduct.id);
      if (productPricing) {
        // Feronerie fixă
        if (productPricing.hardware_fixed_price > 0) {
          breakdown.push({
            category: 'Feronerie',
            item: 'Cost fix montaj',
            calc: 'Preț fix',
            price: productPricing.hardware_fixed_price
          });
          total += productPricing.hardware_fixed_price;
        }
      }
    }

    // Profil (per metru liniar) - calculăm corect:
    // 1x ramă exterioară (toc) + canate × perimetru canat
    if (selectedProfile && selectedProfile.price_per_linear_meter > 0) {
      const profileCost = totalProfilePerimeter * selectedProfile.price_per_linear_meter;
      breakdown.push({
        category: 'Profil',
        item: selectedProfile.name,
        calc: `Ramă ext: ${outerPerimeter.toFixed(2)} ml + ${sashCount} canate × ${sashPerimeter.toFixed(2)} ml = ${totalProfilePerimeter.toFixed(2)} ml × ${selectedProfile.price_per_linear_meter} €/ml`,
        price: profileCost
      });
      total += profileCost;
    }

    // Sticlă (per m²) - din GlazingType, cu ajustare per canat din mecanisme
    if (selectedGlazing && selectedGlazing.price_per_sqm > 0) {
      // Suprafața per canat
      const areaPerSash = (sashWidth * height) / 1000000; // m² per canat
      
      let totalAdjustedArea = 0;
      let glazingCalcDetails = [];
      
      // Calculează pentru fiecare canat separat
      for (let i = 0; i < sashCount; i++) {
        const mechId = config.sash_mechanisms[i];
        const mech = mechId ? mechanisms.find(m => m.id === mechId) : null;
        const adjustmentPercent = Number(mech?.glass_area_adjustment_percent) || 0;
        
        const adjustedSashArea = areaPerSash * (1 - adjustmentPercent / 100);
        totalAdjustedArea += adjustedSashArea;
        
        if (adjustmentPercent > 0) {
          glazingCalcDetails.push(`C${i+1}: ${areaPerSash.toFixed(2)} - ${adjustmentPercent}% = ${adjustedSashArea.toFixed(2)}`);
        } else {
          glazingCalcDetails.push(`C${i+1}: ${areaPerSash.toFixed(2)}`);
        }
      }
      
      const totalGlazingCost = totalAdjustedArea * selectedGlazing.price_per_sqm;
      
      breakdown.push({
        category: 'Tip Sticlă',
        item: selectedGlazing.name,
        calc: `(${glazingCalcDetails.join(' + ')}) = ${totalAdjustedArea.toFixed(2)} m² × ${selectedGlazing.price_per_sqm} €/m²`,
        price: totalGlazingCost
      });
      total += totalGlazingCost;
    }

    // Culoare (ajustare)
    if (selectedColor) {
      if (selectedColor.price_adjustment > 0) {
        breakdown.push({
          category: 'Culoare',
          item: selectedColor.name,
          calc: 'Ajustare fixă',
          price: selectedColor.price_adjustment
        });
        total += selectedColor.price_adjustment;
      }
      if (selectedColor.price_per_sqm > 0) {
        const colorCost = area * selectedColor.price_per_sqm;
        breakdown.push({
          category: 'Culoare',
          item: `${selectedColor.name} (per m²)`,
          calc: `${area.toFixed(2)} m² × ${selectedColor.price_per_sqm} €/m²`,
          price: colorCost
        });
        total += colorCost;
      }
    }

    // Multiplicator profil
    if (selectedProfile && selectedProfile.price_multiplier && selectedProfile.price_multiplier !== 1) {
      const adjustment = total * (selectedProfile.price_multiplier - 1);
      breakdown.push({
        category: 'Ajustare Profil',
        item: `${selectedProfile.name} (${((selectedProfile.price_multiplier - 1) * 100).toFixed(0)}%)`,
        calc: 'Multiplicator',
        price: adjustment
      });
      total += adjustment;
    }

    // Multiplicator material
    if (selectedMaterial && selectedMaterial.price_multiplier && selectedMaterial.price_multiplier !== 1) {
      const adjustment = total * (selectedMaterial.price_multiplier - 1);
      breakdown.push({
        category: 'Ajustare Material',
        item: `${selectedMaterial.name} (${((selectedMaterial.price_multiplier - 1) * 100).toFixed(0)}%)`,
        calc: 'Multiplicator',
        price: adjustment
      });
      total += adjustment;
    }

    // Mecanisme - calculează prețul pentru fiecare canat
    if (selectedProfile && selectedProduct) {
      const productPricing = selectedProfile.product_specific_pricing?.find(p => p.product_id === selectedProduct.id);
      
      config.sash_mechanisms.forEach((mechId, sashIndex) => {
        if (!mechId) return;
        
        const mech = mechanisms.find(m => m.id === mechId);
        if (!mech) return;
        
        const mechHeightPricing = productPricing?.mechanism_height_pricing?.[mech.code];
        
        if (mechHeightPricing?.length > 0) {
          // Găsește intervalul corect bazat pe înălțime
          const matchingRange = mechHeightPricing
            .sort((a, b) => a.max_height - b.max_height)
            .find(range => height >= (range.min_height || 0) && height <= range.max_height);

          if (matchingRange && matchingRange.price_per_piece > 0) {
            breakdown.push({
              category: `Mecanism Canat ${sashIndex + 1}`,
              item: `${mech.name} (${matchingRange.min_height || 0}-${matchingRange.max_height}mm)`,
              calc: `${matchingRange.price_per_piece} €/canat`,
              price: matchingRange.price_per_piece
            });
            total += matchingRange.price_per_piece;
          }
        } else if (mech.height_price_grid?.length > 0) {
          // Fallback la grila din mecanism
          const gridItem = mech.height_price_grid.find(g => height <= g.max_height);
          if (gridItem && gridItem.price > 0) {
            breakdown.push({
              category: `Mecanism Canat ${sashIndex + 1}`,
              item: `${mech.name} (grilă înălțime)`,
              calc: `Până la ${gridItem.max_height}mm`,
              price: gridItem.price
            });
            total += gridItem.price;
          }
        } else {
          // Fallback la preț per bucată / metru liniar
          if (mech.price_per_piece > 0) {
            breakdown.push({
              category: `Mecanism Canat ${sashIndex + 1}`,
              item: mech.name,
              calc: 'Preț per bucată',
              price: mech.price_per_piece
            });
            total += mech.price_per_piece;
          }
          if (mech.price_per_linear_meter > 0) {
            const mechCost = sashPerimeter * mech.price_per_linear_meter;
            breakdown.push({
              category: `Mecanism Canat ${sashIndex + 1}`,
              item: `${mech.name} (per ml)`,
              calc: `${sashPerimeter.toFixed(2)} ml × ${mech.price_per_linear_meter} €/ml`,
              price: mechCost
            });
            total += mechCost;
          }
        }
      });
    }

    const tva = total * 0.21;
    const totalWithTva = total + tva;

    return { 
      breakdown, 
      subtotal: total, 
      tva, 
      total: totalWithTva, 
      area, 
      outerPerimeter,
      sashPerimeter,
      totalProfilePerimeter,
      sashWidth,
      sashCount 
    };
  }, [config, selectedProduct, selectedMaterial, selectedProfile, selectedColor, selectedGlazing, sashCount, mechanisms]);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            Bon Consum
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Vizualizare centralizată a componentelor de preț și simulare</p>
        </div>
      </div>

      {/* Tabeluri cu toate prețurile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <Collapsible open={openCards.profiles} onOpenChange={(v) => setOpenCards(prev => ({ ...prev, profiles: v }))}>
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Link to={createPageUrl('ProfileManager')} className="group flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg hover:text-indigo-600 transition-colors cursor-pointer">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    Profile - Prețuri per Metru Liniar
                    <Badge variant="secondary" className="ml-2">{profiles.length}</Badge>
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </Link>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {openCards.profiles ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Profil</TableHead>
                      <TableHead>Preț/ml</TableHead>
                      <TableHead>Multiplicator</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map(profile => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">{profile.name}</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                            {(profile.price_per_linear_meter || 0).toFixed(2)} €/ml
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {profile.price_multiplier !== 1 && (
                            <Badge variant="secondary">
                              {profile.price_multiplier > 1 ? '+' : ''}{((profile.price_multiplier - 1) * 100).toFixed(0)}%
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Sticlă */}
        <Collapsible open={openCards.glazing} onOpenChange={(v) => setOpenCards(prev => ({ ...prev, glazing: v }))}>
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Link to={createPageUrl('GlazingManager')} className="group flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg hover:text-cyan-600 transition-colors cursor-pointer">
                    <Sparkles className="w-5 h-5 text-cyan-600" />
                    Sticlă - Prețuri per m²
                    <Badge variant="secondary" className="ml-2">{glazingTypes.length}</Badge>
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </Link>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {openCards.glazing ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tip Sticlă</TableHead>
                      <TableHead>Foi</TableHead>
                      <TableHead>Preț/m²</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {glazingTypes.map(glazing => (
                      <TableRow key={glazing.id}>
                        <TableCell className="font-medium">{glazing.name}</TableCell>
                        <TableCell>{glazing.panes_count}</TableCell>
                        <TableCell>
                          <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200">
                            {(glazing.price_per_sqm || 0).toFixed(2)} €/m²
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Mecanisme */}
        <Collapsible open={openCards.mechanisms} onOpenChange={(v) => setOpenCards(prev => ({ ...prev, mechanisms: v }))}>
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Link to={createPageUrl('MechanismManager')} className="group flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg hover:text-purple-600 transition-colors cursor-pointer">
                    <Settings2 className="w-5 h-5 text-purple-600" />
                    Mecanisme - Prețuri
                    <Badge variant="secondary" className="ml-2">{mechanisms.length}</Badge>
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </Link>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {openCards.mechanisms ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mecanism</TableHead>
                      <TableHead>Preț/buc</TableHead>
                      <TableHead>Preț/ml</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mechanisms.map(mech => (
                      <TableRow key={mech.id}>
                        <TableCell className="font-medium">{mech.name}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-50 text-green-700 border-green-200">
                            {(mech.price_per_piece || 0).toFixed(2)} €
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                            {(mech.price_per_linear_meter || 0).toFixed(2)} €/ml
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Materiale */}
        <Collapsible open={openCards.materials} onOpenChange={(v) => setOpenCards(prev => ({ ...prev, materials: v }))}>
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Link to={createPageUrl('MaterialManager')} className="group flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg hover:text-orange-600 transition-colors cursor-pointer">
                    <Package className="w-5 h-5 text-orange-600" />
                    Materiale - Multiplicatori
                    <Badge variant="secondary" className="ml-2">{materials.length}</Badge>
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </Link>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {openCards.materials ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Multiplicator</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map(material => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">{material.name}</TableCell>
                        <TableCell>
                          {material.price_multiplier !== 1 ? (
                            <Badge variant="secondary">
                              {material.price_multiplier > 1 ? '+' : ''}{((material.price_multiplier - 1) * 100).toFixed(0)}%
                            </Badge>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* Simulator de preț */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-green-600" />
            Simulator Rapid de Preț
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
            <div>
              <Label>Produs</Label>
              <Select value={config.product_id} onValueChange={(v) => handleConfigChange('product_id', v)}>
                <SelectTrigger><SelectValue placeholder="Selectează..." /></SelectTrigger>
                <SelectContent>
                  {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Material</Label>
              <Select value={config.material_id} onValueChange={(v) => handleConfigChange('material_id', v)} disabled={!config.product_id}>
                <SelectTrigger><SelectValue placeholder={config.product_id ? "Selectează..." : "Alege produs"} /></SelectTrigger>
                <SelectContent>
                  {filteredMaterials.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Profil</Label>
              <Select value={config.profile_id} onValueChange={(v) => handleConfigChange('profile_id', v)} disabled={!config.material_id}>
                <SelectTrigger><SelectValue placeholder={config.material_id ? "Selectează..." : "Alege material"} /></SelectTrigger>
                <SelectContent>
                  {filteredProfiles.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sticlă</Label>
              <Select value={config.glazing_id} onValueChange={(v) => handleConfigChange('glazing_id', v)} disabled={!config.profile_id}>
                <SelectTrigger><SelectValue placeholder={config.profile_id ? "Selectează..." : "Alege profil"} /></SelectTrigger>
                <SelectContent>
                  {filteredGlazingTypes.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Culoare</Label>
              <Select value={config.color_id} onValueChange={(v) => handleConfigChange('color_id', v)} disabled={!config.material_id}>
                <SelectTrigger><SelectValue placeholder={config.material_id ? "Selectează..." : "Alege material"} /></SelectTrigger>
                <SelectContent>
                  {filteredColors.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Lățime Fereastră (mm)</Label>
              <Input type="number" value={config.width} onChange={(e) => setConfig(prev => ({ ...prev, width: e.target.value }))} />
            </div>
            <div>
              <Label>Înălțime Fereastră (mm)</Label>
              <Input type="number" value={config.height} onChange={(e) => setConfig(prev => ({ ...prev, height: e.target.value }))} />
            </div>
          </div>

          {/* Selectoare mecanisme per canat - apare doar dacă produsul are > 1 canat */}
          {selectedProduct && sashCount > 0 && (
            <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
              <Label className="text-purple-800 dark:text-purple-300 font-semibold mb-3 block">
                Configurare Mecanisme ({sashCount} {sashCount === 1 ? 'canat' : 'canate'})
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: sashCount }).map((_, idx) => (
                  <div key={idx}>
                    <Label className="text-xs text-purple-600 dark:text-purple-400">Canat {idx + 1}</Label>
                    <Select 
                      value={config.sash_mechanisms[idx] || ''} 
                      onValueChange={(v) => updateSashMechanism(idx, v)}
                    >
                      <SelectTrigger className="bg-white dark:bg-slate-800">
                        <SelectValue placeholder="Selectează..." />
                      </SelectTrigger>
                      <SelectContent>
                        {mechanisms.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator className="my-4" />

          {/* Avertismente dimensiuni */}
          {dimensionValidation.length > 0 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg mb-4">
              <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
                <span className="text-lg">⚠️</span> Dimensiuni în afara limitelor
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {dimensionValidation.map((error, idx) => (
                  <li key={idx} className="text-sm text-red-700 dark:text-red-400">{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Detalii calcul */}
            <div>
              <h4 className="font-semibold mb-3 text-slate-800 dark:text-slate-200">Detalii Calcul</h4>
              <div className="text-sm space-y-2 mb-4 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>Suprafață fereastră:</span>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 mr-2">({config.width} × {config.height}) / 1.000.000 =</span>
                    <span className="font-medium">{priceSimulation.area.toFixed(2)} m²</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Nr. Canate:</span>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 mr-2">(din produs: {selectedProduct?.name || '-'}) =</span>
                    <span className="font-medium">{priceSimulation.sashCount}</span>
                  </div>
                </div>
                
                <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Calcul Perimetru Profil:</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-600 dark:text-indigo-400">1. Ramă exterioară (toc):</span>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 mr-2">2 × ({config.width} + {config.height}) / 1000 =</span>
                      <span className="font-medium">{priceSimulation.outerPerimeter?.toFixed(2)} ml</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-purple-600 dark:text-purple-400">2. Lățime per canat:</span>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 mr-2">{config.width} ÷ {sashCount} =</span>
                      <span className="font-medium">{Math.round(priceSimulation.sashWidth || 0)} mm</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-purple-600 dark:text-purple-400">3. Perimetru per canat:</span>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 mr-2">2 × ({Math.round(priceSimulation.sashWidth || 0)} + {config.height}) / 1000 =</span>
                      <span className="font-medium">{priceSimulation.sashPerimeter?.toFixed(2)} ml</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center bg-green-100 dark:bg-green-900/30 p-2 rounded -mx-1">
                    <span className="font-semibold text-green-700 dark:text-green-400">TOTAL Profil:</span>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 mr-2">{priceSimulation.outerPerimeter?.toFixed(2)} + ({sashCount} × {priceSimulation.sashPerimeter?.toFixed(2)}) =</span>
                      <span className="font-bold text-green-700 dark:text-green-400">{priceSimulation.totalProfilePerimeter?.toFixed(2)} ml</span>
                    </div>
                  </div>
                </div>
              </div>
              {priceSimulation.breakdown.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <Calculator className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Selectează cel puțin un profil sau o sticlă pentru a calcula prețul</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Componentă</TableHead>
                      <TableHead>Calcul</TableHead>
                      <TableHead className="text-right">Preț</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {priceSimulation.breakdown.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <div className="text-xs text-slate-500">{item.category}</div>
                          <div className="font-medium">{item.item}</div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">{item.calc}</TableCell>
                        <TableCell className="text-right font-medium">{item.price.toFixed(2)} €</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Preview + Total */}
            <div className="space-y-4">
              {/* Product Preview */}
              {selectedProduct && (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Previzualizare Produs</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToExcel(config, priceSimulation, selectedProduct, selectedMaterial, selectedProfile, selectedColor, selectedGlazing, config.sash_mechanisms, mechanisms)}
                      className="text-xs"
                      disabled={priceSimulation.breakdown.length === 0}
                    >
                      <FileSpreadsheet className="w-4 h-4 mr-1" />
                      Export Excel
                    </Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-48 h-48 flex-shrink-0" id="product-preview-container">
                          <ProductGraphic 
                            product={selectedProduct} 
                            color={selectedColor?.hex_code || '#4A4A4A'}
                            sashMechanisms={config.sash_mechanisms.map(mechId => {
                              const mech = mechanisms.find(m => m.id === mechId);
                              return mech?.code || '';
                            })}
                          />
                        </div>
                    <div className="flex-1 text-sm space-y-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedProduct.name}</p>
                      <p className="text-slate-500">{config.width} × {config.height} mm</p>
                      {selectedMaterial && <p className="text-slate-500">Material: {selectedMaterial.name}</p>}
                      {selectedProfile && <p className="text-slate-500">Profil: {selectedProfile.name}</p>}
                      {selectedColor && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Culoare:</span>
                          <div 
                            className="w-4 h-4 rounded border border-slate-300" 
                            style={{ backgroundColor: selectedColor.hex_code }}
                          />
                          <span className="text-slate-500">{selectedColor.name}</span>
                        </div>
                      )}
                      {config.sash_mechanisms.some(m => m) && (
                        <div className="text-slate-500">
                          Mecanisme: {config.sash_mechanisms.map((mechId, idx) => {
                            const mech = mechanisms.find(m => m.id === mechId);
                            return mech ? `C${idx+1}: ${mech.name}` : null;
                          }).filter(Boolean).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                <h4 className="font-semibold mb-4 text-green-800 dark:text-green-300">Rezumat Preț</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Subtotal (fără TVA)</span>
                  <span className="font-medium">{priceSimulation.subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>TVA (21%)</span>
                  <span>{priceSimulation.tva.toFixed(2)} €</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-bold text-green-700 dark:text-green-400">
                  <span>TOTAL</span>
                  <span>{priceSimulation.total.toFixed(2)} €</span>
                </div>
              </div>
            </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}