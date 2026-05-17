"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  useParkingContext,
  SECTIONS,
  type Spot,
  type ActivityEntry,
} from "@/features/parking/parkingContext";

type Tab = "dashboard" | "reservations" | "map" | "log";

const DURATION_OPTIONS = [
  { label: "30 min", minutes: 30 },
  { label: "1 godz", minutes: 60 },
  { label: "2 godz", minutes: 120 },
  { label: "4 godz", minutes: 240 },
  { label: "8 godz", minutes: 480 },
  { label: "24 godz", minutes: 1440 },
];

function formatTime(date: Date) {
  return date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
}
function formatDateTime(date: Date) {
  return date.toLocaleString("pl-PL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}
function timeUntil(date: Date) {
  const diff = date.getTime() - Date.now();
  if (diff <= 0) return "wygaslo";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? h + "h " + m + "m" : m + "m";
}

const ACTION_LABELS: Record<ActivityEntry["action"], string> = {
  booked: "Rezerwacja",
  cancelled: "Anulowanie",
  set_occupied: "Zajete (serwis)",
  set_free: "Zwolnione",
};
const ACTION_COLORS: Record<ActivityEntry["action"], string> = {
  booked: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
  set_occupied: "bg-orange-100 text-orange-700",
  set_free: "bg-green-100 text-green-700",
};

function StatCard({ label, value, color, sub }: { label: string; value: number | string; color: string; sub?: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-1">{label}</p>
      <p className={"text-4xl font-bold " + color}>{value}</p>
      {sub && <p className="text-gray-400 text-sm mt-1">{sub}</p>}
    </div>
  );
}

function DashboardTab() {
  const { spots, activityLog } = useParkingContext();

  const stats = useMemo(() => {
    const all = Object.values(spots).flat();
    const total = all.length;
    const free = all.filter((s) => s.status === "free").length;
    const booked = all.filter((s) => s.status === "booked").length;
    const occupied = all.filter((s) => s.status === "occupied").length;
    const occupancyRate = Math.round(((occupied + booked) / total) * 100);
    return { total, free, booked, occupied, occupancyRate };
  }, [spots]);

  const sectionStats = useMemo(() => {
    return SECTIONS.map((s) => {
      const all = spots[s] ?? [];
      const free = all.filter((x) => x.status === "free").length;
      const booked = all.filter((x) => x.status === "booked").length;
      const occupied = all.filter((x) => x.status === "occupied").length;
      return { section: s, free, booked, occupied, total: all.length };
    });
  }, [spots]);

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Wszystkich miejsc" value={stats.total} color="text-gray-800" />
        <StatCard label="Wolne" value={stats.free} color="text-green-600"
          sub={Math.round((stats.free / stats.total) * 100) + "% dostepnych"} />
        <StatCard label="Zarezerwowane" value={stats.booked} color="text-blue-600" />
        <StatCard label="Zajete" value={stats.occupied} color="text-red-600" />
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700">Poziom zajetosci parkingu</h3>
          <span className="text-2xl font-bold text-gray-800">{stats.occupancyRate}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
          <div className="h-4 rounded-full transition-all duration-500" style={{
            width: stats.occupancyRate + "%",
            background: stats.occupancyRate > 80 ? "#ef4444" : stats.occupancyRate > 50 ? "#f59e0b" : "#22c55e",
          }} />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0%</span><span>50%</span><span>100%</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <h3 className="font-semibold text-gray-700 mb-4">Sekcje parkingu</h3>
        <div className="space-y-3">
          {sectionStats.map(({ section, free, booked, occupied, total }) => {
            const pct = Math.round(((occupied + booked) / total) * 100);
            return (
              <div key={section} className="flex items-center gap-4">
                <span className="font-bold text-gray-700 w-8">{section}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className="h-3 rounded-full bg-blue-500 transition-all" style={{ width: pct + "%" }} />
                </div>
                <span className="text-sm text-gray-500 w-28 text-right">{free} wolnych / {total}</span>
                <div className="flex gap-1 text-xs">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{booked} rez.</span>
                  <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{occupied} zaj.</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-semibold text-gray-700 mb-4">Ostatnie dzialania</h3>
        {activityLog.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Brak aktywnosci</p>
        ) : (
          <div className="space-y-2">
            {activityLog.slice(0, 8).map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 text-sm py-2 border-b border-gray-50 last:border-0">
                <span className={"text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap " + ACTION_COLORS[entry.action]}>
                  {ACTION_LABELS[entry.action]}
                </span>
                <span className="text-gray-600 flex-1">{entry.details}</span>
                <span className="text-gray-400 text-xs whitespace-nowrap">{formatDateTime(entry.time)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReservationsTab() {
  const { spots, cancelBooking, setSpotFree, addBooking } = useParkingContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [addSpotId, setAddSpotId] = useState("");
  const [addName, setAddName] = useState("");
  const [addDuration, setAddDuration] = useState(60);
  const [filterSection, setFilterSection] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "booked" | "occupied">("all");

  const allNonFree = useMemo(() => {
    return Object.values(spots).flat()
      .filter((s) => s.status !== "free")
      .filter((s) => filterSection === "all" || s.section === filterSection)
      .filter((s) => filterStatus === "all" || s.status === filterStatus);
  }, [spots, filterSection, filterStatus]);

  const freeSpots = useMemo(
    () => Object.values(spots).flat().filter((s) => s.status === "free"),
    [spots]
  );

  const handleAdd = () => {
    if (!addSpotId) return;
    addBooking(addSpotId, addName, addDuration);
    setAddSpotId(""); setAddName(""); setAddDuration(60); setShowAddForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-lg font-semibold text-gray-800">
            Zajete miejsca <span className="ml-1 text-sm font-normal text-gray-500">({allNonFree.length})</span>
          </h3>
          <div className="flex gap-1">
            {(["all", "booked", "occupied"] as const).map((f) => (
              <button key={f} onClick={() => setFilterStatus(f)}
                className={"px-3 py-1 rounded-full text-xs font-semibold transition-all " +
                  (filterStatus === f ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                {f === "all" ? "Wszystkie" : f === "booked" ? "Zarezerwowane" : "Zajete"}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {["all", ...SECTIONS].map((s) => (
              <button key={s} onClick={() => setFilterSection(s)}
                className={"px-3 py-1 rounded-full text-xs font-semibold transition-all " +
                  (filterSection === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                {s === "all" ? "Wszystkie sekcje" : s}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)}
          className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-sm">
          + Dodaj rezerwacje
        </button>
      </div>

      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <h4 className="font-semibold text-blue-800 mb-4">Nowa rezerwacja (admin)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Miejsce *</label>
              <select value={addSpotId} onChange={(e) => setAddSpotId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Wybierz miejsce...</option>
                {freeSpots.map((s) => <option key={s.id} value={s.id}>{s.number}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Kierowca</label>
              <input type="text" value={addName} onChange={(e) => setAddName(e.target.value)}
                placeholder="np. Jan Kowalski"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Czas trwania</label>
              <select value={addDuration} onChange={(e) => setAddDuration(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {DURATION_OPTIONS.map((opt) => <option key={opt.minutes} value={opt.minutes}>{opt.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowAddForm(false)}
              className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Anuluj
            </button>
            <button onClick={handleAdd} disabled={!addSpotId}
              className="cursor-pointer px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-sm font-semibold transition-all">
              Utworz rezerwacje
            </button>
          </div>
        </div>
      )}

      {allNonFree.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-lg">Brak zajetych miejsc</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Miejsce</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Kierowca</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Zarezerwowano</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Wazne do</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Pozostalo</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {allNonFree.map((spot) => (
                <tr key={spot.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-bold text-gray-800">{spot.number}</span>
                    <span className="ml-2 text-xs text-gray-400">Sekcja {spot.section}</span>
                  </td>
                  <td className="px-4 py-3">
                    {spot.status === "booked" ? (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">Zarezerwowane</span>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700">Zajete</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{spot.bookedBy ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{spot.bookedAt ? formatDateTime(spot.bookedAt) : "—"}</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{spot.bookedUntil ? formatTime(spot.bookedUntil) : "—"}</td>
                  <td className="px-4 py-3">
                    {spot.bookedUntil ? (
                      <span className={"text-xs font-semibold px-2 py-1 rounded-full " +
                        (spot.bookedUntil.getTime() - Date.now() < 600000 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700")}>
                        {timeUntil(spot.bookedUntil)}
                      </span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {spot.status === "booked" ? (
                      <button onClick={() => cancelBooking(spot.id)}
                        className="cursor-pointer text-xs font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all">
                        Anuluj
                      </button>
                    ) : (
                      <button onClick={() => setSpotFree(spot.id)}
                        className="cursor-pointer text-xs font-semibold text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-all">
                        Zwolnij
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MapTab() {
  const { spots, cancelBooking, setSpotOccupied, setSpotFree } = useParkingContext();
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6">Kliknij na dowolne miejsce, aby zmienic jego status.</p>
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-200 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-3 px-2 text-xs font-bold">
          <span className="text-blue-600">← Wjazd</span>
          <span className="text-gray-400 uppercase tracking-widest">Parking uniwersytecki</span>
          <span className="text-blue-600">Wyjazd →</span>
        </div>

        <div className="h-3 mb-4 relative overflow-hidden rounded-sm bg-gray-100">
          <div className="absolute inset-y-0 left-0 right-0 flex items-center">
            <div className="w-full border-t-2 border-dashed border-blue-300" />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {SECTIONS.map((sectionName) => {
            const sectionSpots = spots[sectionName] ?? [];
            const groups = [
              sectionSpots.slice(0, 10),
              sectionSpots.slice(10, 20),
              sectionSpots.slice(20, 25),
            ];
            const renderSpot = (spot: Spot) => (
              <button key={spot.id} onClick={() => setSelectedSpot(spot)} title={spot.number}
                className={[
                  "aspect-square flex items-center justify-center text-[8px] font-bold rounded-sm border-2 transition-all hover:scale-110 cursor-pointer",
                  spot.status === "occupied" ? "border-red-400 text-red-500 bg-red-50"
                    : spot.status === "booked" ? "border-blue-400 text-blue-600 bg-blue-100"
                    : "border-green-500 text-green-600 bg-green-50",
                  selectedSpot?.id === spot.id ? "ring-2 ring-offset-1 ring-blue-500 scale-110" : "",
                ].join(" ")}>
                {spot.number}
              </button>
            );
            return (
              <div key={sectionName} className="bg-gray-50 rounded-lg p-3 pt-5 relative border border-gray-200">
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

      {selectedSpot && (
        <div className="bg-white border-2 border-blue-300 rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold text-gray-800 text-lg mb-1">Miejsce {selectedSpot.number}</h4>
              <p className="text-sm text-gray-500 mb-4">
                Sekcja {selectedSpot.section} -{" "}
                {selectedSpot.status === "free" && <span className="text-green-600 font-medium">Wolne</span>}
                {selectedSpot.status === "booked" && (
                  <span className="text-blue-600 font-medium">
                    Zarezerwowane przez {selectedSpot.bookedBy}
                    {selectedSpot.bookedUntil && " do " + formatTime(selectedSpot.bookedUntil)}
                  </span>
                )}
                {selectedSpot.status === "occupied" && <span className="text-red-600 font-medium">Zajete</span>}
              </p>
            </div>
            <button onClick={() => setSelectedSpot(null)}
              className="cursor-pointer text-gray-400 hover:text-gray-600 text-xl font-bold">x</button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {selectedSpot.status !== "free" && (
              <button onClick={() => { setSpotFree(selectedSpot.id); setSelectedSpot(null); }}
                className="cursor-pointer px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-all">
                Oznacz jako wolne
              </button>
            )}
            {selectedSpot.status === "booked" && (
              <button onClick={() => { cancelBooking(selectedSpot.id); setSelectedSpot(null); }}
                className="cursor-pointer px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-all">
                Anuluj rezerwacje
              </button>
            )}
            {selectedSpot.status !== "occupied" && (
              <button onClick={() => { setSpotOccupied(selectedSpot.id); setSelectedSpot(null); }}
                className="cursor-pointer px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-all">
                Wylacz z uzytku
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityLogTab() {
  const { activityLog } = useParkingContext();
  const [filter, setFilter] = useState<ActivityEntry["action"] | "all">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return activityLog;
    return activityLog.filter((e) => e.action === filter);
  }, [activityLog, filter]);

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "booked", "cancelled", "set_occupied", "set_free"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={"px-3 py-1.5 rounded-full text-xs font-semibold transition-all " +
              (filter === f ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
            {f === "all" ? "Wszystkie" : ACTION_LABELS[f as ActivityEntry["action"]]}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">Brak wpisow w dzienniku</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Czas</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Akcja</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Miejsce</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Szczegoly</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDateTime(entry.time)}</td>
                  <td className="px-4 py-3">
                    <span className={"text-xs font-semibold px-2 py-1 rounded-full " + ACTION_COLORS[entry.action]}>
                      {ACTION_LABELS[entry.action]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-700">{entry.spotId}</td>
                  <td className="px-4 py-3 text-gray-600">{entry.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const tabs = [
    { id: "dashboard" as Tab, label: "Dashboard" },
    { id: "reservations" as Tab, label: "Rezerwacje" },
    { id: "map" as Tab, label: "Mapa parkingu" },
    { id: "log" as Tab, label: "Dziennik" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Panel Administratora</h1>
            <p className="text-xs text-gray-400 mt-0.5">System zarzadzania parkingiem</p>
          </div>
          <Link href="/"
            className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all font-medium">
            Strona glowna
          </Link>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={"cursor-pointer px-5 py-4 text-sm font-semibold border-b-2 transition-all " +
                  (activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300")}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "reservations" && <ReservationsTab />}
        {activeTab === "map" && <MapTab />}
        {activeTab === "log" && <ActivityLogTab />}
      </main>
    </div>
  );
}
