// src/components/hooks/useLectureCreateForm.js

import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAcademyCourses } from '../contexts/AcademyCoursesProvider';

// =========================================================
//                    CONSTANTS
// =========================================================

const STORAGE_KEY = 'academy_lecture_draft_id';

const INITIAL_LECTURE_DATA = {
    // Section 1 — Basic Info
    title: '',
    shortDescription: '',
    description: '',
    category: '',
    lectureType: 'lecture',
    tags: '',

    // Section 2 — Date & Location
    scheduledDate: '',
    scheduledEndDate: '',
    durationMinutes: 60,
    timezone: 'Europe/Sofia',
    isOnline: true,
    meetingLink: '',
    meetingPassword: '',
    location: '',
    address: '',

    // Section 3 — Video & Media
    videoProvider: '',
    videoUrl: '',
    thumbnailUrl: '',

    // Section 4 — Mentor
    mentorId: null,

    // Section 5 — Registration
    maxParticipants: '',
    requiresRegistration: true,
    isPublic: true,
    isFree: true,

    // Section 6 — Credits
    maxCredits: 0,
    creditsForAttendance: 0,
    creditsForTest: 0,
    hasTest: false,
    testPassingScore: 70,

    // Section 7 — Course
    courseId: null,
};

// =========================================================
//                    HELPERS
// =========================================================

const formatDateTimeLocal = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// =========================================================
//                    HOOK
// =========================================================

const useLectureCreateForm = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const {
        getLectureBySlug,
        getLectureById,
        createLecture,
        updateLecture,
        publishLecture,
        getAdminCourses
    } = useAcademyCourses();

    // =========================================================
    //                    STATE
    // =========================================================

    const isEditMode = Boolean(slug);
 const savedDraftId = !isEditMode ? sessionStorage.getItem(STORAGE_KEY) : null; 


    const [lectureData, setLectureData] = useState(INITIAL_LECTURE_DATA);
    const [lectureId, setLectureId] = useState(null);
    const [lectureSlug, setLectureSlug] = useState(slug || null);
    const [selectedMentorObj, setSelectedMentorObj] = useState(null);
