import { createClient } from '@base44/sdk';

async function run() {
  const client = createClient({ appId: '68c13cefb4bf14d17f2c2392', requiresAuth: false });
  try {
    const profiles = await client.entities.Profile.filter({});
    const clasic68 = profiles.find(p => p.name.toLowerCase().includes('classic 68'));
    if (!clasic68) throw new Error('Nu am gasit Clasic 68');
    console.log('Profile Clasic 68 ID:', clasic68.id);
    
    const glazings = await client.entities.GlazingType.filter({});
    const ug06 = glazings.find(g => g.name === 'Ug 0.6');
    if (!ug06) throw new Error('Nu am gasit Ug 0.6');
    
    const metaStr = '__META__:' + JSON.stringify({
      compatible_profiles: [clasic68.id],
      image_url: '/glass_default.png'
    });
    
    let cleanFeatures = (ug06.features || []).filter(f => typeof f === 'string' && !f.startsWith('__META__:'));
    cleanFeatures.push(metaStr);
    
    const res = await client.entities.GlazingType.update(ug06.id, {
      features: cleanFeatures
    });
    console.log('Sticla a fost actualizata manual cu profilul Clasic 68!');
  } catch(e) { console.error('Error:', e); } finally { process.exit(0); }
}

run();
