// src/components/contexts/AcademyCoursesProvider.jsx

import { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react';
import { useAuthContext } from './UserContext';
import { academyCoursesServiceFactory } from '../Services/academyCoursesService';
import { toast } from 'react-toastify';
import academyServiceFactory from '../Services/academyServiceFactory';

export const AcademyCoursesContext = createContext();

export const AcademyCoursesProvider = ({ children }) => {
  const { isAdmin, token, profileData } = useAuthContext();
  const isMentor = profileData?.isMentor === true;
  const coursesService = useMemo(() => academyCoursesServiceFactory(), []);
  const academyService = useMemo(() => academyServiceFactory(token), [token]);
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [seminars, setSeminars] = useState([]);
  const [myDashboard, setMyDashboard] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentTestData, setCurrentTestData] = useState(null);
  const [lessonsProgress, setLessonsProgress] = useState([]);
  const [enrollmentStats, setEnrollmentStats] = useState(null);
  const testLoadedRef = useRef(null);
  // =========================================================
  //                    COURSES - PUBLIC
  // =========================================================

  const getCourses = useCallback(async (params = {}) => {
    try {
      setIsLoading(true);
      const data = await coursesService.getCourses(params);
      setCourses(data.courses || []);
      return data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      return { courses: [], pagination: {} };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCourseBySlug = useCallback(async (slug) => {
    try {
      setIsLoading(true);
      const data = await coursesService.getCourseBySlug(slug);
      setCurrentCourse(data.course || data);
      return data;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCourseCategories = useCallback(async () => {
    try {
      const data = await coursesService.getCourseCategories();
      return data.categories || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }, []);

  // =========================================================
  //                    COURSES - ADMIN
  // =========================================================

  const getAdminCourses = useCallback(async (params = {}) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { courses: [], pagination: {} };
    }
    try {
      setIsLoading(true);
      const data = await coursesService.getAdminCourses(params);
      return data;
    } catch (error) {
      console.error('Error fetching admin courses:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const createCourse = useCallback(async (courseData) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      setIsLoading(true);
      const response = await coursesService.createCourse(courseData);
      toast.success('Курсът е създаден успешно');
      return response;
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Грешка при създаване на курс');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const updateCourse = useCallback(async (courseId, courseData) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      setIsLoading(true);
      const response = await coursesService.updateCourse(courseId, courseData);
      toast.success('Курсът е обновен успешно');
      return response;
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('Грешка при обновяване на курс');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const deleteCourse = useCallback(async (courseId) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.deleteCourse(courseId);
      toast.success('Курсът е изтрит успешно');
      return response;
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Грешка при изтриване на курс');
      throw error;
    }
  }, [isAdmin]);

  const publishCourse = useCallback(async (courseId) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.publishCourse(courseId);
      toast.success('Курсът е публикуван');
      return response;
    } catch (error) {
      console.error('Error publishing course:', error);
      toast.error('Грешка при публикуване');
      throw error;
    }
  }, [isAdmin]);

  const unpublishCourse = useCallback(async (courseId) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.unpublishCourse(courseId);
      toast.success('Курсът е скрит');
      return response;
    } catch (error) {
      console.error('Error unpublishing course:', error);
      toast.error('Грешка при скриване');
      throw error;
    }
  }, [isAdmin]);

  const duplicateCourse = useCallback(async (courseId) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      setIsLoading(true);
      const response = await coursesService.duplicateCourse(courseId);
      toast.success('Курсът е дублиран успешно');
      return response;
    } catch (error) {
      console.error('Error duplicating course:', error);
      toast.error('Грешка при дублиране');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const getCourseStatistics = useCallback(async (courseId) => {
    try {
      const data = await coursesService.getCourseStatistics(courseId);
      return data;
    } catch (error) {
      console.error('Error fetching course statistics:', error);
      return { statistics: {} };
    }
  }, []);

  // =========================================================
  //                    COURSE MENTORS
  // =========================================================

  const searchMentors = useCallback(async (query = '', limit = 8) => {
    try {
      const data = await coursesService.searchMentors(query, limit);
      return data?.mentors || [];
    } catch (err) {
      console.error('Error searching mentors:', err);
      return [];
    }
  }, [coursesService]);

  const addCourseMentor = useCallback(async (courseId, mentorData) => {
    const data = await coursesService.addCourseMentor(courseId, mentorData);
    return data;
  }, [coursesService]);

  const updateCourseMentor = useCallback(async (courseId, mentorCourseId, updates) => {
    const data = await coursesService.updateCourseMentor(courseId, mentorCourseId, updates);
    return data;
  }, [coursesService]);

  const removeCourseMentor = useCallback(async (courseId, mentorCourseId) => {
    const data = await coursesService.removeCourseMentor(courseId, mentorCourseId);
    return data;
  }, [coursesService]);

  // =========================================================
  //                    MODULES
  // =========================================================

  const getCourseModules = useCallback(async (courseId) => {
    try {
      const data = await coursesService.getCourseModules(courseId);
      return data.modules || [];
    } catch (error) {
      console.error('Error fetching modules:', error);
      return [];
    }
  }, []);

  const createModule = useCallback(async (courseId, moduleData) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.createModule(courseId, moduleData);
      toast.success('Модулът е създаден успешно');
      return response;
    } catch (error) {
      console.error('Error creating module:', error);
      toast.error('Грешка при създаване на модул');
      throw error;
    }
  }, [isAdmin]);

  const updateModule = useCallback(async (courseId, moduleId, moduleData) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.updateModule(courseId, moduleId, moduleData);
      toast.success('Модулът е обновен успешно');
      return response;
    } catch (error) {
      console.error('Error updating module:', error);
      toast.error('Грешка при обновяване на модул');
      throw error;
    }
  }, [isAdmin]);

  const deleteModule = useCallback(async (courseId, moduleId) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.deleteModule(courseId, moduleId);
      toast.success('Модулът е изтрит успешно');
      return response;
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Грешка при изтриване на модул');
      throw error;
    }
  }, [isAdmin]);

  const reorderModules = useCallback(async (courseId, moduleIds) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.reorderModules(courseId, moduleIds);
      return response;
    } catch (error) {
      console.error('Error reordering modules:', error);
      throw error;
    }
  }, [isAdmin]);

  // =========================================================
  //                    LESSONS
  // =========================================================

  const getCourseLessons = useCallback(async (courseSlug) => {
    try {
      const data = await coursesService.getCourseLessons(courseSlug);
      return data.lessons || [];
    } catch (error) {
      console.error('Error fetching lessons:', error);
      return [];
    }
  }, []);

  const createLesson = useCallback(async (courseSlug, lessonData) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.createLesson(courseSlug, lessonData);
      toast.success('Урокът е създаден успешно');
      return response;
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast.error('Грешка при създаване на урок');
      throw error;
    }
  }, [isAdmin]);

  const getLessonBySlug = useCallback(async (courseSlug, lessonSlug) => {
    try {
      setIsLoading(true);
      const data = await coursesService.getLessonBySlug(courseSlug, lessonSlug);
      setCurrentLesson(data.lesson || data);
      return data;
    } catch (error) {
      console.error('Error fetching lesson:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateLesson = useCallback(async (courseSlug, lessonSlug, lessonData) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.updateLesson(courseSlug, lessonSlug, lessonData);
      toast.success('Урокът е обновен успешно');
      return response;
    } catch (error) {
      console.error('Error updating lesson:', error);
      toast.error('Грешка при обновяване на урок');
      throw error;
    }
  }, [isAdmin]);

  const deleteLesson = useCallback(async (courseSlug, lessonSlug) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.deleteLesson(courseSlug, lessonSlug);
      toast.success('Урокът е изтрит успешно');
      return response;
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error('Грешка при изтриване на урок');
      throw error;
    }
  }, [isAdmin]);

  const reorderLessons = useCallback(async (courseSlug, lessonIds, moduleId = null) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.reorderLessons(courseSlug, lessonIds, moduleId);
      return response;
    } catch (error) {
      console.error('Error reordering lessons:', error);
      throw error;
    }
  }, [isAdmin]);

  const publishLesson = useCallback(async (courseSlug, lessonSlug) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.publishLesson(courseSlug, lessonSlug);
      toast.success('Урокът е публикуван');
      return response;
    } catch (error) {
      console.error('Error publishing lesson:', error);
      toast.error('Грешка при публикуване');
      throw error;
    }
  }, [isAdmin]);

  const unpublishLesson = useCallback(async (courseSlug, lessonSlug) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.unpublishLesson(courseSlug, lessonSlug);
      toast.success('Урокът е скрит');
      return response;
    } catch (error) {
      console.error('Error unpublishing lesson:', error);
      toast.error('Грешка при скриване');
      throw error;
    }
  }, [isAdmin]);

  const startLesson = useCallback(async (courseSlug, lessonSlug) => {
    try {
      const response = await coursesService.startLesson(courseSlug, lessonSlug);
      toast.success('Урокът е на живо');
      return response;
    } catch (error) {
      console.error('Error starting lesson:', error);
      toast.error('Грешка при стартиране');
      throw error;
    }
  }, []);

  const stopLesson = useCallback(async (courseSlug, lessonSlug) => {
    try {
      const response = await coursesService.stopLesson(courseSlug, lessonSlug);
      toast.success('Излъчването е спряно');
      return response;
    } catch (error) {
      console.error('Error stopping lesson:', error);
      toast.error('Грешка при спиране');
      throw error;
    }
  }, []);

  // =========================================================
  //                    LECTURES - PUBLIC
  // =========================================================

  const getLectures = useCallback(async (params = {}) => {
    try {
      setIsLoading(true);
      const data = await coursesService.getLectures(params);
      setLectures(data.lectures || []);
      return data;
    } catch (error) {
      console.error('Error fetching lectures:', error);
      return { lectures: [], pagination: {} };
    } finally {
      setIsLoading(false);
    }
  }, []);
  // В AcademyCoursesProvider.jsx — добави ако липсва
  const unpublishLecture = useCallback(async (lectureId) => {
    if (!isAdmin) return;
    try {
      const response = await coursesService.unpublishLecture(lectureId);
      toast.success('Лекцията е скрита');
      return response;
    } catch (error) {
      console.error('Error unpublishing lecture:', error);
      toast.error('Грешка при скриване');
      throw error;
    }
  }, [coursesService, isAdmin]);


  const getLectureById = useCallback(async (id) => { // НОВО
    try {
      const data = await coursesService.getLectureById(id);
      return data;
    } catch (error) {
      console.error('Error fetching lecture by id:', error);
      throw error;
    }
  }, []);

  // НОВО — Lecture mentors
  const addLectureMentor = useCallback(async (lectureId, data) => {
    try {
      return await coursesService.addLectureMentor(lectureId, data);
    } catch (error) {
      console.error('Error adding lecture mentor:', error);
      throw error;
    }
  }, []);

  const updateLectureMentor = useCallback(async (lectureId, mentorLectureId, data) => {
    try {
      return await coursesService.updateLectureMentor(lectureId, mentorLectureId, data);
    } catch (error) {
      console.error('Error updating lecture mentor:', error);
      throw error;
    }
  }, []);

  const removeLectureMentor = useCallback(async (lectureId, mentorLectureId) => {
    try {
      return await coursesService.removeLectureMentor(lectureId, mentorLectureId);
    } catch (error) {
      console.error('Error removing lecture mentor:', error);
      throw error;
    }
  }, []);

  const getLectureBySlug = useCallback(async (slug) => {
    try {
      setIsLoading(true);
      const data = await coursesService.getLectureBySlug(slug);
      return data;
    } catch (error) {
      console.error('Error fetching lecture:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getLectureCategories = useCallback(async () => {
    try {
      const data = await coursesService.getLectureCategories();
      return data.categories || [];
    } catch (error) {
      console.error('Error fetching lecture categories:', error);
      return [];
    }
  }, []);

  // =========================================================
  //                    LECTURES - ADMIN
  // =========================================================

  const getAdminLectures = useCallback(async (params = {}) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { lectures: [], pagination: {} };
    }
    try {
      setIsLoading(true);
      const data = await coursesService.getAdminLectures(params);
      return data;
    } catch (error) {
      console.error('Error fetching admin lectures:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const createLecture = useCallback(async (lectureData) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      setIsLoading(true);
      const response = await coursesService.createLecture(lectureData);
      toast.success('Лекцията е създадена успешно');
      return response;
    } catch (error) {
      console.error('Error creating lecture:', error);
      toast.error('Грешка при създаване на лекция');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const updateLecture = useCallback(async (lectureId, lectureData) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      setIsLoading(true);
      const response = await coursesService.updateLecture(lectureId, lectureData);
      toast.success('Лекцията е обновена успешно');
      return response;
    } catch (error) {
      console.error('Error updating lecture:', error);
      toast.error('Грешка при обновяване на лекция');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const deleteLecture = useCallback(async (lectureId) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.deleteLecture(lectureId);
      toast.success('Лекцията е изтрита успешно');
      return response;
    } catch (error) {
      console.error('Error deleting lecture:', error);
      toast.error('Грешка при изтриване на лекция');
      throw error;
    }
  }, [isAdmin]);

  const publishLecture = useCallback(async (lectureId) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.publishLecture(lectureId);
      toast.success('Лекцията е публикувана');
      return response;
    } catch (error) {
      console.error('Error publishing lecture:', error);
      toast.error('Грешка при публикуване');
      throw error;
    }
  }, [isAdmin]);

  const cancelLecture = useCallback(async (lectureId, reason = null) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.cancelLecture(lectureId, reason);
      toast.success('Лекцията е отменена');
      return response;
    } catch (error) {
      console.error('Error canceling lecture:', error);
      toast.error('Грешка при отмяна');
      throw error;
    }
  }, [isAdmin]);

  const startLecture = useCallback(async (lectureId) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.startLecture(lectureId);
      toast.success('Лекцията започна');
      return response;
    } catch (error) {
      console.error('Error starting lecture:', error);
      toast.error('Грешка при стартиране');
      throw error;
    }
  }, [isAdmin]);

  const endLecture = useCallback(async (lectureId) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.endLecture(lectureId);
      toast.success('Лекцията приключи');
      return response;
    } catch (error) {
      console.error('Error ending lecture:', error);
      toast.error('Грешка при приключване');
      throw error;
    }
  }, [isAdmin]);

  const stopLecture = useCallback(async (lectureId) => {
    try {
      const response = await coursesService.stopLecture(lectureId);
      toast.success('Излъчването е спряно');
      return response;
    } catch (error) {
      console.error('Error stopping lecture:', error);
      toast.error('Грешка при спиране');
      throw error;
    }
  }, []);


  // ═══════════════════════════════════════════════════════════════════════════

  const registerForLecture = useCallback(async (lectureId) => {
    setIsLoading(true);
    try {
      const result = await coursesService.registerForLecture(lectureId);
      if (result.success) {
        toast.success(result.message || 'Успешно се записахте за лекцията');
      }
      return result;
    } catch (error) {
      toast.error(error.message || 'Грешка при записване за лекцията');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unregisterFromLecture = useCallback(async (lectureId) => {
    setIsLoading(true);
    try {
      const result = await coursesService.unregisterFromLecture(lectureId);
      if (result.success) {
        toast.success(result.message || 'Успешно се отписахте от лекцията');
      }
      return result;
    } catch (error) {
      toast.error(error.message || 'Грешка при отписване от лекцията');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkLectureRegistration = useCallback(async (lectureId) => {
    try {
      const result = await coursesService.checkLectureRegistration(lectureId);
      return result;
    } catch (error) {
      console.error('Check registration error:', error);
      return { success: false, registered: false, registration: null };
    }
  }, []);

  // 2. ДОБАВИ тази липсваща функция (или махни от return ако не ти трябва):

  const getLectureAttendees = useCallback(async (lectureId) => {
    if (!isAdmin) {
      return { attendees: [] };
    }
    try {
      const data = await coursesService.getLectureAttendees(lectureId);
      return data.attendees || [];
    } catch (error) {
      console.error('Error fetching lecture attendees:', error);
      return [];
    }
  }, [isAdmin]);
  const markLectureAttended = useCallback(async (lectureId, studentId) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.markLectureAttended(lectureId, studentId);
      return response;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  }, [isAdmin]);

  // =========================================================
  //                    SEMINARS - PUBLIC
  // =========================================================

  const getSeminars = useCallback(async (params = {}) => {
    try {
      setIsLoading(true);
      const data = await coursesService.getSeminars(params);
      setSeminars(data.seminars || []);
      return data;
    } catch (error) {
      console.error('Error fetching seminars:', error);
      return { seminars: [], pagination: {} };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSeminarBySlug = useCallback(async (slug) => {
    try {
      setIsLoading(true);
      const data = await coursesService.getSeminarBySlug(slug);
      return data;
    } catch (error) {
      console.error('Error fetching seminar:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSeminarCategories = useCallback(async () => {
    try {
      const data = await coursesService.getSeminarCategories();
      return data.categories || [];
    } catch (error) {
      console.error('Error fetching seminar categories:', error);
      return [];
    }
  }, []);

  const checkinSeminar = useCallback(async (seminarId) => {
    try {
      return await coursesService.checkinSeminar(seminarId);
    } catch (error) {
      console.error('Error checking in:', error);
      throw error;
    }
  }, []);

  // =========================================================
  //                    SEMINARS - ADMIN
  // =========================================================

  const getMentorSeminars = useCallback(async () => {
    try {
      return await coursesService.getMentorSeminars();
    } catch (error) {
      console.error('Error fetching mentor seminars:', error);
      return { seminars: [] };
    }
  }, []);

  const getAdminSeminars = useCallback(async (params = {}) => {
    if (!isAdmin && !isMentor) {
      toast.error('Нямате права за тази операция');
      return { seminars: [], pagination: {} };
    }
    try {
      setIsLoading(true);
      const data = await coursesService.getAdminSeminars(params);
      return data;
    } catch (error) {
      console.error('Error fetching admin seminars:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const createSeminar = useCallback(async (seminarData) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      setIsLoading(true);
      const response = await coursesService.createSeminar(seminarData);
      toast.success('Семинарът е създаден успешно');
      return response;
    } catch (error) {
      console.error('Error creating seminar:', error);
      toast.error('Грешка при създаване на семинар');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const updateSeminar = useCallback(async (seminarId, seminarData) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      setIsLoading(true);
      const response = await coursesService.updateSeminar(seminarId, seminarData);
      toast.success('Семинарът е обновен успешно');
      return response;
    } catch (error) {
      console.error('Error updating seminar:', error);
      toast.error('Грешка при обновяване на семинар');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const deleteSeminar = useCallback(async (seminarId) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.deleteSeminar(seminarId);
      toast.success('Семинарът е изтрит успешно');
      return response;
    } catch (error) {
      console.error('Error deleting seminar:', error);
      toast.error('Грешка при изтриване на семинар');
      throw error;
    }
  }, [isAdmin]);

  // НОВО — publish/unpublish seminar
  const publishSeminar = useCallback(async (seminarId) => {
    try {
      const response = await coursesService.publishSeminar(seminarId);
      toast.success('Семинарът е публикуван');
      return response;
    } catch (error) {
      console.error('Error publishing seminar:', error);
      toast.error(error?.errors?.[0] || 'Грешка при публикуване');
      throw error;
    }
  }, []);

  const unpublishSeminar = useCallback(async (seminarId) => {
    try {
      const response = await coursesService.unpublishSeminar(seminarId);
      toast.success('Семинарът е скрит');
      return response;
    } catch (error) {
      console.error('Error unpublishing seminar:', error);
      toast.error(error?.errors?.[0] || 'Грешка при скриване');
      throw error;
    }
  }, []);

  const startSeminar = useCallback(async (seminarId) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.startSeminar(seminarId);
      toast.success('Семинарът е на живо');
      return response;
    } catch (error) {
      console.error('Error starting seminar:', error);
      toast.error('Грешка при стартиране');
      throw error;
    }
  }, [isAdmin]);

  const completeSeminar = useCallback(async (seminarId) => {
    try {
      const response = await coursesService.completeSeminar(seminarId);
      toast.success('Семинарът е завършен');
      return response;
    } catch (error) {
      console.error('Error completing seminar:', error);
      toast.error('Грешка при завършване');
      throw error;
    }
  }, []);

  const stopSeminar = useCallback(async (seminarId) => {
    try {
      const response = await coursesService.stopSeminar(seminarId);
      toast.success('Излъчването е спряно');
      return response;
    } catch (error) {
      console.error('Error stopping seminar:', error);
      toast.error('Грешка при спиране');
      throw error;
    }
  }, []);

  const cancelSeminar = useCallback(async (seminarId, reason = null) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.cancelSeminar(seminarId, reason);
      toast.success('Семинарът е отменен');
      return response;
    } catch (error) {
      console.error('Error canceling seminar:', error);
      toast.error('Грешка при отмяна');
      throw error;
    }
  }, [isAdmin]);

  const getAdminSeminarStatistics = useCallback(async (params = {}) => {
    if (!isAdmin && !isMentor) {
      toast.error('Нямате права за тази операция');
      return null;
    }
    try {
      return await coursesService.getAdminSeminarStatistics(params);
    } catch (error) {
      console.error('Error fetching seminar statistics:', error);
      throw error;
    }
  }, [isAdmin, isMentor]);

  const sendSeminarEmail = useCallback(async (data) => {
    if (!isAdmin && !isMentor) {
      toast.error('Нямате права за тази операция');
      return null;
    }
    try {
      const result = await coursesService.sendSeminarEmail(data);
      if (result?.success) {
        toast.success('Имейлът е изпратен успешно');
      }
      return result;
    } catch (error) {
      console.error('Error sending seminar email:', error);
      toast.error('Грешка при изпращане на имейл');
      throw error;
    }
  }, [isAdmin, isMentor]);

  const getSeminarAttendanceDetail = useCallback(async (seminarId) => {
    if (!isAdmin && !isMentor) {
      toast.error('Нямате права за тази операция');
      return null;
    }
    try {
      return await coursesService.getSeminarAttendanceDetail(seminarId);
    } catch (error) {
      console.error('Error fetching attendance detail:', error);
      throw error;
    }
  }, [isAdmin, isMentor]);

  // =========================================================
  //                    SEMINAR REGISTRATION
  // =========================================================

  const registerForSeminar = useCallback(async (seminarId, data = {}) => {
    try {
      setIsLoading(true);
      const response = await coursesService.registerForSeminar(seminarId, data);
      toast.success('Регистрацията е успешна');
      return response;
    } catch (error) {
      console.error('Error registering for seminar:', error);
      toast.error('Грешка при регистрация');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unregisterFromSeminar = useCallback(async (seminarId) => {
    try {
      const response = await coursesService.unregisterFromSeminar(seminarId);
      toast.success('Регистрацията е отменена');
      return response;
    } catch (error) {
      console.error('Error unregistering from seminar:', error);
      toast.error('Грешка при отмяна на регистрация');
      throw error;
    }
  }, []);

  const checkSeminarRegistration = useCallback(async (seminarId) => { // НОВО
    try {
      const result = await coursesService.checkSeminarRegistration(seminarId);
      return result;
    } catch (error) {
      console.error('Error checking seminar registration:', error);
      return { isRegistered: false };
    }
  }, []);

  const getSeminarAttendees = useCallback(async (seminarId) => {
    try {
      const data = await coursesService.getSeminarAttendees(seminarId);
      return data.attendees || [];
    } catch (error) {
      console.error('Error fetching attendees:', error);
      return [];
    }
  }, []);
  const searchSeminarStudents = useCallback(async (seminarId, query) => {
    try {
      return await coursesService.searchSeminarStudents(seminarId, query);
    } catch (error) {
      console.error('Error searching students:', error);
      return { students: [] };
    }
  }, []);

  const bulkMixedAttendance = useCallback(async (seminarId, data) => {
    try {
      const response = await coursesService.bulkMixedAttendance(seminarId, data);
      toast.success(response.message || 'Присъствието е записано');
      return response;
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error(error?.errors?.[0] || 'Грешка при записване на присъствие');
      throw error;
    }
  }, []);

  const markSeminarAttended = useCallback(async (seminarId, studentId, data = {}) => {
    try {
      return await coursesService.markSeminarAttended(seminarId, studentId, data.participationLevel || 'passive');
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  }, []);

  const getFullAttendance = useCallback(async (seminarId) => {
    try {
      return await coursesService.getFullAttendance(seminarId);
    } catch (error) {
      console.error('Error fetching full attendance:', error);
      return { attendees: [], stats: {} };
    }
  }, []);

  // =========================================================
  //                    ENROLLMENT
  // =========================================================

  const getMyEnrollments = useCallback(async (params = {}) => {
    try {
      const data = await coursesService.getMyEnrollments(params);
      return data;
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      return { enrollments: [], pagination: {} };
    }
  }, []);

  const enrollInCourse = useCallback(async (courseId) => {
    try {
      setIsLoading(true);
      const response = await coursesService.enrollInCourse(courseId);
      toast.success('Записването е успешно');
      return response;
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Грешка при записване');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const dropCourse = useCallback(async (courseId) => {
    try {
      const response = await coursesService.dropCourse(courseId);
      toast.success('Отписването е успешно');
      return response;
    } catch (error) {
      console.error('Error dropping course:', error);
      toast.error('Грешка при отписване');
      throw error;
    }
  }, []);

  // const getEnrollmentStatus = useCallback(async (courseId) => {
  //   try {
  //     const data = await coursesService.checkEnrollment(courseId);
  //     return data;
  //   } catch (error) {
  //     console.error('Error fetching enrollment status:', error);
  //     return { enrolled: false };
  //   }
  // }, []);

  const updateLessonProgress = useCallback(async (lessonId, progressData) => {
    try {
      const response = await coursesService.updateLessonProgress(lessonId, progressData);
      return response;
    } catch (error) {
      console.error('Error updating progress:', error);
      return { success: false };
    }
  }, []);

  const completeLesson = useCallback(async (lessonId) => {
    try {
      const response = await coursesService.completeLesson(lessonId);
      toast.success('Урокът е завършен');
      return response;
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast.error('Грешка при завършване на урок');
      throw error;
    }
  }, []);


  // =========================================================
  //                    ENROLLMENT - SLUG BASED (НОВИ)
  // =========================================================

  const startLessonBySlug = useCallback(async (lessonSlug) => {
    try {
      const response = await coursesService.startLessonBySlug(lessonSlug);
      return response;
    } catch (error) {
      console.error('Error starting lesson:', error);
      return { success: false };
    }
  }, []);

  const updateLessonProgressBySlug = useCallback(async (lessonSlug, progressData) => {
    try {
      const response = await coursesService.updateLessonProgressBySlug(lessonSlug, progressData);
      return response;
    } catch (error) {
      console.error('Error updating progress:', error);
      return { success: false };
    }
  }, []);

  const completeLessonBySlug = useCallback(async (lessonSlug) => {
    try {
      const response = await coursesService.completeLessonBySlug(lessonSlug);
      toast.success('Урокът е завършен успешно!');
      return response;
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast.error('Грешка при завършване на урок');
      throw error;
    }
  }, []);

  // Обновен getEnrollmentStatus - запазва lessonsProgress
  const getEnrollmentStatus = useCallback(async (courseId) => {
    try {
      const data = await coursesService.checkEnrollment(courseId);
      // Запазваме прогреса по уроците в state
      if (data.lessonsProgress) {
        setLessonsProgress(data.lessonsProgress);
      }
      if (data.stats) {
        setEnrollmentStats(data.stats);
      }
      return data;
    } catch (error) {
      console.error('Error fetching enrollment status:', error);
      return { enrolled: false };
    }
  }, []);

  // =========================================================
  //                    TESTS
  // =========================================================

  const getTests = useCallback(async (params = {}) => {
    if (!isAdmin) {
      return { tests: [], pagination: {} };
    }
    try {
      const data = await coursesService.getTests(params);
      return data;
    } catch (error) {
      console.error('Error fetching tests:', error);
      return { tests: [], pagination: {} };
    }
  }, [isAdmin]);

  const createTest = useCallback(async (testData) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.createTest(testData);
      toast.success('Тестът е създаден успешно');
      return response;
    } catch (error) {
      console.error('Error creating test:', error);
      toast.error('Грешка при създаване на тест');
      throw error;
    }
  }, [isAdmin]);

  const getTestById = useCallback(async (testId) => {
    try {
      const data = await coursesService.getTestById(testId);
      return data;
    } catch (error) {
      console.error('Error fetching test:', error);
      throw error;
    }
  }, []);

  const updateTest = useCallback(async (testId, testData) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.updateTest(testId, testData);
      return response;
    } catch (error) {
      console.error('Error updating test:', error);
      toast.error('Грешка при обновяване на тест');
      throw error;
    }
  }, [isAdmin]);

  const deleteTest = useCallback(async (testId) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.deleteTest(testId);
      toast.success('Тестът е изтрит успешно');
      return response;
    } catch (error) {
      console.error('Error deleting test:', error);
      toast.error('Грешка при изтриване на тест');
      throw error;
    }
  }, [isAdmin]);

  const publishTest = useCallback(async (testId) => {
    if (!isAdmin) return { success: false };
    try {
      const response = await coursesService.publishTest(testId);
      toast.success('Тестът е публикуван');
      return response;
    } catch (error) {
      console.error('Error publishing test:', error);
      toast.error(error?.response?.data?.message || 'Грешка при публикуване на тест');
      throw error;
    }
  }, [isAdmin]);

  const unpublishTest = useCallback(async (testId) => {
    if (!isAdmin) return { success: false };
    try {
      const response = await coursesService.unpublishTest(testId);
      toast.success('Тестът е скрит');
      return response;
    } catch (error) {
      console.error('Error unpublishing test:', error);
      toast.error('Грешка при скриване на тест');
      throw error;
    }
  }, [isAdmin]);

  const getTestAttempts = useCallback(async (testId, params = {}) => {
    try {
      const data = await coursesService.getTestAttempts(testId, params);
      return data;
    } catch (error) {
      console.error('Error fetching test attempts:', error);
      return { attempts: [], pagination: {} };
    }
  }, []);

  const getCourseTestStatus = useCallback(async (courseId) => {
    try {
      const data = await coursesService.getCourseTestStatus(courseId);
      return data;
    } catch (error) {
      console.error('Error fetching course test status:', error);
      return { hasTest: false };
    }
  }, []);

  // =========================================================
  //                    TEST QUESTIONS - ADMIN
  // =========================================================

  const addQuestion = useCallback(async (testId, questionData) => {
    if (!isAdmin) return { success: false };
    try {
      const response = await coursesService.addQuestion(testId, questionData);
      return response;
    } catch (error) {
      console.error('Error adding question:', error);
      toast.error('Грешка при добавяне на въпрос');
      throw error;
    }
  }, [isAdmin]);

  const updateQuestion = useCallback(async (testId, questionId, questionData) => {
    if (!isAdmin) return { success: false };
    try {
      const response = await coursesService.updateQuestion(testId, questionId, questionData);
      return response;
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error('Грешка при обновяване на въпрос');
      throw error;
    }
  }, [isAdmin]);

  const deleteQuestion = useCallback(async (testId, questionId) => {
    if (!isAdmin) return { success: false };
    try {
      const response = await coursesService.deleteQuestion(testId, questionId);
      return response;
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Грешка при изтриване на въпрос');
      throw error;
    }
  }, [isAdmin]);

  const reorderQuestions = useCallback(async (testId, questionIds) => {
    if (!isAdmin) return { success: false };
    try {
      const response = await coursesService.reorderQuestions(testId, questionIds);
      return response;
    } catch (error) {
      console.error('Error reordering questions:', error);
      toast.error('Грешка при пренареждане на въпроси');
      throw error;
    }
  }, [isAdmin]);

  const startTest = useCallback(async (testId) => {
    try {
      setIsLoading(true);
      const response = await coursesService.startTest(testId);
      return response;
    } catch (error) {
      console.error('Error starting test:', error);
      toast.error('Грешка при стартиране на тест');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startTestById = useCallback(async (testId) => {
    try {
      const response = await coursesService.startTestById(testId);
      return response;
    } catch (error) {
      console.error('Error starting test:', error);
      toast.error('Грешка при стартиране на тест');
      throw error;
    }
  }, []);

  const submitAnswer = useCallback(async (testId, answerData) => {
    try {
      const response = await coursesService.submitAnswer(testId, answerData);
      return response;
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  }, []);


  const getCurrentAttempt = useCallback(async (testId, forceRefresh = false) => {
    // Ако вече е зареден и не искаме refresh - връщаме кеширания
    if (!forceRefresh && testLoadedRef.current === testId && currentTestData) {
      return currentTestData;
    }

    try {
      setIsLoading(true);
      const data = await coursesService.getCurrentAttempt(testId);
      setCurrentTestData(data);
      testLoadedRef.current = testId;
      return data;
    } catch (error) {
      console.error('Error fetching test attempt:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentTestData]);

  // Функция за изчистване на кеша
  const clearTestCache = useCallback(() => {
    setCurrentTestData(null);
    testLoadedRef.current = null;
  }, []);

  const submitTest = useCallback(async (testId) => {
    try {
      setIsLoading(true);
      const response = await coursesService.submitTest(testId);
      toast.success('Тестът е предаден');
      return response;
    } catch (error) {
      console.error('Error submitting test:', error);
      toast.error('Грешка при предаване на тест');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =========================================================
  //                    TESTS - НОВИ ФУНКЦИИ
  // =========================================================

  const getTestStatus = useCallback(async (lessonId) => {
    try {
      const data = await coursesService.getTestStatus(lessonId);
      return data;
    } catch (error) {
      console.error('Error fetching test status:', error);
      throw error;
    }
  }, []);

  const getTestResultByAttempt = useCallback(async (testId, attemptId) => {
    try {
      const data = await coursesService.getTestResultByAttempt(testId, attemptId);
      return data;
    } catch (error) {
      console.error('Error fetching test result:', error);
      throw error;
    }
  }, []);
  const getTestResults = useCallback(async (testId) => {
    try {
      const data = await coursesService.getTestResults(testId);
      return data;
    } catch (error) {
      console.error('Error fetching test results:', error);
      throw error;
    }
  }, []);

  // =========================================================
  //                    LECTURE TESTS
  // =========================================================

  const startLectureTest = useCallback(async (lectureId) => {
    try {
      setIsLoading(true);
      const response = await coursesService.startLectureTest(lectureId);
      return response;
    } catch (error) {
      console.error('Error starting lecture test:', error);
      toast.error('Грешка при стартиране на тест');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getLectureTestStatus = useCallback(async (lectureId) => {
    try {
      const data = await coursesService.getLectureTestStatus(lectureId);
      return data;
    } catch (error) {
      console.error('Error fetching lecture test status:', error);
      throw error;
    }
  }, []);

  const getLectureAttempt = useCallback(async (lectureId) => {
    try {
      setIsLoading(true);
      const data = await coursesService.getLectureAttempt(lectureId);
      return data;
    } catch (error) {
      console.error('Error fetching lecture attempt:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  // В началото, добави функциите:
  const submitLectureAnswer = useCallback(async (lectureTestId, answerData) => {
    try {
      const response = await coursesService.submitLectureAnswer(lectureTestId, answerData);
      return response;
    } catch (error) {
      console.error('Error submitting lecture answer:', error);
      throw error;
    }
  }, []);

  const submitLectureTest = useCallback(async (lectureTestId) => {
    try {
      setIsLoading(true);
      const response = await coursesService.submitLectureTest(lectureTestId);
      return response;
    } catch (error) {
      console.error('Error submitting lecture test:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =========================================================
  //                    SEMINAR TESTS
  // =========================================================

  const getSeminarTestStatus = useCallback(async (seminarId) => {
    try {
      return await coursesService.getSeminarTestStatus(seminarId);
    } catch (error) {
      console.error('Error getting seminar test status:', error);
      throw error;
    }
  }, []);

  const startSeminarTest = useCallback(async (seminarId) => {
    try {
      return await coursesService.startSeminarTest(seminarId);
    } catch (error) {
      console.error('Error starting seminar test:', error);
      throw error;
    }
  }, []);

  const submitSeminarAnswer = useCallback(async (testId, answerData) => {
    try {
      return await coursesService.submitSeminarAnswer(testId, answerData);
    } catch (error) {
      console.error('Error submitting seminar answer:', error);
      throw error;
    }
  }, []);

  const submitSeminarTest = useCallback(async (testId) => {
    try {
      return await coursesService.submitSeminarTest(testId);
    } catch (error) {
      console.error('Error submitting seminar test:', error);
      throw error;
    }
  }, []);

  // =========================================================
  //                    CERTIFICATES
  // =========================================================

  const getMyCertificates = useCallback(async (params = {}) => {
    try {
      const data = await coursesService.getMyCertificates(params);
      return data;
    } catch (error) {
      console.error('Error fetching certificates:', error);
      return { certificates: [], pagination: {} };
    }
  }, []);

  const verifyCertificate = useCallback(async (code) => {
    try {
      const data = await coursesService.verifyCertificate(code);
      return data;
    } catch (error) {
      console.error('Error verifying certificate:', error);
      throw error;
    }
  }, []);

  const generateCertificate = useCallback(async (enrollmentId, options = {}) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.generateCertificate(enrollmentId, options);
      toast.success('Сертификатът е генериран');
      return response;
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast.error('Грешка при генериране на сертификат');
      throw error;
    }
  }, [isAdmin]);

  // =========================================================
  //                    MATERIALS
  // =========================================================

  // Course materials
  const getCourseMaterials = useCallback(async (courseSlug) => {
    try {
      const data = await coursesService.getCourseMaterials(courseSlug);
      return data.materials || [];
    } catch (error) {
      console.error('Error fetching course materials:', error);
      return [];
    }
  }, []);

  const addCourseMaterial = useCallback(async (courseSlug, materialData) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.addCourseMaterial(courseSlug, materialData);
      toast.success('Материалът е добавен успешно');
      return response;
    } catch (error) {
      console.error('Error adding course material:', error);
      toast.error('Грешка при добавяне на материал');
      throw error;
    }
  }, [isAdmin]);

  const deleteCourseMaterial = useCallback(async (courseId, materialId) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.deleteMaterial('course', courseId, materialId);
      toast.success('Материалът е изтрит успешно');
      return response;
    } catch (error) {
      console.error('Error deleting course material:', error);
      toast.error('Грешка при изтриване на материал');
      throw error;
    }
  }, [isAdmin]);

  const getMaterialTypes = useCallback(async () => {
    try {
      const data = await coursesService.getMaterialTypes();
      return data.types || [];
    } catch (error) {
      console.error('Error fetching material types:', error);
      return [];
    }
  }, []);


  const addLessonMaterial = useCallback(async (lessonSlug, materialData) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.addLessonMaterial(lessonSlug, materialData);
      toast.success('Материалът е добавен успешно');
      return response;
    } catch (error) {
      console.error('Error adding lesson material:', error);
      toast.error('Грешка при добавяне на материал');
      throw error;
    }
  }, [isAdmin]);

  // Lecture materials
  const getLectureMaterials = useCallback(async (lectureSlug) => {
    try {
      const data = await coursesService.getLectureMaterials(lectureSlug);
      return data.materials || [];
    } catch (error) {
      console.error('Error fetching lecture materials:', error);
      return [];
    }
  }, []);

  const addLectureMaterial = useCallback(async (lectureSlug, materialData) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.addLectureMaterial(lectureSlug, materialData);
      toast.success('Материалът е добавен успешно');
      return response;
    } catch (error) {
      console.error('Error adding lecture material:', error);
      toast.error('Грешка при добавяне на материал');
      throw error;
    }
  }, [isAdmin]);

  // Seminar materials
  const getSeminarMaterials = useCallback(async (seminarSlug) => {
    try {
      const data = await coursesService.getSeminarMaterials(seminarSlug);
      return data.materials || [];
    } catch (error) {
      console.error('Error fetching seminar materials:', error);
      return [];
    }
  }, []);
  const getLessonMaterials = useCallback(async (lessonSlug) => {
    try {
      const data = await coursesService.getLessonMaterials(lessonSlug);
      return data.materials || [];
    } catch (error) {
      console.error('Error fetching lesson materials:', error);
      return [];
    }
  }, []);
  const addSeminarMaterial = useCallback(async (seminarSlug, materialData) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.addSeminarMaterial(seminarSlug, materialData);
      toast.success('Материалът е добавен успешно');
      return response;
    } catch (error) {
      console.error('Error adding seminar material:', error);
      toast.error('Грешка при добавяне на материал');
      throw error;
    }
  }, [isAdmin]);

  const deleteSeminarMaterial = useCallback(async (entityType, entityId, materialId) => {
    try {
      const response = await coursesService.deleteMaterial(entityType, entityId, materialId);
      return response;
    } catch (error) {
      console.error('Error deleting material:', error);
      throw error;
    }
  }, []);

  // Seminar reviews
  const getSeminarReviews = useCallback(async (seminarId) => {
    try {
      return await coursesService.getSeminarReviews(seminarId);
    } catch (error) {
      console.error('Error fetching seminar reviews:', error);
      return { reviews: [], avgRating: null };
    }
  }, []);

  const addSeminarReview = useCallback(async (seminarId, reviewData) => {
    try {
      return await coursesService.addSeminarReview(seminarId, reviewData);
    } catch (error) {
      console.error('Error adding seminar review:', error);
      throw error;
    }
  }, []);

  const getAdminSeminarReviews = useCallback(async (status) => {
    try {
      return await coursesService.getAdminSeminarReviews(status);
    } catch (error) {
      console.error('Error fetching admin seminar reviews:', error);
      return { reviews: [] };
    }
  }, [isAdmin]);

  const approveSeminarReview = useCallback(async (reviewId) => {
    try {
      const result = await coursesService.approveSeminarReview(reviewId);
      toast.success('Ревюто е одобрено');
      return result;
    } catch (error) {
      console.error('Error approving seminar review:', error);
      toast.error('Грешка при одобряване на ревю');
      throw error;
    }
  }, [isAdmin]);

  const deleteSeminarReview = useCallback(async (reviewId) => {
    try {
      const result = await coursesService.deleteSeminarReview(reviewId);
      toast.success('Ревюто е изтрито');
      return result;
    } catch (error) {
      console.error('Error deleting seminar review:', error);
      toast.error('Грешка при изтриване на ревю');
      throw error;
    }
  }, [isAdmin]);

  // Seminar videos
  const getSeminarSessions = useCallback(async (seminarId) => {
    try {
      const data = await coursesService.getSeminarSessions(seminarId);
      return data.sessions || [];
    } catch (error) {
      console.error('Error fetching seminar sessions:', error);
      return [];
    }
  }, []);

  const createSeminarSessions = useCallback(async (seminarId, sessions) => {
    try {
      return await coursesService.createSeminarSessions(seminarId, sessions);
    } catch (error) {
      console.error('Error creating seminar sessions:', error);
      throw error;
    }
  }, []);

  const deleteSeminarSession = useCallback(async (seminarId, sessionId) => {
    try {
      return await coursesService.deleteSeminarSession(seminarId, sessionId);
    } catch (error) {
      console.error('Error deleting seminar session:', error);
      throw error;
    }
  }, []);

  const getSeminarVideos = useCallback(async (seminarId) => {
    try {
      const data = await coursesService.getSeminarVideos(seminarId);
      return data.videos || [];
    } catch (error) {
      console.error('Error fetching seminar videos:', error);
      return [];
    }
  }, []);

  const addSeminarVideo = useCallback(async (seminarId, videoData) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.addSeminarVideo(seminarId, videoData);
      toast.success('Видеото е добавено успешно');
      return response;
    } catch (error) {
      console.error('Error adding seminar video:', error);
      toast.error('Грешка при добавяне на видео');
      throw error;
    }
  }, [isAdmin]);

  const deleteSeminarVideo = useCallback(async (seminarId, videoId) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.deleteSeminarVideo(seminarId, videoId);
      toast.success('Видеото е изтрито успешно');
      return response;
    } catch (error) {
      console.error('Error deleting seminar video:', error);
      toast.error('Грешка при изтриване на видео');
      throw error;
    }
  }, [isAdmin]);

  const reorderSeminarVideos = useCallback(async (seminarId, videoIds) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.reorderSeminarVideos(seminarId, videoIds);
      return response;
    } catch (error) {
      console.error('Error reordering seminar videos:', error);
      toast.error('Грешка при пренареждане на видеа');
      throw error;
    }
  }, [isAdmin]);

  // =========================================================
  //                    YOUTUBE
  // =========================================================

  const getYouTubeStatus = useCallback(async () => {
    try {
      return await coursesService.getYouTubeStatus();
    } catch (error) {
      console.error('Error checking YouTube status:', error);
      return { connected: false };
    }
  }, []);

  const getYouTubeAuthUrl = useCallback(async () => {
    try {
      return await coursesService.getYouTubeAuthUrl();
    } catch (error) {
      console.error('Error getting YouTube auth URL:', error);
      throw error;
    }
  }, []);

  const uploadToYouTube = useCallback(async (formData) => {
    try {
      return await coursesService.uploadToYouTube(formData);
    } catch (error) {
      console.error('Error uploading to YouTube:', error);
      throw error;
    }
  }, []);

  const deleteFromYouTube = useCallback(async (videoId) => {
    try {
      return await coursesService.deleteFromYouTube(videoId);
    } catch (error) {
      console.error('Error deleting from YouTube:', error);
      throw error;
    }
  }, []);

  const deleteLessonMaterial = useCallback(async (lessonId, materialId) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.deleteLessonMaterial(lessonId, materialId);
      toast.success('Материалът е изтрит успешно');
      return response;
    } catch (error) {
      console.error('Error deleting lesson material:', error);
      toast.error('Грешка при изтриване на материал');
      throw error;
    }
  }, [isAdmin]);
  // =========================================================
  //                    MY ACADEMY (Student Dashboard)
  // =========================================================

  const getMyDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await coursesService.getMyDashboard();
      setMyDashboard(data.dashboard || data);
      return data;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      return { dashboard: {} };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMyCourses = useCallback(async (params = {}) => {
    try {
      const data = await coursesService.getMyCourses(params);
      return data;
    } catch (error) {
      console.error('Error fetching my courses:', error);
      return { courses: [], pagination: {} };
    }
  }, []);

  const getContinueCourses = useCallback(async (limit = 3) => {
    try {
      const data = await coursesService.getContinueCourses(limit);
      return data.courses || [];
    } catch (error) {
      console.error('Error fetching continue courses:', error);
      return [];
    }
  }, []);

  const getMyLectures = useCallback(async (params = {}) => {
    try {
      const data = await coursesService.getMyLectures(params);
      return data;
    } catch (error) {
      console.error('Error fetching my lectures:', error);
      return { lectures: [], pagination: {} };
    }
  }, []);

  const getUpcomingLectures = useCallback(async (limit = 5) => {
    try {
      const data = await coursesService.getUpcomingLectures(limit);
      return data.lectures || [];
    } catch (error) {
      console.error('Error fetching upcoming lectures:', error);
      return [];
    }
  }, []);

  const getMySeminars = useCallback(async (params = {}) => {
    try {
      const data = await coursesService.getMySeminars(params);
      return data;
    } catch (error) {
      console.error('Error fetching my seminars:', error);
      return { seminars: [], pagination: {} };
    }
  }, []);

  const getUpcomingSeminars = useCallback(async (limit = 5) => {
    try {
      const data = await coursesService.getUpcomingSeminars(limit);
      return data.seminars || [];
    } catch (error) {
      console.error('Error fetching upcoming seminars:', error);
      return [];
    }
  }, []);

  const getMyProgress = useCallback(async () => {
    try {
      const data = await coursesService.getMyProgress();
      return data;
    } catch (error) {
      console.error('Error fetching my progress:', error);
      return { progress: {} };
    }
  }, []);

  const getMyCourseProgress = useCallback(async (courseId) => {
    try {
      const data = await coursesService.getMyCourseProgress(courseId);
      return data;
    } catch (error) {
      console.error('Error fetching course progress:', error);
      throw error;
    }
  }, []);

  const getMySchedule = useCallback(async (days = 30) => {
    try {
      const data = await coursesService.getMySchedule(days);
      return data.schedule || [];
    } catch (error) {
      console.error('Error fetching schedule:', error);
      return [];
    }
  }, []);
  const getMyMentor = useCallback(async () => {
    try {
      const data = await academyService.getMyMentor();
      return data;
    } catch (error) {
      console.error('Error fetching my mentor:', error);
      return { mentor: null, assignedDate: null };
    }
  }, []);
  // =========================================================
  //                    COURSE REVIEWS
  // =========================================================

  const createCourseReview = useCallback(async (courseId, reviewData) => {
    try {
      const response = await academyService.createCourseReview(courseId, reviewData);
      toast.success('Ревюто е изпратено успешно');
      return response;
    } catch (error) {
      console.error('Error creating course review:', error);
      toast.error('Грешка при изпращане на ревю');
      throw error;
    }
  }, []);

  const getApprovedCourseReviews = useCallback(async (courseId, limit = 10) => {
    try {
      const data = await academyService.getApprovedCourseReviews(courseId, limit);
      return data;
    } catch (error) {
      console.error('Error fetching approved course reviews:', error);
      return { reviews: [], pagination: {} };
    }
  }, []);

  const getCourseReviewStats = useCallback(async (courseId) => {
    try {
      const data = await academyService.getCourseReviewStats(courseId);
      return data;
    } catch (error) {
      console.error('Error fetching course review stats:', error);
      return { averageRating: 0, totalReviews: 0 };
    }
  }, []);

  const checkUserCourseReviewStatus = useCallback(async (courseId) => {
    try {
      const data = await academyService.checkUserCourseReviewStatus(courseId);
      return data;
    } catch (error) {
      console.error('Error checking course review status:', error);
      return { hasReviewed: false };
    }
  }, []);

  // =========================================================
  //                    LECTURE REVIEWS
  // =========================================================

  const createLectureReview = useCallback(async (lectureId, reviewData) => {
    try {
      const response = await academyService.createLectureReview(lectureId, reviewData);
      toast.success('Ревюто е изпратено успешно');
      return response;
    } catch (error) {
      console.error('Error creating lecture review:', error);
      toast.error('Грешка при изпращане на ревю');
      throw error;
    }
  }, []);

  const getApprovedLectureReviews = useCallback(async (lectureId, limit = 10) => {
    try {
      const data = await academyService.getApprovedLectureReviews(lectureId, limit);
      return data;
    } catch (error) {
      console.error('Error fetching approved lecture reviews:', error);
      return { reviews: [], pagination: {} };
    }
  }, []);

  const getLectureReviewStats = useCallback(async (lectureId) => {
    try {
      const data = await academyService.getLectureReviewStats(lectureId);
      return data;
    } catch (error) {
      console.error('Error fetching lecture review stats:', error);
      return { averageRating: 0, totalReviews: 0 };
    }
  }, []);

  const checkUserLectureReviewStatus = useCallback(async (lectureId) => {
    try {
      const data = await academyService.checkUserLectureReviewStatus(lectureId);
      return data;
    } catch (error) {
      console.error('Error checking lecture review status:', error);
      return { hasReviewed: false };
    }
  }, []);

  // =========================================================
  //                    CONTEXT VALUE
  // =========================================================

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const contextValue = useMemo(() => ({
    // State
    isLoading,
    courses,
    currentCourse,
    lectures,
    seminars,
    myDashboard,
    currentLesson,
    lessonsProgress,
    enrollmentStats,
    // Courses - Public
    getCourses,
    getCourseBySlug,
    getCourseCategories,

    // Courses - Admin
    getAdminCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    publishCourse,
    unpublishCourse,
    duplicateCourse,
    getCourseStatistics,
    // Course Mentors
    searchMentors,
    addCourseMentor,
    updateCourseMentor,
    removeCourseMentor,
    // Modules
    getCourseModules,
    createModule,
    updateModule,
    deleteModule,
    reorderModules,

    // Lessons
    getCourseLessons,
    createLesson,
    getLessonBySlug,
    updateLesson,
    deleteLesson,
    reorderLessons,
    publishLesson,
    unpublishLesson,
    startLesson,
    stopLesson,

    // Lectures - Public
    getLectures,
    getLectureBySlug,
    getLectureCategories,

    // Lectures - Admin
    getAdminLectures,
    createLecture,
    updateLecture,
    deleteLecture,
    publishLecture,
    cancelLecture,
    startLecture,
    endLecture,
    stopLecture,
    unpublishLecture,
    getLectureById,
    addLectureMentor,
    updateLectureMentor,
    removeLectureMentor,
    // Lecture Registration
    registerForLecture,
    unregisterFromLecture,
    checkLectureRegistration,
    getLectureAttendees,
    markLectureAttended,

    // Seminars - Public
    getSeminars,
    getSeminarBySlug,
    getSeminarCategories,

    // Seminars - Mentor
    getMentorSeminars,

    // Seminars - Admin
    getAdminSeminars,
    createSeminar,
    updateSeminar,
    deleteSeminar,
    publishSeminar,
    unpublishSeminar,
    cancelSeminar,
    startSeminar,
    stopSeminar,
    completeSeminar,
    getAdminSeminarStatistics,
    getSeminarAttendanceDetail,
    sendSeminarEmail,

    // Seminar Registration
    registerForSeminar,
    unregisterFromSeminar,
    checkSeminarRegistration,
    getSeminarAttendees,
    searchSeminarStudents,
    bulkMixedAttendance,
    markSeminarAttended,
    getFullAttendance,
    // Enrollment
    getMyEnrollments,
    enrollInCourse,
    dropCourse,
    getEnrollmentStatus,
    updateLessonProgress,
    completeLesson,
    // Enrollment - slug based
    startLessonBySlug,
    updateLessonProgressBySlug,
    completeLessonBySlug,
    // Tests
    getTests,
    createTest,
    startTest,
    startTestById,
    submitAnswer,
    submitTest,
    getTestResults,
    currentTestData,
    getCurrentAttempt,
    clearTestCache,
    // Certificates
    getMyCertificates,
    verifyCertificate,
    generateCertificate,
    getTestStatus,
    getTestResultByAttempt,

    // Materials (slug-based)
    getCourseMaterials,
    addCourseMaterial,
    getLessonMaterials,
    addLessonMaterial,
    getLectureMaterials,
    addLectureMaterial,
    getSeminarSessions,
    createSeminarSessions,
    deleteSeminarSession,
    getSeminarMaterials,
    addSeminarMaterial,
    deleteSeminarMaterial,
    getSeminarReviews,
    addSeminarReview,
    getAdminSeminarReviews,
    approveSeminarReview,
    deleteSeminarReview,
    getSeminarVideos,
    addSeminarVideo,
    deleteSeminarVideo,
    reorderSeminarVideos,
    // Seminar Tests
    getSeminarTestStatus,
    startSeminarTest,
    submitSeminarAnswer,
    submitSeminarTest,
    deleteLessonMaterial,
    deleteCourseMaterial,
    // My Academy
    getMyDashboard,
    getMyCourses,
    getContinueCourses,
    getMyLectures,
    getUpcomingLectures,
    getMySeminars,
    getUpcomingSeminars,
    getMyProgress,
    getMyCourseProgress,
    getMySchedule,
    getMyMentor,
    // Lecture Tests
    startLectureTest,
    getLectureTestStatus,
    getLectureAttempt,
    submitLectureAnswer,
    submitLectureTest,
    // Tests - Admin CRUD
    getTestById,
    updateTest,
    deleteTest,
    publishTest,
    unpublishTest,
    getTestAttempts,
    getCourseTestStatus,
    // Questions - Admin CRUD
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,

    // Course Reviews
    createCourseReview,
    getApprovedCourseReviews,
    getCourseReviewStats,
    checkUserCourseReviewStatus,

    // Lecture Reviews
    createLectureReview,
    getApprovedLectureReviews,
    getLectureReviewStats,
    checkUserLectureReviewStatus,
    checkinSeminar,
    // YouTube
    getYouTubeStatus,
    getYouTubeAuthUrl,
    uploadToYouTube,
    deleteFromYouTube,
  }), [isLoading, courses, currentCourse, lectures, seminars, myDashboard,
    currentLesson, lessonsProgress, enrollmentStats, currentTestData]);

  return (
    <AcademyCoursesContext.Provider value={contextValue}>
      {children}
    </AcademyCoursesContext.Provider>
  );
};

export const useAcademyCourses = () => {
  const context = useContext(AcademyCoursesContext);
  if (!context) {
    throw new Error('useAcademyCourses must be used within AcademyCoursesProvider');
  }
  return context;
};