"use client";

import { useState } from "react";
import { Atelier } from "@/types/atelier.types";
import { AtelierCarousel } from "./AtelierCarousel";
import { AtelierDetailDialog } from "./AtelierDetailDialog";

interface AteliersListProps {
  ateliers: Atelier[];
}

export function AteliersList({ ateliers }: AteliersListProps) {
  const [selectedAtelier, setSelectedAtelier] = useState<Atelier | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDetailsClick = (atelier: Atelier) => {
    setSelectedAtelier(atelier);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      // Delay clearing the selected atelier to allow dialog animation to complete
      setTimeout(() => setSelectedAtelier(null), 200);
    }
  };

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
    <>
      <AtelierCarousel
        ateliers={ateliers}
        onDetailsClick={handleDetailsClick}
      />

      <AtelierDetailDialog
        atelier={selectedAtelier}
        open={dialogOpen}
        onOpenChange={handleDialogClose}
      />
    </>
  );
}

