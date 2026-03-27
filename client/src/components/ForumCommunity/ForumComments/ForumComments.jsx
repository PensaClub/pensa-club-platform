import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForum } from '../../contexts/ForumProvider';
import { useAuthContext } from '../../contexts/UserContext';
import ForumCommentItem from '../ForumCommentItem/ForumCommentItem';
import ForumEmojiPicker from '../ForumEmojiPicker/ForumEmojiPicker';
import { Send, SmilePlus, X, ChevronDown, Image as ImageIcon } from 'lucide-react';
import { useFirebaseUpload } from '../../hooks/useFirebaseUpload';
import './forumComments.css';

const INITIAL_SHOW = 5;

const ForumComments = ({ postId, comments, onRefresh }) => {
  const { t } = useTranslation('forum');
  const { addComment } = useForum();
  const { isAuthentication } = useAuthContext();
  const { uploadFile, uploading } = useFirebaseUpload();

  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [quotedComment, setQuotedComment] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [sending, setSending] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [pendingImages, setPendingImages] = useState([]);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const emojiRef = useRef(null);

  // Close emoji picker on outside click
  useEffect(() => {
    if (!showEmoji) return;
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmoji]);

  // Build tree
  const commentTree = useMemo(() => {
    const map = {};
    const roots = [];
    comments.forEach(c => { map[c.id] = { ...c, replies: [] }; });
    comments.forEach(c => {
      if (c.parentId && map[c.parentId]) {
        map[c.parentId].replies.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });
    return roots;
  }, [comments]);

  const visibleComments = showAll ? commentTree : commentTree.slice(0, INITIAL_SHOW);
  const hiddenCount = commentTree.length - INITIAL_SHOW;

  const handleReply = (comment) => {
    const name = comment.author?.details
      ? `${comment.author.details.firstName || ''} ${comment.author.details.lastName || ''}`.trim()
      : 'Анонимен';
    setReplyTo({ id: comment.id, authorName: name });
    setQuotedComment(null);
    inputRef.current?.focus();
  };

  const handleQuote = (comment) => {
    const name = comment.author?.details
      ? `${comment.author.details.firstName || ''} ${comment.author.details.lastName || ''}`.trim()
      : 'Анонимен';
    setQuotedComment({ id: comment.id, content: comment.content?.substring(0, 150), authorName: name });
    setReplyTo({ id: comment.id, authorName: name });
    inputRef.current?.focus();
  };

  const handleEmojiSelect = (emoji) => {
    setContent(prev => prev + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width;
          let h = img.height;
          if (w > maxWidth) { h = (h * maxWidth) / w; w = maxWidth; }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          }, 'image/jpeg', quality);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = 5 - pendingImages.length;
    const toUpload = files.slice(0, remaining);

    for (const file of toUpload) {
      try {
        const compressed = await compressImage(file);
        const result = await uploadFile(compressed, 'academy/forum/comments');
        setPendingImages(prev => [...prev, result.url]);
      } catch (err) {
        console.error('Image upload error:', err);
      }
    }
    e.target.value = '';
  };

  const handleRemoveImage = (url) => {
    setPendingImages(prev => prev.filter(u => u !== url));
  };

  const handleSubmit = async () => {
    if ((!content.trim() && pendingImages.length === 0) || sending) return;
    setSending(true);
    try {
      await addComment(postId, {
        content: content.trim(),
        parentId: replyTo?.id || null,
        quotedCommentId: quotedComment?.id || null,
        images: pendingImages,
      });
      const parentId = replyTo?.id;
      setContent('');
      setReplyTo(null);
      setQuotedComment(null);
      setPendingImages([]);
      onRefresh?.();
      // Scroll to the parent comment or to bottom for new top-level comments
      setTimeout(() => {
        if (parentId && scrollRef.current) {
          const parentEl = scrollRef.current.querySelector(`[data-comment-id="${parentId}"]`);
          if (parentEl) {
            parentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
          }
        }
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 300);
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fcm-container">
      <h3 className="fcm-title">
        {t('forumCommunity.post.comments', 'Коментари')}
        <span className="fcm-count">{comments.length}</span>
      </h3>

      {/* Scrollable comments area */}
      <div className="fcm-scroll-area" ref={scrollRef}>
        {commentTree.length === 0 ? (
          <p className="fcm-empty">Бъдете първият, който ще коментира</p>
        ) : (
          <>
            {visibleComments.map(comment => (
              <ForumCommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                onQuote={handleQuote}
                onRefresh={onRefresh}
              />
            ))}

            {!showAll && hiddenCount > 0 && (
              <button className="fcm-show-more" onClick={() => setShowAll(true)}>
                <ChevronDown size={14} />
                Покажи още {hiddenCount} коментар{hiddenCount === 1 ? '' : 'а'}
              </button>
            )}
          </>
        )}
      </div>

      {/* Fixed input at bottom */}
      {isAuthentication && (
        <div className="fcm-input-area">
          {/* Reply/quote indicator */}
          {replyTo && (
            <div className="fcm-reply-indicator">
              <span className="fcm-reply-label">
                {quotedComment ? 'Цитиране на' : 'Отговор на'} {replyTo.authorName}
              </span>
              {quotedComment && (
                <span className="fcm-quote-preview">{quotedComment.content}</span>
              )}
              <button className="fcm-reply-cancel" onClick={() => { setReplyTo(null); setQuotedComment(null); }}>
                <X size={12} />
              </button>
            </div>
          )}

          {/* Pending images preview */}
          {pendingImages.length > 0 && (
            <div className="fcm-pending-images">
              {pendingImages.map((url, i) => (
                <div key={i} className="fcm-pending-img-wrap">
                  <img src={url} alt="" className="fcm-pending-img" />
                  <button className="fcm-pending-img-remove" onClick={() => handleRemoveImage(url)}>
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="fcm-input-row">
            <div className="fcm-toolbar">
              <div className="fcm-emoji-wrap" ref={emojiRef}>
                <button className="fcm-tool-btn" onClick={() => setShowEmoji(!showEmoji)} title="Emoji">
                  <SmilePlus size={16} />
                </button>
                {showEmoji && (
                  <ForumEmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmoji(false)} />
                )}
              </div>

              <label className={`fcm-tool-btn ${pendingImages.length >= 5 ? 'fcm-tool-disabled' : ''}`} title="Добави снимки (до 5)">
                <ImageIcon size={16} />
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} hidden disabled={pendingImages.length >= 5} />
              </label>
            </div>

            <textarea
              ref={inputRef}
              className="fcm-input"
              placeholder={t('forumCommunity.comment.writeComment', 'Напишете коментар...')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />

            <button
              className="fcm-send-btn"
              onClick={handleSubmit}
              disabled={(!content.trim() && pendingImages.length === 0) || sending || uploading}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumComments;
