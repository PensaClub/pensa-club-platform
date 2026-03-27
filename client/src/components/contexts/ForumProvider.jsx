import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { forumServiceFactory } from '../Services/forumServiceFactory';

export const ForumContext = createContext();

export const ForumProvider = ({ children }) => {
  const service = useMemo(() => forumServiceFactory(), []);

  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [tags, setTags] = useState([]);
  const [stats, setStats] = useState(null);
  const [myStatus, setMyStatus] = useState(null);
  const [currentPost, setCurrentPost] = useState(null);
  const [currentComments, setCurrentComments] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 0 });

  // ============ Status & Rules ============

  const getMyStatus = useCallback(async () => {
    try {
      const data = await service.getMyStatus();
      setMyStatus(data.status);
      return data;
    } catch (err) {
      console.error('Error fetching forum status:', err);
      return null;
    }
  }, [service]);

  const acceptRules = useCallback(async () => {
    try {
      await service.acceptRules();
      setMyStatus(prev => prev ? { ...prev, rulesAcceptedAt: new Date().toISOString() } : prev);
      return true;
    } catch (err) {
      console.error('Error accepting rules:', err);
      return false;
    }
  }, [service]);

  // ============ Feed ============

  const getFeed = useCallback(async (params = {}) => {
    try {
      setIsLoading(true);
      const data = await service.getFeed(params);
      setPosts(data.posts || []);
      setPagination(data.pagination || { total: 0 });
      return data;
    } catch (err) {
      console.error('Error fetching feed:', err);
      return { posts: [], pagination: { total: 0 } };
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  // ============ Posts ============

  const getPost = useCallback(async (slug) => {
    try {
      setIsLoading(true);
      const data = await service.getPost(slug);
      setCurrentPost(data.post);
      setCurrentComments(data.comments || []);
      return data;
    } catch (err) {
      console.error('Error fetching post:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  const createPost = useCallback(async (data) => {
    try {
      const result = await service.createPost(data);
      return result;
    } catch (err) {
      console.error('Error creating post:', err);
      throw err;
    }
  }, [service]);

  const updatePost = useCallback(async (id, data) => {
    try {
      return await service.updatePost(id, data);
    } catch (err) {
      console.error('Error updating post:', err);
      throw err;
    }
  }, [service]);

  const deletePost = useCallback(async (id) => {
    try {
      await service.deletePost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting post:', err);
      return false;
    }
  }, [service]);

  // ============ Comments ============

  const addComment = useCallback(async (postId, data) => {
    try {
      const result = await service.addComment(postId, data);
      if (result.comment) {
        setCurrentComments(prev => [...prev, result.comment]);
        setCurrentPost(prev => prev ? { ...prev, commentCount: (prev.commentCount || 0) + 1 } : prev);
      }
      return result;
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  }, [service]);

  const updateComment = useCallback(async (id, data) => {
    try {
      const result = await service.updateComment(id, data);
      setCurrentComments(prev => prev.map(c => c.id === id ? { ...c, ...result.comment, isEdited: true } : c));
      return result;
    } catch (err) {
      console.error('Error updating comment:', err);
      throw err;
    }
  }, [service]);

  const deleteComment = useCallback(async (id) => {
    try {
      await service.deleteComment(id);
      setCurrentComments(prev => prev.map(c => c.id === id ? { ...c, status: 'deleted', content: '[Изтрит коментар]' } : c));
      setCurrentPost(prev => prev ? { ...prev, commentCount: Math.max(0, (prev.commentCount || 0) - 1) } : prev);
      return true;
    } catch (err) {
      console.error('Error deleting comment:', err);
      return false;
    }
  }, [service]);

  // ============ Spaces ============

  const getSpaces = useCallback(async () => {
    try {
      const data = await service.getSpaces();
      setSpaces(data.spaces || []);
      return data;
    } catch (err) {
      console.error('Error fetching spaces:', err);
      return { spaces: [] };
    }
  }, [service]);

  const joinSpace = useCallback(async (id) => {
    try {
      await service.joinSpace(id);
      setSpaces(prev => prev.map(s => s.id === id ? { ...s, isJoined: true, memberCount: s.memberCount + 1 } : s));
      return true;
    } catch (err) {
      console.error('Error joining space:', err);
      return false;
    }
  }, [service]);

  const leaveSpace = useCallback(async (id) => {
    try {
      await service.leaveSpace(id);
      setSpaces(prev => prev.map(s => s.id === id ? { ...s, isJoined: false, memberCount: Math.max(0, s.memberCount - 1) } : s));
      return true;
    } catch (err) {
      console.error('Error leaving space:', err);
      return false;
    }
  }, [service]);

  const suggestSpace = useCallback(async (data) => {
    try {
      return await service.suggestSpace(data);
    } catch (err) {
      console.error('Error suggesting space:', err);
      throw err;
    }
  }, [service]);

  const getMySpaces = useCallback(async () => {
    try {
      return await service.getMySpaces();
    } catch (err) {
      console.error('Error fetching my spaces:', err);
      return { spaces: [] };
    }
  }, [service]);

  // ============ Reactions ============

  const addReaction = useCallback(async (data) => {
    try {
      return await service.addReaction(data);
    } catch (err) {
      console.error('Error adding reaction:', err);
      throw err;
    }
  }, [service]);

  // ============ Bookmarks ============

  const toggleBookmark = useCallback(async (postId) => {
    try {
      return await service.toggleBookmark(postId);
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      throw err;
    }
  }, [service]);

  const getBookmarks = useCallback(async (params) => {
    try {
      return await service.getBookmarks(params);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      return { bookmarks: [] };
    }
  }, [service]);

  // ============ Other ============

  const sharePost = useCallback(async (postId) => {
    try {
      return await service.sharePost(postId);
    } catch (err) {
      console.error('Error sharing:', err);
    }
  }, [service]);

  const reportContent = useCallback(async (data) => {
    try {
      return await service.report(data);
    } catch (err) {
      console.error('Error reporting:', err);
      throw err;
    }
  }, [service]);

  const votePoll = useCallback(async (pollId, data) => {
    try {
      return await service.votePoll(pollId, data);
    } catch (err) {
      console.error('Error voting:', err);
      throw err;
    }
  }, [service]);

  const getTags = useCallback(async () => {
    try {
      const data = await service.getTags();
      setTags(data.tags || []);
      return data;
    } catch (err) {
      console.error('Error fetching tags:', err);
      return { tags: [] };
    }
  }, [service]);

  const getStats = useCallback(async () => {
    try {
      const data = await service.getStats();
      setStats(data);
      return data;
    } catch (err) {
      console.error('Error fetching stats:', err);
      return null;
    }
  }, [service]);

  const searchPosts = useCallback(async (params) => {
    try {
      return await service.search(params);
    } catch (err) {
      console.error('Error searching:', err);
      return { results: [] };
    }
  }, [service]);

  // ============ Derived state ============

  const isVip = myStatus?.role === 'vip';
  const isBanned = myStatus?.isBanned;
  const hasAcceptedRules = !!myStatus?.rulesAcceptedAt;

  const contextValue = useMemo(() => ({
    isLoading, posts, spaces, tags, stats, myStatus, currentPost, currentComments, pagination,
    isVip, isBanned, hasAcceptedRules,
    getMyStatus, acceptRules,
    getFeed,
    getPost, createPost, updatePost, deletePost,
    addComment, updateComment, deleteComment,
    getSpaces, joinSpace, leaveSpace, suggestSpace, getMySpaces,
    addReaction, toggleBookmark, getBookmarks, sharePost,
    reportContent, votePoll,
    getTags, getStats, searchPosts,
  }), [
    isLoading, posts, spaces, tags, stats, myStatus, currentPost, currentComments, pagination,
    isVip, isBanned, hasAcceptedRules,
    getMyStatus, acceptRules,
    getFeed,
    getPost, createPost, updatePost, deletePost,
    addComment, updateComment, deleteComment,
    getSpaces, joinSpace, leaveSpace, suggestSpace, getMySpaces,
    addReaction, toggleBookmark, getBookmarks, sharePost,
    reportContent, votePoll,
    getTags, getStats, searchPosts,
  ]);

  return (
    <ForumContext.Provider value={contextValue}>
      {children}
    </ForumContext.Provider>
  );
};

export const useForum = () => {
  const context = useContext(ForumContext);
  if (!context) {
    throw new Error('useForum must be used within ForumProvider');
  }
  return context;
};
