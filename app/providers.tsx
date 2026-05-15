"use client";

import { ParkingProvider } from "@/features/parking/parkingContext";
import { AuthProvider } from "@/features/auth/authContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ParkingProvider>{children}</ParkingProvider>
    </AuthProvider>
  );
}
