import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../contexts/UserContext';
import { useForum } from '../../contexts/ForumProvider';
import ForumReactions from '../ForumReactions/ForumReactions';
import ForumImageLightbox from '../ForumImageLightbox/ForumImageLightbox';
import { Reply, Quote, Pencil, Trash2, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import './forumCommentItem.css';

const parseUserId = (token) => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId ? Number(payload.userId) : null;
  } catch { return null; }
};

const ForumCommentItem = ({ comment, depth = 0, onReply, onQuote, onRefresh, onUpdate, onDelete }) => {
  const { t } = useTranslation('forum');
  const { token, isAdmin: isAdminCtx } = useAuthContext();
  const { updateComment, deleteComment } = useForum();

  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(depth < 2);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const currentUserId = parseUserId(token);
  const author = comment.author;
  const authorName = author?.details
    ? `${author.details.firstName || ''} ${author.details.lastName || ''}`.trim()
    : 'Анонимен';
  const avatar = author?.details?.imageURL;
  const isOwn = currentUserId && currentUserId === Number(comment.authorId);
  const isAdmin = !!isAdminCtx;
  const isDeleted = comment.status === 'deleted';
  const replies = comment.replies || [];
  const images = comment.images?.filter(Boolean) || [];

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'сега';
    if (mins < 60) return `${mins} мин`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ч`;
    return `${Math.floor(hours / 24)} д`;
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    await updateComment(comment.id, { content: editContent.trim() });
    setEditing(false);
    onRefresh?.();
  };

  const handleDelete = async () => {
    if (!window.confirm('Сигурни ли сте, че искате да изтриете коментара?')) return;
    await deleteComment(comment.id);
    onRefresh?.();
  };

  return (
    <div className={`fci-item ${depth > 0 ? 'fci-nested' : ''}`} data-comment-id={comment.id}>
      {/* Quoted comment */}
      {comment.quotedComment && (
        <div className="fci-quoted">
          <span className="fci-quoted-author">
            {comment.quotedComment.author?.details?.firstName || 'Анонимен'}:
          </span>
          <span className="fci-quoted-text">
            {comment.quotedComment.content?.substring(0, 120)}...
          </span>
        </div>
      )}

      <div className="fci-header">
        <div className="fci-avatar">
          {avatar
            ? <img src={avatar} alt="" />
            : <span>{authorName.charAt(0)}</span>
          }
        </div>
        <div className="fci-author-info">
          <span className="fci-author-name">{authorName}</span>
          <span className="fci-time">
            <Clock size={10} /> {timeAgo(comment.createdAt)}
            {comment.isEdited && <em className="fci-edited"> · {t('forumCommunity.comment.edited')}</em>}
          </span>
        </div>

        {replies.length > 0 && (
          <button className="fci-collapse-btn" onClick={() => setShowReplies(!showReplies)}>
            {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            <span>{replies.length}</span>
          </button>
        )}
      </div>

      {/* Content */}
      {isDeleted ? (
        <div className="fci-deleted">{t('forumCommunity.comment.deleted')}</div>
      ) : editing ? (
        <div className="fci-edit-area">
          <textarea
            className="fci-edit-input"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
          />
          <div className="fci-edit-actions">
            <button className="fci-edit-cancel" onClick={() => { setEditing(false); setEditContent(comment.content); }}>Отказ</button>
            <button className="fci-edit-save" onClick={handleSaveEdit}>Запази</button>
          </div>
        </div>
      ) : (
        <>
          {comment.content && <div className="fci-content">{comment.content}</div>}

          {/* Images */}
          {images.length > 0 && (
            <div className={`fci-images fci-images-${Math.min(images.length, 3)}`}>
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  className="fci-image-thumb"
                  onClick={() => setLightboxIndex(i)}
                  loading="lazy"
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Actions + Reactions */}
      {!isDeleted && !editing && (
        <div className="fci-footer">
          <div className="fci-actions">
            <button className="fci-action-btn" onClick={() => onReply?.(comment)}>
              <Reply size={12} /> {t('forumCommunity.comment.reply')}
            </button>
            <button className="fci-action-btn" onClick={() => onQuote?.(comment)}>
              <Quote size={12} /> {t('forumCommunity.comment.quote')}
            </button>
            {isOwn && (
              <button className="fci-action-btn" onClick={() => setEditing(true)}>
                <Pencil size={12} /> {t('forumCommunity.comment.edit')}
              </button>
            )}
            {(isOwn || isAdmin) && (
              <button className="fci-action-btn fci-action-danger" onClick={handleDelete}>
                <Trash2 size={12} /> {t('forumCommunity.comment.delete')}
              </button>
            )}
          </div>

          <ForumReactions
            targetType="comment"
            targetId={comment.id}
            reactions={comment.reactions || []}
            userReaction={comment.userReaction}
            onReactionChange={onRefresh}
          />
        </div>
      )}

      {/* Nested replies */}
      {showReplies && replies.length > 0 && (
        <div className="fci-replies">
          {replies.map(reply => (
            <ForumCommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
              onQuote={onQuote}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <ForumImageLightbox
          images={images}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
};

export default ForumCommentItem;
