import Link from "next/link";
import { ProductImage } from "@/components/ui/ProductImage";

const BANNERS = [
  {
    title: "New Arrivals",
    blurb: "Fresh stock from the warehouse",
    href: "/shop?collection=new-arrivals",
    image: "/products/fruits-veggies-plus.png",
  },
  {
    title: "Perfumes",
    blurb: "Everyday to statement oud",
    href: "/shop?category=perfumes",
    image: "/products/giorgio-armani-my-way.png",
  },
  {
    title: "Wholesale",
    blurb: "Buy in bulk from 10 units",
    href: "/wholesale",
    image: "/products/placeholder-product.svg",
  },
] as const;

/**
 * Compact promo tiles under flash deals.
 */
export function PromoBanners() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {BANNERS.map((b) => (
        <Link
          key={b.href}
          href={b.href}
          className="group relative overflow-hidden rounded-xl aspect-[16/9] sm:aspect-[5/3] border border-line"
        >
          <ProductImage
            src={b.image}
            alt={b.title}
            fill
            sizes="(min-width:640px) 33vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-600/85 via-brand-600/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-white">
            <p className="font-display text-lg leading-tight">{b.title}</p>
            <p className="text-[11px] text-white/80">{b.blurb}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
