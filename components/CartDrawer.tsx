'use client';

import { useCart } from '@/components/cart-context';
import { useCurrency } from '@/hooks/use-currency';
import { formatPrice } from '@/lib/configurator';
import { X, ShoppingBag, Plus, Minus, Trash2, ShoppingCart, MessageCircle } from 'lucide-react';
import { useEffect } from 'react';

const WHATSAPP_NUMBER = '96891232926';

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQty, removeItem, totalPrice, totalItems, clearCart } = useCart();
  const { currencyCode } = useCurrency();
  const fmt = (omr: number) => formatPrice(omr, currencyCode);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  function handleCheckout() {
    const lines = items.map((item, i) => {
      const configStr = item.config
        ? Object.entries(item.config).filter(([, v]) => v).map(([, v]) => v).join(' · ')
        : '';
      return `${i + 1}. ${item.name}${configStr ? ` (${configStr})` : ''} — ${fmt(item.price)} × ${item.qty}`;
    });

    const buildLinks = items
      .filter(i => i.url)
      .map((i, idx) => `Build ${idx + 1}: ${i.url}`)
      .join('\n');

    const message =
      `Hello Twin Forge Co., I'd like to order:\n\n` +
      lines.join('\n') +
      `\n\nTotal: ${fmt(totalPrice)}` +
      (buildLinks ? `\n\nBuild links:\n${buildLinks}` : '') +
      `\n\nPlease confirm availability and payment details. Thank you!`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />

      <aside
        className={`fixed top-0 right-0 bottom-0 z-[61] w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#F9733E]" />
            <h2 className="text-base font-semibold text-foreground">
              Your Cart {totalItems > 0 && <span className="text-muted-foreground font-normal">({totalItems})</span>}
            </h2>
          </div>
          <button onClick={closeCart} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Close cart">
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <ShoppingCart className="w-7 h-7 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Your cart is empty</p>
                <p className="text-xs text-muted-foreground mt-1">Configure a trainer and add it here.</p>
              </div>
              <button onClick={closeCart} className="btn-primary text-sm">Browse trainers</button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 p-3.5 rounded-xl border border-border bg-card/50">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground truncate">{item.name}</h3>
                    {item.config && (
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {Object.entries(item.config)
                          .filter(([, v]) => v)
                          .map(([, v]) => v)
                          .join(' · ')}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-[#F9733E] mt-1.5">{fmt(item.price)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-red-500 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-border hover:border-[#F9733E] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium text-foreground w-6 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-border hover:border-[#F9733E] transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={clearCart} className="text-xs text-muted-foreground hover:text-red-500 transition-colors pt-1">
                Clear cart
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-xl font-semibold text-foreground">{fmt(totalPrice)}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Checkout sends your order details and build links via WhatsApp to confirm availability and arrange payment.
            </p>
            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1da851] text-white font-medium text-sm py-3.5 rounded-xl transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Checkout via WhatsApp
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
