import { useState } from 'react';
import { useForum } from '../../contexts/ForumProvider';
import { X, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import './forumReportModal.css';

const REASONS = [
  { key: 'spam', label: 'Спам', icon: '🚫' },
  { key: 'inappropriate', label: 'Неподходящо съдържание', icon: '⚠️' },
  { key: 'harassment', label: 'Тормоз или обида', icon: '😡' },
  { key: 'misinformation', label: 'Невярна информация', icon: '❌' },
  { key: 'other', label: 'Друго', icon: '📝' },
];

const ForumReportModal = ({ targetType, targetId, onClose }) => {
  const { reportContent } = useForum();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return toast.error('Моля, изберете причина');
    setSending(true);
    try {
      await reportContent({ targetType, targetId, reason, description: description.trim() || undefined });
      toast.success('Докладът е изпратен');
      onClose();
    } catch (err) {
      if (err?.message === 'already_reported') {
        toast.info('Вече сте докладвали това съдържание');
        onClose();
      } else {
        toast.error('Грешка при изпращане');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="frep-overlay" onClick={onClose}>
      <div className="frep-modal" onClick={(e) => e.stopPropagation()}>
        <div className="frep-header">
          <div className="frep-header-left">
            <AlertTriangle size={18} className="frep-header-icon" />
            <h3 className="frep-title">Докладване</h3>
          </div>
          <button className="frep-close" onClick={onClose}><X size={18} /></button>
        </div>

        <p className="frep-desc">Защо докладвате това съдържание?</p>

        <div className="frep-reasons">
          {REASONS.map(r => (
            <button
              key={r.key}
              className={`frep-reason ${reason === r.key ? 'frep-reason-selected' : ''}`}
              onClick={() => setReason(r.key)}
            >
              <span className="frep-reason-icon">{r.icon}</span>
              <span className="frep-reason-label">{r.label}</span>
            </button>
          ))}
        </div>

        <textarea
          className="frep-textarea"
          placeholder="Допълнително описание (незадължително)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={1000}
        />

        <div className="frep-footer">
          <button className="frep-cancel" onClick={onClose}>Отказ</button>
          <button className="frep-submit" onClick={handleSubmit} disabled={!reason || sending}>
            {sending ? <Loader2 size={14} className="frep-spinner" /> : <Send size={14} />}
            Изпрати доклад
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForumReportModal;