const [isLoading, setIsLoading] = useState(isEditMode || Boolean(savedDraftId)); 
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [courseSearch, setCourseSearch] = useState('');

    // =========================================================
    //                    MAP SERVER DATA → FORM
    // =========================================================

    const mapLectureToForm = (lec) => ({
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
    });

    // =========================================================
    //                    LOAD DATA
    // =========================================================

     useEffect(() => {
        if (isEditMode && slug) {
            loadLectureBySlug(slug);
        } else if (savedDraftId) { 
            loadLectureByDraftId(savedDraftId); 
        }
    }, [slug]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const params = { limit: 100, sortBy: 'newest' };
                if (courseSearch.trim()) params.search = courseSearch.trim();
                const data = await getAdminCourses(params);
                setAvailableCourses(data.courses || []);
            } catch (err) {
                console.error('Error fetching courses:', err);
            }
        };
        fetchCourses();
    }, [courseSearch]);

   const loadLectureBySlug = async (lectureSlugToLoad) => {
        try {
            setIsLoading(true);
            const data = await getLectureBySlug(lectureSlugToLoad);
            const lec = data.lecture || data;

            if (!lec || !lec.id) {
                sessionStorage.removeItem(STORAGE_KEY);
                return;
            }

            setLectureData(mapLectureToForm(lec));
            setLectureId(lec.id);
            setLectureSlug(lec.slug);

            if (lec.lecturer) {
                setSelectedMentorObj(lec.lecturer);
            }

            toast.info(t('lectureCreateForm.draftLoaded', 'Заредена е запазена чернова'));
        } catch (error) {
            console.error('Error loading lecture:', error);
            sessionStorage.removeItem(STORAGE_KEY);
        } finally {
            setIsLoading(false);
        }
    };

    // НОВО — зарежда draft по ID (за create mode при refresh)
    const loadLectureByDraftId = async (draftId) => {
        try {
            setIsLoading(true);
            const data = await getLectureById(draftId);
            const lec = data.lecture || data;

            if (!lec || !lec.id) {
                sessionStorage.removeItem(STORAGE_KEY);
                return;
            }

            setLectureData(mapLectureToForm(lec));
            setLectureId(lec.id);
            setLectureSlug(lec.slug);

            if (lec.lecturer) {
                setSelectedMentorObj(lec.lecturer);
            }

            toast.info(t('lectureCreateForm.draftLoaded', 'Заредена е запазена чернова'));
        } catch (error) {
            console.error('Error loading draft lecture:', error);
            sessionStorage.removeItem(STORAGE_KEY);
        } finally {
            setIsLoading(false);
        }
    };

    // =========================================================
    //                    FIELD UPDATES
    // =========================================================

    const updateField = useCallback((field, value) => {
        setLectureData((prev) => ({ ...prev, [field]: value }));
        setHasChanges(true);

        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    }, [errors]);

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
        };

        // videoProvider — enum или undefined (празен стринг фейлва Zod enum)
        const vp = (lectureData.videoProvider || '').trim();
        if (vp) payload.videoProvider = vp;

        // testPassingScore — само ако hasTest
        if (lectureData.hasTest) {
            payload.testPassingScore = Number(lectureData.testPassingScore) || 70;
        }

        return payload;
    }, [lectureData]);

    // =========================================================
    //                    VALIDATION
    // =========================================================

    const validate = useCallback(() => {
        const newErrors = {};

        if (!lectureData.title.trim()) {
            newErrors.title = t('lectureCreateForm.errors.titleRequired', 'Заглавието е задължително');
        } else if (lectureData.title.trim().length < 3) {
            newErrors.title = t('lectureCreateForm.errors.titleMinLength', 'Минимум 3 символа');
        }

        if (!lectureData.scheduledDate) {
            newErrors.scheduledDate = t('lectureCreateForm.errors.dateRequired', 'Датата е задължителна');
        }

        if (lectureData.scheduledDate && lectureData.scheduledEndDate) {
            if (new Date(lectureData.scheduledEndDate) <= new Date(lectureData.scheduledDate)) {
                newErrors.scheduledEndDate = t('lectureCreateForm.errors.endBeforeStart', 'Крайната дата трябва да е след началната');
            }
        }

        const urlFields = ['videoUrl', 'thumbnailUrl', 'meetingLink'];
        urlFields.forEach((field) => {
            const val = (lectureData[field] || '').trim();
            if (val && !/^https?:\/\/.+/.test(val)) {
                newErrors[field] = t('lectureCreateForm.errors.invalidUrl', 'Невалиден URL');
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [lectureData, t]);

    // =========================================================
    //                    SERVER ERROR HANDLER
    // =========================================================

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
    //                    SAVE DRAFT
    // =========================================================

    const handleSaveDraft = useCallback(async () => {
        if (!lectureData.title.trim()) {
            setErrors({ title: t('lectureCreateForm.errors.titleRequired', 'Заглавието е задължително') });
            return;
        }
        if (!lectureData.scheduledDate) {
            setErrors({ scheduledDate: t('lectureCreateForm.errors.dateRequired', 'Датата е задължителна') });
            return;
        }

        try {
            setIsSaving(true);
            const payload = preparePayload();

            if (lectureId) {
                // Вече съществува — update
                await updateLecture(lectureId, payload);
                setHasChanges(false);
                toast.success(t('lectureCreateForm.draftSaved', 'Черновата е запазена'));
            } else {
                // Първо създаване — create + запази slug в sessionStorage
                const result = await createLecture(payload);
                const newLec = result?.lecture;
                if (!newLec?.id) throw new Error('Failed to create lecture');

                  setLectureId(newLec.id);
            setLectureSlug(newLec.slug);
            sessionStorage.setItem(STORAGE_KEY, newLec.id);
                setHasChanges(false);
                toast.success(t('lectureCreateForm.draftCreated', 'Лекцията е създадена'));
            }
        } catch (err) {
            console.error('Error saving draft:', err);
            handleServerError(err, 'lectureCreateForm.saveFailed');
        } finally {
            setIsSaving(false);
        }
    }, [lectureId, lectureData, preparePayload, createLecture, updateLecture, t, handleServerError]);

    // =========================================================
    //                    PUBLISH
    // =========================================================

    const handlePublish = useCallback(async () => {
        if (!validate()) {
            toast.error(t('lectureCreateForm.validationFailed', 'Моля попълнете задължителните полета'));
            return;
        }

        try {
            setIsSaving(true);
            const payload = preparePayload();
            let id = lectureId;

            if (!id) {
                const result = await createLecture(payload);
                id = result?.lecture?.id;
                if (!id) throw new Error('Failed to create lecture');
                setLectureId(id);
            } else {
                await updateLecture(id, payload);
            }

            await publishLecture(id);
            setHasChanges(false);
            // Публикувана — изчисти draft от storage
            sessionStorage.removeItem(STORAGE_KEY);
            toast.success(t('lectureCreateForm.published', 'Лекцията е публикувана'));
            navigate('/academy/admin/lectures');
        } catch (err) {
            console.error('Error publishing:', err);
            handleServerError(err, 'lectureCreateForm.publishFailed');
        } finally {
            setIsSaving(false);
        }
    }, [lectureId, validate, preparePayload, createLecture, updateLecture, publishLecture, navigate, t, handleServerError]);

    // =========================================================
    //                    CLEAR DRAFT (за ползване от компонента)
    // =========================================================

    const clearDraft = useCallback(() => {
        sessionStorage.removeItem(STORAGE_KEY);
        setLectureData(INITIAL_LECTURE_DATA);
        setLectureId(null);
        setLectureSlug(null);
        setSelectedMentorObj(null);
        setHasChanges(false);
        setErrors({});
    }, []);

    // =========================================================
    //                    RETURN
    // =========================================================

    return {
        isEditMode,
        lectureData,
        lectureId,
        lectureSlug,
        selectedMentorObj,
        isLoading,
        isSaving,
        errors,
        hasChanges,
        updateField,
        setSelectedMentorObj,
        validate,
        handleSaveDraft,
        handlePublish,
        clearDraft,
        availableCourses,
        courseSearch,
        setCourseSearch,
    };
};

export default useLectureCreateForm;