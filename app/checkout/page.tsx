'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useCart } from '@/components/cart-context';
import { useCurrency } from '@/hooks/use-currency';
import { formatPrice } from '@/lib/configurator';
import { supabase } from '@/lib/supabase';
import {
  Home, Building2, Check, ArrowRight, Shield, Package, Loader2,
  User, Phone, Mail, CreditCard, Banknote,
} from 'lucide-react';

const GOVERNORATES = [
  'Muscat', 'Dhofar', 'Musandam', 'Al Batinah North', 'Al Batinah South',
  'Al Buraimi', 'Al Dakhiliyah', 'Al Dhahirah', 'Al Sharqiyah North',
  'Al Sharqiyah South', 'Al Wusta',
];

const SHIPPING_COSTS: Record<string, number> = {
  'Muscat': 2, 'Dhofar': 4, 'Musandam': 4, 'Al Batinah North': 2.5,
  'Al Batinah South': 2.5, 'Al Buraimi': 3, 'Al Dakhiliyah': 3,
  'Al Dhahirah': 3.5, 'Al Sharqiyah North': 3.5, 'Al Sharqiyah South': 3.5,
  'Al Wusta': 5,
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { currencyCode } = useCurrency();
  const fmt = (omr: number) => formatPrice(omr, currencyCode);

  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [form, setForm] = useState({
    name: '', phone: '', email: '', governorate: 'Muscat', city: '', address: '',
    shippingMethod: 'home_delivery', paymentMethod: 'cash_on_delivery', notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const shippingCost = SHIPPING_COSTS[form.governorate] || 3;
  const grandTotal = totalPrice + shippingCost;

  useEffect(() => {
    if (items.length === 0 && !orderComplete) {
      router.push('/shop');
    }
  }, [items.length, orderComplete, router]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    else if (!/^[0-9+\-\s]{8,15}$/.test(form.phone.trim())) e.phone = 'Invalid phone';
    if (!form.address.trim()) e.address = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const placeOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);

    try {
      const { data: customer } = await supabase
        .from('customers').select('id').eq('phone', form.phone).maybeSingle();
      let customerId = customer?.id;

      if (!customerId) {
        const { data: newCustomer } = await supabase
          .from('customers').insert({
            name: form.name, phone: form.phone, email: form.email || null,
            governorate: form.governorate, city: form.city || null, address: form.address,
          }).select().single();
        customerId = newCustomer?.id;
      } else {
        await supabase.from('customers').update({
          name: form.name, email: form.email || null,
          governorate: form.governorate, city: form.city || null,
          address: form.address, updated_at: new Date().toISOString(),
        }).eq('id', customerId);
      }

      const { data: order, error: orderError } = await supabase
        .from('orders').insert({
          customer_id: customerId, customer_name: form.name,
          customer_phone: form.phone, customer_email: form.email || null,
          governorate: form.governorate, city: form.city || null, address: form.address,
          shipping_method: form.shippingMethod, shipping_agent: 'جيناكم',
          payment_method: form.paymentMethod, subtotal: totalPrice,
          shipping_cost: shippingCost, total: grandTotal, status: 'pending',
          notes: form.notes || null,
        }).select().single();

      if (orderError) throw orderError;
      setOrderId(order.id);

      const orderItems = items.map(item => ({
        order_id: order.id, product_name: item.name, product_id: item.id,
        quantity: item.qty, unit_price: item.price, config: item.config || null,
      }));
      await supabase.from('order_items').insert(orderItems);

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      await fetch(`${supabaseUrl}/functions/v1/pushover-notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name, customer_phone: form.phone, customer_email: form.email,
          governorate: form.governorate, city: form.city, address: form.address,
          shipping_method: form.shippingMethod, shipping_agent: 'جيناكم',
          payment_method: form.paymentMethod, subtotal: totalPrice,
          shipping_cost: shippingCost, total: grandTotal,
          items: items.map(i => ({ product_name: i.name, unit_price: i.price, quantity: i.qty, config: i.config })),
          order_id: order.id,
        }),
      });

      clearCart();
      setOrderComplete(true);
    } catch (err) {
      alert('Failed to place order. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <>
        <Navigation />
        <main className="pt-16 min-h-screen bg-background flex items-center justify-center px-6 pb-16 md:pb-0">
          <div className="max-w-md text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-fluid-heading font-display text-foreground mb-3">Order placed!</h1>
            <p className="text-sm text-muted-foreground mb-2">We&apos;ve received your order and sent you a confirmation.</p>
            <p className="text-xs text-muted-foreground mb-6">Order ID: <span className="font-mono font-semibold text-foreground">{orderId.slice(0, 8)}</span></p>
            <p className="text-sm text-muted-foreground mb-8">We&apos;ll contact you on <span className="font-semibold text-foreground">{form.phone}</span> to confirm delivery details.</p>
            <button onClick={() => router.push('/shop')} className="btn-primary">Continue shopping <ArrowRight className="w-4 h-4" /></button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="pt-16 min-h-screen bg-background pb-16 md:pb-0">
        <div className="section-padding">
          <div className="container-wide">
            <div className="mb-8">
              <h1 className="text-fluid-heading font-display text-foreground">Checkout</h1>
              <p className="text-sm text-muted-foreground mt-1">Delivery within Oman only · Shipping via جيناكم</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-7 h-7 rounded-full bg-[#F9733E] text-white text-xs font-bold flex items-center justify-center">1</div>
                    <h2 className="text-heading-md font-heading font-semibold text-foreground">Contact details</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Full name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type="text" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} className="forge-input pl-10" placeholder="Your name" />
                      </div>
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Phone *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type="tel" value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} className="forge-input pl-10" placeholder="+968 12345678" />
                      </div>
                      {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Email (optional)</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type="email" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} className="forge-input pl-10" placeholder="you@email.com" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-7 h-7 rounded-full bg-[#F9733E] text-white text-xs font-bold flex items-center justify-center">2</div>
                    <h2 className="text-heading-md font-heading font-semibold text-foreground">Shipping address</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Governorate *</label>
                      <select value={form.governorate} onChange={e => setForm(prev => ({ ...prev, governorate: e.target.value }))} className="forge-input">
                        {GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">City / Area</label>
                      <input type="text" value={form.city} onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))} className="forge-input" placeholder="e.g. Ruwi, Seeb, Salalah..." />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Address *</label>
                      <textarea value={form.address} onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))} className="forge-input min-h-[80px] resize-y" placeholder="Building number, street name, nearest landmark..." />
                      {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-7 h-7 rounded-full bg-[#F9733E] text-white text-xs font-bold flex items-center justify-center">3</div>
                    <h2 className="text-heading-md font-heading font-semibold text-foreground">Shipping method</h2>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">All deliveries handled by <span className="font-semibold text-foreground">جيناكم</span></p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button onClick={() => setForm(prev => ({ ...prev, shippingMethod: 'home_delivery' }))} className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${form.shippingMethod === 'home_delivery' ? 'border-[#F9733E] bg-[#F9733E]/5' : 'border-border hover:border-foreground/30'}`}>
                      <Home className={`w-5 h-5 mt-0.5 ${form.shippingMethod === 'home_delivery' ? 'text-[#F9733E]' : 'text-muted-foreground'}`} />
                      <div><p className="text-sm font-semibold text-foreground">Home delivery</p><p className="text-xs text-muted-foreground mt-0.5">Delivered to your door</p></div>
                    </button>
                    <button onClick={() => setForm(prev => ({ ...prev, shippingMethod: 'office_pickup' }))} className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${form.shippingMethod === 'office_pickup' ? 'border-[#F9733E] bg-[#F9733E]/5' : 'border-border hover:border-foreground/30'}`}>
                      <Building2 className={`w-5 h-5 mt-0.5 ${form.shippingMethod === 'office_pickup' ? 'text-[#F9733E]' : 'text-muted-foreground'}`} />
                      <div><p className="text-sm font-semibold text-foreground">Office pickup</p><p className="text-xs text-muted-foreground mt-0.5">Nearest جيناكم office</p></div>
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-7 h-7 rounded-full bg-[#F9733E] text-white text-xs font-bold flex items-center justify-center">4</div>
                    <h2 className="text-heading-md font-heading font-semibold text-foreground">Payment method</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button onClick={() => setForm(prev => ({ ...prev, paymentMethod: 'bank_transfer' }))} className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${form.paymentMethod === 'bank_transfer' ? 'border-[#F9733E] bg-[#F9733E]/5' : 'border-border hover:border-foreground/30'}`}>
                      <CreditCard className={`w-5 h-5 mt-0.5 ${form.paymentMethod === 'bank_transfer' ? 'text-[#F9733E]' : 'text-muted-foreground'}`} />
                      <div><p className="text-sm font-semibold text-foreground">Bank transfer</p><p className="text-xs text-muted-foreground mt-0.5">Transfer to our bank account</p></div>
                    </button>
                    <button onClick={() => setForm(prev => ({ ...prev, paymentMethod: 'cash_on_delivery' }))} className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${form.paymentMethod === 'cash_on_delivery' ? 'border-[#F9733E] bg-[#F9733E]/5' : 'border-border hover:border-foreground/30'}`}>
                      <Banknote className={`w-5 h-5 mt-0.5 ${form.paymentMethod === 'cash_on_delivery' ? 'text-[#F9733E]' : 'text-muted-foreground'}`} />
                      <div><p className="text-sm font-semibold text-foreground">Cash on delivery</p><p className="text-xs text-muted-foreground mt-0.5">Pay when you receive</p></div>
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6">
                  <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Order notes (optional)</label>
                  <textarea value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} className="forge-input min-h-[60px] resize-y" placeholder="Any special instructions..." />
                </div>
              </div>

              <div className="lg:sticky lg:top-24 self-start">
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="p-6 border-b border-border bg-muted/30">
                    <h2 className="text-heading-md font-heading font-bold text-foreground">Order summary</h2>
                  </div>
                  <div className="p-6 space-y-3 max-h-[300px] overflow-y-auto">
                    {items.map(item => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                          {item.config && <p className="text-xs text-muted-foreground">{Object.entries(item.config).filter(([, v]) => v).map(([, v]) => v).join(' · ')}</p>}
                          <p className="text-xs text-muted-foreground">× {item.qty}</p>
                        </div>
                        <span className="price-tag text-sm text-foreground flex-shrink-0">{fmt(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 border-t border-border space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-semibold text-foreground">{fmt(totalPrice)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping ({form.governorate})</span><span className="font-semibold text-foreground">{fmt(shippingCost)}</span></div>
                    <div className="flex justify-between pt-2 border-t border-border"><span className="text-base font-bold text-foreground">Total</span><span className="price-tag text-xl text-[#F9733E]">{fmt(grandTotal)}</span></div>
                  </div>
                  <div className="p-6 border-t border-border">
                    <button onClick={placeOrder} disabled={submitting || items.length === 0} className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed">
                      {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing order...</> : <>Place order · {fmt(grandTotal)}</>}
                    </button>
                    <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                      <Shield className="w-3.5 h-3.5 text-[#F9733E]" /> No card needed · Pay by transfer or cash on delivery
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
