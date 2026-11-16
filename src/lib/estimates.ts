import { and, asc, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { customers, estimateItems, estimates, services } from "@/db/schema";
import { ensureSeed } from "@/lib/seed";
import {
  computeLine,
  computeTotals,
  finalPrice,
  isBillingUnit,
  round2,
  type BillingUnit,
  type EstimateStatus,
  type MeasurementUnit,
} from "@/lib/domain";

export type EstimateLineInput = {
  label?: string;
  widthValue: number;
  heightValue: number;
  rate?: number;
};

export type EstimateWritePayload = {
  customer: { name: string; phone: string; address?: string; city?: string };
  serviceSlug: string;
  unit: BillingUnit;
  measurementUnit: MeasurementUnit;
  rate: number;
  discount?: number;
  status?: EstimateStatus;
  notes?: string;
  items: EstimateLineInput[];
};

export type EstimateListItem = {
  id: number;
  estimateNo: string;
  customerName: string;
  phone: string;
  address: string | null;
  city: string | null;
  serviceName: string;
  serviceSlug: string | null;
  unit: string;
  rate: number;
  totalQuantity: number;
  totalArea: number;
  subtotal: number;
  discount: number;
  totalPrice: number;
  status: string;
  notes: string | null;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
};

export type EstimateDetail = EstimateListItem & {
  customerId: number;
  customerEmail: string | null;
  measurementUnit: MeasurementUnit;
  items: {
    id: number;
    label: string;
    widthValue: number;
    heightValue: number;
    widthFt: number;
    heightFt: number;
    quantity: number;
    unit: string;
    rate: number;
    price: number;
  }[];
};

export type ListEstimatesArgs = {
  search?: string;
  serviceSlug?: string;
  from?: string;
  to?: string;
  sort?: "recent" | "oldest" | "highest" | "lowest";
  limit?: number;
};

function mapListRow(row: {
  estimate: typeof estimates.$inferSelect;
  customer: typeof customers.$inferSelect;
  itemCount: number;
  serviceSlug?: string | null;
}): EstimateListItem {
  const e = row.estimate;
  return {
    id: e.id,
    estimateNo: e.estimateNo,
    customerName: row.customer.name,
    phone: row.customer.phone,
    address: row.customer.address,
    city: row.customer.city,
    serviceName: e.serviceName,
    serviceSlug: row.serviceSlug ?? null,
    unit: e.unit,
    rate: e.rate,
    totalQuantity: e.totalQuantity,
    totalArea: e.totalArea,
    subtotal: e.subtotal,
    discount: e.discount,
    totalPrice: e.totalPrice,
    status: e.status,
    notes: e.notes,
    itemCount: Number(row.itemCount ?? 0),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  };
}

export async function listEstimates(args: ListEstimatesArgs = {}): Promise<EstimateListItem[]> {
  await ensureSeed();
  const conditions = [];
  const search = args.search?.trim();
  if (search) {
    const digits = search.replace(/\D/g, "");
    conditions.push(
      or(
        ilike(customers.name, `%${search}%`),
        ilike(customers.address, `%${search}%`),
        digits ? ilike(customers.phone, `%${digits}%`) : undefined,
      ),
    );
  }
  if (args.serviceSlug) {
    if (/^\d+$/.test(args.serviceSlug)) conditions.push(eq(estimates.serviceId, Number(args.serviceSlug)));
    else conditions.push(eq(services.slug, args.serviceSlug));
  }
  if (args.from) {
    const from = new Date(`${args.from}T00:00:00`);
    if (!Number.isNaN(from.getTime())) conditions.push(gte(estimates.createdAt, from));
  }
  if (args.to) {
    const to = new Date(`${args.to}T23:59:59.999`);
    if (!Number.isNaN(to.getTime())) conditions.push(lte(estimates.createdAt, to));
  }

  const order =
    args.sort === "oldest"
      ? asc(estimates.createdAt)
      : args.sort === "highest"
        ? desc(estimates.totalPrice)
        : args.sort === "lowest"
          ? asc(estimates.totalPrice)
          : desc(estimates.createdAt);

  const rows = await db
    .select({
      estimate: estimates,
      customer: customers,
      serviceSlug: services.slug,
      itemCount: sql<number>`count(${estimateItems.id})`.mapWith(Number),
    })
    .from(estimates)
    .innerJoin(customers, eq(estimates.customerId, customers.id))
    .leftJoin(services, eq(estimates.serviceId, services.id))
    .leftJoin(estimateItems, eq(estimateItems.estimateId, estimates.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .groupBy(estimates.id, customers.id, services.id, services.slug)
    .orderBy(order)
    .limit(Math.min(Math.max(args.limit ?? 100, 1), 500));

  return rows.map(mapListRow);
}

export async function getEstimate(id: number): Promise<EstimateDetail | null> {
  await ensureSeed();
  const rows = await db
    .select({ estimate: estimates, customer: customers })
    .from(estimates)
    .innerJoin(customers, eq(estimates.customerId, customers.id))
    .where(eq(estimates.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) return null;

  const items = await db
    .select()
    .from(estimateItems)
    .where(eq(estimateItems.estimateId, id))
    .orderBy(asc(estimateItems.sortOrder), asc(estimateItems.id));

  return {
    ...mapListRow({ estimate: row.estimate, customer: row.customer, itemCount: items.length, serviceSlug: null }),
    customerId: row.customer.id,
    customerEmail: row.customer.email,
    measurementUnit: (row.estimate.measurementUnit === "ft" ? "ft" : "in") as MeasurementUnit,
    items: items.map((item) => ({
      id: item.id,
      label: item.label,
      widthValue: item.widthValue,
      heightValue: item.heightValue,
      widthFt: item.widthFt,
      heightFt: item.heightFt,
      quantity: item.quantity,
      unit: item.unit,
      rate: item.rate,
      price: item.price,
    })),
  };
}

async function upsertCustomer(input: EstimateWritePayload["customer"]): Promise<number> {
  const phone = input.phone;
  const existing = await db.select({ id: customers.id }).from(customers).where(eq(customers.phone, phone)).limit(1);
  if (existing[0]) {
    await db
      .update(customers)
      .set({
        name: input.name,
        address: input.address?.trim() || null,
        city: input.city?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, existing[0].id));
    return existing[0].id;
  }
  const inserted = await db
    .insert(customers)
    .values({
      name: input.name,
      phone,
      address: input.address?.trim() || null,
      city: input.city?.trim() || null,
    })
    .returning({ id: customers.id });
  return inserted[0].id;
}

async function nextEstimateNumber(): Promise<string> {
  const now = new Date();
  const prefix = `AN-${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const rows = await db
    .select({ estimateNo: estimates.estimateNo })
    .from(estimates)
    .where(ilike(estimates.estimateNo, `${prefix}-%`))
    .orderBy(desc(estimates.estimateNo))
    .limit(1);
  const last = rows[0]?.estimateNo;
  const lastSeq = last ? Number(last.split("-").pop()) : 0;
  return `${prefix}-${String((Number.isFinite(lastSeq) ? lastSeq : 0) + 1).padStart(4, "0")}`;
}

async function resolveService(serviceSlug: string) {
  const rows = await db
    .select()
    .from(services)
    .where(/^\d+$/.test(serviceSlug) ? eq(services.id, Number(serviceSlug)) : eq(services.slug, serviceSlug))
    .limit(1);
  return rows[0] ?? null;
}

function buildItems(
  payload: EstimateWritePayload,
  resolvedRate: number,
) {
  return payload.items.map((item, index) => {
    const rate = item.rate && item.rate > 0 ? item.rate : resolvedRate;
    const line = computeLine({
      unit: payload.unit,
      rate,
      widthValue: item.widthValue,
      heightValue: item.heightValue,
      measurementUnit: payload.measurementUnit,
    });
    return {
      label: item.label?.trim() || `Window ${index + 1}`,
      widthValue: round2(item.widthValue),
      heightValue: round2(item.heightValue),
      widthFt: line.widthFt,
      heightFt: line.heightFt,
      quantity: line.quantity,
      unit: payload.unit,
      rate: round2(rate),
      price: line.price,
      sortOrder: index,
    };
  });
}

export async function createEstimate(payload: EstimateWritePayload, operator?: string): Promise<number> {
  await ensureSeed();
  const service = await resolveService(payload.serviceSlug);
  const resolvedRate = payload.rate > 0 ? payload.rate : (service?.defaultRate ?? 0);
  const items = buildItems(payload, resolvedRate);
  const totals = computeTotals(items);
  const discount = payload.discount ?? 0;
  const customerId = await upsertCustomer(payload.customer);
  const estimateNo = await nextEstimateNumber();

  const inserted = await db
    .insert(estimates)
    .values({
      estimateNo,
      customerId,
      serviceId: service?.id ?? null,
      serviceName: service?.name ?? payload.serviceSlug,
      unit: payload.unit,
      measurementUnit: payload.measurementUnit,
      rate: round2(resolvedRate),
      totalQuantity: totals.quantity,
      totalArea: totals.area,
      subtotal: totals.subtotal,
      discount: round2(discount),
      totalPrice: finalPrice(totals.subtotal, discount),
      status: payload.status ?? "draft",
      notes: payload.notes?.trim() || null,
      createdBy: operator ?? null,
    })
    .returning({ id: estimates.id });

  const estimateId = inserted[0].id;
  await db.insert(estimateItems).values(items.map((item) => ({ ...item, estimateId })));
  return estimateId;
}

export async function updateEstimate(id: number, payload: EstimateWritePayload, operator?: string): Promise<boolean> {
  await ensureSeed();
  const existing = await db.select().from(estimates).where(eq(estimates.id, id)).limit(1);
  if (!existing[0]) return false;

  const service = await resolveService(payload.serviceSlug);
  const resolvedRate = payload.rate > 0 ? payload.rate : (service?.defaultRate ?? existing[0].rate);
  const items = buildItems(payload, resolvedRate);
  const totals = computeTotals(items);
  const discount = payload.discount ?? 0;
  const customerId = await upsertCustomer(payload.customer);

  await db
    .update(estimates)
    .set({
      customerId,
      serviceId: service?.id ?? null,
      serviceName: service?.name ?? payload.serviceSlug,
      unit: payload.unit,
      measurementUnit: payload.measurementUnit,
      rate: round2(resolvedRate),
      totalQuantity: totals.quantity,
      totalArea: totals.area,
      subtotal: totals.subtotal,
      discount: round2(discount),
      totalPrice: finalPrice(totals.subtotal, discount),
      status: payload.status ?? existing[0].status,
      notes: payload.notes?.trim() || null,
      createdBy: operator ?? existing[0].createdBy,
      updatedAt: new Date(),
    })
    .where(eq(estimates.id, id));

  await db.delete(estimateItems).where(eq(estimateItems.estimateId, id));
  if (items.length) {
    await db.insert(estimateItems).values(items.map((item) => ({ ...item, estimateId: id })));
  }
  return true;
}

export async function updateEstimateStatus(id: number, status: EstimateStatus): Promise<boolean> {
  const result = await db
    .update(estimates)
    .set({ status, updatedAt: new Date() })
    .where(eq(estimates.id, id))
    .returning({ id: estimates.id });
  return result.length > 0;
}

export async function deleteEstimate(id: number): Promise<boolean> {
  const result = await db.delete(estimates).where(eq(estimates.id, id)).returning({ id: estimates.id });
  return result.length > 0;
}

export function asBillingUnit(value: unknown): BillingUnit {
  return isBillingUnit(value) ? value : "sqft";
}
