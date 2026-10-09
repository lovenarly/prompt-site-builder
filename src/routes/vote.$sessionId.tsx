import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Minus, RotateCcw, Star, Timer, Trophy, X } from "lucide-react";
import { toast } from "sonner";
import { getRestaurant } from "@/data/restaurants";
import { useLocalState, type VoteSession } from "@/lib/vote-session";

export const Route = createFileRoute("/vote/$sessionId")({
  head: () => ({
    meta: [
      { title: "Écran de vote — Food Finder" },
      { name: "description", content: "Oui, peut-être ou non : 30 secondes pour choisir où manger." },
      { property: "og:title", content: "Écran de vote — Food Finder" },
      { property: "og:description", content: "Rejoins le vote du groupe et choisis où manger." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VoteScreen,
});

type Choice = "yes" | "maybe" | "no";
const FRIENDS = [
  { name: "Anne", color: "#E4572E" },
  { name: "Marc", color: "#004E89" },
  { name: "Sarah", color: "#8E44AD" },
  { name: "Yanis", color: "#00A86B" },
  { name: "Léa", color: "#D35400" },
  { name: "Tom", color: "#16A085" },
  { name: "Inès", color: "#C0392B" },
  { name: "Hugo", color: "#2980B9" },
  { name: "Zoé", color: "#7F8C8D" },
];
const DURATION = 30;

function rng(seedStr: string) {
  let s = 0;
  for (const c of seedStr) s = (s * 31 + c.charCodeAt(0)) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function VoteScreen() {
  const { sessionId } = Route.useParams();
  const [sessions, , ready] = useLocalState<Record<string, VoteSession>>("ff:votes", {});
  const session = sessions[sessionId];
  const [round, setRound] = useState(0);
  const [mine, setMine] = useState<Record<string, Choice>>({});
  const [seconds, setSeconds] = useState(DURATION);
  const [done, setDone] = useState(false);

  const friends = FRIENDS.slice(0, Math.max(1, (session?.participants ?? 4) - 1));

  // Simulated votes + time at which each friend "has voted"
  const sim = useMemo(() => {
    if (!session) return { at: [] as number[], votes: [] as Record<string, Choice>[] };
    const r = rng(`${session.id}-${round}`);
    const at = friends.map(() => 3 + Math.floor(r() * 22));
    const votes = friends.map(() => {
      const v: Record<string, Choice> = {};
      session.candidates.forEach((id, i) => {
        const x = r() + (i === 0 ? 0.15 : 0);
        v[id] = x > 0.55 ? "yes" : x > 0.3 ? "maybe" : "no";
      });
      return v;
    });
    return { at, votes };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id, round, friends.length]);

  useEffect(() => {
    if (done || !session) return;
    const t = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          window.clearInterval(t);
          setDone(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [done, session, round]);

  const elapsed = DURATION - seconds;
  const voted = friends.map((_, i) => done || elapsed >= (sim.at[i] ?? 0));
  const iVoted = session ? session.candidates.every((id) => mine[id]) : false;

  useEffect(() => {
    if (!done && iVoted && voted.every(Boolean)) setDone(true);
  }, [done, iVoted, voted]);

  const scores = useMemo(() => {
    if (!session) return [];
    return session.candidates
      .map((id) => {
        const s = { id, yes: 0, maybe: 0, no: 0 };
        const all = [...sim.votes, mine];
        all.forEach((v) => {
          const c = v[id];
          if (c) s[c] += 1;
        });
        return s;
      })
      .sort((a, b) => b.yes - a.yes || b.maybe - a.maybe || a.no - b.no);
  }, [session, sim, mine]);

  const restart = () => {
    setMine({});
    setSeconds(DURATION);
    setDone(false);
    setRound((r) => r + 1);
  };

  const copyLink = () => {
    void navigator.clipboard.writeText(`${window.location.origin}/vote/${sessionId}`);
    toast.success("Lien copié, partage-le sur WhatsApp, Slack ou Discord !");
  };

  if (!ready) return <div className="mx-auto max-w-[1100px] px-5 py-20 text-muted-foreground">Chargement…</div>;

  if (!session) {
    return (
      <div className="mx-auto max-w-[700px] px-5 py-20 text-center">
        <h1 className="text-3xl">Session introuvable</h1>
        <p className="mt-3 text-muted-foreground">Ce vote n'existe pas sur cet appareil. Crée-en un nouveau.</p>
        <Link to="/vote" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
          Créer un vote
        </Link>
      </div>
    );
  }

  if (done) {
    const best = scores[0]!;
    const w = getRestaurant(best.id)!;
    return (
      <div className="mx-auto max-w-[900px] px-5 py-12">
        <p className="label-xs">{session.name} · Résultat</p>
        <div className="mt-4 overflow-hidden rounded-2xl border-2 border-primary bg-card shadow-luxe">
          <img src={`https://picsum.photos/seed/${w.id}a/1200/500`} alt={w.name} className="h-56 w-full object-cover sm:h-72" />
          <div className="p-6 sm:p-8">
            <p className="flex items-center gap-2 font-semibold text-primary">
              <Trophy className="size-5" aria-hidden /> Le groupe a choisi 🎉
            </p>
            <h1 className="mt-2 text-4xl sm:text-5xl">{w.name}</h1>
            <p className="mt-2 flex items-center gap-2 text-muted-foreground">
              <Star className="size-4 fill-maybe text-maybe" aria-hidden /> {w.rating.toFixed(1)} · {w.cuisine} · ~{w.budget}€
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-sm font-semibold">
              <span className="rounded-full bg-success px-3 py-1.5 text-accent-foreground">{best.yes} oui</span>
              <span className="rounded-full bg-maybe px-3 py-1.5 text-accent-foreground">{best.maybe} peut-être</span>
              <span className="rounded-full bg-danger px-3 py-1.5 text-accent-foreground">{best.no} non</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/restaurant/$id" params={{ id: w.id }} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-95">
                Cool ! Voir les détails du resto
              </Link>
              <button type="button" onClick={restart} className="flex items-center gap-2 rounded-full border-2 border-brand px-6 py-3 text-sm font-semibold text-brand hover:bg-secondary">
                <RotateCcw className="size-4" aria-hidden /> Voter à nouveau
              </button>
            </div>
          </div>
        </div>

        <h2 className="mt-10 text-xl">Classement complet</h2>
        <ul className="mt-3 grid gap-2">
          {scores.map((s, i) => (
            <li key={s.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <span className="font-medium">{i + 1}. {getRestaurant(s.id)?.name}</span>
              <span className="text-sm text-muted-foreground">
                <b className="text-success">{s.yes}</b> oui · <b className="text-maybe">{s.maybe}</b> peut-être · <b className="text-danger">{s.no}</b> non
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="label-xs">Vote de groupe · {session.participants} participants</p>
          <h1 className="mt-1 text-3xl sm:text-4xl">{session.name}</h1>
        </div>
        <button type="button" onClick={copyLink} className="flex items-center gap-2 rounded-full border-2 border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-secondary">
          <Copy className="size-4" aria-hidden /> Copier le lien
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-brand p-5 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-3 text-lg font-semibold">
          <Timer className="size-6" aria-hidden /> Votez ! <span className="text-3xl tabular-nums">{seconds}s</span> avant le résultat
        </p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-primary-foreground/25 sm:w-64">
          <div className="h-full bg-primary transition-all" style={{ width: `${(seconds / DURATION) * 100}%` }} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_260px]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {session.candidates.map((id) => {
            const r = getRestaurant(id);
            if (!r) return null;
            const c = mine[id];
            const btn = (val: Choice, label: string, Icon: typeof Check, on: string) => (
              <button
                type="button"
                onClick={() => setMine({ ...mine, [id]: val })}
                className={`flex flex-1 items-center justify-center gap-1 rounded-lg border-2 px-2 py-2 text-sm font-semibold transition ${
                  c === val ? `${on} text-accent-foreground` : "border-border bg-card text-foreground hover:border-foreground/30"
                }`}
              >
                <Icon className="size-4" aria-hidden /> {label}
              </button>
            );
            return (
              <article key={id} className={`overflow-hidden rounded-xl border-2 bg-card transition ${c ? "border-primary/60" : "border-border"}`}>
                <img src={`https://picsum.photos/seed/${r.id}a/600/340`} alt={r.name} className="h-36 w-full object-cover" loading="lazy" />
                <div className="p-4">
                  <p className="label-xs">{r.cuisine} · ~{r.budget}€</p>
                  <h3 className="mt-1 text-lg">{r.name}</h3>
                  <p className="text-sm text-muted-foreground">★ {r.rating.toFixed(1)} · {r.district}</p>
                  <div className="mt-3 flex gap-2">
                    {btn("yes", "Oui", Check, "border-success bg-success")}
                    {btn("maybe", "Bof", Minus, "border-maybe bg-maybe")}
                    {btn("no", "Non", X, "border-danger bg-danger")}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="h-fit rounded-xl border border-border bg-card p-4 lg:sticky lg:top-24">
          <p className="label-xs">En direct</p>
          <ul className="mt-3 grid gap-2.5">
            <li className="flex items-center gap-2 text-sm">
              <span className="size-3 rounded-full bg-primary" />
              <span className="font-medium">Toi</span>
              <span className={`ml-auto ${iVoted ? "text-success" : "text-muted-foreground"}`}>
                {iVoted ? "a voté ✓" : `${Object.keys(mine).length}/${session.candidates.length}`}
              </span>
            </li>
            {friends.map((f, i) => (
              <li key={f.name} className="flex items-center gap-2 text-sm">
                <span className="size-3 rounded-full" style={{ backgroundColor: f.color }} />
                <span className="font-medium">{f.name}</span>
                <span className={`ml-auto ${voted[i] ? "text-success" : "text-muted-foreground"}`}>
                  {voted[i] ? "a voté ✓" : "réfléchit…"}
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={!iVoted}
            onClick={() => setDone(true)}
            className="mt-4 w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
          >
            Voir le résultat
          </button>
        </aside>
      </div>
    </div>
  );
}
