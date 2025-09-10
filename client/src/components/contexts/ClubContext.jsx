import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Loader } from "../Loader/Loader";
import { notify } from "../../utils/notify.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "./UserContext";
import { mockClubsData } from "../Clubs/data/mockClubsData.js";
import clubServiceFactory from "../Services/clubServiceFactory.js";

export const ClubContext = createContext();

export const ClubProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [clubs, setClubs] = useState([]);
  const [clubsLoaded, setClubsLoaded] = useState(false);
  const [currentClub, setCurrentClub] = useState(null);
  const [regionalClubs, setRegionalClubs] = useState([]);
  const [bookmarksLoaded, setBookmarksLoaded] = useState(false);
  const [bookmarkedClubs, setBookmarkedClubs] = useState(() => {
    try {
      const saved = localStorage.getItem('bookmarkedClubs');
      if (saved) {
        const parsed = JSON.parse(saved);

        return parsed;
      }
    } catch (error) {
      console.error("Error loading bookmarks from localStorage:", error);
    }
    return [];
  });

  const { isAdmin, user, isAuthentication, userEmail } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  // 🔧 Създаваме clubService инстанция
  const clubService = clubServiceFactory(user?.token);

  const showErrorAndSetTimeouts = (error) => {
    setErrorMessage(error);
    setIsLoading(false);
    setTimeout(() => {
      setErrorMessage('');
      setIsLoading(false);
    }, 3000);
  };

  // Симулация на async операция с mock data
  const simulateApiCall = (data, delay = 100) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(data), delay);
    });
  };

  // ===============================
  // 🔄 CRUD ОПЕРАЦИИ - АКТУАЛИЗИРАНИ
  // ===============================

  const createClub = async (clubData) => {
    // if (!isAdmin) {
    //   console.warn('Потребителят не е администратор, не може да създаде клуб');
    //   notify('unauthorized-action');
    //   return;
    // }

    try {
      setIsLoading(true);

      // 🌐 Използваме реалния API
      const newClub = await clubService.createClub(clubData);

      // Добавяме в локалното състояние
      setClubs(prevClubs => [newClub, ...prevClubs]);
      invalidateClubsCache();
      notify('club-created-success');
      navigate('/clubs');
      return newClub;
    } catch (e) {
      console.error('Грешка при създаване на клуб:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 📌 ЗАПАЗВАМЕ СТАРИТЕ МЕТОДИ (mock data)
  const getAllClubs = async (forceRefresh = false, page = 1, limit = 12) => {
    if (clubs.length > 0 && clubsLoaded && !forceRefresh) {
      return clubs;
    }

    try {
      setIsLoading(true);

      // 🌐 Използваме реалния API вместо mock data
      const response = await clubService.getAllClubs(page, limit);

      // Обработваме response-а правилно
      let fetchedClubs = [];

      if (Array.isArray(response)) {
        // Ако response е директно масив
        fetchedClubs = response;
      } else if (response && Array.isArray(response.data)) {
        // Ако response е обект с data property
        fetchedClubs = response.data;
      } else if (response && Array.isArray(response.clubs)) {
        // Ако response е обект с clubs property
        fetchedClubs = response.clubs;
      } else {
        console.warn('⚠️ Unexpected response format:', response);
        fetchedClubs = [];
      }

      // Сортираме само ако имаме валиден масив
      if (Array.isArray(fetchedClubs) && fetchedClubs.length > 0) {
        fetchedClubs.sort((a, b) => {
          const dateA = new Date(a.metadata?.updatedAt || a.updatedAt || 0);
          const dateB = new Date(b.metadata?.updatedAt || b.updatedAt || 0);
          return dateB - dateA;
        });
      }

      setClubs(fetchedClubs);
      setClubsLoaded(true);

      // Връщаме пълния response ако има pagination info
      return {
        clubs: fetchedClubs,
        pagination: response?.pagination || null,
        total: response?.total || fetchedClubs.length
      };

    } catch (e) {
      console.error('❌ Грешка при получаване на клубове:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);

      // Fallback към mock data в случай на грешка
      try {
        const fallbackClubs = await simulateApiCall(mockClubsData);
        const sortedFallback = fallbackClubs.sort((a, b) => {
          return new Date(b.metadata.updatedAt) - new Date(a.metadata.updatedAt);
        });
        setClubs(sortedFallback);
        setClubsLoaded(true);
        return {
          clubs: sortedFallback,
          pagination: null,
          total: sortedFallback.length,
          isFromFallback: true
        };
      } catch (fallbackError) {
        console.error('❌ Грешка и с fallback данните:', fallbackError);
        setClubs([]);
        setClubsLoaded(true);
        return {
          clubs: [],
          pagination: null,
          total: 0,
          error: e.message
        };
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getClubBySlug = async (slug) => {
    try {
      setIsLoading(true);

      const fetchedClub = await clubService.getClubByIdentifier(slug);

      setCurrentClub(fetchedClub);

      // Увеличаваме броя прегледи ако имаме metadata
      if (fetchedClub?.metadata) {
        fetchedClub.metadata.views = (fetchedClub.metadata.views || 0) + 1;
      }

      return fetchedClub;

    } catch (e) {
      console.error('❌ Грешка при получаване на клуб по slug от API:', e);

      // Fallback към mock data
      try {

        const club = mockClubsData.find(club => club.slug === slug);

        if (!club) {
          throw new Error('Клубът не беше намерен нито в API, нито в mock данните');
        }

        const fallbackClub = await simulateApiCall(club);
        setCurrentClub(fallbackClub);

        // Увеличаваме броя прегледи
        if (fallbackClub?.metadata) {
          fallbackClub.metadata.views = (fallbackClub.metadata.views || 0) + 1;
        }

        return fallbackClub;

      } catch (fallbackError) {
        console.error('❌ Грешка и с fallback данните:', fallbackError);
        notify('error', 'Клубът не беше намерен');
        showErrorAndSetTimeouts(fallbackError.message);
        return null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getClubById = async (id) => {
    try {
      setIsLoading(true);


      // 🌐 Използваме реалния API
      const fetchedClub = await clubService.getClubByIdentifier(id);

      return fetchedClub;

    } catch (e) {
      console.error('❌ Грешка при получаване на клуб по ID от API:', e);

      // Fallback към mock data
      try {
        const club = mockClubsData.find(club => club.id === id);

        if (!club) {
          throw new Error('Клубът не беше намерен нито в API, нито в mock данните');
        }

        const fallbackClub = await simulateApiCall(club);
        return fallbackClub;

      } catch (fallbackError) {
        console.error('❌ Грешка и с fallback данните по ID:', fallbackError);
        notify('error', 'Клубът не беше намерен');
        showErrorAndSetTimeouts(fallbackError.message);
        return null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateClub = async (identifier, clubData) => {
    // if (!isAdmin) {
    //   console.warn('Потребителят не е администратор, не може да редактира клуб');
    //   notify('unauthorized-action');
    //   return null;
    // }

    try {
      setIsLoading(true);

      // 🌐 Използваме реалния API
      const updatedClub = await clubService.updateClub(identifier, clubData);

      // Актуализиране на локалното състояние
      setClubs(prevClubs =>
        prevClubs.map(club =>
          club.id === identifier || club.slug === identifier ? updatedClub : club
        )
      );

      if (currentClub && (currentClub.id === identifier || currentClub.slug === identifier)) {
        setCurrentClub(updatedClub);
      }

      invalidateClubsCache();
      notify('club-updated-success');
      return updatedClub;
    } catch (e) {
      console.error('Грешка при редактиране на клуб:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  // В ClubContext.jsx - добави функцията

  const getUserMembershipClubs = async (email) => {
    try {
      const response = await clubService.getUserMembershipClubs(email);

      // Обработи response-а правилно
      if (response && Array.isArray(response.clubs)) {
        return response.clubs;
      } else if (Array.isArray(response)) {
        return response;
      } else {
        console.warn('Unexpected getUserMembershipClubs response:', response);
        return [];
      }
    } catch (e) {
      console.error('Грешка при получаване на членски клубове:', e);
      notify('error', e);
      return [];
    }
  };

  const deleteClub = async (identifier) => {
    // if (!isAdmin) {
    //   console.warn('Потребителят не е администратор, не може да изтрие клуб');
    //   notify('unauthorized-action');
    //   return false;
    // }

    try {
      setIsLoading(true);

      // 🌐 Използваме реалния API
      await clubService.deleteClub(identifier);

      // Премахваме от локалното състояние
      setClubs(prevClubs =>
        prevClubs.filter(club => club.id !== identifier && club.slug !== identifier)
      );

      // Ако изтриваме текущо избрания клуб
      if (currentClub && (currentClub.id === identifier || currentClub.slug === identifier)) {
        setCurrentClub(null);
      }

      invalidateClubsCache();
      notify('club-deleted-success');
      return true;
    } catch (e) {
      console.error('Грешка при изтриване на клуб:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================
  // 🆕 DRAFT ФУНКЦИОНАЛНОСТИ
  // ===============================

  const saveDraftClub = async (draftData) => {
    try {
      setIsLoading(true);
      const savedDraft = await clubService.saveDraftClub(draftData);
      notify('draft-saved-success');
      return savedDraft;
    } catch (e) {
      console.error('Грешка при запазване на чернова:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDraftClub = async (id, draftData) => {
    try {
      setIsLoading(true);
      const updatedDraft = await clubService.updateDraftClub(id, draftData);
      notify('draft-updated-success');
      return updatedDraft;
    } catch (e) {
      console.error('Грешка при обновяване на чернова:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllDrafts = async (page = 1, limit = 12) => {
    try {
      setIsLoading(true);
      const response = await clubService.getAllDrafts(page, limit);

      // Използвай СЪЩАТА логика като при getAllClubs
      let fetchedDrafts = [];

      if (Array.isArray(response)) {
        fetchedDrafts = response;
      } else if (response && Array.isArray(response.data)) {
        fetchedDrafts = response.data;
      } else if (response && Array.isArray(response.clubs)) {
        fetchedDrafts = response.clubs; // ✅ ТОВА БЕШЕ ПРОБЛЕМЪТ
      } else if (response && Array.isArray(response.drafts)) {
        fetchedDrafts = response.drafts;
      } else {
        console.warn('⚠️ Unexpected drafts response format:', response);
        fetchedDrafts = [];
      }

      return {
        drafts: fetchedDrafts,
        pagination: response?.pagination || null,
        total: response?.total || fetchedDrafts.length
      };

    } catch (e) {
      console.error('❌ Грешка при получаване на чернови:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
      return {
        drafts: [],
        pagination: null,
        total: 0,
        error: e.message
      };
    } finally {
      setIsLoading(false);
    }
  };

  const getDraftById = async (id) => {
    try {
      setIsLoading(true);
      const draft = await clubService.getDraftById(id);
      return draft;
    } catch (e) {
      console.error('Грешка при получаване на чернова:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDraftClub = async (draftId) => {
    try {
      setIsLoading(true);
      await clubService.deleteDraftClub(draftId);
      notify('draft-deleted-success');
      return true;
    } catch (e) {
      console.error('Грешка при изтриване на чернова:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDraftStatus = async (identifier) => {
    try {
      setIsLoading(true);
      const result = await clubService.toggleDraftStatus(identifier);
      notify('draft-status-changed');
      return result;
    } catch (e) {
      console.error('Грешка при промяна на статус на чернова:', e);
      notify('error', e);
      showErrorAndSetTimeouts(e.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // В ClubContext.jsx - добави тази функция към другите
  // В ClubContext.jsx - обнови функцията

  const transferClubOwnership = async (identifier, newOwnerEmail) => {
    // Проверка за автентикиран потребител
    if (!isAuthentication) {
      notify('error', 'Трябва да сте влезли в профила си, за да прехвърлите собственост на клуб');
      return false;
    }

    try {
      setIsLoading(true);

      const result = await clubService.transferClubOwnership(identifier, newOwnerEmail);

      // Премахни клуба от локалния списък (тъй като вече не е твой)
      setClubs(prevClubs =>
        prevClubs.filter(club => club.id !== identifier && club.slug !== identifier)
      );

      // Ако е текущо избрания клуб, изчисти го
      if (currentClub && (currentClub.id === identifier || currentClub.slug === identifier)) {
        setCurrentClub(null);
      }

      notify('success', `Клубът беше успешно прехвърлен на ${newOwnerEmail}`);
      return result;
    } catch (e) {
      console.error('Грешка при прехвърляне на собственост:', e);
      notify('error', e.message || 'Грешка при прехвърляне на собственост');
      showErrorAndSetTimeouts(e.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  // ===============================
  // 🆕 FAVORITES/BOOKMARKS
  // ===============================

  const toggleBookmarkClub = useCallback(async (clubId) => {
    if (!isAuthentication) {
      notify('error', 'Please login to bookmark club');
      return;
    }
    const previousBookmarks = [...bookmarkedClubs];
    const wasBookmarked = previousBookmarks.includes(clubId);

    try {
      setBookmarkedClubs(prev => {
        const newBookmarks = wasBookmarked
          ? prev.filter(id => id !== clubId)
          : [...prev, clubId];

        // Записваме веднага в localStorage
        localStorage.setItem('bookmarkedClubs', JSON.stringify(newBookmarks));
        return newBookmarks;
      });
      const response = await clubService.toggleBookmarkClub(clubId);
      const apiResponse = response.data || response;
      // Ако API върне различен резултат, синхронизираме
      if (apiResponse.bookmarked !== !wasBookmarked) {
        setBookmarkedClubs(prev => {
          const syncedBookmarks = apiResponse.bookmarked
            ? [...prev.filter(id => id !== clubId), clubId]
            : prev.filter(id => id !== clubId);

          localStorage.setItem('bookmarkedClubs', JSON.stringify(syncedBookmarks));
          return syncedBookmarks;
        });
      }
      notify('success', apiResponse.message || 'Bookmark updated');

    } catch (error) {
      setBookmarkedClubs(previousBookmarks);
      localStorage.setItem('bookmarkedClubs', JSON.stringify(previousBookmarks));
      console.error('Error toggling bookmark:', error);
      notify('error', 'Failed to update bookmark');
    }
  }, [isAuthentication, bookmarkedClubs, clubService]);

  const getAllBookmarkedClubs = useCallback(async (email) => {
    if (!isAuthentication || !userEmail) return;

    try {
      const bookmarkedClubs = await clubService.getAllBookmarkedClubs(email);

      const userClubs = bookmarkedClubs.clubs || bookmarkedClubs;

      const bookmarkIds = userClubs.map(club => club.id);
      setBookmarkedClubs(bookmarkIds);
      setBookmarksLoaded(true);

    } catch (e) {
      console.error('Грешка при получаване на отметнати клубове:', e);
      notify('error', e);
      return [];
    }
  }, [isAuthentication, userEmail]);

  useEffect(() => {
    if (isAuthentication && userEmail) {
      getAllBookmarkedClubs(userEmail);
    } else {
      clearBookmarks();
      setBookmarkedClubs([]);
      localStorage.removeItem('bookmarkedClubs');
    }
  }, [isAuthentication, userEmail]);

  const clearBookmarks = useCallback(() => {
    setBookmarkedClubs([]);
    setBookmarksLoaded(false);
  }, []);
  // В ClubContext.jsx, поправи getUserClubs функцията:
  const getUserClubs = async (email) => {
    try {
      const response = await clubService.getUserClubs(email);

      // ПОПРАВКА: Върни clubs масива, не целия response
      if (response && Array.isArray(response.clubs)) {
        return response.clubs;
      } else if (Array.isArray(response)) {
        return response;
      } else {
        console.warn('Unexpected getUserClubs response:', response);
        return [];
      }
    } catch (e) {
      console.error('Грешка при получаване на потребителски клубове:', e);
      notify('error', e);
      return [];
    }
  };

  // ===============================
  // 🆕 ТЪРСЕНЕ И ФИЛТРИРАНЕ
  // ===============================

  const searchClubs = async (searchParams) => {
    try {
      if (!searchParams.query?.trim() && !searchParams.category && !searchParams.city) {
        return clubs;
      }

      const results = await clubService.searchClubs(searchParams);
      return results;
    } catch (e) {
      console.error('Грешка при търсене на клубове:', e);
      return [];
    }
  };

  const getClubsByCategory = async (category, page = 1, limit = 12) => {
    try {
      const results = await clubService.getClubsByCategory(category, page, limit);
      return results;
    } catch (e) {
      console.error('Грешка при филтриране по категория:', e);
      return [];
    }
  };

  const getClubsByRegion = async (region, page = 1, limit = 12) => {
    try {
      const results = await clubService.getClubsByRegion(region, page, limit);
      return results;
    } catch (e) {
      console.error('Грешка при филтриране по регион:', e);
      return [];
    }
  };

  const getClubsByCity = async (city, page = 1, limit = 12) => {
    try {
      const results = await clubService.getClubsByCity(city, page, limit);
      return results;
    } catch (e) {
      console.error('Грешка при филтриране по град:', e);
      return [];
    }
  };

  const getFeaturedClubs = async (limit = 6) => {
    try {
      const results = await clubService.getFeaturedClubs(limit);
      return results;
    } catch (e) {
      console.error('Грешка при получаване на препоръчани клубове:', e);
      return [];
    }
  };

  const getActiveClubs = async (page = 1, limit = 12) => {
    try {
      const results = await clubService.getActiveClubs(page, limit);
      return results;
    } catch (e) {
      console.error('Грешка при получаване на активни клубове:', e);
      return [];
    }
  };

  // ===============================
  // 🆕 MAILING СИСТЕМА
  // ===============================

  const sendContactForm = async (clubId, contactData) => {
    try {
      setIsLoading(true);
      await clubService.sendContactForm(clubId, contactData);
      notify('contact-form-sent');
      return true;
    } catch (e) {
      console.error('Грешка при изпращане на контактна форма:', e);
      notify('error', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMembershipApplication = async (clubId, applicationData) => {
    try {
      setIsLoading(true);
      await clubService.sendMembershipApplication(clubId, applicationData);
      notify('membership-application-sent');
      return true;
    } catch (e) {
      console.error('Грешка при кандидатстване за членство:', e);
      notify('error', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToNewsletter = async (clubId, subscriptionData) => {
    try {
      await clubService.subscribeToNewsletter(clubId, subscriptionData);
      notify('newsletter-subscribed');
      return true;
    } catch (e) {
      console.error('Грешка при абониране за newsletter:', e);
      notify('error', e);
      return false;
    }
  };

  const sendVolunteerApplication = async (clubId, volunteerData) => {
    try {
      setIsLoading(true);
      await clubService.sendVolunteerApplication(clubId, volunteerData);
      notify('volunteer-application-sent');
      return true;
    } catch (e) {
      console.error('Грешка при кандидатстване за доброволчество:', e);
      notify('error', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendPartnershipInquiry = async (clubId, partnershipData) => {
    try {
      setIsLoading(true);
      await clubService.sendPartnershipInquiry(clubId, partnershipData);
      notify('partnership-inquiry-sent');
      return true;
    } catch (e) {
      console.error('Грешка при запитване за партньорство:', e);
      notify('error', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================
  // 🆕 ОБНОВЕНИ REGISTRATION ФУНКЦИИ
  // ===============================

  const registerForEvent = async (clubId, eventTitle, registrationData) => {
    try {
      setIsLoading(true);
      await clubService.registerForEvent(clubId, eventTitle, registrationData);
      notify('event-registration-sent');
      return true;
    } catch (e) {
      console.error('Грешка при записване за събитие:', e);
      notify('error', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registerForCourse = async (clubId, courseName, registrationData) => {
    try {
      setIsLoading(true);
      await clubService.registerForCourse(clubId, courseName, registrationData);
      notify('course-registration-sent');
      return true;
    } catch (e) {
      console.error('Грешка при записване за курс:', e);
      notify('error', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registerForTrip = async (clubId, tripDestination, registrationData) => {
    try {
      setIsLoading(true);
      await clubService.registerForTrip(clubId, tripDestination, registrationData);
      notify('trip-registration-sent');
      return true;
    } catch (e) {
      console.error('Грешка при записване за екскурзия:', e);
      notify('error', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendPersonalEmail = async (personalInfo) => {
    try {
      setIsLoading(true);
      await clubService.personalEmail(personalInfo);
      notify('personal-email-sent');
      return true;
    } catch (e) {
      console.error('Грешка при изпращане на персонален имейл:', e);
      notify('error', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================
  // 📌 ЗАПАЗВАМЕ СТАРИТЕ МЕТОДИ (временно)
  // ===============================

  const filterClubsByCategory = async (category) => {
    try {
      if (category === 'all') {
        return clubs;
      }

      const filtered = mockClubsData.filter(club => club.category === category);
      return await simulateApiCall(filtered, 200);
    } catch (e) {
      console.error('Грешка при филтриране по категория:', e);
      return [];
    }
  };

  const filterClubsByCity = async (city) => {
    try {
      if (city === 'all') {
        return clubs;
      }

      const filtered = mockClubsData.filter(club => club.location.city === city);
      return await simulateApiCall(filtered, 200);
    } catch (e) {
      console.error('Грешка при филтриране по град:', e);
      return [];
    }
  };

  const getRegionalClubs = async (clubId) => {
    try {
      setIsLoading(true);

      const club = mockClubsData.find(c => c.id === clubId);
      if (!club) {
        throw new Error('Клубът не беше намерен');
      }

      let relatedClubs = [];

      // Ако е централен клуб - взимаме свързаните клубове
      if (club.regionalInfo.isCentralClub && club.regionalInfo.affiliatedClubs.length > 0) {
        relatedClubs = mockClubsData.filter(c =>
          club.regionalInfo.affiliatedClubs.includes(c.id)
        );
      }
      // Ако не е централен - взимаме централния клуб и другите свързани
      else if (club.regionalInfo.centralClubId) {
        const centralClub = mockClubsData.find(c => c.id === club.regionalInfo.centralClubId);
        if (centralClub) {
          relatedClubs = [centralClub];
          // Добавяме и другите свързани клубове
          const otherAffiliated = mockClubsData.filter(c =>
            centralClub.regionalInfo.affiliatedClubs.includes(c.id) && c.id !== clubId
          );
          relatedClubs = [...relatedClubs, ...otherAffiliated];
        }
      }

      const fetchedClubs = await simulateApiCall(relatedClubs);
      setRegionalClubs(fetchedClubs);
      return fetchedClubs;
    } catch (e) {
      console.error('Грешка при получаване на регионални клубове:', e);
      showErrorAndSetTimeouts(e.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getCentralClub = async (region) => {
    try {
      const centralClub = mockClubsData.find(club =>
        club.regionalInfo.isCentralClub &&
        club.location.region === region
      );

      if (centralClub) {
        return await simulateApiCall(centralClub);
      }
      return null;
    } catch (e) {
      console.error('Грешка при намиране на централен клуб:', e);
      return null;
    }
  };

  const getAvailableCities = () => {
    const cities = [...new Set(mockClubsData.map(club => club.location.city))];
    return cities.sort();
  };

  const getAvailableCategories = () => {
    const categories = [...new Set(mockClubsData.map(club => club.category))];
    return categories.sort();
  };

  const invalidateClubsCache = () => {
    setClubsLoaded(false);
  };

  const clearCurrentClub = () => {
    setCurrentClub(null);
  };
  // ===============================
  // 🆕 АДМИНИСТРАТИВНИ ФУНКЦИИ
  // ===============================

  const toggleClubStatus = async (identifier, status) => {
    if (!isAdmin) {
      console.warn('Потребителят не е администратор, не може да променя статус на клуб');
      notify('unauthorized-action');
      return false;
    }

    try {
      setIsLoading(true);

      const updatedClub = await clubService.toggleClubStatus(identifier, status);

      // Актуализиране на локалното състояние
      setClubs(prevClubs =>
        prevClubs.map(club =>
          club.id === identifier || club.slug === identifier ? updatedClub : club
        )
      );

      if (currentClub && (currentClub.id === identifier || currentClub.slug === identifier)) {
        setCurrentClub(updatedClub);
      }

      invalidateClubsCache();
      notify('success', `Статусът на клуба беше променен на: ${status}`);
      return updatedClub;
    } catch (e) {
      console.error('Грешка при промяна на статус:', e);
      notify('error', e.message);
      showErrorAndSetTimeouts(e.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyClub = async (identifier) => {
    if (!isAdmin) {
      console.warn('Потребителят не е администратор, не може да верифицира клуб');
      notify('unauthorized-action');
      return false;
    }

    try {
      setIsLoading(true);

      const verifiedClub = await clubService.verifyClub(identifier);

      // Актуализиране на локалното състояние
      setClubs(prevClubs =>
        prevClubs.map(club =>
          club.id === identifier || club.slug === identifier ? verifiedClub : club
        )
      );

      if (currentClub && (currentClub.id === identifier || currentClub.slug === identifier)) {
        setCurrentClub(verifiedClub);
      }

      invalidateClubsCache();
      notify('success', 'Клубът беше успешно верифициран');
      return verifiedClub;
    } catch (e) {
      console.error('Грешка при верифициране:', e);
      notify('error', e.message);
      showErrorAndSetTimeouts(e.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const approveClub = async (identifier) => {
    if (!isAdmin) {
      console.warn('Потребителят не е администратор, не може да одобрява клубове');
      notify('unauthorized-action');
      return false;
    }

    try {
      setIsLoading(true);

      const approvedClub = await clubService.approveClub(identifier);

      // Актуализиране на локалното състояние
      setClubs(prevClubs =>
        prevClubs.map(club =>
          club.id === identifier || club.slug === identifier ? approvedClub : club
        )
      );

      if (currentClub && (currentClub.id === identifier || currentClub.slug === identifier)) {
        setCurrentClub(approvedClub);
      }

      invalidateClubsCache();
      notify('success', 'Клубът беше успешно одобрен');
      return approvedClub;
    } catch (e) {
      console.error('Грешка при одобрение:', e);
      notify('error', e.message);
      showErrorAndSetTimeouts(e.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectClub = async (identifier, reason) => {
    if (!isAdmin) {
      console.warn('Потребителят не е администратор, не може да отхвърля клубове');
      notify('unauthorized-action');
      return false;
    }

    if (!reason?.trim()) {
      notify('error', 'Моля, въведете причина за отхвърлянето');
      return false;
    }

    try {
      setIsLoading(true);

      const result = await clubService.rejectClub(identifier, reason);

      // Актуализиране на локалното състояние
      setClubs(prevClubs =>
        prevClubs.map(club =>
          club.id === identifier || club.slug === identifier
            ? { ...club, status: 'rejected' }
            : club
        )
      );

      if (currentClub && (currentClub.id === identifier || currentClub.slug === identifier)) {
        setCurrentClub(prev => prev ? { ...prev, status: 'rejected' } : prev);
      }

      invalidateClubsCache();
      notify('success', 'Клубът беше отхвърлен');
      return result;
    } catch (e) {
      console.error('Грешка при отхвърляне:', e);
      notify('error', e.message);
      showErrorAndSetTimeouts(e.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const bulkUpdateClubs = async (clubIds, updateData) => {
    if (!isAdmin) {
      console.warn('Потребителят не е администратор, не може да прави bulk операции');
      notify('unauthorized-action');
      return false;
    }

    if (!Array.isArray(clubIds) || clubIds.length === 0) {
      notify('error', 'Моля, изберете клубове за актуализация');
      return false;
    }

    try {
      setIsLoading(true);

      const updatedClubs = await clubService.bulkUpdateClubs(clubIds, updateData);

      // Актуализиране на локалното състояние
      setClubs(prevClubs =>
        prevClubs.map(club => {
          const updatedClub = updatedClubs.find(updated =>
            updated.id === club.id || updated.slug === club.slug
          );
          return updatedClub || club;
        })
      );

      invalidateClubsCache();
      notify('success', `${updatedClubs.length} клуба бяха актуализирани успешно`);
      return updatedClubs;
    } catch (e) {
      console.error('Грешка при bulk актуализация:', e);
      notify('error', e.message);
      showErrorAndSetTimeouts(e.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const bulkApproveClubs = async (clubIds) => {
    if (!isAdmin) {
      console.warn('Потребителят не е администратор, не може да прави bulk одобрения');
      notify('unauthorized-action');
      return false;
    }

    if (!Array.isArray(clubIds) || clubIds.length === 0) {
      notify('error', 'Моля, изберете клубове за одобрение');
      return false;
    }

    try {
      setIsLoading(true);

      const approvedClubs = await clubService.bulkApproveClubs(clubIds);

      // Актуализиране на локалното състояние
      setClubs(prevClubs =>
        prevClubs.map(club => {
          const approvedClub = approvedClubs.find(approved =>
            approved.id === club.id || approved.slug === club.slug
          );
          return approvedClub || club;
        })
      );

      invalidateClubsCache();
      notify('success', `${approvedClubs.length} клуба бяха одобрени успешно`);
      return approvedClubs;
    } catch (e) {
      console.error('Грешка при bulk одобрение:', e);
      notify('error', e.message);
      showErrorAndSetTimeouts(e.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const bulkDeleteClubs = async (clubIds) => {
    if (!isAdmin) {
      console.warn('Потребителят не е администратор, не може да прави bulk изтривания');
      notify('unauthorized-action');
      return false;
    }

    if (!Array.isArray(clubIds) || clubIds.length === 0) {
      notify('error', 'Моля, изберете клубове за изтриване');
      return false;
    }

    try {
      setIsLoading(true);

      await clubService.bulkDeleteClubs(clubIds);

      // Премахваме изтритите клубове от локалното състояние
      setClubs(prevClubs =>
        prevClubs.filter(club =>
          !clubIds.includes(club.id) && !clubIds.includes(club.slug)
        )
      );

      // Ако текущия клуб е сред изтритите
      if (currentClub &&
        (clubIds.includes(currentClub.id) || clubIds.includes(currentClub.slug))) {
        setCurrentClub(null);
      }

      invalidateClubsCache();
      notify('success', `${clubIds.length} клуба бяха изтрити успешно`);
      return true;
    } catch (e) {
      console.error('Грешка при bulk изтриване:', e);
      notify('error', e.message);
      showErrorAndSetTimeouts(e.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  // Context service обект
  const contextService = {
    // ===============================
    // ОСНОВНИ CRUD ОПЕРАЦИИ
    // ===============================
    createClub,
    getAllClubs,           // 📌 Mock data (запазен)
    getClubBySlug,         // 📌 Mock data (запазен)
    getClubById,           // 📌 Mock data (запазен)
    updateClub,            // 🌐 API
    deleteClub,            // 🌐 API
    transferClubOwnership, // 🆕 API
    getUserMembershipClubs, // 🆕 API
    // ===============================
    // DRAFT ФУНКЦИОНАЛНОСТИ
    // ===============================
    saveDraftClub,         // 🆕 API
    updateDraftClub,       // 🆕 API
    getAllDrafts,          // 🆕 API
    getDraftById,          // 🆕 API
    deleteDraftClub,       // 🆕 API
    toggleDraftStatus,     // 🆕 API

    // ===============================
    // FAVORITES/BOOKMARKS
    // ===============================
    toggleBookmarkClub,    // 🆕 API
    getAllBookmarkedClubs, // 🆕 API
    bookmarkedClubs,
    isBookmarkedClub: (id) => bookmarkedClubs.includes(id),
    hasBookmarkedClubs: bookmarkedClubs.length > 0,
    getUserClubs,          // 🆕 API
    bookmarksLoaded,
    // ===============================
    // ТЪРСЕНЕ И ФИЛТРИРАНЕ
    // ===============================
    searchClubs,           // 🌐 API (обновен)
    getClubsByCategory,    // 🆕 API
    getClubsByRegion,      // 🆕 API
    getClubsByCity,        // 🆕 API
    getFeaturedClubs,      // 🆕 API
    getActiveClubs,        // 🆕 API

    // 📌 Запазени методи (временно)
    filterClubsByCategory, // 📌 Mock data
    filterClubsByCity,     // 📌 Mock data

    // ===============================
    // MAILING СИСТЕМА
    // ===============================
    sendContactForm,           // 🆕 API
    sendMembershipApplication, // 🆕 API
    subscribeToNewsletter,     // 🆕 API
    sendVolunteerApplication,  // 🆕 API
    sendPartnershipInquiry,    // 🆕 API
    
    // ===============================
    // 🆕 РЕГИСТРАЦИИ
    // ===============================
    registerForEvent,          // 🆕 ОБНОВЕН - използва title
    registerForCourse,         // 🆕 НОВА ФУНКЦИЯ
    registerForTrip,           // 🆕 НОВА ФУНКЦИЯ
    sendPersonalEmail,        // 🆕 НОВА ФУНКЦИЯ

    // ===============================
    // РЕГИОНАЛНИ ФУНКЦИИ
    // ===============================
    getRegionalClubs,    
    getCentralClub,        

    // ===============================
    // UTILITY ФУНКЦИИ
    // ===============================
    getAvailableCities,
    getAvailableCategories,
    invalidateClubsCache,
    clearCurrentClub,

    // ===============================
    // STATE
    // ===============================
    clubs,
    currentClub,
    regionalClubs,
    isLoading,
    clubsLoaded,
    errorMessage,
    // ===============================
    // АДМИНИСТРАТИВНИ ФУНКЦИИ
    // ===============================
    toggleClubStatus,      // 🆕 Admin only
    verifyClub,           // 🆕 Admin only  
    approveClub,          // 🆕 Admin only
    rejectClub,           // 🆕 Admin only
    bulkUpdateClubs,      // 🆕 Admin only
    bulkApproveClubs,     // 🆕 Admin only
    bulkDeleteClubs,      // 🆕 Admin only
    // ===============================
    // 🆕 ДИРЕКТЕН ДОСТЪП ДО SERVICE
    // ===============================
    clubService // За директни повиквания когато е нужно
  };

  // Страници с lazy loading (където не показваме loader)
  const pagesWithLazyLoading = ['/clubs', '/club'];
  const shouldShowLoader = isLoading && !pagesWithLazyLoading.some(page =>
    location.pathname.includes(page)
  );

  return (
    <ClubContext.Provider value={contextService}>
      {children}
      {shouldShowLoader && <Loader />}
    </ClubContext.Provider>
  );
};

export const useClubContext = () => {
  const context = useContext(ClubContext);
  if (!context) {
    throw new Error('useClubContext must be used within a ClubProvider');
  }
  return context;
};