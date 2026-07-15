import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type LogInput = {
  symptoms: string[];
  hasPhoto: boolean;
  topPrediction: string;
  confidence: number;
  feedbackHelpful?: boolean | null;
  feedbackNote?: string | null;
};

export const logDiagnosis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: LogInput) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("diagnosis_audit_log")
      .insert({
        user_id: userId,
        symptoms: data.symptoms,
        has_photo: data.hasPhoto,
        top_prediction: data.topPrediction,
        confidence: data.confidence,
        feedback_helpful: data.feedbackHelpful ?? null,
        feedback_note: data.feedbackNote ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const submitDiagnosisFeedback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; helpful: boolean; note?: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("diagnosis_audit_log")
      .update({
        feedback_helpful: data.helpful,
        feedback_note: data.note ?? null,
      })
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });