import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { localePath } from '../../utils/languageUtils';

export const LocalizedLink = ({ to, ...props }) => {
  const { i18n } = useTranslation();
  const localizedTo = typeof to === 'string' ? localePath(to, i18n.language) : to;
  return <Link to={localizedTo} {...props} />;
};

export const LocalizedNavLink = ({ to, ...props }) => {
  const { i18n } = useTranslation();
  const localizedTo = typeof to === 'string' ? localePath(to, i18n.language) : to;
  return <NavLink to={localizedTo} {...props} />;
};
