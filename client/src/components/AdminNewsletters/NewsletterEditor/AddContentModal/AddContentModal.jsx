// src/components/AdminNewsletters/NewsletterEditor/AddContentModal/AddContentModal.jsx
// Prefix: anacm- (AdminNewsletters → AddContentModal)

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  X,
  Search,
  LibraryBig,
  GraduationCap,
  Newspaper,
  FileText,
  Lightbulb,
  ClipboardList,
  ImageOff,
  Check,
  Megaphone,
} from 'lucide-react';
import { useCommunityContext } from '../../../contexts/CommunityContext';
import './addContentModal.css';

const TYPES = [
  { key: 'seminars', icon: LibraryBig },
  { key: 'articles', icon: Newspaper },
  { key: 'courses', icon: GraduationCap },
  { key: 'initiatives', icon: Lightbulb },
  { key: 'projects', icon: ClipboardList },
  { key: 'publications', icon: FileText },
  { key: 'update', icon: Megaphone },
];

const escapeAttr = (s) => String(s || '').replace(/"/g, '&quot;');

// Generates a FLAT HTML block that tiptap preserves (img/h3/p/strong/a).
// The server detects this exact structure in `beautifyBodyHtml` and replaces
// it with a weekly-digest-style table layout (orange accent, thumbnail on
// the right). Description `<p>` is ALWAYS emitted so the regex stays
// predictable — even if empty it contributes an unambiguous slot.
const buildHtmlBlock = ({ categoryLabel, title, description, thumbnail, url, readMore }) => {
  const safeTitle = title || '';
  const safeDesc = description || '';
  const parts = [];

  if (thumbnail) {
    parts.push(`<p><img src="${escapeAttr(thumbnail)}" alt="${escapeAttr(safeTitle)}" /></p>`);
  }
  parts.push(`<p><strong>${categoryLabel}</strong></p>`);
  parts.push(`<h3>${safeTitle}</h3>`);
  parts.push(`<p>${safeDesc}</p>`);
  parts.push(`<p><a href="${escapeAttr(url)}" class="nl-cta">${readMore}</a></p>`);
  parts.push('<p></p>');

  return parts.join('');
};

export const AddContentModal = ({ isOpen, onClose, onInsert }) => {
  const { t } = useTranslation('adminNewsletters');
  const { searchNewsletterContent } = useCommunityContext();

  const [activeType, setActiveType] = useState('seminars');
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // selectedMap: { "type:id": item } — preserved across tab switches
  const [selectedMap, setSelectedMap] = useState({});
  const [updateForm, setUpdateForm] = useState({
    title: '',
    description: '',
    url: '',
    image: '',
    buttonText: '',
  });
  const [updateError, setUpdateError] = useState('');

  const selectionKey = (item) => `${item.type}:${item.id}`;
  const totalSelected = Object.keys(selectedMap).length;
  const countByType = (type) =>
    Object.values(selectedMap).filter((it) => it.type === type).length;
  const toggleSelected = (item) => {
    const key = selectionKey(item);
    setSelectedMap((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = item;
      return next;
    });
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 350);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch when opened / type changed / query changed (not for manual update tab)
  const fetchItems = useCallback(async () => {
    if (!isOpen || activeType === 'update') return;
    setIsLoading(true);
    try {
      const res = await searchNewsletterContent(activeType, debounced, 15);
      setItems(res?.items || []);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeType, debounced]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setDebounced('');
      setSelectedMap({});
      setUpdateForm({ title: '', description: '', url: '', image: '', buttonText: '' });
      setUpdateError('');
    }
  }, [isOpen]);

  useEffect(() => {
    setUpdateError('');
    // Clear search query when switching tabs (results change) but KEEP selections
    setQuery('');
    setDebounced('');
  }, [activeType]);

  if (!isOpen) return null;

  const handleInsert = () => {
    const blocks = [];

    // All selected cross-tab items
    Object.values(selectedMap).forEach((item) => {
      blocks.push(
        buildHtmlBlock({
          categoryLabel: t(`editor.addContent.categoryLabels.${item.type}`),
          title: item.title,
          description: item.description,
          thumbnail: item.thumbnail,
          url: item.url,
          readMore: t('editor.addContent.readMore'),
        }),
      );
    });

    // Manual update (if current tab and has a title) — always append at the end
    if (activeType === 'update') {
      const title = updateForm.title.trim();
      if (title) {
        blocks.push(
          buildHtmlBlock({
            categoryLabel: t('editor.addContent.categoryLabels.update'),
            title,
            description: updateForm.description.trim(),
            thumbnail: updateForm.image.trim() || null,
            url: updateForm.url.trim() || '#',
            readMore: updateForm.buttonText.trim() || t('editor.addContent.readMore'),
          }),
        );
      } else if (blocks.length === 0) {
        setUpdateError(t('editor.addContent.update.titleRequired'));
        return;
      }
    }

    if (blocks.length === 0) return;
    onInsert?.(blocks.join(''));
    onClose?.();
  };

  const insertDisabled = (() => {
    if (activeType === 'update') {
      return totalSelected === 0 && !updateForm.title.trim();
    }
    return totalSelected === 0;
  })();

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return createPortal(
    <div
      className="anacm-overlay"
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
    >
      <div className="anacm-modal">
        {/* HEADER */}
        <div className="anacm-header">
          <div className="anacm-header-text">
            <h2 className="anacm-title">{t('editor.addContent.title')}</h2>
            <p className="anacm-subtitle">{t('editor.addContent.description')}</p>
          </div>
          <button
            type="button"
            className="anacm-close"
            onClick={onClose}
            aria-label={t('editor.addContent.close')}
          >
            <span className="anacm-icon">
              <X />
            </span>
          </button>
        </div>

        {/* TYPE TABS */}
        <div className="anacm-tabs" role="tablist">
          {TYPES.map(({ key, icon: Icon }) => {
            const active = activeType === key;
            const badge = key !== 'update' ? countByType(key) : 0;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                className={`anacm-tab ${active ? 'anacm-tab--active' : ''}`}
                onClick={() => setActiveType(key)}
              >
                <span className="anacm-tab-icon">
                  <Icon />
                </span>
                <span className="anacm-tab-label">{t(`editor.addContent.tabs.${key}`)}</span>
                {badge > 0 && (
                  <span className="anacm-tab-badge">{badge}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* SEARCH — hide when manual update tab is active */}
        {activeType !== 'update' && (
          <div className="anacm-search">
            <span className="anacm-search-icon">
              <Search />
            </span>
            <input
              type="text"
              className="anacm-search-input"
              placeholder={t('editor.addContent.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                className="anacm-search-clear"
                onClick={() => setQuery('')}
                aria-label={t('editor.addContent.close')}
              >
                <span className="anacm-icon">
                  <X />
                </span>
              </button>
            )}
          </div>
        )}

        {/* RESULTS / UPDATE FORM */}
        {activeType === 'update' ? (
          <div className="anacm-update">
            <div className="anacm-update-header">
              <h3 className="anacm-update-title">
                {t('editor.addContent.update.heading')}
              </h3>
              <p className="anacm-update-desc">
                {t('editor.addContent.update.description')}
              </p>
            </div>

            <div className="anacm-update-field">
              <label className="anacm-update-label">
                {t('editor.addContent.update.title')}
              </label>
              <input
                type="text"
                className={`anacm-update-input ${updateError ? 'anacm-update-input--error' : ''}`}
                placeholder={t('editor.addContent.update.titlePlaceholder')}
                value={updateForm.title}
                onChange={(e) => {
                  setUpdateForm((f) => ({ ...f, title: e.target.value }));
                  if (updateError) setUpdateError('');
                }}
              />
              {updateError && (
                <span className="anacm-update-error">{updateError}</span>
              )}
            </div>

            <div className="anacm-update-field">
              <label className="anacm-update-label">
                {t('editor.addContent.update.description2')}
              </label>
              <textarea
                className="anacm-update-textarea"
                rows={3}
                placeholder={t('editor.addContent.update.descriptionPlaceholder')}
                value={updateForm.description}
                onChange={(e) =>
                  setUpdateForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>

            <div className="anacm-update-grid">
              <div className="anacm-update-field">
                <label className="anacm-update-label">
                  {t('editor.addContent.update.url')}
                </label>
                <input
                  type="url"
                  className="anacm-update-input"
                  placeholder={t('editor.addContent.update.urlPlaceholder')}
                  value={updateForm.url}
                  onChange={(e) =>
                    setUpdateForm((f) => ({ ...f, url: e.target.value }))
                  }
                />
              </div>
              <div className="anacm-update-field">
                <label className="anacm-update-label">
                  {t('editor.addContent.update.buttonText')}
                </label>
                <input
                  type="text"
                  className="anacm-update-input"
                  placeholder={t('editor.addContent.update.buttonTextPlaceholder')}
                  value={updateForm.buttonText}
                  onChange={(e) =>
                    setUpdateForm((f) => ({ ...f, buttonText: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="anacm-update-field">
              <label className="anacm-update-label">
                {t('editor.addContent.update.image')}
              </label>
              <input
                type="url"
                className="anacm-update-input"
                placeholder={t('editor.addContent.update.imagePlaceholder')}
                value={updateForm.image}
                onChange={(e) =>
                  setUpdateForm((f) => ({ ...f, image: e.target.value }))
                }
              />
            </div>
          </div>
        ) : (
        <div className="anacm-results">
          {isLoading ? (
            <div className="anacm-state">
              <div className="anacm-spinner" />
              <span>{t('editor.addContent.loading')}</span>
            </div>
          ) : items.length === 0 ? (
            <div className="anacm-state">
              <span>{t('editor.addContent.empty')}</span>
            </div>
          ) : (
            <ul className="anacm-list">
              {items.map((item) => {
                const isSelected = Boolean(selectedMap[selectionKey(item)]);
                return (
                  <li
                    key={`${item.type}-${item.id}`}
                    className={`anacm-item ${isSelected ? 'anacm-item--selected' : ''}`}
                  >
                    <button
                      type="button"
                      className="anacm-item-btn"
                      onClick={() => toggleSelected(item)}
                    >
                      <span className="anacm-item-thumb">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt=""
                            loading="lazy"
                          />
                        ) : (
                          <span className="anacm-item-thumb-empty">
                            <ImageOff />
                          </span>
                        )}
                      </span>
                      <span className="anacm-item-body">
                        <span className="anacm-item-category">
                          {t(`editor.addContent.categoryLabels.${item.type}`)}
                        </span>
                        <span className="anacm-item-title">{item.title}</span>
                        {item.description && (
                          <span className="anacm-item-desc">
                            {item.description.length > 140
                              ? `${item.description.slice(0, 140)}…`
                              : item.description}
                          </span>
                        )}
                      </span>
                      {isSelected && (
                        <span className="anacm-item-check" aria-hidden="true">
                          <Check />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        )}

        {/* FOOTER */}
        <div className="anacm-footer">
          {totalSelected > 0 && (
            <span className="anacm-selected-count">
              {t('editor.addContent.selectedCount', { count: totalSelected })}
            </span>
          )}
          <div className="anacm-footer-actions">
            <button type="button" className="anacm-btn anacm-btn--ghost" onClick={onClose}>
              {t('editor.addContent.close')}
            </button>
            <button
              type="button"
              className="anacm-btn anacm-btn--primary"
              onClick={handleInsert}
              disabled={insertDisabled}
            >
              {t('editor.addContent.insert')}
              {totalSelected > 0 && ` (${totalSelected})`}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
