import type { ReactNode } from "react";
import { createPublicMetadata } from "@/lib/seo";

export const metadata = createPublicMetadata({
  title: "E-Mail-Adresse bestätigen",
  description: "Bestätigen Sie die E-Mail-Adresse für Ihr MyHelper.me Konto.",
  path: "/verify-email",
  index: false,
});

export default function VerifyEmailLayout({ children }: { children: ReactNode }) {
  return children;
}
