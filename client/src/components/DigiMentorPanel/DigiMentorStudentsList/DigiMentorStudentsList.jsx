// client/src/components/DigiMentorPanel/DigiMentorStudentsList/DigiMentorStudentsList.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../../contexts/AcademyProvider';
import { Loader } from '../../Loader/Loader';
import './digiMentorStudentsList.css';

export const DigiMentorStudentsList = () => {
  const { t } = useTranslation('digibridge-mentor');
  const navigate = useNavigate();
  
  const { getMentorStudents } = useAcademy();
  
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getMentorStudents();
      
      if (result.success) {
        setStudents(result.students || []);
      } else {
        setError(result.message || 'Failed to load students');
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students');
      setIsLoading(false);
    }
  };

  const handleViewStudent = (studentId) => {
    navigate(`/mentor/students/${studentId}/details`);
  };

  const handleMessageStudent = (studentId) => {
    // ✅ TODO: Navigate to chat or open chat modal
    console.log('Message student:', studentId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'gray';
      case 'completed': return 'blue';
      case 'graduated': return 'purple';
      case 'suspended': return 'red';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status) => {
    return t(`digiMentorStudentsList.status.${status}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="digi-mentor-students-list">
        <h2 className="digi-mentor-students-list-title">
          {t('digiMentorStudentsList.title')}
        </h2>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="digi-mentor-students-list">
        <h2 className="digi-mentor-students-list-title">
          {t('digiMentorStudentsList.title')}
        </h2>
        <div className="digi-mentor-students-list-error">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>{error}</p>
          <button onClick={fetchStudents}>
            {t('digiMentorStudentsList.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="digi-mentor-students-list">
        <h2 className="digi-mentor-students-list-title">
          {t('digiMentorStudentsList.title')}
        </h2>
        <div className="digi-mentor-students-list-empty">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 20C17 18.3431 14.7614 17 12 17C9.23858 17 7 18.3431 7 20M21 17C21 15.7635 19.7085 14.7012 18 14.25M3 17C3 15.7635 4.29153 14.7012 6 14.25M18 10.5C19.1046 10.5 20 9.60457 20 8.5C20 7.39543 19.1046 6.5 18 6.5M6 10.5C4.89543 10.5 4 9.60457 4 8.5C4 7.39543 4.89543 6.5 6 6.5M12 14C10.3431 14 9 12.6569 9 11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11C15 12.6569 13.6569 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>{t('digiMentorStudentsList.noStudents')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="digi-mentor-students-list">
      <div className="digi-mentor-students-list-header">
        <h2 className="digi-mentor-students-list-title">
          {t('digiMentorStudentsList.title')}
        </h2>
        <span className="digi-mentor-students-list-count">
          {filteredStudents.length} {t('digiMentorStudentsList.studentsCount')}
        </span>
      </div>

      {/* FILTERS */}
      <div className="digi-mentor-students-list-filters">
        <div className="digi-mentor-students-list-search">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="text"
            placeholder={t('digiMentorStudentsList.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="digi-mentor-students-list-search-input"
          />
        </div>

        <div className="digi-mentor-students-list-filter-buttons">
          <button
            className={`digi-mentor-students-list-filter-btn ${filterStatus === 'all' ? 'digi-mentor-students-list-filter-btn-active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            {t('digiMentorStudentsList.filters.all')}
          </button>
          <button
            className={`digi-mentor-students-list-filter-btn ${filterStatus === 'active' ? 'digi-mentor-students-list-filter-btn-active' : ''}`}
            onClick={() => setFilterStatus('active')}
          >
            {t('digiMentorStudentsList.filters.active')}
          </button>
          <button
            className={`digi-mentor-students-list-filter-btn ${filterStatus === 'inactive' ? 'digi-mentor-students-list-filter-btn-active' : ''}`}
            onClick={() => setFilterStatus('inactive')}
          >
            {t('digiMentorStudentsList.filters.inactive')}
          </button>
          <button
            className={`digi-mentor-students-list-filter-btn ${filterStatus === 'graduated' ? 'digi-mentor-students-list-filter-btn-active' : ''}`}
            onClick={() => setFilterStatus('graduated')}
          >
            {t('digiMentorStudentsList.filters.graduated')}
          </button>
        </div>
      </div>

      {/* STUDENTS GRID */}
      {filteredStudents.length === 0 ? (
        <div className="digi-mentor-students-list-no-results">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>{t('digiMentorStudentsList.noResults')}</p>
        </div>
      ) : (
        <div className="digi-mentor-students-list-grid">
          {filteredStudents.map((student) => (
            <div key={student.id} className="digi-mentor-students-list-card">
              <div className="digi-mentor-students-list-card-header">
                <div className="digi-mentor-students-list-avatar">
                  {student.avatar ? (
                    <img src={student.avatar} alt={student.name} />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 20C17 18.3431 14.7614 17 12 17C9.23858 17 7 18.3431 7 20M12 14C10.3431 14 9 12.6569 9 11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11C15 12.6569 13.6569 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className={`digi-mentor-students-list-status digi-mentor-students-list-status-${getStatusColor(student.status)}`}>
                  {getStatusLabel(student.status)}
                </span>
              </div>

              <div className="digi-mentor-students-list-card-body">
                <h3 className="digi-mentor-students-list-student-name">{student.name}</h3>
                
                {/* EMAIL */}
                {student.email && (
                  <p className="digi-mentor-students-list-student-contact">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {student.email}
                  </p>
                )}

                {/* PHONE */}
                {student.phone && (
                  <p className="digi-mentor-students-list-student-contact">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.06925 12.9612 11.0388 14.9308 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {student.phone}
                  </p>
                )}

                {/* REGISTRATION DATE */}
                {student.registrationDate && (
                  <p className="digi-mentor-students-list-student-contact">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {t('digiMentorStudentsList.registeredOn')}: {formatDate(student.registrationDate)}
                  </p>
                )}
              </div>

              <div className="digi-mentor-students-list-card-stats">
                <div className="digi-mentor-students-list-stat-item">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{student.attendance || 0} {t('digiMentorStudentsList.sessions')}</span>
                </div>
                <div className="digi-mentor-students-list-stat-item">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{student.totalCredits || 0} 💎</span>
                </div>
              </div>

              <div className="digi-mentor-students-list-card-footer">
                <button 
                  className="digi-mentor-students-list-btn digi-mentor-students-list-btn-primary"
                  onClick={() => handleMessageStudent(student.id)}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 10H16M8 14H11M6 20L3 17V7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7V15C21 16.1046 20.1046 17 19 17H9L6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t('digiMentorStudentsList.message')}
                </button>
                <button 
                  className="digi-mentor-students-list-btn digi-mentor-students-list-btn-secondary"
                  onClick={() => handleViewStudent(student.id)}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2.45801 12C3.73201 7.94288 7.52257 5 12 5C16.4774 5 20.268 7.94288 21.542 12C20.268 16.0571 16.4774 19 12 19C7.52257 19 3.73201 16.0571 2.45801 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t('digiMentorStudentsList.viewProfile')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};