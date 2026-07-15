CREATE TABLE public.diagnosis_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptoms TEXT[] NOT NULL DEFAULT '{}',
  has_photo BOOLEAN NOT NULL DEFAULT false,
  top_prediction TEXT,
  confidence NUMERIC,
  feedback_helpful BOOLEAN,
  feedback_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.diagnosis_audit_log TO authenticated;
GRANT ALL ON public.diagnosis_audit_log TO service_role;

ALTER TABLE public.diagnosis_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own diagnosis logs"
  ON public.diagnosis_audit_log
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_diagnosis_audit_log_updated_at
  BEFORE UPDATE ON public.diagnosis_audit_log
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();