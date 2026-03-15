import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    // Check if authorized
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cui } = await req.json();
    
    if (!cui) {
      return Response.json({ 
        valid: false, 
        error: 'CUI-ul este obligatoriu' 
      });
    }

    // Clean CUI of any non-digit chars (e.g. RO keyword, spaces)
    const cleanCui = cui.toString().replace(/[^0-9]/g, '');
    
    if (!cleanCui || cleanCui.length < 2 || cleanCui.length > 10) {
      return Response.json({
         valid: false,
         error: 'CUI invalid (lungime incorectă)'
      });
    }

    // YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    const payload = [
      {
        cui: parseInt(cleanCui, 10),
        data: today
      }
    ];

    const response = await fetch('https://webservicesp.anaf.ro/PlatitorTvaRest/api/v8/ws/tva', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('ANAF Response:', JSON.stringify(data));
    
    if (data.cod === 200 && data.found && data.found.length > 0) {
      const company = data.found[0];
      
      if (company.denumire) {
          return Response.json({
            valid: true,
            companyName: company.denumire,
            companyAddress: company.adresa || null,
            regCom: company.nrRegCom || null,
            cui: cleanCui,
            vatPayer: company.scpTVA,
          });
      }
    }
    
    return Response.json({
      valid: false,
      error: 'CUI-ul nu a fost găsit în baza de date ANAF.'
    });

  } catch (error) {
    console.error('ANAF validation error:', error);
    return Response.json({
      valid: false,
      error: 'Serviciul ANAF nu este disponibil momentan. Încercați din nou mai târziu.'
    });
  }
});
