import Link from "next/link";
import { ArrowLeft, Compass } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-brand-50 px-6">
      <div className="max-w-md text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-700 text-white">
          <Compass className="h-8 w-8" />
        </span>
        <h1 className="mt-6 text-3xl font-extrabold">Page not found</h1>
        <p className="mt-3 text-ink-500">
          That link no longer exists. Head back to the homepage or get in touch with us.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-ghost">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <Link href="/contact#quote" className="btn btn-primary">
            Get a quote
          </Link>
        </div>
      </div>
    </div>
  );
}
