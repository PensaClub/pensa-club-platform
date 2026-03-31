// src/components/ForumCommunity/ForumRulesModal/ForumRulesModal.jsx
// Prefix: frm-

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForum } from '../../contexts/ForumProvider';
import { forumServiceFactory } from '../../Services/forumServiceFactory';
import { toast } from 'react-toastify';
import { Shield, ScrollText, CheckCircle2, X, Loader2 } from 'lucide-react';
import './forumRulesModal.css';

const ForumRulesModal = ({ onAccepted, onClose }) => {
  const { t, i18n } = useTranslation('forum');
  const { acceptRules } = useForum();
  const forumService = forumServiceFactory();

  const [rules, setRules] = useState({ bg: '', en: '', de: '' });
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const contentRef = useRef(null);

  const currentLang = i18n.language?.substring(0, 2) || 'bg';
  const rulesText = rules[currentLang] || rules.bg || '';

  const checkIfScrollable = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    if (el.scrollHeight <= el.clientHeight + 10) {
      setScrolledToEnd(true);
    }
  }, []);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const data = await forumService.getRules();
        setRules(data);
      } catch {
        toast.error(t('rulesModal.loadError', 'Error loading rules'));
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, []);

  useEffect(() => {
    if (!loading && rulesText) {
      setTimeout(checkIfScrollable, 100);
    }
  }, [loading, rulesText, checkIfScrollable]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < 30) {
      setScrolledToEnd(true);
    }
  };

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await acceptRules();
      toast.success(t('rulesModal.accepted', 'Rules accepted'));
      onAccepted?.();
    } catch {
      toast.error(t('rulesModal.acceptError', 'Error accepting rules'));
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="frm-overlay" onClick={onClose}>
      <div className="frm-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="frm-header">
          <div className="frm-header-left">
            <div className="frm-icon-wrap">
              <Shield size={22} />
            </div>
            <div>
              <h3 className="frm-title">{t('rulesModal.title', 'Community Rules')}</h3>
              <p className="frm-subtitle">{t('rulesModal.subtitle', 'Please read and accept before participating')}</p>
            </div>
          </div>
          <button className="frm-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Divider */}
        <div className="frm-divider" />

        {/* Content */}
        {loading ? (
          <div className="frm-loading">
            <Loader2 size={24} className="frm-spinner" />
          </div>
        ) : (
          <>
            <div className="frm-scroll-hint">
              <ScrollText size={14} />
              {t('rulesModal.scrollHint', 'Scroll to read all rules')}
            </div>

            <div className="frm-content" ref={contentRef} onScroll={handleScroll}>
              <div
                className="frm-rules-text"
                dangerouslySetInnerHTML={{ __html: rulesText }}
              />
            </div>

            {!scrolledToEnd && (
              <div className="frm-fade-bottom" />
            )}
          </>
        )}

        {/* Footer */}
        <div className="frm-divider" />
        <div className="frm-footer">
          <button className="frm-decline-btn" onClick={onClose}>
            {t('rulesModal.decline', 'Later')}
          </button>
          <button
            className="frm-accept-btn"
            onClick={handleAccept}
            disabled={accepting || loading || !scrolledToEnd}
            title={!scrolledToEnd ? t('rulesModal.scrollFirst', 'Read all rules first') : ''}
          >
            {accepting ? (
              <Loader2 size={16} className="frm-spinner" />
            ) : (
              <CheckCircle2 size={16} />
            )}
            {accepting
              ? t('rulesModal.accepting', 'Accepting...')
              : t('rulesModal.accept', 'I accept the rules')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForumRulesModal;
