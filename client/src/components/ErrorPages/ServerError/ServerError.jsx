import { ErrorPageBase } from '../ErrorPageBase/ErrorPageBase';

export const ServerError = () => {
  return (
    <ErrorPageBase errorCode = "500" errorDesc="Сървърна грешка"/>
  );
};
