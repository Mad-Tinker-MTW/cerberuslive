import type { AvailabilityDay } from "@/lib/db";
import { BookingForm } from "./BookingForm";

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

export function BookingPanel({
  slug,
  name,
  availability,
}: {
  slug: string;
  name: string;
  availability?: AvailabilityDay[];
}) {
  const hasAvailability = availability && availability.length > 0;

  return (
    <section id="booking" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {hasAvailability && <AvailabilityCard days={availability} />}
      <div className={hasAvailability ? "" : "lg:col-span-2"}>
        <BookingForm slug={slug} artistName={name} />
      </div>
    </section>
  );
}
