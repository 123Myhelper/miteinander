import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { createPublicMetadata, SITE_URL } from "@/lib/seo";
import { getAlltagsbegleitungPflegedienstContent } from "@/lib/content/alltagsbegleitung-pflegedienst";
import SectionBasics from "./_section-basics";
import SectionComparison from "./_section-comparison";
import SectionMyHelper from "./_section-myhelper";

const PAGE_PATH = "/alltagsbegleitung-oder-pflegedienst";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const content = getAlltagsbegleitungPflegedienstContent();

/**
 * "Ist MyHelper.me ein Pflegedienst?" is a direct question about the platform
 * itself, so /faq is the canonical owner of that Question entity. Carrying it in
 * this page's FAQPage graph as well would put two URLs forward for one entity,
 * so it is excluded here. The visible Q&A deliberately stays on the page: the
 * surrounding comparison is exactly where a reader might otherwise infer that
 * MyHelper.me provides care itself.
 *
 * Keyed to the question text rather than to an index, because the exclusion
 * exists on account of that exact wording; an index would silently exclude the
 * wrong item if the FAQ list were ever reordered.
 */
const FAQ_QUESTION_OWNED_BY_FAQ_PAGE = "Ist MyHelper.me ein Pflegedienst?";

const faqSchemaItems = content.faq.items.filter(
  (item) => item.question !== FAQ_QUESTION_OWNED_BY_FAQ_PAGE,
);

export const metadata = createPublicMetadata({
  title: content.meta.title,
  description: content.meta.description,
  path: PAGE_PATH,
});

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: content.meta.title,
      description: content.meta.description,
      inLanguage: "de",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      publisher: { "@id": `${SITE_URL}/#organization` },
      breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
      about: [
        { "@type": "Thing", name: content.meta.aboutAlltagsbegleitung },
        { "@type": "Thing", name: content.meta.aboutSupport },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: content.meta.breadcrumbHome,
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: content.meta.breadcrumbCurrent,
          item: PAGE_URL,
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      inLanguage: "de",
      isPartOf: { "@id": `${PAGE_URL}#webpage` },
      // Built from the visible FAQ section's own items, minus the single entity
      // owned by /faq, so the structured data stays a subset of what a visitor
      // can see and never describes text that is not on the page.
      mainEntity: faqSchemaItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ],
};

export default function AlltagsbegleitungOderPflegedienstPage() {
  const { meta, faq, related } = content;

  return (
    <>
      <JsonLd data={structuredData} />

      <main className="min-h-screen overflow-x-hidden bg-background py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <nav aria-label={meta.breadcrumbLabel} className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <li>
                <Link
                  href="/"
                  className="rounded-md text-accent transition-colors hover:text-accent-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  {meta.breadcrumbHome}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">{meta.breadcrumbCurrent}</li>
            </ol>
          </nav>

          <h1 className="mb-8 break-words font-serif text-3xl text-primary sm:text-4xl md:text-5xl">
            {meta.heading}
          </h1>

          <div className="space-y-4 break-words text-base leading-7 text-muted sm:text-lg sm:leading-8">
            <SectionBasics />
            <SectionComparison />
            <SectionMyHelper />

            <h2 className="mb-4 mt-12 font-serif text-2xl text-primary sm:text-3xl">
              {faq.heading}
            </h2>
            <div className="space-y-8">
              {faq.items.map((item) => (
                <section key={item.question}>
                  <h3 className="mb-3 font-serif text-xl text-primary">
                    {item.question}
                  </h3>
                  <p>{item.answer}</p>
                </section>
              ))}
            </div>

            <h2 className="mb-4 mt-12 font-serif text-2xl text-primary sm:text-3xl">
              {related.heading}
            </h2>
            <ul className="space-y-2">
              {related.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded-md text-accent transition-colors hover:text-accent-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
