import type { ReactNode } from "react";
import { createPublicMetadata } from "@/lib/seo";

export const metadata = createPublicMetadata({
  title: "Allgemeine Geschäftsbedingungen",
  description:
    "Allgemeine Geschäftsbedingungen für die Nutzung der Vermittlungsplattform MyHelper.me.",
  path: "/agb",
});

export default function AGBLayout({ children }: { children: ReactNode }) {
  return children;
}
