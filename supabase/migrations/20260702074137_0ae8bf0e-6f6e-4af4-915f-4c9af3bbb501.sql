
CREATE TABLE public.farmer_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  phone_number TEXT,
  preferred_language TEXT DEFAULT 'en',
  county TEXT NOT NULL,
  sub_county TEXT,
  ward TEXT NOT NULL,
  village TEXT,
  land_size_acres NUMERIC(6,2),
  has_dedicated_coop BOOLEAN DEFAULT false,
  water_source TEXT,
  electricity_access BOOLEAN DEFAULT false,
  farming_experience_years INTEGER,
  current_flock_size INTEGER DEFAULT 0,
  poultry_type TEXT,
  primary_goal TEXT,
  monthly_budget_kes INTEGER,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.farmer_profiles TO authenticated;
GRANT ALL ON public.farmer_profiles TO service_role;

ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can view their own profile"
  ON public.farmer_profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Farmers can insert their own profile"
  ON public.farmer_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Farmers can update their own profile"
  ON public.farmer_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Farmers can delete their own profile"
  ON public.farmer_profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_farmer_profiles_updated_at
  BEFORE UPDATE ON public.farmer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
