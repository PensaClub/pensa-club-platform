// src/components/AdminAcademyCoursesList/EditCourseBasicInfo/useEditCourseBasicInfo.js

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { useAcademyCourses } from '../../contexts/AcademyCoursesProvider';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const INITIAL_STATE = {
    name: '',
    shortDescription: '',
    description: '',
    category: '',
    difficultyLevel: 'beginner',
    thumbnailUrl: '',
    trailerUrl: '',
    courseType: 'online',
    videoProvider: 'youtube',
    durationWeeks: '',
    estimatedHours: '',
    startDate: '',
    endDate: '',
    maxParticipants: '',
    targetAudience: '',
    isPublic: true,
    requiresApproval: false,
    maxCredits: 0,
    creditsForCompletion: 0,
    hasCertificate: false,
    tags: '',
    mentors: [],
};

const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().split('T')[0];
};

const useEditCourseBasicInfo = () => {
    const { t } = useTranslation('academy-admin');
    const { slug } = useParams();
    const navigate = useLocalizedNavigate();
    const {  getCourseBySlug, updateCourse, addCourseMentor, updateCourseMentor, removeCourseMentor } = useAcademyCourses();

    const [courseData, setCourseData] = useState(INITIAL_STATE);
    const [courseId, setCourseId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
 const [originalMentors, setOriginalMentors] = useState([]);
    // Load course data
    useEffect(() => {
        const loadCourse = async () => {
            try {
                setIsLoading(true);
                const data = await getCourseBySlug(slug);
                const course = data.course || data;

                setCourseId(course.id);
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
                    startDate: formatDateForInput(course.startDate),
                    endDate: formatDateForInput(course.endDate),
                    maxParticipants: course.maxParticipants || '',
                    targetAudience: Array.isArray(course.targetAudience)
                        ? course.targetAudience.join(', ')
                        : course.targetAudience || '',
                    isPublic: course.isPublic ?? true,
                    requiresApproval: course.requiresApproval ?? false,
                    maxCredits: course.maxCredits || 0,
                    creditsForCompletion: course.creditsForCompletion || 0,
                    hasCertificate: course.hasCertificate ?? false,
                    tags: Array.isArray(course.tags)
                            ? course.tags.join(', ')
                            : course.tags || '',
                        mentors: (course.instances || []).map(inst => ({
                            mentorId: inst.mentorId || inst.mentor?.id,
                            role: inst.role || 'mentor',
                            isLead: inst.isLead || false,
                            mentor: inst.mentor || null,
                        })),
                    });
                  
                     const mentors = (course.instances || []).map(inst => ({
                        mentorCourseId: inst.id, 
                        mentorId: inst.mentor?.id || inst.mentorId,
                        role: inst.role || 'mentor',
                        isLead: inst.isLead || false,
                        mentor: inst.mentor || null,
                    }));
                    setCourseData(prev => ({ ...prev, mentors }));
                    setOriginalMentors(mentors);
            } catch (err) {
                console.error('Error loading course:', err);
                // ред ~88
                toast.error(t('editCourse.errors.loadFailed', 'Грешка при зареждане на курса'));
                navigate('/academy/admin/courses');
            } finally {
                setIsLoading(false);
            }
        };

        if (slug) loadCourse();
    }, [slug]);

    const updateField = useCallback((name, value) => {
        setCourseData((prev) => ({ ...prev, [name]: value }));
        setHasChanges(true);
        if (errors[name]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    }, [errors]);

    const validate = () => {
        const newErrors = {};
        if (!courseData.name.trim()) {
            newErrors.name = t('editCourse.errors.nameRequired', 'Името е задължително');
        }
        if (courseData.thumbnailUrl && courseData.thumbnailUrl.trim() && !/^https?:\/\/.+/.test(courseData.thumbnailUrl.trim())) {
            newErrors.thumbnailUrl = t('editCourse.errors.invalidUrl', 'Невалиден URL адрес');
        }
        if (courseData.trailerUrl && courseData.trailerUrl.trim() && !/^https?:\/\/.+/.test(courseData.trailerUrl.trim())) {
            newErrors.trailerUrl = t('editCourse.errors.invalidUrl', 'Невалиден URL адрес');
        }
        if (courseData.startDate && courseData.endDate && new Date(courseData.endDate) < new Date(courseData.startDate)) {
            newErrors.endDate = t('editCourse.errors.endBeforeStart', 'Крайната дата не може да е преди началната');
        }
        return newErrors;
    };

   const handleSave = async () => {
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setIsSaving(true);

            const payload = {
                ...courseData,
                name: courseData.name.trim(),
                shortDescription: (courseData.shortDescription || '').trim(),
                description: (courseData.description || '').trim(),
                category: (courseData.category || '').trim(),
                thumbnailUrl: (courseData.thumbnailUrl || '').trim(),
                trailerUrl: (courseData.trailerUrl || '').trim(),
                durationWeeks: courseData.durationWeeks ? Number(courseData.durationWeeks) : null,
                estimatedHours: courseData.estimatedHours ? Number(courseData.estimatedHours) : null,
                maxParticipants: courseData.maxParticipants ? Number(courseData.maxParticipants) : null,
                maxCredits: Number(courseData.maxCredits) || 0,
                creditsForCompletion: Number(courseData.creditsForCompletion) || 0,
                startDate: courseData.startDate || null,
                endDate: courseData.endDate || null,
                tags: courseData.tags
                    ? courseData.tags.split(',').map((t) => t.trim()).filter(Boolean)
                    : [],
                targetAudience: courseData.targetAudience
                    ? courseData.targetAudience.split(',').map((t) => t.trim()).filter(Boolean)
                    : [],
            };

            // Махни mentors от payload (управляват се отделно)
            delete payload.mentors;
            await updateCourse(courseId, payload);

            // Sync mentors
            const currentMentors = courseData.mentors || [];
            const originalIds = originalMentors.map(m => m.mentorId);
            const currentIds = currentMentors.map(m => m.mentorId);

            // Добави нови
            const toAdd = currentMentors.filter(m => !originalIds.includes(m.mentorId));
            for (const m of toAdd) {
                await addCourseMentor(courseId, { mentorId: m.mentorId, role: m.role, isLead: m.isLead });
            }

            // Премахни изтрити
            const toRemove = originalMentors.filter(m => !currentIds.includes(m.mentorId));
            for (const m of toRemove) {
                await removeCourseMentor(courseId, m.mentorCourseId);
            }

            // Обнови променени (role/isLead)
            const toUpdate = currentMentors.filter(m => {
                const orig = originalMentors.find(o => o.mentorId === m.mentorId);
                return orig && (orig.role !== m.role || orig.isLead !== m.isLead);
            });
            for (const m of toUpdate) {
                const orig = originalMentors.find(o => o.mentorId === m.mentorId);
                await updateCourseMentor(courseId, orig.mentorCourseId, { role: m.role, isLead: m.isLead });
            }

            setHasChanges(false);
            sessionStorage.removeItem(storageKey);
            toast.success(t('editCourse.saveSuccess', 'Курсът е обновен успешно'));
            navigate('/academy/admin/courses');
        } catch (err) {
            console.error('Error saving course:', err);
            const serverErrors = err?.errors;
            if (Array.isArray(serverErrors) && serverErrors.length > 0) {
                const errMap = {};
                serverErrors.forEach(e => {
                    if (e.field) errMap[e.field] = e.message;
                });
                setErrors(errMap);
                toast.error(serverErrors[0].message || t('editCourse.errors.saveFailed', 'Грешка при запазване'));
            } else {
                toast.error(t('editCourse.errors.saveFailed', 'Грешка при запазване'));
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/academy/admin/courses');
    };

    return {
        courseData,
        courseId,
        slug,
        isLoading,
        isSaving,
        errors,
        hasChanges,
        updateField,
        handleSave,
        handleCancel,
    };
};

export default useEditCourseBasicInfo;