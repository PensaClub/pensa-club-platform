/* eslint-disable react-hooks/exhaustive-deps */

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Loader } from "../Loader/Loader";
import { notify } from "../../utils/notify";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "./UserContext";
import { initiativeServiceFactory } from "../Services/initiativeServiceFactory";
import mockData from '../Initiatives/data/mockInitiatives.json';
import projectsData from '../Initiatives/data/mockProjects.json';
import { useMockApplications } from "../hooks/useMockApplications";

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

        return parsed;
      }
    } catch (error) {
      console.error("Error loading bookmarks from localStorage:", error);
    }
    return [];
  });

  //Проектите
  const [projects, setProjects] = useState([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);

  const [bookmarksLoaded, setBookmarksLoaded] = useState(false);
  const [comments, setComments] = useState({});
  const [commentsLoading, setCommentsLoading] = useState(false);

  const { isAuthentication, userEmail, username, profileData, onProjectApplicationSubmit } = useAuthContext();
  const {
    getApplicationsByProject,
    addApplication,
    getAllApplications,
    updateApplicationStatus,
    deleteApplication
  } = useMockApplications();
  const [recentApplications, setRecentApplications] = useState([]);
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

  // Helper functions
  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const getUserDisplayName = useCallback(() => {
    return username || profileData?.details?.firstName || userEmail?.split('@')[0] || 'User';
  }, [username, profileData?.details?.firstName, userEmail]);

  const getAllInitiatives = useCallback(async (page = 1, forceRefresh = false) => {
    if (page === 1 && initiatives.length > 0 && initiativesLoaded && !forceRefresh) {
      return { data: initiatives, hasMore, currentPage };
    }

    try {
      setIsLoading(true);
      const response = await initiativeService.getAllInitiatives(page, 6);

      const responseData = {
        data: response.data || response,
        hasMore: response.hasMore !== undefined ? response.hasMore : (response.data || response).length === 6,
        totalCount: response.totalCount || (response.data || response).length,
        currentPage: page
      };

      if (page === 1) {
        setInitiatives(responseData.data);
      } else {
        setInitiatives(prev => [...prev, ...responseData.data]);
      }

      setHasMore(responseData.hasMore);
      setCurrentPage(responseData.currentPage);
      setInitiativesLoaded(true);

      return responseData;
    } catch (e) {
      console.error('Error fetching initiatives:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
      // В случай на грешка, връщаме празни данни
      return { data: [], hasMore: false, currentPage: page };
    } finally {
      setIsLoading(false);
    }
  }, [initiatives.length, initiativesLoaded, hasMore, currentPage, initiativeService, showErrorAndSetTimeouts]);

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
      const response = await initiativeService.getInitiativeById(id);
      const initiative = response.data || response;

      if (!initiative) {
        throw new Error('Initiative not found');
      }

      setInitiatives(prev => {
        const exists = prev.find(init =>
          init.id === initiative.id || init.slug === initiative.slug
        );

        if (!exists) {
          return [initiative, ...prev];
        }

        return prev.map(init =>
          (init.id === initiative.id || init.slug === initiative.slug)
            ? initiative
            : init
        );
      });

      if (initiative.comments && Array.isArray(initiative.comments)) {
        // ПОПРАВКА: Филтрираме дублирани IDs и разделяме comments от replies
        const processedComments = initiative.comments
          .filter(comment => !comment.parentId) // Само главни коментари
          .map(comment => {
            // Намираме replies за този коментар
            const replies = initiative.comments
              .filter(reply => reply.parentId === comment.id && reply.id !== comment.id)
              .map(reply => ({
                ...reply,
                // Ако reply има същия ID като parent, генерираме нов
                id: reply.id === comment.id ? generateId() : reply.id
              }));

            return {
              ...comment,
              replies: replies
            };
          });

        setComments(prev => ({
          ...prev,
          [initiative.slug]: processedComments,
          [initiative.id]: processedComments
        }));
      }
      return initiative;
    } catch (e) {
      console.error('Error fetching initiative by ID:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [generateId]);

  const toggleBookmark = useCallback(async (initiativeId) => {
    if (!isAuthentication) {
      notify('error', 'Please login to bookmark initiatives');
      return;
    }

    const previousBookmarks = [...bookmarkedInitiatives];
    const wasBookmarked = previousBookmarks.includes(initiativeId);

    try {

      setBookmarkedInitiatives(prev => {
        if (wasBookmarked) {
          return prev.filter(id => id !== initiativeId);
        } else {
          return [...prev, initiativeId];
        }
      });

      const response = await initiativeService.toggleBookmark(initiativeId);
      const apiResponse = response.data || response;

      // Синхронизация с API response (за сигурност)
      if (apiResponse.bookmarked) {
        setBookmarkedInitiatives(prev =>
          prev.includes(initiativeId) ? prev : [...prev, initiativeId]
        );
      } else {
        setBookmarkedInitiatives(prev => prev.filter(id => id !== initiativeId));
      }

      notify('success', apiResponse.message);

    } catch (error) {
      // Rollback при грешка
      setBookmarkedInitiatives(previousBookmarks);
      console.error('Error toggling bookmark:', error);
      notify('error', 'Failed to update bookmark');
    }
  }, [isAuthentication, bookmarkedInitiatives, initiativeService]);

  const loadUserBookmarks = useCallback(async () => {
    if (!isAuthentication || !userEmail) return;

    try {
      const response = await initiativeService.getUserInitiatives(userEmail);
      const userInitiatives = response.data || response;

      // Извлечи ID-тата на букмаркнатите инициативи
      const bookmarkIds = userInitiatives.map(initiative => initiative.id);
      setBookmarkedInitiatives(bookmarkIds);
      setBookmarksLoaded(true);

    } catch (error) {
      console.error('Error loading user bookmarks:', error);
      setBookmarksLoaded(true); // Маркирай като заредени дори при грешка
    }
  }, [isAuthentication, userEmail, initiativeService]);

  const clearBookmarks = useCallback(() => {
    setBookmarkedInitiatives([]);
    setBookmarksLoaded(false);
  }, []);

  useEffect(() => {
    if (isAuthentication && userEmail) {
      loadUserBookmarks();
    } else {
      clearBookmarks();
    }
  }, [isAuthentication, userEmail, clearBookmarks]);

  const getComments = useCallback(async (initiativeId) => {
    try {
      // Проверяваме дали вече имаме коментарите в кеша
      if (comments[initiativeId]) {
        return comments[initiativeId];
      }

      setCommentsLoading(true);

      // Коментарите идват с инициативата от getInitiativeById
      // Ако не са заредени, връщаме празен array
      const cachedComments = comments[initiativeId] || [];
      console.log('Cached comments:', cachedComments);
      setComments(prev => ({
        ...prev,
        [initiativeId]: cachedComments
      }));

      return cachedComments;
    } catch (error) {
      console.error('Error getting comments:', error);
      notify('error', 'Failed to load comments');
      return [];
    } finally {
      setCommentsLoading(false);
    }
  }, [comments]);

const addComment = useCallback(async (initiativeId, content, parentId = null) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      // Намираме numeric ID за API-то
      let commentableId = initiativeId;
      let initiative = null;

      if (typeof initiativeId === 'string') {
        if (Number.isFinite(Number(initiativeId))) {
          commentableId = Number(initiativeId);
        } else {
          // Ако е slug, търсим инициативата
          initiative = initiatives.find(init => init.slug === initiativeId);
          if (initiative && initiative.id) {
            commentableId = initiative.id;
          } else {
            throw new Error(`Cannot find initiative: ${initiativeId}`);
          }
        }
      }

      const commentData = {
        content: content,
        commentableId: commentableId,
        commentsLinkConnection: 'initiative',
        ...(parentId && { parentId })
      };

      console.log('Sending to API:', commentData);

      const response = await initiativeService.createComment(commentData);
      let newComment = response.data || response;

      console.log('Received from API:', newComment);

      // ✅ АКО ID-то е дублирано, създаваме локален уникален ID
      if (parentId && newComment.id === parentId) {
        console.warn('🐛 API bug: Reply has same ID as parent. Creating unique local ID.');
        
        const uniqueLocalId = `${newComment.id}_${Date.now()}`;
        
        newComment = {
          ...newComment,
          id: uniqueLocalId,
          originalId: newComment.id,
          content: content,
          isLocalGenerated: true,
          localTimestamp: Date.now(),
          replies: [] // ✅ ФОРСИРАМЕ празни replies за новия reply
        };
      } else {
        // ✅ КЛЮЧОВА ПОПРАВКА: Премахваме replies от новия коментар
        newComment = {
          ...newComment,
          content: content,
          localTimestamp: Date.now(),
          replies: [] // ✅ Новият reply няма собствени replies
        };
      }

      // Обновяваме локалното състояние
      setComments(prev => {
        const currentComments = prev[initiativeId] || [];

        if (parentId) {
          // Това е reply
          const updatedComments = currentComments.map(comment => {
            if (comment.id === parentId) {
              const existingReplies = comment.replies || [];
              
              // Проверка за дублиране
              const now = Date.now();
              const isDuplicate = existingReplies.some(reply => {
                const timeDiff = now - (reply.localTimestamp || 0);
                const contentMatch = reply.content === newComment.content && timeDiff < 5000;
                const idMatch = reply.id === newComment.id;
                
                return contentMatch || idMatch;
              });

              if (isDuplicate) {
                console.warn('Duplicate reply detected, skipping');
                return comment;
              }

              console.log('Adding new reply to comment:', parentId);
              return {
                ...comment,
                replies: [...existingReplies, newComment] // ✅ newComment вече няма replies
              };
            }
            return comment;
          });

          return {
            ...prev,
            [initiativeId]: updatedComments
          };
        } else {
          // Това е нов основен коментар
          const existingComments = prev[initiativeId] || [];
          
          // Проверяваме за дублиране на основни коментари
          const now = Date.now();
          const isDuplicate = existingComments.some(comment => {
            const timeDiff = now - (comment.localTimestamp || 0);
            const contentMatch = comment.content === newComment.content && timeDiff < 5000;
            const idMatch = comment.id === newComment.id;
            
            return contentMatch || idMatch;
          });

          if (isDuplicate) {
            console.warn('Duplicate comment detected, not adding');
            return prev;
          }

          console.log('Adding new main comment');
          return {
            ...prev,
            [initiativeId]: [newComment, ...existingComments]
          };
        }
      });

      notify('success', 'Comment added successfully');
      return newComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      notify('error', 'Failed to add comment');
      throw error;
    }
}, [isAuthentication, initiativeService, initiatives]);

const updateComment = useCallback(async (initiativeId, commentId, newContent) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      // Използваме originalId ако е локално генериран
      let apiCommentId = commentId;
      if (typeof commentId === 'string' && commentId.includes('_')) {
        apiCommentId = commentId.split('_')[0];
      }

      const response = await initiativeService.updateComment(apiCommentId, { content: newContent });
      const updatedComment = response.data || response;

      // Обновяваме локалното състояние с локалния ID
      setComments(prev => {
        const currentComments = prev[initiativeId] || [];
        const updatedComments = currentComments.map(comment => {
          if (comment.id === commentId) {
            return { ...updatedComment, id: commentId }; // Запазваме локалния ID
          }
          if (comment.replies) {
            const updatedReplies = comment.replies.map(reply =>
              reply.id === commentId ? { ...updatedComment, id: commentId } : reply
            );
            return { ...comment, replies: updatedReplies };
          }
          return comment;
        });

        return {
          ...prev,
          [initiativeId]: updatedComments
        };
      });

      notify('success', 'Comment updated successfully');
      return { ...updatedComment, id: commentId };
    } catch (error) {
      console.error('Error updating comment:', error);
      notify('error', 'Failed to update comment');
      throw error;
    }
}, [isAuthentication, initiativeService]);

