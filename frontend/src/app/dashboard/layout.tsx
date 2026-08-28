import type { ReactNode } from "react";
import { createPrivateMetadata } from "@/lib/seo";

export const metadata = createPrivateMetadata("Geschützter Mitgliederbereich");

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children;
}
