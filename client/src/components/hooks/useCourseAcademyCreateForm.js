// src/components/hooks/useCourseAcademyCreateForm.js

import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAcademyCourses } from '../contexts/AcademyCoursesProvider';

// =========================================================
//                    CONSTANTS
// =========================================================

const TOTAL_STEPS = 4;

const INITIAL_COURSE_DATA = {
    // Step 1 - Basic Info
    name: '',
    shortDescription: '',
    description: '',
    category: '',
    difficultyLevel: 'beginner',
    thumbnailUrl: '',
    trailerUrl: '',
    // Step 2 - Settings
    courseType: 'online',
    videoProvider: 'youtube',
    durationWeeks: '',
    estimatedHours: '',
    startDate: '',
    endDate: '',
    maxParticipants: '',
    requiresApproval: false,
    isPublic: true,
    maxCredits: 0,
    creditsForCompletion: 0,
    hasCertificate: false,
    tags: '',
    targetAudience: '',
};

const createNewModule = () => ({
    tempId: `mod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: '',
    description: '',
    isOpen: true,
    lessons: [],
});

const createNewLesson = () => ({
    tempId: `les-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: '',
    description: '',
    lessonType: 'video',
    durationMinutes: '',
    videoUrl: '',
    isFree: false,
});

// =========================================================
//                    HOOK
// =========================================================

