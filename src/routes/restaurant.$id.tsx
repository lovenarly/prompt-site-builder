import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { Clock, Heart, MapPin, Star } from "lucide-react";
import { getRestaurant, priceLabel, reviewsFor } from "@/data/restaurants";
import { useFavorites, useHistory } from "@/lib/local-store";

export const Route = createFileRoute("/restaurant/$id")({
  loader: ({ params }) => {
    const restaurant = getRestaurant(params.id);
    if (!restaurant) throw notFound();
    return { restaurant, reviews: reviewsFor(params.id) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Table introuvable — Food Finder" }, { name: "robots", content: "noindex" }],
      };
    }
    const { restaurant } = loaderData;
    const description = `${restaurant.cuisine} · ${restaurant.district} · ${restaurant.rating.toFixed(1)}/5. ${restaurant.signature}.`;
    return {
      meta: [
        { title: `${restaurant.name} — Food Finder` },
        { name: "description", content: description },
        { property: "og:title", content: `${restaurant.name} — Food Finder` },
        { property: "og:description", content: description },
      ],
    };
  },
  component: RestaurantDetail,
});

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-center">
      <p className="label-xs">{label}</p>
      <p className="mt-1 font-display text-2xl text-gold">{value.toFixed(1)}</p>
    </div>
  );
}

function RestaurantDetail() {
  const { restaurant, reviews } = Route.useLoaderData();
  const { ids: favorites, toggle } = useFavorites();
  const { visit } = useHistory();
  const isFav = favorites.includes(restaurant.id);

  useEffect(() => {
    visit(restaurant.id);
  }, [restaurant.id, visit]);

  const avg = (key: "quality" | "speed" | "ambience" | "value") =>
    reviews.reduce((s, r) => s + r[key], 0) / Math.max(1, reviews.length);

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-10">
      <Link to="/" className="label-xs hover:underline">
        ← Retour à la recherche
      </Link>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-xs">
            {restaurant.cuisine} · {restaurant.district}
          </p>
          <h1 className="mt-1 font-display text-4xl sm:text-5xl">{restaurant.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 font-semibold text-gold">
              <Star className="size-4 fill-current" aria-hidden /> {restaurant.rating.toFixed(1)}
              <span className="font-normal text-muted-foreground">
                ({restaurant.reviewCount} avis)
              </span>
            </span>
            <span className="font-semibold text-gold">{priceLabel(restaurant.price)}</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden /> {restaurant.address}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden /> {restaurant.hours}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => toggle(restaurant.id)}
            className="flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm transition-colors hover:border-gold"
          >
            <Heart className={`size-4 ${isFav ? "fill-current text-gold" : ""}`} aria-hidden />
            {isFav ? "Dans vos favoris" : "Ajouter aux favoris"}
          </button>
          <a
            href={restaurant.bookingUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Réserver
          </a>
        </div>
      </header>

      <div className="gold-rule my-8" />

      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-xl border border-border"
                style={{
                  background:
                    i % 2 === 0
                      ? "linear-gradient(135deg, var(--gold-soft), var(--secondary))"
                      : "linear-gradient(135deg, var(--secondary), var(--primary))",
                }}
                aria-hidden
              />
            ))}
          </div>

          <h2 className="mt-8 font-display text-2xl">La maison</h2>
          <p className="mt-2 text-muted-foreground">{restaurant.description}</p>
          <p className="mt-3">
            <span className="label-xs">Signature</span>
            <br />
            <span className="font-display text-xl">{restaurant.signature}</span>
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {[...restaurant.tags, ...restaurant.diets].map((t) => (
              <span key={t} className="rounded-full bg-secondary px-3 py-1.5 text-xs">
                {t}
              </span>
            ))}
          </div>

          <h2 className="mt-10 font-display text-2xl">Avis ({reviews.length})</h2>
          <div className="mt-4 grid gap-4">
            {reviews.map((r) => (
              <article key={r.id} className="card-luxe p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{r.author}</p>
                  <p className="text-xs text-muted-foreground">{r.date}</p>
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>Qualité {r.quality}/5</span>
                  <span>Rapidité {r.speed}/5</span>
                  <span>Ambiance {r.ambience}/5</span>
                  <span>Rapport qualité-prix {r.value}/5</span>
                </div>
                <p className="mt-3 text-sm">{r.comment}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card-luxe p-5">
            <p className="label-xs">Notation détaillée</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Score label="Qualité" value={avg("quality")} />
              <Score label="Rapidité" value={avg("speed")} />
              <Score label="Ambiance" value={avg("ambience")} />
              <Score label="Valeur" value={avg("value")} />
            </div>
            <Link
              to="/avis/$id"
              params={{ id: restaurant.id }}
              className="mt-5 block rounded-full border border-gold px-4 py-2.5 text-center text-sm font-medium transition-colors hover:bg-gold-soft"
            >
              Laisser un avis
            </Link>
            <div className="mt-5 text-sm text-muted-foreground">
              <p className="label-xs">Sans allergène</p>
              <p className="mt-1">
                {restaurant.allergensFree.length
                  ? restaurant.allergensFree.join(" · ")
                  : "Nous consulter"}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
