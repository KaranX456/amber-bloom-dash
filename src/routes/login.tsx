import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Egg, Eye, EyeOff, Mail, Lock, Phone, ShieldCheck, Sprout, LineChart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import coopImg from "@/assets/coop.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — PoultryFit Kenya" },
      {
        name: "description",
        content:
          "Sign in to PoultryFit Kenya to manage your flock plan, disease checks, and vet contacts.",
      },
      { property: "og:title", content: "Sign in — PoultryFit Kenya" },
      {
        property: "og:description",
        content: "Access your flock dashboard, triage history, and saved agrovets.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // If already signed in, route to onboarding or planner based on profile.
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      await routeAfterAuth(data.session.user.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function routeAfterAuth(userId: string) {
    const { data: profile } = await supabase
      .from("farmer_profiles")
      .select("onboarding_completed")
      .eq("user_id", userId)
      .maybeSingle();
    if (profile?.onboarding_completed) {
      navigate({ to: "/planner" });
    } else {
      navigate({ to: "/onboarding" });
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        const { error } =
          mode === "email"
            ? await supabase.auth.signUp({
                email,
                password,
                options: { emailRedirectTo: `${window.location.origin}/onboarding` },
              })
            : await supabase.auth.signUp({ phone, password });
        if (error) throw error;
        toast.success(
          mode === "email"
            ? "Account created. Check your email to confirm, then sign in."
            : "Account created. Sign in to continue.",
        );
        setIsSignup(false);
      } else {
        const { data: signInData, error } =
          mode === "email"
            ? await supabase.auth.signInWithPassword({ email, password })
            : await supabase.auth.signInWithPassword({ phone, password });
        if (error) throw error;
        toast.success("Welcome back!");
        if (signInData.user) await routeAfterAuth(signInData.user.id);
        else navigate({ to: "/onboarding" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message || "Google sign-in failed");
        setGoogleLoading(false);
        return;
      }
      if (result.redirected) return; // full-page redirect in progress
      // Session set via popup — route based on profile completeness
      const { data } = await supabase.auth.getUser();
      if (data.user) await routeAfterAuth(data.user.id);
      else navigate({ to: "/onboarding" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr]">
      {/* LEFT — brand / imagery panel */}
      <aside
        className="relative hidden lg:flex flex-col justify-between overflow-hidden p-10 text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage: `url(${coopImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          className="absolute -top-32 -right-32 h-96 w-96 rounded-full blur-3xl opacity-40"
          style={{ background: "var(--gradient-amber)" }}
        />
        <div
          className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full blur-3xl opacity-25 bg-primary-glow"
        />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-[var(--shadow-amber)]">
              <Egg className="h-5 w-5" />
            </span>
            <span className="font-display text-2xl font-bold">
              PoultryFit<span className="text-accent">.</span>
            </span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 space-y-8"
        >
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs font-medium ring-1 ring-white/20">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              For Kenyan smallholder farmers
            </p>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] font-bold">
              Every hen accounted for.<br />
              <span className="text-accent">Every shilling explained.</span>
            </h1>
            <p className="mt-5 max-w-md text-primary-foreground/80 text-lg">
              Sign in to open your flock dashboard — feed schedules, egg curves,
              disease alerts, and the nearest agrovet.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md">
            {[
              { icon: Sprout, label: "Flock plan", stat: "42 hens" },
              { icon: LineChart, label: "Egg curve", stat: "78%" },
              { icon: ShieldCheck, label: "Health", stat: "Stable" },
            ].map((c) => (
              <div
                key={c.label}
                className="rounded-2xl bg-white/10 backdrop-blur-md p-4 ring-1 ring-white/15"
              >
                <c.icon className="h-5 w-5 text-accent" />
                <div className="mt-3 text-lg font-display font-bold">{c.stat}</div>
                <div className="text-xs text-primary-foreground/70">{c.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="relative z-10 text-xs text-primary-foreground/60">
          © 2026 PoultryFit Kenya · Built with farmers in Kiambu, Nakuru & Kisumu
        </div>
      </aside>

      {/* RIGHT — form */}
      <main className="flex items-center justify-center px-6 py-12 sm:px-10 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground"
              style={{ background: "var(--gradient-hero)" }}
            >
              <Egg className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-bold text-primary-deep">
              PoultryFit<span className="text-accent">.</span>
            </span>
          </div>

          <h2 className="font-display text-4xl font-bold text-primary-deep">
            {isSignup ? "Join PoultryFit 🐣" : "Karibu tena 👋"}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {isSignup
              ? "Create an account to save your flock plan."
              : "Sign in to continue managing your flock."}
          </p>

          {/* Social */}
          <div className="mt-8">
            <button
              type="button"
              onClick={onGoogle}
              disabled={googleLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-secondary transition disabled:opacity-60"
            >
              <GoogleIcon className="h-4 w-4" />
              {googleLoading ? "Connecting…" : "Continue with Google"}
            </button>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or continue with
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Tabs */}
          <div className="inline-flex rounded-full bg-secondary p-1 text-sm">
            {(["email", "phone"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-1.5 rounded-full font-medium transition ${
                  mode === m
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-secondary-foreground/70 hover:text-primary"
                }`}
              >
                {m === "email" ? "Email" : "Phone"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground/80">
                {mode === "email" ? "Email address" : "Phone number"}
              </label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {mode === "email" ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                </span>
                <input
                  required
                  type={mode === "email" ? "email" : "tel"}
                  value={mode === "email" ? email : phone}
                  onChange={(e) =>
                    mode === "email" ? setEmail(e.target.value) : setPhone(e.target.value)
                  }
                  placeholder={mode === "email" ? "you@farm.co.ke" : "+254 7XX XXX XXX"}
                  className="w-full rounded-xl border border-input bg-card pl-10 pr-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground/80">Password</label>
                <button
                  type="button"
                  onClick={async () => {
                    if (!email) {
                      toast.info("Enter your email above first.");
                      return;
                    }
                    const { error } = await supabase.auth.resetPasswordForEmail(email, {
                      redirectTo: `${window.location.origin}/login`,
                    });
                    if (error) toast.error(error.message);
                    else toast.success("Password reset link sent.");
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  required
                  minLength={6}
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-input bg-card pl-10 pr-10 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle password"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-input accent-[var(--primary)]"
                defaultChecked
              />
              Keep me signed in on this device
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:brightness-110 transition disabled:opacity-70"
            >
              {loading
                ? isSignup
                  ? "Creating account…"
                  : "Signing in…"
                : isSignup
                  ? "Create my account"
                  : "Sign in to my flock"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignup ? "Already have an account?" : "New to PoultryFit?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignup((v) => !v)}
              className="font-semibold text-primary hover:underline"
            >
              {isSignup ? "Sign in" : "Create an account"}
            </button>
          </p>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By continuing you agree to our Terms & Privacy. We never sell farmer data.
          </p>
        </motion.div>
      </main>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3c-2 1.4-4.6 2.3-7.3 2.3-5.2 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.3 5.3C41.5 35.9 44 30.4 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}