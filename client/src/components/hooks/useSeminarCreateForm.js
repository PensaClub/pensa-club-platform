// src/components/hooks/useSeminarCreateForm.js

import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAcademyCourses } from '../contexts/AcademyCoursesProvider';

const STORAGE_KEY = 'academy_seminar_draft_id';

const INITIAL_DATA = {
    title: '',
    shortDescription: '',
    description: '',
    category: '',
    seminarType: 'workshop',
    tags: '',
    learningPoints: [],

    scheduledDate: '',
    scheduledEndDate: '',
    durationMinutes: 90,
    timezone: 'Europe/Sofia',
    isOnline: false,
    location: '',
    address: '',
    meetingLink: '',
    meetingPassword: '',

    thumbnailUrl: '',

    mentorId: null,

    maxParticipants: '',
    minParticipants: '',
    requiresRegistration: true,
    requiresApproval: false,
    isPublic: true,

    maxCredits: 0,
    creditsForAttendance: 0,
    creditsForParticipation: 0,
    creditsForTest: 0,
    hasTest: false,
    testPassingScore: 70,

    hasAssignment: false,
    assignmentDescription: '',
    prerequisites: '',
    whatToBring: '',

    courseId: null,
};

const formatDateTimeLocal = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const useSeminarCreateForm = () => {
    const { slug } = useParams();
    const navigate = useLocalizedNavigate();
    const { t } = useTranslation('academy-admin');

    const {
        getSeminarBySlug,
        createSeminar,
        updateSeminar,
        publishSeminar,
        getAdminCourses,
    } = useAcademyCourses();

    const isEditMode = Boolean(slug);
    const savedDraftId = !isEditMode ? sessionStorage.getItem(STORAGE_KEY) : null;

    const [seminarData, setSeminarData] = useState(INITIAL_DATA);
    const [seminarId, setSeminarId] = useState(savedDraftId ? parseInt(savedDraftId) : null);
    const [seminarSlug, setSeminarSlug] = useState(null);
    const [assignedMentors, setAssignedMentors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [courseSearch, setCourseSearch] = useState('');

    // Load courses for linking
    useEffect(() => {
        const loadCourses = async () => {
            try {
                const data = await getAdminCourses({ limit: 100 });
                setAvailableCourses(data?.courses || []);
            } catch (err) {
                console.error('Error loading courses:', err);
            }
        };
        loadCourses();
    }, []);

    const mapSeminarToForm = (sem) => ({
        title: sem.title || '',
        shortDescription: sem.shortDescription || '',
        description: sem.description || '',
        category: sem.category || '',
        seminarType: sem.seminarType || 'workshop',
        tags: sem.tags ? (Array.isArray(sem.tags) ? sem.tags.join(', ') : sem.tags) : '',
        learningPoints: Array.isArray(sem.learningPoints) ? sem.learningPoints : [],
        scheduledDate: formatDateTimeLocal(sem.scheduledDate),
        scheduledEndDate: formatDateTimeLocal(sem.scheduledEndDate),
        durationMinutes: sem.durationMinutes || 90,
        timezone: sem.timezone || 'Europe/Sofia',
        isOnline: sem.isOnline !== undefined ? sem.isOnline : false,
        location: sem.location || '',
        address: sem.address || '',
        meetingLink: sem.meetingLink || '',
        meetingPassword: sem.meetingPassword || '',
        thumbnailUrl: sem.thumbnailUrl || '',
        maxParticipants: sem.maxParticipants || '',
        minParticipants: sem.minParticipants || '',
        requiresRegistration: sem.requiresRegistration !== undefined ? sem.requiresRegistration : true,
        requiresApproval: sem.requiresApproval !== undefined ? sem.requiresApproval : false,
        isPublic: sem.isPublic !== undefined ? sem.isPublic : true,
        maxCredits: sem.maxCredits || 0,
        creditsForAttendance: sem.creditsForAttendance || 0,
        creditsForParticipation: sem.creditsForParticipation || 0,
        creditsForTest: sem.creditsForTest || 0,
        hasTest: sem.hasTest || false,
        testPassingScore: sem.testPassingScore || 70,
        hasAssignment: sem.hasAssignment || false,
        assignmentDescription: sem.assignmentDescription || '',
        prerequisites: sem.prerequisites || '',
        whatToBring: sem.whatToBring || '',
        courseId: sem.courseId || null,
    });

    // Load seminar in edit mode
    const loadSeminarBySlug = async (semSlug) => {
        setIsLoading(true);
        try {
            const data = await getSeminarBySlug(semSlug);
            const sem = data?.seminar || data;

            if (!sem || !sem.id) {
                toast.error(t('seminarCreateForm.errors.notFound', 'Семинарът не е намерен'));
                navigate('/academy/admin/seminars');
                return;
            }

            setSeminarId(sem.id);
            setSeminarSlug(sem.slug);
            setSeminarData(mapSeminarToForm(sem));

            if (sem.mentorAssignments?.length > 0 || sem.facilitator) {
                const mentors = sem.mentorAssignments?.map(ma => ({
                    mentorId: ma.mentor?.id || ma.mentorId,
                    role: ma.role || 'mentor',
                    isLead: ma.isLead || false,
                    mentor: ma.mentor,
                })) || [];
                if (mentors.length === 0 && sem.facilitator) {
                    mentors.push({
                        mentorId: sem.facilitator.id || sem.mentorId,
                        role: 'mentor',
                        isLead: true,
                        mentor: sem.facilitator,
                    });
                }
                setAssignedMentors(mentors);
            }
        } catch (err) {
            console.error('Error loading seminar:', err);
            toast.error(t('seminarCreateForm.errors.loadFailed', 'Грешка при зареждане'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isEditMode && slug) {
            loadSeminarBySlug(slug);
        }
    }, [isEditMode, slug]);

    // Update field
    const updateField = useCallback((name, value) => {
        setSeminarData(prev => ({ ...prev, [name]: value }));
        setHasChanges(true);
        if (errors[name]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    }, [errors]);

    // Prepare payload
    const preparePayload = useCallback(() => {
        const payload = {
            title: seminarData.title.trim(),
            shortDescription: (seminarData.shortDescription || '').trim(),
            description: (seminarData.description || '').trim(),
            category: (seminarData.category || '').trim(),
            seminarType: seminarData.seminarType,
            tags: seminarData.tags
                ? String(seminarData.tags).split(',').map(t => t.trim()).filter(Boolean)
                : [],
            learningPoints: (seminarData.learningPoints || []).filter(p => p.trim()),
            scheduledDate: seminarData.scheduledDate || null,
            scheduledEndDate: seminarData.scheduledEndDate || null,
            durationMinutes: seminarData.durationMinutes ? Number(seminarData.durationMinutes) : 90,
            timezone: seminarData.timezone || 'Europe/Sofia',
            isOnline: seminarData.isOnline,
            location: !seminarData.isOnline ? (seminarData.location || '').trim() : '',
            address: !seminarData.isOnline ? (seminarData.address || '').trim() : '',
            meetingLink: seminarData.isOnline ? (seminarData.meetingLink || '').trim() : '',
            meetingPassword: seminarData.isOnline ? (seminarData.meetingPassword || '').trim() : '',
            thumbnailUrl: (seminarData.thumbnailUrl || '').trim() || '',
            maxParticipants: seminarData.maxParticipants ? Number(seminarData.maxParticipants) : null,
            minParticipants: seminarData.minParticipants ? Number(seminarData.minParticipants) : null,
            requiresRegistration: seminarData.requiresRegistration,
            requiresApproval: seminarData.requiresApproval,
            isPublic: seminarData.isPublic,
            maxCredits: Number(seminarData.maxCredits) || 0,
            creditsForAttendance: Number(seminarData.creditsForAttendance) || 0,
            creditsForParticipation: Number(seminarData.creditsForParticipation) || 0,
            creditsForTest: seminarData.hasTest ? Number(seminarData.creditsForTest) || 0 : 0,
            hasTest: seminarData.hasTest,
            hasAssignment: seminarData.hasAssignment,
            assignmentDescription: seminarData.hasAssignment ? (seminarData.assignmentDescription || '').trim() : '',
            prerequisites: (seminarData.prerequisites || '').trim(),
            whatToBring: (seminarData.whatToBring || '').trim(),
            courseId: seminarData.courseId || null,
        };

        if (seminarData.hasTest) {
            payload.testPassingScore = Number(seminarData.testPassingScore) || 70;
        }

        if (assignedMentors.length > 0) {
            payload.mentorId = assignedMentors[0]?.mentorId || null;
        }

        return payload;
    }, [seminarData, assignedMentors]);

    // Validate
    const validate = useCallback(() => {
        const newErrors = {};

        if (!seminarData.title.trim()) {
            newErrors.title = t('seminarCreateForm.errors.titleRequired', 'Заглавието е задължително');
        } else if (seminarData.title.trim().length < 3) {
            newErrors.title = t('seminarCreateForm.errors.titleMin', 'Минимум 3 символа');
        }

        if (!seminarData.scheduledDate) {
            newErrors.scheduledDate = t('seminarCreateForm.errors.dateRequired', 'Датата е задължителна');
        }

        if (!seminarData.isOnline && !seminarData.location?.trim() && !seminarData.address?.trim()) {
            newErrors.location = t('seminarCreateForm.errors.locationRequired', 'Мястото е задължително за присъствени семинари');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [seminarData, t]);

    // Save draft
    const handleSaveDraft = useCallback(async () => {
        if (!validate()) return;
        setIsSaving(true);
        try {
            const payload = preparePayload();

            if (seminarId) {
                await updateSeminar(seminarId, payload);
                toast.success(t('seminarCreateForm.saved', 'Семинарът е запазен'));
            } else {
                const response = await createSeminar(payload);
                const newId = response?.seminar?.id || response?.id;
                const newSlug = response?.seminar?.slug || response?.slug;
                if (newId) {
                    setSeminarId(newId);
                    setSeminarSlug(newSlug || null);
                    sessionStorage.setItem(STORAGE_KEY, String(newId));
                }
                toast.success(t('seminarCreateForm.created', 'Семинарът е създаден'));
            }
            setHasChanges(false);
        } catch (err) {
            console.error('Error saving seminar:', err);
            toast.error(err?.errors?.[0] || t('seminarCreateForm.errors.saveFailed', 'Грешка при запазване'));
        } finally {
            setIsSaving(false);
        }
    }, [seminarId, preparePayload, validate, createSeminar, updateSeminar, t]);

    // Publish
    const handlePublish = useCallback(async () => {
        if (!validate()) return;
        setIsSaving(true);
        try {
            const payload = preparePayload();

            let id = seminarId;
            if (id) {
                await updateSeminar(id, payload);
            } else {
                const response = await createSeminar(payload);
                id = response?.seminar?.id || response?.id;
                if (id) {
                    setSeminarId(id);
                    sessionStorage.removeItem(STORAGE_KEY);
                }
            }

            if (id) {
                await publishSeminar(id);
            }

            toast.success(t('seminarCreateForm.published', 'Семинарът е публикуван'));
            setHasChanges(false);
            navigate('/academy/admin/seminars');
        } catch (err) {
            console.error('Error publishing seminar:', err);
            toast.error(err?.errors?.[0] || t('seminarCreateForm.errors.publishFailed', 'Грешка при публикуване'));
        } finally {
            setIsSaving(false);
        }
    }, [seminarId, preparePayload, validate, createSeminar, updateSeminar, publishSeminar, navigate, t]);

    return {
        isEditMode,
        seminarId,
        seminarSlug,
        seminarData,
        assignedMentors,
        setAssignedMentors,
        isLoading,
        isSaving,
        errors,
        hasChanges,
        updateField,
        handleSaveDraft,
        handlePublish,
        availableCourses,
        courseSearch,
        setCourseSearch,
    };
};

export default useSeminarCreateForm;