import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import heroImg from "@/assets/hero-chickens.jpg";
import roosterImg from "@/assets/rooster.jpg";
import coopImg from "@/assets/coop.jpg";
import chicksImg from "@/assets/chicks.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PoultryFit Kenya — Real flock plans, honest disease triage" },
      {
        name: "description",
        content:
          "A data-backed poultry assistant for Kenyan smallholders: plan your flock by space and budget, check bird diseases from a photo, and find the nearest vet.",
      },
      { property: "og:title", content: "PoultryFit Kenya" },
      {
        property: "og:description",
        content:
          "Plan your flock, check disease symptoms, and find nearby vets — powered by real bylaws, live agrovet prices and an ML triage model.",
      },
    ],
  }),
  component: Index,
});

const productionData = [
  { month: "Jan", eggs: 0, feedKg: 0 },
  { month: "Feb", eggs: 0, feedKg: 0 },
  { month: "Mar", eggs: 0, feedKg: 0 },
  { month: "Apr", eggs: 0, feedKg: 0 },
  { month: "May", eggs: 0, feedKg: 0 },
  { month: "Jun", eggs: 0, feedKg: 0 },
];

const feedMix = [
  { name: "Maize", value: 0 },
  { name: "Soya", value: 0 },
  { name: "Fishmeal", value: 0 },
  { name: "Premix", value: 0 },
  { name: "Calcium", value: 0 },
];

const wardPrices = [
  { ward: "—", layer: 0, broiler: 0 },
  { ward: "—", layer: 0, broiler: 0 },
  { ward: "—", layer: 0, broiler: 0 },
  { ward: "—", layer: 0, broiler: 0 },
];

const chartColors = ["#2f5d3a", "#c98a2a", "#4d8a54", "#d97706", "#7fb069"];

function Index() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate({ to: "/planner", replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading || isAuthenticated) return null;

  return (
    <div className="min-h-screen">
      <SiteNav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImg}
            alt="Flock of healthy chickens on a Kenyan farm at golden hour"
            width={1600}
            height={1024}
            className="h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(120deg, oklch(0.24 0.07 155 / 0.94) 0%, oklch(0.24 0.07 155 / 0.72) 45%, oklch(0.24 0.07 155 / 0.2) 100%)",
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs font-medium ring-1 ring-white/20">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Built for Kenyan smallholders · Juja pilot live
            </span>
            <h1 className="mt-6 font-display text-5xl md:text-7xl font-bold leading-[1.02]">
              Real flock plans.<br />
              <span className="text-accent">Honest</span> disease triage.
            </h1>
            <p className="mt-6 text-lg text-primary-foreground/85 max-w-xl">
              Tell us your space, budget and ward. PoultryFit gives you a bylaw-checked flock size,
              a costed feed plan against live agrovet prices, and an ML-powered check for sick
              birds — with the nearest vet one tap away.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-amber)] hover:brightness-105 transition"
              >
                Sign in to get started <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-6 max-w-lg">
              {[
              { k: "0", v: "Live screens" },
              { k: "0", v: "Disease classes" },
              { k: "0", v: "Ward-level prices" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="font-display text-3xl md:text-4xl font-bold text-accent">
                    {s.k}
                  </dt>
                  <dd className="text-xs uppercase tracking-wider text-primary-foreground/70 mt-1">
                    {s.v}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="mx-auto max-w-7xl px-6 mt-24">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              What "done" looks like
            </span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold text-primary-deep">
              A dashboard, not a demo.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Every feature is checked against one question — does it work with real data, over a
              real connection, for someone who didn't build it?
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm text-secondary-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            Sample flock · 40 layers · Juja Ward
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border/60 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">Egg production vs feed intake</h3>
              <span className="text-xs text-muted-foreground">Rolling 6 months</span>
            </div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productionData}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2f5d3a" stopOpacity={0.7} />
                      <stop offset="100%" stopColor="#2f5d3a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c98a2a" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#c98a2a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e2d8" />
                  <XAxis dataKey="month" stroke="#6b7160" fontSize={12} />
                  <YAxis stroke="#6b7160" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #e5e2d8",
                      borderRadius: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="eggs"
                    stroke="#2f5d3a"
                    strokeWidth={2.5}
                    fill="url(#g1)"
                  />
                  <Area
                    type="monotone"
                    dataKey="feedKg"
                    stroke="#c98a2a"
                    strokeWidth={2.5}
                    fill="url(#g2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border/60">
            <h3 className="font-display text-lg font-semibold">Least-cost feed mix</h3>
            <p className="text-xs text-muted-foreground">Layer mash · KES / kg composition</p>
            <div className="mt-2 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={feedMix}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {feedMix.map((_, i) => (
                      <Cell key={i} fill={chartColors[i % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #e5e2d8",
                      borderRadius: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 grid grid-cols-2 gap-1 text-xs">
              {feedMix.map((f, i) => (
                <li key={f.name} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: chartColors[i % chartColors.length] }}
                  />
                  {f.name} · {f.value}%
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border/60 lg:col-span-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">Agrovet feed prices by ward</h3>
              <span className="text-xs text-muted-foreground">KES / kg · seeded from Juja</span>
            </div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wardPrices}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e2d8" />
                  <XAxis dataKey="ward" stroke="#6b7160" fontSize={12} />
                  <YAxis stroke="#6b7160" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #e5e2d8",
                      borderRadius: 12,
                    }}
                  />
                  <Bar dataKey="layer" fill="#2f5d3a" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="broiler" fill="#c98a2a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* PHOTO STORY */}
      <section className="mx-auto max-w-7xl px-6 mt-24">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { img: roosterImg, tag: "Kienyeji", title: "Species that fit your climate" },
            { img: coopImg, tag: "Housing", title: "Coop sizing from real square meters" },
            { img: chicksImg, tag: "Brooding", title: "Feed & warmth timed to week of life" },
          ].map((c) => (
            <article
              key={c.title}
              className="group relative overflow-hidden rounded-3xl bg-card ring-1 ring-border/60 shadow-sm"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={c.img}
                  alt={c.title}
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-6">
                <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                  {c.tag}
                </span>
                <h3 className="mt-2 font-display text-xl font-semibold">{c.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 mt-24">
        <div
          className="rounded-3xl p-10 md:p-16 text-primary-foreground shadow-[var(--shadow-elegant)] overflow-hidden relative"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-4xl md:text-5xl font-bold">
              Ready when your farm is.
            </h2>
            <p className="mt-4 text-primary-foreground/85">
              Start with the planner. In under two minutes you'll have a real flock recommendation
              backed by your ward's bylaws and today's agrovet prices.
            </p>
            <Link
              to="/login"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-amber)] hover:brightness-105 transition"
            >
              Sign in to get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
