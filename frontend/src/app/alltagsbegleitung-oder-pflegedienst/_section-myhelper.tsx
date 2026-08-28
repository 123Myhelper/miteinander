import { getAlltagsbegleitungPflegedienstContent } from "@/lib/content/alltagsbegleitung-pflegedienst";
import { SectionHeading, SubHeading } from "./_ui";

/**
 * Separation rule for this section: the general statutory explanation and the
 * MyHelper.me-specific paragraph are kept structurally apart. The page informs
 * about § 45a / § 45b SGB XI without claiming — or denying — recognition or
 * reimbursement for MyHelper.me or for any individual helper.
 */
export default function SectionMyHelper() {
  const { entlastungsbetrag, positioning } =
    getAlltagsbegleitungPflegedienstContent();

  return (
    <>
      <SectionHeading>{entlastungsbetrag.heading}</SectionHeading>
      <div className="rounded-2xl border border-primary/15 bg-primary/5 p-6">
        <p className="font-medium text-primary">{entlastungsbetrag.infoLabel}</p>
        <p className="mt-2">{entlastungsbetrag.infoText}</p>
      </div>

      <SubHeading>{entlastungsbetrag.myhelperHeading}</SubHeading>
      <p>{entlastungsbetrag.myhelperText}</p>

      <SectionHeading>{positioning.heading}</SectionHeading>
      <p>{positioning.paragraph1}</p>
      <p>{positioning.paragraph2}</p>
      <p>{positioning.paragraph3}</p>
      <p>{positioning.paragraph4}</p>
    </>
  );
}
