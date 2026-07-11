'use client';

import { useTranslation } from "@/context/LanguageContext";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

const questionNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export default function FAQPage() {
  const { t } = useTranslation();

  return (
    <LegalPageLayout title={t('faq.title')}>
      <p>{t('faq.intro')}</p>

      <div className="space-y-8">
        {questionNumbers.map((number) => (
          <section key={number}>
            <h2 className="mb-3 font-serif text-2xl text-primary">
              {t(`faq.question${number}`)}
            </h2>
            <p>{t(`faq.answer${number}`)}</p>
          </section>
        ))}
      </div>
    </LegalPageLayout>
  );
}
