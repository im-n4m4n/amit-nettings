"use client";

import { buildQuoteText, sizeLabel, type QuoteData } from "@/lib/quote";
import { BILLING_UNITS } from "@/lib/domain";
import { formatINR, formatNumber } from "@/lib/format";

const BRAND: [number, number, number] = [10, 111, 85];
const INK: [number, number, number] = [4, 19, 26];
const MUTED: [number, number, number] = [74, 103, 114];
const LINE: [number, number, number] = [222, 228, 226];

async function createDoc(data: QuoteData) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = margin;

  const header = () => {
    doc.setFillColor(...BRAND);
    doc.rect(0, 0, pageWidth, 26, "F");
    doc.setFillColor(4, 35, 28);
    doc.rect(0, 26, pageWidth, 1.6, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.text(data.business.businessName.toUpperCase(), margin, 12.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(data.business.tagline, margin, 18);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("ESTIMATE / QUOTATION", pageWidth - margin, 11, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    if (data.estimateNo) doc.text(`No: ${data.estimateNo}`, pageWidth - margin, 16, { align: "right" });
    const created = data.createdAt ? new Date(data.createdAt) : new Date();
    doc.text(
      Number.isNaN(created.getTime())
        ? ""
        : `Date: ${created.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`,
      pageWidth - margin,
      20.5,
      { align: "right" },
    );

    doc.setTextColor(...INK);
    y = 36;
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 22) {
      doc.addPage();
      header();
    }
  };

  header();

  // Customer block
  const customerLines = [
    [data.customer.name, formatPhoneSafe(data.customer.phone)],
    [data.customer.address, data.customer.city].filter(Boolean).join(", "),
  ].filter((line) => line && String(line).trim().length > 0);

  doc.setFillColor(246, 249, 248);
  doc.setDrawColor(...LINE);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 20 + customerLines.length * 4.6, 3, 3, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text("CUSTOMER", margin + 5, y + 6);
  doc.setTextColor(...INK);
  doc.setFontSize(11);
  let cy = y + 13;
  customerLines.forEach((line) => {
    doc.text(String(line), margin + 5, cy);
    cy += 4.6;
  });

  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text("SERVICE", pageWidth / 2 + 6, y + 6);
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(data.serviceName, pageWidth / 2 + 6, y + 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`Rate basis: ${BILLING_UNITS[data.unit].label}`, pageWidth / 2 + 6, y + 18);
  if (data.items.length) {
    doc.text(`${data.items.length} opening${data.items.length > 1 ? "s" : ""}`, pageWidth / 2 + 6, y + 23);
  }

  y += 20 + customerLines.length * 4.6 + 8;

  // Table
  const colX = [margin, margin + 10, margin + 78, margin + 108, margin + 132, pageWidth - margin];
  const drawTableHead = () => {
    doc.setFillColor(4, 19, 26);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 9, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("#", colX[0] + 2, y + 6);
    doc.text("OPENING / SIZE", colX[1] + 2, y + 6);
    doc.text("MEASUREMENT", colX[2], y + 6);
    doc.text(BILLING_UNITS[data.unit].label.toUpperCase(), colX[3], y + 6);
    doc.text("RATE", colX[4], y + 6);
    doc.text("AMOUNT", colX[5] - 2, y + 6, { align: "right" });
    y += 9;
  };

  drawTableHead();
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  data.items.forEach((item, index) => {
    const measurement = sizeLabel(item, data.measurementUnit);
    const rowHeight = 14;
    ensureSpace(rowHeight + 4);
    if (index % 2 === 0) {
      doc.setFillColor(250, 252, 251);
      doc.rect(margin, y, pageWidth - margin * 2, rowHeight, "F");
    }
    doc.setDrawColor(...LINE);
    doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

    const labelLines = doc.splitTextToSize(item.label || `Window ${index + 1}`, colX[2] - colX[1] - 6);
    doc.setFont("helvetica", "bold");
    doc.text(String(index + 1).padStart(2, "0"), colX[0] + 2, y + 6);
    doc.text(labelLines.slice(0, 1), colX[1] + 2, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.6);
    doc.setTextColor(...MUTED);
    doc.text(measurement, colX[1] + 2, y + 10.6);
    doc.setFontSize(9);
    doc.setTextColor(...INK);

    doc.text(`${formatNumber(item.quantity)} ${BILLING_UNITS[data.unit].short}`, colX[3], y + 6);
    doc.text(formatINR(item.rate, { decimals: true }), colX[4], y + 6);
    doc.setFont("helvetica", "bold");
    doc.text(formatINR(item.price, { decimals: true }), colX[5] - 2, y + 6, { align: "right" });
    doc.setFont("helvetica", "normal");

    y += rowHeight;
  });

  // Totals
  ensureSpace(34);
  y += 6;
  const boxX = pageWidth - margin - 82;
  doc.setDrawColor(...LINE);
  doc.setFontSize(10);
  const row = (label: string, value: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...(bold ? INK : MUTED));
    doc.text(label, boxX, y);
    doc.setTextColor(...INK);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(value, pageWidth - margin, y, { align: "right" });
    y += 6.4;
  };
  row(`Total ${BILLING_UNITS[data.unit].label}`, formatNumber(data.items.reduce((sum, item) => sum + item.quantity, 0)));
  row("Subtotal", formatINR(data.subtotal, { decimals: true }));
  if (data.discount > 0) row("Discount", `-${formatINR(data.discount, { decimals: true })}`);
  y += 2;
  doc.setFillColor(...BRAND);
  doc.roundedRect(boxX - 6, y - 5, pageWidth - margin - boxX + 6, 12, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("GRAND TOTAL", boxX, y + 3);
  doc.text(formatINR(data.total, { decimals: true }), pageWidth - margin, y + 3, { align: "right" });
  y += 16;
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("All figures in INR.", margin, y);
  y += 5;

  if (data.notes) {
    ensureSpace(18);
    doc.setTextColor(...INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Notes", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    const noteLines = doc.splitTextToSize(data.notes, pageWidth - margin * 2);
    doc.text(noteLines, margin, y + 5);
    y += 5 + noteLines.length * 4.4;
  }

  if (data.business.quoteTerms) {
    ensureSpace(30);
    doc.setTextColor(...INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Terms & conditions", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    const termLines = doc.splitTextToSize(data.business.quoteTerms, pageWidth - margin * 2);
    doc.text(termLines, margin, y + 5);
    y += 5 + termLines.length * 4.2;
  }

  // Footer on every page
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    const footerY = pageHeight - 12;
    doc.setDrawColor(...LINE);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    doc.setFontSize(7.8);
    doc.setTextColor(...MUTED);
    const contact = [
      data.business.phone,
      data.business.whatsapp ? `WhatsApp ${formatPhoneSafe(data.business.whatsapp)}` : "",
      data.business.email,
    ]
      .filter(Boolean)
      .join("  •  ");
    doc.text(contact, margin, footerY);
    doc.text(
      data.business.gstin ? `GSTIN: ${data.business.gstin}  •  ` : "",
      margin,
      footerY + 4,
    );
    doc.text("Computer generated estimate", pageWidth - margin, footerY, { align: "right" });
    doc.text(`Page ${page} of ${pages}`, pageWidth - margin, footerY + 4, { align: "right" });
  }

  return doc;
}

function formatPhoneSafe(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  return phone;
}

export async function downloadQuotePdf(data: QuoteData) {
  const doc = await createDoc(data);
  const filename = `${(data.business.businessName || "estimate").replace(/\s+/g, "-")}-Estimate-${
    data.estimateNo || new Date().toISOString().slice(0, 10)
  }.pdf`;
  doc.save(filename);
  return filename;
}

export async function quotePdfBlob(data: QuoteData): Promise<Blob> {
  const doc = await createDoc(data);
  return doc.output("blob");
}

/** Shares the PDF via the Web Share API when supported, otherwise downloads it. */
export async function shareQuotePdf(data: QuoteData): Promise<"shared" | "downloaded"> {
  const blob = await quotePdfBlob(data);
  const filename = `${(data.business.businessName || "estimate").replace(/\s+/g, "-")}-Estimate-${
    data.estimateNo || new Date().toISOString().slice(0, 10)
  }.pdf`;
  const file = new File([blob], filename, { type: "application/pdf" });
  const nav = typeof navigator !== "undefined" ? (navigator as Navigator & { canShare?: (d: ShareData) => boolean }) : undefined;

  if (nav && typeof nav.share === "function" && (!nav.canShare || nav.canShare({ files: [file] }))) {
    try {
      await nav.share({
        files: [file],
        title: `${data.business.businessName} estimate${data.estimateNo ? ` ${data.estimateNo}` : ""}`,
        text: `${data.serviceName} estimate for ${data.customer.name} — ${formatINR(data.total, { decimals: true })}`,
      });
      return "shared";
    } catch (error) {
      if ((error as Error)?.name === "AbortError") return "shared";
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return "downloaded";
}

export { buildQuoteText };
