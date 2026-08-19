import { Card } from "./ui";
import type { Collection } from "@/config/content";

export default function CollectionGrid({ items }: { items: Collection[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Card key={item.slug} id={item.slug} className="flex h-full scroll-mt-32 flex-col">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="display text-3xl">{item.name}</h3>
            {item.meta ? <span className="text-[0.6rem] uppercase tracking-[0.22em] text-smoke">{item.meta}</span> : null}
          </div>
          <div className="gold-rule my-5 w-14" />
          <p className="lede text-sm">{item.blurb}</p>
          <p className="mt-4 flex-1 text-sm leading-relaxed text-ivory/60">{item.detail}</p>
          <ul className="mt-6 space-y-2 border-t border-white/8 pt-5">
            {item.highlights.map((h) => (
              <li key={h} className="flex gap-3 text-xs text-smoke">
                <span className="text-gold">—</span>
                {h}
              </li>
            ))}
          </ul>
          {item.from ? (
            <p className="mt-6 text-[0.7rem] uppercase tracking-[0.22em] text-champagne">From {item.from}</p>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
