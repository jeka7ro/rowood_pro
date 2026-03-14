import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { countryCode, vatNumber } = await req.json();
    
    if (!countryCode || !vatNumber) {
      return Response.json({ 
        valid: false, 
        error: 'Codul țării și numărul VAT sunt obligatorii' 
      });
    }

    // Curăță numărul VAT de spații și caractere speciale
    const cleanVatNumber = vatNumber.replace(/[^a-zA-Z0-9]/g, '');
    
    // VIES SOAP API endpoint
    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:checkVat>
         <urn:countryCode>${countryCode.toUpperCase()}</urn:countryCode>
         <urn:vatNumber>${cleanVatNumber}</urn:vatNumber>
      </urn:checkVat>
   </soapenv:Body>
</soapenv:Envelope>`;

    const response = await fetch('https://ec.europa.eu/taxation_customs/vies/services/checkVatService', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': ''
      },
      body: soapEnvelope
    });

    const responseText = await response.text();
    
    // Log pentru debugging
    console.log('VIES Response:', responseText);
    
    // Parse SOAP response - suport pentru diferite namespace-uri
    const validMatch = responseText.match(/<(?:ns2:)?valid>(\w+)<\/(?:ns2:)?valid>/i);
    const nameMatch = responseText.match(/<(?:ns2:)?name>([^<]*)<\/(?:ns2:)?name>/i);
    const addressMatch = responseText.match(/<(?:ns2:)?address>([^<]*)<\/(?:ns2:)?address>/i);
    
    if (validMatch) {
      const isValid = validMatch[1].toLowerCase() === 'true';
      
      return Response.json({
        valid: isValid,
        companyName: nameMatch ? nameMatch[1].trim() : null,
        companyAddress: addressMatch ? addressMatch[1].trim() : null,
        vatNumber: `${countryCode.toUpperCase()}${cleanVatNumber}`,
        error: isValid ? null : 'Numărul VAT nu este valid sau nu este înregistrat în VIES.'
      });
    }
    
    // Check for SOAP fault
    const faultMatch = responseText.match(/<faultstring>([^<]*)<\/faultstring>/);
    if (faultMatch) {
      return Response.json({
        valid: false,
        error: `Eroare VIES: ${faultMatch[1]}`
      });
    }

    return Response.json({
      valid: false,
      error: 'Nu s-a putut procesa răspunsul de la VIES. Încercați din nou.'
    });

  } catch (error) {
    console.error('VAT validation error:', error);
    return Response.json({
      valid: false,
      error: 'Serviciul VIES nu este disponibil momentan. Încercați din nou mai târziu.'
    });
  }
});