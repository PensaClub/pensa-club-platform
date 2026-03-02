// client/src/components/DigiMentorPanel/StudentDetails/StudentNotesTab.jsx

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../../contexts/AcademyProvider';
import './studentNotesTab.css';

export const StudentNotesTab = ({ student }) => {
  const { t } = useTranslation('digibridge-mentor');
  
  const { 
    getStudentNotes,
    createStudentNote, 
    updateStudentNote, 
    deleteStudentNote 
  } = useAcademy();

  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteForm, setNoteForm] = useState({
    text: ''
  });

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
  setIsLoading(true);
  try {
    const result = await getStudentNotes(student.id);
    
    if (result.success) {
      // Sort by date (newest first)
      const sortedNotes = [...result.notes].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setNotes(sortedNotes);
    }
    
    setIsLoading(false);
  } catch (error) {
    console.error('Error loading notes:', error);
    setIsLoading(false);
  }
};

  const handleOpenNoteModal = (note = null) => {
    if (note) {
      setSelectedNote(note);
      setNoteForm({
        text: note.text
      });
    } else {
      setSelectedNote(null);
      setNoteForm({
        text: ''
      });
    }
    setShowNoteModal(true);
  };

  const handleCloseNoteModal = () => {
    setShowNoteModal(false);
    setSelectedNote(null);
    setNoteForm({
      text: ''
    });
  };

  const handleFormChange = (value) => {
    setNoteForm({
      text: value
    });
  };

  const handleSaveNote = async () => {
  if (!noteForm.text.trim()) return;

  try {
    const noteData = {
      text: noteForm.text.trim()
    };

    if (selectedNote) {
      await updateStudentNote(selectedNote.id, noteData);
    } else {
      await createStudentNote(student.id, noteData);
    }
    
    await loadNotes();
    handleCloseNoteModal();
  } catch (error) {
    console.error('Error saving note:', error);
  }
};

  const handleDeleteNote = async (noteId) => {
  if (!window.confirm(t('studentDetails.notes.confirmDelete'))) return;

  try {
    await deleteStudentNote(noteId);
    await loadNotes();
  } catch (error) {
    console.error('Error deleting note:', error);
  }
};

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredNotes = notes.filter(note =>
    note.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!student) return null;

  return (
    <div className="student-notes-tab">
      {/* HEADER */}
      <div className="student-notes-header">
        <div className="student-notes-header-left">
          <h3 className="student-notes-title">
            📝 {t('studentDetails.notes.title')}
          </h3>
          <span className="student-notes-count">
            {filteredNotes.length} {t('studentDetails.notes.notesCount')}
          </span>
        </div>

        <button
          className="student-notes-add-btn"
          onClick={() => handleOpenNoteModal()}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('studentDetails.notes.addNote')}
        </button>
      </div>

      {/* SEARCH */}
      <div className="student-notes-search">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <input
          type="text"
          placeholder={t('studentDetails.notes.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* NOTES LIST */}
      {isLoading ? (
        <div className="student-notes-loading">
          <p>{t('studentDetails.notes.loading')}</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="student-notes-empty">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 4M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p>{searchQuery ? t('studentDetails.notes.noResults') : t('studentDetails.notes.noNotes')}</p>
          {!searchQuery && (
            <button
              className="student-notes-empty-btn"
              onClick={() => handleOpenNoteModal()}
            >
              {t('studentDetails.notes.addFirstNote')}
            </button>
          )}
        </div>
      ) : (
        <div className="student-notes-list">
          {filteredNotes.map((note) => (
            <div key={note.id} className="student-notes-card">
              <div className="student-notes-card-header">
                <div className="student-notes-card-meta">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 20C17 18.3431 14.7614 17 12 17C9.23858 17 7 18.3431 7 20M12 14C10.3431 14 9 12.6569 9 11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11C15 12.6569 13.6569 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="student-notes-card-author">{note.mentorName}</span>
                </div>

                <div className="student-notes-card-actions">
                  <button
                    className="student-notes-card-action-btn student-notes-card-action-btn-edit"
                    onClick={() => handleOpenNoteModal(note)}
                    title={t('studentDetails.notes.edit')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.1022 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.1022 21.5 2.5C21.8978 2.8978 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.1022 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    className="student-notes-card-action-btn student-notes-card-action-btn-delete"
                    onClick={() => handleDeleteNote(note.id)}
                    title={t('studentDetails.notes.delete')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="student-notes-card-body">
                <p className="student-notes-card-text">{note.text}</p>
              </div>

              <div className="student-notes-card-footer">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="student-notes-card-date">{formatDate(note.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NOTE MODAL */}
      {showNoteModal && (
        <div className="student-notes-modal-overlay" onClick={handleCloseNoteModal}>
          <div className="student-notes-modal" onClick={(e) => e.stopPropagation()}>
            <div className="student-notes-modal-header">
              <h3>{selectedNote ? t('studentDetails.notes.editNote') : t('studentDetails.notes.addNote')}</h3>
              <button onClick={handleCloseNoteModal}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className="student-notes-modal-body">
              <div className="student-notes-form-group">
                <label>{t('studentDetails.notes.form.noteText')}</label>
                <textarea
                  value={noteForm.text}
                  onChange={(e) => handleFormChange(e.target.value)}
                  placeholder={t('studentDetails.notes.form.notePlaceholder')}
                  rows="8"
                  autoFocus
                />
                <div className="student-notes-form-hint">
                  {t('studentDetails.notes.form.hint')}
                </div>
              </div>
            </div>

            <div className="student-notes-modal-footer">
              <button
                className="student-notes-modal-btn student-notes-modal-btn-cancel"
                onClick={handleCloseNoteModal}
              >
                {t('studentDetails.notes.form.cancel')}
              </button>
              <button
                className="student-notes-modal-btn student-notes-modal-btn-save"
                onClick={handleSaveNote}
                disabled={!noteForm.text.trim()}
              >
                {t('studentDetails.notes.form.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};