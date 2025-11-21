// client/src/components/DigiMentorPanel/DigiMentorStudentsList/DigiMentorStudentsList.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../../contexts/AcademyProvider';
import './digiMentorStudentsList.css';

export const DigiMentorStudentsList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const { getMentorStudents } = useAcademy();
  
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);

      const result = await getMentorStudents();
      
      if (result.success) {
        setStudents(result.students);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setIsLoading(false);
    }
  };

  const handleViewStudent = (studentId) => {
    navigate(`/profile/mentor-dashboard/students/${studentId}`);
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
        <div className="digi-mentor-students-list-loading">
          <p>{t('digiMentorStudentsList.loading')}</p>
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
                {student.email && (
                  <p className="digi-mentor-students-list-student-email">{student.email}</p>
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