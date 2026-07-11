'use client';

import { useTranslation } from "@/context/LanguageContext";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

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
    <LegalPageLayout title={t('privacy.title')}>
      <div className="space-y-6">
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
    </LegalPageLayout>
  );
}
