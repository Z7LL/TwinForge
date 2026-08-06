'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';

type Filament = Database['public']['Tables']['filaments']['Row'];
type FilamentCompany = Database['public']['Tables']['filament_companies']['Row'];

export default function ConfiguratorPage() {
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [companies, setCompanies] = useState<FilamentCompany[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [isButterflyKnife, setIsButterflyKnife] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: companiesData } = await supabase.from('filament_companies').select('*');
      const { data: filamentsData } = await supabase.from('filaments').select('*');
      
      if (companiesData) setCompanies(companiesData);
      if (filamentsData) setFilaments(filamentsData);
    };

    fetchData();
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 8) {
      setPhone(value);
    }
  };

  const filteredFilaments = selectedCompany
    ? filaments.filter(f => f.company_id === selectedCompany)
    : filaments;

  const colors = [...new Set(filteredFilaments.map(f => f.color_name))];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Product Configurator</h1>
        
        <div className="space-y-6">
          {/* Company Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-2">Filament Company</label>
            <select
              value={selectedCompany}
              onChange={(e) => {
                setSelectedCompany(e.target.value);
                setSelectedColor('');
              }}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-600"
            >
              <option value="">Select a company</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>

          {/* Color Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-2">Color</label>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-600"
            >
              <option value="">Select a color</option>
              {colors.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number (8 digits)</label>
            <input
              type="text"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="12345678"
              className={`w-full bg-gray-900 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${
                phone.length === 8 ? 'border-green-600 focus:ring-green-600' : 'border-gray-700 focus:ring-orange-600'
              }`}
            />
            {phone.length > 0 && phone.length !== 8 && (
              <p className="text-red-500 text-sm mt-1">Phone must be exactly 8 digits</p>
            )}
          </div>

          {/* Butterfly Knife Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="butterfly"
              checked={isButterflyKnife}
              onChange={(e) => setIsButterflyKnife(e.target.checked)}
              className="w-5 h-5 accent-orange-600"
            />
            <label htmlFor="butterfly" className="text-sm font-medium">
              Butterfly Knife (+1 OMR packing fee)
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
