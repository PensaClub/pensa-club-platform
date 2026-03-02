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
    mentors: [],
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
    const { t } = useTranslation('academy-admin');

    // API функциите с prefix "api" за да няма конфликт с локалните state функции
    const {
        getCourseBySlug,
        createCourse,
        updateCourse,
        publishCourse,
        addCourseMentor,
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
        name: courseData.name.trim(),
        shortDescription: (courseData.shortDescription || '').trim(),
        description: (courseData.description || '').trim(),
        category: (courseData.category || '').trim(),
        difficultyLevel: courseData.difficultyLevel,
        thumbnailUrl: (courseData.thumbnailUrl || '').trim(),
        trailerUrl: (courseData.trailerUrl || '').trim(),
        courseType: courseData.courseType,
        videoProvider: courseData.videoProvider,
        durationWeeks: courseData.durationWeeks ? Number(courseData.durationWeeks) : null,
        estimatedHours: courseData.estimatedHours ? Number(courseData.estimatedHours) : null,
        startDate: courseData.startDate || null,
        endDate: courseData.endDate || null,
        maxParticipants: courseData.maxParticipants ? Number(courseData.maxParticipants) : null,
        requiresApproval: courseData.requiresApproval,
        isPublic: courseData.isPublic,
        maxCredits: Number(courseData.maxCredits) || 0,
        creditsForCompletion: Number(courseData.creditsForCompletion) || 0,
        hasCertificate: courseData.hasCertificate,
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

            if (!moduleId) {
                const modResult = await apiCreateModule(slug, {
                    title: (mod.title || `Module ${i + 1}`).trim(),
                    description: (mod.description || '').trim(),
                    isPublished: false,
                });
                moduleId = modResult?.module?.id;

                setModules((prev) =>
                    prev.map((m, idx) => (idx === i ? { ...m, id: moduleId } : m))
                );
            } else {
                await apiUpdateModule(slug, moduleId, {
                    title: (mod.title || '').trim(),
                    description: (mod.description || '').trim(),
                });
            }

            if (moduleId) {
                for (let j = 0; j < mod.lessons.length; j++) {
                    const les = mod.lessons[j];

                    if (!les.id) {
                        const lessonPayload = {
                            title: (les.title || `Lesson ${j + 1}`).trim(),
                            description: (les.description || '').trim(),
                            lessonType: les.lessonType || 'video',
                            isFree: les.isFree || false,
                            moduleId: moduleId,
                        };

                        if (les.durationMinutes && Number(les.durationMinutes) > 0) {
                            lessonPayload.durationMinutes = Number(les.durationMinutes);
                        }
                        if (les.videoUrl) {
                            lessonPayload.videoUrl = les.videoUrl.trim();
                        }

                        const lesResult = await apiCreateLesson(slug, lessonPayload);
                        const newLessonId = lesResult?.lesson?.id;

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
                            title: (les.title || '').trim(),
                            description: (les.description || '').trim(),
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

    // =========================================================
    //                    VALIDATION
    // =========================================================

    const validateStep = useCallback((step) => {
        const newErrors = {};

        if (step === 1) {
            if (!courseData.name.trim()) {
                newErrors.name = t('courseFormHook.nameRequired', 'Името е задължително');
            } else if (courseData.name.trim().length < 3) {
                newErrors.name = t('courseFormHook.nameMinLength', 'Името трябва да е поне 3 символа');
            }
            if (courseData.thumbnailUrl && courseData.thumbnailUrl.trim() && !/^https?:\/\/.+/.test(courseData.thumbnailUrl.trim())) {
                newErrors.thumbnailUrl = t('courseFormHook.invalidUrl', 'Невалиден URL адрес');
            }
            if (courseData.trailerUrl && courseData.trailerUrl.trim() && !/^https?:\/\/.+/.test(courseData.trailerUrl.trim())) {
                newErrors.trailerUrl = t('courseFormHook.invalidUrl', 'Невалиден URL адрес');
            }
        }

        if (step === 2) {
            if (courseData.startDate && courseData.endDate && new Date(courseData.endDate) < new Date(courseData.startDate)) {
                newErrors.endDate = t('courseFormHook.endBeforeStart', 'Крайната дата не може да е преди началната');
            }
        }

        if (step === 3) {
            modules.forEach((mod, i) => {
                if (!mod.title.trim()) {
                    newErrors[`module_${i}_title`] = t('courseFormHook.moduleTitleRequired', 'Заглавието на модула е задължително');
                }
                mod.lessons.forEach((les, j) => {
                    if (!les.title.trim()) {
                        newErrors[`module_${i}_lesson_${j}_title`] = t('courseFormHook.lessonTitleRequired', 'Заглавието на урока е задължително');
                    }
                });
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [courseData, modules, t]);

    const validateAll = useCallback(() => {
        const allErrors = {};

        // Step 1
        if (!courseData.name.trim()) {
            allErrors.name = t('courseFormHook.nameRequired', 'Името е задължително');
        } else if (courseData.name.trim().length < 3) {
            allErrors.name = t('courseFormHook.nameMinLength', 'Името трябва да е поне 3 символа');
        }
        if (courseData.thumbnailUrl && courseData.thumbnailUrl.trim() && !/^https?:\/\/.+/.test(courseData.thumbnailUrl.trim())) {
            allErrors.thumbnailUrl = t('courseFormHook.invalidUrl', 'Невалиден URL адрес');
        }
        if (courseData.trailerUrl && courseData.trailerUrl.trim() && !/^https?:\/\/.+/.test(courseData.trailerUrl.trim())) {
            allErrors.trailerUrl = t('courseFormHook.invalidUrl', 'Невалиден URL адрес');
        }

        // Step 2
        if (courseData.startDate && courseData.endDate && new Date(courseData.endDate) < new Date(courseData.startDate)) {
            allErrors.endDate = t('courseFormHook.endBeforeStart', 'Крайната дата не може да е преди началната');
        }

        // Step 3
        modules.forEach((mod, i) => {
            if (!mod.title.trim()) {
                allErrors[`module_${i}_title`] = t('courseFormHook.moduleTitleRequired', 'Заглавието на модула е задължително');
            }
            mod.lessons.forEach((les, j) => {
                if (!les.title.trim()) {
                    allErrors[`module_${i}_lesson_${j}_title`] = t('courseFormHook.lessonTitleRequired', 'Заглавието на урока е задължително');
                }
            });
        });

        setErrors(allErrors);

        // Навигирай към първия step с грешка
        if (Object.keys(allErrors).length > 0) {
            if (allErrors.name || allErrors.thumbnailUrl || allErrors.trailerUrl) {
                setCurrentStep(1);
            } else if (allErrors.endDate) {
                setCurrentStep(2);
            } else {
                setCurrentStep(3);
            }
        }

        return Object.keys(allErrors).length === 0;
    }, [courseData, modules, t]);

    // =========================================================
    //                    SAVE DRAFT
    // =========================================================

    const handleSaveDraft = useCallback(async () => {
        // Минимална валидация — поне име
        if (!courseData.name.trim()) {
            setErrors({ name: t('courseFormHook.nameRequired', 'Името е задължително') });
            setCurrentStep(1);
            return;
        }

        try {
            setIsSaving(true);

            const coursePayload = prepareCoursePayload();
            let slug = courseSlug;
            let id = courseId;

            if (id) {
                await updateCourse(id, coursePayload);
            } else {
                const result = await createCourse(coursePayload);
                const newCourse = result?.course;
                if (!newCourse?.id) throw new Error('Failed to create course');

                id = newCourse.id;
                slug = newCourse.slug;
                setCourseId(id);
                navigate(`/academy/admin/edit-course/${slug}`, { replace: true });
            }

            const courseIdentifier = slug || id;
            if (courseIdentifier && modules.length > 0) {
                try {
                    await saveModulesAndLessons(courseIdentifier);
                } catch (modError) {
                    console.error('Error saving modules:', modError);
                    const msg = modError?.errors?.[0]?.message;
                    toast.warning(msg || t('courseFormHook.courseCreatedModulesFailed', 'Курсът е запазен, но модулите имат грешка'));
                    return;
                }
            }
            // Sync mentors
            if (courseData.mentors?.length > 0) {
                for (const m of courseData.mentors) {
                    try {
                        await addCourseMentor(id, { mentorId: m.mentorId, role: m.role, isLead: m.isLead });
                    } catch (e) {
                        console.warn('Mentor add failed:', e);
                    }
                }
            }
            toast.success(id === courseId
                ? t('courseFormHook.draftSaved', 'Черновата е запазена')
                : t('courseFormHook.draftCreated', 'Курсът е създаден')
            );
        } catch (err) {
            console.error('Error saving draft:', err);
            const serverErrors = err?.errors;
            if (Array.isArray(serverErrors) && serverErrors.length > 0) {
                const errMap = {};
                serverErrors.forEach(e => {
                    if (e.field) errMap[e.field] = e.message;
                });
                setErrors(errMap);
                setCurrentStep(1);
                toast.error(serverErrors[0].message || t('courseFormHook.saveFailed', 'Грешка при запазване'));
            } else {
                toast.error(t('courseFormHook.saveFailed', 'Грешка при запазване'));
            }
        } finally {
            setIsSaving(false);
        }
    }, [courseId, courseSlug, courseData, modules, createCourse, updateCourse, navigate, t]);

    const handlePublish = useCallback(async () => {
        if (!validateAll()) {
            toast.error(t('courseFormHook.validationFailed', 'Моля попълнете всички задължителни полета'));
            return;
        }

        try {
            setIsSaving(true);

            const coursePayload = prepareCoursePayload();
            let slug = courseSlug;
            let id = courseId;

            if (!id) {
                const result = await createCourse(coursePayload);
                id = result?.course?.id;
                slug = result?.course?.slug;
                if (!id) throw new Error('Failed to create course');
                setCourseId(id);
            } else {
                await updateCourse(id, coursePayload);
            }

            const courseIdentifier = slug || id;
            if (courseIdentifier && modules.length > 0) {
                await saveModulesAndLessons(courseIdentifier);
            }
            // Sync mentors
            if (courseData.mentors?.length > 0) {
                for (const m of courseData.mentors) {
                    try {
                        await addCourseMentor(id, { mentorId: m.mentorId, role: m.role, isLead: m.isLead });
                    } catch (e) {
                        console.warn('Mentor add failed:', e);
                    }
                }
            }
            await publishCourse(id);
            toast.success(t('courseFormHook.published', 'Курсът е публикуван'));
            navigate('/academy/admin/courses');
        } catch (err) {
            console.error('Error publishing:', err);
            const serverErrors = err?.errors;
            if (Array.isArray(serverErrors) && serverErrors.length > 0) {
                const errMap = {};
                serverErrors.forEach(e => {
                    if (e.field) errMap[e.field] = e.message;
                });
                setErrors(errMap);
                toast.error(serverErrors[0].message || t('courseFormHook.publishFailed', 'Грешка при публикуване'));
            } else {
                toast.error(t('courseFormHook.publishFailed', 'Грешка при публикуване'));
            }
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