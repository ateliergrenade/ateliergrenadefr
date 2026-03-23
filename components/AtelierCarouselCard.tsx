"use client";

import { Atelier } from "@/types/atelier.types";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";

interface AtelierCarouselCardProps {
  atelier: Atelier;
  onDetailsClick: (atelier: Atelier) => void;
  variant: number;
  isActive?: boolean;
}

export function AtelierCarouselCard({
  atelier,
  onDetailsClick,
  variant,
  isActive = false
}: AtelierCarouselCardProps) {
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoverImage = async () => {
      try {
        const response = await fetch(`/api/ateliers/${atelier.id}/images`);
        if (response.ok) {
          const images = await response.json();
          const coverImage = images.find((img: any) => img.is_cover);
          if (coverImage) {
            setCoverImageUrl(coverImage.url);
          }
        }
      } catch (error) {
        console.error("Error fetching cover image:", error);
      }
    };

    fetchCoverImage();
  }, [atelier.id]);

  return (
    <div
      className="carousel-card h-full rounded-3xl transition-all overflow-hidden relative"
      style={{
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
      }}
    >
      {/* Background Image - Full visibility */}
      {coverImageUrl && (
        <div className="absolute inset-0 z-0">
          <Image
            src={coverImageUrl}
            alt={atelier.titre}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Subtle overlay for better contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40"></div>
        </div>
      )}

      {/* White content card - positioned in lower portion */}
      <div className="relative z-10 h-full flex items-end p-6 md:p-8">
        <div
          className="bg-white/85 backdrop-blur-sm rounded-2xl p-6 md:p-8 w-full shadow-2xl transition-all hover:shadow-3xl hover:bg-white/95"
          style={{
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
          }}
        >
          {/* Title */}
          <h3
            className="text-xl md:text-3xl lg:text-xl font-bold mb-2 text-left uppercase"
            style={{
              color: "#2d5a3d",
              fontFamily: "var(--font-playfair), serif",
              fontWeight: 700,
              lineHeight: "1.1",
              letterSpacing: "-0.02em",
            }}
          >
            {atelier.titre}
          </h3>

          {/* Description */}
          <p
            className="text-sm md:text-base leading-relaxed mb-6 text-left"
            style={{
              color: "#1f2937",
              fontFamily: "var(--font-crimson), serif",
              lineHeight: "1.5",
            }}
          >
            {atelier.description_courte}
          </p>

          {/* Button */}
          <div className="text-left">
            <Button
              onClick={() => onDetailsClick(atelier)}
              className="px-6 py-3 text-sm md:text-base font-bold rounded-full transition-all hover:scale-105 uppercase"
              style={{
                backgroundColor: "transparent",
                color: "#2d5a3d",
                border: "3px solid #2d5a3d",
                fontFamily: "var(--font-playfair), serif",
                letterSpacing: "0.05em",
              }}
            >
              EN SAVOIR +
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
