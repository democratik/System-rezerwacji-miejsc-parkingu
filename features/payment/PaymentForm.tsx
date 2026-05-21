"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useParkingContext } from "@/features/parking/parkingContext";
import { calculatePrice, formatPrice } from "@/lib/pricing";

type Method = "card" | "blik";
type Status = "idle" | "processing" | "success";

function formatTime(date: Date) {
  return date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = minutes / 60;
  return h === 1 ? "1 godzina" : `${h} godz`;
}

export default function PaymentForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { addBooking } = useParkingContext();

  const spot = params.get("spot");
  const name = params.get("name") ?? "";
  const duration = Number(params.get("duration") ?? "60");

  const price = useMemo(() => calculatePrice(duration), [duration]);
  const [validUntil] = useState(
    () => new Date(Date.now() + duration * 60 * 1000)
  );

  const [method, setMethod] = useState<Method>("card");
  const [status, setStatus] = useState<Status>("idle");

  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [blikCode, setBlikCode] = useState("");

  const handleCardNumber = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 16);
    setCardNumber(digits.replace(/(.{4})/g, "$1 ").trim());
  };

  const handleExpiry = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    setCardExpiry(
      digits.length >= 3 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits
    );
  };

  const cardDigits = cardNumber.replace(/\s/g, "");
  const isCardValid =
    cardDigits.length >= 12 &&
    cardExpiry.length === 5 &&
    cardCvv.length === 3 &&
    cardHolder.trim().length > 0;
  const isBlikValid = blikCode.length === 6;
  const isFormValid = method === "card" ? isCardValid : isBlikValid;

  const handlePay = () => {
    if (!isFormValid || status !== "idle" || !spot) return;
    setStatus("processing");
    // Symulacja platnosci - czekamy chwile, potem "sukces"
    window.setTimeout(() => {
      setStatus("success");
      window.setTimeout(() => {
        addBooking(spot, name, duration);
        router.push("/");
      }, 1300);
    }, 1800);
  };

  // Brak danych rezerwacji - ktos wszedl bezposrednio na /payment
  if (!spot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Brak danych rezerwacji
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Wybierz miejsce na mapie parkingu, aby przejsc do platnosci.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all">
            Przejdz do mapy parkingu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900">Platnosc</h1>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Dokoncz rezerwacje, oplacajac miejsce
          </p>

          {/* Podsumowanie rezerwacji */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-500">Miejsce</span>
              <span className="font-semibold text-gray-800">{spot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Kierowca</span>
              <span className="font-semibold text-gray-800">
                {name || "Anonimowy"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Czas rezerwacji</span>
              <span className="font-semibold text-gray-800">
                {formatDuration(duration)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Wazne do</span>
              <span className="font-semibold text-gray-800">
                {formatTime(validUntil)}
              </span>
            </div>
          </div>

          {/* Kwota */}
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <span className="text-blue-700 font-medium">Do zaplaty</span>
            <span className="text-2xl font-bold text-blue-700">
              {formatPrice(price)}
            </span>
          </div>

          {status === "success" ? (
            <div className="text-center py-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3">
                  <path
                    d="M5 13l4 4L19 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-lg font-bold text-gray-900">
                Platnosc zakonczona sukcesem
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Trwa finalizowanie rezerwacji...
              </p>
            </div>
          ) : status === "processing" ? (
            <div className="text-center py-6">
              <div className="mx-auto w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-600 font-medium">
                Przetwarzanie platnosci...
              </p>
            </div>
          ) : (
            <>
              {/* Wybor metody */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                <button
                  type="button"
                  onClick={() => setMethod("card")}
                  className={
                    "py-2.5 rounded-lg border-2 text-sm font-semibold transition-all cursor-pointer " +
                    (method === "card"
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-gray-200 text-gray-600 hover:border-blue-300")
                  }>
                  Karta platnicza
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("blik")}
                  className={
                    "py-2.5 rounded-lg border-2 text-sm font-semibold transition-all cursor-pointer " +
                    (method === "blik"
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-gray-200 text-gray-600 hover:border-blue-300")
                  }>
                  BLIK
                </button>
              </div>

              {method === "card" ? (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numer karty
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardNumber}
                      onChange={(e) => handleCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data waznosci
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cardExpiry}
                        onChange={(e) => handleExpiry(e.target.value)}
                        placeholder="MM/RR"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cardCvv}
                        onChange={(e) =>
                          setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
                        }
                        placeholder="123"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Imie i nazwisko na karcie
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="JAN KOWALSKI"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kod BLIK
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={blikCode}
                    onChange={(e) =>
                      setBlikCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="6-cyfrowy kod"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm tracking-[0.4em] text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Wpisz kod z aplikacji bankowej
                  </p>
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={!isFormValid}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all shadow-sm cursor-pointer">
                Zaplac {formatPrice(price)}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                To jest platnosc demonstracyjna — nie pobieramy zadnych srodkow.
              </p>

              <div className="text-center mt-4">
                <Link
                  href="/"
                  className="text-sm text-gray-500 hover:text-gray-700">
                  ← Anuluj i wroc do mapy
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
