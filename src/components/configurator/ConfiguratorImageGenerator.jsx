
import React, { useRef, useEffect, useCallback } from 'react';

/**
 * Core logic for generating the product image on a canvas.
 * This function is extracted to be reusable by both the React component
 * and a standalone global function, ensuring no dependency on React hooks
 * or component-specific refs for its execution.
 *
 * @param {HTMLCanvasElement} canvas - The canvas element to draw on.
 * @param {object} product - Product details (e.g., name, category).
 * @param {number} width - Product width in mm.
 * @param {number} height - Product height in mm.
 * @param {object} material - Material details.
 * @param {object} subMaterial - Sub-material details.
 * @param {object} color - Color details (e.g., hex_code).
 * @param {Array} sashConfigs - Array of sash configurations.
 * @param {string} handlePosition - Position of the handle ('stanga' or 'dreapta').
 * @param {function} [onImageGeneratedCallback] - Optional callback to receive the generated image data URL.
 * @returns {Promise<string>} A promise that resolves with the generated image data URL.
 */
async function generateImageLogic(
  canvas,
  product,
  width,
  height,
  material,
  subMaterial,
  color,
  sashConfigs,
  handlePosition,
  onImageGeneratedCallback
) {
  if (!canvas || !product || !width || !height) {
    console.warn("Missing required parameters for image generation.");
    return null;
  }

  const ctx = canvas.getContext('2d');
  const canvasWidth = 400;
  const canvasHeight = 300;
    
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Clear canvas
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Calculate product dimensions for drawing
  const productAspectRatio = width / height;
  let drawWidth, drawHeight;
  
  if (productAspectRatio > 1) {
    drawWidth = Math.min(canvasWidth - 80, 300);
    drawHeight = drawWidth / productAspectRatio;
  } else {
    drawHeight = Math.min(canvasHeight - 80, 250);
    drawWidth = drawHeight * productAspectRatio;
  }

  const x = (canvasWidth - drawWidth) / 2;
  const y = (canvasHeight - drawHeight) / 2;

  // Get frame color
  let frameColor = '#e2e8f0'; // default
  if (color?.hex_code) {
    frameColor = color.hex_code;
  } else if (subMaterial?.image_url) {
    // For materials with textures, use a darker default
    frameColor = '#94a3b8';
  } else if (material?.name) {
    const materialName = material.name.toLowerCase();
    if (materialName.includes('aluminiu')) frameColor = '#64748b';
    if (materialName.includes('pvc')) frameColor = '#f1f5f9';
    if (materialName.includes('lemn')) frameColor = '#a3a3a3';
  }

  // Draw frame
  ctx.fillStyle = frameColor;
  ctx.fillRect(x - 8, y - 8, drawWidth + 16, drawHeight + 16);

  // Draw glass areas
  const actualSashConfigs = sashConfigs && sashConfigs.length > 0 ? sashConfigs : [{ id: 'default' }];
  const sashWidth = drawWidth / actualSashConfigs.length;
  
  ctx.fillStyle = 'rgba(173, 216, 230, 0.3)'; // light blue glass
  
  for (let i = 0; i < actualSashConfigs.length; i++) {
    const sashX = x + (i * sashWidth);
    ctx.fillRect(sashX + 4, y + 4, sashWidth - 8, drawHeight - 8);
    
    // Add sash separator
    if (i < actualSashConfigs.length - 1) {
      ctx.fillStyle = frameColor;
      ctx.fillRect(sashX + sashWidth - 2, y, 4, drawHeight);
      ctx.fillStyle = 'rgba(173, 216, 230, 0.3)';
    }
  }

  // Add handle for doors
  if (product?.category === 'usi' || product?.category === 'usi-balcon') {
    ctx.fillStyle = '#374151';
    const handleX = handlePosition === 'stanga' ? x + 12 : x + drawWidth - 20;
    const handleY = y + drawHeight / 2 - 20;
    ctx.fillRect(handleX, handleY, 8, 40);
  }

  // Add product label
  ctx.fillStyle = '#1f2937';
  ctx.font = '14px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(product.name, canvasWidth / 2, canvasHeight - 20);
  
  ctx.font = '12px Arial, sans-serif';
  ctx.fillStyle = '#6b7280';
  ctx.fillText(`${width}mm × ${height}mm`, canvasWidth / 2, canvasHeight - 6);

  // Convert to image data URL
  const imageDataUrl = canvas.toDataURL('image/png');
  
  if (onImageGeneratedCallback) {
    onImageGeneratedCallback(imageDataUrl);
  }

  return imageDataUrl;
}

export default function ConfiguratorImageGenerator({ 
  product, 
  width, 
  height, 
  material, 
  subMaterial, 
  color, 
  sashConfigs, 
  handlePosition, 
  onImageGenerated 
}) {
  const canvasRef = useRef(null);

  const generateProductImage = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Call the extracted core logic
    await generateImageLogic(
      canvas,
      product,
      width,
      height,
      material,
      subMaterial,
      color,
      sashConfigs,
      handlePosition,
      onImageGenerated // Pass the component's onImageGenerated prop as the callback
    );
  }, [product, width, height, material, subMaterial, color, sashConfigs, handlePosition, onImageGenerated]);

  useEffect(() => {
    // Only generate image if product details are available
    if (product && width && height) {
      generateProductImage();
    }
  }, [product, width, height, generateProductImage]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ display: 'none' }} 
    />
  );
}

// EXPUNE FUNCȚIA GLOBAL PENTRU A FI FOLOSITĂ ÎN CONFIGURATOR
// This function can be called from anywhere in the application to generate an image
// without needing to render the React component. It creates its own canvas.
if (typeof window !== 'undefined') {
  window.generateConfigurationImage = async (
    product, 
    width, 
    height, 
    material, 
    subMaterial, 
    color, 
    sashConfigs, 
    handlePosition
  ) => {
    // Create an offscreen canvas element to perform the drawing
    const offscreenCanvas = document.createElement('canvas');
    
    // Call the shared image generation logic
    const imageDataUrl = await generateImageLogic(
      offscreenCanvas,
      product,
      width,
      height,
      material,
      subMaterial,
      color,
      sashConfigs,
      handlePosition,
      null // No onImageGenerated callback for the global function
    );

    // Clean up the offscreen canvas if it's not needed further
    // (though in modern browsers, detached elements are garbage collected)
    // offscreenCanvas.remove(); 
    
    return imageDataUrl;
  };
}