const deleteComment = useCallback(async (initiativeId, commentId) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      // Използваме originalId ако е локално генериран
      let apiCommentId = commentId;
      if (typeof commentId === 'string' && commentId.includes('_')) {
        apiCommentId = commentId.split('_')[0];
      }

      await initiativeService.deleteComment(apiCommentId);

      setComments(prev => {
        const currentComments = prev[initiativeId] || [];
        const updatedComments = currentComments.filter(comment => {
          if (comment.id === commentId) {
            return false;
          }
          if (comment.replies) {
            comment.replies = comment.replies.filter(reply => reply.id !== commentId);
          }
          return true;
        });

        return {
          ...prev,
          [initiativeId]: updatedComments
        };
      });

      notify('success', 'Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      notify('error', 'Failed to delete comment');
      throw error;
    }
}, [isAuthentication, initiativeService]);

const likeComment = useCallback(async (initiativeId, commentId) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      // Ако е локално генериран ID, използваме originalId за API-то
      let apiCommentId = commentId;
      
      // Проверяваме дали е локално генериран ID (съдържа underscore)
      if (typeof commentId === 'string' && commentId.includes('_')) {
        // Извличаме оригиналния ID
        apiCommentId = commentId.split('_')[0];
        console.log('Using original ID for API:', apiCommentId);
      }

      const response = await initiativeService.likeComment(apiCommentId);
      const updatedData = response.data || response;

      setComments(prev => {
        const currentComments = prev[initiativeId] || [];
        const updatedComments = currentComments.map(comment => {
          // Проверяваме дали е главен коментар
          if (comment.id === commentId) {
            return { ...comment, ...updatedData };
          }
          
          // Проверяваме в replies
          if (comment.replies && comment.replies.length > 0) {
            const updatedReplies = comment.replies.map(reply => {
              if (reply.id === commentId) {
                return { ...reply, ...updatedData };
              }
              return reply;
            });
            
            // Само ако има промяна в replies, обновяваме коментара
            if (JSON.stringify(updatedReplies) !== JSON.stringify(comment.replies)) {
              return { ...comment, replies: updatedReplies };
            }
          }
          
          return comment;
        });

        return {
          ...prev,
          [initiativeId]: updatedComments
        };
      });

      return updatedData;
    } catch (error) {
      console.error('Error liking comment:', error);
      notify('error', 'Failed to like comment');
      throw error;
    }
}, [isAuthentication, initiativeService]);

  // Projects functions да ги ...
  const getMockProjects = useCallback(async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: projectsData.projects,
          totalCount: projectsData.projects.length
        });
      }, 200);
    });
  }, []);

  const getAllProjects = useCallback(async (forceRefresh = false) => {
    if (projects.length > 0 && projectsLoaded && !forceRefresh) {
      return { data: projects };
    }

    try {
      setIsLoading(true);
      const response = await getMockProjects();
      setProjects(response.data);
      setProjectsLoaded(true);
      return response;
    } catch (e) {
      console.error('Error fetching projects:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [projects.length, projectsLoaded, getMockProjects, showErrorAndSetTimeouts]);

  const getProjectById = useCallback(async (id) => {
    try {
      setIsLoading(true);

      if (!projectsData || !projectsData.projects) {
        console.error('Липсват данни за проектите:', projectsData);
        throw new Error('Projects data not available');
      }

      // Търси проекта по id или slug - уверете се, че типовете съвпадат  
      const project = projectsData.projects.find(proj => {
        const idMatch = String(proj.id) === String(id);
        const slugMatch = String(proj.slug) === String(id);

        return idMatch || slugMatch;
      });

      if (!project) {
        throw new Error(`Project not found with id/slug: ${id}`);
      }

      setCurrentProject(project);
      return project;
    } catch (e) {
      console.error('Error fetching project by ID:', e);
      notify('error', e.message || e);
      showErrorAndSetTimeouts(e.message);
      throw e; // Важно: хвърли грешката отново за да се обработи от компонента
    } finally {
      setIsLoading(false);
    }
  }, [showErrorAndSetTimeouts]);

  const getProjectsByInitiative = useCallback(async (initiativeId) => {
    try {
      const allProjects = await getMockProjects();
      const initiativeProjects = allProjects.data.filter(
        project => project.initiativeId === parseInt(initiativeId)
      );
      return { data: initiativeProjects };
    } catch (e) {
      console.error('Error fetching projects by initiative:', e);
      throw e;
    }
  }, [getMockProjects]);

  // Project comments (similar to initiative comments)
  const getProjectComments = useCallback(async (projectId) => {
    try {
      if (comments[`project-${projectId}`]) {
        return comments[`project-${projectId}`];
      }

      setCommentsLoading(true);
      const project = projectsData.projects.find(proj =>
        proj.id === projectId || proj.slug === projectId
      );

      if (!project) {
        throw new Error('Project not found');
      }

      const projectComments = Array.isArray(project.comments) ? project.comments : [];
      setComments(prev => ({
        ...prev,
        [`project-${projectId}`]: projectComments
      }));

      return projectComments;
    } catch (error) {
      console.error('Error getting project comments:', error);
      notify('error', 'Failed to load comments');
      return [];
    } finally {
      setCommentsLoading(false);
    }
  }, [comments]);

  const addProjectComment = useCallback(async (projectId, content) => {
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

      setComments(prev => ({
        ...prev,
        [`project-${projectId}`]: [newComment, ...(prev[`project-${projectId}`] || [])]
      }));

      notify('success', 'Comment added successfully');
      return newComment;
    } catch (error) {
      console.error('Error adding project comment:', error);
      notify('error', 'Failed to add comment');
      throw error;
    }
  }, [isAuthentication, generateId, userEmail, getUserDisplayName, profileData?.avatar]);

  const updateProjectComment = useCallback(async (projectId, commentId, newContent) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      const projectKey = `project-${projectId}`;
      const updatedComments = (comments[projectKey] || []).map(comment => {
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
        [projectKey]: updatedComments
      }));

      const updatedComment = updatedComments.find(c => c.id === commentId);
      notify('success', 'Comment updated successfully');
      return updatedComment;
    } catch (error) {
      console.error('Error updating project comment:', error);
      notify('error', 'Failed to update comment');
      throw error;
    }
  }, [isAuthentication, comments]);

  const deleteProjectComment = useCallback(async (projectId, commentId) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      const projectKey = `project-${projectId}`;
      setComments(prev => ({
        ...prev,
        [projectKey]: (prev[projectKey] || []).filter(comment => comment.id !== commentId)
      }));

      notify('success', 'Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting project comment:', error);
      notify('error', 'Failed to delete comment');
      throw error;
    }
  }, [isAuthentication])

  const likeProjectComment = useCallback(async (projectId, commentId) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      const projectKey = `project-${projectId}`;
      const updatedComments = (comments[projectKey] || []).map(comment => {
        if (comment.id === commentId) {
          const isLiked = (comment.likes || []).includes(userEmail);
          return {
            ...comment,
            likes: isLiked
              ? (comment.likes || []).filter(email => email !== userEmail)
              : [...(comment.likes || []), userEmail],
            likesCount: isLiked
              ? (comment.likesCount || 0) - 1
              : (comment.likesCount || 0) + 1
          };
        }
        return comment;
      });

      setComments(prev => ({
        ...prev,
        [projectKey]: updatedComments
      }));

      return updatedComments.find(c => c.id === commentId);
    } catch (error) {
      console.error('Error liking project comment:', error);
      notify('error', 'Failed to like comment');
      throw error;
    }
  }, [isAuthentication, userEmail, comments]);

  const addProjectReply = useCallback(async (projectId, parentCommentId, content) => {
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

      const projectKey = `project-${projectId}`;
      const updatedComments = (comments[projectKey] || []).map(comment => {
        if (comment.id === parentCommentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply] // ← Ред 354 вероятно е тук
          };
        }
        return comment;
      });

      setComments(prev => ({
        ...prev,
        [projectKey]: updatedComments
      }));

      notify('success', 'Reply added successfully');
      return newReply;
    } catch (error) {
      console.error('Error adding project reply:', error);
      notify('error', 'Failed to add reply');
      throw error;
    }
  }, [isAuthentication, generateId, userEmail, getUserDisplayName, profileData?.avatar, comments]);

  const likeProjectReply = useCallback(async (projectId, commentId, replyId) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      const projectKey = `project-${projectId}`;
      const updatedComments = (comments[projectKey] || []).map(comment => {
        if (comment.id === commentId) {
          const updatedReplies = (comment.replies || []).map(reply => {
            if (reply.id === replyId) {
              const isLiked = (reply.likes || []).includes(userEmail);
              return {
                ...reply,
                likes: isLiked
                  ? (reply.likes || []).filter(email => email !== userEmail)
                  : [...(reply.likes || []), userEmail],
                likesCount: isLiked
                  ? (reply.likesCount || 0) - 1
                  : (reply.likesCount || 0) + 1
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
        [projectKey]: updatedComments
      }));

      return updatedComments.find(c => c.id === commentId);
    } catch (error) {
      console.error('Error liking project reply:', error);
      notify('error', 'Failed to like reply');
      throw error;
    }
  }, [isAuthentication, userEmail, comments]);

  // UPDATE PROJECT REPLY
  const updateProjectReply = useCallback(async (projectId, commentId, replyId, newContent) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      const projectKey = `project-${projectId}`;
      const updatedComments = (comments[projectKey] || []).map(comment => {
        if (comment.id === commentId) {
          const updatedReplies = (comment.replies || []).map(reply => {
            if (reply.id === replyId) {
              return {
                ...reply,
                content: newContent,
                updatedAt: new Date().toISOString()
              };
            }
            return reply;
          });
          return { ...comment, replies: updatedReplies };
        }
        return comment;
      });

      setComments(prev => ({ ...prev, [projectKey]: updatedComments }));

      const updatedComment = updatedComments.find(c => c.id === commentId);
      notify('success', 'Reply updated successfully');
      return updatedComment;
    } catch (error) {
      console.error('Error updating project reply:', error);
      notify('error', 'Failed to update reply');
      throw error;
    }
  }, [isAuthentication, comments]);

  // DELETE PROJECT REPLY
  const deleteProjectReply = useCallback(async (projectId, commentId, replyId) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      const projectKey = `project-${projectId}`;
      const updatedComments = (comments[projectKey] || []).map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: (comment.replies || []).filter(reply => reply.id !== replyId)
          };
        }
        return comment;
      });

      setComments(prev => ({ ...prev, [projectKey]: updatedComments }));

      const updatedComment = updatedComments.find(c => c.id === commentId);
      notify('success', 'Reply deleted successfully');
      return updatedComment;
    } catch (error) {
      console.error('Error deleting project reply:', error);
      notify('error', 'Failed to delete reply');
      throw error;
    }
  }, [isAuthentication, comments]);

  // Функция за зареждане на кандидатури за проект
  const getProjectApplications = useCallback(async (projectId) => {
    if (!projectId) return;

    try {
      const projectApplications = await getApplicationsByProject(projectId);
      setRecentApplications(projectApplications);
      return projectApplications;
    } catch (error) {
      console.error('Error loading project applications:', error);
      setRecentApplications([]);
      return [];
    }
  }, [getApplicationsByProject]);

  // Функция за добавяне на нова кандидатура
  const applyToProject = useCallback(async (projectId, applicationData) => {
    if (!projectId || !applicationData) return;

    try {
      setIsLoading(true);

      // 1. Изпращаме заявката към сървъра чрез UserContext (за уведомления)
      const response = await onProjectApplicationSubmit({
        projectId,
        ...applicationData
      });

      // 2. Ако заявката е успешна, обновяваме данните чрез хука
      if (response.success) {
        const newApplication = await addApplication({
          ...applicationData,
          projectId
        });

        // Обновяваме локалното състояние за текущия проект
        setRecentApplications(prev => {
          const filtered = prev.filter(app => app.id !== newApplication.id);
          return [newApplication, ...filtered.slice(0, 4)];
        });

        return { success: true, application: newApplication };
      }

      return response;

    } catch (error) {
      console.error('Error applying to project:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [onProjectApplicationSubmit, addApplication]);

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
    loadUserBookmarks,
    clearBookmarks,

    // Comments functions
    getComments,
    addComment,
    updateComment,
    deleteComment,
    likeComment,
    comments,
    commentsLoading,

    //bookmarks
    bookmarkedInitiatives,
    toggleBookmark,
    isBookmarked: (id) => bookmarkedInitiatives.includes(id),
    hasBookmarks: bookmarkedInitiatives.length > 0,

    // Project functions
    getAllProjects,
    getProjectById,
    getProjectsByInitiative,
    projects,
    currentProject,
    projectsLoaded,

    // Project comments
    getProjectComments,
    addProjectComment,
    updateProjectComment,
    deleteProjectComment,
    likeProjectComment,
    addProjectReply,
    likeProjectReply,
    updateProjectReply,
    deleteProjectReply,
    getProjectApplications,
    recentApplications,
    applyToProject,
    getAllApplications, // За админи
    updateApplicationStatus, // За админи  
    deleteApplication, // За админи

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