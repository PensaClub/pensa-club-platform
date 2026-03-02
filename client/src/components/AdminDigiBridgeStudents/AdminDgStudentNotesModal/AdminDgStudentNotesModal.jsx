// src/components/AdminDigiBridgeStudents/AdminDgStudentNotesModal/AdminDgStudentNotesModal.jsx

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../../contexts/AcademyProvider';
import './adminDgStudentNotesModal.css';

export const AdminDgStudentNotesModal = ({ student, onClose }) => {
  const { t } = useTranslation('digibridge-students');
  const {
    getAdminStudentNotes,
    createAdminStudentNote,
    updateAdminStudentNote,
    deleteAdminStudentNote
  } = useAcademy();

  // States
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form States
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState('general');

  // Delete Confirmation
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  // Categories with colors
  const categories = [
    { value: 'general', label: t('adminDgStudentNotes.categories.general'), color: '#6b7280', bg: '#f3f4f6' },
    { value: 'important', label: t('adminDgStudentNotes.categories.important'), color: '#dc2626', bg: '#fef2f2' },
    { value: 'followup', label: t('adminDgStudentNotes.categories.followup'), color: '#f59e0b', bg: '#fffbeb' },
    { value: 'positive', label: t('adminDgStudentNotes.categories.positive'), color: '#10b981', bg: '#ecfdf5' },
    { value: 'contact', label: t('adminDgStudentNotes.categories.contact'), color: '#3b82f6', bg: '#eff6ff' }
  ];

  // ===============================
  // FETCH NOTES
  // ===============================
  const fetchNotes = useCallback(async () => {
    if (!student?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAdminStudentNotes(student.id);
      if (response?.success) {
        // Sort by date - newest first
        const sortedNotes = (response.notes || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotes(sortedNotes);
      } else {
        setError(response?.message || t('adminDgStudentNotes.errors.fetchFailed'));
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError(t('adminDgStudentNotes.errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  }, [student?.id, getAdminStudentNotes, t]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // ===============================
  // HANDLERS
  // ===============================
  const handleBackdropClick = useCallback((e) => {
    if (e.target.classList.contains('adminDgStudentNotesModal-overlay')) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        if (deletingNoteId) {
          setDeletingNoteId(null);
        } else if (isAddingNote || editingNoteId) {
          resetForm();
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [onClose, deletingNoteId, isAddingNote, editingNoteId]);

  const resetForm = () => {
    setIsAddingNote(false);
    setEditingNoteId(null);
    setNoteContent('');
    setNoteCategory('general');
  };

  const handleStartEdit = (note) => {
    setEditingNoteId(note.id);
    setNoteContent(note.text);
    setNoteCategory(note.category || 'general');
    setIsAddingNote(false);
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim()) return;

    setSaving(true);
    try {
      if (editingNoteId) {
        await updateAdminStudentNote(student.id, editingNoteId, {
          text: noteContent.trim(),
          category: noteCategory
        });
      } else {
        await createAdminStudentNote(student.id, {
          text: noteContent.trim(),
          category: noteCategory
        });
      }
      
      resetForm();
      await fetchNotes();
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    setSaving(true);
    try {
      await deleteAdminStudentNote(student.id, noteId);
      setDeletingNoteId(null);
      await fetchNotes();
    } catch (err) {
      console.error('Error deleting note:', err);
    } finally {
      setSaving(false);
    }
  };

  // ===============================
  // HELPERS
  // ===============================
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('adminDgStudentNotes.time.justNow');
    if (diffMins < 60) return t('adminDgStudentNotes.time.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('adminDgStudentNotes.time.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('adminDgStudentNotes.time.daysAgo', { count: diffDays });

    return date.toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatFullDate = (dateString) => {
    return new Date(dateString).toLocaleString('bg-BG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryStyle = (categoryValue) => {
    const category = categories.find(c => c.value === categoryValue) || categories[0];
    return { color: category.color, backgroundColor: category.bg };
  };

  const getCategoryLabel = (categoryValue) => {
    const category = categories.find(c => c.value === categoryValue);
    return category?.label || t('adminDgStudentNotes.categories.general');
  };

  if (!student) return null;

  return (
    <div className="adminDgStudentNotesModal-overlay" onClick={handleBackdropClick}>
      <div className="adminDgStudentNotesModal-container">
        {/* Header */}
        <div className="adminDgStudentNotesModal-header">
          <div className="adminDgStudentNotesModal-headerInfo">
            <h2 className="adminDgStudentNotesModal-title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" fill="currentColor"/>
                <path d="M7 7h10v2H7zm0 4h10v2H7zm0 4h7v2H7z" fill="currentColor"/>
              </svg>
              {t('adminDgStudentNotes.title')}
            </h2>
            <p className="adminDgStudentNotesModal-subtitle">
              {student.name} • {notes.length} {t('adminDgStudentNotes.notesCount', { count: notes.length })}
            </p>
          </div>
          <button
            className="adminDgStudentNotesModal-closeBtn"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="adminDgStudentNotesModal-content">
          {/* Add Note Button / Form */}
          {!isAddingNote && !editingNoteId ? (
            <button
              className="adminDgStudentNotesModal-addBtn"
              onClick={() => setIsAddingNote(true)}
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {t('adminDgStudentNotes.addNote')}
            </button>
          ) : (
            <div className="adminDgStudentNotesModal-form">
              <div className="adminDgStudentNotesModal-formHeader">
                <span className="adminDgStudentNotesModal-formTitle">
                  {editingNoteId ? t('adminDgStudentNotes.editNote') : t('adminDgStudentNotes.newNote')}
                </span>
                <button
                  className="adminDgStudentNotesModal-formCancel"
                  onClick={resetForm}
                  type="button"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                  </svg>
                </button>
              </div>

              {/* Category Selector */}
              <div className="adminDgStudentNotesModal-categories">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    className={`adminDgStudentNotesModal-categoryBtn ${
                      noteCategory === cat.value ? 'adminDgStudentNotesModal-categoryBtn--active' : ''
                    }`}
                    style={{
                      '--cat-color': cat.color,
                      '--cat-bg': cat.bg
                    }}
                    onClick={() => setNoteCategory(cat.value)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                className="adminDgStudentNotesModal-textarea"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder={t('adminDgStudentNotes.placeholder')}
                rows={4}
                autoFocus
              />

              {/* Form Actions */}
              <div className="adminDgStudentNotesModal-formActions">
                <button
                  className="adminDgStudentNotesModal-btnSecondary"
                  onClick={resetForm}
                  type="button"
                  disabled={saving}
                >
                  {t('common.cancel')}
                </button>
                <button
                  className="adminDgStudentNotesModal-btnPrimary"
                  onClick={handleSaveNote}
                  type="button"
                  disabled={!noteContent.trim() || saving}
                >
                  {saving ? (
                    <>
                      <span className="adminDgStudentNotesModal-btnSpinner"></span>
                      {t('common.saving')}
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                      </svg>
                      {t('common.save')}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Notes List */}
          <div className="adminDgStudentNotesModal-notesList">
            {loading ? (
              <div className="adminDgStudentNotesModal-loading">
                <div className="adminDgStudentNotesModal-spinner"></div>
                <p>{t('common.loading')}</p>
              </div>
            ) : error ? (
              <div className="adminDgStudentNotesModal-error">
                <svg width="48" height="48" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                </svg>
                <p>{error}</p>
                <button onClick={fetchNotes} type="button">
                  {t('common.retry')}
                </button>
              </div>
            ) : notes.length === 0 ? (
              <div className="adminDgStudentNotesModal-empty">
                <svg width="64" height="64" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" fill="currentColor" opacity="0.3"/>
                  <path d="M7 7h10v2H7zm0 4h10v2H7zm0 4h7v2H7z" fill="currentColor" opacity="0.3"/>
                </svg>
                <h3>{t('adminDgStudentNotes.empty.title')}</h3>
                <p>{t('adminDgStudentNotes.empty.description')}</p>
              </div>
            ) : (
              notes.map((note) => (
                <div 
                  key={note.id} 
                  className={`adminDgStudentNotesModal-note ${
                    editingNoteId === note.id ? 'adminDgStudentNotesModal-note--editing' : ''
                  }`}
                >
                  {/* Delete Confirmation Overlay */}
                  {deletingNoteId === note.id && (
                    <div className="adminDgStudentNotesModal-noteDeleteOverlay">
                      <p>{t('adminDgStudentNotes.deleteConfirm')}</p>
                      <div className="adminDgStudentNotesModal-noteDeleteActions">
                        <button
                          className="adminDgStudentNotesModal-noteDeleteCancel"
                          onClick={() => setDeletingNoteId(null)}
                          type="button"
                          disabled={saving}
                        >
                          {t('common.cancel')}
                        </button>
                        <button
                          className="adminDgStudentNotesModal-noteDeleteConfirm"
                          onClick={() => handleDeleteNote(note.id)}
                          type="button"
                          disabled={saving}
                        >
                          {saving ? t('common.deleting') : t('common.delete')}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Note Header */}
                  <div className="adminDgStudentNotesModal-noteHeader">
                    <span 
                      className="adminDgStudentNotesModal-noteCategory"
                      style={getCategoryStyle(note.category)}
                    >
                      {getCategoryLabel(note.category)}
                    </span>
                    <div className="adminDgStudentNotesModal-noteActions">
                      <button
                        className="adminDgStudentNotesModal-noteActionBtn"
                        onClick={() => handleStartEdit(note)}
                        title={t('common.edit')}
                        type="button"
                        disabled={isAddingNote || editingNoteId}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                        </svg>
                      </button>
                      <button
                        className="adminDgStudentNotesModal-noteActionBtn adminDgStudentNotesModal-noteActionBtn--delete"
                        onClick={() => setDeletingNoteId(note.id)}
                        title={t('common.delete')}
                        type="button"
                        disabled={isAddingNote || editingNoteId}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Note Content */}
                  <div className="adminDgStudentNotesModal-noteContent">
                    {note.text}
                  </div>

                  {/* Note Footer */}
                  <div className="adminDgStudentNotesModal-noteFooter">
                    <div className="adminDgStudentNotesModal-noteDate" title={formatFullDate(note.createdAt)}>
                      <svg width="14" height="14" viewBox="0 0 24 24">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor"/>
                      </svg>
                      {formatDate(note.createdAt)}
                    </div>
                    {note.updatedAt && note.updatedAt !== note.createdAt && (
                      <span className="adminDgStudentNotesModal-noteEdited">
                        ({t('adminDgStudentNotes.edited')})
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="adminDgStudentNotesModal-footer">
          <button
            className="adminDgStudentNotesModal-btnSecondary"
            onClick={onClose}
            type="button"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};