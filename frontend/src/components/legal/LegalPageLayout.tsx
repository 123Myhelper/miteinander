"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useTranslation } from "@/context/LanguageContext";

interface LegalPageLayoutProps {
  title: string;
  children: ReactNode;
}

export default function LegalPageLayout({
  title,
  children,
}: LegalPageLayoutProps) {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen overflow-x-hidden bg-background py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Link
          href="/"
          className="mb-8 inline-flex rounded-md text-sm font-medium text-accent transition-colors hover:text-accent-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          {t("common.backToHome")}
        </Link>

        <h1 className="mb-8 break-words font-serif text-3xl text-primary sm:text-4xl md:text-5xl">
          {title}
        </h1>

        <div className="space-y-6 break-words text-base leading-7 text-muted sm:text-lg sm:leading-8">
          {children}
        </div>
      </div>
    </main>
  );
}
