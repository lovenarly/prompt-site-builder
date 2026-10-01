import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Users } from "lucide-react";
import { CUISINES, RESTAURANTS } from "@/data/restaurants";
import { useLocalState, type VoteSession } from "@/lib/vote-session";

export const Route = createFileRoute("/vote/")({
  head: () => ({
    meta: [
      { title: "Créer un vote de groupe — Food Finder" },
      {
        name: "description",
        content:
          "Créez une session de vote, partagez le lien et laissez votre groupe choisir la table en 30 secondes.",
      },
      { property: "og:title", content: "Vote de groupe — Food Finder" },
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
  const [name, setName] = useState("Lunch d'équipe");
  const [participants, setParticipants] = useState(4);
  const [budget, setBudget] = useState(20);
  const [allergies, setAllergies] = useState<string[]>([]);

  const create = () => {
    const pool = RESTAURANTS.filter(
      (r) => r.budget <= budget && allergies.every((a) => r.allergensFree.includes(a)),
    ).sort((a, b) => b.rating - a.rating);
    const candidates = (pool.length >= 5 ? pool : RESTAURANTS).slice(0, 6).map((r) => r.id);
    const id = Math.random().toString(36).slice(2, 11);
    const session: VoteSession = {
      id,
      name,
      participants,
      candidates,
      votes: {},
      createdAt: new Date().toISOString(),
    };
    setSessions({ ...sessions, [id]: session });
    void navigator.clipboard?.writeText(`${window.location.origin}/vote/${id}`).catch(() => {});
    toast.success("Session créée — lien copié !");
    navigate({ to: "/vote/$sessionId", params: { sessionId: id } });
  };

  return (
    <div className="mx-auto max-w-[760px] px-5 py-14">
      <p className="label-xs">Vote de groupe</p>
      <h1 className="mt-2 text-4xl">Créer un vote</h1>
      <p className="mt-3 text-muted-foreground">
        Personne n'est d'accord ? Crée une session, partage le lien sur WhatsApp, Slack ou Discord :
        chacun vote en 30 secondes et le resto avec le plus de « oui » gagne.
      </p>

      <div className="mt-8 grid gap-6 rounded-2xl border border-border bg-card p-6">
        <label className="grid gap-2">
          <span className="label-xs">Nom du groupe</span>
          <input
            value={name}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </label>

        <label className="grid gap-2">
          <span className="label-xs">Participants · {participants}</span>
          <input type="range" min={2} max={10} value={participants} onChange={(e) => setParticipants(Number(e.target.value))} className="accent-[var(--primary)]" />
        </label>

        <label className="grid gap-2">
          <span className="label-xs">Budget groupe · {budget}€ max / personne</span>
          <input type="range" min={10} max={40} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="accent-[var(--primary)]" />
        </label>

        <div className="grid gap-2">
          <span className="label-xs">Allergies communes</span>
          <div className="flex flex-wrap gap-2">
            {ALLERGENS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAllergies(allergies.includes(a) ? allergies.filter((x) => x !== a) : [...allergies, a])}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  allergies.includes(a) ? "border-success bg-success-soft font-medium text-success" : "border-border"
                }`}
              >
                Sans {a.toLowerCase()}
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
