import { Link, useRouterState } from "@tanstack/react-router";
import { Egg, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/", label: "Home" },
  { to: "/planner", label: "Planner" },
  { to: "/plan", label: "Flock Plan" },
  { to: "/disease", label: "Disease Check" },
  { to: "/vets", label: "Vets & Agrovets" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground shadow-md"
            style={{ background: "var(--gradient-hero)" }}
          >
            <Egg className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-bold text-primary-deep">
            PoultryFit<span className="text-accent">.</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = path === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:text-primary hover:bg-secondary"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <Link
          to="/planner"
          className="hidden md:inline-flex items-center rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-amber)] hover:brightness-105 transition"
        >
          Start planning
        </Link>
        <button
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-secondary"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-primary-deep text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-12 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Egg className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-bold">PoultryFit Kenya</span>
          </div>
          <p className="mt-4 text-sm text-primary-foreground/70 max-w-sm">
            Real flock plans, honest disease triage, and the nearest vet — built for smallholder
            farmers across Kenya.
          </p>
        </div>
        <div className="text-sm">
          <h4 className="font-semibold mb-3 text-accent">Product</h4>
          <ul className="space-y-2 text-primary-foreground/70">
            <li>Flock Planner</li>
            <li>Disease Triage</li>
            <li>Agrovet Prices</li>
            <li>Vet Finder</li>
          </ul>
        </div>
        <div className="text-sm">
          <h4 className="font-semibold mb-3 text-accent">Built by</h4>
          <ul className="space-y-2 text-primary-foreground/70">
            <li>Eugene &amp; Sheldon — Frontend</li>
            <li>Benedict &amp; Linet — Backend</li>
            <li>Nicholas &amp; Susan — ML</li>
            <li>Josphat — Deployment</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-primary-foreground/60">
        © 2026 PoultryFit Kenya · A 7-person team project
      </div>
    </footer>
  );
}