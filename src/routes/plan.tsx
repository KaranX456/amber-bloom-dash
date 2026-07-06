import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Egg,
  Wheat,
  Building2,
  ArrowRight,
  Download,
  Sparkles,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import chicksImg from "@/assets/chicks.jpg";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Your Flock Plan · PoultryFit Kenya" },
      {
        name: "description",
        content:
          "A costed feed plan, bylaw status and expected production for your flock — built from real ward data.",
      },
    ],
  }),
  component: Plan,
});

const feed = [
  { name: "Maize", kg: 0, cost: 0 },
  { name: "Soya", kg: 0, cost: 0 },
  { name: "Fishmeal", kg: 0, cost: 0 },
  { name: "Calcium", kg: 0, cost: 0 },
  { name: "Premix", kg: 0, cost: 0 },
];

const production = [
  { week: "W1", eggs: 0 },
  { week: "W4", eggs: 0 },
  { week: "W8", eggs: 0 },
  { week: "W12", eggs: 0 },
  { week: "W16", eggs: 0 },
  { week: "W20", eggs: 0 },
  { week: "W24", eggs: 0 },
];

const feasibility = [{ name: "Feasibility", value: 0, fill: "#c98a2a" }];

const chartColors = ["#2f5d3a", "#c98a2a", "#4d8a54", "#d97706", "#7fb069"];

