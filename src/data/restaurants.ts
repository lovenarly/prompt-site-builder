export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  district: string;
  address: string;
  price: 1 | 2 | 3 | 4;
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
  "Française",
  "Japonaise",
  "Italienne",
  "Gastronomique",
  "Libanaise",
  "Végétale",
  "Fruits de mer",
  "Bistronomie",
  "Indienne",
  "Coréenne",
];

export const DIETS = ["Végétarien", "Végan", "Halal", "Sans alcool"];
export const ALLERGENS = ["Gluten", "Arachides", "Lactose", "Fruits de mer", "Œufs", "Soja"];

const NAMES_A = [
  "Le Cèdre",
  "Maison Aurore",
  "L'Atelier",
  "Chez Solange",
  "Le Comptoir",
  "Auberge",
  "Table",
  "Le Grand",
  "Villa",
  "Le Jardin",
  "Sésame",
  "L'Orangerie",
  "Le Clos",
  "Brasserie",
  "Le Sel",
  "Ombre",
  "Le Baron",
  "Kaiseki",
  "Le Marbre",
  "Perle",
  "Le Cellier",
  "Mirabelle",
  "Le Faubourg",
  "Oryza",
  "Le Vertige",
];
const NAMES_B = [
  "Doré",
  "Noir",
  "d'Argent",
  "Royal",
  "des Lys",
  "de Lune",
  "d'Été",
  "Rive Gauche",
  "Belle Époque",
  "du Marais",
  "Impérial",
  "Céleste",
  "Secret",
];

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
  "rue Oberkampf",
  "avenue Montaigne",
  "rue Mouffetard",
];

const SIGNATURES = [
  "Ris de veau, sauce au vin jaune",
  "Omakase 12 services",
  "Turbot rôti à l'os, beurre noisette",
  "Risotto à la truffe noire",
  "Pigeon en croûte de sésame",
  "Bar de ligne en croûte de sel",
  "Tarte fine aux cèpes",
  "Homard bleu grillé",
];

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
    const name = `${NAMES_A[i % NAMES_A.length]} ${NAMES_B[(i * 7) % NAMES_B.length]}`;
    const price = ((i % 4) + 1) as 1 | 2 | 3 | 4;
    const rating = Math.round((3.6 + rng() * 1.4) * 10) / 10;
    const diets = DIETS.filter(() => rng() > 0.62);
    const allergensFree = ALLERGENS.filter(() => rng() > 0.55);
    list.push({
      id: `r${i + 1}`,
      name,
      cuisine: CUISINES[i % CUISINES.length],
      district: DISTRICTS[i % DISTRICTS.length],
      address: `${1 + Math.floor(rng() * 90)} ${STREETS[i % STREETS.length]}`,
      price,
      rating,
      reviewCount: 40 + Math.floor(rng() * 460),
      lat: 48.8402 + rng() * 0.048,
      lng: 2.3204 + rng() * 0.062,
      hours: rng() > 0.5 ? "12h–14h30 · 19h–22h30" : "19h–23h00",
      tags: [
        rng() > 0.7 ? "Étoilé" : "Carte saisonnière",
        rng() > 0.5 ? "Terrasse" : "Salon privé",
        rng() > 0.6 ? "Cave rare" : "Accords mets-vins",
      ],
      diets,
      allergensFree,
      description:
        "Une salle feutrée, un service à la française et une cuisine de produit signée par un chef formé dans les grandes maisons parisiennes.",
      signature: SIGNATURES[i % SIGNATURES.length],
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
  "Service impeccable, dressage sublime. Le sommelier a fait un accord parfait.",
  "Très bon dans l'ensemble, un peu d'attente entre les services.",
  "Rapport qualité-prix remarquable pour ce niveau de cuisine.",
  "Ambiance feutrée idéale pour un dîner à deux. On reviendra.",
  "Les allergies ont été prises en compte sans discussion, appréciable.",
  "Belle découverte, la signature vaut à elle seule le détour.",
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
        author: AUTHORS[(ri + i) % AUTHORS.length],
        date: `${1 + ((ri + i) % 28)}/0${1 + ((ri + i) % 9)}/2026`,
        quality: 3 + Math.round(rng() * 2),
        speed: 3 + Math.round(rng() * 2),
        ambience: 3 + Math.round(rng() * 2),
        value: 3 + Math.round(rng() * 2),
        comment: COMMENTS[(ri + i) % COMMENTS.length],
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
