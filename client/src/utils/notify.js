import { toast } from 'react-toastify';
import { Trans } from 'react-i18next';

export const notify = (key) => {
  switch (key) {
    case 'success-data':
      toast.success(<Trans i18nKey="notification.success-data" />, {
        role: 'alert',
      });
      break;
    case 'success-register':
      toast.success(<Trans i18nKey="notification.success-register" />, {
        role: 'alert',
      });
      break;
    case 'success-login':
      toast.success(<Trans i18nKey="notification.success-login" />, {
        role: 'alert',
      });
      break;
    case 'success-logout':
      toast.success(<Trans i18nKey="notification.success-logout" />, {
        role: 'alert',
      });
      break;

    case 'error':
      toast.error(<Trans i18nKey="notification.error" />, {
        role: 'alert',
      });
      break;
  }
};
