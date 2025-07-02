/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Loader } from "../Loader/Loader";
import { notify } from "../../utils/notify";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "./UserContext";
import { initiativeServiceFactory } from "../Services/initiativeServiceFactory";
import projectsData from '../Initiatives/data/mockProjects.json';
import { useMockApplications } from "../hooks/useMockApplications";
import storiesData from '../Initiatives/data/mockStories.json';
import publicationsData from '../Initiatives/data/mockPublications.json';
import { draftLocalStorage } from "../Initiatives/CreateIniciative/Utils/draftLocalStorage";
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
  const [bookMarkedProjects, setBookmarkedProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('bookMarkedProjects');
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
  // Draft states
  const [drafts, setDrafts] = useState([]);
  const [draftsLoaded, setDraftsLoaded] = useState(false);
  const [draftsHasMore, setDraftsHasMore] = useState(true);
  const [draftsCurrentPage, setDraftsCurrentPage] = useState(1);
  const navigate = useNavigate();

  const initiativeService = initiativeServiceFactory();

  const showErrorAndSetTimeouts = useCallback((error) => {
    setErrorMessage(error);
    setIsLoading(false);
    setTimeout(() => {
      setErrorMessage('');
      setIsLoading(false);
    }, 1000);
  }, []);
  useEffect(() => {
    localStorage.setItem('bookMarkedProjects', JSON.stringify(bookMarkedProjects));
  }, [bookMarkedProjects]);

  // Същото правете и за bookmarkedInitiatives ако липсва:
  useEffect(() => {
    localStorage.setItem('bookmarkedInitiatives', JSON.stringify(bookmarkedInitiatives));
  }, [bookmarkedInitiatives]);
  // Helper functions
  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const getUserDisplayName = useCallback(() => {
    return username || profileData?.details?.firstName || userEmail?.split('@')[0] || 'User';
  }, [username, profileData?.details?.firstName, userEmail]);
  // Draft functions
  const getAllDrafts = useCallback(async (page = 1, forceRefresh = false) => {
    if (page === 1 && drafts.length > 0 && draftsLoaded && !forceRefresh) {
      return {
        data: drafts,
        hasMore: draftsHasMore,
        currentPage: draftsCurrentPage,
        pagination: {
          totalPages: Math.ceil(drafts.length / 6),
          totalInitiatives: drafts.length
        }
      };
    }

    try {
      setIsLoading(true);
      const response = await initiativeService.getAllDrafts(page, 6);

      // ВАЖНО: Вземаме pagination от response
      const responseData = {
        data: response.data || [],
        pagination: response.pagination, // Вземаме целия pagination обект
        hasMore: response.pagination?.hasNextPage || false,
        totalCount: response.pagination?.totalInitiatives || 0,
        currentPage: response.pagination?.page || page
      };

      if (page === 1) {
        setDrafts(responseData.data);
      } else {
        setDrafts(prev => [...prev, ...responseData.data]);
      }

      setDraftsHasMore(responseData.hasMore);
      setDraftsCurrentPage(responseData.currentPage);
      setDraftsLoaded(true);

      return responseData;
    } catch (e) {
      console.error('Error fetching drafts:', e);
      return {
        data: [],
        hasMore: false,
        currentPage: page,
        pagination: { totalPages: 0, totalInitiatives: 0 }
      };
    } finally {
      setIsLoading(false);
    }
  }, [drafts.length, draftsLoaded, draftsHasMore, draftsCurrentPage, initiativeService]);

  const toggleDraftStatus = useCallback(async (identifier) => {
    if (!isAuthentication) {
      notify('error', 'Authentication required');
      return;
    }

    try {
      setIsLoading(true);
      const response = await initiativeService.toggleDraftStatus(identifier);

      // Ако е успешно публикувана, премахваме от drafts списъка
      const publishedInitiative = response.data || response;
      if (!publishedInitiative.isDraft) {
        setDrafts(prev => prev.filter(draft =>
          draft.id !== publishedInitiative.id &&
          draft.slug !== publishedInitiative.slug
        ));

        notify('success', 'Инициативата е публикувана успешно!');

        navigate(`/initiatives/${publishedInitiative.slug || publishedInitiative.id}`);
      }

      return publishedInitiative;
    } catch (error) {
      console.error('Error toggling draft status:', error);
      notify('error', 'Failed to publish draft');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthentication, initiativeService, navigate]);

  const updateDraftInitiative = useCallback(async (id, draftData) => {
    if (!isAuthentication) {
      notify('error', 'Authentication required');
      return;
    }

    try {
      setIsLoading(true);
      const response = await initiativeService.updateDraftInitiative(id, draftData);

      // Обновяваме draft-а в локалното състояние
      setDrafts(prev => prev.map(draft =>
        draft.id === id ? (response.data || response) : draft
      ));

      notify('success', 'Draft updated successfully!');
      return response;
    } catch (error) {
      console.error('Error updating draft:', error);
      notify('error', 'Failed to update draft');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthentication, initiativeService]);

  const getDraftById = useCallback(async (id) => {
    try {
      setIsLoading(true);
      const response = await initiativeService.getDraftById(id);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching draft by ID:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [initiativeService]);

  // Функция за изтриване на draft с пълна синхронизация
  const deleteDraftWithSync = useCallback(async (identifier, draftObject = null, fromLocalStorage = false) => {
    if (!isAuthentication && !fromLocalStorage) {
      notify('error', 'Authentication required');
      return;
    }

    try {
      setIsLoading(true);

      // 1. Ако изтриваме от localStorage
      if (fromLocalStorage) {
        const localDraft = draftLocalStorage.getDraft();
        if (localDraft) {
          // Проверяваме дали има такъв draft на сървъра
          try {
            const serverDraftId = localDraft.data.id || localDraft.data.slug;
            if (serverDraftId) {
              // Опитваме се да изтрием и от сървъра
              await initiativeService.deleteDraftInitiative(serverDraftId);

              // Премахваме от локалното състояние
              setDrafts(prev => prev.filter(draft =>
                draft.id !== serverDraftId &&
                draft.slug !== serverDraftId
              ));
            }
          } catch (error) {
            console.warn('Draft not found on server or already deleted:', error);
          }
        }

        // Изтриваме от localStorage
        draftLocalStorage.clearDraft();
        notify('success', 'Draft cleared from local storage!');
      }
      // 2. Ако изтриваме от сървъра
      else {
        // Изпращаме заявката към сървъра
        await initiativeService.deleteDraftInitiative(identifier);

        // Обновяваме локалното състояние
        if (draftObject) {
          setDrafts(prev => prev.filter(draft => draft.id !== draftObject.id));
        } else {
          setDrafts(prev => prev.filter(draft =>
            draft.id !== identifier &&
            draft.slug !== identifier &&
            draft.id.toString() !== identifier.toString()
          ));
        }

        // Проверяваме дали трябва да изтрием и от localStorage
        if (draftLocalStorage.isDraftMatching(identifier)) {
          draftLocalStorage.clearDraft();
          console.log('Synchronized: Removed matching draft from localStorage');
        }

        notify('success', 'Draft deleted successfully!');
      }

      return true;
    } catch (error) {
      console.error('Error deleting draft:', error);
      notify('error', fromLocalStorage ? 'Failed to clear draft' : 'Failed to delete draft');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthentication, initiativeService]);

  // В InitiativeProvider.js
  const deleteDraftInitiative = useCallback(async (identifier, draftObject = null) => {
    return deleteDraftWithSync(identifier, draftObject, false);
  }, [deleteDraftWithSync]);

  const clearLocalStorageDraft = useCallback(async () => {
    return deleteDraftWithSync(null, null, true);
  }, [deleteDraftWithSync]);

  const invalidateDraftsCache = useCallback(() => {
    setDraftsLoaded(false);
    setDrafts([]);
    setDraftsCurrentPage(1);
    setDraftsHasMore(true);
  }, []);

  const getAllInitiatives = useCallback(async (page = 1, forceRefresh = false) => {
    if (page === 1 && initiatives.length > 0 && initiativesLoaded && !forceRefresh) {
      return { data: initiatives, hasMore, currentPage };
    }

    try {
      setIsLoading(true);
      const response = await initiativeService.getAllInitiatives(page, 6);

      const responseData = {
        data: response.data || response,
        hasMore: response.pagination?.hasNextPage || false,
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

  const createInitiative = useCallback(async (initiativeData) => {
    if (!isAuthentication) {
      notify('error', 'Authentication required');
      return;
    }

    try {
      setIsLoading(true);
      const response = await initiativeService.createInitiative(initiativeData);

      // Добавям новата инициатива в локалното състояние
      setInitiatives(prev => [response.data || response, ...prev]);

      notify('success', 'Initiative created successfully!');
      return response;
    } catch (error) {
      console.error('Error creating initiative:', error);
      notify('error', 'Failed to create initiative');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthentication, initiativeService]);

  const saveDraftInitiative = useCallback(async (draftData) => {
    if (!isAuthentication) {
      notify('error', 'Authentication required');
      return;
    }

    try {
      const response = await initiativeService.saveDraftInitiative(draftData);
      notify('success', 'Draft saved successfully!');
      return response;
    } catch (error) {
      console.error('Error saving draft:', error);
      notify('error', 'Failed to save draft');
      throw error;
    }
  }, [isAuthentication, initiativeService]);

  const getDraftInitiative = useCallback(async (userId) => {
    try {
      const response = await initiativeService.getDraftInitiative(userId);
      return response.data || response;
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    }
  }, [initiativeService]);

  const updateInitiative = useCallback(async (id, initiativeData) => {
    if (!isAuthentication) {
      notify('error', 'Authentication required');
      return;
    }

    try {
      setIsLoading(true);
      const response = await initiativeService.updateInitiative(id, initiativeData);

      // Обновявам инициативата в локалното състояние
      setInitiatives(prev => prev.map(init =>
        init.id === id ? (response.data || response) : init
      ));

      notify('success', 'Initiative updated successfully!');
      return response;
    } catch (error) {
      console.error('Error updating initiative:', error);
      notify('error', 'Failed to update initiative');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthentication, initiativeService]);

  const deleteInitiative = useCallback(async (id) => {
    if (!isAuthentication) {
      notify('error', 'Authentication required');
      return;
    }

    try {
      setIsLoading(true);
      await initiativeService.deleteInitiative(id);

      // Премахвам инициативата от локалното състояние
      setInitiatives(prev => prev.filter(init => init.id !== id));

      notify('success', 'Initiative deleted successfully!');
    } catch (error) {
      console.error('Error deleting initiative:', error);
      notify('error', 'Failed to delete initiative');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthentication, initiativeService]);

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
      // setIsLoading(true);
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

        const processedComments = initiative.comments
          .filter(comment => !comment.parentId) // Само главни коментари
          .map(comment => {

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

  const toggleBookmarkProjects = useCallback(async (projectId) => {
    if (!isAuthentication) {
      notify('error', 'Please login to bookmark projects');
      return;
    }

    const previousBookmarks = [...bookMarkedProjects];
    const wasBookmarked = previousBookmarks.includes(projectId);

    try {
      // Първо обновяваме локално за моментален UI update
      setBookmarkedProjects(prev => {
        const newBookmarks = wasBookmarked
          ? prev.filter(id => id !== projectId)
          : [...prev, projectId];

        // Записваме веднага в localStorage
        localStorage.setItem('bookMarkedProjects', JSON.stringify(newBookmarks));
        return newBookmarks;
      });

      // След това правим API заявката
      const response = await initiativeService.toggleBookmarkProject(projectId);
      const apiResponse = response.data || response;

      // Ако API върне различен резултат, синхронизираме
      if (apiResponse.bookmarked !== !wasBookmarked) {
        setBookmarkedProjects(prev => {
          const syncedBookmarks = apiResponse.bookmarked
            ? [...prev.filter(id => id !== projectId), projectId]
            : prev.filter(id => id !== projectId);

          localStorage.setItem('bookMarkedProjects', JSON.stringify(syncedBookmarks));
          return syncedBookmarks;
        });
      }

      notify('success', apiResponse.message || 'Bookmark updated');

    } catch (error) {
      // Rollback при грешка
      setBookmarkedProjects(previousBookmarks);
      localStorage.setItem('bookMarkedProjects', JSON.stringify(previousBookmarks));
      console.error('Error toggling bookmark:', error);
      notify('error', 'Failed to update bookmark');
    }
  }, [isAuthentication, bookMarkedProjects, initiativeService]);

  const loadUserBookmarks = useCallback(async () => {
    if (!isAuthentication || !userEmail) return;

    try {
      const response = await initiativeService.getAllBookmarkedInitiatives(userEmail);
      const userInitiatives = response.data || response;

      // Извлечи ID-тата на букмаркнатите инициативи
      const bookmarkIds = userInitiatives.map(initiative => initiative.id);
      setBookmarkedInitiatives(bookmarkIds);
      setBookmarksLoaded(true);

    } catch (error) {
      console.error('Error loading user bookmarks:', error);
      setBookmarksLoaded(true); 
    }
  }, [isAuthentication, userEmail, initiativeService]);
  const loadProjectBookmarks = useCallback(async () => {
    if (!isAuthentication || !userEmail) return;

    try {
      // Трябва да имате endpoint за това или да адаптирате съществуващ
      const response = await initiativeService.getAllBookmarkedProjects(userEmail);
      const userProjects = response.data || response;

      const bookmarkIds = userProjects.map(project => project.id);
      setBookmarkedProjects(bookmarkIds);
      localStorage.setItem('bookMarkedProjects', JSON.stringify(bookmarkIds));

    } catch (error) {
      console.error('Error loading project bookmarks:', error);
    }
  }, [isAuthentication, userEmail, initiativeService]);

  // Добавете в useEffect за зареждане при login:
  useEffect(() => {
    if (isAuthentication && userEmail) {
      loadUserBookmarks(); // за инициативи
      loadProjectBookmarks(); // за проекти
    } else {
      clearBookmarks();
      setBookmarkedProjects([]); // изчистваме и проектите
      localStorage.removeItem('bookMarkedProjects');
    }
  }, [isAuthentication, userEmail]);

  const clearBookmarks = useCallback(() => {
    setBookmarkedInitiatives([]);
    setBookmarksLoaded(false);
  }, []);

  // ПОПРАВЕНА getComments функция:
  const getComments = useCallback(async (initiativeId) => {
    try {
      setCommentsLoading(true);

      const response = await initiativeService.getInitiativeComments(initiativeId);

      // Извличаме правилно данните
      let commentsData = [];
      if (Array.isArray(response)) {
        commentsData = response;
      } else if (response.data && Array.isArray(response.data)) {
        commentsData = response.data;
      } else if (response.comments && Array.isArray(response.comments)) {
        commentsData = response.comments;
      }

      // Обработваме коментарите
      const processedComments = commentsData
        .filter(comment => !comment.parentId) // Само главни коментари
        .map(comment => {
          // Сортираме replies по дата ВЪЗХОДЯЩО (най-старите първи)
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: comment.replies.sort((a, b) =>
                new Date(a.createdAt) - new Date(b.createdAt)
              )
            };
          }
          return comment;
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Главните - най-новите първи

      setComments(prev => ({
        ...prev,
        [initiativeId]: processedComments
      }));

      return processedComments;
    } catch (error) {
      console.error('Error getting comments:', error);
      notify('error', 'Failed to load comments');

      setComments(prev => ({
        ...prev,
        [initiativeId]: []
      }));

      return [];
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  // В InitiativeProvider.js - обновете addComment функцията:

  const addComment = useCallback(async (initiativeId, content, parentId = null) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      const commentData = {
        content: content,
        commentableId: Number(initiativeId), // Уверяваме се че е число
        commentsLinkConnection: 'initiative',
        ...(parentId && { parentId: Number(parentId) }) // И parentId да е число
      };

      const response = await initiativeService.createComment(commentData);
      const newComment = response.data || response;

      // Добавяме малко забавяне преди презареждане
      setTimeout(async () => {
        await getComments(initiativeId);
      }, 10);

      notify('success', 'Comment added successfully');
      return newComment;
    } catch (error) {
      console.error('Error adding comment - full error:', error);
      console.error('Error response:', error.response);

      // По-подробна грешка
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add comment';
      notify('error', errorMessage);
      throw error;
    }
  }, [isAuthentication, initiativeService, getComments]);

  const likeComment = useCallback(async (initiativeId, commentId) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      const response = await initiativeService.likeComment(commentId);
      console.log('Like response:', response);

      // API-то връща директно обекта, не в data property
      const likeData = response.data || response;

      // Презареждаме коментарите
      setTimeout(async () => {
        await getComments(initiativeId);
      }, 30);

      // Проверяваме дали потребителят вече е харесал
      if (likeData.isLiked === false && likeData.likes?.includes(userEmail)) {
        notify('info', 'Вече сте харесали този коментар');
      } else {
        notify('success', 'Успешно харесахте коментара');
      }

      return likeData;
    } catch (error) {
      console.error('Error in likeComment - full error:', error);
      console.error('Error response:', error.response);

      const errorMessage = error.response?.data?.message || error.message || 'Failed to like comment';
      notify('error', `Like error: ${errorMessage}`);

      // Не хвърляме грешката нагоре
      return null;
    }
  }, [isAuthentication, initiativeService, getComments, userEmail]);

  const updateComment = useCallback(async (initiativeId, commentId, newContent) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      // Просто изпращаме към сървъра
      const response = await initiativeService.updateComment(commentId, { content: newContent });

      // След успех, презареждаме всички коментари за да сме сигурни че имаме актуална информация
      await getComments(initiativeId);

      notify('success', 'Comment updated successfully');
      return response.data || response;
    } catch (error) {
      console.error('Error updating comment:', error);
      notify('error', 'Failed to update comment');
      throw error;
    }
  }, [isAuthentication, initiativeService, getComments]);

  const deleteComment = useCallback(async (initiativeId, commentId) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      // Просто изпращаме към сървъра
      await initiativeService.deleteComment(commentId);

      // Презареждаме коментарите
      await getComments(initiativeId);

      notify('success', 'Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      notify('error', 'Failed to delete comment');
      throw error;
    }
  }, [isAuthentication, initiativeService, getComments]);

  const getAllProjects = useCallback(async (forceRefresh = false) => {
    if (projects.length > 0 && projectsLoaded && !forceRefresh) {
      return { data: projects };
    }

    try {
      setIsLoading(true);
      const response = await initiativeService.getAllProjects();

      const projectsData = response.data || response;
      setProjects(projectsData);
      setProjectsLoaded(true);

      return { data: projectsData };
    } catch (e) {
      console.error('Error fetching projects:', e);
      notify('error', e.message || 'Failed to fetch projects');
      showErrorAndSetTimeouts(e.message);
      return { data: [] };
    } finally {
      setIsLoading(false);
    }
  }, [projects.length, projectsLoaded, initiativeService, showErrorAndSetTimeouts]);

  const getProjectById = useCallback(async (id) => {
    try {
      setIsLoading(true);

      const response = await initiativeService.getProjectById(id);
      const project = response.data || response;

      if (!project) {
        throw new Error(`Project not found with id/slug: ${id}`);
      }

      setCurrentProject(project);

      // Обработваме коментарите ако има
      if (project.comments && Array.isArray(project.comments)) {
        const processedComments = project.comments
          .filter(comment => !comment.parentId)
          .map(comment => {
            const replies = project.comments
              .filter(reply => reply.parentId === comment.id && reply.id !== comment.id)
              .map(reply => ({
                ...reply,
                id: reply.id === comment.id ? generateId() : reply.id
              }));

            return {
              ...comment,
              replies: replies
            };
          });

        setComments(prev => ({
          ...prev,
          [`project-${project.id}`]: processedComments,
          [`project-${project.slug}`]: processedComments
        }));
      }

      return project;
    } catch (e) {
      console.error('Error fetching project by ID:', e);
      notify('error', e.message || 'Failed to fetch project');
      showErrorAndSetTimeouts(e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [initiativeService, showErrorAndSetTimeouts, generateId]);

  const getProjectsByInitiative = useCallback(async (initiativeId) => {
    try {
      const response = await initiativeService.getProjectsByInitiative(initiativeId);
      return response;
    } catch (e) {
      console.error('Error fetching projects by initiative:', e);
      notify('error', e.message || 'Failed to fetch initiative projects');
      throw e;
    }
  }, [initiativeService]);

  // Project comments (similar to initiative comments)
  // getProjectComments:
  const getProjectComments = useCallback(async (projectId) => {
    try {
      setCommentsLoading(true);

      const response = await initiativeService.getProjectComments(projectId);

      let commentsData = [];
      if (Array.isArray(response)) {
        commentsData = response;
      } else if (response.data && Array.isArray(response.data)) {
        commentsData = response.data;
      } else if (response.comments && Array.isArray(response.comments)) {
        commentsData = response.comments;
      }

      const processedComments = commentsData
        .filter(comment => !comment.parentId)
        .map(comment => {
          // Сортираме replies по дата ВЪЗХОДЯЩО
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: comment.replies.sort((a, b) =>
                new Date(a.createdAt) - new Date(b.createdAt)
              )
            };
          }
          return comment;
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setComments(prev => ({
        ...prev,
        [`project-${projectId}`]: processedComments
      }));

      return processedComments;
    } catch (error) {
      console.error('Error getting project comments:', error);
      notify('error', 'Failed to load comments');

      setComments(prev => ({
        ...prev,
        [`project-${projectId}`]: []
      }));

      return [];
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  const addProjectComment = useCallback(async (projectId, content, parentId = null) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      const commentData = {
        content: content,
        commentableId: Number(projectId),
        commentsLinkConnection: 'project', // За проекти
        ...(parentId && { parentId: Number(parentId) })
      };

      const response = await initiativeService.createComment(commentData);
      const newComment = response.data || response;

      // Презареждаме коментарите от сървъра след кратка пауза
      setTimeout(async () => {
        await getProjectComments(projectId);
      }, 10);

      notify('success', 'Comment added successfully');
      return newComment;
    } catch (error) {
      console.error('Error adding project comment:', error);
      notify('error', error.response?.data?.message || 'Failed to add comment');
      throw error;
    }
  }, [isAuthentication, initiativeService, getProjectComments]);

  const updateProjectComment = useCallback(async (projectId, commentId, newContent) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      const response = await initiativeService.updateComment(commentId, { content: newContent });
      await getProjectComments(projectId);

      notify('success', 'Comment updated successfully');
      return response.data || response;
    } catch (error) {
      console.error('Error updating project comment:', error);
      notify('error', 'Failed to update comment');
      throw error;
    }
  }, [isAuthentication, initiativeService, getProjectComments]);

  const deleteProjectComment = useCallback(async (projectId, commentId) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      await initiativeService.deleteComment(commentId);
      await getProjectComments(projectId);

      notify('success', 'Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting project comment:', error);
      notify('error', 'Failed to delete comment');
      throw error;
    }
  }, [isAuthentication, initiativeService, getProjectComments]);

  const likeProjectComment = useCallback(async (projectId, commentId) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      const response = await initiativeService.likeComment(commentId);
      const updatedCommentData = response.data || response;

      // Презареждаме коментарите от сървъра
      setTimeout(async () => {
        await getProjectComments(projectId);
      }, 200);

      notify('success', 'Успешно харесахте коментара');
      return updatedCommentData;
    } catch (error) {
      console.error('Error in likeProjectComment:', error);
      notify('error', 'Failed to like comment');
      return null;
    }
  }, [isAuthentication, initiativeService, getProjectComments]);

  // const addProjectReply = useCallback(async (projectId, parentCommentId, content) => {
  //   try {
  //     if (!isAuthentication) {
  //       throw new Error('Authentication required');
  //     }

  //     const newReply = {
  //       id: generateId(),
  //       userId: userEmail,
  //       userEmail: userEmail,
  //       userName: getUserDisplayName(),
  //       userAvatar: profileData?.avatar || null,
  //       content: content,
  //       createdAt: new Date().toISOString(),
  //       updatedAt: null,
  //       likes: [],
  //       likesCount: 0,
  //       parentId: parentCommentId
  //     };

  //     const projectKey = `project-${projectId}`;
  //     const updatedComments = (comments[projectKey] || []).map(comment => {
  //       if (comment.id === parentCommentId) {
  //         return {
  //           ...comment,
  //           replies: [...(comment.replies || []), newReply] // ← Ред 354 вероятно е тук
  //         };
  //       }
  //       return comment;
  //     });

  //     setComments(prev => ({
  //       ...prev,
  //       [projectKey]: updatedComments
  //     }));

  //     notify('success', 'Reply added successfully');
  //     return newReply;
  //   } catch (error) {
  //     console.error('Error adding project reply:', error);
  //     notify('error', 'Failed to add reply');
  //     throw error;
  //   }
  // }, [isAuthentication, generateId, userEmail, getUserDisplayName, profileData?.avatar, comments]);

  // const likeProjectReply = useCallback(async (projectId, commentId, replyId) => {
  //   try {
  //     if (!isAuthentication) {
  //       throw new Error('Authentication required');
  //     }

  //     const projectKey = `project-${projectId}`;
  //     const updatedComments = (comments[projectKey] || []).map(comment => {
  //       if (comment.id === commentId) {
  //         const updatedReplies = (comment.replies || []).map(reply => {
  //           if (reply.id === replyId) {
  //             const isLiked = (reply.likes || []).includes(userEmail);
  //             return {
  //               ...reply,
  //               likes: isLiked
  //                 ? (reply.likes || []).filter(email => email !== userEmail)
  //                 : [...(reply.likes || []), userEmail],
  //               likesCount: isLiked
  //                 ? (reply.likesCount || 0) - 1
  //                 : (reply.likesCount || 0) + 1
  //             };
  //           }
  //           return reply;
  //         });

  //         return {
  //           ...comment,
  //           replies: updatedReplies
  //         };
  //       }
  //       return comment;
  //     });

  //     setComments(prev => ({
  //       ...prev,
  //       [projectKey]: updatedComments
  //     }));

  //     return updatedComments.find(c => c.id === commentId);
  //   } catch (error) {
  //     console.error('Error liking project reply:', error);
  //     notify('error', 'Failed to like reply');
  //     throw error;
  //   }
  // }, [isAuthentication, userEmail, comments]);

  // // UPDATE PROJECT REPLY
  // const updateProjectReply = useCallback(async (projectId, commentId, replyId, newContent) => {
  //   try {
  //     if (!isAuthentication) {
  //       throw new Error('Authentication required');
  //     }

  //     const projectKey = `project-${projectId}`;
  //     const updatedComments = (comments[projectKey] || []).map(comment => {
  //       if (comment.id === commentId) {
  //         const updatedReplies = (comment.replies || []).map(reply => {
  //           if (reply.id === replyId) {
  //             return {
  //               ...reply,
  //               content: newContent,
  //               updatedAt: new Date().toISOString()
  //             };
  //           }
  //           return reply;
  //         });
  //         return { ...comment, replies: updatedReplies };
  //       }
  //       return comment;
  //     });

  //     setComments(prev => ({ ...prev, [projectKey]: updatedComments }));

  //     const updatedComment = updatedComments.find(c => c.id === commentId);
  //     notify('success', 'Reply updated successfully');
  //     return updatedComment;
  //   } catch (error) {
  //     console.error('Error updating project reply:', error);
  //     notify('error', 'Failed to update reply');
  //     throw error;
  //   }
  // }, [isAuthentication, comments]);

  // // DELETE PROJECT REPLY
  // const deleteProjectReply = useCallback(async (projectId, commentId, replyId) => {
  //   try {
  //     if (!isAuthentication) {
  //       throw new Error('Authentication required');
  //     }

  //     const projectKey = `project-${projectId}`;
  //     const updatedComments = (comments[projectKey] || []).map(comment => {
  //       if (comment.id === commentId) {
  //         return {
  //           ...comment,
  //           replies: (comment.replies || []).filter(reply => reply.id !== replyId)
  //         };
  //       }
  //       return comment;
  //     });

  //     setComments(prev => ({ ...prev, [projectKey]: updatedComments }));

  //     const updatedComment = updatedComments.find(c => c.id === commentId);
  //     notify('success', 'Reply deleted successfully');
  //     return updatedComment;
  //   } catch (error) {
  //     console.error('Error deleting project reply:', error);
  //     notify('error', 'Failed to delete reply');
  //     throw error;
  //   }
  // }, [isAuthentication, comments]);

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

  //STORIES AND PUBLICATIONS

  //Stories functions
  const getStoryBySlug = useCallback(async (slug) => {
    try {
      setIsLoading(true);

      const story = storiesData.stories.find(story => story.slug === slug || story.titleSlug === slug);

      if (!story) {
        throw new Error(`Story not found with slug: ${slug}`);
      }
      if (story.comments && Array.isArray(story.comments)) {
        const processedComments = story.comments
          .filter(comment => !comment.parentId)
          .map(comment => {
            const replies = story.comments
              .filter(reply => reply.parentId === comment.id && reply.id !== comment.id)
              .map(reply => ({
                ...reply,
                id: reply.id === comment.id ? generateId() : reply.id
              }));
            return {
              ...comment,
              replies: replies
            };
          });

        setComments(prev => ({
          ...prev,
          [`story-${story.id}`]: processedComments,
          [`story-${story.slug}`]: processedComments
        }));
      }

      return story;
    } catch (e) {
      console.error('Error fetching story by slug:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [generateId]);

  const getPublicationBySlug = useCallback(async (slug) => {
    try {
      setIsLoading(true);

      // Търсим в mock данните
      const publication = publicationsData.publications.find(pub =>
        pub.slug === slug || pub.titleSlug === slug
      );

      if (!publication) {
        throw new Error(`Publication not found with slug: ${slug}`);
      }

      // Обработваме коментарите ако има
      if (publication.comments && Array.isArray(publication.comments)) {
        const processedComments = publication.comments
          .filter(comment => !comment.parentId)
          .map(comment => {
            const replies = publication.comments
              .filter(reply => reply.parentId === comment.id && reply.id !== comment.id)
              .map(reply => ({
                ...reply,
                id: reply.id === comment.id ? generateId() : reply.id
              }));

            return {
              ...comment,
              replies: replies
            };
          });

        setComments(prev => ({
          ...prev,
          [`publication-${publication.id}`]: processedComments,
          [`publication-${publication.slug}`]: processedComments
        }));
      }

      return publication;
    } catch (e) {
      console.error('Error fetching publication by slug:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [generateId]);

  // Функции за коментари на stories
  const getStoryComments = useCallback(async (storyId) => {
    try {
      const storyKey = `story-${storyId}`;
      if (comments[storyKey]) {
        return comments[storyKey];
      }

      setCommentsLoading(true);
      const story = storiesData.stories.find(story =>
        story.id === storyId || story.slug === storyId
      );

      if (!story) {
        throw new Error('Story not found');
      }

      const storyComments = Array.isArray(story.comments) ? story.comments : [];
      setComments(prev => ({
        ...prev,
        [storyKey]: storyComments
      }));

      return storyComments;
    } catch (error) {
      console.error('Error getting story comments:', error);
      notify('error', 'Failed to load comments');
      return [];
    } finally {
      setCommentsLoading(false);
    }
  }, [comments]);

  const addStoryComment = useCallback(async (storyId, content, parentId = null) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      const newComment = {
        id: parentId ? `${generateId()}_${Date.now()}` : generateId(),
        userId: userEmail,
        userEmail: userEmail,
        userName: getUserDisplayName(),
        userAvatar: profileData?.avatar || null,
        content: content,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        likes: [],
        likesCount: 0,
        replies: [],
        ...(parentId && { parentId })
      };

      const storyKey = `story-${storyId}`;

      setComments(prev => {
        const currentComments = prev[storyKey] || [];

        if (parentId) {
          // Това е reply
          const updatedComments = currentComments.map(comment => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newComment]
              };
            }
            return comment;
          });

          return {
            ...prev,
            [storyKey]: updatedComments
          };
        } else {
          // Това е нов основен коментар
          return {
            ...prev,
            [storyKey]: [newComment, ...currentComments]
          };
        }
      });

      notify('success', 'Comment added successfully');
      return newComment;
    } catch (error) {
      console.error('Error adding story comment:', error);
      notify('error', 'Failed to add comment');
      throw error;
    }
  }, [isAuthentication, generateId, userEmail, getUserDisplayName, profileData?.avatar]);

  // Функции за коментари на publications
  const getPublicationComments = useCallback(async (publicationId) => {
    try {
      const pubKey = `publication-${publicationId}`;
      if (comments[pubKey]) {
        return comments[pubKey];
      }

      setCommentsLoading(true);
      const publication = publicationsData.publications.find(pub =>
        pub.id === publicationId || pub.slug === publicationId
      );

      if (!publication) {
        throw new Error('Publication not found');
      }

      const pubComments = Array.isArray(publication.comments) ? publication.comments : [];
      setComments(prev => ({
        ...prev,
        [pubKey]: pubComments
      }));

      return pubComments;
    } catch (error) {
      console.error('Error getting publication comments:', error);
      notify('error', 'Failed to load comments');
      return [];
    } finally {
      setCommentsLoading(false);
    }
  }, [comments]);

  const addPublicationComment = useCallback(async (publicationId, content, parentId = null) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      const newComment = {
        id: parentId ? `${generateId()}_${Date.now()}` : generateId(),
        userId: userEmail,
        userEmail: userEmail,
        userName: getUserDisplayName(),
        userAvatar: profileData?.avatar || null,
        content: content,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        likes: [],
        likesCount: 0,
        replies: [],
        ...(parentId && { parentId })
      };

      const pubKey = `publication-${publicationId}`;

      setComments(prev => {
        const currentComments = prev[pubKey] || [];

        if (parentId) {
          // Това е reply
          const updatedComments = currentComments.map(comment => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newComment]
              };
            }
            return comment;
          });

          return {
            ...prev,
            [pubKey]: updatedComments
          };
        } else {
          // Това е нов основен коментар
          return {
            ...prev,
            [pubKey]: [newComment, ...currentComments]
          };
        }
      });

      notify('success', 'Comment added successfully');
      return newComment;
    } catch (error) {
      console.error('Error adding publication comment:', error);
      notify('error', 'Failed to add comment');
      throw error;
    }
  }, [isAuthentication, generateId, userEmail, getUserDisplayName, profileData?.avatar]);

  // Функция за зареждане на свързани stories/publications
  const getRelatedContent = useCallback(async (contentType, contentId) => {
    try {
      if (contentType === 'story') {
        const story = storiesData.stories.find(s => s.id === contentId);
        if (!story || !story.relatedStories) return [];

        return storiesData.stories.filter(s =>
          story.relatedStories.includes(s.id)
        );
      } else if (contentType === 'publication') {
        const publication = publicationsData.publications.find(p => p.id === contentId);
        if (!publication || !publication.relatedPublications) return [];

        return publicationsData.publications.filter(p =>
          publication.relatedPublications.includes(p.id)
        );
      }

      return [];
    } catch (error) {
      console.error('Error getting related content:', error);
      return [];
    }
  }, []);

  const contextService = {
    // Existing initiative functions
    // Draft functions
    getAllDrafts,
    updateDraftInitiative,
    deleteDraftInitiative,
    clearLocalStorageDraft,
    getDraftById,
    toggleDraftStatus,
    // loadMoreDrafts,
    invalidateDraftsCache,
    drafts,
    draftsLoaded,
    draftsHasMore,
    draftsCurrentPage,
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
    createInitiative,
    saveDraftInitiative,
    getDraftInitiative,

    updateInitiative,
    deleteInitiative,
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
    bookMarkedProjects,
    toggleBookmarkProjects,
    isBookmarkedProject: (id) => bookMarkedProjects.includes(id),
    hasBookmarksProjects: bookMarkedProjects.length > 0,
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
    // addProjectReply,
    // likeProjectReply,
    // updateProjectReply,
    // deleteProjectReply,
    getProjectApplications,
    recentApplications,
    applyToProject,
    getAllApplications, // За админи
    updateApplicationStatus, // За админи  
    deleteApplication, // За админи

    //Stories functions
    getStoryBySlug,
    getStoryComments,
    addStoryComment,

    // Publications functions
    getPublicationBySlug,
    getPublicationComments,
    addPublicationComment,

    // Related content
    getRelatedContent,
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