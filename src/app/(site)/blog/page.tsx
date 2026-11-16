import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero, SectionHead } from "@/components/site/sections";
import { formatPostDate, posts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Guides on mosquito nets, bird nets and invisible grills from Amit Nettings.",
};

export default function BlogPage() {
  return (
    <>
      <PageHero>
        <SectionHead as="h1" eyebrow="Blog" title="Guides from Amit Nettings">
          Mosquito nets, bird nets and invisible grills — explained.
        </SectionHead>
      </PageHero>

      <section className="section">
        <div className="shell">
          <ul className="flex flex-wrap justify-center gap-6">
            {posts.map((post) => (
              <li key={post.slug} className="w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]">
                <Link
                  href={`/blog/${post.slug}`}
                  className="card group flex h-full flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="relative aspect-[16/10] bg-sand-100">
                    {post.image && (
                      <Image
                        src={post.image}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 350px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-400">
                      {formatPostDate(post.date)}
                    </p>
                    <h2 className="mt-2 text-lg font-bold leading-snug group-hover:text-brand-700">{post.title}</h2>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{post.excerpt}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
