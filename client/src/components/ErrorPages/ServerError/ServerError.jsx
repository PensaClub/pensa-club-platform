import { ErrorPageBase } from '../ErrorPageBase/ErrorPageBase';
import { useTranslation } from "react-i18next";

export const ServerError = () => {
  const {t} = useTranslation();
  return (
    <>
      <div className="bg-server-error">
        <ErrorPageBase
          errorCode="500"
          errorDesc={t('error-page.500-desc')}
        />
      </div>
    </>
  );
};
