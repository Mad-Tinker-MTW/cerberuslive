import Link from "next/link";
import type { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div className={`${centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"} ${className}`}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="display mt-4 text-4xl sm:text-5xl">{title}</h2>
      <div className={`gold-rule my-6 w-24 ${centered ? "mx-auto" : ""}`} />
      {lede ? <p className="lede text-base sm:text-lg">{lede}</p> : null}
    </div>
  );
}

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "gold" | "outline" | "ghost";
  className?: string;
};

export function Button({ href, children, variant = "gold", className = "" }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 px-7 py-3.5 text-xs uppercase tracking-[0.22em] transition-all duration-300";
  const styles = {
    gold: "bg-gradient-to-r from-gold-deep via-gold to-champagne text-onyx font-semibold hover:brightness-110 hover:shadow-[0_18px_40px_-18px_rgba(212,175,55,0.8)]",
    outline: "border border-gold/50 text-champagne hover:border-gold hover:bg-gold/10",
    ghost: "text-smoke hover:text-champagne",
  }[variant];
  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  );
}

export function Card({
  children,
  className = "",
  gold = false,
  id,
}: {
  children: ReactNode;
  className?: string;
  gold?: boolean;
  id?: string;
}) {
  return (
    <div id={id} className={`panel ${gold ? "panel-gold" : ""} p-7 ${className}`}>
      {children}
    </div>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="display gold-text text-4xl sm:text-5xl">{value}</div>
      <div className="mt-2 text-[0.65rem] uppercase tracking-[0.28em] text-smoke">{label}</div>
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-midnight-deep via-onyx to-onyx">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-40 left-1/2 h-96 w-[52rem] -translate-x-1/2 rounded-full bg-gold/10 blur-[130px]" />
      </div>
      <Container className="relative py-20 sm:py-28">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="display mt-5 max-w-4xl text-5xl sm:text-6xl lg:text-7xl">{title}</h1>
        <div className="gold-rule my-7 w-28" />
        {lede ? <p className="lede max-w-2xl text-lg">{lede}</p> : null}
        {children ? <div className="mt-10">{children}</div> : null}
      </Container>
    </section>
  );
}

export function FAQ({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-white/8 border-y border-white/8">
      {items.map((item) => (
        <details key={item.q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left">
            <span className="display text-xl text-ivory">{item.q}</span>
            <span className="text-gold transition-transform duration-300 group-open:rotate-45">+</span>
          </summary>
          <p className="lede mt-4 max-w-3xl text-sm">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

export function CTABand({
  title,
  lede,
  primary,
  secondary,
}: {
  title: string;
  lede: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="relative overflow-hidden border-y border-gold/15 bg-gradient-to-r from-onyx via-midnight to-onyx">
      <Container className="relative py-20 text-center">
        <h2 className="display mx-auto max-w-3xl text-4xl sm:text-5xl">{title}</h2>
        <div className="gold-rule mx-auto my-6 w-24" />
        <p className="lede mx-auto max-w-2xl">{lede}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          {primary ? <Button href={primary.href}>{primary.label}</Button> : null}
          {secondary ? (
            <Button href={secondary.href} variant="outline">
              {secondary.label}
            </Button>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
