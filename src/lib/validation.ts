import { z } from "zod";

const phoneRegex = /^[6-9]\d{9}$/;

export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .transform((value) => value.replace(/[^\d]/g, ""))
  .refine((value) => value.length >= 10 && value.length <= 13, "Enter a valid 10-digit mobile number")
  .transform((value) => (value.length === 12 && value.startsWith("91") ? value.slice(2) : value.length === 11 && value.startsWith("0") ? value.slice(1) : value))
  .refine((value) => phoneRegex.test(value), "Enter a valid Indian mobile number");

export const loginSchema = z.object({
  email: z.string().trim().min(3, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

const numeric = (fallback = 0) =>
  z
    .union([z.number(), z.string()])
    .optional()
    .transform((value) => {
      if (value === undefined || value === null || value === "") return fallback;
      const parsed = typeof value === "number" ? value : Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    });

export const estimateItemSchema = z.object({
  id: z.number().int().optional(),
  label: z.string().trim().max(80, "Label is too long").optional().default(""),
  widthValue: numeric().refine((v) => v > 0, "Width must be greater than 0"),
  heightValue: numeric().refine((v) => v > 0, "Height must be greater than 0"),
  rate: numeric().refine((v) => v >= 0 && v <= 1_000_000, "Rate looks invalid"),
});

export const estimatePayloadSchema = z
  .object({
    customer: z.object({
      name: z.string().trim().min(2, "Customer name is required").max(120),
      phone: phoneSchema,
      address: z.string().trim().max(400).optional().default(""),
      city: z.string().trim().max(120).optional().default(""),
    }),
    serviceSlug: z.string().trim().min(1, "Select a service"),
    unit: z.enum(["sqft", "rft", "pcs"]),
    measurementUnit: z.enum(["in", "ft"]),
    rate: numeric(),
    discount: numeric(),
    status: z.enum(["draft", "sent", "confirmed", "completed", "cancelled"]).default("draft"),
    notes: z.string().trim().max(1000).optional().default(""),
    items: z.array(estimateItemSchema).min(1, "Add at least one window measurement"),
  })
  .superRefine((value, ctx) => {
    const discount = typeof value.discount === "number" ? value.discount : 0;
    if (discount < 0) {
      ctx.addIssue({ code: "custom", path: ["discount"], message: "Discount cannot be negative" });
    }
    if (value.items.length > 200) {
      ctx.addIssue({ code: "custom", path: ["items"], message: "Too many windows in one estimate" });
    }
  });

export type EstimatePayload = z.input<typeof estimatePayloadSchema>;

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please share your name").max(120),
  phone: phoneSchema,
  email: z
    .union([z.string().trim().email("Enter a valid email"), z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined)),
  serviceSlug: z.string().trim().optional().default(""),
  address: z.string().trim().max(300).optional().default(""),
  message: z.string().trim().max(1200).optional().default(""),
});

export const enquiryUpdateSchema = z.object({
  status: z.enum(["new", "contacted", "converted", "closed"]),
});

export const serviceUpdateSchema = z.object({
  slug: z.string().trim().min(1),
  defaultRate: z.number().min(0).max(1_000_000),
  startingPrice: z.number().min(0).max(1_000_000),
  unit: z.enum(["sqft", "rft", "pcs"]),
  warrantyMonths: z.number().int().min(0).max(240),
  isActive: z.boolean(),
  tagline: z.string().trim().max(160),
});

export const settingsSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  tagline: z.string().trim().min(2).max(160),
  phone: z.string().trim().max(20),
  whatsapp: z.string().trim().max(20),
  email: z.string().trim().max(160),
  address: z.string().trim().max(300),
  city: z.string().trim().max(120),
  hours: z.string().trim().max(160),
  gstin: z.string().trim().max(40),
  mapEmbed: z
    .string()
    .trim()
    .max(1500)
    .refine((v) => v === "" || v.startsWith("https://www.google.com/maps/embed"), "Paste the Google Maps embed link (starts with https://www.google.com/maps/embed)"),
  quoteTerms: z.string().trim().max(2000),
});

export type EnquiryPayload = z.input<typeof enquirySchema>;
