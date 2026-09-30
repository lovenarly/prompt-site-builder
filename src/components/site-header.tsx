import { Link } from "@tanstack/react-router";

const NAV = [
  { to: "/", label: "Rechercher" },
  { to: "/vote", label: "Vote de groupe" },
  { to: "/mes-restaurants", label: "Mes restaurants" },
  { to: "/profil", label: "Profil" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full border border-gold text-gold font-display text-lg tracking-tight">
            FF
          </span>
          <span className="leading-tight">
            <span className="block font-display text-xl font-semibold">Fine & Fork</span>
            <span className="label-xs">Trouvez l'expérience parfaite</span>
          </span>
        </Link>
        <nav className="ml-auto flex flex-wrap items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground font-medium" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/70">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-base text-foreground">Fine &amp; Fork</p>
        <p>Données de démonstration · Paris 5e–10e</p>
      </div>
    </footer>
  );
}
