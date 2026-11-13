'use client';

import Link from "next/link";
import { localizedPath, type BasePath } from "@/lib/i18n/authority-pages";
import { useTranslation } from "@/context/LanguageContext";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import JsonLd from "@/components/JsonLd";

const questionNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

const guidePaths: Partial<Record<number, BasePath>> = {
  3: "/alltagsbegleitung-finden",
  7: "/alltagsbegleitung-oder-pflegedienst",
};

export default function FAQPage() {
  const { locale, t } = useTranslation();
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questionNumbers.map((number) => ({
      "@type": "Question",
      name: t(`faq.question${number}`),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`faq.answer${number}`),
      },
    })),
  };

  return (
    <>
      <JsonLd data={faqStructuredData} />
      <LegalPageLayout title={t('faq.title')}>
        <p>{t('faq.intro')}</p>

        <div className="space-y-8">
          {questionNumbers.map((number) => {
            const guidePath = guidePaths[number];
            return (
              <section key={number}>
                <h2 className="mb-3 font-serif text-2xl text-primary">
                  {t(`faq.question${number}`)}
                </h2>
                <p>{t(`faq.answer${number}`)}</p>
                {guidePath && (
                  <Link className="text-accent underline" href={localizedPath(locale, guidePath)} hrefLang={locale}>
                    {t(`faq.guide${number}`)}
                  </Link>
                )}
              </section>
            );
          })}
        </div>
      </LegalPageLayout>
    </>
  );
}
