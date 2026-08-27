import type { ReactNode } from "react";
import { createPublicMetadata } from "@/lib/seo";

export const metadata = createPublicMetadata({
  title: "FAQ zur Alltagsbegleitung",
  description:
    "Antworten zu MyHelper.me, Alltagsbegleitung, Unterstützung im Alltag und zur Nutzung der Vermittlungsplattform.",
  path: "/faq",
});

export default function FAQLayout({ children }: { children: ReactNode }) {
  return children;
}
