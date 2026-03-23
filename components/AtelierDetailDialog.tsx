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
import { useEffect, useState, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { type ReservationFormData } from "@/lib/validations-reservation";
import { ReservationForm } from "@/components/ReservationForm";

type ViewMode = "calendar" | "form";

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

  // Calendar & reservation state
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [selectedSession, setSelectedSession] =
    useState<SessionAtelierWithAtelier | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const rightColumnRef = useRef<HTMLDivElement>(null);

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
      // Initialize calendar to the month of the first available session
      if (data.length > 0) {
        setCurrentMonth(new Date(data[0].date_debut));
      }
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
      setShowCalendar(false);
      setViewMode("calendar");
      setSelectedSession(null);
      setSelectedDate(null);
      setCurrentMonth(new Date());
      setCheckoutError(null);
    }
    onOpenChange(newOpen);
  };

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getSessionsForDate = (date: Date) => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date_debut);
      return (
        sessionDate.getDate() === date.getDate() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const hasAvailableSessions = (date: Date) => {
    const sessionsForDate = getSessionsForDate(date);
    return sessionsForDate.some((session) => session.places_disponibles > 0);
  };

  const isDateComplete = (date: Date) => {
    const sessionsForDate = getSessionsForDate(date);
    return (
      sessionsForDate.length > 0 &&
      sessionsForDate.every((session) => session.places_disponibles === 0)
    );
  };

  const isSameDay = (a: Date, b: Date) => {
    return (
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    );
  };

  const hasSessions = (date: Date) => {
    return getSessionsForDate(date).length > 0;
  };

  const isSelectedDate = (date: Date) => {
    return selectedDate !== null && isSameDay(date, selectedDate);
  };

  const handleDateClick = (date: Date) => {
    if (!hasSessions(date)) return;
    setSelectedDate(date);
    setViewMode("calendar");
    setSelectedSession(null);
    setCheckoutError(null);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Filter sessions by selected date, or show all
  const filteredSessions = selectedDate
    ? sessions.filter((s) => isSameDay(new Date(s.date_debut), selectedDate))
    : sessions;

  // Group sessions by date
  const groupedSessions = filteredSessions.reduce(
    (acc, session) => {
      const dateKey = new Date(session.date_debut).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      });
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(session);
      return acc;
    },
    {} as Record<string, SessionAtelierWithAtelier[]>
  );

  const handleReserveSession = (session: SessionAtelierWithAtelier) => {
    setSelectedSession(session);
    setViewMode("form");
    setCheckoutError(null);
    rightColumnRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (data: ReservationFormData) => {
    setSubmitting(true);
    setCheckoutError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la création de la réservation"
        );
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      console.error("Error creating checkout:", err);
      setCheckoutError(
        err instanceof Error ? err.message : "Une erreur est survenue"
      );
      setSubmitting(false);
    }
  };

  const renderCalendarWidget = () => (
    <div className="bg-white rounded-lg p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth("prev")}
          className="p-2 hover:bg-green-50 rounded-full transition-colors"
          style={{ color: "#2d5a3d" }}
        >
          <ChevronLeft size={20} />
        </button>
        <h4
          className="text-base font-semibold capitalize"
          style={{ color: "#2d5a3d" }}
        >
          {currentMonth.toLocaleDateString("fr-FR", {
            month: "long",
            year: "numeric",
          })}
        </h4>
        <button
          onClick={() => navigateMonth("next")}
          className="p-2 hover:bg-green-50 rounded-full transition-colors"
          style={{ color: "#2d5a3d" }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-600"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {(() => {
          const { daysInMonth, startingDayOfWeek, year, month } =
            getDaysInMonth(currentMonth);
          const days = [];

          for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="aspect-square" />);
          }

          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const available = hasAvailableSessions(date);
            const complete = isDateComplete(date);
            const today = isToday(date);
            const hasSession = available || complete;
            const selected = isSelectedDate(date);

            days.push(
              <button
                key={day}
                type="button"
                disabled={!hasSession}
                onClick={() => handleDateClick(date)}
                className={`aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-all ${hasSession ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
                style={{
                  backgroundColor: selected
                    ? "#2d5a3d"
                    : today
                      ? "#2d5a3d"
                      : available
                        ? "rgba(61, 122, 82, 0.2)"
                        : complete
                          ? "#e5e7eb"
                          : "transparent",
                  color: selected || today ? "#ffffff" : "#1f2937",
                  border:
                    selected && !today
                      ? "2px solid #2d5a3d"
                      : "2px solid transparent",
                }}
              >
                {day}
              </button>
            );
          }

          return days;
        })()}
      </div>

      {/* Legend */}
      <div
        className="flex items-center justify-center gap-6 mt-4 pt-3"
        style={{ borderTop: "1px solid #e5e7eb" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "rgba(61, 122, 82, 0.3)" }}
          ></div>
          <span className="text-xs font-medium" style={{ color: "#374151" }}>
            Disponible
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#d1d5db" }}
          ></div>
          <span className="text-xs font-medium" style={{ color: "#374151" }}>
            Complet
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent
        className={`max-h-[80vh] overflow-y-auto ${showCalendar ? "max-w-5xl" : images.length > 0 ? "max-w-6xl" : "max-w-2xl"}`}
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
                style={{ border: "2px solid #2d5a3d" }}
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

                {/* Réserver button */}
                {!showCalendar && !loadingSessions && sessions.length > 0 && (
                  <Button
                    onClick={() => setShowCalendar(true)}
                    className="px-6 py-2 text-sm font-semibold rounded-full transition-all hover:scale-105 whitespace-nowrap"
                    style={{
                      backgroundColor: "#2d5a3d",
                      color: "#ffffff",
                      fontFamily: "var(--font-playfair), serif",
                    }}
                  >
                    Réserver cet atelier
                  </Button>
                )}
                {showCalendar && (
                  <Button
                    onClick={() => {
                      setShowCalendar(false);
                      setViewMode("calendar");
                      setSelectedSession(null);
                      setSelectedDate(null);
                      setCheckoutError(null);
                    }}
                    className="px-6 py-2 text-sm font-semibold rounded-full transition-all hover:scale-105 whitespace-nowrap"
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#2d5a3d",
                      border: "2px solid #2d5a3d",
                    }}
                  >
                    Retour aux détails
                  </Button>
                )}
              </div>
            </DialogHeader>

            {showCalendar ? (
              /* ===== CALENDAR VIEW ===== */
              <div className="flex flex-col lg:flex-row gap-6 pt-2">
                {/* Calendar - Left */}
                <div className="lg:w-1/2">
                  {renderCalendarWidget()}
                </div>

                {/* Sessions / Form - Right */}
                <div
                  ref={rightColumnRef}
                  className="lg:w-1/2 space-y-4 max-h-[60vh] overflow-y-auto"
                >
                  {viewMode === "calendar" ? (
                    <div className="space-y-3">
                      {!selectedDate && (
                        <p
                          className="text-sm text-center py-4"
                          style={{ color: "#6b7280" }}
                        >
                          Sélectionnez une date dans le calendrier
                        </p>
                      )}
                      {Object.entries(groupedSessions).map(
                        ([dateKey, sessionsForDate]) => (
                          <div key={dateKey}>
                            <h4
                              className="text-sm font-bold mb-2 capitalize"
                              style={{ color: "#1f2937" }}
                            >
                              {dateKey}
                            </h4>
                            {sessionsForDate.map((session) => {
                              const dateDebut = new Date(session.date_debut);
                              const dateFin = new Date(session.date_fin);
                              const timeStr = `${dateDebut.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} → ${dateFin.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;

                              return (
                                <div
                                  key={session.id}
                                  className="bg-white rounded-lg p-3 mb-2 flex items-center justify-between"
                                  style={{
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                  }}
                                >
                                  <div>
                                    <p
                                      className="text-sm font-semibold"
                                      style={{ color: "#1f2937" }}
                                    >
                                      {timeStr}
                                    </p>
                                    {session.places_disponibles > 0 ? (
                                      <p className="text-xs text-gray-600">
                                        {session.places_disponibles} place
                                        {session.places_disponibles > 1
                                          ? "s"
                                          : ""}{" "}
                                        disponible
                                        {session.places_disponibles > 1
                                          ? "s"
                                          : ""}
                                      </p>
                                    ) : (
                                      <p className="text-xs font-semibold" style={{ color: "#c8102e" }}>
                                        Complet
                                      </p>
                                    )}
                                  </div>
                                  {session.places_disponibles > 0 ? (
                                    <Button
                                      onClick={() =>
                                        handleReserveSession(session)
                                      }
                                      className="px-4 py-1.5 text-sm font-semibold rounded-full transition-all hover:scale-105"
                                      style={{
                                        backgroundColor: "#2d5a3d",
                                        color: "#ffffff",
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                          "#3d7a52";
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                          "#2d5a3d";
                                      }}
                                    >
                                      Réserver
                                    </Button>
                                  ) : (
                                    <span
                                      className="px-4 py-1.5 text-sm font-semibold rounded-full"
                                      style={{
                                        backgroundColor: "#e5e7eb",
                                        color: "#6b7280",
                                      }}
                                    >
                                      Complet
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )
                      )}
                    </div>
                  ) : selectedSession ? (
                    <ReservationForm
                      selectedSession={selectedSession}
                      onSubmit={onSubmit}
                      onCancel={() => {
                        setViewMode("calendar");
                        setSelectedSession(null);
                        setCheckoutError(null);
                      }}
                      submitting={submitting}
                      error={checkoutError}
                    />
                  ) : null}
                </div>
              </div>
            ) : (
              /* ===== DETAIL VIEW ===== */
              <div
                className={`flex flex-col ${images.length > 0 ? "md:flex-row" : ""} gap-4 pt-2`}
              >
                {/* Image Carousel */}
                {images.length > 0 && (
                  <div className="w-full md:w-1/2 flex-shrink-0">
                    <div className="relative">
                      <div
                        className="overflow-hidden rounded-lg"
                        ref={emblaRef}
                      >
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

                      {images.length > 1 && (
                        <>
                          <button
                            onClick={scrollPrev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white shadow-lg transition-all z-10"
                            aria-label="Image précédente"
                          >
                            <ChevronLeft
                              size={20}
                              style={{ color: "#2d5a3d" }}
                            />
                          </button>
                          <button
                            onClick={scrollNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white shadow-lg transition-all z-10"
                            aria-label="Image suivante"
                          >
                            <ChevronRight
                              size={20}
                              style={{ color: "#2d5a3d" }}
                            />
                          </button>
                        </>
                      )}

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

                {/* Text Content */}
                <div
                  className={`flex-1 space-y-4 ${images.length > 0 ? "md:overflow-y-auto md:max-h-[calc(80vh-120px)]" : ""}`}
                >
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
                          <p className="text-sm font-semibold" style={{ color: "#1f2937", fontFamily: "Arial, sans-serif" }}>{atelier.materiel_fourni ? "Fourni" : "À apporter"}</p>
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

                  <div
                    className="w-20 h-0.5 mx-auto"
                    style={{ background: "#2d5a3d" }}
                  ></div>

                  {/* Prix */}
                  <div className="text-center py-2">
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#2d5a3d", fontFamily: "Arial, sans-serif", fontWeight: 600 }}>Tarif</p>
                    <p className="text-3xl font-bold" style={{ color: "#2d5a3d", fontFamily: "Arial, sans-serif" }}>
                      {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(atelier.prix))}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#1f2937", fontFamily: "Arial, sans-serif" }}>par participant</p>
                  </div>

                  {/* No Sessions Message */}
                  {!loadingSessions && sessions.length === 0 && (
                    <>
                      <div className="w-20 h-0.5 mx-auto" style={{ background: "#2d5a3d" }}></div>
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
            )}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
