import type { AvailabilityDay } from "@/lib/db";

function AvailabilityCard({ days }: { days: AvailabilityDay[] }) {
  return (
    <div className="rounded-xl border border-border bg-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-widest text-muted">
          Upcoming Availability
        </h3>
        <button
          type="button"
          className="text-xs text-muted transition hover:text-foreground"
        >
          View Full Calendar
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => {
          const booked = d.state === "booked";
          return (
            <div
              key={i}
              className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2.5 text-center ${
                booked
                  ? "border-red/30 bg-red/10"
                  : "border-green/30 bg-green/10"
              }`}
            >
              <span className="text-xs text-muted">{d.day}</span>
              <span
                className={`text-[10px] font-medium ${
                  booked ? "text-red" : "text-green"
                }`}
              >
                {booked ? "Booked" : "Open"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BookingRequestCard({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const mailto = `mailto:${email}?subject=${encodeURIComponent(
    `Booking request: ${name}`
  )}`;
  return (
    <div className="rounded-xl border border-border bg-panel-soft p-5">
      <h3 className="mb-2 text-xs uppercase tracking-widest text-muted">
        Booking Request
      </h3>
      <p className="mb-4 text-sm text-foreground/85">
        Bring {name} to your stage. Send a request and the Cerberus desk routes it
        to the artist.
      </p>
      <a
        href={mailto}
        className="block rounded-md bg-red px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-red-dark"
      >
        Request Booking
      </a>
      <a
        href={mailto}
        className="mt-3 block text-center text-sm text-muted transition hover:text-foreground"
      >
        {email}
      </a>
    </div>
  );
}

export function BookingPanel({
  name,
  bookingEmail,
  availability,
}: {
  name: string;
  bookingEmail: string | null;
  availability?: AvailabilityDay[];
}) {
  const hasAvailability = availability && availability.length > 0;
  const email = bookingEmail ?? "booking@cerberuslive.studio";

  return (
    <section id="booking" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {hasAvailability && <AvailabilityCard days={availability} />}
      <BookingRequestCard name={name} email={email} />
    </section>
  );
}
