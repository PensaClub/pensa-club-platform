// SeminarEmailModal.jsx — prefix: asst-email-
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademyCourses } from '../../contexts/AcademyCoursesProvider';
import { X, Send, Mail, Paperclip } from 'lucide-react';
import StorageFilePicker from '../../SiteSettingsAdmin/CloudStorageManager/StorageFilePicker';

const SeminarEmailModal = ({ recipient, onClose }) => {
  const { t } = useTranslation('academy-admin');
  const { sendSeminarEmail } = useAcademyCourses();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);

  const MAX_MESSAGE = 2000;

  // ESC & body scroll lock
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape' && !sending) onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [sending, onClose]);

  const handleBackdrop = useCallback((e) => {
    if (e.target.classList.contains('asst-email-overlay')) onClose();
  }, [onClose]);

  const validate = () => {
    const errs = {};
    if (!subject.trim()) errs.subject = t('seminarStats.email.subjectRequired', 'Въведете тема');
    else if (subject.trim().length < 3) errs.subject = t('seminarStats.email.subjectShort', 'Темата е твърде кратка');
    if (!message.trim()) errs.message = t('seminarStats.email.messageRequired', 'Въведете съобщение');
    else if (message.trim().length < 10) errs.message = t('seminarStats.email.messageShort', 'Съобщението е твърде кратко');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSend = async () => {
    if (!validate()) return;
    setSending(true);
    try {
      await sendSeminarEmail({
        to: recipient.email,
        recipientName: recipient.name,
        subject: subject.trim(),
        message: message.trim(),
      });
      onClose();
    } catch {
      // toast is handled in provider
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = ({ filePath, fileName, url }) => {
    setAttachedFiles(prev => [...prev, { filePath, fileName, url }]);
    const link = `\n\n📎 Файл: ${fileName}\n${url}`;
    setMessage(prev => prev + link);
    setShowFilePicker(false);
  };

  const removeAttachedFile = (index) => {
    const file = attachedFiles[index];
    const link = `\n\n📎 Файл: ${file.fileName}\n${file.url}`;
    setMessage(prev => prev.replace(link, ''));
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const templates = [
    {
      label: t('seminarStats.email.tplReminder', 'Напомняне'),
      subject: t('seminarStats.email.tplReminderSubject', 'Напомняне за предстоящ семинар'),
      message: t('seminarStats.email.tplReminderMsg', 'Здравейте,\n\nНапомняме ви за предстоящия семинар. Очакваме ви!\n\nАко имате въпроси, не се колебайте да се свържете с нас.'),
    },
    {
      label: t('seminarStats.email.tplThanks', 'Благодарност'),
      subject: t('seminarStats.email.tplThanksSubject', 'Благодарим за участието'),
      message: t('seminarStats.email.tplThanksMsg', 'Здравейте,\n\nБлагодарим ви за участието в семинара! Надяваме се, че беше полезен.\n\nОчакваме ви отново в DigiBridge Academy!'),
    },
    {
      label: t('seminarStats.email.tplInfo', 'Информация'),
      subject: t('seminarStats.email.tplInfoSubject', 'Информация от DigiBridge Academy'),
      message: t('seminarStats.email.tplInfoMsg', 'Здравейте,\n\n'),
    },
  ];

  if (!recipient) return null;

  return (
    <div className="asst-email-overlay" onClick={handleBackdrop}>
      <div className="asst-email-modal">
        {/* Header */}
        <div className="asst-email-header">
          <div className="asst-email-header-left">
            <Mail size={20} />
            <h3>{t('seminarStats.email.title', 'Изпращане на имейл')}</h3>
          </div>
          <button className="asst-email-close" onClick={onClose} disabled={sending}>
            <X size={20} />
          </button>
        </div>

        {/* Recipient */}
        <div className="asst-email-recipient">
          <span className="asst-email-recipient-label">{t('seminarStats.email.to', 'До')}:</span>
          <div className="asst-email-recipient-info">
            <div className="asst-email-avatar">
              {(recipient.name || '?')[0].toUpperCase()}
            </div>
            <div>
              <div className="asst-email-recipient-name">{recipient.name}</div>
              <div className="asst-email-recipient-email">{recipient.email}</div>
            </div>
          </div>
        </div>

        {/* Templates */}
        <div className="asst-email-templates">
          <span className="asst-email-templates-label">{t('seminarStats.email.templates', 'Шаблони')}:</span>
          <div className="asst-email-templates-btns">
            {templates.map((tpl, i) => (
              <button
                key={i}
                className="asst-email-tpl-btn"
                onClick={() => { setSubject(tpl.subject); setMessage(tpl.message); setErrors({}); }}
                disabled={sending}
              >{tpl.label}</button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div className="asst-email-field">
          <label className="asst-email-label">
            {t('seminarStats.email.subject', 'Тема')} <span className="asst-email-req">*</span>
          </label>
          <input
            type="text"
            className={`asst-email-input ${errors.subject ? 'asst-email-input-err' : ''}`}
            value={subject}
            onChange={e => { setSubject(e.target.value); if (errors.subject) setErrors(p => ({ ...p, subject: '' })); }}
            placeholder={t('seminarStats.email.subjectPlaceholder', 'Тема на съобщението...')}
            disabled={sending}
            maxLength={150}
          />
          {errors.subject && <span className="asst-email-error">{errors.subject}</span>}
        </div>

        {/* Message */}
        <div className="asst-email-field">
          <label className="asst-email-label">
            {t('seminarStats.email.message', 'Съобщение')} <span className="asst-email-req">*</span>
          </label>
          <textarea
            className={`asst-email-textarea ${errors.message ? 'asst-email-input-err' : ''}`}
            value={message}
            onChange={e => { if (e.target.value.length <= MAX_MESSAGE) { setMessage(e.target.value); if (errors.message) setErrors(p => ({ ...p, message: '' })); } }}
            placeholder={t('seminarStats.email.messagePlaceholder', 'Вашето съобщение...')}
            disabled={sending}
            rows={7}
          />
          <div className="asst-email-textarea-footer">
            {errors.message && <span className="asst-email-error">{errors.message}</span>}
            <span className={`asst-email-chars ${message.length > MAX_MESSAGE * 0.9 ? 'asst-email-chars-warn' : ''}`}>
              {message.length}/{MAX_MESSAGE}
            </span>
          </div>
        </div>

        {/* Attach from storage */}
        <div className="asst-email-attach-section">
          <button
            type="button"
            className="asst-email-attach-btn"
            onClick={() => setShowFilePicker(true)}
            disabled={sending}
          >
            <Paperclip size={15} />
            {t('seminarStats.email.attachFromStorage', 'Прикачи от хранилището')}
          </button>
          {attachedFiles.length > 0 && (
            <div className="asst-email-attached-files">
              {attachedFiles.map((file, i) => (
                <div key={i} className="asst-email-file-chip">
                  <Paperclip size={13} />
                  <span className="asst-email-file-chip-name">{file.fileName}</span>
                  <button
                    type="button"
                    className="asst-email-file-chip-remove"
                    onClick={() => removeAttachedFile(i)}
                    disabled={sending}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Note */}
        <div className="asst-email-note">
          {t('seminarStats.email.note', 'Съобщението ще бъде изпратено с брандирания шаблон на DigiBridge Academy.')}
        </div>

        {/* Footer */}
        <div className="asst-email-footer">
          <button className="asst-email-btn-cancel" onClick={onClose} disabled={sending}>
            {t('seminarStats.email.cancel', 'Отказ')}
          </button>
          <button
            className="asst-email-btn-send"
            onClick={handleSend}
            disabled={sending || !subject.trim() || !message.trim()}
          >
            {sending ? (
              <><div className="asst-email-btn-spinner" /> {t('seminarStats.email.sending', 'Изпращане...')}</>
            ) : (
              <><Send size={16} /> {t('seminarStats.email.send', 'Изпрати')}</>
            )}
          </button>
        </div>
      </div>

      {showFilePicker && (
        <StorageFilePicker
          onSelect={handleFileSelect}
          onClose={() => setShowFilePicker(false)}
        />
      )}
    </div>
  );
};

export default SeminarEmailModal;
