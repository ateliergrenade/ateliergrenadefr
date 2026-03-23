"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReservationData {
  reservation: {
    id: string;
    statut: string;
    montant_paye: number | null;
    nombre_personnes: number;
    created_at: string | null;
  };
  session: {
    id: string;
    date_debut: string;
    date_fin: string;
    places_disponibles: number;
  } | null;
  atelier: {
    id: string;
    titre: string;
    prix: number;
    duree: number | null;
    description: string | null;
  } | null;
  client: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
  } | null;
}

function ReservationSuccessContent() {
  const searchParams = useSearchParams();
  const checkoutSessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReservationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollingCount, setPollingCount] = useState(0);
  const pollingCountRef = useRef(0);
  const maxPollingAttempts = 10; // Poll for up to 10 attempts (5 seconds)

  const fetchReservation = useCallback(async () => {
    if (!checkoutSessionId) {
      setError("Session ID manquant");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/reservations/${checkoutSessionId}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          // Reservation not found yet, might be pending webhook
          if (pollingCountRef.current < maxPollingAttempts) {
            // Poll again after 500ms
            pollingCountRef.current += 1;
            setPollingCount(pollingCountRef.current);
            setTimeout(() => {
              fetchReservation();
            }, 500);
            return;
          } else {
            setError(
              "Réservation non trouvée. Le traitement du paiement peut prendre quelques instants."
            );
            setLoading(false);
            return;
          }
        }
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la récupération");
      }

      const reservationData = await response.json();
      setData(reservationData);

      // If reservation is not confirmed yet, poll again
      if (reservationData.reservation.statut !== "confirmee") {
        if (pollingCountRef.current < maxPollingAttempts) {
          pollingCountRef.current += 1;
          setPollingCount(pollingCountRef.current);
          setTimeout(() => {
            fetchReservation();
          }, 500);
          return;
        } else {
          setError(
            "Le paiement est en cours de traitement. Vous recevrez un email de confirmation une fois le paiement confirmé."
          );
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching reservation:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de la récupération de votre réservation"
      );
      setLoading(false);
    }
  }, [checkoutSessionId]);

  useEffect(() => {
    if (checkoutSessionId) {
      pollingCountRef.current = 0;
      setPollingCount(0);
      fetchReservation();
    }
  }, [checkoutSessionId, fetchReservation]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#f8f5f2" }}
      >
        <div className="text-center">
          <Loader2 className="inline-block animate-spin h-12 w-12 mb-4" style={{ color: "#2d5a3d" }} />
          <p className="mt-4 text-lg" style={{ color: "#2d5a3d" }}>
            Vérification de votre réservation...
          </p>
          {pollingCount > 0 && (
            <p className="mt-2 text-sm" style={{ color: "#6b7280" }}>
              Traitement en cours...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "#f8f5f2" }}
      >
        <div className="max-w-2xl w-full">
          <div
            className="rounded-lg p-8 md:p-12 shadow-lg text-center"
            style={{
              backgroundColor: "#ffffff",
              border: "3px solid #ef4444",
            }}
          >
            <div className="flex justify-center mb-6">
              <AlertCircle size={80} style={{ color: "#ef4444" }} />
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{
                color: "#ef4444",
                fontFamily: "var(--font-playfair), serif",
              }}
            >
              Problème de confirmation
            </h1>
            <p
              className="text-lg mb-8 leading-relaxed"
              style={{
                color: "#1f2937",
                fontFamily: "var(--font-crimson), serif",
              }}
            >
              {error}
            </p>
            <Link href="/">
              <Button
                className="px-8 py-6 text-lg font-semibold rounded-lg transition-all hover:scale-105"
                style={{
                  backgroundColor: "#2d5a3d",
                  color: "#ffffff",
                  fontFamily: "var(--font-playfair), serif",
                }}
              >
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.reservation.statut !== "confirmee") {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "#f8f5f2" }}
      >
        <div className="max-w-2xl w-full">
          <div
            className="rounded-lg p-8 md:p-12 shadow-lg text-center"
            style={{
              backgroundColor: "#ffffff",
              border: "3px solid #f59e0b",
            }}
          >
            <div className="flex justify-center mb-6">
              <Loader2 className="animate-spin h-16 w-16" style={{ color: "#f59e0b" }} />
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{
                color: "#f59e0b",
                fontFamily: "var(--font-playfair), serif",
              }}
            >
              Paiement en cours de traitement
            </h1>
            <p
              className="text-lg mb-8 leading-relaxed"
              style={{
                color: "#1f2937",
                fontFamily: "var(--font-crimson), serif",
              }}
            >
              Votre paiement est en cours de traitement. Vous recevrez un email
              de confirmation une fois le paiement confirmé.
            </p>
            <Link href="/">
              <Button
                className="px-8 py-6 text-lg font-semibold rounded-lg transition-all hover:scale-105"
                style={{
                  backgroundColor: "#2d5a3d",
                  color: "#ffffff",
                  fontFamily: "var(--font-playfair), serif",
                }}
              >
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h${mins > 0 ? mins : ""}`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}min`;
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: "#f8f5f2" }}
    >
      <div className="max-w-2xl w-full">
        <div
          className="rounded-lg p-8 md:p-12 shadow-lg"
          style={{
            backgroundColor: "#ffffff",
            border: "3px solid #2d5a3d",
          }}
        >
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <CheckCircle2
              size={80}
              style={{ color: "#2d5a3d" }}
              strokeWidth={2}
            />
          </div>

          {/* Title */}
          <h1
            className="text-4xl md:text-5xl font-bold mb-4 text-center"
            style={{
              color: "#2d5a3d",
              fontFamily: "var(--font-playfair), serif",
            }}
          >
            Réservation Confirmée !
          </h1>

          {/* Message */}
          <p
            className="text-lg md:text-xl mb-8 leading-relaxed text-center"
            style={{
              color: "#1f2937",
              fontFamily: "var(--font-crimson), serif",
            }}
          >
            Merci {data.client?.prenom ? `${data.client.prenom}` : ""} pour
            votre réservation ! Vous allez recevoir un email de confirmation
            avec tous les détails de votre atelier.
          </p>

          {/* Decorative line */}
          <div
            className="w-24 h-1 mx-auto mb-8"
            style={{ background: "#2d5a3d" }}
          ></div>

          {/* Reservation Details */}
          {data.atelier && (
            <div
              className="rounded-lg p-6 mb-6"
              style={{ backgroundColor: "#f8f5f2" }}
            >
              <h2
                className="text-2xl font-semibold mb-4"
                style={{
                  color: "#2d5a3d",
                  fontFamily: "var(--font-playfair), serif",
                }}
              >
                Détails de votre réservation
              </h2>

              <div className="space-y-3" style={{ color: "#1f2937" }}>
                {data.atelier.titre && (
                  <div>
                    <span className="font-semibold">Atelier :</span>{" "}
                    {data.atelier.titre}
                  </div>
                )}

                {data.session && (
                  <>
                    <div>
                      <span className="font-semibold">Date et heure :</span>{" "}
                      {formatDate(data.session.date_debut)}
                    </div>
                    {data.atelier.duree && (
                      <div>
                        <span className="font-semibold">Durée :</span>{" "}
                        {formatDuration(data.atelier.duree)}
                      </div>
                    )}
                  </>
                )}

                {data.reservation.nombre_personnes > 1 && (
                  <div>
                    <span className="font-semibold">Participants :</span>{" "}
                    {data.reservation.nombre_personnes} personnes
                  </div>
                )}

                {data.reservation.montant_paye && (
                  <div>
                    <span className="font-semibold">Montant payé :</span>{" "}
                    {data.reservation.montant_paye.toFixed(2)} €
                  </div>
                )}

                {data.client && (
                  <div className="pt-2 border-t" style={{ borderColor: "#d1d5db" }}>
                    <div className="font-semibold mb-1">Participants :</div>
                    <div>
                      {data.client.prenom} {data.client.nom}
                    </div>
                    <div className="text-sm" style={{ color: "#6b7280" }}>
                      {data.client.email}
                    </div>
                    {data.client.telephone && (
                      <div className="text-sm" style={{ color: "#6b7280" }}>
                        {data.client.telephone}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div
            className="rounded-lg p-6 mb-8"
            style={{ backgroundColor: "#f8f5f2" }}
          >
            <h2
              className="text-xl font-semibold mb-3"
              style={{
                color: "#2d5a3d",
                fontFamily: "var(--font-playfair), serif",
              }}
            >
              Prochaines étapes
            </h2>
            <ul className="space-y-2" style={{ color: "#1f2937" }}>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>
                  Consultez votre email pour voir tous les détails de votre
                  réservation
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>
                  Notez la date et l'heure de votre atelier dans votre agenda
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>
                  En cas de question, n'hésitez pas à nous contacter
                </span>
              </li>
            </ul>
          </div>

          {/* Reservation ID for reference */}
          {checkoutSessionId && (
            <p className="text-sm mb-6 text-center" style={{ color: "#6b7280" }}>
              Numéro de réservation : {data.reservation.id.slice(0, 8).toUpperCase()}
            </p>
          )}

          {/* Back to Home Button */}
          <div className="text-center">
            <Link href="/">
              <Button
                className="px-8 py-6 text-lg font-semibold rounded-lg transition-all hover:scale-105"
                style={{
                  backgroundColor: "#2d5a3d",
                  color: "#ffffff",
                  fontFamily: "var(--font-playfair), serif",
                }}
              >
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReservationSuccessPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: "#f8f5f2" }}
        >
          <div className="text-center">
            <Loader2 className="inline-block animate-spin h-12 w-12 mb-4" style={{ color: "#2d5a3d" }} />
            <p className="mt-4 text-lg" style={{ color: "#2d5a3d" }}>
              Chargement...
            </p>
          </div>
        </div>
      }
    >
      <ReservationSuccessContent />
    </Suspense>
  );
}

