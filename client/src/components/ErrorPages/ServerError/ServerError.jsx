import styles from './serverError.css';
import { ErrorPageBase } from '../ErrorPageBase/ErrorPageBase';

export const ServerError = () => {
  return (
    <>
      <div className="bg-server-error">
        <ErrorPageBase
          errorCode="500"
          errorDesc="Сървърът не може да изпълни заявката"
        />
      </div>
    </>
  );
};
