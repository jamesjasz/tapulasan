// Product data. Remove a format/finish/swatch by deleting its entry.
// All sizes in millimetres. Plain data, relative imports only (also loaded by `node --test`).

export type Bilingual = { id: string; en: string };

export type FormatSlug = "counter-plate" | "table-stand" | "lanyard-card" | "keychain";

export type Format = {
  slug: FormatSlug;
  name: Bilingual;
  tagline: Bilingual;
  /** Can be ordered now. false = "coming soon": still designable, but no checkout. */
  available: boolean;
  price: number | null; // DECIDE: price in IDR; null shows "price coming soon"
  /** Face size in mm (DECIDE: placeholder dimensions). */
  size: { w: number; h: number; d: number };
  radius: number;
  /** Face layout used by the canvas renderer. */
  layout: "landscape" | "portrait";
  /** Hide the CTA line when the face is too small to read it. */
  compact?: boolean;
  /** Centre of the NFC coil on the face, as fractions of width/height; r = fraction of the shorter side. */
  nfc: { x: number; y: number; r: number };
  /** Hole through the object: centre measured in mm from the top edge. */
  hole?: { kind: "slot" | "round"; top: number; w: number; h: number };
  /** What holds it up in the 3D scene. */
  mount: "easel" | "base" | "lanyard" | "ring";
  /** Real product photo, e.g. "/mockups/table-stand.webp". DECIDE: null shows a "photo coming soon" slot. */
  photo: string | null;
  specs: { material: string; chip: string; dimensions: string };
};

const specsTodo = {
  material: "[[PLACEHOLDER: material & thickness]]",
  chip: "[[PLACEHOLDER: NFC chip type, e.g. NTAG213/215]]",
};

export const formats: Format[] = [
  {
    slug: "counter-plate",
    available: true,
    name: { id: "Plakat Kasir", en: "Counter Plate" },
    tagline: {
      id: "Berdiri di meja kasir, tepat saat pelanggan membayar.",
      en: "Stands by the till, right when customers pay.",
    },
    price: null,
    size: { w: 148, h: 105, d: 5 }, // DECIDE: A6 landscape placeholder
    radius: 8,
    layout: "landscape",
    nfc: { x: 0.2, y: 0.73, r: 0.13 },
    mount: "easel",
    photo: null,
    specs: { ...specsTodo, dimensions: "~148 × 105 mm (A6) [[PLACEHOLDER: confirm final size]]" },
  },
  {
    slug: "table-stand",
    available: false,
    name: { id: "Stand Meja", en: "Table Stand" },
    tagline: {
      id: "Di setiap meja, di samping menu dan tisu.",
      en: "On every table, next to the menu and napkins.",
    },
    price: null,
    size: { w: 100, h: 150, d: 3 }, // DECIDE
    radius: 6,
    layout: "portrait",
    nfc: { x: 0.5, y: 0.885, r: 0.11 },
    mount: "base",
    photo: null,
    specs: { ...specsTodo, dimensions: "~100 × 150 mm [[PLACEHOLDER: confirm final size]]" },
  },
  {
    slug: "lanyard-card",
    available: false,
    name: { id: "Kartu Lanyard", en: "Lanyard Card" },
    tagline: {
      id: "Dikalungkan staf. Ulasan ikut ke mana pun mereka melayani.",
      en: "Worn by staff. The review link goes wherever they serve.",
    },
    price: null,
    size: { w: 54, h: 85.6, d: 0.8 }, // CR80, worn vertically
    radius: 3.2,
    layout: "portrait",
    nfc: { x: 0.5, y: 0.885, r: 0.13 },
    hole: { kind: "slot", top: 5, w: 13, h: 3 },
    mount: "lanyard",
    photo: null,
    specs: { ...specsTodo, dimensions: "85.6 × 54 mm (CR80) [[PLACEHOLDER: confirm thickness]]" },
  },
  {
    slug: "keychain",
    available: false,
    name: { id: "Gantungan Kunci", en: "Keychain" },
    tagline: {
      id: "Kecil, ikut di kunci toko atau kunci motor kurir.",
      en: "Small enough for the shop keys or a courier's bike keys.",
    },
    price: null,
    size: { w: 40, h: 60, d: 3 }, // DECIDE
    radius: 8,
    layout: "portrait",
    compact: true,
    nfc: { x: 0.5, y: 0.88, r: 0.15 },
    hole: { kind: "round", top: 6, w: 6, h: 6 },
    mount: "ring",
    photo: null,
    specs: { ...specsTodo, dimensions: "~40 × 60 mm [[PLACEHOLDER: confirm final size]]" },
  },
];

export const formatBySlug = (slug: string) => formats.find((f) => f.slug === slug);

/** Formats that can be ordered now (checkout only offers these). */
export const orderableFormats = formats.filter((f) => f.available);

export type FinishId = "matte" | "glossy" | "wood" | "metal";

export type Finish = {
  id: FinishId;
  name: Bilingual;
  note: Bilingual;
  /** MeshPhysicalMaterial preset. */
  material: { roughness: number; metalness: number; clearcoat: number; clearcoatRoughness: number };
};

// DECIDE: final finishes/materials.
export const finishes: Finish[] = [
  {
    id: "matte",
    name: { id: "Doff", en: "Matte" },
    note: { id: "Lembut, tidak memantulkan lampu", en: "Soft, no glare under lights" },
    material: { roughness: 0.85, metalness: 0, clearcoat: 0, clearcoatRoughness: 1 },
  },
  {
    id: "glossy",
    name: { id: "Glossy", en: "Glossy" },
    note: { id: "Mengilap, warna lebih pekat", en: "Shiny, deeper colour" },
    material: { roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.06 },
  },
  {
    id: "wood",
    name: { id: "Kayu bambu", en: "Bamboo wood" },
    note: { id: "Serat alami, cocok untuk kafe", en: "Natural grain, café-friendly" },
    material: { roughness: 0.72, metalness: 0, clearcoat: 0.15, clearcoatRoughness: 0.6 },
  },
  {
    id: "metal",
    name: { id: "Logam brushed", en: "Brushed metal" },
    note: { id: "Kesan premium, tahan lama", en: "Premium feel, built to last" },
    material: { roughness: 0.38, metalness: 0.85, clearcoat: 0, clearcoatRoughness: 1 },
  },
];

export const finishById = (id: string) => finishes.find((f) => f.id === id);

export const swatches: { hex: string; name: Bilingual }[] = [
  { hex: "#FF5A1F", name: { id: "Oranye tap", en: "Tap orange" } },
  { hex: "#15120F", name: { id: "Hitam arang", en: "Charcoal" } },
  { hex: "#F6F1E7", name: { id: "Kertas", en: "Paper" } },
  { hex: "#D6B58A", name: { id: "Bambu", en: "Bamboo" } },
  { hex: "#6B4226", name: { id: "Kopi", en: "Coffee" } },
  { hex: "#E8A317", name: { id: "Kunyit", en: "Turmeric" } },
  { hex: "#1F7A4D", name: { id: "Daun", en: "Leaf" } },
  { hex: "#1D3557", name: { id: "Laut", en: "Sea" } },
];
