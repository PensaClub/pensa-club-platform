import './notFound.css';
import { ErrorPageBase } from '../ErrorPageBase/ErrorPageBase';

export const NotFound = () => {
  return (
    <>
    <section className="bg-not-found">
      <ErrorPageBase
        errorCode="404"
        errorDesc="Не съществува такава страница"
      />
      </section>
    </>
  );
};
