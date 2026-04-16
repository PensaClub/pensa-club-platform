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

const useSeminarCreateForm = ({ materialsRef } = {}) => {
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
    const [facilitators, setFacilitators] = useState([]);
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

            if (sem.facilitators?.length > 0) {
                const loaded = sem.facilitators.map(f => ({
                    type: f.type,
                    mentorId: f.type === 'mentor' ? f.sourceId : null,
                    adminUserId: f.type === 'admin' ? f.sourceId : null,
                    externalLecturerId: f.type === 'external' ? f.sourceId : null,
                    role: f.role || 'mentor',
                    isLead: !!f.isLead,
                    sortOrder: f.sortOrder || 0,
                    name: f.name,
                    email: f.email || null,
                    phone: f.phone || null,
                    photoUrl: f.photoUrl || null,
                    specialization: f.specialization || null,
                    organization: f.organization || null,
                }));
                setFacilitators(loaded);
            } else if (sem.facilitator) {
                setFacilitators([{
                    type: 'mentor',
                    mentorId: sem.facilitator.id || sem.mentorId,
                    adminUserId: null,
                    externalLecturerId: null,
                    role: 'mentor',
                    isLead: true,
                    sortOrder: 0,
                    name: sem.facilitator.name,
                    email: sem.facilitator.email || null,
                    phone: null,
                    photoUrl: sem.facilitator.photoUrl || null,
                    specialization: sem.facilitator.specialization || null,
                    organization: null,
                }]);
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

    // Wrapped setter so any change to facilitators flips hasChanges → enables Save.
    const updateFacilitators = useCallback((next) => {
        setFacilitators(next);
        setHasChanges(true);
    }, []);

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
            scheduledDate: seminarData.scheduledDate ? new Date(seminarData.scheduledDate).toISOString() : null,
            scheduledEndDate: seminarData.scheduledEndDate ? new Date(seminarData.scheduledEndDate).toISOString() : null,
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

        payload.facilitators = facilitators.map((f, idx) => ({
            type: f.type,
            mentorId: f.type === 'mentor' ? f.mentorId : null,
            adminUserId: f.type === 'admin' ? f.adminUserId : null,
            externalLecturerId: f.type === 'external' ? f.externalLecturerId : null,
            role: f.role || 'mentor',
            isLead: !!f.isLead,
            sortOrder: idx,
        }));

        // Backwards compat: keep top-level mentorId set to the lead mentor (if any).
        const leadMentor = facilitators.find(f => f.isLead && f.type === 'mentor')
            || facilitators.find(f => f.type === 'mentor');
        payload.mentorId = leadMentor?.mentorId || null;

        return payload;
    }, [seminarData, facilitators]);

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
            let slugForFlush = seminarSlug;
            if (id) {
                await updateSeminar(id, payload);
            } else {
                const response = await createSeminar(payload);
                id = response?.seminar?.id || response?.id;
                const newSlug = response?.seminar?.slug || response?.slug;
                if (id) {
                    setSeminarId(id);
                    setSeminarSlug(newSlug || null);
                    slugForFlush = newSlug || null;
                    sessionStorage.removeItem(STORAGE_KEY);
                }
            }

            // Flush any pending materials (files queued before the seminar had
            // a slug). Must run BEFORE navigate so the files aren't lost.
            if (slugForFlush && materialsRef?.current?.flushPending) {
                try {
                    await materialsRef.current.flushPending(slugForFlush);
                } catch (err) {
                    console.error('Error flushing pending materials:', err);
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
    }, [seminarId, seminarSlug, preparePayload, validate, createSeminar, updateSeminar, publishSeminar, navigate, t, materialsRef]);

    return {
        isEditMode,
        seminarId,
        seminarSlug,
        seminarData,
        facilitators,
        setFacilitators: updateFacilitators,
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