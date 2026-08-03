CREATE TABLE public.agrovets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'Agrovet',
  phone text,
  hours text,
  address text,
  county text,
  ward text,
  rating numeric,
  distance_km numeric,
  map_x numeric DEFAULT 50,
  map_y numeric DEFAULT 50,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.agrovets TO anon, authenticated;
GRANT ALL ON public.agrovets TO service_role;

ALTER TABLE public.agrovets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agrovet directory is publicly readable"
  ON public.agrovets FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TRIGGER update_agrovets_updated_at
  BEFORE UPDATE ON public.agrovets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.agrovet_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agrovet_id uuid NOT NULL REFERENCES public.agrovets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purchased_successfully boolean NOT NULL DEFAULT true,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agrovet_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.agrovet_verifications TO authenticated;
GRANT SELECT ON public.agrovet_verifications TO anon;
GRANT ALL ON public.agrovet_verifications TO service_role;

ALTER TABLE public.agrovet_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verifications are publicly readable"
  ON public.agrovet_verifications FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Farmers can add their own verification"
  ON public.agrovet_verifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Farmers can update their own verification"
  ON public.agrovet_verifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Farmers can remove their own verification"
  ON public.agrovet_verifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_agrovet_verifications_updated_at
  BEFORE UPDATE ON public.agrovet_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();