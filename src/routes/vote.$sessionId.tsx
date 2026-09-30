import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Timer, Trophy } from "lucide-react";
import { toast } from "sonner";
import { getRestaurant, priceLabel } from "@/data/restaurants";
import { simulatedVotes, useLocalState, type VoteSession } from "@/lib/vote-session";

export const Route = createFileRoute("/vote/$sessionId")({
  head: () => ({
    meta: [
      { title: "Écran de vote — Fine & Fork" },
      {
        name: "description",
        content: "Votez pour la table du groupe : 30 secondes, un choix, un gagnant.",
      },
      { property: "og:title", content: "Écran de vote — Fine & Fork" },
      { property: "og:description", content: "30 secondes pour choisir la table du groupe." },
    ],
  }),
  component: VoteScreen,
});

function VoteScreen() {
  const { sessionId } = Route.useParams();
  const [sessions, setSessions, ready] = useLocalState<Record<string, VoteSession>>("ff:votes", {});
  const session = sessions[sessionId];
  const [choice, setChoice] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(30);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (revealed) return;
    const t = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          window.clearInterval(t);
          setRevealed(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [revealed]);

  const tally = useMemo(() => {
    if (!session) return {} as Record<string, number>;
    const base = simulatedVotes(session);
    const merged = { ...base };
    if (choice) merged[choice] = (merged[choice] ?? 0) + 1;
    return merged;
  }, [session, choice]);

  const winnerId = useMemo(() => {
    const entries = Object.entries(tally);
    if (!entries.length) return null;
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  }, [tally]);

  const submit = (id: string) => {
    setChoice(id);
    if (session) {
      setSessions({
        ...sessions,
        [sessionId]: { ...session, votes: { ...session.votes, moi: 1 } },
      });
    }
    setRevealed(true);
  };

  const copyLink = () => {
    void navigator.clipboard.writeText(`${window.location.origin}/vote/${sessionId}`);
    toast.success("Lien de la session copié");
  };

  if (!ready) {
    return <div className="mx-auto max-w-[900px] px-5 py-20 text-muted-foreground">Chargement…</div>;
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-[700px] px-5 py-20 text-center">
        <h1 className="font-display text-3xl">Session introuvable</h1>
        <p className="mt-3 text-muted-foreground">
          Cette session de vote n'existe pas sur cet appareil. Créez-en une nouvelle.
        </p>
        <Link
          to="/vote"
          className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Créer un vote
        </Link>
      </div>
    );
  }

  const winner = winnerId ? getRestaurant(winnerId) : undefined;
  const total = Object.values(tally).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="mx-auto max-w-[900px] px-5 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="label-xs">Session · {session.participants} participants</p>
          <h1 className="mt-1 font-display text-4xl">{session.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
              revealed ? "border-border text-muted-foreground" : "border-gold text-foreground"
            }`}
          >
            <Timer className="size-4" aria-hidden /> {revealed ? "Vote clos" : `${seconds}s`}
          </span>
          <button
            type="button"
            onClick={copyLink}
            className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:border-gold"
          >
            <Copy className="size-4" aria-hidden /> Partager le lien
          </button>
        </div>
      </div>

      <div className="gold-rule my-8" />

      <div className="grid gap-4">
        {session.candidates.map((id) => {
          const r = getRestaurant(id);
          if (!r) return null;
          const votes = tally[id] ?? 0;
          const pct = Math.round((votes / total) * 100);
          return (
            <button
              key={id}
              type="button"
              disabled={revealed}
              onClick={() => submit(id)}
              className={`card-luxe relative overflow-hidden p-5 text-left disabled:cursor-default ${
                choice === id ? "border-gold shadow-luxe" : ""
              }`}
            >
              {revealed ? (
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 bg-gold-soft/60"
                  style={{ width: `${pct}%` }}
                />
              ) : null}
              <span className="relative flex items-center justify-between gap-4">
                <span>
                  <span className="label-xs block">
                    {r.cuisine} · {r.district} · {priceLabel(r.price)}
                  </span>
                  <span className="mt-1 block font-display text-2xl">{r.name}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{r.signature}</span>
                </span>
                <span className="shrink-0 text-right">
                  {revealed ? (
                    <>
                      <span className="block font-display text-2xl text-gold">{votes}</span>
                      <span className="label-xs">voix</span>
                    </>
                  ) : (
                    <span className="flex size-9 items-center justify-center rounded-full border border-border">
                      <Check className="size-4" aria-hidden />
                    </span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {revealed && winner ? (
        <div className="mt-10 rounded-xl border border-gold bg-card p-6 shadow-luxe">
          <p className="label-xs flex items-center gap-2">
            <Trophy className="size-4" aria-hidden /> Résultat du groupe
          </p>
          <h2 className="mt-2 font-display text-3xl">{winner.name}</h2>
          <p className="mt-1 text-muted-foreground">
            {winner.cuisine} · {winner.address} · {winner.rating.toFixed(1)}/5
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/restaurant/$id"
              params={{ id: winner.id }}
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Ok, let's go
            </Link>
            <a
              href={winner.bookingUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-gold px-6 py-3 text-sm font-medium transition-colors hover:bg-gold-soft"
            >
              Réserver
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
