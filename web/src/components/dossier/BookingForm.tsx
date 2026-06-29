"use client";

import { useState } from "react";

// In-platform booking / message request. POSTs to /api/bookings, which records
// it and notifies the artist (or the Cerberus desk for managed artists).

export function BookingForm({
  slug,
  artistName,
  bookingsOpen = true,
}: {
  slug: string;
  artistName: string;
  bookingsOpen?: boolean;
}) {
  const [kind, setKind] = useState<"booking" | "message">(bookingsOpen ? "booking" : "message");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Your name and a valid email are required.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        kind,
        requesterName: name.trim(),
        requesterEmail: email.trim(),
        eventDate: eventDate.trim(),
        message: message.trim(),
      }),
    });
    if (res.ok) setStatus("sent");
    else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error || "Could not send. Try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-green/30 bg-green/10 p-5 text-center">
        <div className="mb-1 text-2xl text-green">&#10003;</div>
        <p className="text-sm text-foreground">Request sent.</p>
        <p className="mt-1 text-sm text-muted">
          {artistName} (or the Cerberus desk) will reach out to {email}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-panel-soft p-5">
      {!bookingsOpen && (
        <p className="mb-4 rounded-md border border-border bg-panel px-3 py-2 text-xs text-muted">
          {artistName} is not currently accepting bookings. You can still send a message.
        </p>
      )}
      <div className="mb-4 flex gap-2">
        {(["booking", "message"] as const).map((k) => {
          const disabled = k === "booking" && !bookingsOpen;
          return (
            <button
              key={k}
              type="button"
              disabled={disabled}
              onClick={() => setKind(k)}
              className={`rounded-md border px-3 py-1.5 text-xs transition disabled:cursor-not-allowed disabled:opacity-40 ${
                kind === k ? "border-red bg-red/10 text-red" : "border-border text-muted hover:border-red"
              }`}
            >
              {k === "booking" ? "Request Booking" : "Message"}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="h-11 rounded-md border border-border bg-panel px-3 text-sm outline-none focus:border-red"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="h-11 rounded-md border border-border bg-panel px-3 text-sm outline-none focus:border-red"
          />
        </div>
        {kind === "booking" && (
          <input
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            placeholder="Event date / window (optional)"
            className="h-11 rounded-md border border-border bg-panel px-3 text-sm outline-none focus:border-red"
          />
        )}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={kind === "booking" ? "Venue, budget, details..." : "Your message..."}
          rows={3}
          className="rounded-md border border-border bg-panel px-3 py-2 text-sm outline-none focus:border-red"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="h-11 rounded-md bg-red text-sm font-semibold text-white transition hover:bg-red-dark disabled:opacity-50"
        >
          {status === "sending" ? "Sending..." : kind === "booking" ? "Send booking request" : "Send message"}
        </button>
        {status === "error" && <p className="text-sm text-red">{error}</p>}
      </div>
    </form>
  );
}
