// src/components/contexts/AcademyCoursesProvider.jsx

import { createContext, useContext, useState, useCallback } from 'react';
import { useAuthContext } from './UserContext';
import { academyCoursesServiceFactory } from '../Services/academyCoursesService';
import { toast } from 'react-toastify';

export const AcademyCoursesContext = createContext();

export const AcademyCoursesProvider = ({ children }) => {
  const { isAdmin } = useAuthContext();
  const coursesService = academyCoursesServiceFactory();

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [seminars, setSeminars] = useState([]);
  const [myDashboard, setMyDashboard] = useState(null);

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

  const getCourseLessons = useCallback(async (courseId) => {
    try {
      const data = await coursesService.getCourseLessons(courseId);
      return data.lessons || [];
    } catch (error) {
      console.error('Error fetching lessons:', error);
      return [];
    }
  }, []);

  const createLesson = useCallback(async (courseId, lessonData) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.createLesson(courseId, lessonData);
      toast.success('Урокът е създаден успешно');
      return response;
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast.error('Грешка при създаване на урок');
      throw error;
    }
  }, [isAdmin]);

  const getLessonById = useCallback(async (courseId, lessonId) => {
    try {
      const data = await coursesService.getLessonById(courseId, lessonId);
      return data.lesson || data;
    } catch (error) {
      console.error('Error fetching lesson:', error);
      throw error;
    }
  }, []);

  const updateLesson = useCallback(async (courseId, lessonId, lessonData) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.updateLesson(courseId, lessonId, lessonData);
      toast.success('Урокът е обновен успешно');
      return response;
    } catch (error) {
      console.error('Error updating lesson:', error);
      toast.error('Грешка при обновяване на урок');
      throw error;
    }
  }, [isAdmin]);

  const deleteLesson = useCallback(async (courseId, lessonId) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.deleteLesson(courseId, lessonId);
      toast.success('Урокът е изтрит успешно');
      return response;
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error('Грешка при изтриване на урок');
      throw error;
    }
  }, [isAdmin]);

  const reorderLessons = useCallback(async (courseId, lessonIds, moduleId = null) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.reorderLessons(courseId, lessonIds, moduleId);
      return response;
    } catch (error) {
      console.error('Error reordering lessons:', error);
      throw error;
    }
  }, [isAdmin]);

  const publishLesson = useCallback(async (courseId, lessonId) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.publishLesson(courseId, lessonId);
      toast.success('Урокът е публикуван');
      return response;
    } catch (error) {
      console.error('Error publishing lesson:', error);
      toast.error('Грешка при публикуване');
      throw error;
    }
  }, [isAdmin]);

  const unpublishLesson = useCallback(async (courseId, lessonId) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.unpublishLesson(courseId, lessonId);
      toast.success('Урокът е скрит');
      return response;
    } catch (error) {
      console.error('Error unpublishing lesson:', error);
      toast.error('Грешка при скриване');
      throw error;
    }
  }, [isAdmin]);

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

  // =========================================================
  //                    LECTURE REGISTRATION
  // =========================================================

  const registerForLecture = useCallback(async (lectureId) => {
    try {
      setIsLoading(true);
      const response = await coursesService.registerForLecture(lectureId);
      toast.success('Регистрацията е успешна');
      return response;
    } catch (error) {
      console.error('Error registering for lecture:', error);
      toast.error('Грешка при регистрация');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unregisterFromLecture = useCallback(async (lectureId) => {
    try {
      const response = await coursesService.unregisterFromLecture(lectureId);
      toast.success('Регистрацията е отменена');
      return response;
    } catch (error) {
      console.error('Error unregistering from lecture:', error);
      toast.error('Грешка при отмяна на регистрация');
      throw error;
    }
  }, []);

  const getLectureAttendees = useCallback(async (lectureId) => {
    try {
      const data = await coursesService.getLectureAttendees(lectureId);
      return data.attendees || [];
    } catch (error) {
      console.error('Error fetching attendees:', error);
      return [];
    }
  }, []);

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

  // =========================================================
  //                    SEMINARS - ADMIN
  // =========================================================

  const getAdminSeminars = useCallback(async (params = {}) => {
    if (!isAdmin) {
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

  // =========================================================
  //                    SEMINAR REGISTRATION
  // =========================================================

  const registerForSeminar = useCallback(async (seminarId) => {
    try {
      setIsLoading(true);
      const response = await coursesService.registerForSeminar(seminarId);
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

  const getSeminarAttendees = useCallback(async (seminarId) => {
    try {
      const data = await coursesService.getSeminarAttendees(seminarId);
      return data.attendees || [];
    } catch (error) {
      console.error('Error fetching attendees:', error);
      return [];
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

  const getEnrollmentStatus = useCallback(async (courseId) => {
    try {
      const data = await coursesService.checkEnrollment(courseId);
      return data;
    } catch (error) {
      console.error('Error fetching enrollment status:', error);
      return { enrolled: false };
    }
  }, []);

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

  const submitAnswer = useCallback(async (testId, answerData) => {
    try {
      const response = await coursesService.submitAnswer(testId, answerData);
      return response;
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
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

  const getCourseMaterials = useCallback(async (courseId) => {
    try {
      const data = await coursesService.getCourseMaterials(courseId);
      return data.materials || [];
    } catch (error) {
      console.error('Error fetching materials:', error);
      return [];
    }
  }, []);

  const addCourseMaterial = useCallback(async (courseId, materialData) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return { success: false };
    }
    try {
      const response = await coursesService.addCourseMaterial(courseId, materialData);
      toast.success('Материалът е добавен успешно');
      return response;
    } catch (error) {
      console.error('Error adding material:', error);
      toast.error('Грешка при добавяне на материал');
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

  // =========================================================
  //                    CONTEXT VALUE
  // =========================================================

  const contextValue = {
    // State
    isLoading,
    courses,
    currentCourse,
    lectures,
    seminars,
    myDashboard,

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

    // Modules
    getCourseModules,
    createModule,
    updateModule,
    deleteModule,
    reorderModules,

    // Lessons
    getCourseLessons,
    createLesson,
    getLessonById,
    updateLesson,
    deleteLesson,
    reorderLessons,
    publishLesson,
    unpublishLesson,

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

    // Lecture Registration
    registerForLecture,
    unregisterFromLecture,
    getLectureAttendees,
    markLectureAttended,

    // Seminars - Public
    getSeminars,
    getSeminarBySlug,
    getSeminarCategories,

    // Seminars - Admin
    getAdminSeminars,
    createSeminar,
    updateSeminar,
    deleteSeminar,
    cancelSeminar,

    // Seminar Registration
    registerForSeminar,
    unregisterFromSeminar,
    getSeminarAttendees,

    // Enrollment
    getMyEnrollments,
    enrollInCourse,
    dropCourse,
    getEnrollmentStatus,
    updateLessonProgress,
    completeLesson,

    // Tests
    getTests,
    createTest,
    startTest,
    submitAnswer,
    submitTest,
    getTestResults,

    // Certificates
    getMyCertificates,
    verifyCertificate,
    generateCertificate,

    // Materials
    getCourseMaterials,
    addCourseMaterial,
    getMaterialTypes,

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
  };

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