"use client";

import { Atelier } from "@/types/atelier.types";
import { SessionAtelierWithAtelier } from "@/types/reservation.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { type ReservationFormData } from "@/lib/validations-reservation";
import { ReservationForm } from "@/components/ReservationForm";

type ViewMode = 'calendar' | 'form';

interface CalendarReservationDialogProps {
  atelier: Atelier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CalendarReservationDialog({
  atelier,
  open,
  onOpenChange,
}: CalendarReservationDialogProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedSession, setSelectedSession] = useState<SessionAtelierWithAtelier | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [sessions, setSessions] = useState<SessionAtelierWithAtelier[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch sessions when dialog opens
  useEffect(() => {
    if (atelier && open) {
      fetchSessions();
    }
  }, [atelier, open]);

  const fetchSessions = async () => {
    if (!atelier) return;

    setLoadingSessions(true);
    setError(null);

    try {
      const response = await fetch(`/api/sessions/${atelier.id}`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des sessions");
      }
      const data = await response.json();
      setSessions(data);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError("Impossible de charger les sessions disponibles");
    } finally {
      setLoadingSessions(false);
    }
  };

  const onSubmit = async (data: ReservationFormData) => {
    setSubmitting(true);
    setError(null);

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
        throw new Error(errorData.error || "Erreur lors de la création de la réservation");
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error("Error creating checkout:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setSubmitting(false);
    }
  };

  const handleDialogChange = (newOpen: boolean) => {
    if (!newOpen) {
      setError(null);
      setViewMode('calendar');
      setSelectedSession(null);
      setCurrentMonth(new Date());
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
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Convert to Monday = 0
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getSessionsForDate = (date: Date) => {
    return sessions.filter(session => {
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
    return sessionsForDate.some(session => session.places_disponibles > 0);
  };

  const isDateComplete = (date: Date) => {
    const sessionsForDate = getSessionsForDate(date);
    return sessionsForDate.length > 0 && sessionsForDate.every(session => session.places_disponibles === 0);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Group sessions by date
  const groupedSessions = sessions.reduce((acc, session) => {
    const dateKey = new Date(session.date_debut).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(session);
    return acc;
  }, {} as Record<string, SessionAtelierWithAtelier[]>);

  const handleReserveSession = (session: SessionAtelierWithAtelier) => {
    setSelectedSession(session);
    setViewMode('form');
  };

  if (!atelier) return null;

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent
        className="max-w-6xl max-h-[80vh] overflow-y-auto"
        style={{ 
          backgroundColor: "#f8f5f2",
          border: "3px solid #3a3a3a",
          filter: "url(#pencil-1)",
        }}
      >
        <DialogHeader className="relative">
          <DialogTitle
            className="text-2xl md:text-3xl font-bold mb-2 pr-8"
            style={{
              color: "#2d5a3d",
              fontFamily: "var(--font-playfair), serif",
              fontWeight: 700,
            }}
          >
            {atelier.titre}
          </DialogTitle>
          <button
            onClick={() => handleDialogChange(false)}
            className="absolute right-0 top-0 w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-gray-50 transition-all"
            style={{
              border: "2px solid #2d5a3d",
            }}
            aria-label="Fermer"
          >
            <X size={20} style={{ color: "#2d5a3d" }} />
          </button>
        </DialogHeader>

        {loadingSessions ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm" style={{ color: "#1f2937" }}>Chargement des sessions...</p>
          </div>
        ) : viewMode === 'calendar' ? (
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Calendar - Left Side */}
              <div className="lg:w-1/2 bg-white rounded-lg p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-green-50 rounded-full transition-colors"
                    style={{ color: "#2d5a3d" }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <h4 className="text-base font-semibold capitalize" style={{ color: "#2d5a3d" }}>
                    {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </h4>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-green-50 rounded-full transition-colors"
                    style={{ color: "#2d5a3d" }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Days of Week */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-600">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {(() => {
                    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
                    const days = [];
                    
                    // Empty cells before first day
                    for (let i = 0; i < startingDayOfWeek; i++) {
                      days.push(<div key={`empty-${i}`} className="aspect-square" />);
                    }
                    
                    // Days of the month
                    for (let day = 1; day <= daysInMonth; day++) {
                      const date = new Date(year, month, day);
                      const available = hasAvailableSessions(date);
                      const complete = isDateComplete(date);
                      const today = isToday(date);
                      
                      days.push(
                        <div
                          key={day}
                          className="aspect-square flex items-center justify-center rounded-full text-sm font-medium"
                          style={{
                            backgroundColor: today 
                              ? '#2d5a3d' 
                              : available 
                              ? 'rgba(61, 122, 82, 0.2)' 
                              : complete 
                              ? '#e5e7eb' 
                              : 'transparent',
                            color: today ? '#ffffff' : '#1f2937',
                          }}
                        >
                          {day}
                        </div>
                      );
                    }
                    
                    return days;
                  })()}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(61, 122, 82, 0.2)' }}></div>
                    <span className="text-xs">Disponible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#e5e7eb' }}></div>
                    <span className="text-xs">Complet</span>
                  </div>
                </div>
              </div>

              {/* Sessions List - Right Side */}
              <div className="lg:w-1/2 space-y-4 max-h-[500px] overflow-y-auto">
                {Object.entries(groupedSessions).map(([dateKey, sessionsForDate]) => (
                  <div key={dateKey}>
                    <h4 
                      className="text-lg font-bold mb-2 capitalize"
                      style={{ color: "#1f2937" }}
                    >
                      {dateKey}
                    </h4>
                    {sessionsForDate.map((session) => {
                      const dateDebut = new Date(session.date_debut);
                      const dateFin = new Date(session.date_fin);
                      const timeStr = `${dateDebut.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })} → ${dateFin.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`;
                      
                      return (
                        <div
                          key={session.id}
                          className="bg-white rounded-lg p-4 mb-3 flex items-center justify-between"
                          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                        >
                          <div>
                            <p className="text-base font-semibold" style={{ color: "#1f2937" }}>
                              {timeStr}
                            </p>
                            <p className="text-sm text-gray-600">
                              {session.places_disponibles} places disponibles
                            </p>
                          </div>
                          <Button
                            onClick={() => handleReserveSession(session)}
                            disabled={session.places_disponibles === 0}
                            className="px-6 py-2 text-sm font-semibold rounded-full transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              backgroundColor: session.places_disponibles > 0 ? "#2d5a3d" : "#9ca3af",
                              color: "#ffffff",
                            }}
                            onMouseEnter={(e) => {
                              if (session.places_disponibles > 0) {
                                e.currentTarget.style.backgroundColor = "#3d7a52";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (session.places_disponibles > 0) {
                                e.currentTarget.style.backgroundColor = "#2d5a3d";
                              }
                            }}
                          >
                            Réserver
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : selectedSession ? (
          <ReservationForm
            selectedSession={selectedSession}
            onSubmit={onSubmit}
            onCancel={() => setViewMode('calendar')}
            submitting={submitting}
            error={error}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

