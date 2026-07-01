import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
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
  { name: "Maize", kg: 18, cost: 1080 },
  { name: "Soya", kg: 8, cost: 960 },
  { name: "Fishmeal", kg: 3, cost: 720 },
  { name: "Calcium", kg: 5, cost: 250 },
  { name: "Premix", kg: 1, cost: 380 },
];

const production = [
  { week: "W1", eggs: 0 },
  { week: "W4", eggs: 5 },
  { week: "W8", eggs: 22 },
  { week: "W12", eggs: 34 },
  { week: "W16", eggs: 36 },
  { week: "W20", eggs: 34 },
  { week: "W24", eggs: 32 },
];

const feasibility = [{ name: "Feasibility", value: 82, fill: "#c98a2a" }];

const chartColors = ["#2f5d3a", "#c98a2a", "#4d8a54", "#d97706", "#7fb069"];

function Plan() {
  const totalCost = feed.reduce((s, f) => s + f.cost, 0);
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
              40 layers, feasible in Juja.
            </h1>
            <p className="mt-4 text-muted-foreground max-w-xl">
              Based on 12 m² of space, KES 8,000/month, and Juja ward density limits. Every
              number below is drawn from real agrovet prices and county bylaws.
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
          { icon: Egg, k: "40", v: "Recommended birds", tone: "primary" },
          { icon: Building2, k: "12 m²", v: "Space used · 100%", tone: "primary" },
          { icon: Wheat, k: "KES 3,390", v: "Weekly feed cost", tone: "accent" },
          { icon: ShieldCheck, k: "Compliant", v: "Juja ward bylaw", tone: "primary" },
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
            <div className="font-display text-5xl font-bold text-primary-deep">82</div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest">/ 100</div>
          </div>
          <div className="mt-24 rounded-xl bg-accent-soft p-3 text-xs text-accent-foreground/90">
            <Sparkles className="inline h-3.5 w-3.5 text-accent mr-1" />
            Add 2 m² of run to reach 90.
          </div>
        </div>

        {/* Feed cost bar */}
        <div className="rounded-2xl bg-card p-6 ring-1 ring-border/60 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Least-cost feed plan</h3>
              <p className="text-xs text-muted-foreground">
                Weekly · 35 kg total · KES {totalCost.toLocaleString()}
              </p>
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
              Juja agrovet prices · today
            </span>
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feed} layout="vertical" margin={{ left: 20 }}>
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
                  {feed.map((_, i) => (
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
              <LineChart data={production}>
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
              <li className="flex justify-between"><span>Max birds/plot</span><span className="text-accent font-semibold">50</span></li>
              <li className="flex justify-between"><span>Setback from neighbour</span><span className="text-accent font-semibold">2 m</span></li>
              <li className="flex justify-between"><span>Noise permit</span><span className="text-accent font-semibold">Not needed</span></li>
              <li className="flex justify-between"><span>Waste plan</span><span className="text-accent font-semibold">Required</span></li>
            </ul>
          </div>
        </div>

        {/* Feed table */}
        <div className="rounded-2xl bg-card p-6 ring-1 ring-border/60 shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Weekly feed breakdown</h3>
            <span className="text-xs text-muted-foreground">Prices seeded from Juja agrovets</span>
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
                {feed.map((f) => (
                  <tr key={f.name} className="border-b border-border/60 last:border-0">
                    <td className="py-3 font-medium">{f.name}</td>
                    <td className="py-3">{f.kg} kg</td>
                    <td className="py-3">KES {(f.cost / f.kg).toFixed(0)}</td>
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