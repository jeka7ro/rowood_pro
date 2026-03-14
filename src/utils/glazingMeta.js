export function packGlazingMeta(formData) {
  const meta = {
    compatible_profiles: formData.compatible_profiles || [],
    image_url: formData.image_url || ''
  };
  
  let baseFeatures = [];
  if (Array.isArray(formData.features)) {
    baseFeatures = formData.features;
  } else if (typeof formData.features === 'string') {
    baseFeatures = formData.features.split(',').map(f => f.trim()).filter(f => f !== '');
  }
    
  const cleanFeatures = baseFeatures.filter(f => typeof f === 'string' && !f.startsWith('__META__:'));
  cleanFeatures.push(`__META__:${JSON.stringify(meta)}`);
  
  const dataToSave = { ...formData, features: cleanFeatures };
  delete dataToSave.compatible_profiles;
  delete dataToSave.image_url;
  
  return dataToSave;
}

export function unpackGlazingMeta(glazing) {
  if (!glazing) return glazing;
  let meta = {};
  const metaFeature = (glazing.features || []).find(f => typeof f === 'string' && f.startsWith('__META__:'));
  
  if (metaFeature) {
    try {
      meta = JSON.parse(metaFeature.replace('__META__:', ''));
    } catch(e) {
      console.warn('Failed to parse Glazing metadata', e);
    }
  }
  
  return {
    ...glazing,
    compatible_profiles: meta.compatible_profiles || glazing.compatible_profiles || [],
    image_url: meta.image_url || glazing.image_url || '',
    features: (glazing.features || []).filter(f => typeof f === 'string' && !f.startsWith('__META__:'))
  };
}
