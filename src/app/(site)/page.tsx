import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Certificate,
  Check,
  Coins,
  HandHeart,
  Medal,
  MessageCircle,
  Phone,
  PlayCircle,
  ShieldCheck,
  Star,
  Toolbox,
  Wallet,
} from "@/components/icons";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { PhotoGrid, VideoGrid } from "@/components/site/media";
import { Reveal } from "@/components/site/reveal";
import { CtaBand, FaqList, MapCard, SectionHead } from "@/components/site/sections";
import { ServiceIcon } from "@/components/site/service-icon";
import { pickFaqs } from "@/lib/blog";
import { getActiveServices, getSettings } from "@/lib/data";
import { whatsappLink } from "@/lib/domain";
import { getMedia } from "@/lib/media";

export const dynamic = "force-dynamic";

const PROMISES = ["Worry-free services", "Trusted & experienced", "Quality work", "Service guarantee"];

const REASONS = [
  { icon: Toolbox, title: "Expert Installation", body: "Our trained professionals ensure a hassle-free and precise installation." },
  { icon: Medal, title: "High-Quality Materials", body: "We use premium-grade nets and grills for long-lasting protection." },
  { icon: Wallet, title: "Affordable Pricing", body: "Get the best quality at competitive prices." },
  { icon: HandHeart, title: "Customer Satisfaction", body: "Our focus is on delivering excellent service and durable solutions." },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Quality Guarantee",
    body: "Our long experience in this field comes from our commitment to strict quality standards. We always ensure the highest level of quality in our work.",
  },
  {
    icon: Certificate,
    title: "5+ Years Experience",
    body: "With highly experienced and well-trained professionals, we guarantee results that exceed your expectations.",
  },
  {
    icon: Coins,
    title: "Cost Effective",
    body: "Our services are designed to be cost-effective, offering the best quality at an affordable price.",
  },
];

const FAQ_STARTS = [
  "How much does a mosquito net cost",
  "Can I install a mosquito net",
  "Are invisible grills safe",
  "Do invisible grills rust",
  "How long does a bird net last",
  "Are pleated mosquito nets easy to maintain",
];

