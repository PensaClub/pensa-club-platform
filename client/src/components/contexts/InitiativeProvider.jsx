/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Loader } from "../Loader/Loader";
import { notify } from "../../utils/notify.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "./UserContext";
import { initiativeServiceFactory } from "../Services/initiativeServiceFactory";
import { initiativeServiceFactory as storyPubServiceFactory } from "../Services/StoryPubServiceFactory";
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
  //Отметките (bookmarks)
  const [bookmarksLoaded, setBookmarksLoaded] = useState(false);
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

  //Publications
  const [publications, setPublications] = useState([]);
  const [publicationsLoaded, setPublicationsLoaded] = useState(false);
  const [currentPublication, setCurrentPublication] = useState(null);
  const [publicationsHasMore, setPublicationsHasMore] = useState(true);
  const [publicationsCurrentPage, setPublicationsCurrentPage] = useState(1);

  //komentari
  const [comments, setComments] = useState({});
  const [commentsLoading, setCommentsLoading] = useState(false);

  const { isAuthentication, userEmail, username, profileData,isAdmin, isModerator } = useAuthContext();
  // НОВИ STATES ЗА APPLICATIONS
  const [recentApplications, setRecentApplications] = useState([]);
  const [userApplications, setUserApplications] = useState(() => {
    try {
      const saved = localStorage.getItem('appliedProjects');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error loading user applications from localStorage:", error);
      return [];
    }
  });

  // Draft states
  const [drafts, setDrafts] = useState([]);
  const [draftsLoaded, setDraftsLoaded] = useState(false);
  const [draftsHasMore, setDraftsHasMore] = useState(true);
  const [draftsCurrentPage, setDraftsCurrentPage] = useState(1);
  const navigate = useNavigate();
  // Project Draft states
  const [projectDrafts, setProjectDrafts] = useState([]);
  const [projectDraftsLoaded, setProjectDraftsLoaded] = useState(false);
  const [projectDraftsHasMore, setProjectDraftsHasMore] = useState(true);
  const [projectDraftsCurrentPage, setProjectDraftsCurrentPage] = useState(1);
  const initiativeService = initiativeServiceFactory();
  const storyPubService = storyPubServiceFactory();
  const [projectsHasMore, setProjectsHasMore] = useState(true);
  const [projectsCurrentPage, setProjectsCurrentPage] = useState(1);
  const location = useLocation();
  const showErrorAndSetTimeouts = useCallback((error) => {
    setErrorMessage(error);
    setIsLoading(false);
    setTimeout(() => {
      setErrorMessage('');
      setIsLoading(false);
    }, 10);
  }, []);

  useEffect(() => {
    localStorage.setItem('bookMarkedProjects', JSON.stringify(bookMarkedProjects));
  }, [bookMarkedProjects]);

  // Същото правете и за bookmarkedInitiatives ако липсва:
  useEffect(() => {
    localStorage.setItem('bookmarkedInitiatives', JSON.stringify(bookmarkedInitiatives));
  }, [bookmarkedInitiatives]);

  // Изчистваме localStorage при logout
  useEffect(() => {
    if (!isAuthentication) {
      setUserApplications([]);
      localStorage.removeItem('appliedProjects');
    }
  }, [isAuthentication]);
  // Helper functions
  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const getUserDisplayName = useCallback(() => {
    return username || profileData?.details?.firstName || userEmail?.split('@')[0] || 'User';
  }, [username, profileData?.details?.firstName, userEmail]);

  // =================
  // APPLICATION FUNCTIONS
  // =================

  // Проверка дали потребителят е кандидатствал за проект
  const hasUserAppliedToProject = useCallback((projectId) => {
    if (!isAuthentication || !userEmail || !projectId) return false;

    return userApplications.some(app =>
      String(app.projectId) === String(projectId) &&
      app.email === userEmail
    );
  }, [userApplications, isAuthentication, userEmail]);

  // Зареждане на кандидатури за конкретен проект
  const getProjectApplications = useCallback(async (projectId) => {
    if (!projectId) return [];

    try {
      const response = await initiativeService.getProjectApplications(projectId);
      const applications = response.data || response;
      setRecentApplications(applications);
      return applications;
    } catch (error) {
      console.error('Error loading project applications:', error);
      setRecentApplications([]);
      return [];
    }
  }, [initiativeService]);

  const applyToProject = useCallback(async (projectId, applicationData) => {
    if (!projectId || !applicationData) {
      notify('error', 'Missing project ID or application data');
      return;
    }

    if (!isAuthentication) {
      notify('error', 'Authentication required');
      return;
    }

    try {
      // setIsLoading(true);

      // API заявка към сървъра
      const response = await initiativeService.applyToProject(projectId, applicationData);

      // Записваме в localStorage за кеширане
      const appliedProjects = JSON.parse(localStorage.getItem('appliedProjects') || '[]');
      const newApplication = {
        projectId: Number(projectId),
        email: userEmail,
        timestamp: Date.now(),
        applicationId: response.id || response.application?.id,
        applicationData: applicationData
      };

      appliedProjects.push(newApplication);
      localStorage.setItem('appliedProjects', JSON.stringify(appliedProjects));

      // Обновяваме локалното състояние
      setUserApplications(prev => {
        const updated = [...prev, newApplication];
        return updated;
      });

      // Презареждаме кандидатурите за проекта
      await getProjectApplications(projectId);

      notify('application-success');
      return {
        success: true,
        message: response.message || 'Кандидатурата е изпратена успешно',
        application: response.application || response
      };

    } catch (error) {
      console.error('Error applying to project:', error);

      // Специална обработка за deadline грешка
      if (error.message === 'Application deadline has passed') {
        notify('error', 'Крайният срок за кандидатстване е изминал');
      } else {
        notify('error', error.message || 'Failed to submit application');
      }

      throw error;
    } finally {
      // setIsLoading(false);
    }
  }, [initiativeService, userEmail, isAuthentication, getProjectApplications]);
  // Зареждане на всички кандидатури (за админи)
  const getAllApplications = useCallback(async () => {
    try {
      // setIsLoading(true);
      const response = await initiativeService.getAllApplications();
      return response.data || response;
    } catch (error) {
      console.error('Error loading all applications:', error);
      notify('error', 'Failed to load applications');
      return [];
    } finally {
      // setIsLoading(false);
    }
  }, [initiativeService]);

  // Обновяване на статуса на кандидатура (за админи)
  const updateApplicationStatus = useCallback(async (applicationId, status) => {
    try {
      setIsLoading(true);
      const response = await initiativeService.updateApplicationStatus(applicationId, status);

      // Обновяваме локалното състояние ако е нужно
      setRecentApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status } : app
        )
      );

      notify('success', 'Application status updated successfully');
      return response.data || response;
    } catch (error) {
      console.error('Error updating application status:', error);
      notify('error', 'Failed to update application status');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [initiativeService]);

  // Изтриване на кандидатура (за админи)
  const deleteApplication = useCallback(async (applicationId) => {
    try {
      // setIsLoading(true);
      await initiativeService.deleteApplication(applicationId);

      // Премахваме от локалното състояние
      setRecentApplications(prev =>
        prev.filter(app => app.id !== applicationId)
      );

      notify('success', 'Application deleted successfully');
    } catch (error) {
      console.error('Error deleting application:', error);
      notify('error', 'Failed to delete application');
      throw error;
    } finally {
      // setIsLoading(false);
    }
  }, [initiativeService]);

  const sendApplicationEmails = useCallback(async (recipientsData, templateType = null) => {
    if (!isAuthentication) {
      notify('error', 'Authentication required');
      return;
    }

    try {
      // setIsLoading(true);

      const emailData = {
        emails: recipientsData
      };

      const response = await initiativeService.sendPersonalizedEmails(emailData);

      if (templateType && (templateType === 'rejection' || templateType === 'interview_invitation')) {
        for (const recipient of recipientsData) {
          const newStatus = templateType === 'rejection' ? 'rejected' : 'approved';

          try {
            await updateApplicationStatus(recipient.applicationId, newStatus);
          } catch (error) {
            console.error(`Failed to update status for application ${recipient.applicationId}:`, error);
          }
        }
      }

      const successCount = response.summary?.successfullySent || response.results?.filter(r => r.sent).length || 0;
      notify('success', `Successfully sent ${successCount} email(s)!`);

      return response;

    } catch (error) {
      console.error('Error sending emails:', error);
      notify('error', error.message || 'Failed to send emails');
      throw error;
    } finally {
      // setIsLoading(false);
    }
  }, [isAuthentication, initiativeService, updateApplicationStatus]);
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
      // setIsLoading(true);
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
      // setIsLoading(false);
    }
  }, [drafts.length, draftsLoaded, draftsHasMore, draftsCurrentPage, initiativeService]);

  const toggleDraftStatus = useCallback(async (identifier) => {
    if (!isAuthentication) {
      notify('error', 'Authentication required');
      return;
    }

    try {
      // setIsLoading(true);
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
      // setIsLoading(false);
    }
  }, [isAuthentication, initiativeService, navigate]);

  const updateDraftInitiative = useCallback(async (id, draftData) => {
    if (!isAuthentication) {
      notify('error', 'Authentication required');
      return;
    }

    try {
      // setIsLoading(true);
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
      // setIsLoading(false);
    }
  }, [isAuthentication, initiativeService]);

  const getDraftById = useCallback(async (id) => {
    try {
      // setIsLoading(true);
      const response = await initiativeService.getDraftById(id);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching draft by ID:', error);
      throw error;
    } finally {
      // setIsLoading(false);
    }
  }, [initiativeService]);

  // Функция за изтриване на draft с пълна синхронизация
  const deleteDraftWithSync = useCallback(async (identifier, draftObject = null, fromLocalStorage = false) => {
    if (!isAuthentication && !fromLocalStorage) {
      notify('error', 'Authentication required');
      return;
    }

    try {
      // setIsLoading(true);

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
        }

        notify('success', 'Draft deleted successfully!');
      }

      return true;
    } catch (error) {
      console.error('Error deleting draft:', error);
      notify('error', fromLocalStorage ? 'Failed to clear draft' : 'Failed to delete draft');
      throw error;
    } finally {
      // setIsLoading(false);
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
      // setIsLoading(true);
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
      // setIsLoading(false);
    }
  }, [initiatives.length, initiativesLoaded, hasMore, currentPage, initiativeService, showErrorAndSetTimeouts]);

  const createInitiative = useCallback(async (initiativeData) => {
    if (!isAuthentication) {
      notify('error', 'Authentication required');
      return;
    }

    try {
      // setIsLoading(true);
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
      // setIsLoading(false);
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
  const invalidateProjectDraftsCache = useCallback(() => {
    setProjectDraftsLoaded(false);
    setProjectDrafts([]);
    setProjectDraftsCurrentPage(1);
    setProjectDraftsHasMore(true);
  }, []);
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
      // setIsLoading(true);
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
      // setIsLoading(false);
    }
  }, [isAuthentication, initiativeService]);

  const deleteInitiative = useCallback(async (id) => {
    if (!isAuthentication) {
      notify('error', 'Authentication required');
      return;
    }

    try {
      // setIsLoading(true);
      await initiativeService.deleteInitiative(id);

      // Премахвам инициативата от локалното състояние
      setInitiatives(prev => prev.filter(init => init.id !== id));

      notify('success', 'Initiative deleted successfully!');
    } catch (error) {
      console.error('Error deleting initiative:', error);
      notify('error', 'Failed to delete initiative');
      throw error;
    } finally {
      // setIsLoading(false);
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
      // setIsLoading(false);
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

  // В InitiativeProvider.js - обнове addComment функцията:

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

      // API-то връща директно обекта, не в data property
      const likeData = response.data || response;

      // Презареждаме коментарите
      setTimeout(async () => {
        await getComments(initiativeId);
      }, 30);

      // Проверяваме дали потребителят вече е харесал
      if (likeData.liked === false && likeData.likes?.includes(userEmail)) {
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

 const deleteComment = useCallback(async (initiativeId, commentId, commentUserEmail) => {
  try {
    // Първо проверяваме дали потребителят е authenticated
    if (!isAuthentication) {
      throw new Error('Authentication required');
    }

    // След това проверяваме дали има права да трие коментара
    const canDelete = isAdmin || isModerator || (userEmail === commentUserEmail);

    if (!canDelete) {
      throw new Error('Unauthorized to delete this comment');
    }

    await initiativeService.deleteComment(commentId);
    await getComments(initiativeId);
    notify('success', 'Comment deleted successfully');
  } catch (error) {
    console.error('Error deleting comment:', error);
    notify('error', 'Failed to delete comment');
    throw error;
  }
}, [isAuthentication, isAdmin, isModerator, initiativeService, getComments]);

  // В InitiativeProvider.js - поправи getAllProjects функцията
  const getAllProjects = useCallback(async (page = 1, forceRefresh = false) => {
    if (page === 1 && projects.length > 0 && projectsLoaded && !forceRefresh) {
      return {
        data: projects,
        hasMore: projectsHasMore,
        currentPage: projectsCurrentPage
      };
    }

    try {
      // setIsLoading(true);
      const response = await initiativeService.getAllProjects(page, 6); // Добавяме page и limit

      const responseData = {
        data: response.data || response,
        hasMore: response.pagination?.hasNextPage || false,
        totalCount: response.pagination?.totalProjects || 0,
        currentPage: response.pagination?.page || page
      };

      if (page === 1) {
        setProjects(responseData.data);
      } else {
        setProjects(prev => [...prev, ...responseData.data]);
      }

      setProjectsHasMore(responseData.hasMore);
      setProjectsCurrentPage(responseData.currentPage);
      setProjectsLoaded(true);

      return responseData;
    } catch (e) {
      console.error('Error fetching projects:', e);
      notify('error', e.message || 'Failed to fetch projects');
      showErrorAndSetTimeouts(e.message);
      return { data: [], hasMore: false, currentPage: page };
    } finally {
      // setIsLoading(false);
    }
  }, [projects.length, projectsLoaded, projectsHasMore, projectsCurrentPage, initiativeService, showErrorAndSetTimeouts]);

  const createProject = useCallback(async (projectData) => {
    if (!isAuthentication) {
      notify('error', 'Authentication required');
      return;
    }

    try {
      setIsLoading(true);
      const response = await initiativeService.createProject(projectData);

      // Добавяме в projects списъка
      setProjects(prev => [response.data || response, ...prev]);

      // Ако е свързан с инициатива, обновяваме я
      if (projectData.initiativeId) {
        await updateInitiativeWithProject(projectData.initiativeId, response.data || response);
      }

      notify('success', 'Project created successfully!');
      return response;
    } catch (error) {
      console.error('Error creating project:', error);
      notify('error', 'Failed to create project');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthentication, initiativeService]);

  const deleteProject = useCallback(async (identifier) => {
    if (!isAuthentication) {
      notify('error', 'Authentication required');
      return;
    }

    try {
      setIsLoading(true);

      await initiativeService.deleteProject(identifier);

      // Премахваме от локалното състояние
      setProjects(prev => prev.filter(project =>
        project.id !== identifier &&
        project.slug !== identifier &&
        project.id.toString() !== identifier.toString()
      ));

      notify('success', 'Project deleted successfully!');
    } catch (error) {
      console.error('Error deleting published project:', error);
      notify('error', 'Failed to delete project');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthentication, initiativeService]);

  // Save Project Draft

  const saveDraftProject = useCallback(async (draftData) => {
    if (!isAuthentication) {
      notify('error', 'Authentication required');
      return;
    }

    try {
      const response = await initiativeService.saveDraftProject(draftData);
      const savedDraft = response.data || response;

      setProjectDrafts(prev => {
        // Проверяваме дали черновата вече съществува (update)
        const existingIndex = prev.findIndex(draft =>
          draft.id === savedDraft.id ||
          draft.slug === savedDraft.slug
        );

        if (existingIndex !== -1) {
          // Обновяваме съществуваща чернова
          const updated = [...prev];
          updated[existingIndex] = savedDraft;
          return updated;
        } else {
          // Добавяме нова чернова в началото
          return [savedDraft, ...prev];
        }
      });

      notify('success', 'Project draft saved successfully!');
      return response;
    } catch (error) {
      console.error('Error saving project draft:', error);
      notify('error', 'Failed to save project draft');
      throw error;
    }
  }, [isAuthentication, initiativeService]);
  // Delete draft project

  const deleteDraftProject = useCallback(async (draftId) => {
    if (!isAuthentication) {
      notify('error', 'Authentication required');
      return;
    }

    try {
      setIsLoading(true);

      await initiativeService.deleteDraftProject(draftId);

      // Премахваме от локалното състояние
      setProjectDrafts(prev => prev.filter(draft =>
        draft.id !== draftId &&
        draft.slug !== draftId &&
        draft.id.toString() !== draftId.toString()
      ));

      notify('success', 'Project draft deleted successfully!');
    } catch (error) {
      console.error('Error deleting draft project:', error);
      notify('error', 'Failed to delete project draft');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthentication, initiativeService]);

  // Update Project Draft

  const updateDraftProject = useCallback(async (id, draftData) => {
    if (!isAuthentication) {
      notify('error', 'Authentication required');
      return;
    }

    try {
      setIsLoading(true);

      const response = await initiativeService.updateDraftProject(id, draftData);
      const updatedDraft = response.data || response;

      setProjectDrafts(prev => {
        return prev.map(draft => {
          if (draft.id === id ||
            draft.id === updatedDraft.id ||
            draft.slug === id ||
            draft.slug === updatedDraft.slug) {
            return updatedDraft;
          }
          return draft;
        });
      });

      notify('success', 'Project draft updated successfully!');
      return response;
    } catch (error) {
      console.error('Error updating project draft:', error);
      notify('error', 'Failed to update project draft');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthentication, initiativeService]);

  // Get All Project Drafts
  const getAllProjectDrafts = useCallback(async (page = 1, forceRefresh = false) => {
    if (page === 1 && projectDrafts.length > 0 && projectDraftsLoaded && !forceRefresh) {
      return {
        data: projectDrafts,
        hasMore: projectDraftsHasMore,
        currentPage: projectDraftsCurrentPage
      };
    }

    try {
      // setIsLoading(true);
      const response = await initiativeService.getAllProjectDrafts(page, 6);

      const responseData = {
        data: response.data || [],
        pagination: response.pagination,
        hasMore: response.pagination?.hasNextPage || false,
        totalCount: response.pagination?.totalProjects || 0,
        currentPage: response.pagination?.page || page
      };

      if (page === 1) {
        setProjectDrafts(responseData.data);
      } else {
        setProjectDrafts(prev => [...prev, ...responseData.data]);
      }

      setProjectDraftsHasMore(responseData.hasMore);
      setProjectDraftsCurrentPage(responseData.currentPage);
      setProjectDraftsLoaded(true);

      return responseData;
    } catch (e) {
      console.error('Error fetching project drafts:', e);
      return {
        data: [],
        hasMore: false,
        currentPage: page
      };
    } finally {
      // setIsLoading(false);
    }
  }, [projectDrafts.length, projectDraftsLoaded, projectDraftsHasMore, projectDraftsCurrentPage, initiativeService]);
  // Get draft project by ID
  const getDraftProjectById = useCallback(async (id) => {
    try {
      // setIsLoading(true);
      const response = await initiativeService.getDraftProjectById(id);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching draft project by ID:', error);
      throw error;
    } finally {
      // setIsLoading(false);
    }
  }, [initiativeService]);
  // Update Initiative with new Project
  const updateInitiativeWithProject = useCallback(async (initiativeId, projectData) => {
    try {

      const initiative = await getInitiativeById(initiativeId);

      // Подготвяме новия проект за добавяне
      const projectInfo = {
        titleSlug: projectData.slug || `project-${projectData.id}`,
        slug: projectData.slug || `project-${projectData.id}`,
        title: projectData.title,
        description: projectData.shortDescription || '',
        status: projectData.status,
        image: projectData.mainImage?.src || '',
        link: `/projects/${projectData.slug || projectData.id}`,
        coordinates: projectData.location?.[0]?.coordinates || { lat: null, lng: null }
      };
      // Проверяваме дали проектът вече съществува
      const existingProjects = initiative.projects || [];
      const projectExists = existingProjects.some(p =>
        p.slug === projectInfo.slug ||
        p.titleSlug === projectInfo.titleSlug
      );

      if (projectExists) {

        return;
      }

      // Добавяме новия проект към съществуващите
      const updatedProjects = [...existingProjects, projectInfo];

      // Обновяваме цялата инициатива
      const updatedInitiativeData = {
        ...initiative,
        projects: updatedProjects,
        updatedAt: new Date().toISOString()
      };

      // Използваме ID вместо цялия обект за по-сигурно update
      await updateInitiative(initiativeId, updatedInitiativeData);

      notify('success', 'Инициативата е обновена с новия проект');

    } catch (error) {
      console.error('❌ Error updating initiative with project:', error);
      console.error('Error details:', error.message);
      throw error;
    }
  }, [getInitiativeById, updateInitiative]);

  // Toggle Project Draft Status (Publish)
  const toggleProjectDraftStatus = useCallback(async (identifier) => {
    if (!isAuthentication) {
      notify('error', 'Authentication required');
      return;
    }

    try {
      setIsLoading(true);
      const response = await initiativeService.toggleProjectDraftStatus(identifier);

      const publishedProject = response.data || response;
      if (!publishedProject.isDraft) {
        // 🔧 ПОПРАВЕН ФИЛТЪР - включва и identifier-а
        setProjectDrafts(prev => prev.filter(draft =>
          draft.id !== publishedProject.id &&
          draft.slug !== publishedProject.slug &&
          draft.id !== identifier &&                    // 🔧 ДОБАВЕНО
          draft.slug !== identifier &&                  // 🔧 ДОБАВЕНО
          draft.id.toString() !== identifier.toString() // 🔧 ДОБАВЕНО за сигурност
        ));

        // Добавяме в projects
        setProjects(prev => [publishedProject, ...prev]);
        notify('success', 'Project published successfully!');

        const navigationTarget = publishedProject.slug || publishedProject.id || identifier;
        if (navigationTarget && navigationTarget !== 'undefined') {
          navigate(`/projects/${navigationTarget}`);
        } else {
          navigate('/projects');
        }
      }

      return publishedProject;
    } catch (error) {
      console.error('Error toggling project draft status:', error);
      notify('error', 'Failed to publish project draft');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthentication, initiativeService, navigate]);

  // ✅ Премахнат updateInitiativeWithProject dependency
  const updateProject = useCallback(async (identifier, projectData) => {
    if (!isAuthentication) {
      notify('error', 'Authentication required');
      return;
    }

    try {
      // setIsLoading(true);
      const response = await initiativeService.updateProject(identifier, projectData);

      // Обновяваме в локалното състояние
      setProjects(prev => prev.map(project =>
        (project.id === identifier || project.slug === identifier)
          ? (response.data || response)
          : project
      ));

      notify('success', 'Проектът е обновен успешно!');
      return response;
    } catch (error) {
      console.error('Error updating project:', error);
      notify('error', 'Грешка при обновяване на проекта');
      throw error;
    } finally {
      // setIsLoading(false);
    }
  }, [isAuthentication, initiativeService]);

  const getProjectById = useCallback(async (id) => {
    // 🔧 ДОБАВЕНА ПРОВЕРКА
    if (!id || id === 'undefined' || id === 'null') {
      const error = new Error(`Invalid project ID: ${id}`);
      console.error('getProjectById called with invalid ID:', id);
      throw error;
    }

    try {
      // setIsLoading(true);
      const response = await initiativeService.getProjectById(id);
      const project = response.data || response;

      if (!project) {
        throw new Error(`Project not found with id/slug: ${id}`);
      }

      // ... останалата логика остава същата
      setCurrentProject(project);
      return project;
    } catch (e) {
      console.error('Error fetching project by ID:', e);
      notify('error', e.message || 'Failed to fetch project');
      showErrorAndSetTimeouts(e.message);
      throw e;
    } finally {
      // setIsLoading(false);
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

  // =================
  // PUBLICATION FUNCTIONS
  // =================

  const getAllPublications = useCallback(async (page = 1, forceRefresh = false, isDraft = null) => {
    if (page === 1 && publications.length > 0 && publicationsLoaded && !forceRefresh) {
      return {
        data: publications,
        hasMore: publicationsHasMore,
        currentPage: publicationsCurrentPage
      };
    }

    try {
      setIsLoading(true);
      const response = await storyPubService.getAllPublications(page, 6, isDraft);

      const responseData = {
        data: response.data || response,
        hasMore: response.pagination?.hasNextPage || false,
        totalCount: response.pagination?.totalPublications || 0,
        currentPage: response.pagination?.page || page
      };

      if (page === 1) {
        setPublications(responseData.data);
      } else {
        setPublications(prev => [...prev, ...responseData.data]);
      }

      setPublicationsHasMore(responseData.hasMore);
      setPublicationsCurrentPage(responseData.currentPage);
      setPublicationsLoaded(true);

      return responseData;
    } catch (e) {
      console.error('Error fetching publications:', e);
      notify('error', e.message || 'Failed to fetch publications');
      showErrorAndSetTimeouts(e.message);
      return { data: [], hasMore: false, currentPage: page };
    } finally {
      setIsLoading(false);
    }
  }, [publications.length, publicationsLoaded, publicationsHasMore, publicationsCurrentPage, storyPubService, showErrorAndSetTimeouts]);

  const getPublicationById = useCallback(async (id) => {
    if (!id || id === 'undefined' || id === 'null') {
      const error = new Error(`Invalid publication ID: ${id}`);
      console.error('getPublicationById called with invalid ID:', id);
      throw error;
    }

    try {
      setIsLoading(true);
      const response = await storyPubService.getPublicationById(id);

      const publication = response.data || response;

      if (!publication) {
        throw new Error(`Publication not found with ID: ${id}`);
      }

      setCurrentPublication(publication);
      return publication;
    } catch (e) {
      console.error('Error fetching publication by ID:', e);
      notify('error', e.message || 'Failed to fetch publication');
      showErrorAndSetTimeouts(e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [storyPubService, showErrorAndSetTimeouts]);

  const createPublication = useCallback(async (publicationData) => {
    if (!isAuthentication) {
      notify('error', 'Authentication required');
      return;
    }

    try {
      setIsLoading(true);
      const response = await storyPubService.createPublication(publicationData);

      // Add to publications list
      setPublications(prev => [response.data || response, ...prev]);

      notify('success', 'Publication created successfully!');
      return response;
    } catch (error) {
      console.error('Error creating publication:', error);
      notify('error', 'Failed to create publication');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthentication, storyPubService]);

  const updatePublication = useCallback(async (id, publicationData) => {
    if (!isAuthentication) {
      notify('error', 'Authentication required');
      return;
    }

    try {
      setIsLoading(true);
      const response = await storyPubService.updatePublication(id, publicationData);

      // Update in local state
      setPublications(prev => prev.map(pub =>
        pub.id === id ? (response.data || response) : pub
      ));

      // Update current publication if it's the one being edited
      if (currentPublication && currentPublication.id === id) {
        setCurrentPublication(response.data || response);
      }

      notify('success', 'Publication updated successfully!');
      return response;
    } catch (error) {
      console.error('Error updating publication:', error);
      notify('error', 'Failed to update publication');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthentication, storyPubService, currentPublication]);

  const deletePublication = useCallback(async (id) => {
    if (!isAuthentication) {
      notify('error', 'Authentication required');
      return;
    }

    try {
      setIsLoading(true);
      await storyPubService.deletePublication(id);

      // Remove from local state
      setPublications(prev => prev.filter(pub => pub.id !== id));

      // Clear current publication if it's the one being deleted
      if (currentPublication && currentPublication.id === id) {
        setCurrentPublication(null);
      }

      notify('success', 'Publication deleted successfully!');
    } catch (error) {
      console.error('Error deleting publication:', error);
      notify('error', 'Failed to delete publication');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthentication, storyPubService, currentPublication]);

  const togglePublicationDraftStatus = useCallback(async (id) => {
    if (!isAuthentication) {
      notify('error', 'Authentication required');
      return;
    }

    try {
      setIsLoading(true);
      const response = await storyPubService.togglePublicationDraftStatus(id);

      // Refresh both publications and drafts lists
      await getAllPublications(1, true);

      notify('success', 'Publication status updated successfully!');
      return response;
    } catch (error) {
      console.error('Error toggling publication draft status:', error);
      notify('error', 'Failed to update publication status');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthentication, storyPubService, getAllPublications]);

  const likePublication = useCallback(async (publicationId, onUpdate = null) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      const response = await storyPubService.likePublication(publicationId);
      const likeData = response.data || response;

      // Update the current publication's like status and count locally
      const updatedPublication = {
        ...currentPublication,
        isLiked: likeData.liked,
        likes: likeData.likes
      };

      setCurrentPublication(updatedPublication);

      // Update the publication in the publications list if it exists
      setPublications(prev =>
        prev.map(pub =>
          pub.id === publicationId
            ? {
              ...pub,
              isLiked: likeData.liked,
              likes: likeData.likes
            }
            : pub
        )
      );

      // Call the callback if provided (for updating local component state)
      if (onUpdate && typeof onUpdate === 'function') {
        onUpdate(updatedPublication);
      }

      if (likeData.liked) {
        notify('success', 'Успешно харесахте публикацията');
      } else {
        notify('info', 'Премахнахте харесването от публикацията');
      }

      return likeData;
    } catch (error) {
      console.error('Error in likePublication - full error:', error);
      console.error('Error response:', error.response);

      const errorMessage = error.response?.data?.message || error.message || 'Failed to like publication';
      notify('error', `Like error: ${errorMessage}`);

      return null;
    }
  }, [isAuthentication, storyPubService, currentPublication]);

  //STORIES AND PUBLICATIONS
  //Stories functions
  const getStoryBySlug = useCallback(async (slug) => {
    try {
      // setIsLoading(true);

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
      // setIsLoading(false);
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

  // Publication Comments functions
  const getPublicationComments = useCallback(async (publicationId) => {
    try {
      setCommentsLoading(true);

      const response = await storyPubService.getPublicationComments(publicationId);

      // Extract data correctly
      let commentsData = [];
      if (Array.isArray(response)) {
        commentsData = response;
      } else if (response.data && Array.isArray(response.data)) {
        commentsData = response.data;
      } else if (response.comments && Array.isArray(response.comments)) {
        commentsData = response.comments;
      }

      // Process comments
      const processedComments = commentsData
        .filter(comment => !comment.parentId) // Only main comments
        .map(comment => {
          // Sort replies by date ASCENDING (oldest first)
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
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Main comments - newest first

      setComments(prev => ({
        ...prev,
        [`publication-${publicationId}`]: processedComments
      }));

      return processedComments;
    } catch (error) {
      console.error('Error getting publication comments:', error);
      notify('error', 'Failed to load comments');

      setComments(prev => ({
        ...prev,
        [`publication-${publicationId}`]: []
      }));

      return [];
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  const addPublicationComment = useCallback(async (publicationId, content, parentId = null) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      const commentData = {
        content: content,
        commentableId: Number(publicationId),
        commentsLinkConnection: 'publication',
        ...(parentId && { parentId: Number(parentId) })
      };

      const response = await storyPubService.addPublicationComment(commentData);
      const newComment = response.data || response;

      // Reload comments after adding
      setTimeout(async () => {
        await getPublicationComments(publicationId);
      }, 10);

      notify('success', 'Comment added successfully');
      return newComment;
    } catch (error) {
      console.error('Error adding publication comment:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add comment';
      notify('error', errorMessage);
      throw error;
    }
  }, [isAuthentication, storyPubService, getPublicationComments]);

  const updatePublicationComment = useCallback(async (publicationId, commentId, newContent) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      const response = await storyPubService.updatePublicationComment(commentId, newContent);

      // Reload comments after updating
      await getPublicationComments(publicationId);

      notify('success', 'Comment updated successfully');
      return response.data || response;
    } catch (error) {
      console.error('Error updating publication comment:', error);
      notify('error', 'Failed to update comment');
      throw error;
    }
  }, [isAuthentication, storyPubService, getPublicationComments]);

  const deletePublicationComment = useCallback(async (publicationId, commentId) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      await storyPubService.deletePublicationComment(commentId);

      // Reload comments after deleting
      await getPublicationComments(publicationId);

      notify('success', 'Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting publication comment:', error);
      notify('error', 'Failed to delete comment');
      throw error;
    }
  }, [isAuthentication, storyPubService, getPublicationComments]);

  const likePublicationComment = useCallback(async (publicationId, commentId) => {
    try {
      if (!isAuthentication) {
        throw new Error('Authentication required');
      }

      const response = await storyPubService.likePublicationComment(commentId);
      const likeData = response.data || response;

      // Reload comments after liking
      setTimeout(async () => {
        await getPublicationComments(publicationId);
      }, 30);

      // Check if user already liked
      if (likeData.liked === false && likeData.likes?.includes(userEmail)) {
        notify('info', 'Вече сте харесали този коментар');
      } else {
        notify('success', 'Успешно харесахте коментара');
      }

      return likeData;
    } catch (error) {
      console.error('Error in likePublicationComment - full error:', error);
      console.error('Error response:', error.response);

      const errorMessage = error.response?.data?.message || error.message || 'Failed to like comment';
      notify('error', `Like error: ${errorMessage}`);

      return null;
    }
  }, [isAuthentication, storyPubService, getPublicationComments, userEmail]);

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
    createProject,
    saveDraftProject,
    updateDraftProject,
    getAllProjectDrafts,
    getDraftProjectById,
    toggleProjectDraftStatus,
    projectDrafts,
    projectDraftsLoaded,
    projectDraftsHasMore,
    projectDraftsCurrentPage,
    getAllProjects,
    getProjectById,
    getProjectsByInitiative,
    projects,
    deleteProject,
    currentProject,
    projectsLoaded,
    updateProject,
    deleteDraftProject,
    // Project comments
    getProjectComments,
    addProjectComment,
    updateProjectComment,
    deleteProjectComment,
    likeProjectComment,
    projectsHasMore,
    projectsCurrentPage,

    //Application functions
    getProjectApplications,
    recentApplications,
    applyToProject,
    hasUserAppliedToProject,
    userApplications,
    getAllApplications,
    updateApplicationStatus,
    deleteApplication,
    sendApplicationEmails,
    updateInitiativeWithProject, // Обновява инициатива с нов проект
    //Stories functions
    getStoryBySlug,
    getStoryComments,
    addStoryComment,

    // Publications functions (REPLACED OLD MOCK DATA FUNCTIONS)
    getAllPublications,
    getPublicationById, // Changed from getPublicationBySlug
    createPublication,
    updatePublication,
    deletePublication,
    togglePublicationDraftStatus,
    likePublication,
    publications,
    currentPublication,
    publicationsLoaded,
    publicationsHasMore,
    publicationsCurrentPage,

    // Related content
    getRelatedContent,

    // New functions for deleting publications
    deletePublication,
    getPublicationComments,
    addPublicationComment,
    updatePublicationComment,
    deletePublicationComment,
    likePublicationComment,
  };
  const pagesWithLazyLoading = ['/articles'];

  const shouldShowLoader = isLoading && !pagesWithLazyLoading.includes(location.pathname);
  return (
    <InitiativeContext.Provider value={contextService}>
      {children}
      {shouldShowLoader && <Loader />}
    </InitiativeContext.Provider>
  );
};

export const useInitiativeContext = () => {
  const context = useContext(InitiativeContext);
  return context;
};
