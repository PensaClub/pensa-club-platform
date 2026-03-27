import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForum } from '../../contexts/ForumProvider';
import { X, Send, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import './forumSuggestSpace.css';

const EMOJI_OPTIONS = ['💬', '🖥️', '🌿', '💊', '📚', '🎨', '🎵', '🏃', '🍳', '🧩', '🌍', '❓'];

const ForumSuggestSpace = ({ onClose }) => {
  const { t } = useTranslation('forum');
  const { suggestSpace } = useForum();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('💬');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || name.trim().length < 2) return toast.error('Името трябва да е поне 2 символа');
    if (!description.trim() || description.trim().length < 10) return toast.error('Описанието трябва да е поне 10 символа');

    setSaving(true);
    try {
      await suggestSpace({ name: name.trim(), description: description.trim(), icon });
      toast.success('Пространството е предложено за одобрение');
      onClose();
    } catch (err) {
      const msg = err?.message || 'Грешка';
      if (msg === 'space_name_taken') {
        toast.error('Пространство с това име вече съществува');
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fss-overlay" onClick={onClose}>
      <div className="fss-modal" onClick={(e) => e.stopPropagation()}>
        <div className="fss-header">
          <h2 className="fss-title">{t('forumCommunity.spaces.suggest', 'Предложи пространство')}</h2>
          <button className="fss-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="fss-field">
          <label className="fss-label">Иконка</label>
          <div className="fss-emojis">
            {EMOJI_OPTIONS.map(e => (
              <button
                key={e}
                className={`fss-emoji-btn ${icon === e ? 'fss-emoji-active' : ''}`}
                onClick={() => setIcon(e)}
              >{e}</button>
            ))}
          </div>
        </div>

        <div className="fss-field">
          <label className="fss-label">Име</label>
          <input
            className="fss-input"
            type="text"
            placeholder="Напр. Компютърна помощ"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
          />
        </div>

        <div className="fss-field">
          <label className="fss-label">Описание</label>
          <textarea
            className="fss-textarea"
            placeholder="За какво ще се дискутира в това пространство?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={2000}
          />
        </div>

        <div className="fss-footer">
          <button className="fss-cancel" onClick={onClose}>Отказ</button>
          <button className="fss-submit" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 size={14} className="fss-spinner" /> : <Send size={14} />}
            Предложи
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForumSuggestSpace;
