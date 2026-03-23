"use client";

import { useEffect, useState } from "react";

export function useAtelierCoverImage(atelierId: string): string | null {
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoverImage = async () => {
      try {
        const response = await fetch(`/api/ateliers/${atelierId}/images`);
        if (response.ok) {
          const images = await response.json();
          const coverImage = images.find((img: { is_cover: boolean }) => img.is_cover);
          if (coverImage) {
            setCoverImageUrl(coverImage.url);
          }
        }
      } catch (error) {
        console.error("Error fetching cover image:", error);
      }
    };

    fetchCoverImage();
  }, [atelierId]);

  return coverImageUrl;
}
