
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Loader } from "../Loader/Loader";
import { notify } from "../../utils/notify";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "./UserContext";
import { initiativeServiceFactory } from "../Services/initiativeServiceFactory";
import mockData from '../Initiatives/data/mockInitiatives.json';

export const InitiativeContext = createContext();

export const InitiativeProvider = ({ children }) => {

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [initiatives, setInitiatives] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [initiativesLoaded, setInitiativesLoaded] = useState(false);
  const [bookmarkedInitiatives, setBookmarkedInitiatives] = useState(() => {
    try {
      const saved = localStorage.getItem('bookmarkedInitiatives');
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log("Initial load from localStorage:", parsed);
        return parsed;
      }
    } catch (error) {
      console.error("Error loading bookmarks from localStorage:", error);
    }
    return [];
  });
  
  const [bookmarksLoaded, setBookmarksLoaded] = useState(false);
  const [comments, setComments] = useState({});
  const [commentsLoading, setCommentsLoading] = useState(false);

  const { isAuthentication, userEmail, username, profileData } = useAuthContext();
  const navigate = useNavigate();

  const initiativeService = initiativeServiceFactory();

  const showErrorAndSetTimeouts = useCallback((error) => {
    setErrorMessage(error);
    setIsLoading(false);
    setTimeout(() => {
      setErrorMessage('');
      setIsLoading(false);
    }, 3000);
  }, []);

  // useEffect(() => {
  //   const saved = localStorage.getItem('bookmarkedInitiatives');
  //   if (saved) {
  //     try {
  //       const parsed = JSON.parse(saved);
  //       setBookmarkedInitiatives(parsed);
  //       console.log("Loaded bookmarks from localStorage:", parsed);
  //     } catch (error) {
  //       console.error("Error parsing bookmarks from localStorage:", error);
  //     }
  //   }
  //   setBookmarksLoaded(true); // Маркираме че сме заредили
  // }, []);

  // Записване в localStorage - само СЛЕД като сме заредили от localStorage
  useEffect(() => {
    if (bookmarksLoaded) { // Записваме само след като сме заредили
      localStorage.setItem('bookmarkedInitiatives', JSON.stringify(bookmarkedInitiatives));
      console.log("Saved bookmarks to localStorage:", bookmarkedInitiatives);
    }
  }, [bookmarkedInitiatives, bookmarksLoaded]);

  // Helper functions
  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const getUserDisplayName = useCallback(() => {
    return username || profileData?.details?.firstName || userEmail?.split('@')[0] || 'User';
  }, [username, profileData?.details?.firstName, userEmail]);

  // Existing initiative functions
  const getMockInitiatives = useCallback(async (page = 1, limit = 6) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = mockData.initiatives.slice(startIndex, endIndex);

        resolve({
          data: paginatedData,
          hasMore: endIndex < mockData.initiatives.length,
          totalCount: mockData.initiatives.length,
          currentPage: page
        });
      }, 200);
    });
  }, []);

  const getAllInitiatives = useCallback(async (page = 1, forceRefresh = false) => {
    if (page === 1 && initiatives.length > 0 && initiativesLoaded && !forceRefresh) {
      return { data: initiatives, hasMore, currentPage };
    }

    try {
      setIsLoading(true);
      const response = await getMockInitiatives(page, 6);

      if (page === 1) {
        setInitiatives(response.data);
      } else {
        setInitiatives(prev => [...prev, ...response.data]);
      }

      setHasMore(response.hasMore);
      setCurrentPage(response.currentPage);
      setInitiativesLoaded(true);

      return response;
    } catch (e) {
      console.error('Error fetching initiatives:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [initiatives.length, initiativesLoaded, hasMore, currentPage, getMockInitiatives, showErrorAndSetTimeouts]);

  const loadMoreInitiatives = useCallback(async () => {
    if (!hasMore || isLoading) return;
    const nextPage = currentPage + 1;
    await getAllInitiatives(nextPage);
  }, [hasMore, isLoading, currentPage, getAllInitiatives]);

  const invalidateInitiativesCache = useCallback(() => {
    setInitiativesLoaded(false);
    setInitiatives([]);
    setCurrentPage(1);
    setHasMore(true);
  }, []);

  const getInitiativeById = useCallback(async (id) => {
    try {
      setIsLoading(true);
      const initiative = mockData.initiatives.find(init =>
        init.id === parseInt(id) || init.slug === id
      );

      if (!initiative) {
        throw new Error('Initiative not found');
      }

      return initiative;
    } catch (e) {
      console.error('Error fetching initiative by ID:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [showErrorAndSetTimeouts]);

  const toggleBookmark = useCallback((initiativeId) => {
    setBookmarkedInitiatives(prev => {
      if (prev.includes(initiativeId)) {
        return prev.filter(id => id !== initiativeId);
      } else {
        return [...prev, initiativeId];
      }
    });
  }, []);

  const getComments = useCallback(async (initiativeId) => {
    try {
      // Проверяваме дали вече имаме коментарите в кеша
      if (comments[initiativeId]) {
        return comments[initiativeId];
      }

      setCommentsLoading(true);

      // Find initiative in mock data
      const initiative = mockData.initiatives.find(init =>
        init.id === parseInt(initiativeId) || init.slug === initiativeId
      );

      if (!initiative) {
        throw new Error('Initiative not found');
      }

      // Cache comments in state - със защита
      const initiativeComments = Array.isArray(initiative.comments) ? initiative.comments : [];
      setComments(prev => ({
        ...prev,
        [initiativeId]: initiativeComments
      }));

      return initiativeComments;
    } catch (error) {
      console.error('Error getting comments:', error);
      notify('error', 'Failed to load comments');
      return []; // Връщаме празен array вместо да хвърляме грешка
    } finally {
      setCommentsLoading(false);
    }
  }, [comments]);

  const addComment = useCallback(async (initiativeId, content) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      const newComment = {
        id: generateId(),
        userId: userEmail,
        userEmail: userEmail,
        userName: getUserDisplayName(),
        userAvatar: profileData?.avatar || null,
        content: content,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        likes: [],
        likesCount: 0,
        replies: []
      };

      // Update local state
      setComments(prev => ({
        ...prev,
        [initiativeId]: [newComment, ...(prev[initiativeId] || [])]
      }));

      notify('success', 'Comment added successfully');
      return newComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      notify('error', 'Failed to add comment');
      throw error;
    }
  }, [isAuthentication, generateId, userEmail, getUserDisplayName, profileData?.avatar]);

  const updateComment = useCallback(async (initiativeId, commentId, newContent) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      const updatedComments = comments[initiativeId].map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            content: newContent,
            updatedAt: new Date().toISOString()
          };
        }
        return comment;
      });

      setComments(prev => ({
        ...prev,
        [initiativeId]: updatedComments
      }));

      const updatedComment = updatedComments.find(c => c.id === commentId);
      notify('success', 'Comment updated successfully');
      return updatedComment;
    } catch (error) {
      console.error('Error updating comment:', error);
      notify('error', 'Failed to update comment');
      throw error;
    }
  }, [isAuthentication, comments]);

  const deleteComment = useCallback(async (initiativeId, commentId) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      setComments(prev => ({
        ...prev,
        [initiativeId]: prev[initiativeId].filter(comment => comment.id !== commentId)
      }));

      notify('success', 'Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      notify('error', 'Failed to delete comment');
      throw error;
    }
  }, [isAuthentication]);

  const likeComment = useCallback(async (initiativeId, commentId) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      const updatedComments = comments[initiativeId].map(comment => {
        if (comment.id === commentId) {
          const isLiked = comment.likes.includes(userEmail);
          return {
            ...comment,
            likes: isLiked
              ? comment.likes.filter(email => email !== userEmail)
              : [...comment.likes, userEmail],
            likesCount: isLiked
              ? comment.likesCount - 1
              : comment.likesCount + 1
          };
        }
        return comment;
      });

      setComments(prev => ({
        ...prev,
        [initiativeId]: updatedComments
      }));

      return updatedComments.find(c => c.id === commentId);
    } catch (error) {
      console.error('Error liking comment:', error);
      notify('error', 'Failed to like comment');
      throw error;
    }
  }, [isAuthentication, userEmail, comments]);

  const addReply = useCallback(async (initiativeId, parentCommentId, content) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      const newReply = {
        id: generateId(),
        userId: userEmail,
        userEmail: userEmail,
        userName: getUserDisplayName(),
        userAvatar: profileData?.avatar || null,
        content: content,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        likes: [],
        likesCount: 0,
        parentId: parentCommentId
      };

      const updatedComments = comments[initiativeId].map(comment => {
        if (comment.id === parentCommentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }
        return comment;
      });

      setComments(prev => ({
        ...prev,
        [initiativeId]: updatedComments
      }));

      notify('success', 'Reply added successfully');
      return newReply;
    } catch (error) {
      console.error('Error adding reply:', error);
      notify('error', 'Failed to add reply');
      throw error;
    }
  }, [isAuthentication, generateId, userEmail, getUserDisplayName, profileData?.avatar, comments]);

  const likeReply = useCallback(async (initiativeId, commentId, replyId) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      const updatedComments = comments[initiativeId].map(comment => {
        if (comment.id === commentId) {
          const updatedReplies = comment.replies.map(reply => {
            if (reply.id === replyId) {
              const isLiked = reply.likes.includes(userEmail);
              return {
                ...reply,
                likes: isLiked
                  ? reply.likes.filter(email => email !== userEmail)
                  : [...reply.likes, userEmail],
                likesCount: isLiked
                  ? reply.likesCount - 1
                  : reply.likesCount + 1
              };
            }
            return reply;
          });

          return {
            ...comment,
            replies: updatedReplies
          };
        }
        return comment;
      });

      setComments(prev => ({
        ...prev,
        [initiativeId]: updatedComments
      }));

      return updatedComments.find(c => c.id === commentId);
    } catch (error) {
      console.error('Error liking reply:', error);
      notify('error', 'Failed to like reply');
      throw error;
    }
  }, [isAuthentication, userEmail, comments]);

  const contextService = {
    // Existing initiative functions
    getAllInitiatives,
    loadMoreInitiatives,
    invalidateInitiativesCache,
    getInitiativeById,
    initiatives,
    hasMore,
    currentPage,
    isLoading,
    initiativesLoaded,

    // Comments functions
    getComments,
    addComment,
    updateComment,
    deleteComment,
    likeComment,
    addReply,
    likeReply,
    comments,
    commentsLoading,

    //bookmarks
    bookmarkedInitiatives,
    toggleBookmark,
    isBookmarked: (id) => bookmarkedInitiatives.includes(id),
    hasBookmarks: bookmarkedInitiatives.length > 0,
  };

  return (
    <InitiativeContext.Provider value={contextService}>
      {children}
      {isLoading && <Loader />}
    </InitiativeContext.Provider>
  );
};

export const useInitiativeContext = () => {
  const context = useContext(InitiativeContext);
  return context;
};