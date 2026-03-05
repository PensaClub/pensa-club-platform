export const validateFieldCreateAd = (name, value, t) => {
  let error = '';

  // Проверка дали стойността е празна
  if (value === undefined || value === null || value.trim() === '') {
    error = t('ads.required_create_ad');
  } else {
    switch (name) {
      case 'summary':
        error = value.length < 2 ? t('ads.summary_min_summary') :
          value.length > 32 ? t('ads.summary_max_summary') : '';
        break;
      case 'description':
        error = value.length < 10 ? t('ads.description_min_summary') : '';
        break;
      case 'last_name':
        error = value.length < 2 ? t('ads.last_name_min')
          : value.length > 32
            ? t('ads.last_name_max')
            : '';
        break;
      case 'first_name':
        error = value.length < 2 ? t('ads.first_name_min')
          : value.length > 32
            ? t('ads.first_name_max')
            : '';
        break;
      case 'email':
    
        // eslint-disable-next-line no-useless-escape
        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        error = !emailRegex.test(value) ? t('ads.email') : '';
        break;
      case 'price':
       
        error = isNaN(value) ? t('ads.invalid_price') : (value < 0 ? t('ads.negative_price') : '');
        break;
      case 'ad_address':
        error = value.length < 6 ? t('ads.address_min')
          : value.length > 50 ? t('ads.address_max') : '';
        break;
      default:
        break;
    }
  }
  return error;
};
