import type { ReactNode } from "react";
import { createPrivateMetadata } from "@/lib/seo";

export const metadata = createPrivateMetadata("Geschützter Mitgliedschaftsbereich");

export default function PlansLayout({ children }: { children: ReactNode }) {
  return children;
}
