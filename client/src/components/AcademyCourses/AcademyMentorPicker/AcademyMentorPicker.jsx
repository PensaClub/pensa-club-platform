// src/components/AcademyCourses/AcademyMentorPicker/AcademyMentorPicker.jsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademyCourses } from '../../contexts/AcademyCoursesProvider';
import './academyMentorPicker.css';

const MENTOR_ROLES = [
  { value: 'lecturer', icon: '🎓' },
  { value: 'mentor', icon: '👨‍🏫' },
  { value: 'assistant', icon: '🤝' },
  { value: 'guest', icon: '🌟' },
];

export const AcademyMentorPicker = ({
  mode = 'multi',           // 'multi' | 'single'
  selected = [],            // multi: [{mentorId, role, isLead, mentor: {id, name, photoUrl, specialization}}]
  selectedMentorId = null,
  selectedMentorObj = null, 
  onChange,                  // multi: (mentors) => void | single: (mentorId, mentor) => void
  courseMentors = [],       // single mode: limit dropdown to course mentors
  label,
  placeholder,
}) => {
  const { t } = useTranslation('academy');
    const { searchMentors: searchMentorsApi } = useAcademyCourses();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const searchTimeout = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search mentors
  const searchMentors = useCallback(async (query) => {
    if (mode === 'single' && courseMentors.length > 0) {
      const filtered = courseMentors.filter(m => {
        const name = m.mentor?.name || m.name || '';
        return name.toLowerCase().includes(query.toLowerCase());
      });
      setSearchResults(filtered.map(m => m.mentor || m));
      return;
    }

    if (query.length < 1) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const mentors = await searchMentorsApi(query, 8);
      setSearchResults(mentors);
    } catch (err) {
      console.error('Error searching mentors:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [mode, courseMentors, searchMentorsApi]);

  // Load initial list for single mode with courseMentors
  useEffect(() => {
    if (mode === 'single' && courseMentors.length > 0) {
      setSearchResults(courseMentors.map(m => m.mentor || m));
    }
  }, [mode, courseMentors]);

  // Debounced search
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (mode === 'single' && courseMentors.length > 0) {
      searchMentors(val);
      return;
    }

    searchTimeout.current = setTimeout(() => {
      searchMentors(val);
    }, 300);
  };

  // Focus on input opens dropdown
  const handleFocus = () => {
    setIsDropdownOpen(true);
    if (mode === 'single' && courseMentors.length > 0 && searchResults.length === 0) {
      searchMentors('');
    }
  };

  // Multi mode: add mentor
  const handleAddMentor = (mentor) => {
    if (selected.find(s => s.mentorId === mentor.id)) return;

    const newEntry = {
      mentorId: mentor.id,
      role: 'mentor',
      isLead: selected.length === 0, // first one is lead
      mentor: {
        id: mentor.id,
        name: mentor.name,
        photoUrl: mentor.photoUrl,
        specialization: mentor.specialization,
      },
    };

    onChange([...selected, newEntry]);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  // Multi mode: remove mentor
  const handleRemoveMentor = (mentorId) => {
    const updated = selected.filter(s => s.mentorId !== mentorId);
    // If removed the lead, make first remaining the lead
    if (updated.length > 0 && !updated.some(s => s.isLead)) {
      updated[0].isLead = true;
    }
    onChange(updated);
  };

  // Multi mode: change role
  const handleRoleChange = (mentorId, role) => {
    const updated = selected.map(s =>
      s.mentorId === mentorId ? { ...s, role } : s
    );
    onChange(updated);
  };

  // Multi mode: toggle lead
  const handleToggleLead = (mentorId) => {
    const updated = selected.map(s => ({
      ...s,
      isLead: s.mentorId === mentorId,
    }));
    onChange(updated);
  };

  // Single mode: select mentor
  const handleSelectSingle = (mentor) => {
    onChange(mentor.id, mentor);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  // Single mode: clear
  const handleClearSingle = () => {
    onChange(null, null);
  };

  // Get selected mentor for single mode
  const selectedMentor = mode === 'single' && selectedMentorId
    ? (selectedMentorObj ||
       courseMentors.find(m => (m.mentor?.id || m.id) === selectedMentorId)?.mentor ||
       courseMentors.find(m => (m.mentor?.id || m.id) === selectedMentorId) ||
       searchResults.find(m => m.id === selectedMentorId))
    : null;

  const alreadySelectedIds = selected.map(s => s.mentorId);
  const filteredResults = searchResults.filter(m => !alreadySelectedIds.includes(m.id));

  return (
    <div className="amp-picker" ref={dropdownRef}>
      {label && <label className="amp-label">{label}</label>}

      {/* Single mode: show selected or search */}
      {mode === 'single' && selectedMentor && (
        <div className="amp-selected-single">
          <img
            src={selectedMentor.photoUrl || 'https://via.placeholder.com/32'}
            alt={selectedMentor.name}
            className="amp-avatar amp-avatar--sm"
          />
          <span className="amp-selected-name">{selectedMentor.name}</span>
          <button className="amp-clear-btn" onClick={handleClearSingle} type="button">✕</button>
        </div>
      )}

      {/* Search input */}
      {(mode === 'multi' || (mode === 'single' && !selectedMentor)) && (
        <div className="amp-search-wrap">
          <input
            type="text"
            className="amp-search"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleFocus}
            placeholder={placeholder || t('academyMentorPicker.searchPlaceholder', 'Търси ментор...')}
          />
          {isSearching && <span className="amp-spinner"></span>}
        </div>
      )}

      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="amp-dropdown">
          {filteredResults.length > 0 ? (
            filteredResults.map(mentor => (
              <button
                key={mentor.id}
                className="amp-dropdown-item"
                onClick={() => mode === 'multi' ? handleAddMentor(mentor) : handleSelectSingle(mentor)}
                type="button"
              >
                <img
                  src={mentor.photoUrl || 'https://via.placeholder.com/32'}
                  alt={mentor.name}
                  className="amp-avatar amp-avatar--sm"
                />
                <div className="amp-dropdown-info">
                  <span className="amp-dropdown-name">{mentor.name}</span>
                  {mentor.specialization && (
                    <span className="amp-dropdown-spec">{mentor.specialization}</span>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="amp-dropdown-empty">
              {searchQuery.length < 1 && mode !== 'single'
                ? t('academyMentorPicker.typeToSearch', 'Въведи поне 1 символ...')
                : t('academyMentorPicker.noResults', 'Няма резултати')
              }
            </div>
          )}
        </div>
      )}

      {/* Multi mode: selected list */}
      {mode === 'multi' && selected.length > 0 && (
        <div className="amp-selected-list">
          {selected.map(entry => (
            <div key={entry.mentorId} className={`amp-selected-item ${entry.isLead ? 'amp-selected-item--lead' : ''}`}>
              <img
                src={entry.mentor?.photoUrl || 'https://via.placeholder.com/40'}
                alt={entry.mentor?.name}
                className="amp-avatar"
              />
              <div className="amp-selected-info">
                <span className="amp-selected-name">{entry.mentor?.name}</span>
                {entry.mentor?.specialization && (
                  <span className="amp-selected-spec">{entry.mentor.specialization}</span>
                )}
              </div>

              {/* Role select */}
              <select
                className="amp-role-select"
                value={entry.role}
                onChange={(e) => handleRoleChange(entry.mentorId, e.target.value)}
              >
                {MENTOR_ROLES.map(r => (
                  <option key={r.value} value={r.value}>
                    {r.icon} {t(`academyMentorPicker.roles.${r.value}`)}
                  </option>
                ))}
              </select>

              {/* Lead toggle */}
              <button
                className={`amp-lead-btn ${entry.isLead ? 'amp-lead-btn--active' : ''}`}
                onClick={() => handleToggleLead(entry.mentorId)}
                type="button"
                title={t('academyMentorPicker.setAsLead', 'Задай като водещ')}
              >
                ⭐
              </button>

              {/* Remove */}
              <button
                className="amp-remove-btn"
                onClick={() => handleRemoveMentor(entry.mentorId)}
                type="button"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};