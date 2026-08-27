import type { ReactNode } from "react";
import { createPublicMetadata } from "@/lib/seo";

export const metadata = createPublicMetadata({
  title: "Datenschutzerklärung",
  description:
    "Datenschutzerklärung von MyHelper.me zur Website, Registrierung und Nutzung der Vermittlungsplattform.",
  path: "/datenschutz",
});

export default function DatenschutzLayout({ children }: { children: ReactNode }) {
  return children;
}
