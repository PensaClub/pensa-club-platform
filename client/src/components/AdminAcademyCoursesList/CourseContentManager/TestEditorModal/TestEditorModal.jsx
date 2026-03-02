// src/components/AdminAcademyCoursesList/CourseContentManager/TestEditorModal/TestEditorModal.jsx
// Prefix: tem-

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    X, Save, Loader2, Settings, List, Eye, Plus, Trash2,
    ChevronUp, ChevronDown, GripVertical, CheckCircle2,
    Circle, Square, CheckSquare, ToggleLeft, Type,
    AlertCircle, Clock, Award, Shuffle, Hash, HelpCircle,
    FileText, Edit3,
} from 'lucide-react';
import { useAcademyCourses } from '../../../contexts/AcademyCoursesProvider';
import { toast } from 'react-toastify';
import './testEditorModal.css';

const QUESTION_TYPES = [
    { value: 'single_choice', icon: Circle, color: '#00d4ff' },
    { value: 'multiple_choice', icon: CheckSquare, color: '#a78bfa' },
    { value: 'true_false', icon: ToggleLeft, color: '#34d399' },
];

const DEFAULT_SETTINGS = {
    title: '',
    description: '',
    passingScore: 70,
    maxAttempts: null,
    timeLimitMinutes: null,
    shuffleQuestions: false,
    shuffleAnswers: false,
    showCorrectAnswers: true,
    maxCredits: 0,
    requireCourseCompletion: true,
};

const EMPTY_QUESTION = {
    questionText: '',
    questionType: 'single_choice',
    points: 1,
    explanation: '',
    answers: [
        { answerText: '', isCorrect: true },
        { answerText: '', isCorrect: false },
    ],
};