const useCourseAcademyCreateForm = () => {
    const { courseSlug } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // API функциите с prefix "api" за да няма конфликт с локалните state функции
    const {
        getCourseBySlug,
        createCourse,
        updateCourse,
        publishCourse,
        createModule: apiCreateModule,
        updateModule: apiUpdateModule,
        createLesson: apiCreateLesson,
        updateLesson: apiUpdateLesson,
    } = useAcademyCourses();

    // =========================================================
    //                    STATE
    // =========================================================

    const isEditMode = Boolean(courseSlug);

    const [currentStep, setCurrentStep] = useState(1);
    const [courseData, setCourseData] = useState(INITIAL_COURSE_DATA);
    const [modules, setModules] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [courseId, setCourseId] = useState(null);
    const [errors, setErrors] = useState({});

    // =========================================================
    //                    LOAD DATA (Edit Mode)
    // =========================================================

    useEffect(() => {
        if (isEditMode && courseSlug) {
            loadCourseData();
        }
    }, [courseSlug]);

    const loadCourseData = async () => {
        try {
            setIsLoading(true);
            const data = await getCourseBySlug(courseSlug);
            const course = data.course || data;

            setCourseData({
                name: course.name || '',
                shortDescription: course.shortDescription || '',
                description: course.description || '',
                category: course.category || '',
                difficultyLevel: course.difficultyLevel || 'beginner',
                thumbnailUrl: course.thumbnailUrl || '',
                trailerUrl: course.trailerUrl || '',
                courseType: course.courseType || 'online',
                videoProvider: course.videoProvider || 'youtube',
                durationWeeks: course.durationWeeks || '',
                estimatedHours: course.estimatedHours || '',
                startDate: course.startDate ? course.startDate.split('T')[0] : '',
                endDate: course.endDate ? course.endDate.split('T')[0] : '',
                maxParticipants: course.maxParticipants || '',
                requiresApproval: course.requiresApproval || false,
                isPublic: course.isPublic !== undefined ? course.isPublic : true,
                maxCredits: course.maxCredits || 0,
                creditsForCompletion: course.creditsForCompletion || 0,
                hasCertificate: course.hasCertificate || false,
                tags: course.tags ? (Array.isArray(course.tags) ? course.tags.join(', ') : course.tags) : '',
                targetAudience: course.targetAudience ? (Array.isArray(course.targetAudience) ? course.targetAudience.join(', ') : course.targetAudience) : '',
            });

            setCourseId(course.id);

            // Map existing modules with lessons
            if (course.modules && course.modules.length > 0) {
                setModules(
                    course.modules.map((mod) => ({
                        id: mod.id,
                        tempId: `mod-${mod.id}`,
                        title: mod.title || '',
                        description: mod.description || '',
                        isOpen: false,
                        lessons: (mod.lessons || []).map((les) => ({
                            id: les.id,
                            tempId: `les-${les.id}`,
                            title: les.title || '',
                            description: les.description || '',
                            lessonType: les.lessonType || 'video',
                            durationMinutes: les.durationMinutes || '',
                            videoUrl: les.videoUrl || '',
                            isFree: les.isFree || false,
                        })),
                    }))
                );
            }
        } catch (error) {
            console.error('Error loading course:', error);
            toast.error(t('courseFormHook.loadFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    // =========================================================
    //                    HELPERS
    // =========================================================

    const prepareCoursePayload = () => ({
        ...courseData,
        tags: courseData.tags
            ? String(courseData.tags).split(',').map((tag) => tag.trim()).filter(Boolean)
            : [],
        targetAudience: courseData.targetAudience
            ? String(courseData.targetAudience).split(',').map((t) => t.trim()).filter(Boolean)
            : [],
    });
    const saveModulesAndLessons = async (slug) => {
  for (let i = 0; i < modules.length; i++) {
    const mod = modules[i];
    let moduleId = mod.id;

    // Създай или обнови модул
    if (!moduleId) {
      const modResult = await apiCreateModule(slug, {
        title: mod.title || `Module ${i + 1}`,
        description: mod.description || '',
        isPublished: false,
      });
      moduleId = modResult?.module?.id;

      // Запази id в state
      setModules((prev) =>
        prev.map((m, idx) => (idx === i ? { ...m, id: moduleId } : m))
      );
    } else {
      await apiUpdateModule(slug, moduleId, {
        title: mod.title,
        description: mod.description,
      });
    }

    // Запиши уроците за този модул
    if (moduleId) {
      for (let j = 0; j < mod.lessons.length; j++) {
        const les = mod.lessons[j];

        if (!les.id) {
          const lessonPayload = {
            title: les.title || `Lesson ${j + 1}`,
            description: les.description || '',
            lessonType: les.lessonType || 'video',
            isFree: les.isFree || false,
            moduleId: moduleId,
          };

          if (les.durationMinutes && Number(les.durationMinutes) > 0) {
            lessonPayload.durationMinutes = Number(les.durationMinutes);
          }
          if (les.videoUrl) {
            lessonPayload.videoUrl = les.videoUrl;
          }

          const lesResult = await apiCreateLesson(slug, lessonPayload);
          const newLessonId = lesResult?.lesson?.id;

          // Запази id в state
          setModules((prev) =>
            prev.map((m, mIdx) => {
              if (mIdx !== i) return m;
              return {
                ...m,
                lessons: m.lessons.map((l, lIdx) =>
                  lIdx === j ? { ...l, id: newLessonId } : l
                ),
              };
            })
          );
        } else {
          const updatePayload = {
            title: les.title,
            description: les.description,
            lessonType: les.lessonType,
            isFree: les.isFree,
          };

          if (les.durationMinutes && Number(les.durationMinutes) > 0) {
            updatePayload.durationMinutes = Number(les.durationMinutes);
          }

          await apiUpdateLesson(slug, les.id, updatePayload);
        }
      }
    }
  }
};

    // =========================================================
    //                    FIELD UPDATES
    // =========================================================

    const updateField = useCallback((field, value) => {
        setCourseData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    }, [errors]);

    const updateMultipleFields = useCallback((fields) => {
        setCourseData((prev) => ({ ...prev, ...fields }));
    }, []);

    // =========================================================
    //                    STEP NAVIGATION
    // =========================================================

    const goToStep = useCallback((step) => {
        if (step >= 1 && step <= TOTAL_STEPS) {
            setCurrentStep(step);
        }
    }, []);

    const nextStep = useCallback(() => {
        goToStep(currentStep + 1);
    }, [currentStep, goToStep]);

    const prevStep = useCallback(() => {
        goToStep(currentStep - 1);
    }, [currentStep, goToStep]);

    // =========================================================
    //                    VALIDATION
    // =========================================================

    const validateStep = useCallback((step) => {
        const newErrors = {};

        if (step === 1) {
            if (!courseData.name.trim()) {
                newErrors.name = t('courseFormHook.nameRequired');
            }
            if (!courseData.category) {
                newErrors.category = t('courseFormHook.categoryRequired');
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [courseData, t]);

    const validateAll = useCallback(() => {
        const newErrors = {};

        if (!courseData.name.trim()) {
            newErrors.name = t('courseFormHook.nameRequired');
        }
        if (!courseData.category) {
            newErrors.category = t('courseFormHook.categoryRequired');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [courseData, t]);

    // =========================================================
    //                    SAVE DRAFT
    // =========================================================

    const handleSaveDraft = useCallback(async () => {
  try {
    setIsSaving(true);

    const coursePayload = prepareCoursePayload();
    let slug = courseSlug;
    let id = courseId;

    // 1. Създай или обнови курса
    if (id) {
      await updateCourse(id, coursePayload);
    } else {
      const result = await createCourse(coursePayload);
      const newCourse = result?.course;
      if (!newCourse?.id) throw new Error('Failed to create course');

      // Веднага запази в state - дори модулите да гръмнат после
      id = newCourse.id;
      slug = newCourse.slug;
      setCourseId(id);

      // Веднага навигирай за да имаме slug в URL
      navigate(`/academy/admin/edit-course/${slug}`, { replace: true });
    }

    // 2. Запиши модулите и уроците
    const courseIdentifier = slug || id;
    if (courseIdentifier && modules.length > 0) {
      try {
        await saveModulesAndLessons(courseIdentifier);
      } catch (modError) {
        console.error('Error saving modules:', modError);
        toast.warning(t('courseFormHook.courseCreatedModulesFailed'));
        return; // Курсът е създаден, само модулите са гръмнали
      }
    }

    toast.success(id === courseId ? t('courseFormHook.draftSaved') : t('courseFormHook.draftCreated'));
  } catch (error) {
    console.error('Error saving draft:', error);
    toast.error(t('courseFormHook.saveFailed'));
  } finally {
    setIsSaving(false);
  }
}, [courseId, courseSlug, courseData, modules, createCourse, updateCourse, navigate, t]);

    // =========================================================
    //                    PUBLISH
    // =========================================================

    const handlePublish = useCallback(async () => {
  if (!validateAll()) {
    toast.error(t('courseFormHook.validationFailed'));
    return;
  }

  try {
    setIsSaving(true);

    const coursePayload = prepareCoursePayload();
    let slug = courseSlug;
    let id = courseId;

    // 1. Създай или обнови курса
    if (!id) {
      const result = await createCourse(coursePayload);
      id = result?.course?.id;
      slug = result?.course?.slug;
      if (!id) throw new Error('Failed to create course');

      // Веднага запази
      setCourseId(id);
    } else {
      await updateCourse(id, coursePayload);
    }

    // 2. Запиши модулите и уроците
    const courseIdentifier = slug || id;
    if (courseIdentifier && modules.length > 0) {
      await saveModulesAndLessons(courseIdentifier);
    }

    // 3. Публикувай
    await publishCourse(id);
    toast.success(t('courseFormHook.published'));
    navigate('/academy/courses');
  } catch (error) {
    console.error('Error publishing:', error);
    toast.error(t('courseFormHook.publishFailed'));
  } finally {
    setIsSaving(false);
  }
}, [courseId, courseSlug, courseData, modules, validateAll, createCourse, updateCourse, publishCourse, navigate, t]);

    // =========================================================
    //                    MODULE MANAGEMENT (Local State)
    // =========================================================

    const addModule = useCallback(() => {
        setModules((prev) => [...prev, createNewModule()]);
    }, []);

    const updateModule = useCallback((moduleIndex, field, value) => {
        setModules((prev) =>
            prev.map((mod, i) => (i === moduleIndex ? { ...mod, [field]: value } : mod))
        );
    }, []);

    const removeModule = useCallback((moduleIndex) => {
        setModules((prev) => prev.filter((_, i) => i !== moduleIndex));
    }, []);

    const moveModule = useCallback((moduleIndex, direction) => {
        setModules((prev) => {
            const targetIndex = moduleIndex + direction;
            if (targetIndex < 0 || targetIndex >= prev.length) return prev;
            const newArr = [...prev];
            [newArr[moduleIndex], newArr[targetIndex]] = [newArr[targetIndex], newArr[moduleIndex]];
            return newArr;
        });
    }, []);

    const toggleModule = useCallback((moduleIndex) => {
        setModules((prev) =>
            prev.map((mod, i) => (i === moduleIndex ? { ...mod, isOpen: !mod.isOpen } : mod))
        );
    }, []);

    // =========================================================
    //                    LESSON MANAGEMENT (Local State)
    // =========================================================

    const addLesson = useCallback((moduleIndex) => {
        setModules((prev) =>
            prev.map((mod, i) => {
                if (i !== moduleIndex) return mod;
                return { ...mod, lessons: [...mod.lessons, createNewLesson()] };
            })
        );
    }, []);

    const updateLesson = useCallback((moduleIndex, lessonIndex, field, value) => {
        setModules((prev) =>
            prev.map((mod, i) => {
                if (i !== moduleIndex) return mod;
                return {
                    ...mod,
                    lessons: mod.lessons.map((les, j) =>
                        j === lessonIndex ? { ...les, [field]: value } : les
                    ),
                };
            })
        );
    }, []);

    const removeLesson = useCallback((moduleIndex, lessonIndex) => {
        setModules((prev) =>
            prev.map((mod, i) => {
                if (i !== moduleIndex) return mod;
                return { ...mod, lessons: mod.lessons.filter((_, j) => j !== lessonIndex) };
            })
        );
    }, []);

    const moveLesson = useCallback((moduleIndex, lessonIndex, direction) => {
        setModules((prev) =>
            prev.map((mod, i) => {
                if (i !== moduleIndex) return mod;
                const targetIndex = lessonIndex + direction;
                if (targetIndex < 0 || targetIndex >= mod.lessons.length) return mod;
                const newLessons = [...mod.lessons];
                [newLessons[lessonIndex], newLessons[targetIndex]] = [newLessons[targetIndex], newLessons[lessonIndex]];
                return { ...mod, lessons: newLessons };
            })
        );
    }, []);

    // =========================================================
    //                    RETURN
    // =========================================================

    return {
        // State
        isEditMode,
        currentStep,
        courseData,
        modules,
        isLoading,
        isSaving,
        courseId,
        errors,
        totalSteps: TOTAL_STEPS,

        // Field updates
        updateField,
        updateMultipleFields,

        // Navigation
        goToStep,
        nextStep,
        prevStep,

        // Validation
        validateStep,
        validateAll,

        // Actions
        handleSaveDraft,
        handlePublish,

        // Modules (local state)
        addModule,
        updateModule,
        removeModule,
        moveModule,
        toggleModule,

        // Lessons (local state)
        addLesson,
        updateLesson,
        removeLesson,
        moveLesson,
    };
};

export default useCourseAcademyCreateForm;