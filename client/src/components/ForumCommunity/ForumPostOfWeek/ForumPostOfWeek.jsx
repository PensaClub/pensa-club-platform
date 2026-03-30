// src/components/ForumCommunity/ForumPostOfWeek/ForumPostOfWeek.jsx
// Prefix: fpw-

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { forumServiceFactory } from '../../Services/forumServiceFactory';
import { Trophy, Eye, MessageSquare } from 'lucide-react';
import './forumPostOfWeek.css';

const ForumPostOfWeek = () => {
  const { t } = useTranslation('forum');
  const navigate = useLocalizedNavigate();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const service = forumServiceFactory();
    service.getPostOfWeek()
      .then(data => setPost(data.post))
      .catch(() => {});
  }, []);

  if (!post) return null;

  const authorName = post.author?.details
    ? `${post.author.details.firstName || ''} ${post.author.details.lastName || ''}`.trim()
    : '';

  return (
    <div className="fpw-container" onClick={() => navigate(`/academy/community/${post.slug}`)}>
      <div className="fpw-header">
        <Trophy size={16} className="fpw-trophy" />
        <span className="fpw-label">{t('gamification.postOfWeek.title', 'Post of the Week')}</span>
      </div>

      {post.coverImage && (
        <div className="fpw-cover">
          <img src={post.coverImage} alt="" />
        </div>
      )}

      <h4 className="fpw-title">{post.title}</h4>

      {authorName && (
        <p className="fpw-author">
          {t('gamification.postOfWeek.by', 'by')} <strong>{authorName}</strong>
        </p>
      )}

      <div className="fpw-stats">
        <span><Eye size={12} /> {post.viewCount || 0}</span>
        <span><MessageSquare size={12} /> {post.commentCount || 0}</span>
      </div>
    </div>
  );
};

export default ForumPostOfWeek;
