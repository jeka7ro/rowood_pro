import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Cookie, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('rowood_cookie_consent');
    if (!consent) {
      // Show banner after 1 second
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('rowood_cookie_consent', 'accepted');
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('rowood_cookie_consent', 'declined');
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6"
        >
          <Card className="max-w-5xl mx-auto bg-white shadow-2xl border-2 border-slate-200">
            <div className="p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Cookie className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                    🍪 Cookie-uri și Confidențialitate
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Folosim cookie-uri și tehnologii similare pentru a îmbunătăți experiența ta pe site, 
                    a analiza traficul și a personaliza conținutul. Datele tale sunt procesate conform 
                    <strong> GDPR</strong> și sunt complet anonimizate.
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={handleAccept}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Accept Cookie-uri
                    </Button>
                    
                    <Button 
                      onClick={handleDecline}
                      variant="outline"
                      className="border-slate-300"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Refuz
                    </Button>
                    
                    <div className="flex-1"></div>
                    
                    <a 
                      href="/privacy-policy" 
                      target="_blank"
                      className="text-sm text-slate-600 hover:text-slate-800 underline self-center"
                    >
                      Politică de confidențialitate
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}