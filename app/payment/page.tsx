import { Suspense } from "react";
import PaymentForm from "@/features/payment/PaymentForm";

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <PaymentForm />
    </Suspense>
  );
}
