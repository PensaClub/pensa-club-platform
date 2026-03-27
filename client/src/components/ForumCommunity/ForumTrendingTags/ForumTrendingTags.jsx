import { useState, useEffect } from 'react';
import { forumServiceFactory } from '../../Services/forumServiceFactory';
import './forumTrendingTags.css';

const TAG_COLORS = ['#2cb5a0', '#d4943c', '#8b6cc1', '#3aab6a', '#8b2040', '#4a8ab0', '#c9a84c', '#a63055'];

const ForumTrendingTags = ({ onTagClick }) => {
  const [tags, setTags] = useState([]);
  const service = forumServiceFactory();

  useEffect(() => {
    service.getTrendingTags().then(data => setTags(data.tags || [])).catch(() => {});
  }, []);

  if (tags.length === 0) return null;

  const maxCount = Math.max(...tags.map(t => t.usageCount || 1));

  return (
    <div className="ftt-cloud">
      {tags.map((tag, i) => {
        const ratio = (tag.usageCount || 1) / maxCount;
        const size = 11 + ratio * 7;
        const color = TAG_COLORS[i % TAG_COLORS.length];
        return (
          <button
            key={tag.id}
            className="ftt-tag"
            style={{ fontSize: `${size}px`, color }}
            onClick={() => onTagClick?.(tag.slug)}
          >
            #{tag.name}
          </button>
        );
      })}
    </div>
  );
};

export default ForumTrendingTags;
