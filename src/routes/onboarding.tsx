import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Egg,
  User as UserIcon,
  MapPin,
  Sprout,
  Feather,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import chicksImg from "@/assets/chicks.jpg";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Build your farmer profile — PoultryFit Kenya" },
      {
        name: "description",
        content:
          "Tell us about your farm so PoultryFit can tailor your flock plan, feed schedule, and vet alerts.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <OnboardingPage />
    </RequireAuth>
  ),
});

type FormState = {
  full_name: string;
  age: string;
  gender: string;
  phone_number: string;
  preferred_language: string;
  county: string;
  sub_county: string;
  ward: string;
  village: string;
  land_size_acres: string;
  has_dedicated_coop: boolean;
  water_source: string;
  electricity_access: boolean;
  farming_experience_years: string;
  current_flock_size: string;
  poultry_type: string;
  primary_goal: string;
  monthly_budget_kes: string;
};

const initial: FormState = {
  full_name: "",
  age: "",
  gender: "",
  phone_number: "",
  preferred_language: "en",
  county: "",
  sub_county: "",
  ward: "",
  village: "",
  land_size_acres: "",
  has_dedicated_coop: false,
  water_source: "",
  electricity_access: false,
  farming_experience_years: "",
  current_flock_size: "0",
  poultry_type: "",
  primary_goal: "",
  monthly_budget_kes: "",
};