const TestEditorModal = ({ isOpen, onClose, lessonId, courseId, lectureId, entityTitle }) => {
    const { t } = useTranslation('academy-admin');
    const {
        getTests, getTestById, createTest, updateTest,
        publishTest, unpublishTest,
        addQuestion, updateQuestion, deleteQuestion, reorderQuestions,
    } = useAcademyCourses();

    // Core state
    const [activeTab, setActiveTab] = useState('settings');
    const [test, setTest] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    // Settings form
    const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
    const [settingsDirty, setSettingsDirty] = useState(false);

    // Question editing
    const [expandedQuestion, setExpandedQuestion] = useState(null);
    const [addingQuestion, setAddingQuestion] = useState(false);
    const [questionForm, setQuestionForm] = useState({ ...EMPTY_QUESTION });
    const [editingQuestionId, setEditingQuestionId] = useState(null);

    // Delete confirmation
    const [deleteTarget, setDeleteTarget] = useState(null);

    // =========================================================
    //                    LOAD TEST
    // =========================================================

    useEffect(() => {
        if (isOpen && (lessonId || courseId || lectureId)) { 
            loadTest();
        }
        if (!isOpen) {
          
            setActiveTab('settings');
            setTest(null);
            setQuestions([]);
            setExpandedQuestion(null);
            setAddingQuestion(false);
            setEditingQuestionId(null);
            setDeleteTarget(null);
            setSettingsDirty(false);
            setFieldErrors({});
        }
    }, [isOpen, lessonId, courseId, lectureId]); 

    const loadTest = async () => {
        setLoading(true);
        try {
            // ПРОМЕНЕНО — тройна логика за entity type
            let entityType, entityId, entityField;
            if (courseId) {
                entityType = 'course';
                entityId = courseId;
                entityField = 'courseId';
            } else if (lectureId) { 
                entityType = 'lecture';
                entityId = lectureId;
                entityField = 'lectureId';
            } else {
                entityType = 'lesson';
                entityId = lessonId;
                entityField = 'lessonId';
            }

            const data = await getTests({ entityType, limit: 100 });
            const existing = data.tests?.find(t => t[entityField] === entityId);

            if (existing) {
                const full = await getTestById(existing.id);
                const td = full.test;
                setTest(td);
                setQuestions(
                    (td.questions || [])
                        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                );
                setSettings({
                    title: td.title || '',
                    description: td.description || '',
                    passingScore: td.passingScore ?? 70,
                    maxAttempts: td.maxAttempts || null,
                    timeLimitMinutes: td.timeLimitMinutes || null,
                    shuffleQuestions: td.shuffleQuestions || false,
                    shuffleAnswers: td.shuffleAnswers || false,
                    showCorrectAnswers: td.showCorrectAnswers !== false,
                    maxCredits: td.maxCredits || 0,
                    requireCourseCompletion: td.requireCourseCompletion !== false,
                });
            } else {
                const createPayload = {
                    title: `${t('testEditor.defaultTitle', 'Тест')}: ${entityTitle || t('testEditor.lesson', 'Урок')}`,
                    passingScore: 70,
                };
                // ПРОМЕНЕНО — тройно присвояване
                if (courseId) createPayload.courseId = courseId;
                else if (lectureId) createPayload.lectureId = lectureId; 
                else createPayload.lessonId = lessonId;

                const resp = await createTest(createPayload);
                if (resp.test) {
                    setTest(resp.test);
                    setQuestions([]);
                    setSettings({
                        ...DEFAULT_SETTINGS,
                        title: resp.test.title || '',
                    });
                }
            }
        } catch (err) {
            console.error('Error loading test:', err);
            toast.error(t('testEditor.errors.loadFailed', 'Грешка при зареждане на тест'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;
    // =========================================================
    //                    SETTINGS HANDLERS
    // =========================================================

    const handleSettingChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
        setSettingsDirty(true);
        if (fieldErrors[field]) {
            setFieldErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
        }
    };

    const handleSaveSettings = async () => {
        if (!test) return;

        const errs = {};
        if (!settings.title.trim()) {
            errs.title = t('testEditor.errors.titleRequired', 'Заглавието е задължително');
        }
        if (settings.passingScore < 0 || settings.passingScore > 100) {
            errs.passingScore = t('testEditor.errors.passingScoreRange', 'Стойността трябва да е между 0 и 100');
        }
        if (settings.maxAttempts && parseInt(settings.maxAttempts) < 1) {
            errs.maxAttempts = t('testEditor.errors.maxAttemptsMin', 'Минимум 1 опит');
        }
        if (settings.timeLimitMinutes && parseInt(settings.timeLimitMinutes) < 1) {
            errs.timeLimitMinutes = t('testEditor.errors.timeLimitMin', 'Минимум 1 минута');
        }
        if (Object.keys(errs).length > 0) {
            setFieldErrors(errs);
            return;
        }

        setSaving(true);
        try {
            const payload = {
                title: settings.title.trim(),
                description: settings.description.trim(),
                passingScore: parseInt(settings.passingScore) || 70,
                maxAttempts: settings.maxAttempts ? parseInt(settings.maxAttempts) : null,
                timeLimitMinutes: settings.timeLimitMinutes ? parseInt(settings.timeLimitMinutes) : null,
                shuffleQuestions: settings.shuffleQuestions,
                shuffleAnswers: settings.shuffleAnswers,
                showCorrectAnswers: settings.showCorrectAnswers,
                maxCredits: parseInt(settings.maxCredits) || 0,
                requireCourseCompletion: settings.requireCourseCompletion,
            };
            const resp = await updateTest(test.id, payload);
            if (resp.test) setTest(resp.test);
            setSettingsDirty(false);
            toast.success(t('testEditor.settingsSaved', 'Настройките са запазени'));
        } catch (err) {
            console.error('Error saving settings:', err);
            const validationErrors = err?.errors;
            if (validationErrors && Array.isArray(validationErrors)) {
                const errMap = {};
                validationErrors.forEach(e => { errMap[e.field] = e.message; });
                setFieldErrors(errMap);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleTogglePublish = async () => {
        if (!test) return;
        setActionLoading('publish');
        try {
            if (test.isPublished) {
                const resp = await unpublishTest(test.id);
                if (resp.test) setTest(resp.test);
            } else {
                const resp = await publishTest(test.id);
                if (resp.test) setTest(resp.test);
            }
        } catch (err) {
            console.error('Error toggling publish:', err);
        } finally {
            setActionLoading(null);
        }
    };

    // =========================================================
    //                    QUESTION HANDLERS
    // =========================================================

    const resetQuestionForm = () => {
        setQuestionForm({
            ...EMPTY_QUESTION,
            answers: [
                { answerText: '', isCorrect: true },
                { answerText: '', isCorrect: false },
            ],
        });
    };

    const handleStartAddQuestion = () => {
        resetQuestionForm();
        setEditingQuestionId(null);
        setAddingQuestion(true);
        setExpandedQuestion('new');
    };

    const handleStartEditQuestion = (q) => {
        setQuestionForm({
            questionText: q.questionText || '',
            questionType: q.questionType || 'single_choice',
            points: q.points || 1,
            explanation: q.explanation || '',
            answers: (q.answerOptions || []).map(a => ({
                answerText: a.answerText || '',
                isCorrect: a.isCorrect || false,
            })),
        });
        setEditingQuestionId(q.id);
        setAddingQuestion(false);
        setExpandedQuestion(q.id);
    };

    const handleCancelQuestionEdit = () => {
        setAddingQuestion(false);
        setEditingQuestionId(null);
        setExpandedQuestion(null);
        resetQuestionForm();
    };

    const handleQuestionTypeChange = (type) => {
        let newAnswers = [...questionForm.answers];
        if (type === 'true_false') {
            newAnswers = [
                { answerText: t('testEditor.trueOption', 'Вярно'), isCorrect: true },
                { answerText: t('testEditor.falseOption', 'Грешно'), isCorrect: false },
            ];
        } else if (questionForm.questionType === 'true_false') {
            newAnswers = [
                { answerText: '', isCorrect: true },
                { answerText: '', isCorrect: false },
            ];
        }
        // If switching from multiple to single, keep only first correct
        if (type === 'single_choice' && questionForm.questionType === 'multiple_choice') {
            let foundFirst = false;
            newAnswers = newAnswers.map(a => {
                if (a.isCorrect && !foundFirst) {
                    foundFirst = true;
                    return a;
                }
                return { ...a, isCorrect: false };
            });
        }
        setQuestionForm(prev => ({ ...prev, questionType: type, answers: newAnswers }));
    };

    const handleAnswerChange = (index, field, value) => {
        setQuestionForm(prev => {
            const updated = [...prev.answers];
            updated[index] = { ...updated[index], [field]: value };

            // For single_choice/true_false: only one correct
            if (field === 'isCorrect' && value && prev.questionType !== 'multiple_choice') {
                updated.forEach((a, i) => {
                    if (i !== index) updated[i] = { ...a, isCorrect: false };
                });
            }
            return { ...prev, answers: updated };
        });
    };

    const handleAddAnswer = () => {
        if (questionForm.answers.length >= 6) return;
        setQuestionForm(prev => ({
            ...prev,
            answers: [...prev.answers, { answerText: '', isCorrect: false }],
        }));
    };

    const handleRemoveAnswer = (index) => {
        if (questionForm.answers.length <= 2) return;
        setQuestionForm(prev => {
            const updated = prev.answers.filter((_, i) => i !== index);
            // Ensure at least one correct
            if (!updated.some(a => a.isCorrect) && updated.length > 0) {
                updated[0].isCorrect = true;
            }
            return { ...prev, answers: updated };
        });
    };

    const validateQuestion = () => {
        if (!questionForm.questionText.trim()) {
            toast.error(t('testEditor.errors.questionRequired', 'Въведете текст на въпроса'));
            return false;
        }
        if (questionForm.answers.some(a => !a.answerText.trim())) {
            toast.error(t('testEditor.errors.answersRequired', 'Всички отговори трябва да имат текст'));
            return false;
        }
        if (!questionForm.answers.some(a => a.isCorrect)) {
            toast.error(t('testEditor.errors.correctRequired', 'Маркирайте поне един верен отговор'));
            return false;
        }
        return true;
    };

    const handleSaveQuestion = async () => {
        if (!test || !validateQuestion()) return;
        setActionLoading('saveQuestion');
        try {
            const payload = {
                questionText: questionForm.questionText.trim(),
                questionType: questionForm.questionType,
                points: parseInt(questionForm.points) || 1,
                explanation: questionForm.explanation.trim() || undefined,
                answers: questionForm.answers.map(a => ({
                    answerText: a.answerText.trim(),
                    isCorrect: a.isCorrect,
                })),
            };

            if (editingQuestionId) {
                await updateQuestion(test.id, editingQuestionId, payload);
                toast.success(t('testEditor.questionUpdated', 'Въпросът е обновен'));
            } else {
                await addQuestion(test.id, payload);
                toast.success(t('testEditor.questionAdded', 'Въпросът е добавен'));
            }

            // Reload test to get fresh questions
            const full = await getTestById(test.id);
            setTest(full.test);
            setQuestions(
                (full.test.questions || [])
                    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            );
            handleCancelQuestionEdit();
        } catch (err) {
            console.error('Error saving question:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        if (!test) return;
        setActionLoading(`delete-${questionId}`);
        try {
            await deleteQuestion(test.id, questionId);
            const full = await getTestById(test.id);
            setTest(full.test);
            setQuestions(
                (full.test.questions || [])
                    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            );
            setDeleteTarget(null);
            toast.success(t('testEditor.questionDeleted', 'Въпросът е изтрит'));
        } catch (err) {
            console.error('Error deleting question:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleMoveQuestion = async (index, direction) => {
        if (!test) return;
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= questions.length) return;

        const reordered = [...questions];
        [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
        setQuestions(reordered);

        try {
            await reorderQuestions(test.id, reordered.map(q => q.id));
        } catch (err) {
            console.error('Error reordering:', err);
            // Revert
            const full = await getTestById(test.id);
            setQuestions(
                (full.test.questions || [])
                    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            );
        }
    };
    // =========================================================
    //                    RENDER: SETTINGS TAB
    // =========================================================

    const renderSettingsTab = () => (
        <div className="tem-settings">
            <div className="tem-settings-grid">
                {/* Title */}
                <div className="tem-field tem-field-full">
                    <label className="tem-label">{t('testEditor.fields.title', 'Заглавие на теста')}</label>
                    <input
                        type="text"
                        className={`tem-input ${fieldErrors.title ? 'tem-input-error' : ''}`}
                        value={settings.title}
                        onChange={(e) => handleSettingChange('title', e.target.value)}
                        placeholder={t('testEditor.placeholders.title', 'Напр. Тест по Модул 1')}
                    />
                    {fieldErrors.title && <span className="tem-field-error">{fieldErrors.title}</span>}
                </div>

                {/* Description */}
                <div className="tem-field tem-field-full">
                    <label className="tem-label">{t('testEditor.fields.description', 'Описание')}</label>
                    <textarea
                        className="tem-textarea"
                        value={settings.description}
                        onChange={(e) => handleSettingChange('description', e.target.value)}
                        placeholder={t('testEditor.placeholders.description', 'Кратко описание на теста...')}
                        rows={3}
                    />
                </div>

                {/* Passing Score */}
                <div className="tem-field">
                    <label className="tem-label">
                        <Award size={14} />
                        {t('testEditor.fields.passingScore', 'Минимален резултат (%)')}
                    </label>
                    <input
                        type="number"
                        className={`tem-input ${fieldErrors.passingScore ? 'tem-input-error' : ''}`}
                        value={settings.passingScore}
                        onChange={(e) => handleSettingChange('passingScore', e.target.value)}
                        min={0}
                        max={100}
                    />
                    {fieldErrors.passingScore && <span className="tem-field-error">{fieldErrors.passingScore}</span>}
                </div>

                {/* Time Limit */}
                <div className="tem-field">
                    <label className="tem-label">
                        <Clock size={14} />
                        {t('testEditor.fields.timeLimit', 'Времево ограничение (мин)')}
                    </label>
                    <input
                        type="number"
                        className={`tem-input ${fieldErrors.timeLimitMinutes ? 'tem-input-error' : ''}`}
                        value={settings.timeLimitMinutes || ''}
                        onChange={(e) => handleSettingChange('timeLimitMinutes', e.target.value || null)}
                        min={1}
                        placeholder={t('testEditor.placeholders.noLimit', 'Без ограничение')}
                    />
                    {fieldErrors.timeLimitMinutes && <span className="tem-field-error">{fieldErrors.timeLimitMinutes}</span>}
                </div>

                {/* Max Attempts */}
                <div className="tem-field">
                    <label className="tem-label">
                        <Hash size={14} />
                        {t('testEditor.fields.maxAttempts', 'Макс. опити')}
                    </label>
                    <input
                        type="number"
                        className={`tem-input ${fieldErrors.maxAttempts ? 'tem-input-error' : ''}`}
                        value={settings.maxAttempts || ''}
                        onChange={(e) => handleSettingChange('maxAttempts', e.target.value || null)}
                        min={1}
                        placeholder={t('testEditor.placeholders.unlimited', 'Неограничено')}
                    />
                    {fieldErrors.maxAttempts && <span className="tem-field-error">{fieldErrors.maxAttempts}</span>}
                </div>

                {/* Max Credits */}
                <div className="tem-field">
                    <label className="tem-label">
                        <Award size={14} />
                        {t('testEditor.fields.maxCredits', 'Кредити')}
                    </label>
                    <input
                        type="number"
                        className={`tem-input ${fieldErrors.maxCredits ? 'tem-input-error' : ''}`}
                        value={settings.maxCredits}
                        onChange={(e) => handleSettingChange('maxCredits', e.target.value)}
                        min={0}
                    />
                    {fieldErrors.maxCredits && <span className="tem-field-error">{fieldErrors.maxCredits}</span>}
                </div>
            </div>

            {/* Toggles */}
            <div className="tem-toggles-section">
                <h4 className="tem-section-title">{t('testEditor.sections.options', 'Опции')}</h4>
                <div className="tem-toggles-grid">
                    {[
                        { key: 'shuffleQuestions', icon: Shuffle, label: t('testEditor.fields.shuffleQuestions', 'Разбъркай въпросите') },
                        { key: 'shuffleAnswers', icon: Shuffle, label: t('testEditor.fields.shuffleAnswers', 'Разбъркай отговорите') },
                        { key: 'showCorrectAnswers', icon: CheckCircle2, label: t('testEditor.fields.showCorrectAnswers', 'Покажи верните отговори') },
                        { key: 'requireCourseCompletion', icon: Award, label: t('testEditor.fields.requireCourseCompletion', 'Изисквай завършване на курса') },
                    ].map(({ key, icon: Icon, label }) => (
                        <label key={key} className="tem-toggle-row">
                            <div className="tem-toggle-info">
                                <Icon size={16} />
                                <span>{label}</span>
                            </div>
                            <button
                                type="button"
                                className={`tem-toggle-btn ${settings[key] ? 'tem-toggle-on' : ''}`}
                                onClick={() => handleSettingChange(key, !settings[key])}
                            >
                                <span className="tem-toggle-knob" />
                            </button>
                        </label>
                    ))}
                </div>
            </div>

            {/* Save button */}
            <div className="tem-settings-actions">
                <button
                    className="tem-btn tem-btn-primary"
                    onClick={handleSaveSettings}
                    disabled={saving || !settingsDirty}
                >
                    {saving ? <Loader2 size={16} className="tem-spin" /> : <Save size={16} />}
                    {t('testEditor.saveSettings', 'Запази настройки')}
                </button>
            </div>
        </div>
    );

    // =========================================================
    //                    RENDER: QUESTION FORM
    // =========================================================

    const renderQuestionForm = () => (
        <div className="tem-question-form">
            {/* Question Type */}
            <div className="tem-qtype-selector">
                {QUESTION_TYPES.map(({ value, icon: Icon, color }) => (
                    <button
                        key={value}
                        type="button"
                        className={`tem-qtype-btn ${questionForm.questionType === value ? 'tem-qtype-active' : ''}`}
                        onClick={() => handleQuestionTypeChange(value)}
                        style={questionForm.questionType === value ? { borderColor: color, color } : {}}
                        title={t(`testEditor.questionTypeHints.${value}`)}
                    >
                        <Icon size={16} />
                        {t(`testEditor.questionTypes.${value}`, value)}
                    </button>
                ))}
            </div>

            {/* Question Text */}
            <div className="tem-field">
                <label className="tem-label">{t('testEditor.fields.questionText', 'Текст на въпроса')}</label>
                <textarea
                    className="tem-textarea"
                    value={questionForm.questionText}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, questionText: e.target.value }))}
                    placeholder={t('testEditor.placeholders.questionText', 'Въведете въпроса тук...')}
                    rows={3}
                />
            </div>

            {/* Points + Explanation row */}
            <div className="tem-form-row">
                <div className="tem-field tem-field-small">
                    <label className="tem-label">{t('testEditor.fields.points', 'Точки')}</label>
                    <input
                        type="number"
                        className="tem-input"
                        value={questionForm.points}
                        onChange={(e) => setQuestionForm(prev => ({ ...prev, points: e.target.value }))}
                        min={1}
                        max={100}
                    />
                </div>
                <div className="tem-field tem-field-grow">
                    <label className="tem-label">{t('testEditor.fields.explanation', 'Обяснение (опционално)')}</label>
                    <input
                        type="text"
                        className="tem-input"
                        value={questionForm.explanation}
                        onChange={(e) => setQuestionForm(prev => ({ ...prev, explanation: e.target.value }))}
                        placeholder={t('testEditor.placeholders.explanation', 'Защо този отговор е верен...')}
                    />
                </div>
            </div>

            {/* Answers */}
            <div className="tem-answers-section">
                <label className="tem-label">{t('testEditor.fields.answers', 'Отговори')}</label>
                <div className="tem-answers-list">
                    {questionForm.answers.map((answer, idx) => (
                        <div key={idx} className={`tem-answer-row ${answer.isCorrect ? 'tem-answer-correct' : ''}`}>
                            <button
                                type="button"
                                className={`tem-correct-btn ${answer.isCorrect ? 'tem-correct-active' : ''}`}
                                onClick={() => handleAnswerChange(idx, 'isCorrect', !answer.isCorrect)}
                                title={answer.isCorrect
                                    ? t('testEditor.markIncorrect', 'Маркирай като грешен')
                                    : t('testEditor.markCorrect', 'Маркирай като верен')
                                }
                            >
                                {questionForm.questionType === 'multiple_choice'
                                    ? (answer.isCorrect ? <CheckSquare size={18} /> : <Square size={18} />)
                                    : (answer.isCorrect ? <CheckCircle2 size={18} /> : <Circle size={18} />)
                                }
                            </button>
                            <input
                                type="text"
                                className="tem-input tem-answer-input"
                                value={answer.answerText}
                                onChange={(e) => handleAnswerChange(idx, 'answerText', e.target.value)}
                                placeholder={`${t('testEditor.answerPlaceholder', 'Отговор')} ${idx + 1}`}
                                disabled={questionForm.questionType === 'true_false'}
                            />
                            {questionForm.questionType !== 'true_false' && questionForm.answers.length > 2 && (
                                <button
                                    type="button"
                                    className="tem-btn-icon tem-btn-danger-icon"
                                    onClick={() => handleRemoveAnswer(idx)}
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {questionForm.questionType !== 'true_false' && questionForm.answers.length < 6 && (
                    <button type="button" className="tem-btn tem-btn-sm tem-btn-ghost" onClick={handleAddAnswer}>
                        <Plus size={14} />
                        {t('testEditor.addAnswer', 'Добави отговор')}
                    </button>
                )}
            </div>

            {/* Form actions */}
            <div className="tem-form-actions">
                <button type="button" className="tem-btn tem-btn-ghost" onClick={handleCancelQuestionEdit}>
                    {t('testEditor.cancel', 'Отказ')}
                </button>
                <button
                    type="button"
                    className="tem-btn tem-btn-primary"
                    onClick={handleSaveQuestion}
                    disabled={actionLoading === 'saveQuestion'}
                >
                    {actionLoading === 'saveQuestion'
                        ? <Loader2 size={16} className="tem-spin" />
                        : <Save size={16} />
                    }
                    {editingQuestionId
                        ? t('testEditor.updateQuestion', 'Обнови въпрос')
                        : t('testEditor.saveQuestion', 'Запази въпрос')
                    }
                </button>
            </div>
        </div>
    );

    // =========================================================
    //                    RENDER: QUESTIONS TAB
    // =========================================================

    const renderQuestionsTab = () => (
        <div className="tem-questions">
            {questions.length === 0 && !addingQuestion && (
                <div className="tem-empty">
                    <HelpCircle size={40} />
                    <p>{t('testEditor.noQuestions', 'Няма добавени въпроси')}</p>
                    <button className="tem-btn tem-btn-primary" onClick={handleStartAddQuestion}>
                        <Plus size={16} />
                        {t('testEditor.addFirstQuestion', 'Добави първи въпрос')}
                    </button>
                </div>
            )}

            {questions.map((q, index) => {
                const isExpanded = expandedQuestion === q.id;
                const isEditing = editingQuestionId === q.id;
                const typeConfig = QUESTION_TYPES.find(qt => qt.value === q.questionType) || QUESTION_TYPES[0];
                const TypeIcon = typeConfig.icon;

                return (
                    <div key={q.id} className={`tem-question-card ${isExpanded ? 'tem-question-expanded' : ''}`}>
                        {/* Question header */}
                        <div className="tem-question-header" onClick={() => {
                            if (!isEditing) setExpandedQuestion(isExpanded ? null : q.id);
                        }}>
                            <div className="tem-question-left">
                                <span className="tem-question-num">{index + 1}</span>
                                <div className="tem-question-meta">
                                    <span className="tem-question-text-preview">
                                        {q.questionText?.substring(0, 80)}{q.questionText?.length > 80 ? '...' : ''}
                                    </span>
                                    <div className="tem-question-badges">
                                        <span className="tem-badge" style={{ color: typeConfig.color, borderColor: typeConfig.color }}>
                                            <TypeIcon size={12} />
                                            {t(`testEditor.questionTypes.${q.questionType}`, q.questionType)}
                                        </span>
                                        <span className="tem-badge tem-badge-points">
                                            {q.points} {t('testEditor.pts', 'т.')}
                                        </span>
                                        <span className="tem-badge tem-badge-answers">
                                            {q.answerOptions?.length || 0} {t('testEditor.answers', 'отг.')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="tem-question-actions" onClick={(e) => e.stopPropagation()}>
                                <button
                                    className="tem-btn-icon"
                                    onClick={() => handleMoveQuestion(index, -1)}
                                    disabled={index === 0}
                                    title={t('testEditor.moveUp', 'Премести нагоре')}
                                >
                                    <ChevronUp size={16} />
                                </button>
                                <button
                                    className="tem-btn-icon"
                                    onClick={() => handleMoveQuestion(index, 1)}
                                    disabled={index === questions.length - 1}
                                    title={t('testEditor.moveDown', 'Премести надолу')}
                                >
                                    <ChevronDown size={16} />
                                </button>
                                <button
                                    className="tem-btn-icon"
                                    onClick={() => handleStartEditQuestion(q)}
                                    title={t('testEditor.editQuestion', 'Редактирай')}
                                >
                                    <Edit3 size={16} />
                                </button>
                                <button
                                    className="tem-btn-icon tem-btn-danger-icon"
                                    onClick={() => setDeleteTarget(q.id)}
                                    title={t('testEditor.deleteQuestion', 'Изтрий')}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Expanded: show answers read-only or edit form */}
                        {isExpanded && !isEditing && (
                            <div className="tem-question-body">
                                {q.explanation && (
                                    <p className="tem-question-explanation">
                                        <AlertCircle size={14} /> {q.explanation}
                                    </p>
                                )}
                                <div className="tem-question-answers-preview">
                                    {(q.answerOptions || []).map((a, ai) => (
                                        <div key={ai} className={`tem-answer-preview ${a.isCorrect ? 'tem-answer-preview-correct' : ''}`}>
                                            {a.isCorrect ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                            <span>{a.answerText}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Edit form */}
                        {isEditing && renderQuestionForm()}

                        {/* Delete confirmation */}
                        {deleteTarget === q.id && (
                            <div className="tem-delete-confirm">
                                <p>{t('testEditor.confirmDeleteQuestion', 'Сигурни ли сте, че искате да изтриете този въпрос?')}</p>
                                <div className="tem-delete-actions">
                                    <button className="tem-btn tem-btn-ghost tem-btn-sm" onClick={() => setDeleteTarget(null)}>
                                        {t('testEditor.cancel', 'Отказ')}
                                    </button>
                                    <button
                                        className="tem-btn tem-btn-danger tem-btn-sm"
                                        onClick={() => handleDeleteQuestion(q.id)}
                                        disabled={actionLoading === `delete-${q.id}`}
                                    >
                                        {actionLoading === `delete-${q.id}`
                                            ? <Loader2 size={14} className="tem-spin" />
                                            : <Trash2 size={14} />
                                        }
                                        {t('testEditor.confirmDelete', 'Изтрий')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* New question form */}
            {addingQuestion && (
                <div className="tem-question-card tem-question-expanded tem-question-new">
                    <div className="tem-question-header tem-new-header">
                        <div className="tem-question-left">
                            <span className="tem-question-num">{questions.length + 1}</span>
                            <span className="tem-new-label">{t('testEditor.newQuestion', 'Нов въпрос')}</span>
                        </div>
                    </div>
                    {renderQuestionForm()}
                </div>
            )}

            {/* Add question button */}
            {questions.length > 0 && !addingQuestion && !editingQuestionId && (
                <button className="tem-btn tem-btn-add-question" onClick={handleStartAddQuestion}>
                    <Plus size={18} />
                    {t('testEditor.addQuestion', 'Добави въпрос')}
                </button>
            )}
        </div>
    );
    // =========================================================
    //                    RENDER: PREVIEW TAB
    // =========================================================

    const renderPreviewTab = () => (
        <div className="tem-preview">
            {questions.length === 0 ? (
                <div className="tem-empty">
                    <Eye size={40} />
                    <p>{t('testEditor.noQuestionsPreview', 'Добавете въпроси, за да видите преглед')}</p>
                </div>
            ) : (
                <>
                    <div className="tem-preview-header">
                        <h3>{settings.title || t('testEditor.untitled', 'Без заглавие')}</h3>
                        {settings.description && <p>{settings.description}</p>}
                        <div className="tem-preview-info">
                            {settings.timeLimitMinutes && (
                                <span><Clock size={14} /> {settings.timeLimitMinutes} {t('testEditor.minutes', 'мин')}</span>
                            )}
                            <span><HelpCircle size={14} /> {questions.length} {t('testEditor.questionsCount', 'въпроса')}</span>
                            <span><Award size={14} /> {t('testEditor.passingAt', 'Минимум')}: {settings.passingScore}%</span>
                        </div>
                    </div>

                    {questions.map((q, index) => {
                        const typeConfig = QUESTION_TYPES.find(qt => qt.value === q.questionType) || QUESTION_TYPES[0];
                        return (
                            <div key={q.id} className="tem-preview-question">
                                <div className="tem-preview-q-header">
                                    <span className="tem-preview-q-num">{index + 1}.</span>
                                    <span className="tem-preview-q-text">{q.questionText}</span>
                                    <span className="tem-preview-q-points">{q.points} {t('testEditor.pts', 'т.')}</span>
                                </div>
                                <div className="tem-preview-answers">
                                    {(q.answerOptions || []).map((a, ai) => (
                                        <div key={ai} className="tem-preview-answer">
                                            {q.questionType === 'multiple_choice'
                                                ? <Square size={16} />
                                                : <Circle size={16} />
                                            }
                                            <span>{a.answerText}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </>
            )}
        </div>
    );

    // =========================================================
    //                    MAIN RENDER
    // =========================================================

    const TABS = [
        { id: 'settings', icon: Settings, label: t('testEditor.tabs.settings', 'Настройки') },
        { id: 'questions', icon: List, label: t('testEditor.tabs.questions', 'Въпроси') + (questions.length > 0 ? ` (${questions.length})` : '') },
        { id: 'preview', icon: Eye, label: t('testEditor.tabs.preview', 'Преглед') },
    ];

    return (
        <div className="tem-overlay" onClick={onClose}>
            <div className="tem-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="tem-header">
                    <div className="tem-header-left">
                        <FileText size={20} />
                        <h2>{t('testEditor.title', 'Редактор на тест')}</h2>
                        {test && (
                            <span className={`tem-status-badge ${test.isPublished ? 'tem-status-published' : 'tem-status-draft'}`}>
                                {test.isPublished
                                    ? t('testEditor.published', 'Публикуван')
                                    : t('testEditor.draft', 'Чернова')
                                }
                            </span>
                        )}
                    </div>
                    <div className="tem-header-right">
                        {test && (
                            <button
                                className={`tem-btn tem-btn-sm ${test.isPublished ? 'tem-btn-warning' : 'tem-btn-success'}`}
                                onClick={handleTogglePublish}
                                disabled={actionLoading === 'publish' || questions.length === 0}
                                title={questions.length === 0 ? t('testEditor.needQuestions', 'Добавете въпроси първо') : ''}
                            >
                                {actionLoading === 'publish'
                                    ? <Loader2 size={14} className="tem-spin" />
                                    : test.isPublished ? <Eye size={14} /> : <CheckCircle2 size={14} />
                                }
                                {test.isPublished
                                    ? t('testEditor.unpublish', 'Скрий')
                                    : t('testEditor.publish', 'Публикувай')
                                }
                            </button>
                        )}
                        <button className="tem-btn-icon tem-close-btn" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tem-tabs">
                    {TABS.map(({ id, icon: Icon, label }) => (
                        <button
                            key={id}
                            className={`tem-tab ${activeTab === id ? 'tem-tab-active' : ''}`}
                            onClick={() => setActiveTab(id)}
                        >
                            <Icon size={16} />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="tem-content">
                    {loading ? (
                        <div className="tem-loading">
                            <Loader2 size={32} className="tem-spin" />
                            <p>{t('testEditor.loading', 'Зареждане...')}</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'settings' && renderSettingsTab()}
                            {activeTab === 'questions' && renderQuestionsTab()}
                            {activeTab === 'preview' && renderPreviewTab()}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestEditorModal;