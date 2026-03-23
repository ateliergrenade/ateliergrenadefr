"use client";

import { Atelier } from "@/types/atelier.types";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAtelierCoverImage } from "@/hooks/useAtelierCoverImage";

interface LayoutProps {
  ateliers: Atelier[];
  onDetailsClick: (atelier: Atelier) => void;
}

function HeroSection({ atelier, onDetailsClick }: { atelier: Atelier; onDetailsClick: (a: Atelier) => void }) {
  const coverImageUrl = useAtelierCoverImage(atelier.id);

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      {/* Background Image */}
      {coverImageUrl ? (
        <Image
          src={coverImageUrl}
          alt={atelier.titre}
          fill
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <div className="w-full h-full bg-gray-300" />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Content centered */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <h3
          className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 uppercase"
          style={{
            color: "#ffffff",
            fontFamily: "var(--font-playfair), serif",
            letterSpacing: "-0.02em",
            lineHeight: "1.1",
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          {atelier.titre}
        </h3>
        <div className="w-20 h-0.5 mb-6 mx-auto" style={{ backgroundColor: "#c8102e" }} />
        <p
          className="text-base md:text-xl max-w-2xl mb-8"
          style={{
            color: "#f8f5f2",
            fontFamily: "var(--font-crimson), serif",
            lineHeight: "1.6",
            textShadow: "0 1px 4px rgba(0,0,0,0.3)",
          }}
        >
          {atelier.description_courte}
        </p>
        <Button
          onClick={() => onDetailsClick(atelier)}
          className="px-8 py-3 text-sm font-bold rounded-full transition-all hover:scale-105 uppercase"
          style={{
            backgroundColor: "transparent",
            color: "#ffffff",
            border: "2px solid #ffffff",
            fontFamily: "var(--font-playfair), serif",
            letterSpacing: "0.05em",
          }}
        >
          En savoir +
        </Button>
      </div>
    </div>
  );
}

export function AtelierStackedHero({ ateliers, onDetailsClick }: LayoutProps) {
  return (
    <div className="space-y-2 py-8">
      {ateliers.map((atelier) => (
        <HeroSection key={atelier.id} atelier={atelier} onDetailsClick={onDetailsClick} />
      ))}
    </div>
  );
}