function Plan() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Tables<"farmer_profiles"> | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("farmer_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [user]);

  const birds = profile?.current_flock_size ?? 0;
  const spaceM2 = Math.round(birds * 1.3); // ~0.3 m² coop + 1 m² run per bird
  const weeklyBudget = Math.round((profile?.monthly_budget_kes ?? 0) / 4);
  const ward = profile?.ward ?? "—";
  const feasibilityScore =
    profile && profile.onboarding_completed
      ? Math.min(
          100,
          (birds > 0 ? 30 : 0) +
            ((profile.monthly_budget_kes ?? 0) > 0 ? 30 : 0) +
            (profile.has_dedicated_coop ? 20 : 0) +
            (profile.water_source ? 20 : 0),
        )
      : 0;

  // Simple feed split (proportional to weekly budget)
  const feedMix = [
    { name: "Maize", share: 0.55 },
    { name: "Soya", share: 0.2 },
    { name: "Fishmeal", share: 0.1 },
    { name: "Calcium", share: 0.08 },
    { name: "Premix", share: 0.07 },
  ];
  const pricePerKg: Record<string, number> = {
    Maize: 55,
    Soya: 95,
    Fishmeal: 180,
    Calcium: 40,
    Premix: 320,
  };
  const feedData = feedMix.map((f) => {
    const cost = Math.round(weeklyBudget * f.share);
    const kg = weeklyBudget > 0 ? +(cost / pricePerKg[f.name]).toFixed(1) : 0;
    return { name: f.name, kg, cost };
  });
  const totalCost = feedData.reduce((s, f) => s + f.cost, 0);
  const totalKg = feedData.reduce((s, f) => s + f.kg, 0);

  // Egg curve: ramps to ~85% lay rate for layers/kienyeji
  const layRate = profile?.poultry_type === "broiler" ? 0 : 0.85;
  const ramp = [0, 0.05, 0.35, 0.65, 0.82, 0.85, 0.83];
  const productionData = ["W1","W4","W8","W12","W16","W20","W24"].map((w, i) => ({
    week: w,
    eggs: Math.round(birds * layRate * ramp[i]),
  }));

  const feasibilityData = [{ name: "Feasibility", value: feasibilityScore, fill: "#c98a2a" }];
  const hasPlan = profile?.onboarding_completed && birds > 0;

  return (
    <div className="min-h-screen">
      <SiteNav />

      {/* Header */}
      <section className="mx-auto max-w-7xl px-6 pt-16">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              Step 2 · Your flock plan
            </span>
            <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold text-primary-deep">
              {profile?.full_name ? `${profile.full_name.split(" ")[0]}'s flock plan` : "Your flock plan"}
            </h1>
            <p className="mt-4 text-muted-foreground max-w-xl">
              {hasPlan
                ? `Costed feed plan, bylaw check and expected production for ${ward}.`
                : "Complete onboarding to generate a costed feed plan, bylaw check and expected production for your ward."}
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-medium text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition">
            <Download className="h-4 w-4" /> Download plan (PDF)
          </button>
        </div>
      </section>

      {/* KPI row */}
      <section className="mx-auto max-w-7xl px-6 mt-10 grid gap-4 md:grid-cols-4">
        {[
          { icon: Egg, k: String(birds), v: "Current flock size", tone: "primary" },
          { icon: Building2, k: `${spaceM2} m²`, v: "Space needed", tone: "primary" },
          { icon: Wheat, k: `KES ${weeklyBudget.toLocaleString()}`, v: "Weekly feed budget", tone: "accent" },
          { icon: ShieldCheck, k: ward, v: "Ward bylaw", tone: "primary" },
        ].map((k, i) => (
          <motion.div
            key={k.v}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl bg-card p-5 ring-1 ring-border/60 shadow-sm"
          >
            <span
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                k.tone === "accent"
                  ? "bg-accent text-accent-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              <k.icon className="h-5 w-5" />
            </span>
            <div className="mt-3 font-display text-2xl font-bold">{k.k}</div>
            <div className="text-xs text-muted-foreground">{k.v}</div>
          </motion.div>
        ))}
      </section>

      {/* Main grid */}
      <section className="mx-auto max-w-7xl px-6 mt-8 grid gap-4 lg:grid-cols-3">
        {/* Feasibility gauge */}
        <div className="rounded-2xl bg-card p-6 ring-1 ring-border/60 shadow-sm">
          <h3 className="font-display text-lg font-semibold">Feasibility score</h3>
          <p className="text-xs text-muted-foreground">
            Space · budget · bylaws combined
          </p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="70%"
                outerRadius="100%"
                data={feasibility}
                startAngle={220}
                endAngle={-40}
              >
                <RadialBar dataKey="value" cornerRadius={20} background={{ fill: "#eee7d6" }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="-mt-40 text-center pointer-events-none">
            <div className="font-display text-5xl font-bold text-primary-deep">{feasibilityScore}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">/ 100</div>
          </div>
          <div className="mt-24 rounded-xl bg-accent-soft p-3 text-xs text-accent-foreground/90">
            <Sparkles className="inline h-3.5 w-3.5 text-accent mr-1" />
            {hasPlan ? "Score updates as your farm details change." : "Complete onboarding to generate a score."}
          </div>
        </div>

        {/* Feed cost bar */}
        <div className="rounded-2xl bg-card p-6 ring-1 ring-border/60 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Least-cost feed plan</h3>
              <p className="text-xs text-muted-foreground">
                Weekly · {totalKg} kg total · KES {totalCost.toLocaleString()}
              </p>
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
              {hasPlan ? `Based on ${ward} prices` : "Awaiting profile"}
            </span>
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feedData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e2d8" />
                <XAxis type="number" stroke="#6b7160" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#6b7160" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e5e2d8",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="cost" radius={[0, 8, 8, 0]}>
                  {feedData.map((_, i) => (
                    <Cell key={i} fill={chartColors[i % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Egg curve */}
        <div className="rounded-2xl bg-card p-6 ring-1 ring-border/60 shadow-sm lg:col-span-2">
          <h3 className="font-display text-lg font-semibold">Expected egg curve</h3>
          <p className="text-xs text-muted-foreground">
            Eggs / day across 24 weeks from point-of-lay
          </p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e2d8" />
                <XAxis dataKey="week" stroke="#6b7160" fontSize={12} />
                <YAxis stroke="#6b7160" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e5e2d8",
                    borderRadius: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="eggs"
                  stroke="#2f5d3a"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#c98a2a" }}
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bylaw card */}
        <div className="rounded-2xl overflow-hidden ring-1 ring-border/60 shadow-sm flex flex-col">
          <img
            src={chicksImg}
            alt="Chicks"
            loading="lazy"
            className="h-40 w-full object-cover"
          />
          <div className="bg-primary-deep text-primary-foreground p-6 flex-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <h3 className="font-display text-lg font-semibold">Bylaw status</h3>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/85">
              <li className="flex justify-between"><span>Ward</span><span className="text-accent font-semibold">{ward}</span></li>
              <li className="flex justify-between"><span>County</span><span className="text-accent font-semibold">{profile?.county ?? "—"}</span></li>
              <li className="flex justify-between"><span>Dedicated coop</span><span className="text-accent font-semibold">{profile ? (profile.has_dedicated_coop ? "Yes" : "No") : "—"}</span></li>
              <li className="flex justify-between"><span>Water source</span><span className="text-accent font-semibold">{profile?.water_source ?? "—"}</span></li>
            </ul>
          </div>
        </div>

        {/* Feed table */}
        <div className="rounded-2xl bg-card p-6 ring-1 ring-border/60 shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Weekly feed breakdown</h3>
            <span className="text-xs text-muted-foreground">{hasPlan ? "Estimated from budget" : "Awaiting profile"}</span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-3 font-medium">Ingredient</th>
                  <th className="py-3 font-medium">Quantity</th>
                  <th className="py-3 font-medium">KES / kg</th>
                  <th className="py-3 font-medium text-right">Cost</th>
                </tr>
              </thead>
              <tbody>
                {feedData.map((f) => (
                  <tr key={f.name} className="border-b border-border/60 last:border-0">
                    <td className="py-3 font-medium">{f.name}</td>
                    <td className="py-3">{f.kg} kg</td>
                    <td className="py-3">KES {pricePerKg[f.name]}</td>
                    <td className="py-3 text-right font-semibold text-primary">
                      KES {f.cost.toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} className="py-4 font-semibold">Total weekly</td>
                  <td className="py-4 text-right font-display text-xl font-bold text-accent">
                    KES {totalCost.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Next step */}
      <section className="mx-auto max-w-7xl px-6 mt-12">
        <div className="rounded-3xl bg-secondary p-8 flex items-center justify-between gap-6 flex-wrap">
          <div>
            <h3 className="font-display text-2xl font-semibold text-primary-deep">
              Bird looks unwell? Run a quick check.
            </h3>
            <p className="text-sm text-muted-foreground">
              Upload a photo or tap symptoms — get an honest triage in seconds.
            </p>
          </div>
          <Link
            to="/disease"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110 transition"
          >
            Open disease check <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}