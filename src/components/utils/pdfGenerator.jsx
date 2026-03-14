import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

export const generateOrderConfirmationPDF = async (order, cartItems, relatedData, companySettings) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Helper function for text with proper encoding
  const addText = (text, x, y, options = {}) => {
    doc.setFont('helvetica', options.weight || 'normal');
    doc.setFontSize(options.size || 10);
    doc.setTextColor(options.color || '#000000');
    
    // Handle Romanian diacritics
    const cleanText = text
      .replace(/ă/g, 'a').replace(/Ă/g, 'A')
      .replace(/â/g, 'a').replace(/Â/g, 'A')
      .replace(/î/g, 'i').replace(/Î/g, 'I')
      .replace(/ș/g, 's').replace(/Ș/g, 'S')
      .replace(/ț/g, 't').replace(/Ț/g, 'T');
    
    if (options.align === 'center') {
      doc.text(cleanText, x, y, { align: 'center' });
    } else if (options.align === 'right') {
      doc.text(cleanText, x, y, { align: 'right' });
    } else {
      doc.text(cleanText, x, y);
    }
  };

  // Draw technical product diagram
  const drawProductDiagram = (x, y, width, height, sashCount, color, openingType) => {
    const frameThickness = 3;
    const glassColor = [173, 216, 230]; // Light blue glass
    
    // Draw main frame
    doc.setFillColor(color || '#8b4513');
    doc.rect(x, y, width, height, 'F');
    
    // Draw glass areas
    doc.setFillColor(glassColor[0], glassColor[1], glassColor[2]);
    
    if (sashCount === 1) {
      // Single sash
      doc.rect(x + frameThickness, y + frameThickness, 
               width - (frameThickness * 2), height - (frameThickness * 2), 'F');
      
      // Draw opening lines based on type
      if (openingType?.includes('oscilo') || openingType?.includes('batant')) {
        doc.setDrawColor(0, 0, 255);
        doc.setLineWidth(0.5);
        // Draw opening direction lines
        doc.line(x + frameThickness + 5, y + frameThickness + 5, 
                 x + width - frameThickness - 5, y + height - frameThickness - 5);
        doc.line(x + width - frameThickness - 5, y + frameThickness + 5, 
                 x + frameThickness + 5, y + height - frameThickness - 5);
      }
    } else if (sashCount === 2) {
      // Double sash
      const sashWidth = (width - (frameThickness * 3)) / 2;
      
      // Left sash
      doc.rect(x + frameThickness, y + frameThickness, sashWidth, height - (frameThickness * 2), 'F');
      // Right sash  
      doc.rect(x + frameThickness * 2 + sashWidth, y + frameThickness, sashWidth, height - (frameThickness * 2), 'F');
      
      // Central mullion
      doc.setFillColor(color || '#8b4513');
      doc.rect(x + frameThickness + sashWidth, y + frameThickness, frameThickness, height - (frameThickness * 2), 'F');
      
      // Draw opening lines
      doc.setDrawColor(0, 0, 255);
      doc.setLineWidth(0.5);
      // Left sash lines
      doc.line(x + frameThickness + 3, y + frameThickness + 3, 
               x + frameThickness + sashWidth - 3, y + height - frameThickness - 3);
      // Right sash lines  
      doc.line(x + frameThickness * 2 + sashWidth + 3, y + frameThickness + 3,
               x + width - frameThickness - 3, y + height - frameThickness - 3);
    }
    
    // Draw frame border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.8);
    doc.rect(x, y, width, height);
    
    // Add dimension annotations
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.setFontSize(7);
    
    // Width dimension
    doc.line(x, y - 5, x + width, y - 5);
    doc.line(x, y - 3, x, y - 7);
    doc.line(x + width, y - 3, x + width, y - 7);
    addText(`L=${Math.round(width * 40)}mm`, x + width/2, y - 7, { align: 'center', size: 7 });
    
    // Height dimension
    doc.line(x - 5, y, x - 5, y + height);
    doc.line(x - 3, y, x - 7, y);
    doc.line(x - 3, y + height, x - 7, y + height);
    
    // Add rotated text for height WITHOUT using doc.translate
    addText(`H=${Math.round(height * 40)}mm`, x - 15, y + height/2, { size: 7 });
  };

  let y = 20;

  // COMPANY HEADER
  addText(companySettings?.company_name || 'SC Wood Glass SRL', 20, y, { size: 11, weight: 'bold' });
  addText(`CUI: ${companySettings?.fiscal_code || 'RO 28396216'}`, 20, y + 5, { size: 9 });
  addText(`Reg.Com: ${companySettings?.trade_register || 'J08/729/2011'}`, 20, y + 10, { size: 9 });
  
  const address = `${companySettings?.address_street || 'Zizinului 625, Tarlungeni'}, ${companySettings?.address_city || 'Brasov'},`;
  addText(address, 20, y + 15, { size: 9 });
  addText(`${companySettings?.address_country || 'Romania'} ${companySettings?.address_postal_code || 'Zip Code 507220'}`, 20, y + 20, { size: 9 });
  addText(`Phone: ${companySettings?.phone || '+40 730 040 075'}`, 20, y + 25, { size: 9 });
  addText(`Email: ${companySettings?.email || 'office@rowood.ro'}`, 20, y + 30, { size: 9 });
  addText(`Web: ${companySettings?.website || 'www.rowood.ro'}`, 20, y + 35, { size: 9 });

  // ROWOOD LOGO BOX (right side)
  doc.setDrawColor(22, 163, 74); // Green border
  doc.setLineWidth(2);
  doc.rect(pageWidth - 80, y - 5, 70, 40);
  
  // RoWood text in green
  addText('RoWood', pageWidth - 45, y + 10, { 
    size: 24, 
    weight: 'bold', 
    color: '#16a34a', 
    align: 'center' 
  });
  addText('FERESTRE DIN LEMN', pageWidth - 45, y + 20, { 
    size: 8, 
    color: '#8b4513', 
    align: 'center' 
  });
  addText('www.rowood.ro', pageWidth - 45, y + 28, { 
    size: 7, 
    color: '#666666', 
    align: 'center' 
  });

  y += 50;

  // PROJECT HEADER
  addText('Anexa 1', 20, y, { size: 16, weight: 'bold' });
  y += 10;
  
  const projectTitle = `Proiect: ${order.order_number || order.id.slice(-8).toUpperCase()} - ${order.customer_name.toUpperCase()} / Data: ${format(new Date(order.created_date), 'd.MM.yyyy', { locale: ro })}`;
  addText(projectTitle, pageWidth - 20, y, { size: 9, align: 'right' });
  y += 15;

  // PROCESS EACH PRODUCT
  for (let i = 0; i < cartItems.length; i++) {
    const item = cartItems[i];
    const config = item.configuration || item; // Poate fi o Configuration entity
    const product = relatedData?.products?.find(p => p.id === config.product_id);
    const material = relatedData?.materials?.find(m => m.id === config.material_id);
    const subMaterial = relatedData?.subMaterials?.find(sm => sm.id === config.sub_material_id);
    const color = relatedData?.colors?.find(c => c.id === config.color_id);
    const glazing = relatedData?.glazingTypes?.find(g => g.id === config.glazing_id);

    // Check for page break
    if (y > pageHeight - 80) {
      doc.addPage();
      y = 20;
    }

    // COMPONENT HEADER (blue background)
    doc.setFillColor(173, 216, 230); // Light blue background
    doc.rect(20, y - 2, pageWidth - 40, 8, 'F');
    addText(`00${i + 1} - Componenta 00${i + 1}`, 22, y + 3, { size: 11, weight: 'bold' });
    y += 12;

    // SPECIFICATIONS TABLE cu DIMENSIUNI CORECTE din configurator
    const tableData = [
      ['Dimensiuni:', `${config.width || 1200}mm x ${config.height || 1400}mm`], // DIMENSIUNI CORECTE din config
      ['Serie de Profile:', `${material?.name || 'PVC'} / ${subMaterial?.name || 'Standard'} ${color?.name ? `(${color.name})` : ''}`],
      ['Toc:', `Profil ${material?.name || 'PVC'} ${config.width || 1200}x${config.height || 1400}mm`],
      ['Cercevea:', `Profil ${material?.name || 'PVC'} pentru ${product?.name || 'fereastra'}`],
      ['Feronerie:', `${config.handle_position === 'left' ? 'Maner pe stanga' : 'Maner pe dreapta'} - ${product?.category || 'Standard'}`],
      ['Geam:', `${glazing?.thickness || 24}mm - ${glazing?.name || 'Geam dublu'}`],
      ['Tipul de deschidere:', config.opening_type || 'Oscilo-batant']
    ];

    tableData.forEach((row, rowIndex) => {
      // Gray alternating rows
      if (rowIndex % 2 === 1) {
        doc.setFillColor(245, 245, 245);
        doc.rect(20, y - 2, pageWidth - 40, 6, 'F');
      }
      
      addText(row[0], 22, y + 2, { size: 9, weight: 'bold' });
      addText(row[1], 70, y + 2, { size: 9 });
      y += 6;
    });

    y += 5;

    const sectionStart_y_for_diagram_calc = y;

    // IMAGINEA CORECTĂ din configurator (dacă există)
    if (config.image_url || item.image_url) {
      try {
        const imageUrl = config.image_url || item.image_url;
        if (imageUrl.startsWith('data:image')) {
          doc.addImage(imageUrl, 'PNG', 25, sectionStart_y_for_diagram_calc, 60, 40);
        } else {
          // Pentru URL-uri externe, desenăm diagramă fallback
          drawProductDiagram(25, sectionStart_y_for_diagram_calc, 30, 40, product?.sashes || 1, color?.hex_code, config.opening_type);
        }
      } catch (imageError) {
        console.error("Eroare la adăugarea imaginii în PDF:", imageError);
        // Desenez diagramă fallback dacă imaginea nu merge
        drawProductDiagram(25, sectionStart_y_for_diagram_calc, 30, 40, product?.sashes || 1, color?.hex_code, config.opening_type);
      }
    } else {
      // Fallback la diagramă desenată
      drawProductDiagram(25, sectionStart_y_for_diagram_calc, 30, 40, product?.sashes || 1, color?.hex_code, config.opening_type);
    }

    // CALCULATIONS TABLE (right side) cu PREȚURI CORECTE
    const calcX = 100;
    doc.setFillColor(173, 216, 230);
    doc.rect(calcX, sectionStart_y_for_diagram_calc - 2, 80, 8, 'F');
    addText('Valori Calculate', calcX + 2, sectionStart_y_for_diagram_calc + 3, { size: 10, weight: 'bold' });
    
    const area = ((config.width || 1200) * (config.height || 1400)) / 1000000; // m² CORECT cu dimensiunile din config
    const itemPrice = item.price || config.calculated_price || 0;
    const basePrice = itemPrice / 1.19;
    
    const calcData = [
      ['Tamplarie', `${area.toFixed(3)} mp`, `${basePrice.toFixed(2)} €`],
      ['Geamuri', `${(area * 0.6).toFixed(3)} mp`, `${(basePrice * 0.1).toFixed(2)} €`],
      ['Valoare Unitara', '', `${itemPrice.toFixed(2)} €`],
      ['Cantitate', `${item.quantity || config.quantity || 1} buc`, ''],
      ['Total Produs', '', `${(itemPrice * (item.quantity || config.quantity || 1)).toFixed(2)} €`]
    ];

    calcData.forEach((row, rowIndex) => {
      const rowY = sectionStart_y_for_diagram_calc + 8 + (rowIndex * 5);
      if (rowIndex % 2 === 1) {
        doc.setFillColor(245, 245, 245);
        doc.rect(calcX, rowY - 2, 80, 5, 'F');
      }
      addText(row[0], calcX + 2, rowY + 1, { size: 8, weight: 'bold' });
      addText(row[1], calcX + 25, rowY + 1, { size: 8, align: 'center' });
      addText(row[2], calcX + 75, rowY + 1, { size: 8, align: 'right' });
    });

    y = sectionStart_y_for_diagram_calc + 60;
  }

  // TOTAL SUMMARY
  if (y > pageHeight - 60) {
    doc.addPage();
    y = 20;
  }

  // Total calculations
  const totalAmount = cartItems.reduce((sum, item) => sum + ((item.price || item.configuration?.calculated_price || 0) * (item.quantity || item.configuration?.quantity || 1)), 0);
  const totalWithoutVat = totalAmount / 1.19;
  const totalVat = totalAmount - totalWithoutVat;

  doc.setFillColor(173, 216, 230);
  doc.rect(20, y, pageWidth - 40, 8, 'F');
  addText('Total Oferta', 22, y + 5, { size: 12, weight: 'bold' });
  y += 15;

  const totalData = [
    ['Tamplarie', `${totalWithoutVat.toFixed(2)} €`],
    ['Geamuri', `${(totalWithoutVat * 0.1).toFixed(2)} €`],
    ['Valoare', `${totalWithoutVat.toFixed(2)} €`],
    ['Discount', `${(totalWithoutVat * -0.05).toFixed(2)} €`],
    ['Valoare cu Reducere', `${totalWithoutVat.toFixed(2)} €`],
    ['TVA (19%)', `${totalVat.toFixed(2)} €`],
    ['Total Oferta', `${totalAmount.toFixed(2)} €`]
  ];

  totalData.forEach((row, index) => {
    if (index === totalData.length - 1) {
      doc.setFillColor(22, 163, 74); // Green for final total
      doc.rect(20, y - 1, pageWidth - 40, 6, 'F');
      addText(row[0], 22, y + 3, { size: 11, weight: 'bold', color: '#ffffff' });
      addText(row[1], pageWidth - 22, y + 3, { size: 11, weight: 'bold', color: '#ffffff', align: 'right' });
    } else {
      addText(row[0], 22, y + 3, { size: 10 });
      addText(row[1], pageWidth - 22, y + 3, { size: 10, align: 'right' });
    }
    y += 8;
  });

  y += 10;

  // TERMS AND CONDITIONS
  addText('Termen de livrare: 21-28 zile de la confirmarea comenzii si plata avansului.', 20, y, { size: 9 });
  y += 6;
  addText('50% avans din valoarea lucrarii.', 20, y, { size: 9 });
  y += 6;
  addText('50% cu 5 zile inainte de livrare.', 20, y, { size: 9 });
  y += 6;
  addText('Garantie: 10 ani pentru profile, 2 ani pentru accesorii.', 20, y, { size: 9 });
  y += 6;
  addText('Valabilitatea ofertei: 30 de zile.', 20, y, { size: 9 });

  // FOOTER
  y = pageHeight - 20;
  addText(`Data printarii: ${format(new Date(), 'd.MM.yyyy', { locale: ro })}`, 20, y, { size: 8, color: '#666666' });
  addText(`Proiect: ${order.order_number || order.id.slice(-8).toUpperCase()} - ${order.customer_name.toUpperCase()}`, pageWidth - 20, y, { 
    size: 8, 
    color: '#666666', 
    align: 'right' 
  });

  return doc;
};