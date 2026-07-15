// Offline queue for disease triage submissions.
// Inputs (symptoms + optional photo as data URL) are cached in localStorage
// and auto-synced when the browser comes back online.

import { supabase } from "@/integrations/supabase/client";

const KEY = "poultryfit.triage.queue.v1";

export type QueuedTriage = {
  id: string;
  createdAt: number;
  symptoms: string[];
  photoDataUrl: string | null;
  // Locally-computed placeholder result so the user still gets feedback offline
  topPrediction: string;
  confidence: number;
  synced: boolean;
};

function read(): QueuedTriage[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(items: QueuedTriage[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function enqueueTriage(entry: Omit<QueuedTriage, "id" | "createdAt" | "synced">) {
  const item: QueuedTriage = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    synced: false,
  };
  const items = read();
  items.push(item);
  write(items);
  return item;
}

export function listPending(): QueuedTriage[] {
  return read().filter((i) => !i.synced);
}

export async function syncQueue(): Promise<{ synced: number; failed: number }> {
  const items = read();
  const { data: userRes } = await supabase.auth.getUser();
  const userId = userRes.user?.id;
  if (!userId) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  for (const item of items) {
    if (item.synced) continue;
    const { error } = await supabase.from("diagnosis_audit_log").insert({
      user_id: userId,
      symptoms: item.symptoms,
      has_photo: !!item.photoDataUrl,
      top_prediction: item.topPrediction,
      confidence: item.confidence,
    });
    if (error) {
      failed += 1;
    } else {
      item.synced = true;
      synced += 1;
    }
  }
  // Keep only unsynced entries to avoid growing localStorage
  write(items.filter((i) => !i.synced));
  return { synced, failed };
}