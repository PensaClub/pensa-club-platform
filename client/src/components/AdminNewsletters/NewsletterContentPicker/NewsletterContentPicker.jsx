// src/components/AdminNewsletters/NewsletterContentPicker/NewsletterContentPicker.jsx
// Prefix: ancp-

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
  Users2,
} from 'lucide-react';
import { useCommunityContext } from '../../contexts/CommunityContext';
import './newsletterContentPicker.css';

const TYPES = [
  { key: 'seminars', icon: LibraryBig },
  { key: 'articles', icon: Newspaper },
  { key: 'courses', icon: GraduationCap },
  { key: 'initiatives', icon: Lightbulb },
  { key: 'projects', icon: ClipboardList },
  { key: 'publications', icon: FileText },
  { key: 'clubs', icon: Users2 },
];

export const NewsletterContentPicker = ({ isOpen, onClose, onPick }) => {
  const { t } = useTranslation('adminNewsletters');
  const { searchNewsletterContent } = useCommunityContext();

  const [activeType, setActiveType] = useState('seminars');
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 350);
    return () => clearTimeout(timer);
  }, [query]);

  const fetchItems = useCallback(async () => {
    if (!isOpen) return;
    setIsLoading(true);
    try {
      const res = await searchNewsletterContent(activeType, debounced, 20);
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
    }
  }, [isOpen]);

  useEffect(() => {
    setQuery('');
    setDebounced('');
  }, [activeType]);

  if (!isOpen) return null;

  const handlePick = (item) => {
    onPick?.({
      title: item.title,
      description: item.description,
      url: item.url,
      thumbnail: item.thumbnail,
      type: item.type,
      category: item.type,
    });
    onClose?.();
  };

  return createPortal(
    <div
      className="ancp-overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="ancp-modal">
        <div className="ancp-header">
          <h3 className="ancp-title">{t('picker.title')}</h3>
          <button
            type="button"
            className="ancp-close"
            onClick={onClose}
            aria-label={t('picker.close')}
          >
            <span className="ancp-icon">
              <X />
            </span>
          </button>
        </div>

        <div className="ancp-tabs" role="tablist">
          {TYPES.map(({ key, icon: Icon }) => {
            const active = activeType === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                className={`ancp-tab ${active ? 'ancp-tab--active' : ''}`}
                onClick={() => setActiveType(key)}
              >
                <span className="ancp-tab-icon">
                  <Icon />
                </span>
                <span className="ancp-tab-label">
                  {t(`editor.addContent.tabs.${key}`)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="ancp-search">
          <span className="ancp-search-icon">
            <Search />
          </span>
          <input
            type="text"
            className="ancp-search-input"
            placeholder={t('editor.addContent.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="ancp-results">
          {isLoading ? (
            <div className="ancp-state">
              <span>{t('editor.addContent.loading')}</span>
            </div>
          ) : items.length === 0 ? (
            <div className="ancp-state">
              <span>{t('editor.addContent.empty')}</span>
            </div>
          ) : (
            <ul className="ancp-list">
              {items.map((item) => (
                <li key={`${item.type}-${item.id}`} className="ancp-item">
                  <button
                    type="button"
                    className="ancp-item-btn"
                    onClick={() => handlePick(item)}
                  >
                    <span className="ancp-item-thumb">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt="" loading="lazy" />
                      ) : (
                        <span className="ancp-item-thumb-empty">
                          <ImageOff />
                        </span>
                      )}
                    </span>
                    <span className="ancp-item-body">
                      <span className="ancp-item-category">
                        {t(`editor.addContent.categoryLabels.${item.type}`)}
                      </span>
                      <span className="ancp-item-title">{item.title}</span>
                      {item.description && (
                        <span className="ancp-item-desc">
                          {item.description.length > 140
                            ? `${item.description.slice(0, 140)}…`
                            : item.description}
                        </span>
                      )}
                    </span>
                    <span className="ancp-item-pick">
                      <Check />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};
