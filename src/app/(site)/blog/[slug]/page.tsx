import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "@/components/icons";
import { formatPostDate, getPost, type BlogBlock } from "@/lib/blog";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Article not found" };
  return { title: post.title, description: post.excerpt };
}

type Group = { kind: "h" | "p"; text: string } | { kind: "list"; items: string[] };

/** Consecutive list items become one list. */
function group(blocks: BlogBlock[]): Group[] {
  const out: Group[] = [];
  for (const block of blocks) {
    const last = out[out.length - 1];
    if (block.type === "li") {
      if (last && last.kind === "list") last.items.push(block.text);
      else out.push({ kind: "list", items: [block.text] });
    } else {
      out.push({ kind: block.type, text: block.text });
    }
  }
  return out;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="section">
      <div className="shell">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-950">
              <ArrowLeft className="h-4 w-4" /> Blog
            </Link>
            <p className="mt-6"><span className="eyebrow">{formatPostDate(post.date)}</span></p>
            <h1 className="mt-3 text-balance text-3xl font-extrabold leading-tight sm:text-4xl">{post.title}</h1>
          </div>

          {post.image && (
            <div className="relative mt-10 aspect-[16/10] overflow-hidden rounded-[1.5rem] bg-sand-100 shadow-lift">
              <Image src={post.image} alt="" fill priority sizes="(max-width: 768px) 100vw, 672px" className="object-cover" />
            </div>
          )}

          <div className="mt-10 space-y-5 text-[1.02rem] leading-relaxed text-ink-700">
            {group(post.blocks).map((item, index) => {
              if (item.kind === "h") {
                return (
                  <h2 key={index} className="pt-4 text-xl font-bold sm:text-2xl">
                    {item.text}
                  </h2>
                );
              }
              if (item.kind === "list") {
                return (
                  <ul key={index} className="list-disc space-y-2 pl-5 marker:text-brand-600">
                    {item.items.map((text, itemIndex) => (
                      <li key={itemIndex}>{text}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={index}>{item.text}</p>;
            })}
          </div>

          <div className="mt-14 rounded-2xl bg-brand-50 p-8 text-center">
            <h2 className="text-xl font-bold">Are you looking for netting services?</h2>
            <Link href="/contact#quote" className="btn btn-primary mt-5 px-6 py-3">
              Get a quote <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
