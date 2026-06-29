"use client";

import { useState } from "react";

export function ContactForm({ defaultName = "", defaultEmail = "" }: { defaultName?: string; defaultEmail?: string }) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !body.trim()) {
      setError("Name and message are required.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, subject, body }),
    });
    if (res.ok) {
      setStatus("sent");
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error || "Could not send. Try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-border bg-panel p-6 text-center">
        <div className="mb-2 text-2xl text-green">&#10003;</div>
        <h2 className="text-lg font-semibold">Message sent</h2>
        <p className="mt-2 text-sm text-muted">We will get back to you at {email || "your email"}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-xl border border-border bg-panel p-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" className="h-11 rounded-md border border-border bg-panel-soft px-3 text-sm outline-none focus:border-red" />
        <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" autoComplete="email" className="h-11 rounded-md border border-border bg-panel-soft px-3 text-sm outline-none focus:border-red" />
      </div>
      <input id="subject" name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject (optional)" className="h-11 rounded-md border border-border bg-panel-soft px-3 text-sm outline-none focus:border-red" />
      <textarea id="body" name="body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="How can we help?" rows={6} className="rounded-md border border-border bg-panel-soft px-3 py-2 text-sm outline-none focus:border-red" />
      {status === "error" && <p className="text-sm text-red">{error}</p>}
      <button type="submit" disabled={status === "sending"} className="h-11 rounded-md bg-red text-sm font-semibold text-white transition hover:bg-red-dark disabled:opacity-50">
        {status === "sending" ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
