import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-dining.jpg";
import { MapPanel } from "@/components/map-panel";
import { RestaurantCard } from "@/components/restaurant-card";
import { ALLERGENS, CUISINES, DIETS, RESTAURANTS } from "@/data/restaurants";
import { useFavorites } from "@/lib/local-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Food Finder — Trouve où manger à Paris" },
      {
        name: "description",
        content:
          "Filtrez par quartier, budget, cuisine, régime et allergies pour trouver la table parisienne qui vous correspond.",
      },
      { property: "og:title", content: "Food Finder — Trouve où manger" },
      {
        property: "og:description",
        content: "Restos et snacks filtrés selon ton budget, tes allergies et ton temps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const DISTRICTS = ["Paris 5e", "Paris 6e", "Paris 7e", "Paris 8e", "Paris 9e", "Paris 10e"];

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
        active
          ? "border-gold bg-gold-soft font-medium text-foreground"
          : "border-border bg-card text-muted-foreground hover:border-gold"
      }`}
    >
      {label}
    </button>
  );
}

function Index() {
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState<string | null>(null);
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [budget, setBudget] = useState(40);
  const [time, setTime] = useState(60);
  const [diets, setDiets] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { ids: favorites, toggle } = useFavorites();

  const toggleIn = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RESTAURANTS.filter((r) => {
      if (q && !`${r.name} ${r.cuisine} ${r.district}`.toLowerCase().includes(q)) return false;
      if (district && r.district !== district) return false;
      if (cuisine && r.cuisine !== cuisine) return false;
      if (r.budget > budget) return false;
      if (r.minutes > time) return false;
      if (diets.some((d) => !r.diets.includes(d))) return false;
      if (allergies.some((a) => !r.allergensFree.includes(a))) return false;
      return true;
    }).sort((a, b) => b.rating - a.rating);
  }, [query, district, cuisine, budget, time, diets, allergies]);

  const surprise = results[0] ?? RESTAURANTS[0];

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <img
          src={heroImage}
          alt="Salle de restaurant gastronomique éclairée à la bougie"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/65" />
        <div className="relative mx-auto max-w-[1200px] px-5 py-20 text-background sm:py-28">
          <p className="label-xs text-primary">Resto, snack, kebab… sans prise de tête</p>
          <h1 className="mt-4 max-w-2xl text-4xl leading-tight sm:text-6xl">
            Tu as faim ? On trouve où manger.
          </h1>
          <p className="mt-4 max-w-xl text-background/80">
            Dis-nous ton budget, ton temps et tes allergies : on te sort les meilleures adresses
            entre Paris 5e et 10e. Pas d'accord entre potes ? Lancez un vote.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/vote"
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Lancer un vote de groupe
            </Link>
            <Link
              to="/restaurant/$id"
              params={{ id: surprise.id }}
              className="flex items-center gap-2 rounded-full border border-background/50 px-6 py-3 text-sm font-medium transition-colors hover:bg-background/10"
            >
              <Sparkles className="size-4" aria-hidden /> Surprenez-moi
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 py-10">
        <div className="card-luxe p-5">
          <label className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3">
            <Search className="size-4 text-primary" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Où ? Adresse, quartier, nom ou cuisine…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>

          <div className="mt-5 grid gap-5">
            <div>
              <p className="label-xs mb-2 flex items-center gap-2">
                <SlidersHorizontal className="size-3.5" aria-hidden /> Quartier
              </p>
              <div className="flex flex-wrap gap-2">
                {DISTRICTS.map((d) => (
                  <Chip
                    key={d}
                    label={d}
                    active={district === d}
                    onClick={() => setDistrict(district === d ? null : d)}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="label-xs mb-2">Cuisine</p>
              <div className="flex flex-wrap gap-2">
                {CUISINES.map((c) => (
                  <Chip
                    key={c}
                    label={c}
                    active={cuisine === c}
                    onClick={() => setCuisine(cuisine === c ? null : c)}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="label-xs mb-2">Budget · jusqu'à {budget}€ (plat + boisson + service)</p>
                <input type="range" min={10} max={40} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
                <p className="label-xs mb-2 mt-4">Combien de temps ?</p>
                <div className="flex flex-wrap gap-2">
                  {[[15, "Urgent 15 min"], [30, "Normal 30 min"], [60, "Chill 1h"]].map(([v, l]) => (
                    <Chip key={v} label={l as string} active={time === v} onClick={() => setTime(v as number)} />
                  ))}
                </div>
              </div>
              <div>
                <p className="label-xs mb-2">Régime</p>
                <div className="flex flex-wrap gap-2">
                  {DIETS.map((d) => (
                    <Chip
                      key={d}
                      label={d}
                      active={diets.includes(d)}
                      onClick={() => toggleIn(diets, setDiets, d)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="label-xs mb-2">Sans allergène</p>
              <div className="flex flex-wrap gap-2">
                {ALLERGENS.map((a) => (
                  <Chip
                    key={a}
                    label={`Sans ${a.toLowerCase()}`}
                    active={allergies.includes(a)}
                    onClick={() => toggleIn(allergies, setAllergies, a)}
                  />
                ))}
              </div>
            </div>
          </div>
          <a href="#resultats" className="mt-6 block w-full rounded-full bg-primary py-4 text-center text-base font-bold text-primary-foreground transition hover:brightness-90">
            Chercher
          </a>
        </div>

        <div id="resultats" className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div className="order-2 lg:order-1"><MapPanel restaurants={results} activeId={activeId} onSelect={setActiveId} /></div>
          <div className="order-1 lg:order-2">
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl">
                {results.length} adresse{results.length > 1 ? "s" : ""} trouvée{results.length > 1 ? "s" : ""}
              </h2>
              <span className="label-xs">Triées par note</span>
            </div>
            <div className="gold-rule my-4" />
            <div className="grid gap-4">
              {results.map((r) => (
                <div key={r.id} onMouseEnter={() => setActiveId(r.id)}>
                  <RestaurantCard
                    restaurant={r}
                    favorite={favorites.includes(r.id)}
                    onToggleFavorite={toggle}
                    active={activeId === r.id}
                  />
                </div>
              ))}
              {results.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  Aucune table ne correspond à ces critères. Élargissez le budget ou retirez un
                  filtre.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
