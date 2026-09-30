import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Users } from "lucide-react";
import { CUISINES, RESTAURANTS } from "@/data/restaurants";
import { useLocalState, type VoteSession } from "@/lib/vote-session";

export const Route = createFileRoute("/vote/")({
  head: () => ({
    meta: [
      { title: "Créer un vote de groupe — Fine & Fork" },
      {
        name: "description",
        content:
          "Créez une session de vote, partagez le lien et laissez votre groupe choisir la table en 30 secondes.",
      },
      { property: "og:title", content: "Vote de groupe — Fine & Fork" },
      {
        property: "og:description",
        content: "Partagez un lien, chacun vote, le meilleur restaurant gagne.",
      },
    ],
  }),
  component: CreateVote,
});

function CreateVote() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useLocalState<Record<string, VoteSession>>("ff:votes", {});
  const [name, setName] = useState("Dîner d'équipe");
  const [participants, setParticipants] = useState(4);
  const [maxPrice, setMaxPrice] = useState(3);
  const [cuisine, setCuisine] = useState<string | null>(null);

  const create = () => {
    const pool = RESTAURANTS.filter(
      (r) => r.price <= maxPrice && (!cuisine || r.cuisine === cuisine),
    ).sort((a, b) => b.rating - a.rating);
    const candidates = (pool.length >= 4 ? pool : RESTAURANTS).slice(0, 5).map((r) => r.id);
    const id = `s${Date.now().toString(36)}`;
    const session: VoteSession = {
      id,
      name,
      participants,
      candidates,
      votes: {},
      createdAt: new Date().toISOString(),
    };
    setSessions({ ...sessions, [id]: session });
    navigate({ to: "/vote/$sessionId", params: { sessionId: id } });
  };

  return (
    <div className="mx-auto max-w-[760px] px-5 py-14">
      <p className="label-xs">Étape 1 · Configuration</p>
      <h1 className="mt-2 font-display text-4xl">Créer un vote de groupe</h1>
      <p className="mt-3 text-muted-foreground">
        Définissez les paramètres communs, partagez le lien : chacun vote 30 secondes et la table
        avec le meilleur score l'emporte.
      </p>
      <div className="gold-rule my-8" />

      <div className="card-luxe grid gap-6 p-6">
        <label className="grid gap-2">
          <span className="label-xs">Nom du groupe</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
          />
        </label>

        <label className="grid gap-2">
          <span className="label-xs">Participants · {participants}</span>
          <input
            type="range"
            min={2}
            max={10}
            value={participants}
            onChange={(e) => setParticipants(Number(e.target.value))}
            className="accent-[var(--gold)]"
          />
        </label>

        <div className="grid gap-2">
          <span className="label-xs">Budget maximum</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setMaxPrice(p)}
                className={`rounded-full border px-4 py-2 text-sm ${
                  maxPrice === p ? "border-gold bg-gold-soft font-medium" : "border-border"
                }`}
              >
                {"€".repeat(p)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <span className="label-xs">Cuisine (optionnel)</span>
          <div className="flex flex-wrap gap-2">
            {CUISINES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCuisine(cuisine === c ? null : c)}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  cuisine === c ? "border-gold bg-gold-soft font-medium" : "border-border"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={create}
          className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Users className="size-4" aria-hidden /> Créer la session et obtenir le lien
        </button>
      </div>

      {Object.values(sessions).length ? (
        <div className="mt-10">
          <h2 className="font-display text-2xl">Sessions récentes</h2>
          <ul className="mt-4 grid gap-2">
            {Object.values(sessions)
              .slice(-5)
              .reverse()
              .map((s) => (
                <li key={s.id} className="card-luxe flex items-center justify-between p-4">
                  <span>
                    <span className="font-medium">{s.name}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {s.participants} participants
                    </span>
                  </span>
                  <a
                    href={`/vote/${s.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Ouvrir
                  </a>
                </li>
              ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
