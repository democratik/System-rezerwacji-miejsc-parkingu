// Cennik rezerwacji miejsc parkingowych.
// Uwaga: platnosc jest tylko symulowana - nie laczy sie z realnym operatorem.

export const PRICE_PER_HOUR_PLN = 5;

/** Oblicza koszt rezerwacji na podstawie czasu trwania (w minutach). */
export function calculatePrice(durationMinutes: number): number {
  return (durationMinutes / 60) * PRICE_PER_HOUR_PLN;
}

/** Formatuje kwote do postaci "12.50 zl". */
export function formatPrice(value: number): string {
  return value.toFixed(2) + " zl";
}
