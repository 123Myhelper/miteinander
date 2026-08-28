import type { ReactNode } from "react";
import { createPublicMetadata } from "@/lib/seo";

export const metadata = createPublicMetadata({
  title: "Passwort zurücksetzen",
  description: "Setzen Sie das Passwort für Ihr MyHelper.me Konto zurück.",
  path: "/forgot-password",
  index: false,
});

export default function ForgotPasswordLayout({ children }: { children: ReactNode }) {
  return children;
}
