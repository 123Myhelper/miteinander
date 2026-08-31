import Link from "next/link";
import { getAlltagsbegleitungFindenContent } from "@/lib/content/alltagsbegleitung-finden";
import { localizedPath, type AuthorityLocale } from "@/lib/i18n/authority-pages";
import { BulletList, InlineLink, SectionHeading, SubHeading } from "./_ui";

/**
 * Separation rule for this section: the general guidance above and the
 * MyHelper.me-specific block are kept structurally apart. The MyHelper.me block
 * is rendered inside its own bordered container so that platform-specific
 * statements are never read as part of the general guidance, and it describes
 * only verified product behaviour.
 */
export default function SectionVereinbarung({
  locale,
}: {
  locale: AuthorityLocale;
}) {
  const { vereinbarung, wochen, beratung, myhelper } =
    getAlltagsbegleitungFindenContent(locale);

  return (
    <>
      <SectionHeading>{vereinbarung.heading}</SectionHeading>
      <p>{vereinbarung.text}</p>
      <BulletList items={vereinbarung.punkte} />

      <SubHeading>{vereinbarung.rechtHeading}</SubHeading>
      <p>{vereinbarung.rechtText}</p>

      <SectionHeading>{wochen.heading}</SectionHeading>
      <p>{wochen.text}</p>

      <SubHeading>{wochen.guteZeichenHeading}</SubHeading>
      <BulletList items={wochen.guteZeichen} />

      <SubHeading>{wochen.warnzeichenHeading}</SubHeading>
      <BulletList items={wochen.warnzeichen} />
      <p>{wochen.abschlussText}</p>

      <SectionHeading>{beratung.heading}</SectionHeading>
      <p>
        {beratung.textBefore}
        <InlineLink href={localizedPath(locale, "/alltagsbegleitung-oder-pflegedienst")}>
          {beratung.linkLabel}
        </InlineLink>
        {beratung.textAfter}
      </p>
      <p className="text-sm">{beratung.disclaimer}</p>

      <SectionHeading>{myhelper.heading}</SectionHeading>
      <div className="rounded-2xl border border-primary/15 bg-primary/5 p-6">
        <p>{myhelper.paragraph1}</p>
        <p className="mt-4">{myhelper.paragraph2}</p>
        <p className="mt-4">{myhelper.paragraph3}</p>
        <p className="mt-4">{myhelper.paragraph4}</p>
        <p className="mt-4">{myhelper.paragraph5}</p>

        <div className="mt-6 border-t border-primary/15 pt-6">
          <Link
            href={myhelper.ctaPrimaryHref}
            className="inline-flex rounded-xl bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {myhelper.ctaPrimaryLabel}
          </Link>
          <p className="mt-3 text-sm">{myhelper.ctaSupportText}</p>
          <p className="mt-3 text-sm">
            <InlineLink href={myhelper.ctaSecondaryHref}>
              {myhelper.ctaSecondaryLabel}
            </InlineLink>
          </p>
        </div>
      </div>
    </>
  );
}
