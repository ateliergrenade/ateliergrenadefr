"use client";

import { Atelier } from "@/types/atelier.types";
import { Button } from "@/components/ui/button";

interface AtelierCardProps {
  atelier: Atelier;
  onDetailsClick: (atelier: Atelier) => void;
}

export function AtelierCard({ atelier, onDetailsClick }: AtelierCardProps) {
  // Use atelier ID to deterministically assign a border variant
  // This ensures each card always has the same variant but different cards get different variants
  const variantClasses = [
    "sketchy-border-shadow",
    "sketchy-border-shadow-v2",
    "sketchy-border-shadow-v3",
  ];
  
  // Simple hash function based on atelier ID to pick a variant
  const getVariantClass = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash = hash & hash;
    }
    return variantClasses[Math.abs(hash) % variantClasses.length];
  };
  
  const borderClass = getVariantClass(atelier.id);
  
  return (
    <div
      className={`w-full p-8 rounded-lg transition-all ${borderClass}`}
      style={{
        backgroundColor: "#ffffff",
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left side: Title and Description */}
        <div className="flex-1">
          <h3
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{
              color: "#2d5a3d",
              fontFamily: "var(--font-playfair), serif",
              fontWeight: 700,
            }}
          >
            {atelier.titre}
          </h3>
          <p
            className="text-lg leading-relaxed"
            style={{
              color: "#1f2937",
              fontFamily: "var(--font-crimson), serif",
              lineHeight: "1.7",
            }}
          >
            {atelier.description_courte}
          </p>
        </div>

        {/* Right side: Button */}
        <div className="md:ml-6 flex-shrink-0">
          <Button
            onClick={() => onDetailsClick(atelier)}
            className="px-8 py-6 text-lg font-semibold rounded-lg transition-all hover:scale-105"
            style={{
              backgroundColor: "#2d5a3d",
              color: "#ffffff",
              fontFamily: "var(--font-playfair), serif",
            }}
          >
            En savoir plus
          </Button>
        </div>
      </div>
    </div>
  );
}

