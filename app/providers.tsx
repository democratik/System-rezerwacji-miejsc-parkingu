"use client";

import { ParkingProvider } from "@/features/parking/parkingContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ParkingProvider>{children}</ParkingProvider>;
}
