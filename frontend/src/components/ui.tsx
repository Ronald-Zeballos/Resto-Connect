import type { ReactNode } from "react";

export function PageHeader({ title, eyebrow, action, image }: { title: string; eyebrow?: string; action?: ReactNode; image?: string }) {
  return (
    <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-soft">
      <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
        <div className="p-5 sm:p-7">
          {eyebrow ? <p className="mb-2 text-xs font-bold uppercase tracking-wide text-herb">{eyebrow}</p> : null}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-black text-ink sm:text-3xl">{title}</h1>
            </div>
            {action}
          </div>
        </div>
        {image ? <img className="h-48 w-full object-cover lg:h-full" src={image} alt="" /> : null}
      </div>
    </section>
  );
}

export function StatCard({ label, value, tone = "herb" }: { label: string; value: string; tone?: "herb" | "tomato" | "maize" | "ink" }) {
  const colors = {
    herb: "bg-herb/10 text-herb",
    tomato: "bg-tomato/10 text-tomato",
    maize: "bg-maize/15 text-yellow-800",
    ink: "bg-ink/10 text-ink"
  };
  return (
    <div className="card p-4">
      <p className="text-sm font-semibold text-stone-500">{label}</p>
      <p className={`mt-3 inline-flex rounded-md px-3 py-2 text-2xl font-black ${colors[tone]}`}>{value}</p>
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "green" | "red" | "yellow" | "blue" | "neutral" }) {
  const tones = {
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-900",
    blue: "bg-sky-100 text-sky-800",
    neutral: "bg-stone-100 text-stone-700"
  };
  return <span className={`badge ${tones[tone]}`}>{children}</span>;
}

export function Progress({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 overflow-hidden rounded-full bg-stone-100">
      <div className="h-full rounded-full bg-herb" style={{ width: `${clamped}%` }} />
    </div>
  );
}
