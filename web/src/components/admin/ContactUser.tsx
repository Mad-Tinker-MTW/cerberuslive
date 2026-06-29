"use client";

import { useState } from "react";

/** Compose-and-send an email to a user from their detail page. */
export function ContactUser({ userId, label }: { userId: string; label: string }) {
  const [openForm, setOpenForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [note, setNote] = useState("");

  async function send() {
    if (!subject.trim() || !body.trim()) {
      setNote("Subject and message required.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setNote("");
    const res = await fetch("/api/admin/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, subject, body }),
    });
    const d = (await res.json().catch(() => ({}))) as { dev?: boolean; error?: string };
    if (res.ok) {
      setStatus("sent");
      setNote(d.dev ? "Recorded. Email not sent (RESEND_KEY not set in this environment)." : "Email sent.");
      setSubject("");
      setBody("");
    } else {
      setStatus("error");
      setNote(d.error || "Could not send.");
    }
  }

  if (!openForm) {
    return (
      <button type="button" onClick={() => { setOpenForm(true); setStatus("idle"); setNote(""); }} className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:border-red hover:text-foreground">
        Contact {label}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-panel-soft p-3">
      <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="h-10 rounded-md border border-border bg-panel px-3 text-sm outline-none focus:border-red" />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder={`Message to ${label}...`} className="rounded-md border border-border bg-panel px-3 py-2 text-sm outline-none focus:border-red" />
      <div className="flex items-center gap-2">
        <button type="button" disabled={status === "sending"} onClick={send} className="rounded-md bg-red px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-dark disabled:opacity-50">
          {status === "sending" ? "Sending..." : "Send email"}
        </button>
        <button type="button" onClick={() => setOpenForm(false)} className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition hover:text-foreground">Close</button>
        {note && <span className={`text-xs ${status === "error" ? "text-red" : "text-muted"}`}>{note}</span>}
      </div>
    </div>
  );
}
