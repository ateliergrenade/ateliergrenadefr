"use client";

import { Atelier } from "@/types/atelier.types";
import { SessionAtelierWithAtelier } from "@/types/reservation.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Clock,
  Users,
  BarChart3,
  Cake,
  Palette,
  Package,
  UserPlus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { CalendarReservationDialog } from "./CalendarReservationDialog";

interface AtelierDetailDialogProps {
  atelier: Atelier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AtelierImageWithUrl {
  id: string;
  atelier_id: string;
  storage_path: string;
  is_cover: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  url: string;
}

export function AtelierDetailDialog({
  atelier,
  open,
  onOpenChange,
}: AtelierDetailDialogProps) {
  const [sessions, setSessions] = useState<SessionAtelierWithAtelier[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [images, setImages] = useState<AtelierImageWithUrl[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);

  // Carousel setup with autoplay
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center" },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Fetch sessions and images when atelier changes
  useEffect(() => {
    if (atelier && open) {
      fetchSessions();
      fetchImages();
    }
  }, [atelier, open]);

  const fetchSessions = async () => {
    if (!atelier) return;

    setLoadingSessions(true);

    try {
      const response = await fetch(`/api/sessions/${atelier.id}`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des sessions");
      }
      const data = await response.json();
      setSessions(data);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchImages = async () => {
    if (!atelier) return;

    setLoadingImages(true);

    try {
      const response = await fetch(`/api/ateliers/${atelier.id}/images`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des images");
      }
      const data = await response.json();
      setImages(data);
    } catch (err) {
      console.error("Error fetching images:", err);
      setImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleDialogChange = (newOpen: boolean) => {
    if (!newOpen) {
      setImages([]);
      setSelectedIndex(0);
    }
    onOpenChange(newOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent
          className={`max-h-[80vh] overflow-y-auto ${images.length > 0 ? 'max-w-6xl' : 'max-w-2xl'}`}
          style={{ 
            backgroundColor: "#f8f5f2",
            border: "3px solid #3a3a3a",
            filter: "url(#pencil-1)",
          }}
        >
        {atelier ? (
          <>
            <DialogHeader className="relative">
              <button
                onClick={() => handleDialogChange(false)}
                className="absolute right-0 top-0 w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-gray-50 transition-all z-10"
                style={{
                  border: "2px solid #2d5a3d",
                }}
                aria-label="Fermer"
              >
                <X size={20} style={{ color: "#2d5a3d" }} />
              </button>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pr-14">
                <DialogTitle
                  className="text-2xl md:text-3xl font-bold"
                  style={{
                    color: "#2d5a3d",
                    fontFamily: "var(--font-playfair), serif",
                    fontWeight: 700,
                  }}
                >
                  {atelier.titre}
                </DialogTitle>
                
                {/* Reservation Button in Header */}
                {loadingSessions ? (
                  <div className="flex items-center gap-2">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                    <span className="text-sm" style={{ color: "#1f2937" }}>Chargement...</span>
                  </div>
                ) : sessions.length > 0 ? (
                  <Button
                    onClick={() => setCalendarDialogOpen(true)}
                    className="px-6 py-2 text-sm font-semibold rounded-full transition-all hover:scale-105 whitespace-nowrap"
                    style={{
                      backgroundColor: "#2d5a3d",
                      color: "#ffffff",
                      fontFamily: "var(--font-playfair), serif",
                    }}
                  >
                    Réserver cet atelier
                  </Button>
                ) : null}
              </div>
            </DialogHeader>

            {/* Content - Flex layout with images and text */}
            <div className={`flex flex-col ${images.length > 0 ? 'md:flex-row' : ''} gap-4 pt-2`}>
              {/* Image Carousel - Left side (1/2 on desktop) */}
              {images.length > 0 && (
                <div className="w-full md:w-1/2 flex-shrink-0">
                  <div className="relative">
                    {/* Carousel Container */}
                    <div className="overflow-hidden rounded-lg" ref={emblaRef}>
                      <div className="flex">
                        {images.map((image) => (
                          <div
                            key={image.id}
                            className="flex-[0_0_100%] min-w-0"
                          >
                            <div className="relative aspect-[4/3] bg-gray-200">
                              <img
                                src={image.url}
                                alt={atelier.titre}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={scrollPrev}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white shadow-lg transition-all z-10"
                          aria-label="Image précédente"
                        >
                          <ChevronLeft size={20} style={{ color: "#2d5a3d" }} />
                        </button>
                        <button
                          onClick={scrollNext}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white shadow-lg transition-all z-10"
                          aria-label="Image suivante"
                        >
                          <ChevronRight size={20} style={{ color: "#2d5a3d" }} />
                        </button>
                      </>
                    )}

                    {/* Dot Indicators */}
                    {images.length > 1 && (
                      <div className="flex justify-center gap-2 mt-3">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => scrollTo(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === selectedIndex
                                ? "bg-[#2d5a3d] w-6"
                                : "bg-[#2d5a3d]/30"
                            }`}
                            aria-label={`Aller à l'image ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Text Content - Right side (1/2 on desktop) */}
              <div className={`flex-1 space-y-4 ${images.length > 0 ? 'md:overflow-y-auto md:max-h-[calc(80vh-120px)]' : ''}`}>
              {/* Description longue */}
              <div>
                <DialogDescription asChild>
                  <p
                    className="text-base leading-relaxed whitespace-pre-line"
                    style={{
                      color: "#1f2937",
                      fontFamily: "Arial, sans-serif",
                      lineHeight: "1.6",
                      fontSize: "0.95rem",
                    }}
                  >
                    {atelier.description_longue}
                  </p>
                </DialogDescription>
              </div>

              {/* Decorative line */}
              <div
                className="w-20 h-0.5 mx-auto"
                style={{ background: "#2d5a3d" }}
              ></div>

              {/* Infos pratiques */}
              <div className="space-y-3">
                <h3
                  className="text-xl font-bold text-center mb-3"
                  style={{
                    color: "#2d5a3d",
                    fontFamily: "var(--font-playfair), serif",
                  }}
                >
                  Infos pratiques
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: "#ffffff" }}>
                    <Clock size={22} strokeWidth={2} style={{ color: "#dc2626", flexShrink: 0 }} />
                    <div>
                      <p className="text-xs font-medium" style={{ color: "#1f2937", fontFamily: "Arial, sans-serif" }}>Durée</p>
                      <p className="text-sm font-semibold" style={{ color: "#1f2937", fontFamily: "Arial, sans-serif" }}>{atelier.duree}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: "#ffffff" }}>
                    <Users size={22} strokeWidth={2} style={{ color: "#dc2626", flexShrink: 0 }} />
                    <div>
                      <p className="text-xs font-medium" style={{ color: "#1f2937", fontFamily: "Arial, sans-serif" }}>Participants max</p>
                      <p className="text-sm font-semibold" style={{ color: "#1f2937", fontFamily: "Arial, sans-serif" }}>{atelier.participants_max}</p>
                    </div>
                  </div>
                  {atelier.niveau_requis && (
                    <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: "#ffffff" }}>
                      <BarChart3 size={22} strokeWidth={2} style={{ color: "#dc2626", flexShrink: 0 }} />
                      <div>
                        <p className="text-xs font-medium" style={{ color: "#1f2937", fontFamily: "Arial, sans-serif" }}>Niveau</p>
                        <p className="text-sm font-semibold" style={{ color: "#1f2937", fontFamily: "Arial, sans-serif" }}>{atelier.niveau_requis}</p>
                      </div>
                    </div>
                  )}
                  {atelier.age_minimum && (
                    <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: "#ffffff" }}>
                      <Cake size={22} strokeWidth={2} style={{ color: "#dc2626", flexShrink: 0 }} />
                      <div>
                        <p className="text-xs font-medium" style={{ color: "#1f2937", fontFamily: "Arial, sans-serif" }}>Âge minimum</p>
                        <p className="text-sm font-semibold" style={{ color: "#1f2937", fontFamily: "Arial, sans-serif" }}>{atelier.age_minimum} ans</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: "#ffffff" }}>
                    {atelier.materiel_fourni ? (
                      <Palette size={22} strokeWidth={2} style={{ color: "#dc2626", flexShrink: 0 }} />
                    ) : (
                      <Package size={22} strokeWidth={2} style={{ color: "#dc2626", flexShrink: 0 }} />
                    )}
                    <div>
                      <p className="text-xs font-medium" style={{ color: "#1f2937", fontFamily: "Arial, sans-serif" }}>Matériel</p>
                      <p className="text-sm font-semibold" style={{ color: "#1f2937", fontFamily: "Arial, sans-serif" }}>
                        {atelier.materiel_fourni ? 'Fourni' : 'À apporter'}
                      </p>
                    </div>
                  </div>
                  {atelier.parent_requis && (
                    <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: "#ffffff" }}>
                      <UserPlus size={22} strokeWidth={2} style={{ color: "#dc2626", flexShrink: 0 }} />
                      <div>
                        <p className="text-xs font-medium" style={{ color: "#1f2937", fontFamily: "Arial, sans-serif" }}>Accompagnement</p>
                        <p className="text-sm font-semibold" style={{ color: "#1f2937", fontFamily: "Arial, sans-serif" }}>Parent requis</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Decorative line */}
              <div
                className="w-20 h-0.5 mx-auto"
                style={{ background: "#2d5a3d" }}
              ></div>

              {/* Prix */}
              <div className="text-center py-2">
                <p
                  className="text-xs uppercase tracking-wider mb-1"
                  style={{
                    color: "#2d5a3d",
                    fontFamily: "Arial, sans-serif",
                    fontWeight: 600,
                  }}
                >
                  Tarif
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{
                    color: "#2d5a3d",
                    fontFamily: "Arial, sans-serif",
                  }}
                >
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(Number(atelier.prix))}
                </p>
                <p className="text-xs mt-1" style={{ color: "#1f2937", fontFamily: "Arial, sans-serif" }}>par participant</p>
              </div>

              {/* No Sessions Message - Only shown when no sessions available */}
              {!loadingSessions && sessions.length === 0 && (
                <>
                  {/* Decorative line */}
                  <div
                    className="w-20 h-0.5 mx-auto"
                    style={{ background: "#2d5a3d" }}
                  ></div>
                  
                  <div className="text-center py-4">
                    <Calendar size={36} style={{ color: "#c8102e" }} className="mx-auto mb-2" />
                    <p className="text-base" style={{ color: "#1f2937", fontFamily: "Arial, sans-serif" }}>
                      Aucune session disponible pour le moment.
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#6b7280", fontFamily: "Arial, sans-serif" }}>
                      Revenez bientôt pour découvrir les prochaines dates !
                    </p>
                  </div>
                </>
              )}
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>

    <CalendarReservationDialog
      atelier={atelier}
      open={calendarDialogOpen}
      onOpenChange={setCalendarDialogOpen}
    />
    </>
  );
}

