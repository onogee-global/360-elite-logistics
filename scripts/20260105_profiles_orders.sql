-- Use CREATE TABLE IF NOT EXISTS to avoid needing a DO block
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text,
  pib text,
  address text,
  city text,
  phone text,
  contact_name text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION public.set_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger idempotently
DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE PROCEDURE public.set_timestamp();

-- RLS for user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Recreate policies idempotently without DO
DROP POLICY IF EXISTS user_profiles_self_select ON public.user_profiles;
CREATE POLICY user_profiles_self_select
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_profiles_self_upsert ON public.user_profiles;
CREATE POLICY user_profiles_self_upsert
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_profiles_self_update ON public.user_profiles;
CREATE POLICY user_profiles_self_update
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add is_admin column if missing (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_profiles'
      AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- orders.order_number sequence and column
CREATE SEQUENCE IF NOT EXISTS public.orders_order_number_seq START 1;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_number bigint UNIQUE DEFAULT nextval('public.orders_order_number_seq');

-- Switch to per-user numbering: drop global UNIQUE, add per-user UNIQUE, add trigger to assign next number per user
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_order_number_key;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_user_ordernumber_key;
ALTER TABLE public.orders ADD CONSTRAINT orders_user_ordernumber_key UNIQUE (user_id, order_number);

-- Idempotent trigger to set per-user incremental order_number when NULL
DROP TRIGGER IF EXISTS trg_orders_set_order_number ON public.orders;
DROP FUNCTION IF EXISTS public.set_order_number_per_user();
CREATE FUNCTION public.set_order_number_per_user()
RETURNS trigger AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    -- Optional: lightweight per-user advisory lock to avoid race conditions
    PERFORM pg_advisory_xact_lock( ('x'||substr(replace(NEW.user_id::text,'-',''),1,16))::bit(64)::bigint );
    NEW.order_number := COALESCE(
      (SELECT MAX(o.order_number) FROM public.orders o WHERE o.user_id = NEW.user_id),
      0
    ) + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_set_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE PROCEDURE public.set_order_number_per_user();

-- Backfill order_number for existing rows
WITH missing AS (
  SELECT id
  FROM public.orders
  WHERE order_number IS NULL
  ORDER BY created_at ASC
)
UPDATE public.orders o
SET order_number = nextval('public.orders_order_number_seq')
FROM missing m
WHERE o.id = m.id;

-- Recompute per-user numbers to ensure strict 1..N sequence (idempotent)
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC, id ASC) AS rn
  FROM public.orders
)
UPDATE public.orders o
SET order_number = r.rn
FROM ranked r
WHERE o.id = r.id;

-- Ensure variation_id is nullable on order_items
ALTER TABLE public.order_items ALTER COLUMN variation_id DROP NOT NULL;

-- Optional: Notify PostgREST to reload schema
SELECT pg_notify('pgrst', 'reload schema');


