import { getAlltagsbegleitungFindenContent } from "@/lib/content/alltagsbegleitung-finden";
import { BulletList, InlineLink, SectionHeading, SubHeading } from "./_ui";

export default function SectionWege() {
  const { wege, gespraech } = getAlltagsbegleitungFindenContent();

  return (
    <>
      <SectionHeading>{wege.heading}</SectionHeading>
      <p>{wege.text}</p>

      <SubHeading>{wege.beratungHeading}</SubHeading>
      <p>{wege.beratungText}</p>

      <SubHeading>{wege.landesrechtHeading}</SubHeading>
      <p>
        {wege.landesrechtTextBefore}
        <InlineLink href="/alltagsbegleitung-oder-pflegedienst">
          {wege.landesrechtLinkLabel}
        </InlineLink>
        {wege.landesrechtTextAfter}
      </p>

      <SubHeading>{wege.verbaendeHeading}</SubHeading>
      <p>{wege.verbaendeText}</p>

      <SubHeading>{wege.umfeldHeading}</SubHeading>
      <p>{wege.umfeldText}</p>

      <SubHeading>{wege.plattformenHeading}</SubHeading>
      <p>{wege.plattformenText}</p>

      <SectionHeading>{gespraech.heading}</SectionHeading>
      <p>{gespraech.text}</p>

      <SubHeading>{gespraech.personHeading}</SubHeading>
      <BulletList items={gespraech.personFragen} />

      <SubHeading>{gespraech.aufgabenHeading}</SubHeading>
      <BulletList items={gespraech.aufgabenFragen} />

      <SubHeading>{gespraech.verlaesslichkeitHeading}</SubHeading>
      <BulletList items={gespraech.verlaesslichkeitFragen} />

      <SubHeading>{gespraech.eindruckHeading}</SubHeading>
      <p>{gespraech.eindruckText}</p>
    </>
  );
}
