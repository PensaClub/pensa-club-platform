import { toast } from 'react-toastify';
import { Trans } from 'react-i18next';

export const notify = (key) => {
  // eslint-disable-next-line default-case
  switch (key) {
    case 'success-data':
      toast.success(<Trans i18nKey="notification.success-data" />, {
        role: 'alert',
      });
      break;
    case 'email-send':
      toast.success(<Trans i18nKey="notification.email-send" />, {
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
      
    case 'success-created':
        toast.success(<Trans i18nKey="notification.success-created" />, {
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
