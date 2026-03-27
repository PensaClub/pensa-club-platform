import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForum } from '../../contexts/ForumProvider';
import { useFirebaseUpload } from '../../hooks/useFirebaseUpload';
import ForumRichTextEditor from '../ForumRichTextEditor/ForumRichTextEditor';
import { X, Send, Loader2, Tag, ImagePlus, Film } from 'lucide-react';
import { toast } from 'react-toastify';
import './forumCreatePost.css';

const POST_TYPES = [
  { key: 'discussion', emoji: '💬' },
  { key: 'article', emoji: '📝' },
  { key: 'question', emoji: '❓' },
  { key: 'poll', emoji: '📊' },
];

const MAX_IMAGES = 10;

const ForumCreatePost = ({ onClose, onCreated }) => {
  const { t } = useTranslation('forum');
  const { createPost, spaces, suggestSpace } = useForum();
  const { uploadFile, uploading } = useFirebaseUpload();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('discussion');
  const [spaceId, setSpaceId] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [images, setImages] = useState([]);
  const [coverImage, setCoverImage] = useState(null);
  const [videos, setVideos] = useState([]);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollMultiple, setPollMultiple] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuggestSpace, setShowSuggestSpace] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');

  const compressImage = (file, maxWidth = 1400, quality = 0.85) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width;
          let h = img.height;
          if (w > maxWidth) { h = (h * maxWidth) / w; w = maxWidth; }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          canvas.toBlob((blob) => resolve(new File([blob], file.name, { type: 'image/jpeg' })), 'image/jpeg', quality);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 1600, 0.9);
      const result = await uploadFile(compressed, 'academy/forum/covers');
      setCoverImage(result.url);
    } catch (err) {
      toast.error('Грешка при качване');
    }
    e.target.value = '';
  };

  const handleImagesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = MAX_IMAGES - images.length;
    const toUpload = files.slice(0, remaining);

    for (const file of toUpload) {
      try {
        const compressed = await compressImage(file);
        const result = await uploadFile(compressed, 'academy/forum/posts');
        setImages(prev => [...prev, result.url]);
      } catch (err) {
        toast.error('Грешка при качване на снимка');
      }
    }
    e.target.value = '';
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || videos.length >= 2) return;
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Видеото е твърде голямо (макс 100MB)');
      return;
    }
    try {
      const result = await uploadFile(file, 'academy/forum/videos');
      setVideos(prev => [...prev, result.url]);
    } catch (err) {
      toast.error('Грешка при качване на видео');
    }
    e.target.value = '';
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().replace(/,/g, '');
      if (tag && !tags.includes(tag) && tags.length < 10) {
        setTags(prev => [...prev, tag]);
        setTagInput('');
      }
    }
  };

  const handleSpaceChange = (val) => {
    if (val === '__suggest__') {
      setShowSuggestSpace(true);
      setSpaceId('');
    } else {
      setSpaceId(val);
      setShowSuggestSpace(false);
    }
  };

  const handleSuggestSpace = async () => {
    if (!newSpaceName.trim() || newSpaceName.trim().length < 2) return;
    try {
      await suggestSpace({ name: newSpaceName.trim(), description: `Пространство: ${newSpaceName.trim()}` });
      toast.success('Пространството е предложено за одобрение');
      setShowSuggestSpace(false);
      setNewSpaceName('');
    } catch (err) {
      toast.error(err?.message === 'space_name_taken' ? 'Вече съществува' : 'Грешка');
    }
  };

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Заглавието е задължително';
    if (!content.trim() || content === '<p></p>') e.content = 'Съдържанието е задължително';
    if (type === 'poll') {
      const valid = pollOptions.filter(o => o.trim());
      if (valid.length < 2) e.poll = 'Анкетата трябва да има поне 2 опции';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const postData = {
        title: title.trim(),
        content,
        type,
        spaceId: spaceId ? parseInt(spaceId) : null,
        tags,
        images,
        videos,
        coverImage,
      };

      if (type === 'poll') {
        const validOptions = pollOptions.filter(o => o.trim());
        if (validOptions.length < 2) return toast.error('Анкетата трябва да има поне 2 опции');
        postData.poll = {
          question: title.trim(),
          options: validOptions.map((text, i) => ({ id: `opt_${i}`, text: text.trim() })),
          isMultipleChoice: pollMultiple,
        };
      }

      await createPost(postData);
      toast.success('Публикацията е създадена');
      onCreated?.();
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Грешка при създаване');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fcp-overlay" onClick={onClose}>
      <div className="fcp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="fcp-header">
          <h2 className="fcp-title">{t('forumCommunity.createPost.title', 'Нова публикация')}</h2>
          <button className="fcp-close" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Type */}
        <div className="fcp-types">
          {POST_TYPES.map(pt => (
            <button
              key={pt.key}
              className={`fcp-type-btn ${type === pt.key ? 'fcp-type-btn-active' : ''}`}
              onClick={() => setType(pt.key)}
            >{pt.emoji} {t(`forumCommunity.createPost.${pt.key}`)}</button>
          ))}
        </div>

        {/* Title */}
        <input className={`fcp-input ${errors.title ? 'fcp-input-error' : ''}`} type="text" placeholder={t('forumCommunity.createPost.titlePlaceholder', 'Заглавие')} value={title} onChange={(e) => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: '' })); }} maxLength={300} />
        {errors.title && <span className="fcp-error-msg">{errors.title}</span>}

        {/* Space */}
        <select className="fcp-select" value={spaceId} onChange={(e) => handleSpaceChange(e.target.value)}>
          <option value="">{t('forumCommunity.createPost.selectSpace', 'Изберете пространство (незадължително)')}</option>
          {spaces.filter(s => s.status !== 'archived').map(s => (
            <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
          ))}
          <option value="__suggest__">+ Предложи ново пространство</option>
        </select>

        {showSuggestSpace && (
          <div className="fcp-suggest-inline">
            <input className="fcp-input" type="text" placeholder="Име на новото пространство" value={newSpaceName} onChange={(e) => setNewSpaceName(e.target.value)} maxLength={100} />
            <button className="fcp-suggest-btn" onClick={handleSuggestSpace}>Предложи</button>
          </div>
        )}

        {/* Cover image */}
        <div className="fcp-media-section">
          <label className="fcp-media-btn">
            <ImagePlus size={16} />
            {coverImage ? 'Смени обложка' : 'Добави обложка'}
            <input type="file" accept="image/*" onChange={handleCoverUpload} hidden />
          </label>

          <label className={`fcp-media-btn ${images.length >= MAX_IMAGES ? 'fcp-media-disabled' : ''}`}>
            <ImagePlus size={16} />
            Снимки ({images.length}/{MAX_IMAGES})
            <input type="file" accept="image/*" multiple onChange={handleImagesUpload} hidden disabled={images.length >= MAX_IMAGES} />
          </label>

          <label className={`fcp-media-btn ${videos.length >= 2 ? 'fcp-media-disabled' : ''}`}>
            <Film size={16} />
            Видео ({videos.length}/2)
            <input type="file" accept="video/*" onChange={handleVideoUpload} hidden disabled={videos.length >= 2} />
          </label>
        </div>

        {/* Cover preview */}
        {coverImage && (
          <div className="fcp-cover-preview">
            <img src={coverImage} alt="" />
            <button className="fcp-cover-remove" onClick={() => setCoverImage(null)}><X size={12} /></button>
          </div>
        )}

        {/* Images preview */}
        {images.length > 0 && (
          <div className="fcp-images-preview">
            {images.map((url, i) => (
              <div key={i} className="fcp-img-thumb-wrap">
                <img src={url} alt="" className="fcp-img-thumb" />
                <button className="fcp-img-remove" onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}>
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Videos preview */}
        {videos.length > 0 && (
          <div className="fcp-videos-preview">
            {videos.map((url, i) => (
              <div key={i} className="fcp-video-wrap">
                <video src={url} className="fcp-video-thumb" controls preload="metadata" />
                <button className="fcp-video-remove" onClick={() => setVideos(prev => prev.filter((_, idx) => idx !== i))}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Editor */}
        <div className={errors.content ? 'fcp-editor-error' : ''}>
          <ForumRichTextEditor
            content={content}
            onChange={(val) => { setContent(val); setErrors(prev => ({ ...prev, content: '' })); }}
            placeholder={t('forumCommunity.createPost.contentPlaceholder', 'Какво искате да споделите?')}
          />
        </div>
        {errors.content && <span className="fcp-error-msg">{errors.content}</span>}

        {/* Poll options */}
        {type === 'poll' && (
          <div className="fcp-poll-section">
            <h4 className="fcp-poll-title">Опции за анкетата</h4>
            {pollOptions.map((opt, i) => (
              <div key={i} className="fcp-poll-option-row">
                <input
                  className="fcp-input"
                  type="text"
                  placeholder={`Опция ${i + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const updated = [...pollOptions];
                    updated[i] = e.target.value;
                    setPollOptions(updated);
                  }}
                  maxLength={200}
                />
                {pollOptions.length > 2 && (
                  <button className="fcp-poll-remove" onClick={() => setPollOptions(prev => prev.filter((_, idx) => idx !== i))}>
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            {pollOptions.length < 10 && (
              <button className="fcp-poll-add" onClick={() => setPollOptions(prev => [...prev, ''])}>
                + Добави опция
              </button>
            )}
            {errors.poll && <span className="fcp-error-msg">{errors.poll}</span>}
            <label className="fcp-poll-multi">
              <input type="checkbox" checked={pollMultiple} onChange={(e) => setPollMultiple(e.target.checked)} />
              Множествен избор (повече от 1 отговор)
            </label>
          </div>
        )}

        {/* Tags */}
        <div className="fcp-tags-section">
          <div className="fcp-tags-input-wrap">
            <Tag size={14} />
            <input className="fcp-tags-input" type="text" placeholder={t('forumCommunity.createPost.addTags', 'Добавете тагове') + ' (Enter)'} value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} />
          </div>
          {tags.length > 0 && (
            <div className="fcp-tags-list">
              {tags.map(tag => (
                <span key={tag} className="fcp-tag">
                  #{tag}
                  <button className="fcp-tag-remove" onClick={() => setTags(prev => prev.filter(t => t !== tag))}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="fcp-footer">
          <button className="fcp-cancel" onClick={onClose}>Отказ</button>
          <button className="fcp-submit" onClick={handleSubmit} disabled={saving || uploading}>
            {(saving || uploading) ? <Loader2 size={16} className="fcp-spinner" /> : <Send size={16} />}
            {t('forumCommunity.createPost.publish', 'Публикувай')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForumCreatePost;
