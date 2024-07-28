/* eslint-disable no-duplicate-case */
/* eslint-disable no-fallthrough */
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
      case 'warn-address':
        toast.success(<Trans i18nKey="notification.warn-address" />, {
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
    case 'success-delete-ads':
      toast.success(<Trans i18nKey="notification.success-delete-ads" />, {
        role: 'alert',
      });
      break;
    case 'success-delete-suggest':
      toast.success(<Trans i18nKey="notification.success-delete-suggest" />, {
        role: 'alert',
      });
      break;
    case 'success-edit-ads':
      toast.success(<Trans i18nKey="notification.success-edit-ads" />, {
        role: 'alert',
      });
      break;
    case 'success-suggest':
      toast.success(<Trans i18nKey="notification.success-suggested" />, {
        role: 'alert',
      });
      break;
    case 'success-approved':
      toast.success(<Trans i18nKey="notification.success-approved" />, {
        role: 'alert',
      });
      break;
    case 'success-reject':
      toast.success(<Trans i18nKey="notification.success-reject" />, {
        role: 'alert',
      });
      break;
    case 'enter-comment':
      toast.error(<Trans i18nKey="notification.enter-comment" />, {
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
