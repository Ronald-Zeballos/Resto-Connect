import { useEffect, useState, type ImgHTMLAttributes, type ReactNode, type SyntheticEvent } from "react";
import { resolveImageSrc } from "../media/imageResolver";

type SafeImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  fallback?: string;
};

export function SafeImage({ src, fallback = "/images/restaurant-hero.png", onError, ...props }: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(() => resolveImageSrc(src, fallback));

  useEffect(() => {
    setCurrentSrc(resolveImageSrc(src, fallback));
  }, [fallback, src]);

  function handleError(event: SyntheticEvent<HTMLImageElement, Event>) {
    const nextFallback = resolveImageSrc(fallback, "/images/restaurant-hero.png");
    if (currentSrc !== nextFallback) setCurrentSrc(nextFallback);
    onError?.(event);
  }

  return <img {...props} src={currentSrc} onError={handleError} />;
}

export function PageHeader({ title, eyebrow, action, image }: { title: string; eyebrow?: string; action?: ReactNode; image?: string }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-soft">
      <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
        <div className="p-6 sm:p-8">
          {eyebrow ? <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-herb">{eyebrow}</p> : null}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-ink sm:text-4xl">{title}</h1>
            </div>
            {action}
          </div>
        </div>
        {image ? <SafeImage className="h-48 w-full object-cover lg:h-full" src={image} alt="" fallback="/images/restaurant-hero.png" /> : null}
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
      <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">{label}</p>
      <p className={`mt-4 inline-flex rounded-2xl px-4 py-3 text-2xl font-black ${colors[tone]}`}>{value}</p>
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

export function ModulePanel({ title, port, description, action, children }: { title: string; port: string; description: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="card p-5">
      <div className="mb-5 flex flex-col gap-3 border-b border-stone-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">{port}</p>
          <h2 className="mt-2 text-xl font-black text-ink">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-stone-500">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function InlineFeedback({ loading, error }: { loading?: boolean; error?: string | null }) {
  if (!loading && !error) return null;

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-stone-200 bg-stone-50 text-stone-500"}`}>
      {error ? `Mostrando datos de respaldo: ${error}` : "Actualizando información del restaurante..."}
    </div>
  );
}
