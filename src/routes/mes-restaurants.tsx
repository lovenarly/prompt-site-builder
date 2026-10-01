import { createFileRoute, Link } from "@tanstack/react-router";
import { RestaurantCard } from "@/components/restaurant-card";
import { getRestaurant, priceLabel } from "@/data/restaurants";
import { useFavorites, useHistory } from "@/lib/local-store";

export const Route = createFileRoute("/mes-restaurants")({
  head: () => ({
    meta: [
      { title: "Mes restaurants — Food Finder" },
      {
        name: "description",
        content: "Retrouvez vos favoris, votre historique de visites et vos statistiques de table.",
      },
      { property: "og:title", content: "Mes restaurants — Food Finder" },
      { property: "og:description", content: "Favoris, historique et statistiques personnelles." },
    ],
  }),
  component: MyRestaurants,
});

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-luxe p-5">
      <p className="label-xs">{label}</p>
      <p className="mt-1 font-display text-3xl text-gold">{value}</p>
    </div>
  );
}

function MyRestaurants() {
  const { ids: favorites, toggle } = useFavorites();
  const { ids: history } = useHistory();

  const favRestaurants = favorites.map(getRestaurant).filter((r) => r !== undefined);
  const histRestaurants = history.map(getRestaurant).filter((r) => r !== undefined);

  const avgPrice = histRestaurants.length
    ? Math.round(histRestaurants.reduce((s, r) => s + r.price, 0) / histRestaurants.length)
    : 0;
  const topCuisine =
    histRestaurants.length > 0
      ? Object.entries(
          histRestaurants.reduce<Record<string, number>>((acc, r) => {
            acc[r.cuisine] = (acc[r.cuisine] ?? 0) + 1;
            return acc;
          }, {}),
        ).sort((a, b) => b[1] - a[1])[0]?.[0]
      : undefined;

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-12">
      <p className="label-xs">Votre carnet</p>
      <h1 className="mt-2 font-display text-4xl">Mes restaurants</h1>
      <div className="gold-rule my-8" />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Favoris" value={String(favorites.length)} />
        <Stat label="Tables visitées" value={String(history.length)} />
        <Stat
          label="Budget moyen"
          value={avgPrice ? priceLabel(avgPrice) : "—"}
        />
      </div>
      {topCuisine ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Cuisine la plus consultée : <span className="font-medium text-foreground">{topCuisine}</span>
        </p>
      ) : null}

      <h2 className="mt-12 font-display text-2xl">Favoris</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {favRestaurants.map((r) => (
          <RestaurantCard
            key={r.id}
            restaurant={r}
            favorite
            onToggleFavorite={toggle}
          />
        ))}
        {favRestaurants.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-8 text-sm text-muted-foreground">
            Aucun favori pour l'instant.{" "}
            <Link to="/" className="text-primary hover:underline">
              Explorer les tables
            </Link>
          </p>
        ) : null}
      </div>

      <h2 className="mt-12 font-display text-2xl">Historique</h2>
      <div className="mt-4 grid gap-3">
        {histRestaurants.map((r) => (
          <div
            key={r.id}
            className="card-luxe flex flex-wrap items-center justify-between gap-3 p-4"
          >
            <span>
              <span className="label-xs block">
                {r.cuisine} · {r.district}
              </span>
              <Link
                to="/restaurant/$id"
                params={{ id: r.id }}
                className="font-display text-xl hover:text-primary"
              >
                {r.name}
              </Link>
            </span>
            <Link
              to="/avis/$id"
              params={{ id: r.id }}
              className="rounded-full border border-gold px-4 py-2 text-sm transition-colors hover:bg-gold-soft"
            >
              Laisser un avis
            </Link>
          </div>
        ))}
        {histRestaurants.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-8 text-sm text-muted-foreground">
            Votre historique se remplira au fil de vos consultations.
          </p>
        ) : null}
      </div>
    </div>
  );
}
