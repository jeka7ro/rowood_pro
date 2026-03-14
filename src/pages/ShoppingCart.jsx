import React, { useState, useEffect, useCallback } from 'react';

// Cheie de cart per utilizator — fiecare user are coșul lui separat
const getCartKey = () => {
  try {
    const session = JSON.parse(localStorage.getItem('local_auth_session') || 'null');
    if (session?.email) return `cart_${session.email}`;
  } catch {}
  return 'guestCart';
};
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Loader2, ShoppingCart, Trash2, Plus, Minus, ArrowRight, ArrowLeft, LogIn, Ruler, Receipt } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useTranslation } from '../components/translations/TranslationProvider';
import { useAuth } from '@/lib/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ShoppingCartPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth(); // Use auth context instead of re-fetching
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransferring, setIsTransferring] = useState(false);

  // New state for delete confirmation dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState(null);

  const transferGuestCartToDatabase = useCallback(async (currentUser) => {
    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
    if (guestCart.length === 0) return [];

    setIsTransferring(true);
    try {
      const transferPromises = guestCart.map(async (item) => {
        // Ensure that we only create a new CartItem if the product_id and configuration are not already in the user's cart
        // This is a simplified check, a more robust solution would involve checking for existing items in DB before creating.
        const { id, created_date, ...itemData } = item; // Eliminăm id-ul temporar
        return await CartItem.create({ ...itemData, created_by: currentUser.email });
      });
      
      const transferredItems = await Promise.all(transferPromises);
      
      // Șterge din localStorage după transfer
      localStorage.removeItem('guestCart');
      
      return transferredItems;
    } catch (error) {
      console.error('Failed to transfer guest cart:', error);
      return [];
    } finally {
      setIsTransferring(false);
    }
  }, []); // No dependencies needed as state setters (setIsTransferring) are stable and CartItem.create is external.

  const loadCartData = useCallback(async () => {
    setIsLoading(true);
    try {
      const cartKey = getCartKey();
      const storedCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
      setCartItems(storedCart);
    } catch (error) {
      console.error('Error loading cart data:', error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCartData();
  }, [loadCartData]);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    const cartKey = getCartKey();
    const storedCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    const updatedCart = storedCart.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    localStorage.setItem(cartKey, JSON.stringify(updatedCart));
    setCartItems(updatedCart);
  };

  const deleteItemConfirmed = async (itemId) => {
    const cartKey = getCartKey();
    const storedCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    const updatedCart = storedCart.filter(item => item.id !== itemId);
    localStorage.setItem(cartKey, JSON.stringify(updatedCart));
    setCartItems(updatedCart);
  };

  // This function is called when the user clicks the delete button, initiating the confirmation flow
  const handleDeleteClick = (itemId) => {
    setItemToDeleteId(itemId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDeleteId) {
      await deleteItemConfirmed(itemToDeleteId);
      setItemToDeleteId(null);
      setDeleteConfirmOpen(false);
    }
  };

  const handleLogin = () => {
    window.location.href = `/login?from_url=${encodeURIComponent(window.location.origin + '/ShoppingCart')}`;
  };

  const handleProceedToCheckout = () => {
    navigate(createPageUrl("Checkout"));
  };

  // Calculations for order summary
  const totalWithVat = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const vatRate = 0.21; // Changed from 19% to 21%
  const subtotal = totalWithVat / (1 + vatRate);
  const vat = totalWithVat - subtotal;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 min-h-screen bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('cart.title')}</h1>
          <p className="text-slate-600 dark:text-slate-400">
            {cartItems.length === 0 
              ? t('cart.empty') 
              : `${cartItems.length} ${cartItems.length === 1 ? t('cart.product') : t('cart.products')}`}
          </p>
          
          {isTransferring && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 dark:bg-blue-900/20 dark:border-blue-700">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                <p className="text-blue-800 dark:text-blue-200">{t('cart.transferring')}</p>
              </div>
            </div>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700">
            <ShoppingCart className="w-20 h-20 mx-auto text-slate-300 dark:text-slate-600 mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t('cart.empty')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              {t('cart.emptyDescription')}
            </p>
            <Link to={createPageUrl("Configurator")}>
              <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8 rounded-xl">
                {t('cart.startConfiguration')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="w-32 h-32 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {(item.image_url || item.configuration?.image_url) ? (
                          <img
                            src={item.image_url || item.configuration?.image_url}
                            alt={item.product_name}
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          // Fallback: render a simple SVG window preview from configuration data
                          (() => {
                            const cfg = item.configuration;
                            const sashes = cfg?.sash_configs?.length || 1;
                            const w = 110, h = 110, pad = 6, thick = 4;
                            const innerW = (w - pad * 2 - thick * 2);
                            const innerH = (h - pad * 2 - thick * 2);
                            const sashW = innerW / sashes;
                            return (
                              <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
                                {/* Frame */}
                                <rect x={pad} y={pad} width={w - pad*2} height={h - pad*2} rx="4" fill="none" stroke="#64748b" strokeWidth={thick} />
                                {/* Sashes */}
                                {Array.from({ length: sashes }).map((_, i) => (
                                  <g key={i}>
                                    <rect
                                      x={pad + thick + i * sashW + (i > 0 ? 2 : 0)}
                                      y={pad + thick}
                                      width={sashW - (i > 0 ? 2 : 0)}
                                      height={innerH}
                                      rx="2"
                                      fill="rgba(147,197,253,0.3)"
                                      stroke="#94a3b8"
                                      strokeWidth="2"
                                    />
                                    {/* Cross bar */}
                                    <line
                                      x1={pad + thick + i * sashW + (i > 0 ? 2 : 0)}
                                      y1={pad + thick + innerH / 2}
                                      x2={pad + thick + (i + 1) * sashW}
                                      y2={pad + thick + innerH / 2}
                                      stroke="#94a3b8" strokeWidth="1.5"
                                    />
                                  </g>
                                ))}
                              </svg>
                            );
                          })()
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                            {item.product_name}
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(item.id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 ml-4 flex-shrink-0"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>

                        <div className="space-y-2 mb-4">
                          {item.configuration?.width && item.configuration?.height && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                              <Ruler className="w-4 h-4" />
                              {item.configuration.width}mm × {item.configuration.height}mm
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2 border border-slate-200 dark:border-slate-700">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="h-8 w-8 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="text-lg font-bold text-slate-900 dark:text-slate-100 min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                              €{(item.price * item.quantity).toLocaleString('de-DE', { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                €{item.price.toLocaleString('de-DE', { 
                                  minimumFractionDigits: 2, 
                                  maximumFractionDigits: 2 
                                })} {t('cart.perPiece')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg rounded-3xl sticky top-8">
                <CardHeader className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700 p-6">
                  <CardTitle className="text-2xl text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Receipt className="w-6 h-6" />
                    {t('cart.orderSummary')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-base">
                      <span className="text-slate-600 dark:text-slate-400">{t('subtotal')}:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        €{subtotal.toLocaleString('de-DE', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-base">
                      <span className="text-slate-600 dark:text-slate-400">{t('vat')}:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        €{vat.toLocaleString('de-DE', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </span>
                    </div>
                    <div className="h-px bg-slate-200 dark:bg-slate-700"></div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('total')}:</span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        €{totalWithVat.toLocaleString('de-DE', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </span>
                    </div>
                  </div>

                  {(user || isAuthenticated) ? (
                    <Button
                      onClick={handleProceedToCheckout} // Changed to onClick to align with outline
                      size="lg"
                      className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg py-6"
                    >
                      {t('cart.proceedToCheckout')}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleLogin}
                      size="lg"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg py-6"
                    >
                      <LogIn className="w-5 h-5 mr-2" />
                      {t('cart.loginToOrder')}
                    </Button>
                  )}

                  <Link to={createPageUrl("Configurator")}>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-base py-6"
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      {t('cart.continueConfiguration')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-slate-100">{t('cart.confirmDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {t('cart.confirmDeleteMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}