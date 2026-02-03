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
  courseType: 'recorded',
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

// =========================================================
//                    HOOK
// =========================================================

const useCourseAcademyCreateForm = () => {
  const { courseSlug } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    getCourseBySlug,
    createCourse,
    updateCourse,
    publishCourse,
    unpublishCourse,
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
        courseType: course.courseType || 'recorded',
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
        tags: course.tags || '',
        targetAudience: course.targetAudience || '',
      });

      setCourseId(course.id);
      setModules(course.modules || []);
    } catch (error) {
      console.error('Error loading course:', error);
      toast.error(t('courseFormHook.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  //                    FIELD UPDATES
  // =========================================================

  const updateField = useCallback((field, value) => {
    setCourseData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [errors]);

  const updateMultipleFields = useCallback((fields) => {
    setCourseData(prev => ({ ...prev, ...fields }));
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

      if (courseId) {
        await updateCourse(courseId, courseData);
        toast.success(t('courseFormHook.draftSaved'));
      } else {
        const result = await createCourse(courseData);
        const newCourse = result?.course;

        if (newCourse?.id) {
          setCourseId(newCourse.id);
          toast.success(t('courseFormHook.draftCreated'));
          navigate(`/academy/admin/edit-course/${newCourse.slug}`, { replace: true });
        }
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error(t('courseFormHook.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  }, [courseId, courseData, createCourse, updateCourse, navigate, t]);

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

      let id = courseId;

      if (!id) {
        const result = await createCourse(courseData);
        id = result?.course?.id;
        if (!id) throw new Error('Failed to create course');
        setCourseId(id);
      } else {
        await updateCourse(id, courseData);
      }

      await publishCourse(id);
      toast.success(t('courseFormHook.published'));
      navigate('/academy/courses');
    } catch (error) {
      console.error('Error publishing:', error);
      toast.error(t('courseFormHook.publishFailed'));
    } finally {
      setIsSaving(false);
    }
  }, [courseId, courseData, validateAll, createCourse, updateCourse, publishCourse, navigate, t]);

  // =========================================================
  //                    MODULES MANAGEMENT
  // =========================================================

  const addModule = useCallback((moduleData) => {
    setModules(prev => [...prev, moduleData]);
  }, []);

  const updateModule = useCallback((index, moduleData) => {
    setModules(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...moduleData };
      return updated;
    });
  }, []);

  const removeModule = useCallback((index) => {
    setModules(prev => prev.filter((_, i) => i !== index));
  }, []);

  const reorderModules = useCallback((newOrder) => {
    setModules(newOrder);
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

    // Modules
    addModule,
    updateModule,
    removeModule,
    reorderModules,
    setModules,
  };
};

export default useCourseAcademyCreateForm;