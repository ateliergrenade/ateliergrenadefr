"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReservationCancelPage() {
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
            border: "3px solid #c8102e",
          }}
        >
          {/* Cancel Icon */}
          <div className="flex justify-center mb-6">
            <XCircle size={80} style={{ color: "#c8102e" }} strokeWidth={2} />
          </div>

          {/* Title */}
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              color: "#c8102e",
              fontFamily: "var(--font-playfair), serif",
            }}
          >
            Réservation Annulée
          </h1>

          {/* Message */}
          <p
            className="text-lg md:text-xl mb-8 leading-relaxed"
            style={{
              color: "#1f2937",
              fontFamily: "var(--font-crimson), serif",
            }}
          >
            Votre réservation a été annulée. Aucun montant n'a été débité de
            votre compte.
          </p>

          {/* Decorative line */}
          <div
            className="w-24 h-1 mx-auto mb-8"
            style={{ background: "#c8102e" }}
          ></div>

          {/* Info Box */}
          <div
            className="rounded-lg p-6 mb-8 text-left"
            style={{ backgroundColor: "#f8f5f2" }}
          >
            <h2
              className="text-xl font-semibold mb-3"
              style={{
                color: "#2d5a3d",
                fontFamily: "var(--font-playfair), serif",
              }}
            >
              Que faire maintenant ?
            </h2>
            <ul className="space-y-2" style={{ color: "#1f2937" }}>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  Vous pouvez retourner à la liste des ateliers pour choisir
                  une autre session
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  Si vous avez rencontré un problème, n'hésitez pas à nous
                  contacter
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  Vous pouvez essayer de réserver à nouveau quand vous le
                  souhaitez
                </span>
              </li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button
                className="px-8 py-6 text-lg font-semibold rounded-lg transition-all hover:scale-105"
                style={{
                  backgroundColor: "#2d5a3d",
                  color: "#ffffff",
                  fontFamily: "var(--font-playfair), serif",
                }}
              >
                Voir les ateliers
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


