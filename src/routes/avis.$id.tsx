import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { getRestaurant } from "@/data/restaurants";
import { useLocalState, type UserReview } from "@/lib/local-store";

export const Route = createFileRoute("/avis/$id")({
  loader: ({ params }) => {
    const restaurant = getRestaurant(params.id);
    if (!restaurant) throw notFound();
    return { restaurant };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Avis — Fine & Fork" }, { name: "robots", content: "noindex" }],
      };
    }
    return {
      meta: [
        { title: `Laisser un avis · ${loaderData.restaurant.name} — Fine & Fork` },
        {
          name: "description",
          content: `Notez la qualité, la rapidité, l'ambiance et le rapport qualité-prix de ${loaderData.restaurant.name}.`,
        },
        { property: "og:title", content: `Laisser un avis · ${loaderData.restaurant.name}` },
        {
          property: "og:description",
          content: "Un avis structuré en quatre critères, publié en quelques secondes.",
        },
      ],
    };
  },
  component: ReviewForm,
});

const CRITERIA = [
  { key: "quality", label: "Qualité de la cuisine" },
  { key: "speed", label: "Rapidité du service" },
  { key: "ambience", label: "Ambiance" },
  { key: "value", label: "Rapport qualité-prix" },
] as const;

function Stars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} sur 5`}
          className="p-0.5"
        >
          <Star className={`size-6 ${n <= value ? "fill-current text-gold" : "text-border"}`} />
        </button>
      ))}
    </div>
  );
}

function ReviewForm() {
  const { restaurant } = Route.useLoaderData();
  const navigate = useNavigate();
  const [reviews, setReviews] = useLocalState<UserReview[]>("ff:reviews", []);
  const [scores, setScores] = useState({ quality: 4, speed: 4, ambience: 4, value: 4 });
  const [comment, setComment] = useState("");

  const submit = () => {
    const entry: UserReview = {
      id: `${restaurant.id}-${Date.now()}`,
      restaurantId: restaurant.id,
      ...scores,
      comment,
      date: new Date().toLocaleDateString("fr-FR"),
    };
    setReviews([entry, ...reviews]);
    toast.success("Merci, votre avis est publié");
    void navigate({ to: "/restaurant/$id", params: { id: restaurant.id } });
  };

  return (
    <div className="mx-auto max-w-[720px] px-5 py-12">
      <Link to="/restaurant/$id" params={{ id: restaurant.id }} className="label-xs hover:underline">
        ← {restaurant.name}
      </Link>
      <h1 className="mt-3 font-display text-4xl">Laisser un avis</h1>
      <p className="mt-2 text-muted-foreground">
        Votre visite chez <span className="text-foreground">{restaurant.name}</span> — quatre
        critères, une minute.
      </p>
      <div className="gold-rule my-8" />

      <div className="card-luxe grid gap-6 p-6">
        {CRITERIA.map((c) => (
          <div key={c.key} className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium">{c.label}</span>
            <Stars
              value={scores[c.key]}
              onChange={(v) => setScores((s) => ({ ...s, [c.key]: v }))}
            />
          </div>
        ))}

        <label className="grid gap-2">
          <span className="label-xs">Commentaire (optionnel)</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            placeholder="Le plat marquant, le service, l'ambiance…"
            className="rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
          />
        </label>

        <button
          type="button"
          onClick={submit}
          className="rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Publier mon avis
        </button>
      </div>

      {reviews.filter((r) => r.restaurantId === restaurant.id).length ? (
        <div className="mt-10">
          <h2 className="font-display text-2xl">Vos avis sur cette table</h2>
          <div className="mt-4 grid gap-3">
            {reviews
              .filter((r) => r.restaurantId === restaurant.id)
              .map((r) => (
                <article key={r.id} className="card-luxe p-4">
                  <p className="text-xs text-muted-foreground">{r.date}</p>
                  <p className="mt-1 text-sm">
                    Qualité {r.quality}/5 · Rapidité {r.speed}/5 · Ambiance {r.ambience}/5 · Valeur{" "}
                    {r.value}/5
                  </p>
                  {r.comment ? <p className="mt-2 text-sm">{r.comment}</p> : null}
                </article>
              ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
