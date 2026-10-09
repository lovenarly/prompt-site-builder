import type { Restaurant } from "@/data/restaurants";

const BOUNDS = { minLat: 48.838, maxLat: 48.892, minLng: 2.318, maxLng: 2.386 };

function pos(r: Restaurant) {
  const x = ((r.lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100;
  const y = (1 - (r.lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100;
  return { left: `${Math.min(96, Math.max(4, x))}%`, top: `${Math.min(94, Math.max(6, y))}%` };
}

export function MapPanel({
  restaurants,
  activeId,
  onSelect,
}: {
  restaurants: Restaurant[];
  activeId?: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="relative h-[420px] overflow-hidden rounded-xl border border-border bg-secondary lg:h-[calc(100vh-11rem)] lg:sticky lg:top-24">
      <div
        aria-hidden
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div
        aria-hidden
        className="absolute left-0 right-0 top-1/3 h-8 -rotate-3 bg-gold-soft/60"
      />
      <p className="absolute left-4 top-4 label-xs">Paris 5e – 10e · {restaurants.length} tables</p>
      {restaurants.slice(0, 40).map((r) => {
        const isActive = r.id === activeId;
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelect(r.id)}
            style={pos(r)}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-2.5 py-1 text-xs font-medium shadow-sm transition-all ${
              isActive
                ? "z-20 scale-110 border-gold bg-foreground text-background"
                : "border-border bg-card text-foreground hover:border-gold"
            }`}
          >
            {r.rating.toFixed(1)}
          </button>
        );
      })}
      {activeId ? (
        <div className="absolute inset-x-4 bottom-4 rounded-lg border border-gold bg-card p-3 shadow-luxe">
          <p className="label-xs">Sélection</p>
          <p className="text-lg">
            {restaurants.find((r) => r.id === activeId)?.name ?? ""}
          </p>
        </div>
      ) : null}
    </div>
  );
}
