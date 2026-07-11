'use client';

import { useTranslation } from "@/context/LanguageContext";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export default function AGB() {
  const { t } = useTranslation();
  
  return (
    <LegalPageLayout title={t('terms.title')}>
      <div className="space-y-6">
        <h2 className="text-2xl font-serif text-primary mt-8 mb-4">
          {t('terms.scope')}
        </h2>
        <p>
          {t('terms.scopeText')}
        </p>

        <h2 className="text-2xl font-serif text-primary mt-8 mb-4">
          {t('terms.contractPartner')}
        </h2>
        <p>
          {t('terms.contractPartnerText')}
          <br />
          <br />
          Rhoda Fideler
          <br />
          MyHelper
          <br />
          Im Hof 16
          <br />
          88069 Tettnang
        </p>

        <h2 className="text-2xl font-serif text-primary mt-8 mb-4">
          {t('terms.serviceDescription')}
        </h2>
        <p>
          {t('terms.serviceDescriptionText')}
        </p>

        <h2 className="text-2xl font-serif text-primary mt-8 mb-4">
          {t('terms.registration')}
        </h2>
        <p>
          {t('terms.registrationText')}
        </p>

        <h2 className="text-2xl font-serif text-primary mt-8 mb-4">
          {t('terms.subscription')}
        </h2>
        <p>
          {t('terms.subscriptionText')}
        </p>

        <h2 className="text-2xl font-serif text-primary mt-8 mb-4">
          {t('terms.liability')}
        </h2>
        <p>
          {t('terms.liabilityText')}
        </p>
      </div>
    </LegalPageLayout>
  );
}
