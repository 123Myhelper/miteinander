import type { ReactNode } from "react";
import { createPrivateMetadata } from "@/lib/seo";

export const metadata = createPrivateMetadata("Geschützter Supportbereich");

export default function SupportRootLayout({ children }: { children: ReactNode }) {
  return children;
}
