"use client";

import { SessionAtelierWithAtelier } from "@/types/reservation.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  reservationSchema,
  type ReservationFormData,
} from "@/lib/validations-reservation";
import { Calendar, Clock, AlertCircle, ArrowLeft, Minus, Plus, Users } from "lucide-react";

interface ReservationFormProps {
  selectedSession: SessionAtelierWithAtelier;
  onSubmit: (data: ReservationFormData) => Promise<void>;
  onCancel?: () => void;
  submitting: boolean;
  error: string | null;
}

export function ReservationForm({
  selectedSession,
  onSubmit,
  onCancel,
  submitting,
  error,
}: ReservationFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      sessionId: selectedSession.id,
      nombre_personnes: 1,
    },
  });

  const nombrePersonnes = watch("nombre_personnes");
  const prixUnitaire = selectedSession.atelier?.prix ?? 0;
  const prixTotal = prixUnitaire * nombrePersonnes;

  const dateDebut = new Date(selectedSession.date_debut);
  const dateFin = new Date(selectedSession.date_fin);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3
          className="text-2xl md:text-3xl font-bold mb-2"
          style={{
            color: "#2d5a3d",
            fontFamily: "var(--font-playfair), serif",
          }}
        >
          Confirmer votre réservation
        </h3>
        <p className="text-base text-gray-600">
          Complétez vos informations pour finaliser la réservation
        </p>
      </div>

      {/* Selected Session Info Card */}
      <div
        className="bg-white rounded-lg p-6 shadow-sm"
        style={{
          border: "2px solid #2d5a3d",
        }}
      >
        <p
          className="text-sm font-semibold mb-3 uppercase tracking-wide"
          style={{ color: "#2d5a3d" }}
        >
          Session sélectionnée
        </p>

        <div className="space-y-2">
          {/* Date */}
          <div className="flex items-start gap-3">
            <Calendar
              size={20}
              className="mt-0.5 flex-shrink-0"
              style={{ color: "#2d5a3d" }}
            />
            <div>
              <p className="text-lg font-semibold" style={{ color: "#1f2937" }}>
                {dateDebut.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-3">
            <Clock
              size={20}
              className="flex-shrink-0"
              style={{ color: "#2d5a3d" }}
            />
            <p className="text-base text-gray-700">
              {dateDebut.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {dateFin.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* Available places */}
          <div className="flex items-center gap-3 pt-2">
            <div
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: "rgba(45, 90, 61, 0.1)",
                color: "#2d5a3d",
              }}
            >
              {selectedSession.places_disponibles} place
              {selectedSession.places_disponibles > 1 ? "s" : ""} disponible
              {selectedSession.places_disponibles > 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Hidden fields */}
        <input type="hidden" {...register("sessionId")} />
        <input type="hidden" {...register("nombre_personnes", { valueAsNumber: true })} />

        {/* Nombre de personnes */}
        <div
          className="bg-white rounded-lg p-5 shadow-sm"
          style={{ border: "2px solid #e8e4df" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={20} style={{ color: "#2d5a3d" }} />
              <span className="text-base font-semibold" style={{ color: "#2d5a3d" }}>
                Nombre de participants
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={nombrePersonnes <= 1}
                onClick={() => setValue("nombre_personnes", nombrePersonnes - 1)}
                className="w-9 h-9 flex items-center justify-center rounded-full border-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  borderColor: "#2d5a3d",
                  color: "#2d5a3d",
                }}
              >
                <Minus size={16} />
              </button>
              <span
                className="text-xl font-bold w-8 text-center"
                style={{ color: "#1f2937" }}
              >
                {nombrePersonnes}
              </span>
              <button
                type="button"
                disabled={nombrePersonnes >= selectedSession.places_disponibles}
                onClick={() => setValue("nombre_personnes", nombrePersonnes + 1)}
                className="w-9 h-9 flex items-center justify-center rounded-full border-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  borderColor: "#2d5a3d",
                  color: "#2d5a3d",
                }}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Prix dynamique */}
          <div
            className="mt-3 pt-3 text-center"
            style={{ borderTop: "1px solid #e8e4df" }}
          >
            {nombrePersonnes > 1 ? (
              <p className="text-base" style={{ color: "#1f2937" }}>
                {nombrePersonnes} x{" "}
                {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(prixUnitaire)}
                {" = "}
                <span className="text-lg font-bold" style={{ color: "#2d5a3d" }}>
                  {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(prixTotal)}
                </span>
              </p>
            ) : (
              <p className="text-lg font-bold" style={{ color: "#2d5a3d" }}>
                {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(prixUnitaire)}
              </p>
            )}
          </div>
        </div>

        {/* Nom */}
        <div>
          <Label
            htmlFor="nom"
            className="text-base font-semibold mb-2 block"
            style={{ color: "#2d5a3d" }}
          >
            Nom <span style={{ color: "#c8102e" }}>*</span>
          </Label>
          <Input
            id="nom"
            {...register("nom")}
            placeholder="Votre nom"
            className="h-12 text-base px-4 border-2 transition-all duration-200 !bg-white !text-gray-900 placeholder:text-gray-400 focus:shadow-lg"
            style={{
              borderColor: errors.nom ? "#c8102e" : "#d1d5db",
              borderRadius: "0.5rem",
            }}
            onFocus={(e) => {
              if (!errors.nom) {
                e.target.style.borderColor = "#2d5a3d";
              }
            }}
            onBlur={(e) => {
              if (!errors.nom) {
                e.target.style.borderColor = "#d1d5db";
              }
            }}
          />
          {errors.nom && (
            <div className="flex items-center gap-2 mt-2">
              <AlertCircle size={16} style={{ color: "#c8102e" }} />
              <p className="text-sm" style={{ color: "#c8102e" }}>
                {errors.nom.message}
              </p>
            </div>
          )}
        </div>

        {/* Prénom */}
        <div>
          <Label
            htmlFor="prenom"
            className="text-base font-semibold mb-2 block"
            style={{ color: "#2d5a3d" }}
          >
            Prénom <span style={{ color: "#c8102e" }}>*</span>
          </Label>
          <Input
            id="prenom"
            {...register("prenom")}
            placeholder="Votre prénom"
            className="h-12 text-base px-4 border-2 transition-all duration-200 !bg-white !text-gray-900 placeholder:text-gray-400 focus:shadow-lg"
            style={{
              borderColor: errors.prenom ? "#c8102e" : "#d1d5db",
              borderRadius: "0.5rem",
            }}
            onFocus={(e) => {
              if (!errors.prenom) {
                e.target.style.borderColor = "#2d5a3d";
              }
            }}
            onBlur={(e) => {
              if (!errors.prenom) {
                e.target.style.borderColor = "#d1d5db";
              }
            }}
          />
          {errors.prenom && (
            <div className="flex items-center gap-2 mt-2">
              <AlertCircle size={16} style={{ color: "#c8102e" }} />
              <p className="text-sm" style={{ color: "#c8102e" }}>
                {errors.prenom.message}
              </p>
            </div>
          )}
        </div>

        {/* Email */}
        <div>
          <Label
            htmlFor="email"
            className="text-base font-semibold mb-2 block"
            style={{ color: "#2d5a3d" }}
          >
            Email <span style={{ color: "#c8102e" }}>*</span>
          </Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="votre@email.com"
            className="h-12 text-base px-4 border-2 transition-all duration-200 !bg-white !text-gray-900 placeholder:text-gray-400 focus:shadow-lg"
            style={{
              borderColor: errors.email ? "#c8102e" : "#d1d5db",
              borderRadius: "0.5rem",
            }}
            onFocus={(e) => {
              if (!errors.email) {
                e.target.style.borderColor = "#2d5a3d";
              }
            }}
            onBlur={(e) => {
              if (!errors.email) {
                e.target.style.borderColor = "#d1d5db";
              }
            }}
          />
          {errors.email && (
            <div className="flex items-center gap-2 mt-2">
              <AlertCircle size={16} style={{ color: "#c8102e" }} />
              <p className="text-sm" style={{ color: "#c8102e" }}>
                {errors.email.message}
              </p>
            </div>
          )}
        </div>

        {/* Téléphone */}
        <div>
          <Label
            htmlFor="telephone"
            className="text-base font-semibold mb-2 block"
            style={{ color: "#2d5a3d" }}
          >
            Téléphone <span style={{ color: "#c8102e" }}>*</span>
          </Label>
          <Input
            id="telephone"
            type="tel"
            {...register("telephone")}
            placeholder="0612345678"
            className="h-12 text-base px-4 border-2 transition-all duration-200 !bg-white !text-gray-900 placeholder:text-gray-400 focus:shadow-lg"
            style={{
              borderColor: errors.telephone ? "#c8102e" : "#d1d5db",
              borderRadius: "0.5rem",
            }}
            onFocus={(e) => {
              if (!errors.telephone) {
                e.target.style.borderColor = "#2d5a3d";
              }
            }}
            onBlur={(e) => {
              if (!errors.telephone) {
                e.target.style.borderColor = "#d1d5db";
              }
            }}
          />
          {errors.telephone && (
            <div className="flex items-center gap-2 mt-2">
              <AlertCircle size={16} style={{ color: "#c8102e" }} />
              <p className="text-sm" style={{ color: "#c8102e" }}>
                {errors.telephone.message}
              </p>
            </div>
          )}
        </div>

        {/* Global Error Message */}
        {error && (
          <div
            className="p-4 rounded-lg flex items-start gap-3"
            style={{
              backgroundColor: "#fee2e2",
              border: "2px solid #c8102e",
            }}
          >
            <AlertCircle
              size={20}
              className="flex-shrink-0 mt-0.5"
              style={{ color: "#c8102e" }}
            />
            <p className="text-sm" style={{ color: "#c8102e" }}>
              {error}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="flex-1 h-12 text-base font-semibold rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                backgroundColor: "#ffffff",
                color: "#2d5a3d",
                border: "2px solid #2d5a3d",
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.currentTarget.style.backgroundColor = "rgba(45, 90, 61, 0.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  e.currentTarget.style.backgroundColor = "#ffffff";
                }
              }}
            >
              <ArrowLeft size={18} />
              Retour au calendrier
            </Button>
          )}
          <Button
            type="submit"
            disabled={submitting}
            className="flex-1 h-12 text-base font-semibold rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            style={{
              backgroundColor: "#2d5a3d",
              color: "#ffffff",
              fontFamily: "var(--font-playfair), serif",
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                e.currentTarget.style.backgroundColor = "#3d7a52";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(45, 90, 61, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting) {
                e.currentTarget.style.backgroundColor = "#2d5a3d";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
              }
            }}
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Redirection...
              </div>
            ) : (
              "Réserver et Payer"
            )}
          </Button>
        </div>

        <p className="text-sm text-center pt-2" style={{ color: "#6b7280" }}>
          <span style={{ color: "#c8102e" }}>*</span> Champs obligatoires
        </p>
      </form>
    </div>
  );
}


