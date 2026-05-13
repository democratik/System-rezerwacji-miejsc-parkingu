"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type SpotStatus = "free" | "occupied" | "booked";

export type Spot = {
  id: string;
  number: string;
  section: string;
  status: SpotStatus;
  bookedUntil?: Date;
  bookedBy?: string;
  bookedAt?: Date;
};

export type ActivityEntry = {
  id: string;
  time: Date;
  action: "booked" | "cancelled" | "set_occupied" | "set_free";
  spotId: string;
  details: string;
};

type ParkingContextType = {
  spots: Record<string, Spot[]>;
  activityLog: ActivityEntry[];
  addBooking: (
    spotId: string,
    driverName: string,
    durationMinutes: number
  ) => void;
  cancelBooking: (spotId: string) => void;
  setSpotOccupied: (spotId: string) => void;
  setSpotFree: (spotId: string) => void;
};

// ─── Initial data ─────────────────────────────────────────────────────────────

export const SECTIONS = ["A", "B", "C", "D"];

const OCCUPIED_PATTERN = [
  true, false, false, false, true,
  false, true, false, false, false,
  false, false, true, false, true,
  false, false, false, true, false,
  true, false, true, false, false,
];

function generateInitialSpots(): Record<string, Spot[]> {
  const result: Record<string, Spot[]> = {};
  for (const section of SECTIONS) {
    result[section] = Array.from({ length: 25 }, (_, i) => ({
      id: `${section}${i + 1}`,
      number: `${section}${i + 1}`,
      section,
      status: OCCUPIED_PATTERN[i] ? "occupied" : "free",
    }));
  }
  return result;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ParkingContext = createContext<ParkingContextType | null>(null);

export function ParkingProvider({ children }: { children: React.ReactNode }) {
  const [spots, setSpots] = useState<Record<string, Spot[]>>(
    generateInitialSpots
  );
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);

  const logAction = useCallback(
    (
      action: ActivityEntry["action"],
      spotId: string,
      details: string
    ) => {
      setActivityLog((prev) => [
        {
          id: `${Date.now()}-${Math.random()}`,
          time: new Date(),
          action,
          spotId,
          details,
        },
        ...prev.slice(0, 49), // зберігаємо останні 50 записів
      ]);
    },
    []
  );

  const updateSpot = useCallback(
    (spotId: string, updater: (s: Spot) => Spot) => {
      setSpots((prev) => {
        const updated = { ...prev };
        for (const section of SECTIONS) {
          if (updated[section].some((s) => s.id === spotId)) {
            updated[section] = updated[section].map((s) =>
              s.id === spotId ? updater(s) : s
            );
            break;
          }
        }
        return updated;
      });
    },
    []
  );

  const addBooking = useCallback(
    (spotId: string, driverName: string, durationMinutes: number) => {
      const bookedUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
      const name = driverName.trim() || "Anonimowy";
      updateSpot(spotId, (s) => ({
        ...s,
        status: "booked",
        bookedBy: name,
        bookedAt: new Date(),
        bookedUntil,
      }));
      logAction(
        "booked",
        spotId,
        `Miejsce ${spotId} zarezerwowane przez ${name} na ${durationMinutes} min`
      );
    },
    [updateSpot, logAction]
  );

  const cancelBooking = useCallback(
    (spotId: string) => {
      updateSpot(spotId, (s) => ({
        ...s,
        status: "free",
        bookedBy: undefined,
        bookedAt: undefined,
        bookedUntil: undefined,
      }));
      logAction("cancelled", spotId, `Rezerwacja miejsca ${spotId} anulowana`);
    },
    [updateSpot, logAction]
  );

  const setSpotOccupied = useCallback(
    (spotId: string) => {
      updateSpot(spotId, (s) => ({
        ...s,
        status: "occupied",
        bookedBy: undefined,
        bookedAt: undefined,
        bookedUntil: undefined,
      }));
      logAction(
        "set_occupied",
        spotId,
        `Miejsce ${spotId} oznaczone jako zajęte (serwis)`
      );
    },
    [updateSpot, logAction]
  );

  const setSpotFree = useCallback(
    (spotId: string) => {
      updateSpot(spotId, (s) => ({
        ...s,
        status: "free",
        bookedBy: undefined,
        bookedAt: undefined,
        bookedUntil: undefined,
      }));
      logAction("set_free", spotId, `Miejsce ${spotId} oznaczone jako wolne`);
    },
    [updateSpot, logAction]
  );

  const value = useMemo(
    () => ({
      spots,
      activityLog,
      addBooking,
      cancelBooking,
      setSpotOccupied,
      setSpotFree,
    }),
    [spots, activityLog, addBooking, cancelBooking, setSpotOccupied, setSpotFree]
  );

  return (
    <ParkingContext.Provider value={value}>{children}</ParkingContext.Provider>
  );
}

export function useParkingContext() {
  const ctx = useContext(ParkingContext);
  if (!ctx) throw new Error("useParkingContext must be used inside ParkingProvider");
  return ctx;
}
