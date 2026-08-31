import { getAlltagsbegleitungPflegedienstContent } from "@/lib/content/alltagsbegleitung-pflegedienst";
import type { AuthorityLocale } from "@/lib/i18n/authority-pages";
import { BulletList, SectionHeading, SubHeading } from "./_ui";

export default function SectionBasics({
  locale,
}: {
  locale: AuthorityLocale;
}) {
  const { intro, alltagsbegleitung, pflegedienst } =
    getAlltagsbegleitungPflegedienstContent(locale);

  return (
    <>
      <div className="rounded-2xl border border-accent/20 bg-accent/5 p-6">
        <p className="font-medium text-primary">{intro.label}</p>
        <p className="mt-2">{intro.text}</p>
      </div>

      <SectionHeading>{alltagsbegleitung.heading}</SectionHeading>
      <p>{alltagsbegleitung.paragraph1}</p>
      <p>{alltagsbegleitung.paragraph2}</p>

      <SubHeading>{alltagsbegleitung.tasksHeading}</SubHeading>
      <BulletList items={alltagsbegleitung.tasks} />

      <SubHeading>{alltagsbegleitung.qualificationHeading}</SubHeading>
      <p>{alltagsbegleitung.qualificationText}</p>

      <SectionHeading>{pflegedienst.heading}</SectionHeading>
      <p>{pflegedienst.text}</p>

      <SubHeading>{pflegedienst.tasksHeading}</SubHeading>
      <BulletList items={pflegedienst.tasks} />
    </>
  );
}
