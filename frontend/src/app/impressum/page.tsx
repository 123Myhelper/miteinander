'use client';

import Link from "next/link";
import { useTranslation } from "@/context/LanguageContext";

export default function Impressum() {
  const { t } = useTranslation();
  
  return (
    <main className="min-h-screen bg-background py-20">
      <div className="max-w-3xl mx-auto px-6">
        <Link
          href="/"
          className="text-accent hover:text-accent-light transition-colors mb-8 inline-block"
        >
          {t('common.backToHome')}
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-serif text-primary mb-8">
          {t('imprint.title')}
        </h1>

        <div className="prose prose-lg text-muted">
          <h2 className="text-2xl font-serif text-primary mt-8 mb-4">
            {t('imprint.accordingTo')}
          </h2>
          <p>
            Rhoda Fideler
            <br />
            MyHelper
            <br />
            Im Hof 16
            <br />
            88069 Tettnang
          </p>

          <h2 className="text-2xl font-serif text-primary mt-8 mb-4">
            {t('imprint.contact')}
          </h2>
          <p>
            {t('imprint.phone')}: +49 152/09465369
            <br />
            {t('imprint.email')}: info@myhelper.me
          </p>

          <h2 className="text-2xl font-serif text-primary mt-8 mb-4">
            {t('imprint.vatId')}
          </h2>
          <p>
            {t('imprint.vatIdInfo')}:
            <br />
            DE313056089
          </p>

          <h2 className="text-2xl font-serif text-primary mt-8 mb-4">
            {t('imprint.companyPurpose')}
          </h2>
          <p>
            {t('imprint.companyPurposeText')}
          </p>

          <h2 className="text-2xl font-serif text-primary mt-8 mb-4">
            {t('imprint.consumerDispute')}
          </h2>
          <p>
            {t('imprint.consumerDisputeText')}
          </p>

          <h2 className="text-2xl font-serif text-primary mt-8 mb-4">
            {t('imprint.projectDevelopment')}
          </h2>
          <p>
            Atika Solutions
            <br />
            Visions-Architect
          </p>

          <h2 className="text-2xl font-serif text-primary mt-8 mb-4">
            {t('imprint.liabilityNotice')}
          </h2>
          <p>
            {t('imprint.liabilityNoticeText')}
          </p>

          <h2 className="text-2xl font-serif text-primary mt-8 mb-4">
            {t('imprint.legalNotice')}
          </h2>
          <p>
            {t('imprint.legalNoticeText')}
          </p>

          <h2 className="text-2xl font-serif text-primary mt-8 mb-4">
            {t('imprint.imageCredits')}
          </h2>
          <p>
            {t('imprint.imageCreditsText')}
          </p>
        </div>
      </div>
    </main>
  );
}
