DROP POLICY IF EXISTS "Verifications are publicly readable" ON public.agrovet_verifications;

CREATE POLICY "Farmers can view their own verification"
ON public.agrovet_verifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE VIEW public.agrovet_verifications_public
WITH (security_invoker = off) AS
SELECT
  v.agrovet_id,
  v.purchased_successfully,
  v.note,
  v.created_at,
  (v.user_id = auth.uid()) AS is_mine
FROM public.agrovet_verifications v;

GRANT SELECT ON public.agrovet_verifications_public TO anon, authenticated;
