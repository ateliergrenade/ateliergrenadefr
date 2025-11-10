"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export function ParallaxBanner() {
  const bannerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const handleScroll = () => {
      // Annuler l'animation précédente si elle existe
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Utiliser requestAnimationFrame pour une animation fluide
      rafRef.current = requestAnimationFrame(() => {
        if (bannerRef.current) {
          const scrollY = window.scrollY;
          const parallaxSpeed = -1; // Valeur négative : la bannière monte (reste en arrière) pendant le scroll
          
          // Utiliser translate3d pour activer l'accélération GPU
          bannerRef.current.style.transform = `translate3d(0, ${scrollY * parallaxSpeed}px, 0)`;
        }
      });
    };

    // Ajouter l'écouteur de scroll avec passive pour de meilleures performances
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Nettoyer l'écouteur et l'animation
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[400px] overflow-hidden z-20">
      <div
        ref={bannerRef}
        className="absolute inset-0 w-full"
        style={{
          willChange: "transform",
        }}
      >
        <Image
          src="/banniere-atelier-grenade.png"
          alt="Bannière Atelier Grenade"
          width={1920}
          height={400}
          priority
          className="w-full h-auto object-cover"
          style={{
            minHeight: "500px", // Hauteur minimale pour éviter les espaces vides lors du scroll
          }}
        />
      </div>
    </div>
  );
}

