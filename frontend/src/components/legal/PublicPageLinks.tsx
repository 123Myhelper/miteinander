"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/context/LanguageContext";

/**
 * Cross-links between the public pages.
 *
 * Without this row the legal, FAQ and imprint pages are link-graph dead ends:
 * one link in from the homepage footer, one link back out, nothing else. Shared
 * by LegalPageLayout and by the imprint page, which uses its own layout.
 */
export default function PublicPageLinks() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const pages = [
    { href: "/", label: t("common.home") },
    {
      href: "/alltagsbegleitung-oder-pflegedienst",
      label: t("footer.guideAlltagsbegleitung"),
    },
    { href: "/faq", label: t("footer.faq") },
    { href: "/impressum", label: t("footer.imprint") },
    { href: "/datenschutz", label: t("footer.privacy") },
    { href: "/agb", label: t("footer.terms") },
  ].filter((page) => page.href !== pathname);

  return (
    <nav
      aria-label={t("footer.quickLinks")}
      className="mt-16 border-t border-primary/10 pt-6"
    >
      <h2 className="mb-3 text-sm font-medium text-primary">
        {t("footer.quickLinks")}
      </h2>
      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {pages.map((page) => (
          <li key={page.href}>
            <Link
              href={page.href}
              className="rounded-md text-accent transition-colors hover:text-accent-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              {page.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
