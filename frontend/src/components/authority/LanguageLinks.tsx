import Link from "next/link";
import {
  AUTHORITY_LOCALES,
  LANGUAGE_ENDONYM,
  localizedPath,
  type AuthorityLocale,
  type BasePath,
} from "@/lib/i18n/authority-pages";

/**
 * Visible DE / EN / FR links for the editorial authority pages.
 *
 * Deliberately separate from the site-wide `LanguageSwitcher`: that component is
 * a client control that swaps text at one URL, which cannot move a visitor
 * between the server-rendered language versions these pages have. This one is a
 * plain server-rendered set of links, used only by the authority routes, and it
 * leaves the global switcher untouched.
 */
export default function LanguageLinks({
  locale,
  basePath,
  label,
}: {
  locale: AuthorityLocale;
  basePath: BasePath;
  label: string;
}) {
  return (
    <nav aria-label={label} className="mb-8">
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
        {AUTHORITY_LOCALES.map((candidate) => (
          <li key={candidate}>
            {candidate === locale ? (
              <span aria-current="true" className="font-medium text-primary">
                {LANGUAGE_ENDONYM[candidate]}
              </span>
            ) : (
              <Link
                href={localizedPath(candidate, basePath)}
                hrefLang={candidate}
                className="rounded-md text-accent transition-colors hover:text-accent-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                {LANGUAGE_ENDONYM[candidate]}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
