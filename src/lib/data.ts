import { and, asc, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { businessSettings, customers, enquiries, estimateItems, estimates, galleryItems, services } from "@/db/schema";
import { ensureSeed } from "@/lib/seed";

export type ServiceRecord = typeof services.$inferSelect;
export type SettingsRecord = typeof businessSettings.$inferSelect;

export async function getServices(): Promise<ServiceRecord[]> {
  await ensureSeed();
  return db.select().from(services).orderBy(asc(services.sortOrder), asc(services.id));
}

export async function getActiveServices(): Promise<ServiceRecord[]> {
  const all = await getServices();
  return all.filter((service) => service.isActive);
}

export async function getServiceBySlug(slug: string): Promise<ServiceRecord | null> {
  await ensureSeed();
  const rows = await db.select().from(services).where(eq(services.slug, slug)).limit(1);
  return rows[0] ?? null;
}

const FALLBACK_SETTINGS: SettingsRecord = {
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
  mapEmbed: "",
  quoteTerms: "",
  updatedAt: new Date(),
};

export async function getSettings(): Promise<SettingsRecord> {
  try {
    await ensureSeed();
    const rows = await db.select().from(businessSettings).where(eq(businessSettings.id, 1)).limit(1);
    return rows[0] ?? FALLBACK_SETTINGS;
  } catch {
    return FALLBACK_SETTINGS;
  }
}

export async function updateSettings(values: Partial<SettingsRecord>): Promise<void> {
  await ensureSeed();
  await db
    .update(businessSettings)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(businessSettings.id, 1));
}

export async function listEnquiries() {
  await ensureSeed();
  return db.select().from(enquiries).orderBy(desc(enquiries.createdAt)).limit(200);
}

export async function createEnquiry(input: {
  name: string;
  phone: string;
  email?: string;
  serviceSlug?: string;
  serviceName?: string;
  address?: string;
  message?: string;
}) {
  await ensureSeed();
  const rows = await db
    .insert(enquiries)
    .values({
      name: input.name,
      phone: input.phone,
      email: input.email ?? null,
      serviceSlug: input.serviceSlug || null,
      serviceName: input.serviceName || null,
      address: input.address || null,
      message: input.message || null,
    })
    .returning({ id: enquiries.id });
  return rows[0].id;
}

export async function setEnquiryStatus(id: number, status: string) {
  await db.update(enquiries).set({ status, updatedAt: new Date() }).where(eq(enquiries.id, id));
}

