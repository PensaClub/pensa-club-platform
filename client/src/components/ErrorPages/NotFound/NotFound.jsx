import './notFound.css';
import { ErrorPageBase } from '../ErrorPageBase/ErrorPageBase';

export const NotFound = () => {
  return (
    <>
    <div className="bg-not-found"></div>
      <ErrorPageBase
        errorCode="404"
        errorDesc="Не съществува такава страница"
      />
    </>
  );
};
