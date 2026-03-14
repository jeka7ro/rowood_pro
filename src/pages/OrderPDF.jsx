import React, { useEffect, useState } from 'react';
import { Order, CartItem, Product, Material, SubMaterial, Color, GlazingType, AccessoryOption, CompanySettings } from '@/entities/all';
import { generateOrderConfirmationPDF } from '../components/utils/pdfGenerator';

export default function OrderPDFPage() {
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const generatePDF = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('order_id');
        const type = urlParams.get('type') || 'order'; // 'order' or 'proforma'
        
        if (!orderId) {
          console.error('No order ID provided');
          window.close();
          return;
        }

        // Load all necessary data
        const [
          order,
          cartItems,
          products,
          materials,
          subMaterials,
          colors,
          glazingTypes,
          accessories,
          companySettingsRes
        ] = await Promise.all([
          Order.get(orderId),
          CartItem.filter({ order_id: orderId }),
          Product.list(),
          Material.list(),
          SubMaterial.list(),
          Color.list(),
          GlazingType.list(),
          AccessoryOption.list(),
          CompanySettings.list()
        ]);

        if (!order) {
          console.error('Order not found');
          window.close();
          return;
        }

        const companySettings = companySettingsRes[0] || null;
        const relatedData = { products, materials, subMaterials, colors, glazingTypes, accessories };

        // Process cart items with proper image URLs
        const processedItems = cartItems.map(item => {
          const realProduct = products.find(p => p.id === item.product_id);
          return {
            ...item,
            product_name: realProduct?.name || item.product_name,
            display_image_url: item.configuration?.image_url || 
                              realProduct?.configurator_image_urls?.[0] || 
                              realProduct?.image_urls?.[0] || 
                              item.image_url
          };
        });

        // Generate PDF
        const pdfDoc = await generateOrderConfirmationPDF(
          order,
          processedItems,
          relatedData,
          companySettings,
          type === 'proforma'
        );

        // Download the PDF
        const fileName = `${type === 'proforma' ? 'Factura_Proforma' : 'Comanda'}_RoWood_${order.order_number || order.id.slice(-8)}.pdf`;
        pdfDoc.save(fileName);

        // Close the window/tab after download
        setTimeout(() => {
          window.close();
        }, 1000);

      } catch (error) {
        console.error('PDF generation failed:', error);
        alert('A apărut o eroare la generarea PDF-ului.');
        window.close();
      } finally {
        setIsGenerating(false);
      }
    };

    generatePDF();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        {isGenerating ? (
          <>
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-gray-700">Se generează PDF-ul...</p>
            <p className="text-sm text-gray-500">Descărcarea va începe automat</p>
          </>
        ) : (
          <p className="text-lg text-gray-700">PDF generat cu succes!</p>
        )}
      </div>
    </div>
  );
}