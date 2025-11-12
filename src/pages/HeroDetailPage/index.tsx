// src/pages/HeroDetailPage/index.tsx

import { HeroDetail } from "@features/heroes";
import { DashboardLayout } from "@pages/DashboardPage";

export default function HeroDetailPage() {
  return (
    <DashboardLayout>
      <HeroDetail />
    </DashboardLayout>
  );
}
