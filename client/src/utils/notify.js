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
    case 'success-delete-message':
      toast.success(<Trans i18nKey="notification.success-delete-message" />, {
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
    case 'success-password-change':
      toast.success(<Trans i18nKey="notification.success-password-change" />, {
        role: 'alert',
      });
      break;
    case 'ad-approved':
      toast.success(<Trans i18nKey="notification.ad-approved" />, {
        role: 'alert',
      });
      break;
    case 'success-role-change to':
      toast.success(<Trans i18nKey="notification.success-role-change to" />, {
        role: 'alert',
      });
      break;
    case 'ad-reject':
      toast.success(<Trans i18nKey="notification.ad-reject" />, {
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
    case 'password-change-same-passwords':
      toast.error(<Trans i18nKey="notification.password-change-same-passwords" />, {
        role: 'alert',
      });
      break;
    case 'password-change-old-invalid':
      toast.error(<Trans i18nKey="notification.password-change-old-invalid" />, {
        role: 'alert',
      });
      break;
    case 'password-change-repeat-invalid':
      toast.error(<Trans i18nKey="notification.password-change-repeat-invalid" />, {
        role: 'alert',
      });
      break;
    case 'password-change-email-invalid':
      toast.error(<Trans i18nKey="notification.password-change-email-invalid" />, {
        role: 'alert',
      });
      break;
    case 'subscriber-exists':
      toast.error(<Trans i18nKey="notification.subscriber-exists" />, {
        role: 'alert',
      });
    case 'subscribe-username-length':
      toast.error(<Trans i18nKey="notification.subscribe-username-length" />, {
        role: 'alert',
      });
      break;
    case 'subscribe-username-content':
      toast.error(<Trans i18nKey="notification.subscribe-username-content" />, {
        role: 'alert',
      });
      break;
    case 'error':
      if (error?.message === 'Your session has expired. Please log in again.'
        || error?.message === "Something went wrong! JsonWebTokenError: jwt malformed"
        || error?.message === 'Unauthorized') {
        toast.error(<Trans i18nKey="notification.session-expired" />, {
          role: 'alert',
        });
        break;
      }
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
