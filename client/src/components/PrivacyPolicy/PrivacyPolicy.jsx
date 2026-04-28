
import { useTranslation } from 'react-i18next';
import './privacyPolicy.css';
import SEOHead from '../SEO/SEOHead';

export const PrivacyPolicy = () => {
    const { t } = useTranslation();

    return (
        <div className="privacy-policy-container">
            <SEOHead
                title={t('privacyPolicy.meta.title', { defaultValue: 'Политика за поверителност | Pensa Club' })}
                description={t('privacyPolicy.meta.description', { defaultValue: 'Политика за поверителност и защита на лични данни на Pensa Club — как събираме, обработваме и защитаваме информацията на нашите потребители. Съответствие с GDPR.' })}
                keywords={t('privacyPolicy.meta.keywords', { defaultValue: 'политика за поверителност, лични данни, GDPR, защита на данни, Pensa Club' })}
                image="/images/privacy/Privacy_Policy.jpg"
            />
            <h1>{t('privacyPolicy.title')}</h1>

            <section>
                <h2>{t('privacyPolicy.introductionTitle')}</h2>
                <p>{t('privacyPolicy.introductionText')}</p>
            </section>

            <section>
                <h2>{t('privacyPolicy.dataCollectionTitle')}</h2>
                <p>{t('privacyPolicy.dataCollectionText')}</p>
            </section>

            <section>
                <h2>{t('privacyPolicy.dataUseTitle')}</h2>
                <ul>
                    <li>{t('privacyPolicy.dataUseAdmin')}</li>
                    <li>{t('privacyPolicy.dataUsePersonalization')}</li>
                    <li>{t('privacyPolicy.dataUseImprovement')}</li>
                    <li>{t('privacyPolicy.dataUseCommunication')}</li>
                    <li>{t('privacyPolicy.dataUseSupport')}</li>
                </ul>
            </section>

            <section>
                <h2>{t('privacyPolicy.dataSharingTitle')}</h2>
                <ul>
                    <li>{t('privacyPolicy.dataSharingService')}</li>
                    <li>{t('privacyPolicy.dataSharingLaw')}</li>
                    <li>{t('privacyPolicy.dataSharingConsent')}</li>
                </ul>
            </section>

            <section>
                <h2>{t('privacyPolicy.dataProtectionTitle')}</h2>
                <p>{t('privacyPolicy.dataProtectionText')}</p>
            </section>
            <section>
                <h2>{t('privacyPolicy.thirdPartyWebsitesTitle')}</h2>
                <p>{t('privacyPolicy.thirdPartyWebsitesText')}</p>
            </section>
            <section>
                <h2>{t('privacyPolicy.userRightsTitle')}</h2>
                <ul>
                    <li>{t('privacyPolicy.userRightsAccess')}</li>
                    <li>{t('privacyPolicy.userRightsCorrection')}</li>
                    <li>{t('privacyPolicy.userRightsDeletion')}</li>
                    <li>{t('privacyPolicy.userRightsRestriction')}</li>
                    <li>{t('privacyPolicy.userRightsObjection')}</li>
                    <li>{t('privacyPolicy.userRightsPortability')}</li>
                </ul>
            </section>

            <section>
                <h2>{t('privacyPolicy.cookiesTitle')}</h2>
                <p>{t('privacyPolicy.cookiesText1')}</p>
                <p>{t('privacyPolicy.cookiesText2')}</p>
                <p>{t('privacyPolicy.cookiesText3')}</p>
                <p>{t('privacyPolicy.cookiesText4')}</p>
                <p>{t('privacyPolicy.cookiesText5')}</p>
                <p>{t('privacyPolicy.cookiesText6')}</p>
                <p>{t('privacyPolicy.cookiesText7')}</p>
                <p>{t('privacyPolicy.cookiesText8')}</p>
            </section>

            <section>
                <h2>{t('privacyPolicy.policyChangesTitle')}</h2>
                <p>{t('privacyPolicy.policyChangesText')}</p>
            </section>

            <section>
                <h2>{t('privacyPolicy.dataDetailsTitle')}</h2>
                <ul>
                    <li>{t('privacyPolicy.dataDetailsTypes')}</li>
                    <li>{t('privacyPolicy.dataDetailsUse')}</li>
                    <li>{t('privacyPolicy.dataDetailsRetention')}</li>
                </ul>
            </section>

            <section>
                <h2>{t('privacyPolicy.dataDisclosureTitle')}</h2>
                <ul>
                    <li>{t('privacyPolicy.dataDisclosureThirdParties')}</li>
                    <li>{t('privacyPolicy.dataDisclosureLaw')}</li>
                </ul>
            </section>
            <section>
                <h2>{t('privacyPolicy.contactTitle')}</h2>
                <p>{t('privacyPolicy.contactText')}</p>
            </section>
        </div>
    );
};

