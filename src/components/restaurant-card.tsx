import { Link } from "@tanstack/react-router";
import { Check, Clock, Heart, MapPin, Star } from "lucide-react";
import { type Restaurant } from "@/data/restaurants";

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
      className={`card-luxe relative flex gap-4 p-4 ${active ? "shadow-gold" : ""}`}
    >
      <div className="min-w-0 flex-1">
        <p className="label-xs">
          {restaurant.cuisine} · {restaurant.district}
        </p>
        <h3 className="mt-1 truncate text-xl font-bold">
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
          <span className="flex items-center gap-1 font-semibold text-maybe">
            <Star className="size-4 fill-current" aria-hidden />
            {restaurant.rating.toFixed(1)}
          </span>
          <span className="text-muted-foreground">{restaurant.reviewCount} avis</span>
          <span className="font-semibold text-foreground">~{restaurant.budget}€</span>
          <span className="flex items-center gap-1 text-muted-foreground"><Clock className="size-3.5" aria-hidden />{restaurant.minutes} min</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {restaurant.diets.map((d) => (
            <span key={d} className="flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success">
              <Check className="size-3" aria-hidden /> {d}
            </span>
          ))}
          {restaurant.allergensFree.includes("Gluten") ? (
            <span className="flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success">
              <Check className="size-3" aria-hidden /> Sans gluten
            </span>
          ) : null}
        </div>
        <div className="mt-4 flex gap-2">
          <Link to="/restaurant/$id" params={{ id: restaurant.id }} className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-85">Voir</Link>
          <Link to="/vote" className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary">Voter en groupe</Link>
        </div>
      </div>
      {onToggleFavorite ? (
        <button
          type="button"
          onClick={() => onToggleFavorite(restaurant.id)}
          aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          className="size-9 shrink-0 self-start rounded-full border border-border text-foreground transition-colors hover:bg-secondary"
        >
          <Heart className={`mx-auto size-4 ${favorite ? "fill-current text-brand" : ""}`} />
        </button>
      ) : null}
    </article>
  );
}
