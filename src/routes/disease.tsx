import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Camera,
  Upload,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  WifiOff,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
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
import { RequireAuth } from "@/components/RequireAuth";
import { useServerFn } from "@tanstack/react-start";
import { logDiagnosis, submitDiagnosisFeedback } from "@/lib/diagnosis.functions";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { enqueueTriage, listPending, syncQueue } from "@/lib/triage-queue";
import { toast } from "sonner";

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
  component: () => (
    <RequireAuth>
      <Disease />
    </RequireAuth>
  ),
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

const CLASSES = [
  { name: "Newcastle", tone: "#c98a2a" },
  { name: "Coccidiosis", tone: "#2f5d3a" },
  { name: "Fowl pox", tone: "#7fb069" },
  { name: "Healthy", tone: "#a3a695" },
];

type Prediction = { name: string; value: number; tone: string };

// Deterministic offline scoring — gives farmer immediate best-guess without network.
function scoreLocally(symptoms: string[], hasPhoto: boolean): Prediction[] {
  const weights: Record<string, Record<string, number>> = {
    "Sneezing / coughing": { Newcastle: 30, "Fowl pox": 10 },
    "Watery eyes": { Newcastle: 20, "Fowl pox": 15 },
    "Green droppings": { Newcastle: 35, Coccidiosis: 10 },
    "Loss of appetite": { Newcastle: 10, Coccidiosis: 20, "Fowl pox": 5 },
    "Ruffled feathers": { Coccidiosis: 20, Newcastle: 10 },
    "Sudden death": { Newcastle: 40 },
    "Swollen head": { "Fowl pox": 35 },
    Lameness: { Coccidiosis: 15 },
  };
  const scores: Record<string, number> = { Newcastle: 0, Coccidiosis: 0, "Fowl pox": 0, Healthy: 10 };
  for (const s of symptoms) {
    const w = weights[s];
    if (!w) continue;
    for (const k of Object.keys(w)) scores[k] += w[k];
  }
  if (hasPhoto) {
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    scores[top] += 10;
  }
  if (symptoms.length === 0 && !hasPhoto) return CLASSES.map((c) => ({ ...c, value: 0 }));
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  return CLASSES.map((c) => ({ ...c, value: Math.round((scores[c.name] / total) * 100) }));
}

