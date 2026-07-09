import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Save,
  User as UserIcon,
  MapPin,
  Sprout,
  Feather,
} from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { supabase } from "@/integrations/supabase/client";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile Settings · PoultryFit Kenya" },
      {
        name: "description",
        content:
          "View and update your farmer profile — personal details, location, farm setup and poultry goals.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <ProfilePage />
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

const empty: FormState = {
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

const inputCls =
  "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary";

function ProfilePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(empty);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate({ to: "/login" });
        return;
      }
      setUserId(data.user.id);
      const { data: profile, error } = await supabase
        .from("farmer_profiles")
        .select("*")
        .eq("user_id", data.user.id)
        .maybeSingle();
      if (error) {
        toast.error("Could not load profile");
      } else if (profile) {
        setForm({
          full_name: profile.full_name ?? "",
          age: profile.age?.toString() ?? "",
          gender: profile.gender ?? "",
          phone_number: profile.phone_number ?? "",
          preferred_language: profile.preferred_language ?? "en",
          county: profile.county ?? "",
          sub_county: profile.sub_county ?? "",
          ward: profile.ward ?? "",
          village: profile.village ?? "",
          land_size_acres: profile.land_size_acres?.toString() ?? "",
          has_dedicated_coop: !!profile.has_dedicated_coop,
          water_source: profile.water_source ?? "",
          electricity_access: !!profile.electricity_access,
          farming_experience_years:
            profile.farming_experience_years?.toString() ?? "",
          current_flock_size: profile.current_flock_size?.toString() ?? "0",
          poultry_type: profile.poultry_type ?? "",
          primary_goal: profile.primary_goal ?? "",
          monthly_budget_kes: profile.monthly_budget_kes?.toString() ?? "",
        });
      }
      setLoading(false);
    })();
  }, [navigate]);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    if (!form.full_name.trim()) return toast.error("Full name is required");
    if (!form.county.trim()) return toast.error("County is required");
    if (!form.ward.trim()) return toast.error("Ward is required");

    setSaving(true);
    try {
      const payload = {
        user_id: userId,
        full_name: form.full_name.trim(),
        age: form.age ? Number(form.age) : null,
        gender: form.gender || null,
        phone_number: form.phone_number.trim() || null,
        preferred_language: form.preferred_language,
        county: form.county.trim(),
        sub_county: form.sub_county.trim() || null,
        ward: form.ward.trim(),
        village: form.village.trim() || null,
        land_size_acres: form.land_size_acres
          ? Number(form.land_size_acres)
          : null,
        has_dedicated_coop: form.has_dedicated_coop,
        water_source: form.water_source || null,
        electricity_access: form.electricity_access,
        farming_experience_years: form.farming_experience_years
          ? Number(form.farming_experience_years)
          : null,
        current_flock_size: Number(form.current_flock_size || 0),
        poultry_type: form.poultry_type || null,
        primary_goal: form.primary_goal || null,
        monthly_budget_kes: form.monthly_budget_kes
          ? Number(form.monthly_budget_kes)
          : null,
        onboarding_completed: true,
      };
      const { error } = await supabase
        .from("farmer_profiles")
        .upsert(payload, { onConflict: "user_id" });
      if (error) throw error;
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <div className="grid place-items-center py-32">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <section className="mx-auto max-w-4xl px-6 pt-10 pb-16">
        <Link
          to="/planner"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to planner
        </Link>
        <div className="mt-4 flex items-start justify-between gap-6 flex-wrap">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              Profile settings
            </span>
            <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold text-primary-deep">
              {form.full_name || "Your"} profile
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Update your farm details anytime. Changes flow into your flock plan,
              feed schedule and vet alerts.
            </p>
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={save}
          className="mt-8 space-y-8"
        >
          <Card icon={<UserIcon className="h-4 w-4" />} title="About you">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" required>
                <input
                  className={inputCls}
                  value={form.full_name}
                  onChange={(e) => set("full_name", e.target.value)}
                />
              </Field>
              <Field label="Age">
                <input
                  type="number"
                  min={15}
                  max={100}
                  className={inputCls}
                  value={form.age}
                  onChange={(e) => set("age", e.target.value)}
                />
              </Field>
              <Field label="Gender">
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
              <Field label="Phone number">
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
          </Card>

          <Card icon={<MapPin className="h-4 w-4" />} title="Location">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="County" required>
                <input
                  className={inputCls}
                  value={form.county}
                  onChange={(e) => set("county", e.target.value)}
                />
              </Field>
              <Field label="Sub-county">
                <input
                  className={inputCls}
                  value={form.sub_county}
                  onChange={(e) => set("sub_county", e.target.value)}
                />
              </Field>
              <Field label="Ward" required>
                <input
                  className={inputCls}
                  value={form.ward}
                  onChange={(e) => set("ward", e.target.value)}
                />
              </Field>
              <Field label="Village / estate">
                <input
                  className={inputCls}
                  value={form.village}
                  onChange={(e) => set("village", e.target.value)}
                />
              </Field>
            </div>
          </Card>

          <Card icon={<Sprout className="h-4 w-4" />} title="Your farm">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Land size (acres)">
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  className={inputCls}
                  value={form.land_size_acres}
                  onChange={(e) => set("land_size_acres", e.target.value)}
                />
              </Field>
              <Field label="Years of farming experience">
                <input
                  type="number"
                  min="0"
                  className={inputCls}
                  value={form.farming_experience_years}
                  onChange={(e) =>
                    set("farming_experience_years", e.target.value)
                  }
                />
              </Field>
              <Field label="Water source">
                <select
                  className={inputCls}
                  value={form.water_source}
                  onChange={(e) => set("water_source", e.target.value)}
                >
                  <option value="">Select…</option>
                  <option value="tap">Piped/tap</option>
                  <option value="borehole">Borehole</option>
                  <option value="rain">Rain harvest</option>
                  <option value="river">River/stream</option>
                  <option value="vendor">Water vendor</option>
                </select>
              </Field>
              <div className="flex items-end gap-6">
                <Toggle
                  label="Dedicated coop"
                  checked={form.has_dedicated_coop}
                  onChange={(v) => set("has_dedicated_coop", v)}
                />
                <Toggle
                  label="Electricity access"
                  checked={form.electricity_access}
                  onChange={(v) => set("electricity_access", v)}
                />
              </div>
            </div>
          </Card>

          <Card icon={<Feather className="h-4 w-4" />} title="Poultry goals">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Current flock size">
                <input
                  type="number"
                  min="0"
                  className={inputCls}
                  value={form.current_flock_size}
                  onChange={(e) => set("current_flock_size", e.target.value)}
                />
              </Field>
              <Field label="Poultry type">
                <select
                  className={inputCls}
                  value={form.poultry_type}
                  onChange={(e) => set("poultry_type", e.target.value)}
                >
                  <option value="">Select…</option>
                  <option value="layer">Layers</option>
                  <option value="broiler">Broilers</option>
                  <option value="kienyeji">Kienyeji</option>
                  <option value="mixed">Mixed flock</option>
                </select>
              </Field>
              <Field label="Primary goal">
                <select
                  className={inputCls}
                  value={form.primary_goal}
                  onChange={(e) => set("primary_goal", e.target.value)}
                >
                  <option value="">Select…</option>
                  <option value="eggs">Egg production</option>
                  <option value="meat">Meat production</option>
                  <option value="both">Both eggs & meat</option>
                  <option value="income">Extra income</option>
                  <option value="subsistence">Family food</option>
                </select>
              </Field>
              <Field label="Monthly feed budget (KES)">
                <input
                  type="number"
                  min="0"
                  className={inputCls}
                  value={form.monthly_budget_kes}
                  onChange={(e) => set("monthly_budget_kes", e.target.value)}
                />
              </Field>
            </div>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Link
              to="/planner"
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground/80 hover:bg-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:brightness-110 disabled:opacity-70"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save changes
                </>
              )}
            </button>
          </div>
        </motion.form>
      </section>
      <SiteFooter />
    </div>
  );
}

function Card({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-2 text-primary">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary">
          {icon}
        </span>
        <h2 className="font-display text-lg font-semibold text-primary-deep">
          {title}
        </h2>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-foreground/80">
        {label} {required && <span className="text-accent">*</span>}
      </div>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${
          checked ? "bg-primary" : "bg-secondary"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
      <span className="text-foreground/80">{label}</span>
    </label>
  );
}