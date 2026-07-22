'use client';

import { useCart } from '@/components/cart-context';
import { useCurrency } from '@/hooks/use-currency';
import { formatPrice } from '@/lib/configurator';
import { X, ShoppingBag, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { useEffect } from 'react';

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQty, removeItem, totalPrice, totalItems, clearCart } = useCart();
  const { currencyCode } = useCurrency();
  const fmt = (omr: number) => formatPrice(omr, currencyCode);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-[61] w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#F9733E]" />
            <h2 className="text-heading-sm font-heading font-bold text-foreground">
              Your Cart {totalItems > 0 && <span className="text-muted-foreground font-normal">({totalItems})</span>}
            </h2>
          </div>
          <button onClick={closeCart} className="p-2 rounded-md hover:bg-muted transition-colors" aria-label="Close cart">
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <ShoppingCart className="w-7 h-7 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Your cart is empty</p>
                <p className="text-xs text-muted-foreground mt-1">Configure a trainer and add it to your cart.</p>
              </div>
              <button onClick={closeCart} className="btn-primary text-sm">Browse trainers</button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 p-3 rounded-lg border border-border bg-card">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{item.name}</h3>
                    {item.config && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {Object.entries(item.config)
                          .filter(([, v]) => v)
                          .map(([, v]) => v)
                          .join(' · ')}
                      </p>
                    )}
                    <p className="text-sm font-bold text-[#F9733E] mt-1">{fmt(item.price)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
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
                        className="w-7 h-7 flex items-center justify-center rounded-md border border-border hover:border-[#F9733E] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-semibold text-foreground w-6 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-md border border-border hover:border-[#F9733E] transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={clearCart} className="text-xs text-muted-foreground hover:text-red-500 transition-colors">
                Clear cart
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="price-tag text-xl text-foreground">{fmt(totalPrice)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Shipping calculated at checkout. Made to order in Oman.</p>
            <button className="btn-primary w-full justify-center">
              Checkout · {fmt(totalPrice)}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
