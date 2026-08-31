import { getAlltagsbegleitungFindenContent } from "@/lib/content/alltagsbegleitung-finden";
import { localizedPath, type AuthorityLocale } from "@/lib/i18n/authority-pages";
import { BulletList, InlineLink, SectionHeading, SubHeading } from "./_ui";

export default function SectionBedarf({ locale }: { locale: AuthorityLocale }) {
  const { intro, bedarf } = getAlltagsbegleitungFindenContent(locale);

  return (
    <>
      <div className="rounded-2xl border border-accent/20 bg-accent/5 p-6">
        <p className="font-medium text-primary">{intro.label}</p>
        <p className="mt-2">{intro.text}</p>
      </div>

      <SectionHeading>{bedarf.heading}</SectionHeading>
      <p>{bedarf.text}</p>

      <SubHeading>{bedarf.fragenHeading}</SubHeading>
      <BulletList items={bedarf.fragen} />
      <p>{bedarf.notizenText}</p>

      <SubHeading>{bedarf.entscheidungHeading}</SubHeading>
      <p>{bedarf.entscheidungText}</p>

      <SubHeading>{bedarf.grenzeHeading}</SubHeading>
      <p>
        {bedarf.grenzeTextBefore}
        <InlineLink href={localizedPath(locale, "/alltagsbegleitung-oder-pflegedienst")}>
          {bedarf.grenzeLinkLabel}
        </InlineLink>
        {bedarf.grenzeTextAfter}
      </p>
    </>
  );
}
