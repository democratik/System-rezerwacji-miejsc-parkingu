"use client";

import React, { useState, useMemo } from "react";

type SpotStatus = "free" | "occupied" | "booked";

type Spot = {
  id: string;
  number: string;
  status: SpotStatus;
  bookedUntil?: Date;
  bookedBy?: string;
};

type BookingInfo = {
  spotId: string;
  spotNumber: string;
};

const SECTIONS = ["A", "B", "C", "D"];

function generateInitialSpots(): Record<string, Spot[]> {
  const result: Record<string, Spot[]> = {};
  const occupiedPattern = [
    true,
    false,
    false,
    false,
    true,
    false,
    true,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    true,
    false,
    false,
    false,
    true,
    false,
    true,
    false,
    true,
    false,
    false,
  ];

  for (const section of SECTIONS) {
    result[section] = Array.from({ length: 25 }, (_, i) => ({
      id: `${section}${i + 1}`,
      number: `${section}${i + 1}`,
      status: occupiedPattern[i] ? "occupied" : "free",
    }));
  }
  return result;
}

const DURATION_OPTIONS = [
  { label: "30 minut", minutes: 30 },
  { label: "1 godzina", minutes: 60 },
  { label: "2 godziny", minutes: 120 },
  { label: "4 godziny", minutes: 240 },
  { label: "8 godzin", minutes: 480 },
  { label: "24 godziny", minutes: 1440 },
];

export default function ParkingManager() {
  const initialSpots = useMemo(() => generateInitialSpots(), []);
  const [spots, setSpots] = useState<Record<string, Spot[]>>(initialSpots);

  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [driverName, setDriverName] = useState<string>("");

  const stats = useMemo(() => {
    const allSpots = Object.values(spots).flat();
    const total = allSpots.length;
    const occupied = allSpots.filter((s) => s.status === "occupied").length;
    const booked = allSpots.filter((s) => s.status === "booked").length;
    const free = allSpots.filter((s) => s.status === "free").length;
    return { total, occupied, booked, free };
  }, [spots]);

  const handleSpotClick = (spot: Spot) => {
    if (spot.status !== "free") return;
    setBooking({ spotId: spot.id, spotNumber: spot.number });
    setSelectedDuration(60);
    setDriverName("");
  };

  const handleConfirmBooking = () => {
    if (!booking) return;

    const bookedUntil = new Date(Date.now() + selectedDuration * 60 * 1000);

    setSpots((prev) => {
      const updated = { ...prev };
      for (const section of SECTIONS) {
        updated[section] = updated[section].map((s) =>
          s.id === booking.spotId
            ? {
                ...s,
                status: "booked" as SpotStatus,
                bookedUntil,
                bookedBy: driverName || "Anonimowy",
              }
            : s,
        );
      }
      return updated;
    });

    setBooking(null);
  };

  const handleCancelBooking = () => {
    setBooking(null);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-8">Interaktywna mapa parkingu</h2>

      {/* Секція статистики */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm font-medium">Wszystkich miejsc</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm font-medium">Wolnych miejsc</p>
          <p className="text-3xl font-bold text-green-600">
            {stats.free} ({Math.round((stats.free / stats.total) * 100)}%)
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm font-medium">Zarezerwowane</p>
          <p className="text-3xl font-bold text-blue-600">{stats.booked}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm font-medium">Zajęte</p>
          <p className="text-3xl font-bold text-red-600">{stats.occupied}</p>
        </div>
      </div>

      <div className="flex gap-6 mb-8 text-sm font-medium flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-green-500 rounded bg-green-50"></div>
          <span>Wolne</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-blue-500 rounded bg-blue-100"></div>
          <span>Zarezerwowane</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-red-500 rounded bg-red-50"></div>
          <span>Zajęte</span>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm grid grid-cols-1 lg:grid-cols-4 gap-12">
        {SECTIONS.map((sectionName) => (
          <div key={sectionName}>
            <h3 className="text-lg font-bold mb-4">Sekcja {sectionName}</h3>
            <div className="grid grid-cols-5 gap-2">
              {spots[sectionName].map((spot) => (
                <button
                  key={spot.id}
                  disabled={
                    spot.status === "occupied" || spot.status === "booked"
                  }
                  onClick={() => handleSpotClick(spot)}
                  title={
                    spot.status === "booked" && spot.bookedUntil
                      ? `Zarezerwowane przez: ${spot.bookedBy}\nDo: ${formatTime(spot.bookedUntil)}`
                      : spot.status === "occupied"
                        ? "Zajęte"
                        : "Kliknij aby zarezerwować"
                  }
                  className={`
                    aspect-square flex items-center justify-center text-[10px] font-bold rounded border-2 transition-all
                    ${spot.status === "occupied" ? "border-red-500 text-red-500 bg-red-50 opacity-60 cursor-not-allowed" : ""}
                    ${spot.status === "booked" ? "border-blue-500 text-blue-600 bg-blue-100 cursor-not-allowed" : ""}
                    ${spot.status === "free" ? "border-green-500 text-green-600 bg-green-50 hover:bg-green-100 hover:scale-105 cursor-pointer" : ""}
                  `}>
                  {spot.number}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {booking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-1">Rezerwacja miejsca</h3>
            <p className="text-gray-500 mb-6">
              Miejsce:{" "}
              <span className="font-bold text-gray-800">
                {booking.spotNumber}
              </span>
            </p>

            {/* Ім'я водія */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imię i nazwisko
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="np. Jan Kowalski"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Czas rezerwacji
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.minutes}
                    onClick={() => setSelectedDuration(opt.minutes)}
                    className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      selectedDuration === opt.minutes
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-gray-200 text-gray-600 hover:border-blue-300"
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-700">
              Rezerwacja do:{" "}
              <span className="font-bold">
                {formatTime(
                  new Date(Date.now() + selectedDuration * 60 * 1000),
                )}
              </span>
            </div>

            {/* Кнопки */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelBooking}
                className="cursor-pointer flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all">
                Anuluj
              </button>
              <button
                onClick={handleConfirmBooking}
                className="cursor-pointer flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-md">
                Zarezerwuj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
