
import { useTranslation } from 'react-i18next';

export const validateFieldCreateAd = (name, value, t) => {
    console.log(`validateField`, name, value)
    let error = '';
  
    if (!value.trim()) { 
      error = t('ads.required_create_ad') ;
    } else {
      switch (name) {
        case 'summary':
          error = value.length < 2 ? t('ads.summary_min_summary') : 
                  value.length > 32 ? t('ads.summary_max_summary') : '';
          break;
        case 'description':
          error = value.length < 10 ? t('ads.description_min_summary') : '';
          break;
        default:
          break;
      }
    }
  return error
  };