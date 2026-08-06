-- Migration: Enhanced configurator with dropdown support and butterfly knife fee
-- This migration ensures:
-- 1. Filament companies table exists for dropdown
-- 2. Product components with detailed pricing (handles, blades, screws, weight)
-- 3. Butterfly knife packing fee (+1 OMR)
-- 4. Phone number validation (8 digits exactly)

-- Create filament_companies if not exists
CREATE TABLE IF NOT EXISTS public.filament_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add company_id foreign key to filaments if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'filaments' 
    AND column_name = 'company_id'
  ) THEN
    ALTER TABLE public.filaments ADD COLUMN company_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'filaments_company_id_fkey'
  ) THEN
    ALTER TABLE public.filaments ADD CONSTRAINT filaments_company_id_fkey 
      FOREIGN KEY (company_id) REFERENCES public.filament_companies(id);
  END IF;
END $$;

-- Insert sample companies
INSERT INTO public.filament_companies (name) VALUES
  ('Creality'),
  ('Ender'),
  ('Generic'),
  ('PolyMaker'),
  ('ColorFabb'),
  ('Prusament'),
  ('Fillamentum'),
  ('Ultimaker'),
  ('FormFutura'),
  ('eSUN')
ON CONFLICT (name) DO NOTHING;

-- Enhanced product components for butterfly knives
CREATE TABLE IF NOT EXISTS public.product_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component_type text NOT NULL,
  component_option text NOT NULL,
  filament_id uuid REFERENCES public.filaments(id),
  price numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  weight_type text DEFAULT 'standard',
  is_butterfly_knife boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert butterfly knife components
INSERT INTO public.product_components (component_type, component_option, price, weight_type, is_butterfly_knife, is_active, created_at, updated_at) VALUES
  ('handle', 'standard', 2.50, 'standard', true, true, now(), now()),
  ('handle', 'premium', 4.00, 'standard', true, true, now(), now()),
  ('blade', 'standard', 1.50, 'standard', true, true, now(), now()),
  ('blade', 'serrated', 2.00, 'standard', true, true, now(), now()),
  ('screws', 'standard', 0.50, 'light', true, true, now(), now()),
  ('screws', 'premium', 0.75, 'heavy', true, true, now(), now()),
  ('weight', 'light', 0.00, 'light', true, true, now(), now()),
  ('weight', 'heavy', 1.00, 'heavy', true, true, now(), now())
ON CONFLICT DO NOTHING;

-- Add butterfly knife packing fee setting
INSERT INTO public.product_settings (key, value, label, updated_at) VALUES
  ('butterfly_knife_packing_fee', 1.00, 'Butterfly Knife Packing Fee', now())
ON CONFLICT (key) DO NOTHING;

-- Ensure phone validation
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_phone_check;
ALTER TABLE public.customers ADD CONSTRAINT customers_phone_check CHECK (phone ~ '^[0-9]{8}$');

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_customer_phone_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_customer_phone_check CHECK (customer_phone ~ '^[0-9]{8}$');
