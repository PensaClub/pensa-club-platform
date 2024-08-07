/* eslint-disable no-duplicate-case */
/* eslint-disable no-fallthrough */
import { toast } from 'react-toastify';
import { Trans } from 'react-i18next';

export const notify = (key, error) => {
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
    case 'success-delete-user':
      toast.success(<Trans i18nKey="notification.success-delete-user" />, {
        role: 'alert',
      });
      break;
    case 'success_delete_message':
      toast.success(<Trans i18nKey="notification.success_delete_message" />, {
        role: 'alert',
      });
      break;
    case 'success-comment':
      toast.success(<Trans i18nKey="notification.success-comment" />, {
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
    case 'success-role-change to':
      toast.success(<Trans i18nKey="notification.success-role-change to" />, {
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
    case 'finish-profile':
      toast.error(<Trans i18nKey="notification.finish-profile" />, {
        role: 'alert',
      });
      break;
    case 'user-already-exists':
      toast.error(<Trans i18nKey="notification.user-already-exists" />, {
        role: 'alert',
      });
      break;
    case 'username-is-taken':
      let username;
      const errorIndex = error?.details.findIndex(error => error.field === 'username');
      if (error?.details[errorIndex]?.value) {
        username = error?.details[errorIndex]?.value + " "
      }
      else {
        username = ""
      }
      toast.error(<Trans i18nKey="notification.username-is-taken" values={{ username }} />, {
        role: 'alert',
      });
      break;
    case 'error':
      toast.error(<Trans i18nKey="notification.error" />, {
        role: 'alert',
      });
      break;
    case 'error-authorize':
      toast.error(<Trans i18nKey="notification.error-authorize" />, {
        role: 'alert',
      });
      break;
  }
};
