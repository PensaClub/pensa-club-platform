import { useState, useEffect, useRef } from 'react';
import { useForum } from '../../contexts/ForumProvider';
import { useAuthContext } from '../../contexts/UserContext';
import { SmilePlus } from 'lucide-react';
import './forumReactions.css';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🤔', '👏', '💡'];

const ForumReactions = ({ targetType, targetId, reactions = [], userReaction, onReactionChange }) => {
  const { addReaction } = useForum();
  const { isAuthentication } = useAuthContext();
  const [showPicker, setShowPicker] = useState(false);
  const wrapRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!showPicker) return;
    const handle = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handle);
    document.addEventListener('touchstart', handle);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('touchstart', handle);
    };
  }, [showPicker]);

  const handleReact = async (emoji) => {
    if (!isAuthentication) return;
    try {
      const result = await addReaction({ targetType, targetId, emoji });
      onReactionChange?.(result);
      setShowPicker(false);
    } catch (err) {
      console.error('Reaction error:', err);
    }
  };

  const grouped = [];
  if (Array.isArray(reactions)) {
    reactions.forEach(r => {
      grouped.push({ emoji: r.emoji, count: parseInt(r.count) || 1 });
    });
  }

  return (
    <div className="fr-container">
      {grouped.map((r) => (
        <button
          key={r.emoji}
          className={`fr-bubble ${userReaction === r.emoji ? 'fr-bubble-active' : ''}`}
          onClick={(e) => { e.stopPropagation(); handleReact(r.emoji); }}
        >
          <span className="fr-bubble-emoji">{r.emoji}</span>
          <span className="fr-bubble-count">{r.count}</span>
        </button>
      ))}

      {isAuthentication && (
        <div className="fr-add-wrap" ref={wrapRef}>
          <button
            className="fr-add-btn"
            onClick={(e) => { e.stopPropagation(); setShowPicker(!showPicker); }}
          >
            <SmilePlus size={28} />
          </button>

          {showPicker && (
            <>
              <div className="fr-quick-picker-backdrop" onClick={() => setShowPicker(false)} />
              <div className="fr-quick-picker">
                {QUICK_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    className="fr-quick-emoji"
                    onClick={(e) => { e.stopPropagation(); handleReact(emoji); }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ForumReactions;