function Disease() {
  const [selected, setSelected] = useState<string[]>([]);
  const [file, setFile] = useState<string | null>(null);
  const [result, setResult] = useState<Prediction[] | null>(null);
  const [logId, setLogId] = useState<string | null>(null);
  const [feedbackDone, setFeedbackDone] = useState(false);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const online = useOnlineStatus();
  const logDiagnosisFn = useServerFn(logDiagnosis);
  const submitFeedbackFn = useServerFn(submitDiagnosisFeedback);

  useEffect(() => {
    setPendingCount(listPending().length);
  }, []);

  useEffect(() => {
    if (!online) return;
    if (listPending().length === 0) return;
    syncQueue().then(({ synced, failed }) => {
      setPendingCount(listPending().length);
      if (synced > 0) toast.success(`Synced ${synced} offline triage ${synced === 1 ? "entry" : "entries"}`);
      if (failed > 0) toast.error(`${failed} entries failed to sync`);
    });
  }, [online]);

  const toggle = (s: string) =>
    setSelected((cur) =>
      cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]
    );

  const runTriage = async () => {
    if (selected.length === 0 && !file) {
      toast.error("Add at least one symptom or a photo");
      return;
    }
    const preds = scoreLocally(selected, !!file);
    setResult(preds);
    setFeedbackDone(false);
    setLogId(null);
    const top = [...preds].sort((a, b) => b.value - a.value)[0];

    if (!online) {
      enqueueTriage({
        symptoms: selected,
        photoDataUrl: file,
        topPrediction: top.name,
        confidence: top.value,
      });
      setPendingCount(listPending().length);
      toast.info("Offline — result cached, will sync when reconnected");
      return;
    }

    try {
      const res = await logDiagnosisFn({
        data: {
          symptoms: selected,
          hasPhoto: !!file,
          topPrediction: top.name,
          confidence: top.value,
        },
      });
      setLogId(res.id);
    } catch {
      enqueueTriage({
        symptoms: selected,
        photoDataUrl: file,
        topPrediction: top.name,
        confidence: top.value,
      });
      setPendingCount(listPending().length);
      toast.error("Couldn't reach server — cached for later");
    }
  };

  const sendFeedback = async (helpful: boolean) => {
    if (!logId) {
      setFeedbackDone(true);
      toast.success("Thanks — feedback will attach when synced");
      return;
    }
    try {
      await submitFeedbackFn({ data: { id: logId, helpful, note: feedbackNote || undefined } });
      setFeedbackDone(true);
      toast.success("Thanks for the feedback!");
    } catch {
      toast.error("Couldn't save feedback");
    }
  };

  const forceSync = async () => {
    const { synced, failed } = await syncQueue();
    setPendingCount(listPending().length);
    if (synced > 0) toast.success(`Synced ${synced} entries`);
    if (synced === 0 && failed === 0) toast.info("Nothing to sync");
  };

  const topPred = result ? [...result].sort((a, b) => b.value - a.value)[0] : null;
  const chartData: Prediction[] = result ?? CLASSES.map((c) => ({ ...c, value: 0 }));

  return (
    <div className="min-h-screen">
      <SiteNav />

      {(!online || pendingCount > 0) && (
        <div
          className={`mx-auto max-w-7xl px-6 mt-4 flex items-center justify-between gap-3 rounded-2xl p-3 text-sm ring-1 ${
            !online ? "bg-accent-soft ring-accent/40 text-primary-deep" : "bg-secondary ring-border"
          }`}
        >
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4" />
            {!online
              ? "You're offline — triage still works and will sync automatically."
              : `${pendingCount} triage ${pendingCount === 1 ? "entry" : "entries"} waiting to sync.`}
          </div>
          {online && pendingCount > 0 && (
            <button
              onClick={forceSync}
              className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:brightness-110"
            >
              <RefreshCw className="h-3 w-3" /> Sync now
            </button>
          )}
        </div>
      )}

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

            <button
              onClick={runTriage}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground shadow-[var(--shadow-amber)] hover:brightness-105 transition"
            >
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
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {topPred ? `Likely: ${topPred.name}` : "Awaiting input"}
                </span>
                <h3 className="mt-3 font-display text-3xl font-bold">
                  {topPred ? `${topPred.value}% confidence` : "No result yet"}
                </h3>
                <p className="text-sm text-primary-foreground/85 mt-1">
                  {topPred
                    ? topPred.name === "Healthy"
                      ? "Bird looks healthy — keep monitoring."
                      : `Suggests ${topPred.name}. Consult a vet to confirm.`
                    : "Upload a photo or select symptoms, then run triage."}
                </p>
              </div>
            </div>

            <div className="p-6 bg-card">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Confidence by class
              </h4>
              <div className="mt-3 h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
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
                      {chartData.map((p, i) => (
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
                    <strong>Recommended next step:</strong>{" "}
                    {topPred
                      ? topPred.name === "Healthy"
                        ? "No urgent action. Maintain clean water and dry bedding."
                        : "Isolate the affected bird and contact the nearest vet below."
                      : "Run triage to see guidance tailored to your bird."}
                  </span>
                </p>
              </div>

              {result && (
                <div className="mt-4 rounded-xl bg-secondary p-4 ring-1 ring-border/60">
                  {feedbackDone ? (
                    <p className="text-sm text-muted-foreground text-center">
                      Thanks — your feedback helps improve the model.
                    </p>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-primary-deep">
                        Was this diagnosis helpful?
                      </p>
                      <textarea
                        value={feedbackNote}
                        onChange={(e) => setFeedbackNote(e.target.value)}
                        placeholder="Optional: what did you actually observe?"
                        rows={2}
                        className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => sendFeedback(true)}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110"
                        >
                          <ThumbsUp className="h-4 w-4" /> Helpful
                        </button>
                        <button
                          onClick={() => sendFeedback(false)}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-background px-4 py-2 text-sm font-semibold ring-1 ring-border hover:ring-primary/40"
                        >
                          <ThumbsDown className="h-4 w-4" /> Not helpful
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
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
                  See vets near your ward
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