"use client";

import React, { useState } from "react";

// Типізація для паркувального місця
type Spot = {
  id: string;
  number: string;
  status: "free" | "occupied" | "selected";
};

export default function ParkingManager() {
  // Поки що використовуємо статичні дані для прикладу
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);

  const sections = ["A", "B", "C", "D"];

  // Функція для генерації масиву місць (для прикладу)
  const generateSpots = (section: string): Spot[] =>
    Array.from({ length: 25 }, (_, i) => ({
      id: `${section}${i + 1}`,
      number: `${section}${i + 1}`,
      status: Math.random() > 0.3 ? "free" : "occupied",
    }));

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-8">Interaktywna mapa parkingu</h2>

      {/* Секція статистики */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm font-medium">Wszystkich miejsc</p>
          <p className="text-3xl font-bold">100</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm font-medium">Wolnych miejsc</p>
          <p className="text-3xl font-bold text-green-600">41 (41%)</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm font-medium">Zajęte</p>
          <p className="text-3xl font-bold text-red-600">59</p>
        </div>
      </div>

      {/* Легенда */}
      <div className="flex gap-6 mb-8 text-sm font-medium">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-green-500 rounded bg-green-50"></div>
          <span>Wolne</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-red-500 rounded bg-red-50"></div>
          <span>Zajęte</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-blue-500 rounded bg-blue-500"></div>
          <span>Wybrane</span>
        </div>
      </div>

      {/* Карта паркінгу */}
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm grid grid-cols-1 lg:grid-cols-4 gap-12">
        {sections.map((sectionName) => (
          <div key={sectionName}>
            <h3 className="text-lg font-bold mb-4">Sekcja {sectionName}</h3>
            <div className="grid grid-cols-5 gap-2">
              {generateSpots(sectionName).map((spot) => (
                <button
                  key={spot.id}
                  disabled={spot.status === "occupied"}
                  onClick={() => setSelectedSpot(spot.id)}
                  className={`
                    aspect-square flex items-center justify-center text-[10px] font-bold rounded border-2 transition-all
                    ${spot.status === "occupied" ? "border-red-500 text-red-500 bg-red-50 opacity-50 cursor-not-allowed" : ""}
                    ${spot.status === "free" && selectedSpot !== spot.id ? "border-green-500 text-green-500 bg-green-50 hover:bg-green-100" : ""}
                    ${selectedSpot === spot.id ? "border-blue-600 bg-blue-600 text-white shadow-md scale-105" : ""}
                  `}
                >
                  {spot.number}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
