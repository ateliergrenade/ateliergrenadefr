"use client";

import { useCallback } from "react";
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
    align: "start",
    slidesToScroll: 1,
    skipSnaps: false,
    dragFree: false,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

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
    <div className="relative flex items-center gap-4">
      {/* Previous Button */}
      <button
        className="hidden md:flex flex-shrink-0 items-center justify-center w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={scrollPrev}
        aria-label="Précédent"
      >
        <ChevronLeft size={24} className="text-gray-700" />
      </button>

      {/* Carousel Viewport */}
      <div className="flex-1 overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {displayAteliers.map((atelier, index) => (
            <div
              key={`${atelier.id}-${index}`}
              className="carousel-slide flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
              style={{ height: "500px" }}
            >
              <AtelierCarouselCard
                atelier={atelier}
                onDetailsClick={onDetailsClick}
                variant={index}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Next Button */}
      <button
        className="hidden md:flex flex-shrink-0 items-center justify-center w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={scrollNext}
        aria-label="Suivant"
      >
        <ChevronRight size={24} className="text-gray-700" />
      </button>
    </div>
  );
}
