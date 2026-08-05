'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import {
  Plus, Trash2, Edit2, X, Search, Package, AlertTriangle, Check, XCircle,
  ChevronDown,
} from 'lucide-react';

interface FilamentCompany { id: string; name: string; }
interface Filament {
  id: string; company_id: string | null; company_name: string;
  material: string; color_name: string; color_hex: string; cost: number;
  grams_remaining: number; grams_total: number; image_url: string | null;
  is_active: boolean; created_at: string;
}

const MATERIALS = ['PLA', 'PLA+', 'ABS', 'ASA', 'PETG', 'TPU', 'Nylon', 'PC', 'PVA', 'HIPS', 'Wood-fill', 'Carbon Fiber'];

function getStockStatus(grams: number) {
  if (grams <= 0) return { label: 'Out of stock', color: 'text-red-600 bg-red-50', icon: XCircle };
  if (grams <= 200) return { label: 'Low stock', color: 'text-amber-600 bg-amber-50', icon: AlertTriangle };
  return { label: 'Available', color: 'text-green-600 bg-green-50', icon: Check };
}

export default function FilamentAdminPage() {
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [companies, setCompanies] = useState<FilamentCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    company_id: '', company_name: '', material: 'PLA', color_name: '', color_hex: '#F9733E',
    cost: '', grams_remaining: '1000', grams_total: '1000', image_url: '', is_active: true,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    const [filRes, compRes] = await Promise.all([
      supabase.from('filaments').select('*').order('created_at', { ascending: false }),
      supabase.from('filament_companies').select('*').order('name'),
    ]);
    if (filRes.data) setFilaments(filRes.data);
    if (compRes.data) setCompanies(compRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const resetForm = () => {
    setForm({ company_id: '', company_name: '', material: 'PLA', color_name: '', color_hex: '#F9733E', cost: '', grams_remaining: '1000', grams_total: '1000', image_url: '', is_active: true });
    setEditingId(null); setShowForm(false);
  };

  const handleCompanySelect = (companyId: string) => {
    if (companyId === 'custom') { setForm(prev => ({ ...prev, company_id: '', company_name: '' })); return; }
    const company = companies.find(c => c.id === companyId);
    setForm(prev => ({ ...prev, company_id: companyId, company_name: company?.name || '' }));
  };

  const save = async () => {
    if (!form.color_name.trim() || !form.company_name.trim()) return;
    const payload = {
      company_id: form.company_id || null, company_name: form.company_name,
      material: form.material, color_name: form.color_name, color_hex: form.color_hex,
      cost: parseFloat(form.cost) || 0, grams_remaining: parseInt(form.grams_remaining) || 0,
      grams_total: parseInt(form.grams_total) || 1000, image_url: form.image_url || null,
      is_active: form.is_active,
    };
    if (editingId) {
      await supabase.from('filaments').update(payload).eq('id', editingId);
    } else {
      if (!form.company_id && form.company_name) {
        const { data: newComp } = await supabase.from('filament_companies').insert({ name: form.company_name }).select().single();
        if (newComp) payload.company_id = newComp.id;
      }
      await supabase.from('filaments').insert(payload);
    }
    resetForm(); loadData();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this filament?')) return;
    await supabase.from('filaments').delete().eq('id', id);
    loadData();
  };

  const edit = (f: Filament) => {
    setEditingId(f.id);
    setForm({ company_id: f.company_id || '', company_name: f.company_name || '', material: f.material, color_name: f.color_name, color_hex: f.color_hex, cost: String(f.cost), grams_remaining: String(f.grams_remaining), grams_total: String(f.grams_total), image_url: f.image_url || '', is_active: f.is_active });
    setShowForm(true);
  };

  const filtered = filaments.filter(f => {
    const q = search.toLowerCase();
    return f.color_name.toLowerCase().includes(q) || f.company_name?.toLowerCase().includes(q) || f.material.toLowerCase().includes(q);
  });

  return (
    <>
      <Navigation />
      <main className="pt-16 min-h-screen bg-background pb-16 md:pb-0">
        <div className="section-padding">
          <div className="container-wide">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-fluid-heading font-display text-foreground">Filament Inventory</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage your filament stock. Changes appear instantly on the storefront.</p>
              </div>
              <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary"><Plus className="w-4 h-4" /> Add Filament</button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search by color, company, or material..." value={search} onChange={e => setSearch(e.target.value)} className="forge-input pl-10" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <StatCard label="Total Filaments" value={String(filaments.length)} icon={Package} />
              <StatCard label="Available" value={String(filaments.filter(f => f.grams_remaining > 200).length)} icon={Check} color="text-green-600" />
              <StatCard label="Low Stock" value={String(filaments.filter(f => f.grams_remaining > 0 && f.grams_remaining <= 200).length)} icon={AlertTriangle} color="text-amber-600" />
              <StatCard label="Out of Stock" value={String(filaments.filter(f => f.grams_remaining <= 0).length)} icon={XCircle} color="text-red-600" />
            </div>

            {loading ? (
              <div className="text-center py-20 text-muted-foreground">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No filaments found. Add your first one!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(f => {
                  const stock = getStockStatus(f.grams_remaining);
                  return (
                    <div key={f.id} className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-forge transition-all duration-300">
                      <div className="flex gap-4 p-4">
                        <div className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden border border-border" style={{ backgroundColor: f.color_hex }}>
                          {f.image_url && <img src={f.image_url} alt={f.color_name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-sm font-semibold text-foreground truncate">{f.color_name}</h3>
                              <p className="text-xs text-muted-foreground">{f.company_name} · {f.material}</p>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => edit(f)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-[#F9733E] transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => remove(f.id)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${stock.color}`}><stock.icon className="w-3 h-3" />{stock.label}</span>
                            <span className="text-xs text-muted-foreground">{f.grams_remaining}g / {f.grams_total}g</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="price-tag text-sm text-[#F9733E]">{f.cost} OMR</span>
                            {!f.is_active && <span className="text-[10px] text-muted-foreground font-semibold">HIDDEN</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={resetForm}>
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
                <h2 className="text-lg font-heading font-bold text-foreground">{editingId ? 'Edit Filament' : 'Add Filament'}</h2>
                <button onClick={resetForm} className="p-2 rounded-lg hover:bg-muted transition-colors"><X className="w-5 h-5 text-foreground" /></button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">Company</label>
                  <div className="relative">
                    <select value={form.company_id || (form.company_name && !companies.find(c => c.id === form.company_id) ? 'custom' : '')} onChange={e => handleCompanySelect(e.target.value)} className="forge-input appearance-none pr-10">
                      <option value="">Select a company...</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      <option value="custom">+ Add custom company</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {(!form.company_id && form.company_name !== undefined) && <input type="text" placeholder="Enter custom company name" value={form.company_name} onChange={e => setForm(prev => ({ ...prev, company_name: e.target.value }))} className="forge-input mt-2" />}
                  {form.company_id && <input type="text" value={form.company_name} readOnly className="forge-input mt-2 opacity-60" />}
                </div>
                <div>
                  <label className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">Material</label>
                  <div className="relative">
                    <select value={form.material} onChange={e => setForm(prev => ({ ...prev, material: e.target.value }))} className="forge-input appearance-none pr-10">
                      {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">Color name</label>
                    <input type="text" placeholder="e.g. Silk Orange" value={form.color_name} onChange={e => setForm(prev => ({ ...prev, color_name: e.target.value }))} className="forge-input" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">Color hex</label>
                    <div className="flex gap-2">
                      <input type="color" value={form.color_hex} onChange={e => setForm(prev => ({ ...prev, color_hex: e.target.value }))} className="w-12 h-11 rounded-lg border border-border cursor-pointer" />
                      <input type="text" value={form.color_hex} onChange={e => setForm(prev => ({ ...prev, color_hex: e.target.value }))} className="forge-input flex-1" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">Cost (OMR)</label><input type="number" step="0.001" placeholder="0.000" value={form.cost} onChange={e => setForm(prev => ({ ...prev, cost: e.target.value }))} className="forge-input" /></div>
                  <div><label className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">Remaining (g)</label><input type="number" placeholder="1000" value={form.grams_remaining} onChange={e => setForm(prev => ({ ...prev, grams_remaining: e.target.value }))} className="forge-input" /></div>
                  <div><label className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">Total (g)</label><input type="number" placeholder="1000" value={form.grams_total} onChange={e => setForm(prev => ({ ...prev, grams_total: e.target.value }))} className="forge-input" /></div>
                </div>
                <div>
                  <label className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">Image URL (optional)</label>
                  <input type="text" placeholder="https://..." value={form.image_url} onChange={e => setForm(prev => ({ ...prev, image_url: e.target.value }))} className="forge-input" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <button type="button" onClick={() => setForm(prev => ({ ...prev, is_active: !prev.is_active }))} className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? 'bg-[#F9733E]' : 'bg-muted'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${form.is_active ? 'translate-x-5' : ''}`} />
                  </button>
                  <span className="text-sm text-foreground">Show on storefront</span>
                </label>
              </div>
              <div className="p-6 border-t border-border flex gap-3 sticky bottom-0 bg-card">
                <button onClick={resetForm} className="btn-secondary flex-1">Cancel</button>
                <button onClick={save} className="btn-primary flex-1">{editingId ? 'Save Changes' : 'Add Filament'}</button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: typeof Package; color?: string }) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color || 'text-muted-foreground'}`} />
        <span className="text-xs text-muted-foreground font-semibold">{label}</span>
      </div>
      <p className="text-2xl font-display font-bold text-foreground">{value}</p>
    </div>
  );
}
