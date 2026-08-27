import type { ReactNode } from "react";
import { createPublicMetadata } from "@/lib/seo";

export const metadata = createPublicMetadata({
  title: "Registrieren",
  description:
    "Erstellen Sie ein MyHelper.me Konto, um Unterstützung im Alltag zu suchen oder als Alltagsbegleiter:in Kontakte zu finden.",
  path: "/registrieren",
  index: false,
});

export default function RegistrierenLayout({ children }: { children: ReactNode }) {
  return children;
}