const steps = [
  { key: "personal", label: "About you", icon: UserIcon },
  { key: "location", label: "Location", icon: MapPin },
  { key: "farm", label: "Your farm", icon: Sprout },
  { key: "poultry", label: "Poultry goals", icon: Feather },
] as const;

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  // Auth gate + skip if already onboarded
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate({ to: "/login" });
        return;
      }
      setUserId(data.user.id);
      const { data: profile } = await supabase
        .from("farmer_profiles")
        .select("onboarding_completed")
        .eq("user_id", data.user.id)
        .maybeSingle();
      if (profile?.onboarding_completed) {
        navigate({ to: "/planner" });
        return;
      }
      setChecking(false);
    })();
  }, [navigate]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validateStep(): string | null {
    if (step === 0) {
      if (!form.full_name.trim()) return "Please enter your full name";
      if (!form.age || Number(form.age) < 15 || Number(form.age) > 100)
        return "Enter a valid age (15–100)";
      if (!form.gender) return "Select a gender";
      if (!form.phone_number.trim()) return "Enter your phone number";
    }
    if (step === 1) {
      if (!form.county.trim()) return "County is required";
      if (!form.ward.trim()) return "Ward is required";
    }
    if (step === 2) {
      if (!form.land_size_acres || Number(form.land_size_acres) <= 0)
        return "Enter your land size in acres";
      if (!form.water_source) return "Select a water source";
    }
    if (step === 3) {
      if (!form.poultry_type) return "Choose the poultry type";
      if (!form.primary_goal) return "Choose your primary goal";
      if (!form.monthly_budget_kes || Number(form.monthly_budget_kes) < 0)
        return "Enter your monthly budget";
    }
    return null;
  }

  function next() {
    const err = validateStep();
    if (err) {
      toast.error(err);
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  async function submit() {
    const err = validateStep();
    if (err) {
      toast.error(err);
      return;
    }
    if (!userId) return;
    setSaving(true);
    try {
      const payload = {
        user_id: userId,
        full_name: form.full_name.trim(),
        age: Number(form.age),
        gender: form.gender,
        phone_number: form.phone_number.trim(),
        preferred_language: form.preferred_language,
        county: form.county.trim(),
        sub_county: form.sub_county.trim() || null,
        ward: form.ward.trim(),
        village: form.village.trim() || null,
        land_size_acres: Number(form.land_size_acres),
        has_dedicated_coop: form.has_dedicated_coop,
        water_source: form.water_source,
        electricity_access: form.electricity_access,
        farming_experience_years: form.farming_experience_years
          ? Number(form.farming_experience_years)
          : 0,
        current_flock_size: Number(form.current_flock_size || 0),
        poultry_type: form.poultry_type,
        primary_goal: form.primary_goal,
        monthly_budget_kes: Number(form.monthly_budget_kes),
        onboarding_completed: true,
      };
      const { error } = await supabase
        .from("farmer_profiles")
        .upsert(payload, { onConflict: "user_id" });
      if (error) throw error;
      toast.success("Profile saved. Let's build your flock plan!");
      navigate({ to: "/planner" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header band */}
      <div
        className="relative overflow-hidden text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage: `url(${chicksImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6 py-10">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Egg className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-bold">
              PoultryFit<span className="text-accent">.</span>
            </span>
          </div>
          <h1 className="mt-6 font-display text-3xl sm:text-4xl font-bold">
            Let's build your farmer profile 🐣
          </h1>
          <p className="mt-2 max-w-2xl text-primary-foreground/80">
            A few quick questions so PoultryFit can tailor your flock size, feed
            schedule, and vet alerts to your farm.
          </p>

          {/* Stepper */}
          <div className="mt-8 grid grid-cols-4 gap-2 sm:gap-4">
            {steps.map((s, i) => {
              const active = i === step;
              const done = i < step;
              return (
                <div key={s.key} className="flex items-center gap-2 min-w-0">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-2 transition ${
                      done
                        ? "bg-accent text-accent-foreground ring-accent"
                        : active
                          ? "bg-white text-primary ring-white"
                          : "bg-white/10 text-white/70 ring-white/20"
                    }`}
                  >
                    {done ? <CheckCircle2 className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                  </div>
                  <span
                    className={`hidden sm:block text-sm font-medium truncate ${
                      active ? "text-white" : "text-white/70"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="mx-auto max-w-3xl px-6 -mt-8 pb-16">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl border border-border bg-card shadow-[var(--shadow-elegant)] p-6 sm:p-10"
        >
          {step === 0 && (
            <StepPersonal form={form} set={set} />
          )}
          {step === 1 && <StepLocation form={form} set={set} />}
          {step === 2 && <StepFarm form={form} set={set} />}
          {step === 3 && <StepPoultry form={form} set={set} />}

          <div className="mt-10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="inline-flex items-center gap-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground/80 hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={next}
                className="inline-flex items-center gap-1 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:brightness-110"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-amber)] hover:brightness-110 disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    Save & open my planner <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Your details are private and only used to personalize your flock plan.
        </p>
      </div>
    </div>
  );
}

/* ---------------- Reusable field ---------------- */

function Field({
  label,
  hint,
  children,
  required,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-foreground/80">
        {label} {required && <span className="text-accent">*</span>}
      </div>
      <div className="mt-1.5">{children}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary";

type StepProps = {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
};

function StepPersonal({ form, set }: StepProps) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-primary-deep">About you</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Tell us a bit about yourself as a farmer.
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="Full name" required>
          <input
            className={inputCls}
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
            placeholder="e.g. Wanjiku Kamau"
          />
        </Field>
        <Field label="Age" required>
          <input
            type="number"
            min={15}
            max={100}
            className={inputCls}
            value={form.age}
            onChange={(e) => set("age", e.target.value)}
            placeholder="e.g. 34"
          />
        </Field>
        <Field label="Gender" required>
          <select
            className={inputCls}
            value={form.gender}
            onChange={(e) => set("gender", e.target.value)}
          >
            <option value="">Select…</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="prefer_not">Prefer not to say</option>
          </select>
        </Field>
        <Field label="Phone number" required hint="M-PESA/SMS alerts will use this number">
          <input
            type="tel"
            className={inputCls}
            value={form.phone_number}
            onChange={(e) => set("phone_number", e.target.value)}
            placeholder="+254 7XX XXX XXX"
          />
        </Field>
        <Field label="Preferred language">
          <select
            className={inputCls}
            value={form.preferred_language}
            onChange={(e) => set("preferred_language", e.target.value)}
          >
            <option value="en">English</option>
            <option value="sw">Kiswahili</option>
            <option value="mixed">Mixed</option>
          </select>
        </Field>
      </div>
    </div>
  );
}

function StepLocation({ form, set }: StepProps) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-primary-deep">Where is your farm?</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        We use this to match you with the nearest vets and agrovets.
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="County" required>
          <input
            className={inputCls}
            value={form.county}
            onChange={(e) => set("county", e.target.value)}
            placeholder="e.g. Kiambu"
          />
        </Field>
        <Field label="Sub-county">
          <input
            className={inputCls}
            value={form.sub_county}
            onChange={(e) => set("sub_county", e.target.value)}
            placeholder="e.g. Githunguri"
          />
        </Field>
        <Field label="Ward" required>
          <input
            className={inputCls}
            value={form.ward}
            onChange={(e) => set("ward", e.target.value)}
            placeholder="e.g. Ikinu"
          />
        </Field>
        <Field label="Village / estate">
          <input
            className={inputCls}
            value={form.village}
            onChange={(e) => set("village", e.target.value)}
            placeholder="Optional"
          />
        </Field>
      </div>
    </div>
  );
}

function StepFarm({ form, set }: StepProps) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-primary-deep">Your farm</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        A few facts about the land and resources you have.
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="Land size (acres)" required hint="1 acre ≈ 4,047 m²">
          <input
            type="number"
            step="0.05"
            min="0"
            className={inputCls}
            value={form.land_size_acres}
            onChange={(e) => set("land_size_acres", e.target.value)}
            placeholder="e.g. 0.25"
          />
        </Field>
        <Field label="Years of farming experience">
          <input
            type="number"
            min="0"
            max="80"
            className={inputCls}
            value={form.farming_experience_years}
            onChange={(e) => set("farming_experience_years", e.target.value)}
            placeholder="e.g. 3"
          />
        </Field>
        <Field label="Main water source" required>
          <select
            className={inputCls}
            value={form.water_source}
            onChange={(e) => set("water_source", e.target.value)}
          >
            <option value="">Select…</option>
            <option value="tap">Piped / tap water</option>
            <option value="borehole">Borehole</option>
            <option value="well">Shallow well</option>
            <option value="river">River / stream</option>
            <option value="rain">Rainwater harvesting</option>
          </select>
        </Field>
        <Field label="Do you have a dedicated coop?">
          <div className="flex items-center gap-4 pt-2">
            {[
              { v: true, l: "Yes" },
              { v: false, l: "No, still to build" },
            ].map((o) => (
              <label key={String(o.v)} className="inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="coop"
                  className="accent-[var(--primary)]"
                  checked={form.has_dedicated_coop === o.v}
                  onChange={() => set("has_dedicated_coop", o.v)}
                />
                {o.l}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Electricity access on farm?">
          <div className="flex items-center gap-4 pt-2">
            {[
              { v: true, l: "Yes" },
              { v: false, l: "No" },
            ].map((o) => (
              <label key={String(o.v)} className="inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="power"
                  className="accent-[var(--primary)]"
                  checked={form.electricity_access === o.v}
                  onChange={() => set("electricity_access", o.v)}
                />
                {o.l}
              </label>
            ))}
          </div>
        </Field>
      </div>
    </div>
  );
}

function StepPoultry({ form, set }: StepProps) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-primary-deep">Poultry goals</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        This shapes your flock plan, feed calendar, and disease alerts.
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="Current flock size">
          <input
            type="number"
            min="0"
            className={inputCls}
            value={form.current_flock_size}
            onChange={(e) => set("current_flock_size", e.target.value)}
            placeholder="0 if starting fresh"
          />
        </Field>
        <Field label="Poultry type you want to raise" required>
          <select
            className={inputCls}
            value={form.poultry_type}
            onChange={(e) => set("poultry_type", e.target.value)}
          >
            <option value="">Select…</option>
            <option value="layers">Layers (eggs)</option>
            <option value="broilers">Broilers (meat)</option>
            <option value="kienyeji">Improved Kienyeji</option>
            <option value="dual">Dual purpose</option>
            <option value="ducks">Ducks</option>
            <option value="turkeys">Turkeys</option>
          </select>
        </Field>
        <Field label="Primary goal" required>
          <select
            className={inputCls}
            value={form.primary_goal}
            onChange={(e) => set("primary_goal", e.target.value)}
          >
            <option value="">Select…</option>
            <option value="income">Reliable income</option>
            <option value="household">Household food</option>
            <option value="expand">Expand existing flock</option>
            <option value="commercial">Go fully commercial</option>
          </select>
        </Field>
        <Field label="Monthly budget (KES)" required hint="Feed, meds, labour — a realistic figure">
          <input
            type="number"
            min="0"
            step="500"
            className={inputCls}
            value={form.monthly_budget_kes}
            onChange={(e) => set("monthly_budget_kes", e.target.value)}
            placeholder="e.g. 4000"
          />
        </Field>
      </div>
    </div>
  );
}