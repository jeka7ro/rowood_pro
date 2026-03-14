import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import ConfiguratorImageGenerator from '@/components/configurator/ConfiguratorImageGenerator';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Calculator,
  Package,
  Ruler,
  Palette,
  Layers,
  Settings,
  ArrowRight,
  ArrowLeft,
  Info,
  AlertCircle,
  RefreshCw,
  Loader2,
  Truck
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createPageUrl } from '@/utils';

import ProductSelector from '../components/configurator/ProductSelector';
import ProductViewer from '../components/configurator/ProductViewer';
import DimensionControls from '../components/configurator/DimensionControls';
import MaterialSelector from '../components/configurator/MaterialSelector';
import ProfileSelector from '../components/configurator/ProfileSelector';
import AccessorySelector from '../components/configurator/AccessorySelector';
import PriceCalculator from '../components/configurator/PriceCalculator';
import ConfigurationSummary from '../components/configurator/ConfigurationSummary';
import TransportInstallationSelector from '../components/configurator/TransportInstallationSelector';
import MechanismPresets from '../components/configurator/MechanismPresets';
import ColorStep from "../components/configurator/ColorStep";
import ErrorBoundary from "../components/common/ErrorBoundary";

// Lazy load hexFromRal to avoid import-time errors
let hexFromRalFunc = null;
const getHexFromRal = async () => {
  if (!hexFromRalFunc) {
    try {
      const module = await import('@/components/utils/ral');
      hexFromRalFunc = module.hexFromRal;
    } catch (e) {
      console.warn('Could not load hexFromRal:', e);
      hexFromRalFunc = () => null;
    }
  }
  return hexFromRalFunc;
};

const getDefaultSashConfigs = (product, material) => {
  if (!product || !product.sashes) return [];

  if (product.supports_sliding) {
    if (product.sashes > 0) {
      return new Array(product.sashes).fill({ type: 'fix', direction: 'dreapta' });
    }
    return [{ type: 'deschidere', direction: 'dreapta' }];
  }

  const sashCount = product.sashes;
  const availableOpeningTypes = material?.opening_types || ['fix'];
  const primaryOpeningType = availableOpeningTypes.includes('oscilo-batant') ? 'oscilo-batant' : availableOpeningTypes[0] || 'fix';

  const configs = [];
  for (let i = 0; i < sashCount; i++) {
    if (sashCount === 1) {
      configs.push({ type: primaryOpeningType, direction: 'dreapta' });
    } else if (sashCount === 2) {
      configs.push({ type: i === 0 ? 'oscilo-batant' : primaryOpeningType, direction: i === 0 ? 'stanga' : 'dreapta' });
    } else if (sashCount === 3) {
      configs.push({ type: i === 1 ? primaryOpeningType : 'fix', direction: 'dreapta' });
    } else {
      configs.push({ type: 'fix', direction: 'dreapta' });
    }
  }
  return configs;
};

async function staggeredFetch(fetchers) {
  const results = [];
  for (const fetcher of fetchers) {
    try {
      results.push(await fetcher());
    } catch (error) {
      console.warn("A fetch operation failed:", error);
      results.push([]);
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return results;
}

export default function ConfiguratorPage() {
  // STATE - always called unconditionally
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState('');
  const [loadingError, setLoadingError] = useState(null);
  const [activeTab, setActiveTab] = useState('product');
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showIncompleteAlert, setShowIncompleteAlert] = useState(false);
  const [showAddedToCartModal, setShowAddedToCartModal] = useState(false);
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '' });


  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [subMaterials, setSubMaterials] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [colors, setColors] = useState([]);
  const [accessories, setAccessories] = useState([]);

  const [config, setConfig] = useState({
    product_id: null,
    width: 1000,
    height: 1400,
    material_id: null,
    sub_material_id: null,
    profile_id: null,
    color_id: null,
    custom_ral_code: '',
    custom_hex_code: '',
    sash_configs: [],
    individual_sash_widths: [],
    use_individual_widths: false,
    quantity: 1,
    accessories: [],
    special_requirements: '',
    include_transport: false,
    include_installation: false,
    delivery_country: 'RO'
  });

  const [currentStep, setCurrentStep] = useState(0);

  const showAlert = (title, message) => {
    setAlertDialog({ isOpen: true, title, message });
  };

  // MEMOS - always called unconditionally
  const configSteps = useMemo(() => [
    { id: 'product', name: 'Produs', icon: Package, required: true },
    { id: 'material', name: 'Material', icon: Palette, required: true },
    { id: 'profile', name: 'Profil', icon: Layers, required: true },
    { id: 'color', name: 'Culoare', icon: Palette, required: true },
    { id: 'mechanism', name: 'Mecanisme', icon: Settings, required: true },
    { id: 'dimensions', name: 'Dimensiuni', icon: Ruler, required: true },
    { id: 'accessories', name: 'Accesorii', icon: Settings, required: false },
    { id: 'services', name: 'Transport & Montaj', icon: Truck, required: false },
    { id: 'summary', name: 'Sumar', icon: Calculator, required: false }
  ], []);

  const selectedProduct = useMemo(() => products.find((p) => p.id === config.product_id) || null, [products, config.product_id]);
  const selectedMaterial = useMemo(() => materials.find((m) => m.id === config.material_id) || null, [materials, config.material_id]);
  const selectedSubMaterial = useMemo(() => subMaterials.find((sm) => sm.id === config.sub_material_id) || null, [subMaterials, config.sub_material_id]);
  const selectedProfile = useMemo(() => profiles.find((p) => p.id === config.profile_id) || null, [profiles, config.profile_id]);
  const selectedColor = useMemo(() => colors.find((c) => c.id === config.color_id) || null, [colors, config.color_id]);

  const ralDbHex = useMemo(() => {
    if (!config.custom_ral_code) return null;
    const cleanInputRal = String(config.custom_ral_code).replace(/[^0-9]/g, '');
    const match = colors.find(c => (c.ral_code || '').replace(/[^0-9]/g, '') === cleanInputRal);
    return match?.hex_code || null;
  }, [config.custom_ral_code, colors]);

  const colorForViewer = useMemo(() => {
    if (config.custom_hex_code) {
      return { name: `HEX ${config.custom_hex_code}`, hex_code: config.custom_hex_code };
    }
    if (config.custom_ral_code) {
      const hex = ralDbHex || '#cccccc';
      return { name: `RAL ${config.custom_ral_code}`, hex_code: hex };
    }
    return selectedColor || {};
  }, [config.custom_hex_code, config.custom_ral_code, selectedColor, ralDbHex]);

  const compatibleColors = useMemo(() => {
    if (!selectedMaterial || !selectedMaterial.allows_color_selection) {
      console.log('[Configurator] Material does not allow color selection');
      return [];
    }
    if (!config.material_id || colors.length === 0) {
      console.log('[Configurator] No material_id or no colors in DB');
      return [];
    }

    console.log('[Configurator] Finding compatible colors for:', {
      material_id: config.material_id,
      sub_material_id: config.sub_material_id,
      total_colors: colors.length
    });

    // Funcție helper pentru a verifica dacă un string este gol sau null
    const isEmpty = (value) => !value || value === '' || value === null || value === undefined;

    let compatible = [];

    // Dacă avem sub-material selectat
    if (config.sub_material_id && !isEmpty(config.sub_material_id)) {
      // Caută culori specifice pentru acest sub-material
      compatible = colors.filter((c) => {
        if (c.special_type) return false; // Exclude custom HEX/RAL rules
        
        // Check if color has sub_material_id that matches
        if (c.sub_material_id === config.sub_material_id) return true;
        
        // Check if color is in compatible_materials array
        if (Array.isArray(c.compatible_materials) && c.compatible_materials.includes(config.material_id)) {
          return true;
        }
        
        return false;
      });
      
      console.log('[Configurator] Sub-material colors found:', compatible.length);
    } else {
      // Nu avem sub-material, căutăm culori pentru materialul principal
      compatible = colors.filter((c) => {
        if (c.special_type) return false; // Exclude custom HEX/RAL rules
        
        // Check if color has material_id that matches AND no sub_material_id
        if (c.material_id === config.material_id && isEmpty(c.sub_material_id)) {
          return true;
        }
        
        // Check if color is in compatible_materials array
        if (Array.isArray(c.compatible_materials) && c.compatible_materials.includes(config.material_id)) {
          return true;
        }
        
        return false;
      });
      
      console.log('[Configurator] Material colors found:', compatible.length);
    }

    console.log('[Configurator] Compatible colors:', compatible.map(c => c.name));
    return compatible;
  }, [colors, config.material_id, config.sub_material_id, selectedMaterial]);

  const compatibleSubMaterials = useMemo(() => {
    if (!config.material_id || subMaterials.length === 0) return [];
    return subMaterials.filter((sm) => sm.parent_material_id === config.material_id);
  }, [subMaterials, config.material_id]);

  // Fetch glazing types for price calculation
  const [glazingTypes, setGlazingTypes] = useState([]);
  
  // Add glazing fetch to the initial data load effect
  useEffect(() => {
    const fetchGlazing = async () => {
      try {
        const glazing = await base44.entities.GlazingType.filter({ is_active: true });
        setGlazingTypes(glazing || []);
      } catch (e) {
        console.warn('Could not load glazing types:', e);
      }
    };
    fetchGlazing();
  }, []);

  // Get selected glazing based on profile's default
  const selectedGlazing = useMemo(() => {
    if (!selectedProfile?.default_glazing_id) return null;
    return glazingTypes.find(g => g.id === selectedProfile.default_glazing_id) || null;
  }, [selectedProfile, glazingTypes]);

  const priceDetails = useMemo(() => {
    const product = selectedProduct;
    const material = selectedMaterial;
    const subMaterial = selectedSubMaterial;
    const profile = selectedProfile;
    const color = selectedColor;
    const glazing = selectedGlazing;
    const selectedAccessoriesList = accessories.filter((acc) => (config.accessories || []).includes(acc.id));

    if (!product || !material) return { total: 0, totalWithoutTva: 0, tva: 0, breakdown: [], area: 0 };

    let totalWithoutTva = 0;
    const breakdown = [];

    const widthNum = Number(config.width) || 0;
    const heightNum = Number(config.height) || 0;
    const totalArea = widthNum * heightNum / 1000000;
    const sashCount = product.sashes || 1;
    const sashWidth = widthNum / sashCount;

    // Perimetru ramă exterioară
    const outerPerimeter = 2 * (widthNum + heightNum) / 1000; // ml
    // Perimetru per canat
    const sashPerimeter = 2 * (sashWidth + heightNum) / 1000; // ml
    // Total perimetru profil
    const totalProfilePerimeter = outerPerimeter + (sashPerimeter * sashCount);

    let hardwareFixedPrice = 0;
    let mechanismHeightPricing = {};

    // Prețurile vin din PROFILE -> product_specific_pricing
    if (profile && Array.isArray(profile.product_specific_pricing) && product) {
      const productSpecificPrice = profile.product_specific_pricing.find((p) => p.product_id === product.id);
      if (productSpecificPrice) {
        hardwareFixedPrice = Number(productSpecificPrice.hardware_fixed_price) || 0;
        mechanismHeightPricing = productSpecificPrice.mechanism_height_pricing || {};
      }
    }

    // 1. FERONERIE FIXĂ (primul, ca în simulator)
    if (hardwareFixedPrice > 0) {
      breakdown.push({
        label: 'Feronerie/Montaj',
        value: hardwareFixedPrice,
        description: 'Cost fix per produs'
      });
      totalWithoutTva += hardwareFixedPrice;
    }

    // 2. PROFIL - calculat pe baza price_per_linear_meter din Profile
    if (profile && Number(profile.price_per_linear_meter) > 0) {
      const profileCost = totalProfilePerimeter * Number(profile.price_per_linear_meter);
      breakdown.push({
        label: `Profil ${profile.name}`,
        value: profileCost,
        description: `${totalProfilePerimeter.toFixed(2)} ml × ${profile.price_per_linear_meter} €/ml`
      });
      totalWithoutTva += profileCost;
    }

    // 3. STICLĂ - din GlazingType (ca în simulator)
    if (glazing && Number(glazing.price_per_sqm) > 0) {
      const glazingCost = totalArea * Number(glazing.price_per_sqm);
      breakdown.push({
        label: `Sticlă ${glazing.name}`,
        value: glazingCost,
        description: `${totalArea.toFixed(2)} m² × ${glazing.price_per_sqm} €/m²`
      });
      totalWithoutTva += glazingCost;
    }

    // 4. Culoare (înainte de multiplicatori, ca în simulator)
    const customColorRule = (() => {
      if (config.custom_hex_code) return colors.find(c => c.special_type === 'custom_hex');
      if (config.custom_ral_code) return colors.find(c => c.special_type === 'custom_ral');
      return null;
    })();

    if (color) {
      if (Number(color.price_adjustment) > 0) {
        breakdown.push({ label: `Culoare ${color.name}`, value: Number(color.price_adjustment), description: 'Ajustare fixă' });
        totalWithoutTva += Number(color.price_adjustment);
      }
      if (Number(color.price_per_sqm) > 0) {
        const colorAreaCost = Number(color.price_per_sqm) * totalArea;
        breakdown.push({ label: `Culoare ${color.name} (per m²)`, value: colorAreaCost, description: `${totalArea.toFixed(2)} m² × ${color.price_per_sqm} €/m²` });
        totalWithoutTva += colorAreaCost;
      }
    } else if (customColorRule) {
      if (Number(customColorRule.price_adjustment) > 0) totalWithoutTva += Number(customColorRule.price_adjustment);
      if (Number(customColorRule.price_per_sqm) > 0) totalWithoutTva += Number(customColorRule.price_per_sqm) * totalArea;
    }

    // 5. Multiplicator profil (ca în simulator)
    if (profile && Number(profile.price_multiplier) && Number(profile.price_multiplier) !== 1) {
      const profileAdjustment = totalWithoutTva * (Number(profile.price_multiplier) - 1);
      breakdown.push({
        label: `Ajustare profil ${profile.name}`,
        value: profileAdjustment,
        description: `${(((Number(profile.price_multiplier) - 1) * 100) || 0).toFixed(0)}%`
      });
      totalWithoutTva += profileAdjustment;
    }

    // 6. Multiplicator material (ca în simulator)
    if (Number(material.price_multiplier) && Number(material.price_multiplier) !== 1) {
      const matAdjustment = totalWithoutTva * (Number(material.price_multiplier) - 1);
      breakdown.push({
        label: `Ajustare material ${material.name}`,
        value: matAdjustment,
        description: `${(((Number(material.price_multiplier) - 1) * 100) || 0).toFixed(0)}%`
      });
      totalWithoutTva += matAdjustment;
    }

    // 7. MECANISME - calculăm prețul pentru fiecare canat bazat pe înălțime (ca în simulator)
    if (Array.isArray(config.sash_configs) && config.sash_configs.length > 0) {
      config.sash_configs.forEach((sashConfig, sashIndex) => {
        const mechType = sashConfig?.type || 'fix';
        const mechHeightRanges = mechanismHeightPricing[mechType];
        
        if (mechHeightRanges && Array.isArray(mechHeightRanges) && mechHeightRanges.length > 0) {
          // Găsește intervalul corect bazat pe înălțime
          const matchingRange = mechHeightRanges
            .sort((a, b) => (a.max_height || 0) - (b.max_height || 0))
            .find(range => heightNum >= (range.min_height || 0) && heightNum <= (range.max_height || 9999));

          if (matchingRange && matchingRange.price_per_piece > 0) {
            breakdown.push({
              label: `Mecanism Canat ${sashIndex + 1} (${mechType})`,
              value: matchingRange.price_per_piece,
              description: `Înălțime ${matchingRange.min_height || 0}-${matchingRange.max_height}mm`
            });
            totalWithoutTva += matchingRange.price_per_piece;
          }
        }
      });
    }

    // 8. Sub-material multiplier
    if (subMaterial && Number(subMaterial.price_multiplier) !== 1) {
      const adjustment = totalWithoutTva * (Number(subMaterial.price_multiplier) - 1);
      breakdown.push({
        label: `Ajustare ${subMaterial.name}`,
        value: adjustment,
        description: `${(((Number(subMaterial.price_multiplier) - 1) * 100) || 0).toFixed(1)}% din preț`
      });
      totalWithoutTva += adjustment;
    }

    // 9. Multiplicator culoare (aplicat la final, dacă există)
    if (color && Number(color.price_multiplier) !== 1) {
      const colorMultAdjustment = totalWithoutTva * (Number(color.price_multiplier) - 1);
      breakdown.push({
        label: `Multiplicator culoare ${color.name}`,
        value: colorMultAdjustment,
        description: `${(((Number(color.price_multiplier) - 1) * 100) || 0).toFixed(0)}%`
      });
      totalWithoutTva += colorMultAdjustment;
    } else if (customColorRule && Number(customColorRule.price_multiplier) !== 1) {
      totalWithoutTva += totalWithoutTva * (Number(customColorRule.price_multiplier) - 1);
    }

    // 10. Accesorii
    selectedAccessoriesList.forEach((accessory) => {
      breakdown.push({ label: accessory.name, value: Number(accessory.price) || 0, description: 'Accesoriu' });
      totalWithoutTva += Number(accessory.price) || 0;
    });

    const finalTotalWithoutTva = totalWithoutTva * (Number(config.quantity) || 1);
    const vatAmount = finalTotalWithoutTva * 0.21;
    const finalTotal = finalTotalWithoutTva + vatAmount;

    return {
      total: finalTotal,
      totalWithoutTva: finalTotalWithoutTva,
      tva: vatAmount,
      breakdown,
      area: totalArea
    };
  }, [config, accessories, selectedProduct, selectedMaterial, selectedSubMaterial, selectedProfile, selectedColor, selectedGlazing, colors, glazingTypes]);

  // CALLBACKS - always called unconditionally
  const updateConfig = useCallback((key, value) => {
    setConfig((prev) => {
      const newState = { ...prev, [key]: value };
      const currentProduct = products.find((p) => p.id === newState.product_id);

      if (key === 'product_id') {
        const newProduct = products.find((p) => p.id === value);
        if (newProduct) {
          newState.width = newProduct.min_width;
          newState.height = newProduct.min_height;
          const selectedMaterial = materials.find((m) => m.id === prev.material_id);
          newState.sash_configs = getDefaultSashConfigs(newProduct, selectedMaterial);
          newState.individual_sash_widths = [];
          if (newProduct.sashes > 1) {
            newState.use_individual_widths = true;
            const equalWidth = Math.floor(newProduct.min_width / newProduct.sashes);
            newState.individual_sash_widths = new Array(newProduct.sashes).fill(equalWidth);
          } else {
            newState.use_individual_widths = false;
          }
          // După selectarea produsului, trecem la material
          setCurrentStep(1);
          setActiveTab('material');
        }
      }

      if (key === 'material_id') {
        // Resetăm sub-materialul, profilul și culoarea
        newState.sub_material_id = null;
        newState.profile_id = null;
        newState.color_id = null;
        newState.custom_ral_code = '';
        newState.custom_hex_code = '';
        
        // După selectarea materialului, trecem la profil
        setCurrentStep(2);
        setActiveTab('profile');
      }

      if (key === 'profile_id') {
        // Când se selectează profilul, trecem la culoare
        setCurrentStep(3);
        setActiveTab('color');
      }

      if (key === 'sash_configs') {
        if (currentProduct?.supports_sliding && value.length > 0) {
          const newSashCount = value.length;
          if (newSashCount !== prev.individual_sash_widths.length) {
            const equalWidth = Math.floor(prev.width / newSashCount);
            newState.individual_sash_widths = new Array(newSashCount).fill(equalWidth);
            newState.use_individual_widths = true;
          }
        } else if (!currentProduct?.supports_sliding && prev.sash_configs.length !== value.length) {
          const newSashCount = value.length;
          if (newSashCount > 1) {
            const equalWidth = Math.floor(prev.width / newSashCount);
            newState.individual_sash_widths = new Array(newSashCount).fill(equalWidth);
            newState.use_individual_widths = true;
          } else {
            newState.individual_sash_widths = [];
            newState.use_individual_widths = false;
          }
        }
      }

      if (key === 'individual_sash_widths' && prev.use_individual_widths) {
        const totalCalculatedWidth = value.reduce((sum, width) => sum + width, 0);
        if (totalCalculatedWidth !== prev.width) {
          newState.width = totalCalculatedWidth;
        }
      }

      if (key === 'use_individual_widths') {
        if (value && prev.sash_configs.length > 0) {
          const equalWidth = Math.floor(prev.width / prev.sash_configs.length);
          newState.individual_sash_widths = new Array(prev.sash_configs.length).fill(equalWidth);
        } else if (!value) {
          const totalFromIndividual = prev.individual_sash_widths.reduce((sum, width) => sum + width, 0);
          if (totalFromIndividual > 0) {
            newState.width = totalFromIndividual;
          }
        }
      }

      if (key === 'width' && prev.use_individual_widths && prev.sash_configs.length > 0) {
        const equalWidth = Math.floor(value / prev.sash_configs.length);
        // Bug Fix: The array should be created with the number of sashes, not the width value.
        newState.individual_sash_widths = new Array(prev.sash_configs.length).fill(equalWidth);
      }

      if (key === 'sub_material_id') {
        newState.color_id = null;
        newState.custom_ral_code = '';
        newState.custom_hex_code = '';
      }

      if (key === 'color_id' && value) {
        newState.custom_ral_code = '';
        newState.custom_hex_code = '';
      }

      if (key === 'custom_ral_code' && value) {
        newState.color_id = null;
        newState.custom_hex_code = '';
      }

      if (key === 'custom_hex_code' && value) {
        newState.color_id = null;
        newState.custom_ral_code = '';
      }

      if (key === 'delivery_country' && value !== 'RO') {
        newState.include_installation = false;
      }

      return newState;
    });
  }, [products, materials]);

  const updateSashConfig = useCallback((index, newSashData) => {
    setConfig((prev) => {
      const newSashConfigs = [...prev.sash_configs];
      newSashConfigs[index] = { ...newSashConfigs[index], ...newSashData };
      return { ...prev, sash_configs: newSashConfigs };
    });
  }, []);

  const goToStep = useCallback((stepIndex) => {
    const clampedIndex = Math.max(0, Math.min(stepIndex, configSteps.length - 1));
    let canGoToStep = false;

    const isColorSelected = !!(config.color_id || config.custom_ral_code || config.custom_hex_code);

    // Allow going back
    if (clampedIndex <= currentStep) {
      canGoToStep = true;
    } else if (clampedIndex === 0) {
      // Product - always accessible
      canGoToStep = true;
    } else if (clampedIndex === 1) {
      // Material - need product
      if (config.product_id) canGoToStep = true;
    } else if (clampedIndex === 2) {
      // Profile - need product + material
      if (config.product_id && config.material_id) canGoToStep = true;
    } else if (clampedIndex === 3) {
      // Color - need product + material + profile
      if (config.product_id && config.material_id && config.profile_id) canGoToStep = true;
    } else if (clampedIndex === 4) {
      // Mechanism - need color
      if (config.product_id && config.material_id && config.profile_id && isColorSelected) canGoToStep = true;
    } else if (clampedIndex === 5) {
      // Dimensions - need mechanism
      if (config.product_id && config.material_id && config.profile_id && isColorSelected && config.sash_configs.length > 0) canGoToStep = true;
    } else {
      // For accessories, services, summary - need dimensions
      if (config.product_id && config.material_id && config.profile_id && isColorSelected && config.sash_configs.length > 0 && config.width > 0 && config.height > 0) {
        canGoToStep = true;
      }
    }

    if (canGoToStep) {
      setCurrentStep(clampedIndex);
      const nextTab = configSteps[clampedIndex]?.id || 'material';
      setActiveTab(nextTab);
      setShowIncompleteAlert(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShowIncompleteAlert(true);
      setTimeout(() => setShowIncompleteAlert(false), 3000);
    }
  }, [config, currentStep, configSteps]);

  const canGoToNextStep = useMemo(() => {
    const nextStep = currentStep + 1;
    if (nextStep >= configSteps.length) return false;

    const isColorSelected = !!(config.color_id || config.custom_ral_code || config.custom_hex_code);

    if (nextStep === 1) return !!config.product_id; // Material
    if (nextStep === 2) return !!(config.product_id && config.material_id); // Profile
    if (nextStep === 3) return !!(config.product_id && config.material_id && config.profile_id); // Color
    if (nextStep === 4) return !!(config.product_id && config.material_id && config.profile_id && isColorSelected); // Mechanism
    if (nextStep === 5) return !!(config.product_id && config.material_id && config.profile_id && isColorSelected && config.sash_configs.length > 0); // Dimensions
    
    return true; // Accessories, services, summary are optional
  }, [config, currentStep, configSteps.length]);

  const addAccessory = useCallback((accessoryId) => {
    setConfig((prev) => ({
      ...prev,
      accessories: [...prev.accessories, accessoryId]
    }));
  }, []);

  const removeAccessory = useCallback((accessoryId) => {
    setConfig((prev) => ({
      ...prev,
      accessories: prev.accessories.filter((id) => id !== accessoryId)
    }));
  }, []);

  // Funcție pentru a genera imaginea din configurator (SVG to Data URL)
  const generateConfiguratorImage = useCallback(() => {
    try {
      const previewContainer = document.getElementById('config-preview');
      if (!previewContainer) return null;
      
      const svgElement = previewContainer.querySelector('svg');
      if (!svgElement) return null;
      
      // Clonează SVG-ul pentru a nu afecta originalul
      const clonedSvg = svgElement.cloneNode(true);
      
      // Serializează SVG-ul
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clonedSvg);
      
      // Convertește în base64 data URL
      const base64 = btoa(unescape(encodeURIComponent(svgString)));
      return `data:image/svg+xml;base64,${base64}`;
    } catch (error) {
      console.warn('Could not generate configurator image:', error);
      return null;
    }
  }, []);

  const addToCart = useCallback(async () => {
    if (isAddingToCart) return;

    // Validări înainte de a adăuga în coș
    if (!selectedProduct) {
      showAlert('Configurație incompletă', 'Te rugăm să selectezi un produs.');
      return;
    }

    if (!config.material_id) {
      showAlert('Configurație incompletă', 'Te rugăm să selectezi un material.');
      return;
    }

    const isColorSelected = !!(config.color_id || config.custom_ral_code || config.custom_hex_code);
    if (!isColorSelected) {
      showAlert('Configurație incompletă', 'Te rugăm să selectezi o culoare.');
      return;
    }

    if (!config.profile_id) {
      showAlert('Configurație incompletă', 'Te rugăm să selectezi un profil.');
      return;
    }

    if (!config.sash_configs || config.sash_configs.length === 0) {
      showAlert('Configurație incompletă', 'Te rugăm să configurezi mecanismele.');
      return;
    }

    setIsAddingToCart(true);

    try {
      const totalPrice = priceDetails.total || 0;

      // Generează imaginea via canvas din datele de configurație
      // (window.generateConfigurationImage e definit în ConfiguratorImageGenerator.jsx)
      let imageUrl = '';
      try {
        if (typeof window.generateConfigurationImage === 'function') {
          imageUrl = await window.generateConfigurationImage(
            selectedProduct,
            config.width,
            config.height,
            selectedMaterial,
            selectedSubMaterial,
            selectedColor,
            config.sash_configs,
            config.handle_position || 'dreapta'
          ) || '';
        }
      } catch (imgErr) {
        console.warn('Image generation failed, using fallback:', imgErr);
      }
      // Fallback la imaginea produsului
      if (!imageUrl) {
        imageUrl = selectedProduct?.configurator_image_urls?.[0] || selectedProduct?.image_urls?.[0] || '';
      }
      
      const cartItemData = {
        product_id: config.product_id,
        product_name: selectedProduct.name,
        image_url: imageUrl,
        price: totalPrice,
        quantity: config.quantity,
        configuration: {
          ...config,
          image_url: imageUrl,
          product_name: selectedProduct.name,
          calculated_price: totalPrice,
        }
      };

      // Citim sesiunea locală (fără Base44)
      const localSession = JSON.parse(localStorage.getItem('local_auth_session') || 'null');
      // Cheie specifică per utilizator pentru a evita amestecul de coșuri
      const cartKey = localSession?.email ? `cart_${localSession.email}` : 'guestCart';

      const storedCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
      const newItem = {
        ...cartItemData,
        id: `cart_${Date.now()}`,
        created_by: localSession?.email || 'guest',
        created_date: new Date().toISOString()
      };
      storedCart.push(newItem);
      localStorage.setItem(cartKey, JSON.stringify(storedCart));

      setShowAddedToCartModal(true);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      showAlert('Eroare', 'Eroare la adăugarea în coș. Vă rugăm să încercați din nou.');
    } finally {
      setIsAddingToCart(false);
    }
  }, [isAddingToCart, priceDetails.total, selectedProduct, config, showAlert, generateConfiguratorImage]);

  // EFFECT - always called unconditionally
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setLoadingStep('Se încarcă datele...');

      try {
        const dataFetchers = [
          () => base44.entities.Product.filter({ is_active: true }),
          () => base44.entities.Material.filter({ is_active: true }),
          () => base44.entities.SubMaterial.filter({ is_active: true }),
          () => base44.entities.Profile.filter({ is_active: true }),
          () => base44.entities.Color.filter({ is_active: true }),
          () => base44.entities.AccessoryOption.filter({ is_active: true })
        ];

        const [
          loadedProducts,
          loadedMaterials,
          loadedSubMaterials,
          loadedProfiles,
          loadedColors,
          loadedAccessories
        ] = await staggeredFetch(dataFetchers);

        setProducts(loadedProducts);
        setMaterials(loadedMaterials);
        setSubMaterials(loadedSubMaterials);
        setProfiles(loadedProfiles);
        setColors(loadedColors);
        setAccessories(loadedAccessories);

        const params = new URLSearchParams(window.location.search);
        const productIdFromUrl = params.get('product_id');
        const materialIdFromUrl = params.get('material_id');

        if (productIdFromUrl) {
          const initialProduct = loadedProducts.find((p) => p.id === productIdFromUrl);
          if (initialProduct) {
            setConfig((prev) => ({
              ...prev,
              product_id: initialProduct.id,
              width: initialProduct.min_width,
              height: initialProduct.min_height
            }));
            setCurrentStep(1); // Go to material step
            setActiveTab('material');
          }
        }

        if (materialIdFromUrl) {
          const initialMaterial = loadedMaterials.find((m) => m.id === materialIdFromUrl);
          if (initialMaterial) {
            setConfig((prev) => ({
              ...prev,
              material_id: initialMaterial.id
            }));
            // If we also have a product, go to profile
            if (productIdFromUrl) {
              setCurrentStep(2);
              setActiveTab('profile');
            }
          }
        }

      } catch (error) {
        console.error("Failed to load data:", error);
        setLoadingError('Nu am putut încărca datele configuratorului. Vă rugăm să încercați din nou.');
      } finally {
        setLoadingStep('');
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // COMPUTED - after all hooks
  const safeStepIndex = Math.max(0, Math.min(currentStep, configSteps.length - 1));
  const safeStep = configSteps[safeStepIndex] || { id: 'material', name: 'Material', icon: Info };
  const shouldShowPreviewAndPrice = config.product_id;
  
  // SCHIMBARE: Butonul "Adaugă în Coș" apare DOAR în ultimul pas (Sumar)
  const isConfigurationComplete = !!(
    config.material_id &&
    config.profile_id &&
    config.product_id &&
    (config.color_id || config.custom_ral_code || config.custom_hex_code) &&
    config.sash_configs?.length > 0 &&
    config.width > 0 &&
    config.height > 0
  );
  
  // Butonul apare DOAR când suntem în ultimul pas (index 8 = Sumar)
  const showAddToCartButton = isConfigurationComplete && currentStep === configSteps.length - 1;

  // SINGLE RETURN
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      {(isLoading || loadingError) && (
        <div className={`fixed inset-0 z-[9998] flex items-center justify-center backdrop-blur-xl ${isLoading ? 'bg-slate-50/95 dark:bg-slate-950/95' : 'bg-red-50/95 dark:bg-slate-950/95'}`}>
          {isLoading ? (
            <div className="text-center max-w-md p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-slate-200/50 dark:border-slate-700/50">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Se încarcă configuratorul</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Pregătim datele pentru tine...</p>
              {loadingStep && <p className="text-blue-600 dark:text-blue-400 text-sm mt-2">{loadingStep}</p>}
            </div>
          ) : (
            <div className="text-center max-w-md p-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-2xl rounded-[32px] border border-red-200 dark:border-red-800">
              <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-red-700 dark:text-red-400">Eroare de încărcare</h3>
              <p className="text-slate-600 dark:text-slate-400 mt-2">{loadingError}</p>
              <Button onClick={() => window.location.reload()} className="mt-6 bg-red-600 hover:bg-red-700 rounded-2xl">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reîncarcă Pagina
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
            Configurator Ferestre și Uși Premium
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Creează-ți produsul perfect pas cu pas.
          </p>
        </div>

        <div className="mb-8 relative max-w-5xl mx-auto">
          <div className="flex justify-between items-center">
            {configSteps.map((step, index) => {
              const Icon = step.icon || Info;
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center cursor-pointer group" onClick={() => goToStep(index)}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 z-10 shadow-lg ${index === safeStepIndex ? 'bg-blue-600 text-white scale-110 shadow-blue-500/50' : index < safeStepIndex ? 'bg-green-600 text-white shadow-green-500/30' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'} group-hover:scale-105`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`mt-2 text-xs md:text-sm font-medium text-center transition-all ${index === safeStepIndex ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      {step.name}
                    </span>
                  </div>
                  {index < configSteps.length - 1 && (
                    <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 mx-2 rounded-full">
                      <div className={`h-full transition-all duration-500 rounded-full ${index < safeStepIndex ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-700'}`} style={{ width: '100%' }} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-8">
          {shouldShowPreviewAndPrice && (
            <div className="lg:col-span-6 xl:col-span-5">
              <div className="lg:sticky lg:top-8 space-y-6">
                <Card id="config-preview" className="shadow-2xl border-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[32px] overflow-hidden">
                  <CardHeader className="bg-gradient-to-br from-[#15803d] to-[#16a34a] text-white p-6 rounded-t-[32px]">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                      <Info className="w-5 h-5" />
                      Configurația ta
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ProductViewer
                      product={selectedProduct}
                      width={config.width}
                      height={config.height}
                      material={selectedMaterial}
                      subMaterial={selectedSubMaterial}
                      color={colorForViewer}
                      glazing={null}
                      sashConfigs={config.sash_configs}
                      onSashConfigChange={updateSashConfig}
                      updateConfig={updateConfig}
                      isDoor={!!selectedProduct?.category?.includes('usi')}
                      individualSashWidths={config.individual_sash_widths}
                      useIndividualWidths={config.use_individual_widths}
                    />
                  </CardContent>
                </Card>

                <div className="hidden lg:block">
                  <PriceCalculator
                    priceDetails={priceDetails}
                    showBreakdown={showPriceBreakdown}
                    onToggleBreakdown={() => setShowPriceBreakdown(!showPriceBreakdown)}
                    onAddToCart={addToCart}
                    isAddingToCart={isAddingToCart}
                    showAddToCartButton={showAddToCartButton}
                  />
                </div>
              </div>
            </div>
          )}

          <div className={shouldShowPreviewAndPrice ? 'lg:col-span-6 xl:col-span-7' : 'lg:col-span-12'}>
            <Card className="shadow-2xl border-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl min-h-[600px] rounded-[32px] overflow-hidden">
              <CardHeader className="border-b border-slate-200/50 dark:border-slate-700/50 rounded-t-[32px] bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
                <CardTitle className="text-2xl text-slate-800 dark:text-slate-100 font-bold">
                  Pasul {safeStepIndex + 1}: {safeStep.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {activeTab === 'product' &&
                      <ErrorBoundary label="step:product">
                        <ProductSelector
                          products={products}
                          config={config}
                          updateConfig={updateConfig}
                          materials={materials}
                        />
                      </ErrorBoundary>
                    }

                    {activeTab === 'material' && config.product_id &&
                      <ErrorBoundary label="step:material">
                        <MaterialSelector
                          materials={materials.filter(m => {
                            const product = products.find(p => p.id === config.product_id);
                            return !product?.compatible_materials || product.compatible_materials.length === 0 || product.compatible_materials.includes(m.id);
                          })}
                          subMaterials={compatibleSubMaterials}
                          config={config}
                          updateConfig={updateConfig}
                          selectedMaterial={selectedMaterial}
                        />
                      </ErrorBoundary>
                    }

                    {activeTab === 'profile' && config.product_id && config.material_id &&
                      <ErrorBoundary label="step:profile">
                        <ProfileSelector
                          profiles={profiles}
                          config={config}
                          updateConfig={updateConfig}
                          selectedMaterial={selectedMaterial}
                        />
                      </ErrorBoundary>
                    }

                    {activeTab === 'color' && selectedProduct && selectedMaterial && config.profile_id && (
                      <ErrorBoundary label="step:color">
                        <ColorStep
                          config={config}
                          updateConfig={updateConfig}
                          selectedMaterial={selectedMaterial}
                          compatibleColors={compatibleColors}
                        />
                      </ErrorBoundary>
                    )}

                    {activeTab === 'mechanism' && selectedProduct &&
                      <ErrorBoundary label="step:mechanism">
                        <MechanismPresets
                          product={selectedProduct}
                          selectedMaterial={selectedMaterial}
                          currentSashConfigs={config.sash_configs}
                          config={config}
                          updateConfig={updateConfig}
                          onPresetSelect={(sashConfigs) => {
                            updateConfig('sash_configs', sashConfigs);
                          }}
                        />
                      </ErrorBoundary>
                    }

                    {activeTab === 'dimensions' && selectedProduct &&
                      <ErrorBoundary label="step:dimensions">
                        <DimensionControls
                          product={selectedProduct}
                          config={config}
                          updateConfig={updateConfig}
                          sashConfigs={config.sash_configs}
                          onSashConfigChange={updateSashConfig}
                          selectedMaterial={selectedMaterial}
                          individualSashWidths={config.individual_sash_widths}
                          useIndividualWidths={config.use_individual_widths}
                          onIndividualSashWidthChange={(index, value) => {
                            const newWidths = [...config.individual_sash_widths];
                            newWidths[index] = value;
                            updateConfig('individual_sash_widths', newWidths);
                          }}
                          onToggleIndividualWidths={(checked) => updateConfig('use_individual_widths', checked)}
                          hideMechanismPresets={true}
                        />
                      </ErrorBoundary>
                    }

                    {activeTab === 'accessories' &&
                      <ErrorBoundary label="step:accessories">
                        <AccessorySelector
                          accessories={accessories}
                          config={config}
                          addAccessory={addAccessory}
                          removeAccessory={removeAccessory}
                        />
                      </ErrorBoundary>
                    }

                    {activeTab === 'services' &&
                      <ErrorBoundary label="step:services">
                        <TransportInstallationSelector
                          config={config}
                          updateConfig={updateConfig}
                          selectedMaterial={selectedMaterial}
                          selectedProduct={selectedProduct}
                          priceDetails={priceDetails}
                        />
                      </ErrorBoundary>
                    }

                    {activeTab === 'summary' &&
                      <ErrorBoundary label="step:summary">
                        <ConfigurationSummary
                          config={config}
                          data={{ products, materials, subMaterials, profiles, colors, accessories }}
                        />
                      </ErrorBoundary>
                    }
                  </motion.div>
                </AnimatePresence>
              </CardContent>

              <CardFooter className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-b-[32px]">
                <Button
                  variant="outline"
                  onClick={() => goToStep(currentStep - 1)}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 rounded-2xl border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Anterior
                </Button>
                
                <div className="flex items-center gap-3">
                  {currentStep < configSteps.length - 1 && (
                    <Button
                      onClick={() => goToStep(currentStep + 1)}
                      disabled={!canGoToNextStep}
                      className="bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-green-600 disabled:to-emerald-600 disabled:opacity-60 text-white flex items-center gap-2 rounded-2xl shadow-lg shadow-green-500/30 transition-all duration-200"
                    >
                      Următorul
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {showAddToCartButton && (
                    <Button
                      onClick={addToCart}
                      disabled={isAddingToCart}
                      className="bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-green-600 disabled:to-emerald-600 disabled:opacity-60 flex items-center gap-2 rounded-2xl shadow-lg shadow-green-500/30 transition-all duration-200"
                    >
                      {isAddingToCart ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                      Adaugă în Coș
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>

        {shouldShowPreviewAndPrice && (
          <div className="mt-8 lg:hidden">
            <PriceCalculator
              priceDetails={priceDetails}
              showBreakdown={showPriceBreakdown}
              onToggleBreakdown={() => setShowPriceBreakdown(!showPriceBreakdown)}
              onAddToCart={addToCart}
              isAddingToCart={isAddingToCart}
              showAddToCartButton={showAddToCartButton}
            />
          </div>
        )}
      </div>

      {/* Alert Dialog */}
      <AlertDialog open={alertDialog.isOpen} onOpenChange={(open) => setAlertDialog({ ...alertDialog, isOpen: open })}>
        <AlertDialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[32px] border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-gray-100">{alertDialog.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">{alertDialog.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertDialog({ ...alertDialog, isOpen: false })} className="rounded-2xl">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AnimatePresence>
        {showIncompleteAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-orange-100/95 dark:bg-orange-900/90 backdrop-blur-xl border-2 border-orange-400 dark:border-orange-600 text-orange-800 dark:text-orange-200 px-6 py-3 rounded-[32px] shadow-2xl flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Te rugăm să completezi configurația curentă pentru a continua</span>
          </motion.div>
        )}

        {showAddedToCartModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[32px] shadow-2xl max-w-md w-full p-6 text-center"
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-[32px] flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                Produsul a fost adăugat în coș!
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Configurația ta a fost salvată cu succes.
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setShowAddedToCartModal(false);
                  }}
                  variant="outline"
                  className="flex-1 rounded-2xl border-slate-300 dark:border-slate-600"
                >
                  Continuă
                </Button>
                <Button
                  onClick={() => {
                    window.location.href = createPageUrl("ShoppingCart");
                  }}
                  className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl shadow-lg"
                >
                  Vezi Coșul <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}