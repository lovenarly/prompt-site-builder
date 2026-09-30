import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Star } from "lucide-react";
import { priceLabel, type Restaurant } from "@/data/restaurants";

export function RestaurantCard({
  restaurant,
  favorite,
  onToggleFavorite,
  active,
}: {
  restaurant: Restaurant;
  favorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  active?: boolean;
}) {
  return (
    <article
      className={`card-luxe relative flex gap-4 p-4 ${active ? "border-gold shadow-luxe" : ""}`}
    >
      <div className="min-w-0 flex-1">
        <p className="label-xs">
          {restaurant.cuisine} · {restaurant.district}
        </p>
        <h3 className="mt-1 truncate font-display text-xl font-semibold">
          <Link
            to="/restaurant/$id"
            params={{ id: restaurant.id }}
            className="transition-colors hover:text-primary"
          >
            {restaurant.name}
          </Link>
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5" aria-hidden /> {restaurant.address}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <span className="flex items-center gap-1 font-semibold text-gold">
            <Star className="size-4 fill-current" aria-hidden />
            {restaurant.rating.toFixed(1)}
          </span>
          <span className="text-muted-foreground">{restaurant.reviewCount} avis</span>
          <span className="font-semibold text-gold">{priceLabel(restaurant.price)}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {restaurant.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
            >
              {t}
            </span>
          ))}
          {restaurant.diets.slice(0, 1).map((d) => (
            <span key={d} className="rounded-full bg-gold-soft px-2.5 py-1 text-xs text-foreground">
              {d}
            </span>
          ))}
        </div>
      </div>
      {onToggleFavorite ? (
        <button
          type="button"
          onClick={() => onToggleFavorite(restaurant.id)}
          aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          className="size-9 shrink-0 self-start rounded-full border border-border text-primary transition-colors hover:border-gold hover:bg-secondary"
        >
          <Heart className={`mx-auto size-4 ${favorite ? "fill-current text-gold" : ""}`} />
        </button>
      ) : null}
    </article>
  );
}
