import { MessageCircle } from "@/components/icons";
import { whatsappLink } from "@/lib/domain";

export function WhatsAppFab({ phone }: { phone: string }) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  return (
    <a
      href={whatsappLink(digits, "Hello Amit Nettings")}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3.5 font-semibold text-white shadow-[0_18px_36px_-14px_rgba(37,211,102,0.9)] transition-transform hover:scale-[1.04]"
      aria-label="Chat with Amit Nettings on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" weight="fill" />
      <span className="hidden text-sm sm:inline">WhatsApp</span>
    </a>
  );
}
