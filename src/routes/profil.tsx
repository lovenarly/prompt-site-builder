import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ALLERGENS, DEMO_USERS, DIETS, priceLabel } from "@/data/restaurants";
import { DEFAULT_PROFILE, useLocalState, type Profile } from "@/lib/local-store";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Mon profil — Fine & Fork" },
      {
        name: "description",
        content:
          "Enregistrez vos allergies, vos régimes et votre budget pour filtrer automatiquement les tables.",
      },
      { property: "og:title", content: "Mon profil — Fine & Fork" },
      { property: "og:description", content: "Allergies, régimes et budget par défaut." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [profile, setProfile] = useLocalState<Profile>("ff:profile", DEFAULT_PROFILE);

  const toggleList = (key: "allergies" | "diets", value: string) =>
    setProfile((p) => ({
      ...p,
      [key]: p[key].includes(value) ? p[key].filter((x) => x !== value) : [...p[key], value],
    }));

  return (
    <div className="mx-auto max-w-[860px] px-5 py-12">
      <p className="label-xs">Préférences personnelles</p>
      <h1 className="mt-2 font-display text-4xl">Mon profil</h1>
      <div className="gold-rule my-8" />

      <div className="card-luxe grid gap-6 p-6">
        <label className="grid gap-2">
          <span className="label-xs">Nom</span>
          <input
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
          />
        </label>

        <label className="grid gap-2">
          <span className="label-xs">Ville</span>
          <input
            value={profile.city}
            onChange={(e) => setProfile({ ...profile, city: e.target.value })}
            className="rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
          />
        </label>

        <div className="grid gap-2">
          <span className="label-xs">Allergies</span>
          <div className="flex flex-wrap gap-2">
            {ALLERGENS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleList("allergies", a)}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  profile.allergies.includes(a)
                    ? "border-gold bg-gold-soft font-medium"
                    : "border-border"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <span className="label-xs">Régimes</span>
          <div className="flex flex-wrap gap-2">
            {DIETS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleList("diets", d)}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  profile.diets.includes(d) ? "border-gold bg-gold-soft font-medium" : "border-border"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <span className="label-xs">Budget habituel</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProfile({ ...profile, maxPrice: p })}
                className={`rounded-full border px-4 py-2 text-sm ${
                  profile.maxPrice === p ? "border-gold bg-gold-soft font-medium" : "border-border"
                }`}
              >
                {priceLabel(p)}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => toast.success("Préférences enregistrées")}
          className="rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Enregistrer
        </button>
      </div>

      <h2 className="mt-12 font-display text-2xl">Profils de démonstration</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Chargez un profil type pour tester les filtres.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {DEMO_USERS.map((u) => (
          <button
            key={u.id}
            type="button"
            onClick={() => {
              setProfile({
                name: u.name,
                allergies: u.allergies,
                diets: u.diets,
                maxPrice: u.budget,
                city: "Paris",
              });
              toast.success(`Profil « ${u.name} » chargé`);
            }}
            className="card-luxe p-4 text-left"
          >
            <p className="font-medium">{u.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {priceLabel(u.budget)} ·{" "}
              {[...u.allergies, ...u.diets].join(" · ") || "Aucune restriction"}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
