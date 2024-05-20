import styles from './serverError.css'
import { ErrorPageBase } from '../ErrorPageBase/ErrorPageBase';

export const ServerError = () => {
  return (
    <>
    <div className="bg-server-error"></div>
    <ErrorPageBase errorCode = "500" errorDesc="Сървърът не може да изпълни заявката"/>
    </>
  );
};
