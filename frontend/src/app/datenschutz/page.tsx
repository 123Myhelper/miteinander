'use client';

import Link from "next/link";
import { useTranslation } from "@/context/LanguageContext";

export default function Datenschutz() {
  const { t } = useTranslation();

  const sections = [
    'scope',
    'dataCategories',
    'legalBases',
    'hosting',
    'serverLogs',
    'accounts',
    'sensitiveData',
    'authentication',
    'profiles',
    'communication',
    'emailDelivery',
    'payments',
    'cookiesAndStorage',
    'localStorage',
    'fonts',
    'thirdPartyServices',
    'googleAnalytics',
    'googleAds',
    'metaPixel',
    'hotjar',
    'googleMaps',
    'youtube',
    'recipients',
    'internationalTransfers',
    'retention',
    'security',
    'rights',
    'withdrawalAndObjection',
    'complaint',
    'automatedDecisionMaking',
    'policyUpdates',
  ] as const;
  
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
          {t('privacy.title')}
        </h1>

        <div className="prose prose-lg text-muted space-y-6">
          <h2 className="text-2xl font-serif text-primary mt-8 mb-4">
            {t('privacy.controller')}
          </h2>
          <p>
            {t('privacy.controllerText')}
          </p>
          <p>
            Rhoda Fideler
            <br />
            MyHelper
            <br />
            Im Hof 16
            <br />
            88069 Tettnang
          </p>
          <p>
            {t('imprint.phone')}: +49 152 09465369
            <br />
            {t('imprint.email')}: info@myhelper.me
          </p>

          {sections.map((section) => (
            <section key={section}>
              <h2 className="text-2xl font-serif text-primary mt-8 mb-4">
                {t(`privacy.${section}`)}
              </h2>
              <p>
                {t(`privacy.${section}Text`)}
              </p>
            </section>
          ))}

          <p>
            {t('privacy.lastUpdated')}
          </p>
        </div>
      </div>
    </main>
  );
}
