import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import {
  Phone,
  MapPin,
  Star,
  Clock,
  Search,
  Navigation,
  BadgeCheck,
  Loader2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { RequireAuth } from "@/components/RequireAuth";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/vets")({
  head: () => ({
    meta: [
      { title: "Vets & Agrovets · PoultryFit Kenya" },
      {
        name: "description",
        content:
          "Find the nearest vet or agrovet to your farm, with contact details, ratings, travel time and community-verified supply confirmations.",
      },
      { property: "og:title", content: "Community-verified vets & agrovets" },
      {
        property: "og:description",
        content:
          "Farmer-confirmed agrovets near your ward — see who actually had stock before you travel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Vets />
    </RequireAuth>
  ),
});

type Provider = {
  id: string;
  name: string;
  kind: string;
  distance_km: number | null;
  rating: number | null;
  phone: string | null;
  hours: string | null;
  address: string | null;
  map_x: number | null;
  map_y: number | null;
};

type Verification = {
  id: string;
  agrovet_id: string;
  user_id: string;
  purchased_successfully: boolean;
  note: string | null;
};

function Vets() {
  const { user } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [filter, setFilter] = useState<"All" | "Vet" | "Agrovet" | "Verified">("All");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    const [p, v] = await Promise.all([
      supabase
        .from("agrovets")
        .select("id,name,kind,distance_km,rating,phone,hours,address,map_x,map_y")
        .order("distance_km", { ascending: true, nullsFirst: false }),
      supabase
        .from("agrovet_verifications")
        .select("id,agrovet_id,user_id,purchased_successfully,note"),
    ]);
    if (p.error) toast.error("Could not load providers");
    setProviders((p.data as Provider[]) ?? []);
    setVerifications((v.data as Verification[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const countFor = (id: string) =>
    verifications.filter((v) => v.agrovet_id === id && v.purchased_successfully).length;
  const mine = (id: string) => verifications.find((v) => v.agrovet_id === id && v.user_id === user?.id);

  const list = providers.filter(
    (p) =>
      (filter === "All" ||
        (filter === "Verified" ? countFor(p.id) > 0 : p.kind === filter)) &&
      (q === "" || p.name.toLowerCase().includes(q.toLowerCase()))
  );

  const selected = providers.find((x) => x.id === active) ?? null;
  const myVerification = selected ? mine(selected.id) : undefined;

  useEffect(() => {
    setNote(myVerification?.note ?? "");
  }, [myVerification?.id, active]);

  async function confirmPurchase(purchased: boolean) {
    if (!selected || !user) return;
    setSaving(true);
    const { error } = await supabase.from("agrovet_verifications").upsert(
      {
        agrovet_id: selected.id,
        user_id: user.id,
        purchased_successfully: purchased,
        note: note.trim() || null,
      },
      { onConflict: "agrovet_id,user_id" }
    );
    setSaving(false);
    if (error) {
      toast.error("Could not save your confirmation");
      return;
    }
    toast.success(purchased ? "Thanks — marked as verified" : "Thanks for the feedback");
    void load();
  }

  async function removeVerification() {
    if (!myVerification) return;
    setSaving(true);
    const { error } = await supabase
      .from("agrovet_verifications")
      .delete()
      .eq("id", myVerification.id);
    setSaving(false);
    if (error) {
      toast.error("Could not remove your confirmation");
      return;
    }
    toast.success("Confirmation removed");
    void load();
  }

  return (
    <div className="min-h-screen">
      <SiteNav />

      <section className="mx-auto max-w-7xl px-6 pt-16">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">
          Step 4 · Nearest help
        </span>
        <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold text-primary-deep">
          Vets & agrovets near you.
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl">
          Sorted by distance from your ward — and verified by farmers who actually bought
          supplies there.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 mt-10 grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* List */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-full bg-card p-1 ring-1 ring-border/60 shadow-sm">
            <Search className="ml-3 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name…"
              className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(["All", "Vet", "Agrovet", "Verified"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold ring-1 transition ${
                  filter === k
                    ? "bg-primary text-primary-foreground ring-primary"
                    : "bg-background ring-border text-foreground/70 hover:ring-primary/40"
                }`}
              >
                {k === "Verified" ? "Community verified" : k}
              </button>
            ))}
          </div>

          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {loading && (
              <div className="flex justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
            {!loading && list.length === 0 && (
              <div className="rounded-2xl bg-card p-6 text-sm text-muted-foreground ring-1 ring-border/60 text-center">
                No vets or agrovets loaded yet.
              </div>
            )}
            {list.map((p) => {
              const on = active === p.id;
              const votes = countFor(p.id);
              return (
                <motion.button
                  layout
                  key={p.id}
                  onClick={() => setActive(p.id)}
                  className={`w-full text-left rounded-2xl p-4 ring-1 shadow-sm transition ${
                    on
                      ? "bg-primary-deep text-primary-foreground ring-accent"
                      : "bg-card ring-border/60 hover:ring-primary/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            on
                              ? "bg-accent text-accent-foreground"
                              : p.kind === "Vet"
                                ? "bg-primary text-primary-foreground"
                                : "bg-accent text-accent-foreground"
                          }`}
                        >
                          {p.kind}
                        </span>
                        {votes > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary ring-1 ring-primary/30">
                            <BadgeCheck className="h-3 w-3" /> Verified · {votes}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 font-display font-semibold">{p.name}</div>
                      <div
                        className={`text-xs mt-1 ${
                          on ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {p.address}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-display text-xl font-bold ${
                          on ? "text-accent" : "text-primary"
                        }`}
                      >
                        {p.distance_km ?? 0} km
                      </div>
                      <div
                        className={`text-xs flex items-center gap-1 justify-end ${
                          on ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        <Star className="h-3 w-3 fill-current text-accent" /> {p.rating ?? 0}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Map + details */}
        <div className="space-y-4">
          <div
            className="relative overflow-hidden rounded-3xl ring-1 ring-border/60 shadow-[var(--shadow-elegant)] h-[420px]"
            style={{
              background:
                "radial-gradient(circle at 40% 40%, oklch(0.55 0.14 150 / 0.25), transparent 60%), radial-gradient(circle at 70% 70%, oklch(0.78 0.16 75 / 0.15), transparent 55%), oklch(0.94 0.03 120)",
            }}
          >
            <svg
              className="absolute inset-0 h-full w-full opacity-30"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2f5d3a" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
              <path
                d="M 0 200 Q 200 120 400 250 T 800 300"
                fill="none"
                stroke="#c98a2a"
                strokeWidth="4"
                opacity="0.5"
              />
              <path
                d="M 100 0 Q 200 200 350 400"
                fill="none"
                stroke="#2f5d3a"
                strokeWidth="3"
                opacity="0.4"
              />
            </svg>

            <div
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: "45%", top: "50%" }}
            >
              <div className="relative">
                <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
                <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-primary ring-4 ring-primary/20">
                  <span className="h-2 w-2 rounded-full bg-primary-foreground" />
                </span>
              </div>
              <div className="mt-1 whitespace-nowrap text-[10px] font-semibold text-primary-deep bg-white/80 rounded px-1.5 py-0.5">
                You
              </div>
            </div>

            {providers.map((p) => {
              const on = active === p.id;
              const verified = countFor(p.id) > 0;
              return (
                <button
                  key={p.id}
                  onClick={() => setActive(p.id)}
                  className="absolute -translate-x-1/2 -translate-y-full group"
                  style={{ left: `${p.map_x ?? 50}%`, top: `${p.map_y ?? 50}%` }}
                >
                  <div
                    className={`flex flex-col items-center transition ${
                      on ? "scale-125" : "scale-100 hover:scale-110"
                    }`}
                  >
                    <div
                      className={`relative flex h-9 w-9 items-center justify-center rounded-full shadow-lg ring-2 ring-white ${
                        on ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <MapPin className="h-4 w-4" />
                      {verified && (
                        <BadgeCheck className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-white text-primary" />
                      )}
                    </div>
                    <div className="mt-0.5 h-2 w-2 rotate-45 bg-white ring-1 ring-black/10 -mt-1" />
                    {on && (
                      <div className="mt-1 rounded-md bg-primary-deep px-2 py-1 text-[10px] font-semibold text-primary-foreground whitespace-nowrap">
                        {p.name}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Details card */}
          {!selected ? (
            <div className="rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-sm text-sm text-muted-foreground text-center">
              Select a provider to see details.
            </div>
          ) : (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-sm grid gap-6 md:grid-cols-3"
            >
              <div className="md:col-span-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-block rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
                    {selected.kind}
                  </span>
                  {countFor(selected.id) > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary ring-1 ring-primary/30">
                      <BadgeCheck className="h-3 w-3" /> Verified by community
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-display text-2xl font-bold text-primary-deep">
                  {selected.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{selected.address}</p>
                <div className="mt-4 grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" /> {selected.phone ?? "—"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" /> {selected.hours ?? "—"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-primary" /> {selected.distance_km ?? 0} km ·
                    ~{Math.round((selected.distance_km ?? 0) * 4)} min by boda
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" /> {countFor(selected.id)} farmer
                    {countFor(selected.id) === 1 ? "" : "s"} confirmed a successful purchase
                  </div>
                </div>

                {/* Community verification */}
                <div className="mt-5 rounded-2xl bg-accent-soft/60 p-4 ring-1 ring-border/60">
                  <div className="font-display font-semibold text-primary-deep">
                    Did you buy supplies here?
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your confirmation helps other farmers know who actually has stock.
                  </p>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    placeholder="Optional note (what you bought, prices, stock…)"
                    className="mt-3 w-full rounded-xl bg-background p-3 text-sm ring-1 ring-border outline-none focus:ring-primary/50"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      disabled={saving}
                      onClick={() => confirmPurchase(true)}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition disabled:opacity-60 ${
                        myVerification?.purchased_successfully
                          ? "bg-primary text-primary-foreground"
                          : "bg-background ring-1 ring-border hover:ring-primary/50"
                      }`}
                    >
                      <BadgeCheck className="h-4 w-4" /> Yes, I bought here
                    </button>
                    <button
                      disabled={saving}
                      onClick={() => confirmPurchase(false)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition disabled:opacity-60 ${
                        myVerification && !myVerification.purchased_successfully
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-background ring-1 ring-border hover:ring-primary/50"
                      }`}
                    >
                      No stock / bad trip
                    </button>
                    {myVerification && (
                      <button
                        disabled={saving}
                        onClick={removeVerification}
                        className="rounded-full px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-60"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Recent community notes */}
                {verifications.filter((v) => v.agrovet_id === selected.id && v.note).length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Farmer notes
                    </div>
                    {verifications
                      .filter((v) => v.agrovet_id === selected.id && v.note)
                      .slice(0, 4)
                      .map((v) => (
                        <div
                          key={v.id}
                          className="rounded-xl bg-background p-3 text-sm ring-1 ring-border/60"
                        >
                          <span
                            className={`mr-2 text-[10px] font-bold uppercase ${
                              v.purchased_successfully ? "text-primary" : "text-destructive"
                            }`}
                          >
                            {v.purchased_successfully ? "Verified" : "No stock"}
                          </span>
                          {v.note}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between gap-3">
                <div className="rounded-2xl bg-accent-soft p-4 text-center">
                  <div className="font-display text-4xl font-bold text-primary-deep">
                    {selected.rating ?? 0}
                  </div>
                  <div className="flex justify-center gap-0.5 mt-1 text-accent">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < Math.round(selected.rating ?? 0) ? "fill-current" : ""
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                    Google reviews
                  </div>
                </div>
                <div className="rounded-2xl bg-primary-deep p-4 text-center text-primary-foreground">
                  <div className="font-display text-4xl font-bold text-accent">
                    {countFor(selected.id)}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-primary-foreground/70 mt-1">
                    Community confirmations
                  </div>
                </div>
                <a
                  href={`tel:${(selected.phone ?? "").replace(/\s/g, "")}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110 transition"
                >
                  <Phone className="h-4 w-4" /> Call now
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
