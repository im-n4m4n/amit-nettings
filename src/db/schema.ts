import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/** Services / product categories offered by Amit Nettings. */
export const services = pgTable(
  "services",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    tagline: text("tagline").notNull(),
    description: text("description").notNull(),
    icon: text("icon").notNull().default("shield"),
    /** Billing unit used by the calculator: sqft | rft | pcs */
    unit: text("unit").notNull().default("sqft"),
    defaultRate: doublePrecision("default_rate").notNull().default(0),
    startingPrice: doublePrecision("starting_price").notNull().default(0),
    warrantyMonths: integer("warranty_months").notNull().default(12),
    features: jsonb("features").$type<string[]>().notNull().default([]),
    /** Hero / card image used across the website. */
    image: text("image").notNull().default(""),
    /** Optional installation video (mp4) shown on the service page and gallery. */
    video: text("video").notNull().default(""),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("services_slug_unique").on(table.slug)],
);

/** Customers captured from estimates and website enquiries. */
export const customers = pgTable(
  "customers",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    /** Normalised 10-13 digit phone number (digits only). */
    phone: text("phone").notNull(),
    email: text("email"),
    address: text("address"),
    city: text("city"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("customers_phone_unique").on(table.phone),
    index("customers_name_idx").on(table.name),
  ],
);

/** One quotation / estimate. Snapshot of service + rate so history stays stable. */
export const estimates = pgTable(
  "estimates",
  {
    id: serial("id").primaryKey(),
    estimateNo: text("estimate_no").notNull(),
    customerId: integer("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    serviceId: integer("service_id").references(() => services.id, { onDelete: "set null" }),
    serviceName: text("service_name").notNull(),
    /** sqft | rft | pcs */
    unit: text("unit").notNull().default("sqft"),
    /** in | ft — the unit used when measurements were entered */
    measurementUnit: text("measurement_unit").notNull().default("in"),
    rate: doublePrecision("rate").notNull().default(0),
    totalQuantity: doublePrecision("total_quantity").notNull().default(0),
    totalArea: doublePrecision("total_area").notNull().default(0),
    subtotal: doublePrecision("subtotal").notNull().default(0),
    discount: doublePrecision("discount").notNull().default(0),
    totalPrice: doublePrecision("total_price").notNull().default(0),
    /** draft | sent | confirmed | completed | cancelled */
    status: text("status").notNull().default("draft"),
    notes: text("notes"),
    createdBy: text("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("estimates_no_unique").on(table.estimateNo),
    index("estimates_customer_idx").on(table.customerId),
    index("estimates_created_idx").on(table.createdAt),
  ],
);

/** Individual window / opening measurement lines of an estimate. */
export const estimateItems = pgTable(
  "estimate_items",
  {
    id: serial("id").primaryKey(),
    estimateId: integer("estimate_id")
      .notNull()
      .references(() => estimates.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    /** Value as typed by the user (in the estimate measurementUnit). */
    widthValue: doublePrecision("width_value").notNull().default(0),
    heightValue: doublePrecision("height_value").notNull().default(0),
    widthFt: doublePrecision("width_ft").notNull().default(0),
    heightFt: doublePrecision("height_ft").notNull().default(0),
    /** Billing quantity: area (sqft), running feet (rft) or piece count (pcs). */
    quantity: doublePrecision("quantity").notNull().default(0),
    unit: text("unit").notNull().default("sqft"),
    rate: doublePrecision("rate").notNull().default(0),
    price: doublePrecision("price").notNull().default(0),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("estimate_items_estimate_idx").on(table.estimateId)],
);

/** Website enquiries / quotation requests from the public site. */
export const enquiries = pgTable("enquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  serviceSlug: text("service_slug"),
  serviceName: text("service_name"),
  address: text("address"),
  message: text("message"),
  /** new | contacted | converted | closed */
  status: text("status").notNull().default("new"),
  estimateId: integer("estimate_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Video / photo gallery items (real installation media from the field). */
export const galleryItems = pgTable(
  "gallery_items",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    caption: text("caption").notNull().default(""),
    /** mp4 video path/URL — when set the item renders as a video card. */
    video: text("video").notNull().default(""),
    /** Poster / photo path used for the card face. */
    poster: text("poster").notNull().default(""),
    serviceSlug: text("service_slug").notNull().default(""),
    location: text("location").notNull().default(""),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("gallery_items_sort_idx").on(table.sortOrder)],
);

/** Single-row business profile used on PDFs, the public site and WhatsApp messages. */
export const businessSettings = pgTable("business_settings", {
  id: integer("id").primaryKey().default(1),
  businessName: text("business_name").notNull().default("Amit Nettings"),
  tagline: text("tagline").notNull().default("Net Solutions for Every Space"),
  phone: text("phone").notNull().default(""),
  whatsapp: text("whatsapp").notNull().default(""),
  email: text("email").notNull().default(""),
  address: text("address").notNull().default(""),
  city: text("city").notNull().default(""),
  hours: text("hours").notNull().default("Mon – Sat, 9:00 AM – 8:00 PM"),
  gstin: text("gstin").notNull().default(""),
  /** Google Maps embed URL shown on the public map card. */
  mapEmbed: text("map_embed").notNull().default(""),
  quoteTerms: text("quote_terms").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Dashboard operators. */
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull().default("admin"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export type Service = typeof services.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Estimate = typeof estimates.$inferSelect;
export type EstimateItem = typeof estimateItems.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
export type BusinessSettings = typeof businessSettings.$inferSelect;
export type User = typeof users.$inferSelect;

export type GalleryItem = typeof galleryItems.$inferSelect;
