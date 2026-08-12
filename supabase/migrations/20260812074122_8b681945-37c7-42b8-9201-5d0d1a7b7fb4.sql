DROP VIEW IF EXISTS public.agrovet_verifications_public;

CREATE OR REPLACE FUNCTION public.get_agrovet_verifications()
RETURNS TABLE (
  agrovet_id uuid,
  purchased_successfully boolean,
  note text,
  created_at timestamptz,
  is_mine boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.agrovet_id, v.purchased_successfully, v.note, v.created_at, (v.user_id = auth.uid())
  FROM public.agrovet_verifications v
  ORDER BY v.created_at DESC
$$;

GRANT EXECUTE ON FUNCTION public.get_agrovet_verifications() TO anon, authenticated;