export async function getCustomer(id: number) {
  await ensureSeed();
  const rows = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function updateCustomer(
  id: number,
  values: { name: string; phone: string; email?: string; address?: string; city?: string; notes?: string },
) {
  await db
    .update(customers)
    .set({
      name: values.name,
      phone: values.phone,
      email: values.email?.trim() || null,
      address: values.address?.trim() || null,
      city: values.city?.trim() || null,
      notes: values.notes?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(customers.id, id));
}

export async function deleteCustomer(id: number) {
  await db.delete(customers).where(eq(customers.id, id));
}

export async function listCustomerEstimates(customerId: number) {
  await ensureSeed();
  return db.select().from(estimates).where(eq(estimates.customerId, customerId)).orderBy(desc(estimates.createdAt));
}

export async function listGallery(activeOnly = true) {
  await ensureSeed();
  const rows = await db.select().from(galleryItems).orderBy(asc(galleryItems.sortOrder), asc(galleryItems.id));
  return activeOnly ? rows.filter((row) => row.isActive) : rows;
}

export async function createGalleryItem(input: {
  title: string;
  caption?: string;
  video?: string;
  poster?: string;
  serviceSlug?: string;
  location?: string;
  isActive?: boolean;
  sortOrder?: number;
}) {
  await ensureSeed();
  const rows = await db
    .insert(galleryItems)
    .values({
      title: input.title,
      caption: input.caption ?? "",
      video: input.video ?? "",
      poster: input.poster ?? "",
      serviceSlug: input.serviceSlug ?? "",
      location: input.location ?? "",
      isActive: input.isActive ?? true,
      sortOrder: input.sortOrder ?? 0,
    })
    .returning({ id: galleryItems.id });
  return rows[0].id;
}

export async function updateGalleryItem(id: number, values: Partial<typeof galleryItems.$inferInsert>) {
  await db.update(galleryItems).set(values).where(eq(galleryItems.id, id));
}

export async function deleteGalleryItem(id: number) {
  await db.delete(galleryItems).where(eq(galleryItems.id, id));
}

export async function listCustomers(search?: string) {
  await ensureSeed();
  const term = search?.trim();
  const where = term
    ? sql`(${customers.name} ilike ${`%${term}%`} or ${customers.phone} ilike ${`%${term.replace(/\D/g, "")}%`} or coalesce(${customers.address}, '') ilike ${`%${term}%`})`
    : undefined;

  const rows = await db
    .select({
      id: customers.id,
      name: customers.name,
      phone: customers.phone,
      email: customers.email,
      address: customers.address,
      city: customers.city,
      createdAt: customers.createdAt,
      estimateCount: sql<number>`count(distinct ${estimates.id})`.mapWith(Number),
    })
    .from(customers)
    .leftJoin(estimates, eq(estimates.customerId, customers.id))
    .where(where)
    .groupBy(customers.id)
    .orderBy(desc(customers.createdAt))
    .limit(300);

  const valueRows = await db
    .select({
      customerId: estimates.customerId,
      total: sql<number>`coalesce(sum(${estimates.totalPrice}), 0)`.mapWith(Number),
    })
    .from(estimates)
    .groupBy(estimates.customerId);

  const valueMap = new Map(valueRows.map((row) => [row.customerId, row.total]));

  return rows.map((row) => ({
    ...row,
    totalValue: valueMap.get(row.id) ?? 0,
    estimateCount: Number(row.estimateCount ?? 0),
  }));
}

export async function getDashboardStats() {
  await ensureSeed();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [totals] = await db
    .select({
      count: sql<number>`count(*)`.mapWith(Number),
      pipeline: sql<number>`coalesce(sum(${estimates.totalPrice}), 0)`.mapWith(Number),
      area: sql<number>`coalesce(sum(${estimates.totalArea}), 0)`.mapWith(Number),
      windows: sql<number>`coalesce(sum(${estimates.totalQuantity}), 0)`.mapWith(Number),
    })
    .from(estimates);

  const [monthly] = await db
    .select({
      count: sql<number>`count(*)`.mapWith(Number),
      pipeline: sql<number>`coalesce(sum(${estimates.totalPrice}), 0)`.mapWith(Number),
    })
    .from(estimates)
    .where(gte(estimates.createdAt, monthStart));

  const [customerCount] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(customers);

  const [openEnquiries] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(enquiries)
    .where(eq(enquiries.status, "new"));

  const [confirmed] = await db
    .select({
      count: sql<number>`count(*)`.mapWith(Number),
      value: sql<number>`coalesce(sum(${estimates.totalPrice}), 0)`.mapWith(Number),
    })
    .from(estimates)
    .where(and(eq(estimates.status, "confirmed")));

  const byService = await db
    .select({
      serviceName: estimates.serviceName,
      count: sql<number>`count(*)`.mapWith(Number),
      value: sql<number>`coalesce(sum(${estimates.totalPrice}), 0)`.mapWith(Number),
    })
    .from(estimates)
    .groupBy(estimates.serviceName)
    .orderBy(desc(sql`count(*)`));

  const [windowCount] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(estimateItems);

  return {
    estimates: totals?.count ?? 0,
    pipeline: totals?.pipeline ?? 0,
    area: totals?.area ?? 0,
    windows: windowCount?.count ?? 0,
    monthEstimates: monthly?.count ?? 0,
    monthPipeline: monthly?.pipeline ?? 0,
    customers: customerCount?.count ?? 0,
    openEnquiries: openEnquiries?.count ?? 0,
    confirmedCount: confirmed?.count ?? 0,
    confirmedValue: confirmed?.value ?? 0,
    byService,
  };
}
