import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowRight,
  Ruler,
  Wallet,
  MapPin,
  Bird,
  CheckCircle2,
  Settings,
} from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import coopImg from "@/assets/coop.jpg";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Flock Planner · PoultryFit Kenya" },
      {
        name: "description",
        content:
          "Tell PoultryFit your available space, monthly budget, ward and preferred species — get a bylaw-checked flock plan in seconds.",
      },
    ],
  }),
  component: Planner,
});

const wards = ["Juja", "Ruiru", "Thika Town", "Kiambu Town", "Kikuyu", "Limuru"];
const species = [
  { id: "layer", label: "Layers", note: "Eggs, ~280/yr" },
  { id: "broiler", label: "Broilers", note: "Meat, 6 wk cycle" },
  { id: "kienyeji", label: "Kienyeji", note: "Dual purpose" },
  { id: "mixed", label: "Mixed flock", note: "Layers + kienyeji" },
];

function Planner() {
  const nav = useNavigate();
  const [space, setSpace] = useState(12);
  const [budget, setBudget] = useState(8000);
  const [ward, setWard] = useState("Juja");
  const [sp, setSp] = useState("layer");

  return (
    <div className="min-h-screen">
      <SiteNav />

      <section className="mx-auto max-w-7xl px-6 pt-16 pb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              Step 1 · Planner intake
            </span>
            <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold text-primary-deep max-w-2xl">
              Tell us about your farm.
            </h1>
            <p className="mt-4 text-muted-foreground max-w-xl">
              Four honest inputs. We pair them with your ward's bylaws and today's agrovet prices to
              come back with a real, feasible flock plan.
            </p>
          </div>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-primary hover:bg-secondary transition shadow-sm"
          >
            <Settings className="h-4 w-4" /> Profile settings
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={(e) => {
            e.preventDefault();
            nav({ to: "/plan" });
          }}
          className="rounded-3xl bg-card p-8 shadow-[var(--shadow-elegant)] ring-1 ring-border/60 space-y-8"
        >
          {/* Space */}
          <div>
            <label className="flex items-center gap-2 font-semibold">
              <Ruler className="h-4 w-4 text-primary" />
              Available space
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              Square meters you can dedicate to coop + run.
            </p>
            <div className="mt-4 flex items-center gap-4">
              <input
                type="range"
                min={2}
                max={80}
                value={space}
                onChange={(e) => setSpace(+e.target.value)}
                className="flex-1 accent-[oklch(0.36_0.09_155)]"
              />
              <div className="w-24 text-right">
                <span className="font-display text-3xl font-bold text-primary">{space}</span>
                <span className="text-sm text-muted-foreground ml-1">m²</span>
              </div>
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="flex items-center gap-2 font-semibold">
              <Wallet className="h-4 w-4 text-primary" />
              Monthly feed budget
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              What you can realistically spend on feed each month.
            </p>
            <div className="mt-4 flex items-center gap-4">
              <input
                type="range"
                min={1000}
                max={40000}
                step={500}
                value={budget}
                onChange={(e) => setBudget(+e.target.value)}
                className="flex-1 accent-[oklch(0.36_0.09_155)]"
              />
              <div className="w-32 text-right">
                <span className="font-display text-2xl font-bold text-primary">
                  KES {budget.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Ward */}
          <div>
            <label className="flex items-center gap-2 font-semibold">
              <MapPin className="h-4 w-4 text-primary" />
              Ward
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              We match bylaws and agrovet prices to your ward.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {wards.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWard(w)}
                  className={`rounded-full px-4 py-2 text-sm font-medium ring-1 transition ${
                    ward === w
                      ? "bg-primary text-primary-foreground ring-primary"
                      : "bg-background text-foreground ring-border hover:ring-primary/40"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Species */}
          <div>
            <label className="flex items-center gap-2 font-semibold">
              <Bird className="h-4 w-4 text-primary" />
              Preferred species
            </label>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {species.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSp(s.id)}
                  className={`flex items-start gap-3 rounded-2xl p-4 text-left ring-1 transition ${
                    sp === s.id
                      ? "bg-accent-soft ring-accent"
                      : "bg-background ring-border hover:ring-primary/40"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${
                      sp === s.id ? "bg-accent text-accent-foreground" : "bg-secondary"
                    }`}
                  >
                    {sp === s.id && <CheckCircle2 className="h-4 w-4" />}
                  </span>
                  <div>
                    <div className="font-semibold">{s.label}</div>
                    <div className="text-xs text-muted-foreground">{s.note}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:brightness-110 transition"
          >
            Generate my flock plan <ArrowRight className="h-4 w-4" />
          </button>
        </motion.form>

        {/* Sidebar summary */}
        <aside className="space-y-4">
          <div className="overflow-hidden rounded-3xl">
            <img
              src={coopImg}
              alt="Backyard chicken coop"
              loading="lazy"
              className="w-full aspect-[4/3] object-cover"
            />
          </div>
          <div className="rounded-3xl bg-primary-deep text-primary-foreground p-6">
            <h3 className="font-display text-xl font-semibold">Your inputs</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Space" value={`${space} m²`} />
              <Row label="Budget" value={`KES ${budget.toLocaleString()}/mo`} />
              <Row label="Ward" value={ward} />
              <Row
                label="Species"
                value={species.find((s) => s.id === sp)?.label ?? "—"}
              />
            </dl>
            <p className="mt-6 text-xs text-primary-foreground/70">
              A rule of thumb: layers need ~0.3 m² of coop floor plus 1 m² of run per bird. We
              refine this against your ward's density bylaws.
            </p>
          </div>
        </aside>
      </section>

      <SiteFooter />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-2 last:border-0">
      <dt className="text-primary-foreground/70">{label}</dt>
      <dd className="font-semibold text-accent">{value}</dd>
    </div>
  );
}