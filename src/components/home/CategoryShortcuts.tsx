import Link from "next/link";
import { ProductImage } from "@/components/ui/ProductImage";

const CATEGORIES = [
  {
    label: "Perfumes",
    href: "/shop?category=perfumes",
    image: "/products/afnan-9pm-collection.png",
  },
  {
    label: "Oil Perfumes",
    href: "/shop?category=oil-perfumes",
    image: "/products/oil-perfumes-collection.png",
  },
  {
    label: "Body Sprays",
    href: "/shop?category=body-sprays",
    image: "/products/lattafa-asad-khamrah-body-spray.png",
  },
  {
    label: "Cosmetics",
    href: "/shop?category=cosmetics",
    image: "/products/yzs-hydrate-moisture-setting-spray.png",
  },
  {
    label: "Skincare",
    href: "/shop?category=skincare",
    image: "/products/puqianna-aloe-soothing-mask.png",
  },
  {
    label: "Body Care",
    href: "/shop?category=body-essentials",
    image: "/products/kormesic-whitening-shea-butter-soap.png",
  },
  {
    label: "New In",
    href: "/shop?collection=new-arrivals",
    image: "/products/fruits-veggies-plus.png",
  },
  {
    label: "Best Sellers",
    href: "/shop?collection=best-sellers",
    image: "/products/puqianna-aloe-soothing-mask.png",
  },
  {
    label: "Wholesale",
    href: "/wholesale",
    image: "/products/placeholder-product.svg",
  },
] as const;

/**
 * Circular category shortcuts — Temu-style browse rail.
 */
export function CategoryShortcuts() {
  return (
    <nav aria-label="Shop categories" className="rounded-xl bg-white border border-line px-3 py-4">
      <ul className="flex gap-4 overflow-x-auto no-scrollbar sm:justify-between">
        {CATEGORIES.map((c) => (
          <li key={c.href} className="shrink-0">
            <Link href={c.href} className="group flex w-[72px] flex-col items-center sm:w-[84px]">
              <span className="relative h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-full bg-cream ring-1 ring-line">
                <ProductImage
                  src={c.image}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover transition group-hover:scale-105"
                />
              </span>
              <span className="mt-2 text-center text-[11px] font-medium text-ink leading-tight">
                {c.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
