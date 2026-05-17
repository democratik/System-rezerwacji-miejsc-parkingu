"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  useParkingContext,
  SECTIONS,
  type Spot,
} from "@/features/parking/parkingContext";

type BookingModal = { spotId: string; spotNumber: string };

const DURATION_OPTIONS = [
  { label: "30 minut", minutes: 30 },
  { label: "1 godzina", minutes: 60 },
  { label: "2 godziny", minutes: 120 },
  { label: "4 godziny", minutes: 240 },
  { label: "8 godzin", minutes: 480 },
  { label: "24 godziny", minutes: 1440 },
];

export default function ParkingManager() {
  const { spots, addBooking } = useParkingContext();
  const [modal, setModal] = useState<BookingModal | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [driverName, setDriverName] = useState<string>("");

  const stats = useMemo(() => {
    const all = Object.values(spots).flat();
    const total = all.length;
    const free = all.filter((s) => s.status === "free").length;
    const booked = all.filter((s) => s.status === "booked").length;
    const occupied = all.filter((s) => s.status === "occupied").length;
    return { total, free, booked, occupied };
  }, [spots]);

  const handleSpotClick = (spot: Spot) => {
    if (spot.status !== "free") return;
    setModal({ spotId: spot.id, spotNumber: spot.number });
    setSelectedDuration(60);
    setDriverName("");
  };

  const handleConfirm = () => {
    if (!modal) return;
    addBooking(modal.spotId, driverName, selectedDuration);
    setModal(null);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">Interaktywna mapa parkingu</h2>
        <Link
          href="/AdminPanel"
          className="text-sm font-medium text-gray-500 hover:text-gray-800 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all">
          Panel administratora
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
            Wszystkich
          </p>
          <p className="text-3xl font-bold mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
            Wolnych
          </p>
          <p className="text-3xl font-bold mt-1 text-green-600">
            {stats.free}
            <span className="text-base font-medium ml-1 text-green-400">
              ({Math.round((stats.free / stats.total) * 100)}%)
            </span>
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
            Zarezerwowane
          </p>
          <p className="text-3xl font-bold mt-1 text-blue-600">
            {stats.booked}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
            Zajete
          </p>
          <p className="text-3xl font-bold mt-1 text-red-600">
            {stats.occupied}
          </p>
        </div>
      </div>

      <div className="flex gap-6 mb-6 text-sm font-medium flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-green-500 rounded bg-green-50" />
          <span>Wolne</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-blue-500 rounded bg-blue-100" />
          <span>Zarezerwowane</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-red-400 rounded bg-red-50" />
          <span>Zajete</span>
        </div>
      </div>

      <div
        id="map"
        className="bg-white p-5 md:p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-3 px-2 text-xs font-bold">
          <span className="text-blue-600">← Wjazd</span>
          <span className="text-gray-400 uppercase tracking-widest">
            Parking uniwersytecki
          </span>
          <span className="text-blue-600">Wyjazd →</span>
        </div>

        <div className="h-3 mb-4 relative overflow-hidden rounded-sm bg-gray-100">
          <div className="absolute inset-y-0 left-0 right-0 flex items-center">
            <div className="w-full border-t-2 border-dashed border-blue-300" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {SECTIONS.map((sectionName) => {
            const sectionSpots = spots[sectionName] ?? [];
            const groups = [
              sectionSpots.slice(0, 10),
              sectionSpots.slice(10, 20),
              sectionSpots.slice(20, 25),
            ];
            const renderSpot = (spot: Spot) => (
              <button
                key={spot.id}
                disabled={spot.status !== "free"}
                onClick={() => handleSpotClick(spot)}
                className={[
                  "aspect-square flex items-center justify-center text-[9px] font-bold rounded-sm border-2 transition-all",
                  spot.status === "occupied"
                    ? "border-red-400 text-red-400 bg-red-50 opacity-60 cursor-not-allowed"
                    : spot.status === "booked"
                      ? "border-blue-400 text-blue-600 bg-blue-100 cursor-not-allowed"
                      : "border-green-500 text-green-600 bg-green-50 hover:bg-green-100 hover:scale-105 cursor-pointer",
                ].join(" ")}>
                {spot.number}
              </button>
            );
            return (
              <div
                key={sectionName}
                className="bg-gray-50 rounded-lg p-3 pt-5 relative border border-gray-200">
                <div className="absolute -top-2.5 left-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-10">
                  SEKCJA {sectionName}
                </div>

                {groups.map((group, idx) => (
                  <React.Fragment key={idx}>
                    <div className="grid grid-cols-5 gap-1">
                      {group.map(renderSpot)}
                    </div>
                    {idx < groups.length - 1 && (
                      <div className="h-3 my-2 relative bg-gray-100 rounded-sm overflow-hidden">
                        <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                          <div className="w-full border-t border-dashed border-blue-300 opacity-70" />
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            );
          })}
        </div>

        <div className="h-3 mt-4 relative overflow-hidden rounded-sm bg-gray-100">
          <div className="absolute inset-y-0 left-0 right-0 flex items-center">
            <div className="w-full border-t-2 border-dashed border-blue-300" />
          </div>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-1">Rezerwacja miejsca</h3>
            <p className="text-gray-500 mb-6">
              Miejsce:{" "}
              <span className="font-bold text-gray-800">
                {modal.spotNumber}
              </span>
            </p>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imie i nazwisko{" "}
                <span className="text-gray-400">(opcjonalnie)</span>
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
                    className={
                      "py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all " +
                      (selectedDuration === opt.minutes
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-gray-200 text-gray-600 hover:border-blue-300")
                    }>
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
            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                className="cursor-pointer flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all">
                Anuluj
              </button>
              <button
                onClick={handleConfirm}
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
