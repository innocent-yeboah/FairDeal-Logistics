"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Homepage hero modelled on Care to Beauty Ghana:
 * https://www.caretobeauty.com/gh/
 * Full-width campaign slider + circular category shortcuts.
 */
const SLIDES = [
  {
    kicker: "September Reset",
    title: "Up to 40% Off",
    subtitle: "Your rentrée starts here",
    href: "/shop?collection=new-arrivals",
    image: "https://images.unsplash.com/photo-1570172619604-71d618ce9138?w=1800&auto=format&fit=crop",
    theme: "light" as const,
  },
  {
    kicker: "Brand of the Month",
    title: "Bioderma",
    subtitle: "25% Off",
    href: "/shop?collection=best-sellers",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1800&auto=format&fit=crop",
    theme: "light" as const,
  },
  {
    kicker: "Summer Store",
    title: "Up to 50% Off",
    subtitle: "A never-ending summer",
    href: "/shop?category=body-essentials",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1800&auto=format&fit=crop",
    theme: "dark" as const,
  },
  {
    kicker: "Brand of the Month",
    title: "Bioderma",
    subtitle: "25% Off",
    href: "/shop?collection=best-sellers",
    image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=1800&auto=format&fit=crop",
    theme: "light" as const,
  },
  {
    kicker: "Summer Store",
    title: "Up to 50% Off",
    subtitle: "Pressing play on summer!",
    href: "/shop?category=body-essentials",
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1800&auto=format&fit=crop",
    theme: "dark" as const,
  },
  {
    kicker: "Brand of the Week",
    title: "Riemann P20",
    subtitle: "20% Off",
    href: "/shop",
    image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1800&auto=format&fit=crop",
    theme: "light" as const,
  },
  {
    kicker: "New In",
    title: "Trending Beauty",
    subtitle: "Latest beauty releases",
    href: "/shop?collection=new-arrivals",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1800&auto=format&fit=crop",
    theme: "dark" as const,
  },
];

export function CareToBeautyHero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  const go = useCallback((dir: number) => {
    setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length);
  }, []);

  const goTo = useCallback((i: number) => {
    setIndex(i);
  }, []);

  useEffect(() => {
    if (paused) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = window.setInterval(() => go(1), 5500);
    return () => window.clearInterval(id);
  }, [paused, go]);

  return (
    <section className="bg-white w-full" aria-roledescription="carousel" aria-label="Featured campaigns">
      <div className="w-full pb-2">
        <div
          className="relative overflow-hidden h-[280px] sm:h-[400px] lg:h-[480px] bg-neutral-200"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={(e) => {
            touchX.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            if (touchX.current == null) return;
            const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          }}
        >
          <div
            className="flex h-full transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {SLIDES.map((slide, i) => {
              const light = slide.theme === "light";
              const Heading = i === 0 ? "h1" : "p";
              return (
                <div key={`${slide.title}-${i}`} className="relative h-full w-full shrink-0 grow-0 basis-full">
                  <Image
                    src={slide.image}
                    alt=""
                    fill
                    priority={i === 0}
                    sizes="100vw"
                    className="object-cover object-center"
                  />
                  <div
                    className={cn(
                      "absolute inset-0",
                      light
                        ? "bg-gradient-to-r from-white/85 via-white/40 to-transparent"
                        : "bg-gradient-to-r from-black/55 via-black/25 to-transparent",
                    )}
                  />
                  <div className="relative z-10 flex h-full items-center px-6 sm:px-12 lg:px-20">
                    <div className={cn("max-w-[34rem]", light ? "text-[#1a1a1a]" : "text-white")}>
                      <p className="text-[13px] sm:text-[15px] font-medium leading-snug">{slide.kicker}</p>
                      <Heading className="mt-1 font-sans text-[2rem] leading-[1.05] sm:text-[3.25rem] lg:text-[4rem] font-extrabold tracking-tight">
                        {slide.title}
                      </Heading>
                      <p className="mt-2 sm:mt-3 text-[15px] sm:text-[18px] font-medium opacity-90">
                        {slide.subtitle}
                      </p>
                      <Link
                        href={slide.href}
                        className={cn(
                          "mt-5 sm:mt-6 inline-flex h-10 sm:h-11 items-center rounded-full px-6 sm:px-7 text-[13px] sm:text-sm font-semibold transition",
                          light
                            ? "bg-black text-white hover:bg-black/80"
                            : "bg-white text-black hover:bg-white/90",
                        )}
                      >
                        Shop Now
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 z-20 hidden sm:grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-[#1a1a1a] shadow-[0_2px_10px_rgba(0,0,0,0.12)] hover:bg-white"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 z-20 hidden sm:grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-[#1a1a1a] shadow-[0_2px_10px_rgba(0,0,0,0.12)] hover:bg-white"
          >
            <ChevronRight />
          </button>

          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-1.5">
            {SLIDES.map((slide, i) => (
              <button
                key={`dot-${slide.kicker}-${i}`}
                type="button"
                aria-label={`Slide ${i}`}
                aria-current={i === index}
                onClick={() => goTo(i)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  i === index ? "bg-white scale-110 shadow" : "bg-white/55 hover:bg-white/85",
                )}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 19 8 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
