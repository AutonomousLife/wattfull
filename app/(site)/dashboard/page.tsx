import { DashboardPage } from "@/components/pages/DashboardPage";

export const metadata = {
  title: "Energy Profile Dashboard - Wattfull",
  description: "A saved profile dashboard for EV, solar, state, and ownership decisions.",
};

export default function DashboardRoute() {
  return <DashboardPage />;
}
