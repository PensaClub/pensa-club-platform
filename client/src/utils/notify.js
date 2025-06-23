/* eslint-disable default-case */
/* eslint-disable no-duplicate-case */
/* eslint-disable no-fallthrough */
import { toast } from 'react-toastify';
import { Trans } from 'react-i18next';

export const notify = (key, error, customMessage = null) => {
  // 🆕 ДОБАВЕНО: Ако има customMessage, използваме него директно
  if (customMessage) {
    switch (key) {
      case 'success':
        toast.success(customMessage, { role: 'alert' });
        return;
      case 'error':
        toast.error(customMessage, { role: 'alert' });
        return;
      case 'warning':
        toast.warning(customMessage, { role: 'alert' });
        return;
      case 'info':
        toast.info(customMessage, { role: 'alert' });
        return;
    }
  }

  // 🔄 ОСТАНАЛАТА ЛОГИКА ОСТАВА СЪЩАТА
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
    case 'success-approved-suggest':
      toast.success(<Trans i18nKey="notification.success-approved-suggest" />, {
        role: 'alert',
      });
      break;
    case 'google-user-not-found':
      toast.error(<Trans i18nKey="notification.google-not-found-user-register" />, {
        role: 'alert',
      });
      break;
    case 'google-user-exists':
      toast.warning(<Trans i18nKey="notification.user-already-exists" />, {
        role: 'alert',
      });
      break;
    case 'errors-register':
      toast.error(<Trans i18nKey="notification.errors-register" />, {
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
    case 'form_contains_errors':
      toast.error(<Trans i18nKey="forms.form_contains_errors" />, {
        role: 'alert',
      });
      break;
    case 'user-already-exists':
      toast.error(<Trans i18nKey="notification.user-already-exists" />, {
        role: 'alert',
      });
      break;
    case 'google-user-not-found':
      toast.warning(<Trans i18nKey="notification.google-user-not-found" />, {
        role: 'alert',
      });
      break;
    case 'user-already-exists-register':
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
      break;
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
    // 🆕 НОВИ CASES:
    case 'invalid-file-type':
      toast.error(<Trans i18nKey="notification.invalid-file-type" />, { role: 'alert' });
      break;
    case 'logo-upload-success':
      toast.success(<Trans i18nKey="notification.logo-upload-success" />, { role: 'alert' });
      break;
    case 'logo-upload-failed':
      toast.error(<Trans i18nKey="notification.logo-upload-failed" />, { role: 'alert' });
      break;
    case 'partner-logo-upload-success':
      toast.success(<Trans i18nKey="notification.partner-logo-upload-success" />, { role: 'alert' });
      break;
    case 'partner-logo-upload-failed':
      toast.error(<Trans i18nKey="notification.partner-logo-upload-failed" />, { role: 'alert' });
      break;
    case 'sponsor-logo-upload-success':
      toast.success(<Trans i18nKey="notification.sponsor-logo-upload-success" />, { role: 'alert' });
      break;
    case 'sponsor-logo-upload-failed':
      toast.error(<Trans i18nKey="notification.sponsor-logo-upload-failed" />, { role: 'alert' });
      break;
    case 'documents-upload-failed':
      toast.error(<Trans i18nKey="notification.documents-upload-failed" />, { role: 'alert' });
      break;
    case 'opening-pdf':
      toast.info(<Trans i18nKey="notification.opening-pdf" />, { role: 'alert' });
      break;
    case 'no-images-uploaded':
      toast.error(<Trans i18nKey="notification.no-images-uploaded" />, { role: 'alert' });
      break;
    case 'images-upload-error':
      toast.error(<Trans i18nKey="notification.images-upload-error" />, { role: 'alert' });
      break;
    case 'some-images-failed':
      toast.error(<Trans i18nKey="notification.some-images-failed" />, { role: 'alert' });
      break;
    case 'all-images-deleted':
      toast.success(<Trans i18nKey="notification.all-images-deleted" />, { role: 'alert' });
      break;
    case 'images-delete-error':
      toast.error(<Trans i18nKey="notification.images-delete-error" />, { role: 'alert' });
      break;
    case 'contact-image-upload-success':
      toast.success(<Trans i18nKey="notification.contact-image-upload-success" />, { role: 'alert' });
      break;
    case 'contact-image-upload-failed':
      toast.error(<Trans i18nKey="notification.contact-image-upload-failed" />, { role: 'alert' });
      break;
    case 'invalid-image-file-type':
      toast.error(<Trans i18nKey="notification.invalid-image-file-type" />, { role: 'alert' });
      break;
    case 'contact-image-removed':
      toast.success(<Trans i18nKey="notification.contact-image-removed" />, { role: 'alert' });
      break;
    case 'logo-removed':
      toast.success(<Trans i18nKey="notification.logo-removed" />, { role: 'alert' });
      break;
    case 'no-valid-images':
      toast.error(<Trans i18nKey="notification.no-valid-images" />, { role: 'alert' });
      break;
    case 'gallery-upload-error':
      toast.error(<Trans i18nKey="notification.gallery-upload-error" />, { role: 'alert' });
      break;
    case 'localstorage-save-failed':
      toast.warning(<Trans i18nKey="notification.localstorage-save-failed" />, { role: 'alert' });
      break;
    case 'document-removed':
      toast.success(<Trans i18nKey="notification.document-removed" />, { role: 'alert' });
      break;
    case 'all-images-removed':
      toast.success(<Trans i18nKey="notification.all-images-removed" />, { role: 'alert' });
      break;
    case 'image-removed':
      toast.success(<Trans i18nKey="notification.image-removed" />, { role: 'alert' });
      break;
    case 'data-processing-error':
      toast.error(<Trans i18nKey="notification.data-processing-error" />, { role: 'alert' });
      break;
    case 'draft-saved-both':
      toast.success(<Trans i18nKey="notification.draft-saved-both" />, { role: 'alert' });
      break;
    case 'draft-saved-browser':
      toast.success(<Trans i18nKey="notification.draft-saved-browser" />, { role: 'alert' });
      break;
    case 'draft-saved-browser-only':
      toast.warning(<Trans i18nKey="notification.draft-saved-browser-only" />, { role: 'alert' });
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