export { useLocalState } from "./local-store";

export type VoteSession = {
  id: string;
  name: string;
  participants: number;
  candidates: string[];
  votes: Record<string, number>;
  createdAt: string;
};

/** Deterministic simulated votes from the other participants. */
export function simulatedVotes(session: VoteSession): Record<string, number> {
  let seed = 0;
  for (const c of session.id) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
  const out: Record<string, number> = {};
  session.candidates.forEach((id, i) => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    out[id] = Math.floor((seed / 4294967296) * (session.participants - 1) * 1.2) + (i === 0 ? 1 : 0);
  });
  return out;
}
