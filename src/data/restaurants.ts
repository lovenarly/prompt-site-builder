export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  district: string;
  address: string;
  price: 1 | 2 | 3 | 4;
  /** Prix moyen par personne (plat + boisson + service), en euros */
  budget: number;
  /** Temps moyen pour être servi, en minutes */
  minutes: number;
  rating: number;
  reviewCount: number;
  lat: number;
  lng: number;
  hours: string;
  tags: string[];
  diets: string[];
  allergensFree: string[];
  description: string;
  signature: string;
  bookingUrl: string;
};

export type Review = {
  id: string;
  restaurantId: string;
  author: string;
  date: string;
  quality: number;
  speed: number;
  ambience: number;
  value: number;
  comment: string;
};

export const CUISINES = [
  "Asiatique",
  "Pizzeria",
  "Burger",
  "Kebab",
  "Française",
  "Libanaise",
  "Indienne",
  "Mexicaine",
  "Sandwich",
  "Végé",
];

export const DIETS = ["Végan", "Végétarien", "Halal"];
export const ALLERGENS = ["Gluten", "Arachides", "Lactose", "Fruits de mer", "Œufs", "Soja"];

const NAMES_BY_CUISINE: Record<string, string[]> = {
  Asiatique: ["Pho Saigon", "Bao Bar", "Ramen Ya", "Wok Express", "Sushi Shop Canal", "Thaï Basil"],
  Pizzeria: ["Pizza Mia", "Da Luigi", "Napoli Express", "Big Mamma Slice", "Forno Rosso"],
  Burger: ["Big Fernand", "Burger Lab", "Smash Club", "Le Bun", "PNY Express"],
  Kebab: ["Grill Istanbul", "Kebab du Canal", "Doner Bros", "Anatolia Grill", "Le Sultan"],
  Française: ["Le Bouillon", "Chez Gégé", "Bistrot du Coin", "Crêperie Josselin", "La Cantine"],
  Libanaise: ["Falafel King", "Le Cèdre", "Mezzé Beyrouth", "Byblos Snack", "Zaatar"],
  Indienne: ["Curry Palace", "Naan Stop", "Tandoori Night", "Bombay Street", "Masala Box"],
  Mexicaine: ["El Taco Loco", "Burrito Bandito", "Chipotle Paris", "La Catrina", "Guaca Bar"],
  Sandwich: ["Le Petit Panini", "Bagel Corner", "Banh Mi Republic", "Croq' Time", "Sub Station"],
  Végé: ["Green Bowl", "Hank Vegan", "Sol Semilla", "Veggie Spot", "Bowl & Co"],
};

const DISTRICTS = [
  "Paris 5e",
  "Paris 6e",
  "Paris 7e",
  "Paris 8e",
  "Paris 9e",
  "Paris 10e",
];

const STREETS = [
  "rue Monge",
  "rue de Seine",
  "boulevard Saint-Germain",
  "rue du Bac",
  "rue de Rivoli",
  "rue des Martyrs",
  "quai de Valmy",
  "rue du Faubourg-Saint-Denis",
  "rue Cler",
  "rue Mouffetard",
];

const SIGNATURES: Record<string, string> = {
  Asiatique: "Pho bœuf saignant",
  Pizzeria: "Margherita au feu de bois",
  Burger: "Double smash cheddar",
  Kebab: "Assiette grillade frites maison",
  Française: "Croque-monsieur & salade",
  Libanaise: "Assiette falafel houmous",
  Indienne: "Butter chicken & cheese naan",
  Mexicaine: "Burrito carnitas",
  Sandwich: "Banh mi porc caramel",
  Végé: "Buddha bowl tofu sésame",
};

