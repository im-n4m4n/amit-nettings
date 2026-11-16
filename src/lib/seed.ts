import { sql } from "drizzle-orm";
import { db } from "@/db";
import { businessSettings, galleryItems, services } from "@/db/schema";

/**
 * Seed content is taken from amitnettings.in (services, contact details, map, media).
 * Everything is insert-only: once a row exists, edits made in the admin panel are never overwritten.
 */

type SeedService = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  unit: "sqft" | "rft" | "pcs";
  defaultRate: number;
  startingPrice: number;
  warrantyMonths: number;
  features: string[];
  image: string;
  video: string;
  sortOrder: number;
};

const SEED_SERVICES: SeedService[] = [
  {
    slug: "mosquito-net",
    name: "Mosquito Nets",
    tagline: "Rest without mosquito worries. Our nets protect your sleep.",
    description:
      "A Pleated Mosquito Net is a sleek, foldable insect screen for doors and windows. It offers smooth sliding operation, durable mesh, proper ventilation, and space-saving design, ensuring protection from mosquitoes while maintaining aesthetics.",
    icon: "mosquito",
    unit: "sqft",
    defaultRate: 100,
    startingPrice: 100,
    warrantyMonths: 0,
    features: [
      "Pleated mosquito nets – modern, space-saving designs for doors and windows",
      "Aluminium sliding mosquito nets – stylish and durable solutions to keep insects out",
      "Smooth sliding operation",
      "Durable mesh with proper ventilation",
    ],
    image: "/media/photos/mosquito-sliding-1.jpg",
    video: "/media/videos/mosquito-1.mp4",
    sortOrder: 1,
  },
  {
    slug: "bird-net",
    name: "Bird Nets",
    tagline: "Enjoy nature’s beauty, no bird troubles. Nets that work like magic.",
    description:
      "A Bird Net is a fixed nylon netting designed to prevent birds from entering balconies, windows, and open areas. It is strong, weather-resistant, and durable, ensuring a bird-free and clean environment while allowing air and light to pass through. Ideal for homes, offices, and buildings.",
    icon: "bird",
    unit: "sqft",
    defaultRate: 0,
    startingPrice: 0,
    warrantyMonths: 0,
    features: [
      "Strong, weather-resistant nylon netting",
      "Keeps pigeons and other birds out of balconies, windows and open areas",
      "Air and light pass through freely",
      "Ideal for homes, offices and buildings",
    ],
    image: "/media/photos/bird-net-1.jpg",
    video: "/media/videos/bird-1.mp4",
    sortOrder: 2,
  },
  {
    slug: "invisible-grill",
    name: "Invisible Grill",
    tagline: "Strong windows, stylish look. Our invisible grills offer both safety and style.",
    description:
      "An Invisible Grill is a modern safety solution for balconies, windows, and open spaces. Made of high-tensile stainless steel cables, it provides unobstructed views while ensuring security for children and pets. Rust-resistant and durable, it enhances safety without compromising aesthetics.",
    icon: "grill",
    unit: "sqft",
    defaultRate: 0,
    startingPrice: 0,
    warrantyMonths: 0,
    features: [
      "High-tensile stainless steel cables",
      "Unobstructed views from balconies and windows",
      "Security for children and pets",
      "Rust-resistant and durable",
    ],
    image: "/media/photos/grill-1.jpg",
    video: "/media/videos/grill-1.mp4",
    sortOrder: 3,
  },
];

const video = (file: string, title: string, serviceSlug: string, sortOrder: number) => ({
  title,
  caption: "",
  video: `/media/videos/${file}.mp4`,
  poster: `/media/videos/${file}.jpg`,
  serviceSlug,
  location: "",
  sortOrder,
});

const photo = (file: string, title: string, serviceSlug: string, sortOrder: number) => ({
  title,
  caption: "",
  video: "",
  poster: `/media/photos/${file}.jpg`,
  serviceSlug,
  location: "",
  sortOrder,
});

const SEED_GALLERY = [
  video("mosquito-1", "Pleated mosquito net", "mosquito-net", 1),
  video("grill-1", "Invisible grill", "invisible-grill", 2),
  video("bird-1", "Bird net", "bird-net", 3),
  video("mosquito-2", "Pleated mosquito net", "mosquito-net", 4),
  video("grill-2", "Invisible grill", "invisible-grill", 5),
  video("bird-2", "Bird net", "bird-net", 6),
  video("mosquito-3", "Pleated mosquito net", "mosquito-net", 7),
  video("grill-3", "Invisible grill", "invisible-grill", 8),
  video("bird-3", "Bird net", "bird-net", 9),
  video("mosquito-4", "Pleated mosquito net", "mosquito-net", 10),
  video("mosquito-5", "Pleated mosquito net", "mosquito-net", 11),
  video("mosquito-6", "Pleated mosquito net", "mosquito-net", 12),
  photo("grill-1", "Invisible grill on a balcony", "invisible-grill", 21),
  photo("mosquito-sliding-1", "Sliding mosquito net on a window", "mosquito-net", 22),
  photo("bird-net-1", "Bird net on a balcony", "bird-net", 23),
  photo("mosquito-pleated-2", "Pleated mosquito net on a door", "mosquito-net", 24),
  photo("mosquito-sliding-3", "Sliding mosquito net", "mosquito-net", 25),
  photo("grill-2", "Invisible grill balcony", "invisible-grill", 26),
  photo("mosquito-install", "Mosquito net installation", "mosquito-net", 27),
  photo("bird-net-2", "Bird net", "bird-net", 28),
  photo("mosquito-sliding-2", "Sliding mosquito net on a window", "mosquito-net", 29),
  photo("mosquito-pleated-1", "Pleated mosquito net on a sliding door", "mosquito-net", 30),
  photo("mosquito-sliding-4", "Sliding mosquito net", "mosquito-net", 31),
  photo("mosquito-door", "Mosquito net door", "mosquito-net", 32),
];

const MAP_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.7074768576954!2d73.01491286934217!3d19.076594812481215!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c1001c70f7b1%3A0xdc9569db62365118!2sAmit%20Nettings!5e0!3m2!1sen!2sin!4v1744913569978!5m2!1sen!2sin";

let seedPromise: Promise<void> | null = null;

async function runSeed(): Promise<void> {
  for (const service of SEED_SERVICES) {
    await db.insert(services).values(service).onConflictDoNothing({ target: services.slug });
  }

  await db
    .insert(businessSettings)
    .values({
      id: 1,
      businessName: "Amit Nettings",
      tagline: "Professional Nettings services",
      phone: "+91 70219 46002",
      whatsapp: "917021946002",
      email: "amitnettings@gmail.com",
      address: "Shop No. 3783, KKR Rd, Turbhe Store, Turbhe MIDC, Turbhe",
      city: "Navi Mumbai, Maharashtra 400705",
      hours: "",
      gstin: "",
      mapEmbed: MAP_EMBED,
      quoteTerms: "",
    })
    .onConflictDoNothing({ target: businessSettings.id });

  const existingGallery = await db.select({ id: galleryItems.id }).from(galleryItems).limit(1);
  if (existingGallery.length === 0) {
    await db.insert(galleryItems).values(SEED_GALLERY);
  }

  await db.execute(sql`select setval(pg_get_serial_sequence('services', 'id'), coalesce((select max(id) from services), 1))`);
  await db.execute(
    sql`select setval(pg_get_serial_sequence('gallery_items', 'id'), coalesce((select max(id) from gallery_items), 1))`,
  );
}

/** Idempotent, cached seed so every server entrypoint can safely call it. */
export async function ensureSeed(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}
