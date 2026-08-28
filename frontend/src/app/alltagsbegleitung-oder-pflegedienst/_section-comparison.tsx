import { getAlltagsbegleitungPflegedienstContent } from "@/lib/content/alltagsbegleitung-pflegedienst";
import { SectionHeading, SubHeading } from "./_ui";

export default function SectionComparison() {
  const { comparison, boundaries, escalation, combination } =
    getAlltagsbegleitungPflegedienstContent();

  return (
    <>
      <SectionHeading>{comparison.heading}</SectionHeading>
      <div className="my-6 overflow-x-auto">
        <table className="w-full min-w-[38rem] border-collapse text-left text-base">
          <thead>
            <tr className="border-b border-primary/20">
              <th scope="col" className="py-3 pr-4 font-serif text-primary">
                <span className="sr-only">{comparison.columnFeature}</span>
              </th>
              <th scope="col" className="py-3 pr-4 font-serif text-primary">
                {comparison.columnBegleitung}
              </th>
              <th scope="col" className="py-3 font-serif text-primary">
                {comparison.columnPflegedienst}
              </th>
            </tr>
          </thead>
          <tbody>
            {comparison.rows.map((row) => (
              <tr
                key={row.label}
                className="border-b border-primary/10 align-top"
              >
                <th
                  scope="row"
                  className="py-4 pr-4 text-left font-medium text-primary"
                >
                  {row.label}
                </th>
                <td className="py-4 pr-4">{row.begleitung}</td>
                <td className="py-4">{row.pflegedienst}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionHeading>{boundaries.heading}</SectionHeading>
      <p>{boundaries.text}</p>

      <SectionHeading>{escalation.heading}</SectionHeading>
      <p>{escalation.text}</p>

      <SubHeading>{escalation.adviceHeading}</SubHeading>
      <p>{escalation.adviceText}</p>
      <p className="text-sm">{escalation.disclaimer}</p>

      <SectionHeading>{combination.heading}</SectionHeading>
      <p>{combination.text}</p>
    </>
  );
}
