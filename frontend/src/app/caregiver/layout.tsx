import type { ReactNode } from "react";
import { createPrivateMetadata } from "@/lib/seo";

export const metadata = createPrivateMetadata("Geschützter Bereich für Alltagsbegleiter:innen");

export default function CaregiverLayout({ children }: { children: ReactNode }) {
  return children;
}
