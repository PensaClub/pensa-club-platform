import './notFound.css';

import { ErrorPageBase } from '../ErrorPageBase/ErrorPageBase';
import { useTranslation } from "react-i18next";

export const NotFound = () => {
  const {t} = useTranslation();
  return (
    <>
    <section className="bg-not-found">
      <ErrorPageBase
        errorCode="404"
        errorDesc={t('error-page.404-desc')}
      />
      </section>
    </>
  );
};
