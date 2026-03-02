import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import i18n from '../i18n';
import { localePath } from '../utils/languageUtils';

export function useLocalizedNavigate() {
  const navigate = useNavigate();

  return useCallback((to, options) => {
    if (typeof to === 'string') {
      navigate(localePath(to, i18n.language), options);
    } else {
      navigate(to, options);
    }
  }, [navigate]);
}
