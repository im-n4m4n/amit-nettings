import raw from "@/content/blog.json";

export type BlogBlock = { type: "h" | "p" | "li"; text: string };

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  image: string;
  excerpt: string;
  blocks: BlogBlock[];
};

/** Articles imported from the blog on amitnettings.in. */
export const posts = raw as BlogPost[];

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatPostDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return "";
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

export type Faq = { q: string; a: string; topic: "mosquito" | "bird" | "grill" };

/** Question / answer pairs published in the articles (numbered "1. …?" followed by the answer). */
export const faqs: Faq[] = posts.flatMap((post) =>
  post.blocks.flatMap((block, index) => {
    const match = block.text.match(/^\d+\.\s*(.+\?)$/);
    const next = post.blocks[index + 1];
    if (!match || !next || next.text.trim().endsWith("?")) return [];
    const q = match[1];
    const topic: Faq["topic"] = /grill/i.test(q) ? "grill" : /bird/i.test(q) ? "bird" : "mosquito";
    return [{ q, a: next.text, topic }];
  }),
);

export function pickFaqs(starts: string[]): Faq[] {
  const picked = starts
    .map((start) => faqs.find((faq) => faq.q.toLowerCase().startsWith(start.toLowerCase())))
    .filter((faq): faq is Faq => Boolean(faq));
  return picked.length > 0 ? picked : faqs.slice(0, 6);
}
