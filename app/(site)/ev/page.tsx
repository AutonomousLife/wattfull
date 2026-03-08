import { Suspense } from "react";
import { EVCalcPage } from "@/components/pages/EVCalcPage";

export const metadata = {
  title: "EV Savings Calculator — Wattfull",
  description: "Calculate real EV vs gas savings for your ZIP code. Includes electricity rates, incentives, and climate adjustments.",
};

export default function EVPage() {
  // Suspense required by Next.js when useSearchParams() is used inside EVCalcPage
  return (
    <Suspense fallback={null}>
      <EVCalcPage />
    </Suspense>
  );
}
