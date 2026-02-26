// src/components/hooks/useEditLecture.js

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAcademyCourses } from '../contexts/AcademyCoursesProvider';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

// =========================================================
//                    CONSTANTS
// =========================================================

const INITIAL_STATE = {
    title: '',
    shortDescription: '',
    description: '',
    category: '',
    lectureType: 'lecture',
    tags: '',
    scheduledDate: '',
    scheduledEndDate: '',
    durationMinutes: 60,
    timezone: 'Europe/Sofia',
    isOnline: true,
    meetingLink: '',
    meetingPassword: '',
    location: '',
    address: '',
    videoProvider: '',
    videoUrl: '',
    thumbnailUrl: '',
    mentorId: null,
    maxParticipants: '',
    requiresRegistration: true,
    isPublic: true,
    isFree: true,
    maxCredits: 0,
    creditsForAttendance: 0,
    creditsForTest: 0,
    hasTest: false,
    testPassingScore: 70,
    courseId: null,
    moduleId: null,
};

// =========================================================
//                    HELPERS
// =========================================================

const formatDateTimeLocal = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// =========================================================
//                    HOOK
// =========================================================

const useEditLecture = () => {
    const { t } = useTranslation();
    const { slug } = useParams();
    const navigate = useNavigate();
    const {
        getLectureBySlug,
        updateLecture,
        publishLecture,
        unpublishLecture,
        deleteLecture,
        getAdminCourses,
         getCourseModules,
    } = useAcademyCourses();

    // =========================================================
    //                    STATE
    // =========================================================

    const [lectureData, setLectureData] = useState(INITIAL_STATE);
    const [lectureId, setLectureId] = useState(null);
    const [lectureStatus, setLectureStatus] = useState(null);
    const [isPublished, setIsPublished] = useState(false);
    const [selectedMentorObj, setSelectedMentorObj] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [courseSearch, setCourseSearch] = useState('');
    const [availableModules, setAvailableModules] = useState([]);
    const [showTestEditor, setShowTestEditor] = useState(false);

    const originalDataRef = useRef(null);
    // =========================================================
    //                    LOAD LECTURE DATA
    // =========================================================

    useEffect(() => {
        if (slug) loadLecture();
    }, [slug]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const params = { limit: 100, sortBy: 'newest' };
                if (courseSearch.trim()) params.search = courseSearch.trim();
                const data = await getAdminCourses(params);
                setAvailableCourses(data?.courses || []);
            } catch (err) {
                console.error('Error fetching courses:', err);
            }
        };
        fetchCourses();
    }, [courseSearch]);

    // Fetch модули при избран курс
    useEffect(() => {
        const fetchModules = async () => {
            if (!lectureData.courseId) {
                setAvailableModules([]);
                return;
            }
            try {
                const mods = await getCourseModules(lectureData.courseId);
                setAvailableModules(mods || []);
            } catch (err) {
                console.error('Error fetching modules:', err);
                setAvailableModules([]);
            }
        };
        fetchModules();
    }, [lectureData.courseId]);

   const loadLecture = async () => {
        try {
            setIsLoading(true);
            const data = await getLectureBySlug(slug);
            const lec = data?.lecture || data;

            if (!lec || !lec.id) {
                toast.error(t('editLecture.errors.notFound', 'Лекцията не е намерена'));
                navigate('/academy/admin/lectures');
                return;
            }

            setLectureId(lec.id);
            setLectureStatus(lec.status || null);
            setIsPublished(lec.isPublished || false);

            const mapped = { // ПРОМЕНЕНО — извлечено в променлива
                title: lec.title || '',
                shortDescription: lec.shortDescription || '',
                description: lec.description || '',
                category: lec.category || '',
                lectureType: lec.lectureType || 'lecture',
                tags: lec.tags ? (Array.isArray(lec.tags) ? lec.tags.join(', ') : lec.tags) : '',
                scheduledDate: formatDateTimeLocal(lec.scheduledDate),
                scheduledEndDate: formatDateTimeLocal(lec.scheduledEndDate),
                durationMinutes: lec.durationMinutes || 60,
                timezone: lec.timezone || 'Europe/Sofia',
                isOnline: lec.isOnline !== undefined ? lec.isOnline : true,
                meetingLink: lec.meetingLink || '',
                meetingPassword: lec.meetingPassword || '',
                location: lec.location || '',
                address: lec.address || '',
                videoProvider: lec.videoProvider || '',
                videoUrl: lec.videoUrl || '',
                thumbnailUrl: lec.thumbnailUrl || '',
                mentorId: lec.mentorId || null,
                maxParticipants: lec.maxParticipants || '',
                requiresRegistration: lec.requiresRegistration !== undefined ? lec.requiresRegistration : true,
                isPublic: lec.isPublic !== undefined ? lec.isPublic : true,
                isFree: lec.isFree !== undefined ? lec.isFree : true,
                maxCredits: lec.maxCredits || 0,
                creditsForAttendance: lec.creditsForAttendance || 0,
                creditsForTest: lec.creditsForTest || 0,
                hasTest: lec.hasTest || false,
                testPassingScore: lec.testPassingScore || 70,
                courseId: lec.courseId || null,
                moduleId: lec.moduleId || null, // НОВО
            };

            setLectureData(mapped); // ПРОМЕНЕНО
            originalDataRef.current = mapped; // НОВО

            if (lec.lecturer) {
                setSelectedMentorObj(lec.lecturer);
            } else if (lec.mentor) {
                setSelectedMentorObj(lec.mentor);
            }
        } catch (err) {
            console.error('Error loading lecture:', err);
            toast.error(t('editLecture.errors.loadFailed', 'Грешка при зареждане на лекцията'));
            navigate('/academy/admin/lectures');
        } finally {
            setIsLoading(false);
        }
    };

    // =========================================================
    //                    FIELD UPDATES
    // =========================================================

    const updateField = useCallback((name, value) => {
        setLectureData((prev) => ({ ...prev, [name]: value }));
        setHasChanges(true);
        if (errors[name]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    }, [errors]);

    // =========================================================
    //                    VALIDATION
    // =========================================================

    const validate = useCallback(() => {
        const newErrors = {};

        if (!lectureData.title.trim()) {
            newErrors.title = t('editLecture.errors.titleRequired', 'Заглавието е задължително');
        } else if (lectureData.title.trim().length < 3) {
            newErrors.title = t('editLecture.errors.titleMinLength', 'Минимум 3 символа');
        }

        if (!lectureData.scheduledDate) {
            newErrors.scheduledDate = t('editLecture.errors.dateRequired', 'Датата е задължителна');
        }

        if (lectureData.scheduledDate && lectureData.scheduledEndDate) {
            if (new Date(lectureData.scheduledEndDate) <= new Date(lectureData.scheduledDate)) {
                newErrors.scheduledEndDate = t('editLecture.errors.endBeforeStart', 'Крайната дата трябва да е след началната');
            }
        }

        const urlFields = ['videoUrl', 'thumbnailUrl', 'meetingLink'];
        urlFields.forEach((field) => {
            const val = (lectureData[field] || '').trim();
            if (val && !/^https?:\/\/.+/.test(val)) {
                newErrors[field] = t('editLecture.errors.invalidUrl', 'Невалиден URL');
            }
        });

        return newErrors;
    }, [lectureData, t]);

    // =========================================================
    //                    PREPARE PAYLOAD
    // =========================================================

    const preparePayload = useCallback(() => {
        const payload = {
            title: lectureData.title.trim(),
            shortDescription: (lectureData.shortDescription || '').trim(),
            description: (lectureData.description || '').trim(),
            category: (lectureData.category || '').trim(),
            lectureType: lectureData.lectureType,
            tags: lectureData.tags
                ? String(lectureData.tags).split(',').map((t) => t.trim()).filter(Boolean)
                : [],
            scheduledDate: lectureData.scheduledDate || null,
            scheduledEndDate: lectureData.scheduledEndDate || null,
            durationMinutes: lectureData.durationMinutes ? Number(lectureData.durationMinutes) : 60,
            timezone: lectureData.timezone || 'Europe/Sofia',
            isOnline: lectureData.isOnline,
            meetingLink: lectureData.isOnline ? (lectureData.meetingLink || '').trim() : '',
            meetingPassword: lectureData.isOnline ? (lectureData.meetingPassword || '').trim() : '',
            location: !lectureData.isOnline ? (lectureData.location || '').trim() : '',
            address: !lectureData.isOnline ? (lectureData.address || '').trim() : '',
            videoUrl: (lectureData.videoUrl || '').trim() || '',
            thumbnailUrl: (lectureData.thumbnailUrl || '').trim() || '',
            mentorId: lectureData.mentorId || null,
            maxParticipants: lectureData.maxParticipants ? Number(lectureData.maxParticipants) : null,
            requiresRegistration: lectureData.requiresRegistration,
            isPublic: lectureData.isPublic,
            isFree: lectureData.isFree,
            maxCredits: Number(lectureData.maxCredits) || 0,
            creditsForAttendance: Number(lectureData.creditsForAttendance) || 0,
            creditsForTest: lectureData.hasTest ? Number(lectureData.creditsForTest) || 0 : 0,
            hasTest: lectureData.hasTest,
            courseId: lectureData.courseId || null,
            moduleId: lectureData.courseId ? (lectureData.moduleId || null) : null,
        };

        const vp = (lectureData.videoProvider || '').trim();
        if (vp) payload.videoProvider = vp;

        if (lectureData.hasTest) {
            payload.testPassingScore = Number(lectureData.testPassingScore) || 70;
        }

        return payload;
    }, [lectureData]);

    // =========================================================
    //                    SAVE
    // =========================================================

    // =========================================================
    //                    SAVE & STAY
    // =========================================================

    // НОВО
    const handleSaveAndStay = async () => {
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setIsSaving(true);
            const payload = preparePayload();
            await updateLecture(lectureId, payload);

            setHasChanges(false);
            originalDataRef.current = { ...lectureData };
            toast.success(t('editLecture.saveSuccess', 'Лекцията е обновена успешно'));
        } catch (err) {
            console.error('Error saving lecture:', err);
            handleServerError(err, 'editLecture.errors.saveFailed');
        } finally {
            setIsSaving(false);
        }
    };

    // =========================================================
    //                    SAVE & BACK
    // =========================================================

    // НОВО
    const handleSaveAndBack = async () => {
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setIsSaving(true);
            const payload = preparePayload();
            await updateLecture(lectureId, payload);

            setHasChanges(false);
            toast.success(t('editLecture.saveSuccess', 'Лекцията е обновена успешно'));
            navigate('/academy/admin/lectures');
        } catch (err) {
            console.error('Error saving lecture:', err);
            handleServerError(err, 'editLecture.errors.saveFailed');
        } finally {
            setIsSaving(false);
        }
    };

    // =========================================================
    //                    SERVER ERROR HANDLER
    // =========================================================

    // НОВО
    const handleServerError = useCallback((err, fallbackKey) => {
        const serverErrors = err?.errors;
        if (Array.isArray(serverErrors) && serverErrors.length > 0) {
            const errMap = {};
            serverErrors.forEach((e) => {
                if (e.field) errMap[e.field] = e.message;
            });
            setErrors(errMap);
            toast.error(serverErrors[0].message || t(fallbackKey, 'Грешка'));
        } else {
            toast.error(t(fallbackKey, 'Грешка'));
        }
    }, [t]);

    // =========================================================
    //                    PUBLISH / UNPUBLISH
    // =========================================================

    const handlePublish = async () => {
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error(t('editLecture.validationFailed', 'Моля попълнете задължителните полета'));
            return;
        }

        try {
            setIsSaving(true);
            const payload = preparePayload();
            await updateLecture(lectureId, payload);
            await publishLecture(lectureId);

            setHasChanges(false);
            setIsPublished(true);
            toast.success(t('editLecture.published', 'Лекцията е публикувана'));
            navigate('/academy/admin/lectures');
        } catch (err) {
            console.error('Error publishing:', err);
            handleServerError(err, 'editLecture.errors.publishFailed'); // ПРОМЕНЕНО
        } finally {
            setIsSaving(false);
        }
    };

    const handleUnpublish = async () => {
        try {
            setIsSaving(true);
            await unpublishLecture(lectureId);
            setIsPublished(false);
            toast.success(t('editLecture.unpublished', 'Лекцията е скрита'));
        } catch (err) {
            console.error('Error unpublishing:', err);
            toast.error(t('editLecture.errors.unpublishFailed', 'Грешка при скриване'));
        } finally {
            setIsSaving(false);
        }
    };

    // =========================================================
    //                    DELETE
    // =========================================================

    const handleDelete = async () => {
        try {
            setIsSaving(true);
            await deleteLecture(lectureId);
            toast.success(t('editLecture.deleted', 'Лекцията е изтрита'));
            navigate('/academy/admin/lectures');
        } catch (err) {
            console.error('Error deleting:', err);
            toast.error(t('editLecture.errors.deleteFailed', 'Грешка при изтриване'));
        } finally {
            setIsSaving(false);
        }
    };

    // =========================================================
    //                    CANCEL
    // =========================================================

    const handleCancel = () => {
        navigate('/academy/admin/lectures');
    };
    const handleDiscardChanges = useCallback(() => {
        if (originalDataRef.current) {
            setLectureData(originalDataRef.current);
            setHasChanges(false);
            setErrors({});
        }
    }, []);
    // =========================================================
    //                    RETURN
    // =========================================================

    return {
            lectureData,
        lectureId,
        lectureStatus,
        isPublished,
        selectedMentorObj,
        slug,
        isLoading,
        isSaving,
        errors,
        hasChanges,
        updateField,
        setSelectedMentorObj,
        handleSaveAndStay, // НОВО (замества handleSave)
        handleSaveAndBack, // НОВО
        handlePublish,
        handleUnpublish,
        handleDelete,
        handleCancel,
        handleDiscardChanges, // НОВО
        availableCourses,
        courseSearch,
        setCourseSearch,
        availableModules, // НОВО
        showTestEditor, // НОВО
        setShowTestEditor, // НОВО
        reloadLecture: loadLecture, // НОВО
    };
};

export default useEditLecture;