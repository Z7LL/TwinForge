'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import {
  Plus, Trash2, Edit2, X, Search, Package, Save, ChevronDown, Layers, Settings, Coins,
} from 'lucide-react';

interface Filament {
  id: string;
  color_name: string;
  color_hex: string;
  company_name: string;
}

interface ProductComponent {
  id: string;
  component_type: string;
  component_option: string;
  filament_id: string | null;
  price: number;
  is_active: boolean;
}

interface ProductSetting {
  id: string;
  key: string;
  value: number;
  label: string | null;
}

const COMPONENT_TYPES = [
  { value: 'handle', label: 'Handle', options: ['Honeycomb', 'Arrow', 'Skeleton', 'Solid'] },
  { value: 'blade', label: 'Blade', options: ['Trainer Blade', 'Sharp Blade', 'Decorative Blade'] },
  { value: 'screws', label: 'Screws', options: ['Standard Screws', 'Premium Screws'] },
  { value: 'weight', label: 'Weight', options: ['Light', 'Standard', 'Heavy'] },
];

export default function ProductPricingAdminPage() {
  const [components, setComponents] = useState<ProductComponent[]>([]);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [settings, setSettings] = useState<ProductSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'components' | 'settings'>('components');

  const [form, setForm] = useState({
    component_type: 'handle',
    component_option: '',
    filament_id: '',
    price: '',
    is_active: true,
  });

  const [settingForm, setSettingForm] = useState({ key: '', value: '', label: '' });
  const [editingSettingId, setEditingSettingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [compRes, filRes, setRes] = await Promise.all([
      supabase.from('product_components').select('*').order('component_type, component_option'),
      supabase.from('filaments').select('id, color_name, color_hex, company_name').eq('is_active', true).order('color_name'),
      supabase.from('product_settings').select('*').order('key'),
    ]);
    if (compRes.data) setComponents(compRes.data);
    if (filRes.data) setFilaments(filRes.data);
    if (setRes.data) setSettings(setRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const resetForm = () => {
    setForm({ component_type: 'handle', component_option: '', filament_id: '', price: '', is_active: true });
    setEditingId(null);
    setShowForm(false);
  };

  const save = async () => {
    if (!form.component_option || !form.price) return;
    const payload = {
      component_type: form.component_type,
      component_option: form.component_option,
      filament_id: form.filament_id || null,
      price: parseFloat(form.price) || 0,
      is_active: form.is_active,
    };
    if (editingId) {
      await supabase.from('product_components').update(payload).eq('id', editingId);
    } else {
      await supabase.from('product_components').insert(payload);
    }
    resetForm();
    loadData();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this pricing entry?')) return;
    await supabase.from('product_components').delete().eq('id', id);
    loadData();
  };

  const edit = (c: ProductComponent) => {
    setEditingId(c.id);
    setForm({
      component_type: c.component_type,
      component_option: c.component_option,
      filament_id: c.filament_id || '',
      price: String(c.price),
      is_active: c.is_active,
    });
    setShowForm(true);
  };

  const saveSetting = async () => {
    if (!settingForm.key || !settingForm.value) return;
    const payload = { key: settingForm.key, value: parseFloat(settingForm.value) || 0, label: settingForm.label || null };
    if (editingSettingId) {
      await supabase.from('product_settings').update(payload).eq('id', editingSettingId);
    } else {
      await supabase.from('product_settings').insert(payload);
    }
    setSettingForm({ key: '', value: '', label: '' });
    setEditingSettingId(null);
    loadData();
  };

  const editSetting = (s: ProductSetting) => {
    setEditingSettingId(s.id);
    setSettingForm({ key: s.key, value: String(s.value), label: s.label || '' });
  };

  const removeSetting = async (id: string) => {
    if (!confirm('Delete this setting?')) return;
    await supabase.from('product_settings').delete().eq('id', id);
    loadData();
  };

  const currentTypeOptions = COMPONENT_TYPES.find(t => t.value === form.component_type)?.options || [];
  const filtered = components.filter(c => {
    const q = search.toLowerCase();
    return c.component_type.includes(q) || c.component_option.toLowerCase().includes(q);
  });
  const getFilament = (id: string | null) => filaments.find(f => f.id === id);

  return (
    <>
      <Navigation />
      <main className="pt-16 min-h-screen bg-background pb-16 md:pb-0">
        <div className="section-padding">
          <div className="container-wide">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-fluid-heading font-display text-foreground">Product Pricing</h1>
                <p className="text-sm text-muted-foreground mt-1">Set the price for every component — handles, blades, screws, and weights — by filament color.</p>
              </div>
            </div>

            <div className="flex gap-2 mb-6 border-b border-border">
              <button onClick={() => setActiveTab('components')} className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${activeTab === 'components' ? 'border-[#F9733E] text-[#F9733E]' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                <Layers className="w-4 h-4 inline mr-1.5" /> Components
              </button>
              <button onClick={() => setActiveTab('settings')} className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${activeTab === 'settings' ? 'border-[#F9733E] text-[#F9733E]' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                <Settings className="w-4 h-4 inline mr-1.5" /> Settings
              </button>
            </div>

            {activeTab === 'components' && (
              <>
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" placeholder="Search components..." value={search} onChange={e => setSearch(e.target.value)} className="forge-input pl-10" />
                  </div>
                  <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary whitespace-nowrap">
                    <Plus className="w-4 h-4" /> Add Price
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-20 text-muted-foreground">Loading...</div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-20">
                    <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">No pricing entries yet. Add your first one!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(c => {
                      const fil = getFilament(c.filament_id);
                      const typeLabel = COMPONENT_TYPES.find(t => t.value === c.component_type)?.label || c.component_type;
                      return (
                        <div key={c.id} className="rounded-xl border border-border bg-card p-4 hover:shadow-lg transition-all duration-300">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <span className="text-[10px] font-bold tracking-widest text-[#F9733E] uppercase">{typeLabel}</span>
                              <h3 className="text-sm font-semibold text-foreground">{c.component_option}</h3>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => edit(c)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-[#F9733E] transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => remove(c.id)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                          {fil && (
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: fil.color_hex }} />
                              <span className="text-xs text-muted-foreground">{fil.color_name} · {fil.company_name}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="price-tag text-lg text-[#F9733E]">{c.price.toFixed(3)} OMR</span>
                            {!c.is_active && <span className="text-[10px] text-muted-foreground font-semibold">HIDDEN</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-2xl">
                <div className="rounded-xl border border-border bg-card p-5 mb-6">
                  <h3 className="text-sm font-semibold text-foreground mb-4">{editingSettingId ? 'Edit Setting' : 'Add Setting'}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <input type="text" placeholder="key (e.g. packing_fee)" value={settingForm.key} onChange={e => setSettingForm(prev => ({ ...prev, key: e.target.value }))} className="forge-input" disabled={!!editingSettingId} />
                    <input type="number" step="0.001" placeholder="value (OMR)" value={settingForm.value} onChange={e => setSettingForm(prev => ({ ...prev, value: e.target.value }))} className="forge-input" />
                    <input type="text" placeholder="label (optional)" value={settingForm.label} onChange={e => setSettingForm(prev => ({ ...prev, label: e.target.value }))} className="forge-input" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveSetting} disabled={!settingForm.key || !settingForm.value} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                      <Save className="w-4 h-4" /> {editingSettingId ? 'Update' : 'Add'} Setting
                    </button>
                    {editingSettingId && (
                      <button onClick={() => { setEditingSettingId(null); setSettingForm({ key: '', value: '', label: '' }); }} className="btn-secondary">Cancel</button>
                    )}
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-10 text-muted-foreground">Loading...</div>
                ) : settings.length === 0 ? (
                  <div className="text-center py-10">
                    <Coins className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No settings yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {settings.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{s.key}</p>
                          {s.label && <p className="text-xs text-muted-foreground">{s.label}</p>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="price-tag text-[#F9733E]">{s.value.toFixed(3)} OMR</span>
                          <button onClick={() => editSetting(s)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-[#F9733E] transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => removeSetting(s.id)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={resetForm}>
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
                <h2 className="text-lg font-heading font-bold text-foreground">{editingId ? 'Edit Price' : 'Add Price'}</h2>
                <button onClick={resetForm} className="p-2 rounded-lg hover:bg-muted transition-colors"><X className="w-5 h-5 text-foreground" /></button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">Component type</label>
                  <div className="relative">
                    <select value={form.component_type} onChange={e => setForm(prev => ({ ...prev, component_type: e.target.value, component_option: '' }))} className="forge-input appearance-none pr-10">
                      {COMPONENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">Component option</label>
                  <div className="relative">
                    <select value={form.component_option} onChange={e => setForm(prev => ({ ...prev, component_option: e.target.value }))} className="forge-input appearance-none pr-10">
                      <option value="">Select an option...</option>
                      {currentTypeOptions.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">Filament color (optional)</label>
                  <div className="relative">
                    <select value={form.filament_id} onChange={e => setForm(prev => ({ ...prev, filament_id: e.target.value }))} className="forge-input appearance-none pr-10">
                      <option value="">Any color (universal price)</option>
                      {filaments.map(f => (<option key={f.id} value={f.id}>{f.color_name} · {f.company_name}</option>))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">Price (OMR)</label>
                  <input type="number" step="0.001" placeholder="0.000" value={form.price} onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))} className="forge-input" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <button type="button" onClick={() => setForm(prev => ({ ...prev, is_active: !prev.is_active }))} className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? 'bg-[#F9733E]' : 'bg-muted'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${form.is_active ? 'translate-x-5' : ''}`} />
                  </button>
                  <span className="text-sm text-foreground">Active</span>
                </label>
              </div>
              <div className="p-6 border-t border-border flex gap-3 sticky bottom-0 bg-card">
                <button onClick={resetForm} className="btn-secondary flex-1">Cancel</button>
                <button onClick={save} disabled={!form.component_option || !form.price} className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
                  {editingId ? 'Save Changes' : 'Add Price'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