export default async function HomePage() {
  const [services, settings, media] = await Promise.all([getActiveServices(), getSettings(), getMedia()]);
  const whatsapp = settings.whatsapp || settings.phone.replace(/\D/g, "");
  const labels = Object.fromEntries(services.map((service) => [service.slug, service.name]));
  const formServices = services.map((service) => ({ slug: service.slug, name: service.name }));
  const faqs = pickFaqs(FAQ_STARTS);
  const firstVideo = media.videos[0];

  const stats = [
    { value: "5+", label: "Years experience" },
    { value: String(services.length), label: "Netting services" },
    { value: String(media.videos.length + media.photos.length), label: "Project photos & videos" },
    { value: "2", label: "Cities · Mumbai & Navi Mumbai" },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 via-white to-white" />
        <div className="mesh-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[440px] opacity-60 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />

        <div className="shell grid items-center gap-12 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="rise text-center lg:text-left">
            <span className="eyebrow">
              <Star className="h-3.5 w-3.5" weight="fill" /> {settings.tagline}
            </span>
            <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-[3.5rem]">
              Mosquito Nets, Bird Net &amp;{" "}
              <span className="bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
                Invisible Grill
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[1.05rem] leading-relaxed text-ink-700 lg:mx-0">
              Keep mosquitoes away, stay safe with stylish grills, and block birds effectively. We make your place
              secure and stylish.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link href="#quote" className="btn btn-primary px-5 py-3.5">
                Get a quote <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={whatsappLink(whatsapp, "Hello Amit Nettings")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp px-5 py-3.5"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp us
              </a>
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="btn btn-ghost px-5 py-3.5">
                <Phone className="h-4 w-4" /> {settings.phone}
              </a>
            </div>

            <dl className="mx-auto mt-10 grid max-w-xl grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4 lg:mx-0">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="font-display text-3xl font-extrabold text-ink-950">{stat.value}</dt>
                  <dd className="mt-1 text-[0.7rem] font-semibold uppercase leading-snug tracking-[0.1em] text-ink-400">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <Reveal className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="relative aspect-[4/3.6] w-full overflow-hidden rounded-[1.75rem] border border-white/70 shadow-lift">
              <Image
                src="/media/photos/grill-2.jpg"
                alt="Balcony protected with an invisible grill and netting by Amit Nettings"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink-950/75 to-transparent" />
              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/25 bg-white/15 p-4 text-white backdrop-blur-md">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/75">Our services</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold">
                  {services.map((service) => (
                    <Link key={service.slug} href={`/services/${service.slug}`} className="hover:underline">
                      {service.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {firstVideo && (
              <Link
                href="/gallery"
                className="card absolute -top-5 right-4 hidden items-center gap-3 p-2.5 pr-4 transition-transform hover:-translate-y-0.5 sm:flex"
              >
                <span className="relative block h-12 w-12 overflow-hidden rounded-xl bg-sand-100">
                  {firstVideo.poster && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={firstVideo.poster} alt="" className="h-full w-full object-cover" />
                  )}
                </span>
                <span className="leading-tight">
                  <span className="block text-xs font-medium text-ink-400">Watch our work</span>
                  <span className="block font-display font-bold text-ink-950">{media.videos.length} videos</span>
                </span>
                <PlayCircle className="h-7 w-7 text-brand-600" weight="fill" />
              </Link>
            )}
          </Reveal>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section">
        <div className="shell">
          <SectionHead eyebrow="What we install" title="We Deliver Top-Quality Solutions">
            We offer services to help you with mosquito nets, safety grills, and bird nets.
          </SectionHead>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {services.map((service, index) => {
              const videos = media.videos.filter((item) => item.serviceSlug === service.slug).length;
              const photos = media.photos.filter((item) => item.serviceSlug === service.slug).length;
              return (
                <Reveal key={service.slug} delay={index * 70} className="h-full">
                  <Link
                    href={`/services/${service.slug}`}
                    className="card group flex h-full flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lift"
                  >
                    <div className="relative aspect-[16/11] w-full overflow-hidden bg-brand-50">
                      {service.image && (
                        <Image
                          src={service.image}
                          alt={`${service.name} installation`}
                          fill
                          sizes="(max-width: 768px) 100vw, 380px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-center justify-between gap-3">
                        <span className="icon-tile">
                          <ServiceIcon icon={service.icon} />
                        </span>
                        {videos + photos > 0 && (
                          <span className="chip bg-sand-100 text-ink-700">
                            {videos} videos · {photos} photos
                          </span>
                        )}
                      </div>
                      <h3 className="mt-4 text-xl font-bold">{service.name}</h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{service.tagline}</p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                        View details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* INDUSTRY LEADERS + VIDEOS (dark band) */}
      <section className="section bg-ink-950 text-white">
        <div className="shell grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <SectionHead eyebrow="Our work" title="We are industry leaders" align="start" tone="dark">
              We’re at the forefront of the industry, known for our excellence and innovation. Our team’s dedication
              and top-notch solutions have made us industry leaders. We’re committed to providing you the best because
              you deserve nothing less.
            </SectionHead>
            <ul className="mx-auto mt-7 grid max-w-md grid-cols-2 gap-3 lg:mx-0">
              {PROMISES.map((item) => (
                <li key={item} className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm font-semibold">
                  <Check className="h-4 w-4 shrink-0 text-brand-300" /> {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 text-center lg:text-left">
              <Link href="/gallery" className="btn btn-primary px-5 py-3.5">
                More videos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>

          {media.videos.length > 0 && (
            <Reveal delay={80} className="mx-auto w-full max-w-2xl">
              <VideoGrid items={media.videos.slice(0, 3)} labels={labels} columns={3} />
            </Reveal>
          )}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="section">
        <div className="shell">
          <SectionHead eyebrow="Why choose us?" title="The best choice for a safe, comfortable home" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {REASONS.map((reason, index) => (
              <Reveal key={reason.title} delay={index * 70} className="h-full">
                <div className="card h-full p-6">
                  <div className="flex items-center justify-between">
                    <span className="icon-tile">
                      <reason.icon className="h-6 w-6" weight="duotone" />
                    </span>
                    <span className="font-display text-4xl font-extrabold text-brand-100">{index + 1}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold">{reason.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{reason.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* BEST SERVICES */}
      <section className="section bg-sand-50">
        <div className="shell">
          <SectionHead eyebrow="Our promise" title="We provide the best services" />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {VALUES.map((value, index) => (
              <Reveal key={value.title} delay={index * 70} className="h-full">
                <div className="card h-full p-7 text-center">
                  <span className="icon-tile icon-tile-dark mx-auto">
                    <value.icon className="h-6 w-6" weight="duotone" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{value.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECT PHOTOS */}
      {media.photos.length > 0 && (
        <section className="section">
          <div className="shell">
            <SectionHead eyebrow="Photo gallery" title="Our latest netting projects" />
            <div className="mt-12">
              <PhotoGrid items={media.photos.slice(0, 8)} />
            </div>
            <div className="mt-10 text-center">
              <Link href="/gallery" className="btn btn-ghost px-5 py-3">
                View full gallery <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="section bg-sand-50">
          <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <SectionHead eyebrow="FAQ" title="Questions customers ask us" align="start">
                Still unsure? Message us on WhatsApp and we will help you choose the right net or grill.
              </SectionHead>
              <div className="mt-7 text-center lg:text-left">
                <a
                  href={whatsappLink(whatsapp, "Hello Amit Nettings, I have a question.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp px-5 py-3"
                >
                  <MessageCircle className="h-4 w-4" /> Ask on WhatsApp
                </a>
              </div>
            </div>
            <Reveal delay={80}>
              <FaqList items={faqs} />
            </Reveal>
          </div>
        </section>
      )}

      {/* QUOTE + MAP */}
      <section id="quote" className="section">
        <div className="shell">
          <SectionHead eyebrow="Get a quote" title="Do you need help with netting solutions?">
            Fill out this form to get in touch.
          </SectionHead>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <EnquiryForm services={formServices} whatsapp={whatsapp} />
            <MapCard
              businessName={settings.businessName}
              address={settings.address}
              city={settings.city}
              embedUrl={settings.mapEmbed}
            />
          </div>
        </div>
      </section>

      <CtaBand whatsapp={whatsapp} phone={settings.phone} />
    </>
  );
}
