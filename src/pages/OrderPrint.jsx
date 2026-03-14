import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Order, CartItem, Product, Material, SubMaterial, Color, GlazingType, AccessoryOption, HomePageContent } from '@/entities/all';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

export default function OrderPrintPage() {
  const location = useLocation();
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const urlParams = new URLSearchParams(location.search);
  const orderId = urlParams.get('order_id');
  const documentType = urlParams.get('type') || 'order';
  const isProforma = documentType === 'proforma';

  useEffect(() => {
    const loadData = async () => {
      try {
        const [order] = await Order.filter({ id: orderId });
        if (!order) return;

        const configItems = await CartItem.filter({ id: { $in: order.configurations }});
        const [products, materials, subMaterials, colors, glazingTypes, accessories, pageContent] = await Promise.all([
          Product.list(), Material.list(), SubMaterial.list(), Color.list(), GlazingType.list(), AccessoryOption.list(),
          HomePageContent.filter({ language_code: 'ro' }).then(res => res[0] || {})
        ]);

        setOrderData({
          order,
          configItems,
          relatedData: { products, materials, subMaterials, colors, glazingTypes, accessories },
          pageContent
        });
      } catch (error) {
        console.error("Error loading order data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      loadData();
    }
  }, [orderId]);

  useEffect(() => {
    if (!isLoading && orderData) {
      // Auto-deschide dialogul de print după ce datele s-au încărcat
      setTimeout(() => {
        window.print();
      }, 1000);
    }
  }, [isLoading, orderData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-lg">Se încarcă documentul...</div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-lg text-red-600">Eroare la încărcarea comenzii</div>
      </div>
    );
  }

  const { order, configItems, relatedData, pageContent } = orderData;
  const documentTitle = isProforma ? 'FACTURĂ PROFORMA' : 'COMANDĂ';
  const documentNumber = `${isProforma ? 'PF' : 'CMD'}-${order.order_number || order.id.slice(-8).toUpperCase()}`;

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body { margin: 0; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
        }
        
        @media screen {
          body { background: #f5f5f5; padding: 20px; }
          .print-container { 
            max-width: 21cm; 
            margin: 0 auto; 
            background: white; 
            padding: 2cm; 
            box-shadow: 0 0 10px rgba(0,0,0,0.1); 
          }
        }
        
        .print-container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.4;
          color: #333;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e5e5;
        }
        
        .company-info h1 {
          color: #16a34a;
          font-size: 28px;
          margin: 0;
          font-weight: bold;
        }
        
        .company-info p {
          margin: 5px 0;
          color: #666;
        }
        
        .document-info {
          text-align: right;
        }
        
        .document-info h2 {
          font-size: 24px;
          margin: 0;
          color: #333;
        }
        
        .client-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin: 30px 0;
        }
        
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
          padding-bottom: 5px;
          border-bottom: 1px solid #e5e5e5;
        }
        
        .product-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        
        .product-table th,
        .product-table td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
          vertical-align: top;
        }
        
        .product-table th {
          background: #f8f9fa;
          font-weight: bold;
        }
        
        .product-image {
          max-width: 100px;
          max-height: 80px;
          object-fit: cover;
          border-radius: 4px;
        }
        
        .product-details {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
        }
        
        .product-details li {
          margin: 2px 0;
        }
        
        .totals-section {
          margin-top: 30px;
          text-align: right;
        }
        
        .total-line {
          padding: 5px 0;
          display: flex;
          justify-content: space-between;
          max-width: 300px;
          margin-left: auto;
        }
        
        .total-final {
          font-size: 18px;
          font-weight: bold;
          color: #16a34a;
          border-top: 2px solid #e5e5e5;
          padding-top: 10px;
          margin-top: 10px;
        }
        
        .footer-info {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e5e5;
          font-size: 12px;
          color: #666;
        }
        
        .print-instruction {
          background: #e3f2fd;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
          text-align: center;
          color: #1976d2;
          font-weight: bold;
        }
      `}</style>

      <div className="print-instruction no-print">
        Pentru a salva ca PDF: Apăsați Ctrl+P (sau Cmd+P pe Mac), apoi selectați "Save as PDF" ca destinație.
      </div>

      <div className="print-container">
        <div className="header">
          <div className="company-info">
            <h1>RoWood</h1>
            <p>Ferestre și Uși Premium din Lemn</p>
            <p>{pageContent?.contactAddress || 'București, România'}</p>
            {pageContent?.contactPhone && <p>Tel: {pageContent.contactPhone}</p>}
            {pageContent?.contactEmail && <p>Email: {pageContent.contactEmail}</p>}
          </div>
          <div className="document-info">
            <h2>{documentTitle}</h2>
            <p><strong>Nr: {documentNumber}</strong></p>
            <p>Data: {format(new Date(order.created_date), 'd MMMM yyyy', { locale: ro })}</p>
          </div>
        </div>

        <div className="client-section">
          <div>
            <div className="section-title">Date Client:</div>
            <p><strong>{order.customer_name}</strong></p>
            <p>Email: {order.customer_email}</p>
            <p>Telefon: {order.customer_phone}</p>
            {order.company_name && <p>Companie: {order.company_name}</p>}
            {order.cui && <p>CUI: {order.cui}</p>}
            {order.reg_com && <p>Reg. Com.: {order.reg_com}</p>}
          </div>
          <div>
            <div className="section-title">Adresă Livrare:</div>
            <p>{order.delivery_address?.street}</p>
            <p>{order.delivery_address?.city}, {order.delivery_address?.county}</p>
            <p>{order.delivery_address?.postal_code}, România</p>
          </div>
        </div>

        <div className="section-title">Produse Comandate:</div>
        <table className="product-table">
          <thead>
            <tr>
              <th style={{width: '120px'}}>Imagine</th>
              <th>Produs</th>
              <th style={{width: '80px'}}>Cant.</th>
              <th style={{width: '120px'}}>Preț</th>
            </tr>
          </thead>
          <tbody>
            {configItems.map((item, index) => {
              const config = item.configuration;
              const product = relatedData.products?.find(p => p.id === config.product_id);
              const material = relatedData.materials?.find(m => m.id === config.material_id);
              const subMaterial = relatedData.subMaterials?.find(sm => sm.id === config.sub_material_id);
              const color = relatedData.colors?.find(c => c.id === config.color_id);
              const glazing = relatedData.glazingTypes?.find(g => g.id === config.glazing_id);
              const accessories = relatedData.accessories?.filter(a => config.accessories?.includes(a.id));
              
              return (
                <tr key={index}>
                  <td>
                    <img 
                      src={item.image_url || product?.image_urls?.[0] || 'https://via.placeholder.com/100x80?text=Produs'} 
                      alt={product?.name || 'Produs'}
                      className="product-image"
                    />
                  </td>
                  <td>
                    <div style={{fontWeight: 'bold', marginBottom: '8px'}}>{item.product_name}</div>
                    <ul className="product-details" style={{listStyle: 'none', padding: 0, margin: 0}}>
                      <li>📐 Dimensiuni: {config.width}mm × {config.height}mm</li>
                      <li>🏗️ Material: {material?.name}{subMaterial ? ` (${subMaterial.name})` : ''}</li>
                      <li>🎨 Culoare: {color?.name || config.custom_ral_code || 'N/A'}</li>
                      <li>🔍 Sticlă: {glazing?.name || 'N/A'}</li>
                      {accessories?.length > 0 && <li>🔧 Accesorii: {accessories.map(a => a.name).join(', ')}</li>}
                    </ul>
                  </td>
                  <td style={{textAlign: 'center', fontWeight: 'bold'}}>{item.quantity}</td>
                  <td style={{textAlign: 'right', fontWeight: 'bold'}}>
                    {item.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="totals-section">
          <div className="total-line">
            <span>Subtotal (fără TVA):</span>
            <span>{(order.total_amount / 1.21).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
          </div>
          <div className="total-line">
            <span>TVA (21%):</span>
            <span>{(order.total_amount - (order.total_amount / 1.21)).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
          </div>
          <div className="total-line total-final">
            <span>TOTAL:</span>
            <span>{order.total_amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
          </div>
        </div>

        {isProforma && (
          <div className="footer-info">
            <div className="section-title">Condiții Plată:</div>
            <ul>
              <li>Avans 50% la confirmarea comenzii</li>
              <li>Rest 50% la livrare</li>
              <li>Termen de livrare: 3-4 săptămâni de la confirmarea comenzii</li>
            </ul>
          </div>
        )}

        <div className="footer-info">
          <div className="section-title">Note importante:</div>
          <ul>
            {pageContent?.orderInfoPoint1 && <li>{pageContent.orderInfoPoint1}</li>}
            {pageContent?.orderInfoPoint2 && <li>{pageContent.orderInfoPoint2}</li>}
            {pageContent?.orderInfoPoint3 && <li>{pageContent.orderInfoPoint3}</li>}
            {pageContent?.orderInfoPoint4 && <li>{pageContent.orderInfoPoint4}</li>}
          </ul>
        </div>
      </div>
    </>
  );
}