// Deterministic pseudo-random generator (stable across server and client renders).
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function build(): Restaurant[] {
  const rng = makeRng(20260930);
  const list: Restaurant[] = [];
  for (let i = 0; i < 54; i++) {
    const cuisine = CUISINES[i % CUISINES.length]!;
    const pool = NAMES_BY_CUISINE[cuisine]!;
    const name = pool[Math.floor(i / CUISINES.length) % pool.length]!;
    const budget = 8 + Math.floor(rng() * 30);
    const price = (budget < 14 ? 1 : budget < 22 ? 2 : budget < 30 ? 3 : 4) as 1 | 2 | 3 | 4;
    const rating = Math.round((3.4 + rng() * 1.6) * 10) / 10;
    const diets = DIETS.filter(() => rng() > 0.6);
    if (cuisine === "Végé" && !diets.includes("Végan")) diets.unshift("Végan");
    const allergensFree = ALLERGENS.filter(() => rng() > 0.55);
    list.push({
      id: `r${i + 1}`,
      name,
      cuisine,
      district: DISTRICTS[i % DISTRICTS.length]!,
      address: `${1 + Math.floor(rng() * 90)} ${STREETS[i % STREETS.length]!}`,
      price,
      budget,
      minutes: [10, 15, 20, 30, 45, 60][Math.floor(rng() * 6)]!,
      rating,
      reviewCount: 20 + Math.floor(rng() * 400),
      lat: 48.8402 + rng() * 0.048,
      lng: 2.3204 + rng() * 0.062,
      hours: rng() > 0.5 ? "11h–23h" : "11h30–15h · 18h30–23h",
      tags: [
        rng() > 0.5 ? "À emporter" : "Sur place",
        rng() > 0.5 ? "Terrasse" : "Livraison",
      ],
      diets,
      allergensFree,
      description:
        "Une adresse sans prise de tête : bonne bouffe, prix honnêtes et service rapide. Parfait pour un midi entre potes ou un dîner chill.",
      signature: SIGNATURES[cuisine]!,
      bookingUrl: "https://www.thefork.fr",
    });
  }
  return list;
}

export const RESTAURANTS: Restaurant[] = build();

const AUTHORS = [
  "Camille D.",
  "Hugo L.",
  "Amélie R.",
  "Sofia B.",
  "Noah M.",
  "Inès K.",
  "Thomas V.",
  "Lina P.",
];

const COMMENTS = [
  "Trop bon ! Portions généreuses, on repart calé.",
  "Bien mais un peu d'attente le midi.",
  "Super rapport qualité-prix, je recommande.",
  "Ambiance cool, parfait entre potes.",
  "Ils ont fait gaffe à mes allergies, top.",
  "Le plat signature vaut le détour.",
];

function buildReviews(): Review[] {
  const rng = makeRng(777);
  const out: Review[] = [];
  RESTAURANTS.forEach((r, ri) => {
    const count = 5 + Math.floor(rng() * 5);
    for (let i = 0; i < count; i++) {
      out.push({
        id: `${r.id}-rev${i}`,
        restaurantId: r.id,
        author: AUTHORS[(ri + i) % AUTHORS.length]!,
        date: `${1 + ((ri + i) % 28)}/0${1 + ((ri + i) % 9)}/2026`,
        quality: 3 + Math.round(rng() * 2),
        speed: 3 + Math.round(rng() * 2),
        ambience: 3 + Math.round(rng() * 2),
        value: 3 + Math.round(rng() * 2),
        comment: COMMENTS[(ri + i) % COMMENTS.length]!,
      });
    }
  });
  return out;
}

export const REVIEWS: Review[] = buildReviews();

export function getRestaurant(id: string) {
  return RESTAURANTS.find((r) => r.id === id);
}

export function reviewsFor(id: string) {
  return REVIEWS.filter((r) => r.restaurantId === id);
}

export function priceLabel(p: number) {
  return "€".repeat(p);
}

export const DEMO_USERS = [
  { id: "u1", name: "Camille Duret", allergies: ["Gluten"], budget: 3, diets: ["Végétarien"] },
  { id: "u2", name: "Hugo Lemaire", allergies: [], budget: 4, diets: [] },
  { id: "u3", name: "Amélie Rousseau", allergies: ["Lactose"], budget: 2, diets: ["Végan"] },
  { id: "u4", name: "Sofia Benali", allergies: ["Fruits de mer"], budget: 3, diets: ["Halal"] },
  { id: "u5", name: "Noah Martin", allergies: ["Arachides"], budget: 2, diets: [] },
];
