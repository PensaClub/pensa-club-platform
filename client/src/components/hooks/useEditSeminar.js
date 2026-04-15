// src/components/hooks/useEditSeminar.js

import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAcademyCourses } from '../contexts/AcademyCoursesProvider';

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

const useEditSeminar = () => {
    const { slug } = useParams();
    const navigate = useLocalizedNavigate();
    const { t } = useTranslation('academy-admin');

    const {
        getSeminarBySlug,
        updateSeminar,
        deleteSeminar,
        publishSeminar,
        unpublishSeminar,
        cancelSeminar,
        startSeminar,
        stopSeminar,
        completeSeminar,
        getAdminCourses,
        getSeminarSessions,
    } = useAcademyCourses();

    const [seminarData, setSeminarData] = useState(INITIAL_DATA);
    const [seminarId, setSeminarId] = useState(null);
    const [seminarStatus, setSeminarStatus] = useState(null);
    const [isPublished, setIsPublished] = useState(false);
    const [facilitators, setFacilitators] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [courseSearch, setCourseSearch] = useState('');
const [showTestEditor, setShowTestEditor] = useState(false);
    // Load courses
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

    // Load seminar
    const loadSeminar = async (semSlug) => {
        setIsLoading(true);
        try {
            const data = await getSeminarBySlug(semSlug);
            const sem = data?.seminar || data;

            if (!sem || !sem.id) {
                toast.error(t('editSeminar.errors.notFound', 'Семинарът не е намерен'));
                navigate('/academy/admin/seminars');
                return;
            }

            setSeminarId(sem.id);
            setSeminarStatus(sem.status || null);
            setIsPublished(sem.isPublished || false);

            const mapped = {
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
            };

            // Load sessions
            try {
                const sessData = await getSeminarSessions(sem.id);
                if (sessData?.length > 0) {
                    mapped.sessions = sessData.map(s => ({
                        id: s.id,
                        date: s.date,
                        startTime: s.startTime,
                        endTime: s.endTime || '',
                        location: s.location || '',
                        cancelled: s.cancelled || false,
                        cancelReason: s.cancelReason || '',
                    }));
                }
            } catch { /* no sessions */ }

            setSeminarData(mapped);

            // Multi-facilitator load (mentor / admin / external).
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
            toast.error(t('editSeminar.errors.loadFailed', 'Грешка при зареждане'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (slug) loadSeminar(slug);
    }, [slug]);

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
            newErrors.title = t('editSeminar.errors.titleRequired', 'Заглавието е задължително');
        } else if (seminarData.title.trim().length < 3) {
            newErrors.title = t('editSeminar.errors.titleMin', 'Минимум 3 символа');
        }
        if (!seminarData.scheduledDate) {
            newErrors.scheduledDate = t('editSeminar.errors.dateRequired', 'Датата е задължителна');
        }
        if (!seminarData.isOnline && !seminarData.location?.trim() && !seminarData.address?.trim()) {
            newErrors.location = t('editSeminar.errors.locationRequired', 'Мястото е задължително за присъствени семинари');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [seminarData, t]);

    // Save and stay
    const { createSeminarSessions } = useAcademyCourses();

    const saveSessions = useCallback(async () => {
        if (!seminarData.sessions?.length || !seminarId) return;

        // Cancel sessions that were marked as cancelled
        const toCancel = seminarData.sessions.filter(s => s.id && s.cancelled && !s._alreadyCancelled);
        for (const s of toCancel) {
            try {
                const auth = JSON.parse(localStorage.getItem('auth') || '{}');
                await fetch(`${import.meta.env.VITE_API_URL}/academy/seminars/${seminarId}/sessions/${s.id}/cancel`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
                    credentials: 'include',
                    body: JSON.stringify({ reason: s.cancelReason || '' }),
                });
            } catch (err) {
                console.error('Error cancelling session:', err);
            }
        }

        // Save non-cancelled sessions
        const validSessions = seminarData.sessions.filter(s => s.date && s.startTime && !s.cancelled);
        if (validSessions.length > 0) {
            try {
                await createSeminarSessions(seminarId, validSessions);
            } catch (err) {
                console.error('Error saving sessions:', err);
            }
        }
    }, [seminarData.sessions, seminarId, createSeminarSessions]);

    const handleSaveAndStay = useCallback(async () => {
        if (!validate()) return;
        setIsSaving(true);
        try {
            await updateSeminar(seminarId, preparePayload());
            await saveSessions();
            toast.success(t('editSeminar.saved', 'Промените са запазени'));
            setHasChanges(false);
        } catch (err) {
            toast.error(err?.errors?.[0] || t('editSeminar.errors.saveFailed', 'Грешка при запазване'));
        } finally {
            setIsSaving(false);
        }
    }, [seminarId, preparePayload, validate, updateSeminar, saveSessions, t]);

    // Save and back
    const handleSaveAndBack = useCallback(async () => {
        if (!validate()) return;
        setIsSaving(true);
        try {
            await updateSeminar(seminarId, preparePayload());
            await saveSessions();
            toast.success(t('editSeminar.saved', 'Промените са запазени'));
            setHasChanges(false);
            navigate('/academy/admin/seminars');
        } catch (err) {
            toast.error(err?.errors?.[0] || t('editSeminar.errors.saveFailed', 'Грешка при запазване'));
        } finally {
            setIsSaving(false);
        }
    }, [seminarId, preparePayload, validate, updateSeminar, navigate, t]);

    // Publish
    const handlePublish = useCallback(async () => {
        if (!validate()) return;
        setIsSaving(true);
        try {
            await updateSeminar(seminarId, preparePayload());
            await publishSeminar(seminarId);
            setIsPublished(true);
            setHasChanges(false);
            toast.success(t('editSeminar.published', 'Семинарът е публикуван'));
        } catch (err) {
            toast.error(err?.errors?.[0] || t('editSeminar.errors.publishFailed', 'Грешка при публикуване'));
        } finally {
            setIsSaving(false);
        }
    }, [seminarId, preparePayload, validate, updateSeminar, publishSeminar, t]);

    // Unpublish
    const handleUnpublish = useCallback(async () => {
        setIsSaving(true);
        try {
            await unpublishSeminar(seminarId);
            setIsPublished(false);
            toast.success(t('editSeminar.unpublished', 'Семинарът е скрит'));
        } catch (err) {
            toast.error(err?.errors?.[0] || t('editSeminar.errors.unpublishFailed', 'Грешка'));
        } finally {
            setIsSaving(false);
        }
    }, [seminarId, unpublishSeminar, t]);

    // Delete
    const handleDelete = useCallback(async () => {
        setIsSaving(true);
        try {
            await deleteSeminar(seminarId);
            toast.success(t('editSeminar.deleted', 'Семинарът е изтрит'));
            navigate('/academy/admin/seminars');
        } catch (err) {
            toast.error(err?.errors?.[0] || t('editSeminar.errors.deleteFailed', 'Грешка при изтриване'));
        } finally {
            setIsSaving(false);
        }
    }, [seminarId, deleteSeminar, navigate, t]);

    // Cancel
    const handleCancel = useCallback(async (reason) => {
        setIsSaving(true);
        try {
            await cancelSeminar(seminarId, reason);
            setSeminarStatus('cancelled');
            toast.success(t('editSeminar.cancelled', 'Семинарът е отменен'));
        } catch (err) {
            toast.error(err?.errors?.[0] || t('editSeminar.errors.cancelFailed', 'Грешка при отмяна'));
        } finally {
            setIsSaving(false);
        }
    }, [seminarId, cancelSeminar, t]);

    // Start Live
    const handleStartLive = useCallback(async () => {
        setIsSaving(true);
        try {
            await startSeminar(seminarId);
            setSeminarStatus('live');
        } catch (err) {
            console.error('Error starting live:', err);
        } finally {
            setIsSaving(false);
        }
    }, [seminarId, startSeminar]);

    const handleStopLive = useCallback(async () => {
        setIsSaving(true);
        try {
            // Use unpublish+republish pattern: set status back to scheduled
            await stopSeminar(seminarId);
            setSeminarStatus('scheduled');
        } catch (err) {
            console.error('Error stopping live:', err);
        } finally {
            setIsSaving(false);
        }
    }, [seminarId, stopSeminar]);

    // Discard changes
    const handleDiscardChanges = useCallback(() => {
        if (slug) loadSeminar(slug);
        setHasChanges(false);
    }, [slug]);

    return {
        seminarData,
        seminarId,
        seminarStatus,
        isPublished,
        facilitators,
        setFacilitators: updateFacilitators,
        slug,
        isLoading,
        isSaving,
        errors,
        hasChanges,
        updateField,
        handleSaveAndStay,
        handleSaveAndBack,
        handlePublish,
        handleUnpublish,
        handleDelete,
        handleCancel,
        handleStartLive,
        handleStopLive,
        handleDiscardChanges,
        availableCourses,
        courseSearch,
        setCourseSearch,
        showTestEditor,
        setShowTestEditor,
    };
};

export default useEditSeminar;