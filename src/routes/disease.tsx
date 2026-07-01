import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Camera,
  Upload,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import roosterImg from "@/assets/rooster.jpg";

export const Route = createFileRoute("/disease")({
  head: () => ({
    meta: [
      { title: "Disease Check · PoultryFit Kenya" },
      {
        name: "description",
        content:
          "Upload a photo or select symptoms. Our ML model returns a category and honest confidence score, so you know when to call a vet.",
      },
    ],
  }),
  component: Disease,
});

const symptomsList = [
  "Sneezing / coughing",
  "Watery eyes",
  "Green droppings",
  "Loss of appetite",
  "Ruffled feathers",
  "Sudden death",
  "Swollen head",
  "Lameness",
];

const predictions = [
  { name: "Newcastle", value: 71, tone: "#c98a2a" },
  { name: "Coccidiosis", value: 18, tone: "#2f5d3a" },
  { name: "Fowl pox", value: 8, tone: "#7fb069" },
  { name: "Healthy", value: 3, tone: "#a3a695" },
];

function Disease() {
  const [selected, setSelected] = useState<string[]>(["Green droppings", "Loss of appetite"]);
  const [file, setFile] = useState<string | null>(null);

  const toggle = (s: string) =>
    setSelected((cur) =>
      cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]
    );

  return (
    <div className="min-h-screen">
      <SiteNav />

      <section className="mx-auto max-w-7xl px-6 pt-16">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">
          Step 3 · Disease triage
        </span>
        <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold text-primary-deep max-w-2xl">
          Something off with your bird?
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl">
          Upload a photo, tap the symptoms you're seeing, or both. You'll get a category, a
          confidence score, and a clear next step.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Left: inputs */}
        <div className="space-y-6">
          {/* Upload */}
          <div className="rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-sm">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" /> Upload a photo
            </h3>
            <label
              className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-background p-10 text-center transition hover:border-primary hover:bg-secondary/50"
            >
              {file ? (
                <img src={file} alt="Uploaded" className="max-h-48 rounded-xl" />
              ) : (
                <>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <Upload className="h-5 w-5" />
                  </span>
                  <div className="mt-3 font-medium">Drop a photo or tap to choose</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    JPG or PNG, up to 5 MB · face, eyes, comb work best
                  </div>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setFile(URL.createObjectURL(f));
                }}
              />
            </label>
          </div>

          {/* Symptoms */}
          <div className="rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-sm">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" /> Symptoms observed
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Optional — used as fallback when there's no photo, or to boost accuracy.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {symptomsList.map((s) => {
                const on = selected.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggle(s)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm ring-1 transition ${
                      on
                        ? "bg-primary text-primary-foreground ring-primary"
                        : "bg-background ring-border hover:ring-primary/40"
                    }`}
                  >
                    {on && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {s}
                  </button>
                );
              })}
            </div>

            <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground shadow-[var(--shadow-amber)] hover:brightness-105 transition">
              Run triage <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right: result */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="overflow-hidden rounded-3xl ring-1 ring-border/60 shadow-[var(--shadow-elegant)]">
            <div className="relative">
              <img
                src={roosterImg}
                alt="Rooster"
                loading="lazy"
                className="h-56 w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/90 via-primary-deep/40 to-transparent" />
              <div className="absolute bottom-0 p-6 text-primary-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                  <AlertTriangle className="h-3.5 w-3.5" /> High confidence
                </span>
                <h3 className="mt-3 font-display text-3xl font-bold">Newcastle disease</h3>
                <p className="text-sm text-primary-foreground/85 mt-1">
                  Confidence 71% · symptom match strong
                </p>
              </div>
            </div>

            <div className="p-6 bg-card">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Confidence by class
              </h4>
              <div className="mt-3 h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={predictions} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e2d8" />
                    <XAxis type="number" domain={[0, 100]} stroke="#6b7160" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="#6b7160" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid #e5e2d8",
                        borderRadius: 12,
                      }}
                      formatter={(v: number) => [`${v}%`, "Confidence"]}
                    />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                      {predictions.map((p, i) => (
                        <Cell key={i} fill={p.tone} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 rounded-xl bg-accent-soft p-4 text-sm">
                <p className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <span>
                    <strong>Recommended next step:</strong> Isolate the bird immediately, avoid
                    contact with the flock, and call a vet within 24 hours. Vaccination for the
                    rest of the flock is advised.
                  </span>
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/vets"
            className="block rounded-3xl bg-primary-deep text-primary-foreground p-6 hover:brightness-110 transition"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-accent">Get help now</div>
                <div className="font-display text-xl font-semibold mt-1">
                  See vets near Juja Ward
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-accent" />
            </div>
          </Link>
        </motion.div>
      </section>

      <SiteFooter />
    </div>
  );
}