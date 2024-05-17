import './notFound.css';
import { ErrorPageBase } from '../ErrorPageBase/ErrorPageBase';

export const NotFound = () => {
  return (
    <ErrorPageBase errorCode = "404" errorDesc="Не съществува такава страница"/>
  );
};
