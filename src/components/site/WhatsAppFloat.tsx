import { SITE } from "@/lib/constants";

const PREFILL = encodeURIComponent(
  `Hello ${SITE.name} — I would like to ask about a product.`,
);

/**
 * Persistent chat shortcut so community members can reach Fair Deal on WhatsApp.
 */
export function WhatsAppFloat() {
  return (
    <a
      href={`https://wa.me/${SITE.whatsapp}?text=${PREFILL}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${SITE.name} on WhatsApp at ${SITE.supportPhone}`}
      className="print:hidden fixed z-50 bottom-5 right-4 sm:bottom-6 sm:right-6 flex items-center gap-2 rounded-full bg-[#25D366] pl-3 pr-4 py-2.5 text-white shadow-lg shadow-black/20 transition hover:scale-105 hover:bg-[#1ebe5d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
    >
      <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15" aria-hidden>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.5.5c-.1.2-.3.3-.1.6.2.3.8 1.4 1.8 2.2 1.2 1.1 2.3 1.4 2.6 1.6.3.2.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.4 0 .1 0 .7-.2 1.5Z" />
        </svg>
      </span>
      <span className="text-sm font-semibold leading-tight">
        Chat with us
        <span className="block text-[10px] font-normal text-white/85">{SITE.supportPhone}</span>
      </span>
    </a>
  );
}
