import type { ReactNode } from "react";
import { createPublicMetadata } from "@/lib/seo";

export const metadata = createPublicMetadata({
  title: "Impressum",
  description:
    "Impressum und Anbieterkennzeichnung der Vermittlungsplattform MyHelper.me.",
  path: "/impressum",
});

export default function ImpressumLayout({ children }: { children: ReactNode }) {
  return children;
}
