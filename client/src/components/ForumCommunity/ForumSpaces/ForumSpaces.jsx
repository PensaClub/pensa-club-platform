import { useTranslation } from 'react-i18next';
import { useForum } from '../../contexts/ForumProvider';
import { useAuthContext } from '../../contexts/UserContext';
import { Hash, Plus, Users, ChevronRight } from 'lucide-react';
import './forumSpaces.css';

const ForumSpaces = ({ activeSpaceId, onSelectSpace, onSuggestSpace }) => {
  const { t } = useTranslation('forum');
  const { spaces, joinSpace, leaveSpace } = useForum();
  const { isAuthentication } = useAuthContext();

  const handleJoinToggle = async (e, space) => {
    e.stopPropagation();
    if (space.isJoined) {
      await leaveSpace(space.id);
    } else {
      await joinSpace(space.id);
    }
  };

  return (
    <div className="fsp-container">
      <h2 className="fsp-title">{t('forumCommunity.spaces.title', 'Пространства')}</h2>

      {/* All posts */}
      <button
        className={`fsp-item ${!activeSpaceId ? 'fsp-item-active' : ''}`}
        onClick={() => onSelectSpace(null)}
      >
        <span className="fsp-item-icon" style={{ background: 'var(--forum-accent-light)', color: 'var(--forum-accent)' }}>
          <Hash size={16} />
        </span>
        <span className="fsp-item-name">{t('forumCommunity.spaces.allPosts', 'Всички публикации')}</span>
        <ChevronRight size={14} className="fsp-item-arrow" />
      </button>

      {/* Spaces list */}
      {spaces.map(space => (
        <button
          key={space.id}
          className={`fsp-item ${activeSpaceId === space.id ? 'fsp-item-active' : ''}`}
          onClick={() => onSelectSpace(space.id)}
        >
          <span className="fsp-item-icon" style={{ background: `${space.color}20`, color: space.color }}>
            {space.icon || <Hash size={16} />}
          </span>
          <div className="fsp-item-info">
            <span className="fsp-item-name">{space.name}</span>
            <span className="fsp-item-meta">
              <Users size={10} /> {space.memberCount}
            </span>
          </div>
          {isAuthentication && (
            <span
              className={`fsp-join-btn ${space.isJoined ? 'fsp-join-btn-joined' : ''}`}
              onClick={(e) => handleJoinToggle(e, space)}
              title={space.isJoined ? t('forumCommunity.spaces.leave') : t('forumCommunity.spaces.join')}
            >
              {space.isJoined ? '✓' : '+'}
            </span>
          )}
        </button>
      ))}

      {/* Suggest space */}
      {isAuthentication && (
        <button className="fsp-suggest" onClick={onSuggestSpace}>
          <Plus size={14} />
          {t('forumCommunity.spaces.suggest', 'Предложи пространство')}
        </button>
      )}
    </div>
  );
};

export default ForumSpaces;
