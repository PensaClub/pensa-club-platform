// src/components/AdminAcademyCoursesList/CourseContentManager/useCourseContentManager.js

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAcademyCourses } from '../../contexts/AcademyCoursesProvider';

const useCourseContentManager = () => {
  const { t } = useTranslation('academy-admin');
  const { slug } = useParams();
  const navigate = useLocalizedNavigate();

  const {
    getCourseBySlug,
    getCourseModules,
    createModule,
    updateModule,
    deleteModule,
    reorderModules,
    createLesson,
    updateLesson,
    deleteLesson,
    reorderLessons,
    publishLesson,
    unpublishLesson,
    deleteCourseMaterial,
    getCourseMaterials,
    addCourseMaterial
  } = useAcademyCourses();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [editingModule, setEditingModule] = useState(null);
  const [addingModule, setAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [addingLessonTo, setAddingLessonTo] = useState(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState('video');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
const [standaloneLessons, setStandaloneLessons] = useState([]);
const [courseMaterials, setCourseMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  // =========================================================
  //                    LOAD DATA
  // =========================================================

 const loadData = useCallback(async () => {
  try {
    setIsLoading(true);
    const courseData = await getCourseBySlug(slug);
    const c = courseData.course || courseData;
    setCourse(c);

    const mods = await getCourseModules(c.id);
    setModules(mods);

    // Standalone lessons (без модул)
    setStandaloneLessons(c.lessons || []);

    const expanded = {};
    mods.forEach((m) => { expanded[m.id] = true; });
    expanded['standalone'] = true; // разгъни и standalone секцията
    setExpandedModules(expanded);
  } catch (err) {
    console.error('Error loading course content:', err);
    toast.error(t('contentManager.errors.loadFailed', 'Грешка при зареждане'));
    navigate('/academy/admin/courses');
  } finally {
    setIsLoading(false);
  }
}, [slug]);
const loadCourseMaterials = useCallback(async () => {
    if (!slug) return;
    try {
      setMaterialsLoading(true);
      const materials = await getCourseMaterials(slug);
      setCourseMaterials(materials || []);
    } catch (err) {
      console.error('Error loading course materials:', err);
    } finally {
      setMaterialsLoading(false);
    }
  }, [slug, getCourseMaterials]);

  useEffect(() => {
    if (slug) loadData();
     loadCourseMaterials();
  }, [slug,loadCourseMaterials]);

  // =========================================================
  //                    MODULES
  // =========================================================

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;
    setActionLoading('add-module');
    try {
      await createModule(course.id, { title: newModuleTitle.trim() });
      setNewModuleTitle('');
      setAddingModule(false);
      await loadData();
   } catch (err) {
      console.error('Error adding module:', err);
      const msg = err?.errors?.[0]?.message;
      toast.error(msg || t('contentManager.errors.addModuleFailed', 'Грешка при добавяне на модул'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateModule = async (moduleId, updates) => {
    setActionLoading(`module-${moduleId}`);
    try {
      await updateModule(course.id, moduleId, {
        ...updates,
        title: updates.title?.trim(),
      });
      setEditingModule(null);
      await loadData();
    } catch (err) {
      console.error('Error updating module:', err);
      const msg = err?.errors?.[0]?.message;
      toast.error(msg || t('contentManager.errors.updateModuleFailed', 'Грешка при обновяване на модул'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteModule = async () => {
    if (!deleteTarget || deleteTarget.type !== 'module') return;
    setActionLoading(`delete-${deleteTarget.id}`);
    try {
      await deleteModule(course.id, deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      console.error('Error deleting module:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMoveModule = async (moduleId, direction) => {
    const idx = modules.findIndex((m) => m.id === moduleId);
    if (idx < 0) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= modules.length) return;

    const reordered = [...modules];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];

    setModules(reordered);
    try {
      await reorderModules(course.id, reordered.map((m) => m.id));
    } catch (err) {
      console.error('Error reordering modules:', err);
      await loadData();
    }
  };

  // =========================================================
  //                    LESSONS
  // =========================================================

  const handleAddLesson = async (moduleId) => {
    if (!newLessonTitle.trim()) return;
    setActionLoading(`add-lesson-${moduleId}`);
    try {
      await createLesson(slug, {
        title: newLessonTitle.trim(),
        lessonType: newLessonType,
        moduleId: moduleId || null,
      });
      setNewLessonTitle('');
      setNewLessonType('video');
      setAddingLessonTo(null);
      await loadData();
     } catch (err) {
      console.error('Error adding lesson:', err);
      const msg = err?.errors?.[0]?.message;
      toast.error(msg || t('contentManager.errors.addLessonFailed', 'Грешка при добавяне на урок'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteLesson = async () => {
    if (!deleteTarget || deleteTarget.type !== 'lesson') return;
    setActionLoading(`delete-${deleteTarget.slug}`);
    try {
      await deleteLesson(slug, deleteTarget.slug);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      console.error('Error deleting lesson:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleLessonPublish = async (lessonSlug, isPublished) => {
    setActionLoading(`publish-${lessonSlug}`);
    try {
      if (isPublished) {
        await unpublishLesson(slug, lessonSlug);
      } else {
        await publishLesson(slug, lessonSlug);
      }
      await loadData();
    } catch (err) {
      console.error('Error toggling lesson publish:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMoveLessonInModule = async (moduleId, lessonId, direction) => {
  // За standalone уроци
  if (moduleId === 'standalone') {
    const lessons = [...standaloneLessons];
    const idx = lessons.findIndex((l) => l.id === lessonId);
    if (idx < 0) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= lessons.length) return;

    [lessons[idx], lessons[newIdx]] = [lessons[newIdx], lessons[idx]];
    setStandaloneLessons(lessons);

    try {
      await reorderLessons(slug, lessons.map((l) => l.id), null);
    } catch (err) {
      console.error('Error reordering standalone lessons:', err);
      await loadData();
    }
    return;
  }

  // Оригиналния код за модулни уроци
  const mod = modules.find((m) => m.id === moduleId);
  if (!mod) return;

  const lessons = [...(mod.lessons || [])];
  const idx = lessons.findIndex((l) => l.id === lessonId);
  if (idx < 0) return;
  const newIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (newIdx < 0 || newIdx >= lessons.length) return;

  [lessons[idx], lessons[newIdx]] = [lessons[newIdx], lessons[idx]];
  setModules((prev) =>
    prev.map((m) => (m.id === moduleId ? { ...m, lessons } : m))
  );

  try {
    await reorderLessons(slug, lessons.map((l) => l.id), moduleId);
  } catch (err) {
    console.error('Error reordering lessons:', err);
    await loadData();
  }
};
const handleAddCourseMaterial = useCallback(async (materialData) => {
    try {
      setActionLoading('addCourseMaterial');
      await addCourseMaterial(slug, materialData);
      await loadCourseMaterials();
    } catch (err) {
      console.error('Error adding course material:', err);
    } finally {
      setActionLoading(null);
    }
  }, [slug, addCourseMaterial, loadCourseMaterials]);

  const handleDeleteCourseMaterial = useCallback(async (materialId) => {
    if (!course) return;
    try {
      setActionLoading(`deleteMaterial-${materialId}`);
      await deleteCourseMaterial(course.id, materialId);
      await loadCourseMaterials();
    } catch (err) {
      console.error('Error deleting course material:', err);
    } finally {
      setActionLoading(null);
    }
  }, [course, deleteCourseMaterial, loadCourseMaterials]);

  const openEditLesson = (lesson) => {
    setEditingLesson(lesson);
  };

  const closeEditLesson = () => {
    setEditingLesson(null);
    loadData();
  };

  const handleBack = () => {
    navigate('/academy/admin/courses');
  };

  return {
    course,
    slug,
    modules,
    isLoading,
    actionLoading,
    expandedModules,
    editingModule,
    addingModule,
    newModuleTitle,
    addingLessonTo,
    newLessonTitle,
    newLessonType,
    deleteTarget,
    editingLesson,
    // Actions
    toggleModule,
    setAddingModule,
    setNewModuleTitle,
    handleAddModule,
    setEditingModule,
    handleUpdateModule,
    handleMoveModule,
    setAddingLessonTo,
    setNewLessonTitle,
    setNewLessonType,
    handleAddLesson,
    handleToggleLessonPublish,
    handleMoveLessonInModule,
    setDeleteTarget,
    handleDeleteModule,
    handleDeleteLesson,
    openEditLesson,
    closeEditLesson,
    handleBack,
    loadData,
    standaloneLessons,
    courseMaterials,
    materialsLoading,
    handleAddCourseMaterial,
    handleDeleteCourseMaterial,
  };
};

export default useCourseContentManager;