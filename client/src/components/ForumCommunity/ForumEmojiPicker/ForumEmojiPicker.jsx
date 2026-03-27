import { useState } from 'react';
import './forumEmojiPicker.css';

const CATEGORIES = {
  smileys: { label: '😀', emojis: ['😀', '😂', '🤣', '😊', '😍', '🥰', '😘', '😜', '🤔', '😮', '😢', '😤', '🤗', '🥳', '😎', '🤩'] },
  gestures: { label: '👍', emojis: ['👍', '👎', '👏', '🤝', '💪', '✌️', '🤞', '👋', '🙏', '❤️', '💔', '💯', '🔥', '⭐', '💡', '✅'] },
  nature: { label: '🌿', emojis: ['🌿', '🌻', '🌺', '🍀', '🌈', '☀️', '🌙', '⛅', '🐱', '🐶', '🦋', '🐝'] },
  food: { label: '🍕', emojis: ['🍕', '🍳', '☕', '🍰', '🍎', '🍷', '🎂', '🍫', '🥗', '🍜'] },
  objects: { label: '📚', emojis: ['📚', '💻', '📱', '🎵', '🎬', '📷', '🏠', '🚗', '✈️', '🎁', '🏆', '🎯'] },
};

const ForumEmojiPicker = ({ onSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('smileys');

  return (
    <div className="fep-container">
      <div className="fep-categories">
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            className={`fep-cat-btn ${activeCategory === key ? 'fep-cat-active' : ''}`}
            onClick={() => setActiveCategory(key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="fep-grid">
        {CATEGORIES[activeCategory].emojis.map((emoji) => (
          <button
            key={emoji}
            className="fep-emoji-btn"
            onClick={() => { onSelect(emoji); onClose?.(); }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ForumEmojiPicker;
