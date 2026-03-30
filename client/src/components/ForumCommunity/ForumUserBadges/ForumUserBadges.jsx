// src/components/ForumCommunity/ForumUserBadges/ForumUserBadges.jsx
// Prefix: fub-

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './forumUserBadges.css';

const BADGE_EMOJIS = {
  first_post: '📝',
  first_comment: '💬',
  contributor_10: '⭐',
  helper_25: '🤝',
  veteran_50: '🏆',
  popular_post: '🔥',
  conversation_starter: '💡',
  post_of_week: '👑',
  reactor_100: '⚡',
  bookmarked_10: '📌',
};

const MAX_VISIBLE = 3;

const ForumUserBadges = ({ badges }) => {
  const { t } = useTranslation('forum');
  const [showAll, setShowAll] = useState(false);

  if (!badges || badges.length === 0) return null;

  const badgeList = badges.map(b => {
    const key = typeof b === 'string' ? b : b.badge;
    return {
      key,
      emoji: BADGE_EMOJIS[key] || '🏅',
      label: t(`gamification.badges.${key}`, key),
    };
  });

  const visible = showAll ? badgeList : badgeList.slice(0, MAX_VISIBLE);
  const remaining = badgeList.length - MAX_VISIBLE;

  return (
    <span className="fub-container">
      {visible.map((b) => (
        <span key={b.key} className="fub-badge" title={b.label}>
          {b.emoji}
        </span>
      ))}
      {!showAll && remaining > 0 && (
        <button className="fub-more" onClick={(e) => { e.stopPropagation(); setShowAll(true); }}>
          +{remaining}
        </button>
      )}
    </span>
  );
};

export default ForumUserBadges;
