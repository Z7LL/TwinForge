'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Filament {
  id: string;
  company_id: string | null;
  company_name: string;
  material: string;
  color_name: string;
  color_hex: string;
  cost: number;
  grams_remaining: number;
  grams_total: number;
  image_url: string | null;
  is_active: boolean;
}

export type StockStatus = 'available' | 'low_stock' | 'out_of_stock';

export function getStockStatus(grams: number): StockStatus {
  if (grams <= 0) return 'out_of_stock';
  if (grams <= 200) return 'low_stock';
  return 'available';
}

export function useFilaments() {
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('filaments')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (data) setFilaments(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { filaments, loading, reload: load };
}
