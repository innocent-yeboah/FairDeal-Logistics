"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/cn";

const FALLBACK = "/products/placeholder-product.svg";

type Props = Omit<ImageProps, "src" | "onError"> & {
  src: string | null | undefined;
  fallbackSrc?: string;
};

/**
 * Product image that falls back to a local placeholder when remote URLs fail.
 */
export function ProductImage({ src, fallbackSrc = FALLBACK, alt, className, ...rest }: Props) {
  const initial = src && src.trim().length > 0 ? src : fallbackSrc;
  const [current, setCurrent] = useState(initial);

  useEffect(() => {
    setCurrent(src && src.trim().length > 0 ? src : fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <Image
      {...rest}
      src={current}
      alt={alt}
      className={cn(className)}
      onError={() => {
        if (current !== fallbackSrc) setCurrent(fallbackSrc);
      }}
    />
  );
}
