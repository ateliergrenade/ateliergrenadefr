"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Atelier } from "@/types/atelier.types";
import { AtelierCarouselCard } from "./AtelierCarouselCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AtelierCarouselProps {
  ateliers: Atelier[];
  onDetailsClick: (atelier: Atelier) => void;
}

export function AtelierCarousel({
  ateliers,
  onDetailsClick,
}: AtelierCarouselProps) {
  // Duplicate ateliers multiple times for smooth infinite loop
  // We need at least 3x the number of visible slides for a seamless loop
  const duplicateCount = ateliers.length < 6 ? 5 : 3;
  const displayAteliers = Array(duplicateCount)
    .fill(ateliers)
    .flat();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    slidesToScroll: 1,
    skipSnaps: false,
    dragFree: false,
    containScroll: "trimSnaps",
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  if (!ateliers || ateliers.length === 0) {
    return (
      <div className="text-center py-12">
        <p
          className="text-xl"
          style={{
            color: "#1f2937",
            fontFamily: "var(--font-crimson), serif",
          }}
        >
          Aucun atelier disponible pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full py-8">
      {/* Carousel Viewport - Full Width */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {displayAteliers.map((atelier, index) => {
            const isActive = index === selectedIndex;
            return (
              <div
                key={`${atelier.id}-${index}`}
                className={`embla__slide flex-[0_0_85%] min-w-0 md:flex-[0_0_28%] lg:flex-[0_0_26%] px-3 ${
                  isActive ? 'embla__slide--active' : ''
                }`}
                style={{ height: "500px" }}
              >
                <AtelierCarouselCard
                  atelier={atelier}
                  onDetailsClick={onDetailsClick}
                  variant={index}
                  isActive={isActive}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons - Overlay on sides - Mobile */}
      <button
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex md:hidden items-center justify-center w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-xl transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
        onClick={scrollPrev}
        aria-label="Précédent"
      >
        <ChevronLeft size={20} className="text-gray-700" />
      </button>

      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex md:hidden items-center justify-center w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-xl transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
        onClick={scrollNext}
        aria-label="Suivant"
      >
        <ChevronRight size={20} className="text-gray-700" />
      </button>

      {/* Navigation Buttons - Overlay on sides - Desktop */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-14 h-14 rounded-full bg-white/95 hover:bg-white shadow-xl transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
        onClick={scrollPrev}
        aria-label="Précédent"
      >
        <ChevronLeft size={28} className="text-gray-700" />
      </button>

      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-14 h-14 rounded-full bg-white/95 hover:bg-white shadow-xl transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
        onClick={scrollNext}
        aria-label="Suivant"
      >
        <ChevronRight size={28} className="text-gray-700" />
      </button>
    </div>
  );
}
