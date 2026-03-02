// client/src/components/DigiMentorPanel/StudentDetails/StudentScheduleTab.jsx

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../../contexts/AcademyProvider';
import './studentScheduleTab.css';

export const StudentScheduleTab = ({ student }) => {
    const { t } = useTranslation('digibridge-mentor');
    const { 
      getMentorMeetings, 
      createMentorMeeting, 
      updateMentorMeeting, 
      deleteMentorMeeting
    } = useAcademy();
    
    const [allEvents, setAllEvents] = useState([]);
    const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
    const [currentMonthStart, setCurrentMonthStart] = useState(getMonthStart(new Date()));
    const [activeFilter, setActiveFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const [showMeetingModal, setShowMeetingModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [meetingForm, setMeetingForm] = useState({
        title: '',
        date: '',
        time: '',
        duration: 60,
        type: 'online',
        notes: ''
    });

    useEffect(() => {
        loadSchedule();
    }, []);

    function getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    function getMonthStart(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    }

    function getWeekDays(startDate) {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + i);
            days.push(day);
        }
        return days;
    }

    function getMonthDays(startDate) {
        const year = startDate.getFullYear();
        const month = startDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];
        const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

        for (let i = startDay - 1; i >= 0; i--) {
            const day = new Date(year, month, -i);
            days.push({ date: day, isCurrentMonth: false });
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            const day = new Date(year, month, i);
            days.push({ date: day, isCurrentMonth: true });
        }

        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            const day = new Date(year, month + 1, i);
            days.push({ date: day, isCurrentMonth: false });
        }

        return days;
    }

    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    function isToday(date) {
        const today = new Date();
        return formatDate(date) === formatDate(today);
    }

    const loadSchedule = async () => {
      setIsLoading(true);

      try {
        const result = await getMentorMeetings();
        
        if (result.success) {
          const studentMeetings = result.meetings.filter(m => m.studentId === student.id);
          
          // ✅ Transform meetings to events
          const events = studentMeetings.map(meeting => ({
            id: `meeting-${meeting.id}`,
            type: 'mentor_meeting',
            title: meeting.title,
            date: meeting.meetingDate,  
            time: meeting.meetingTime,  
            duration: meeting.duration, 
            notes: meeting.notes,
            status: meeting.status,
            canEdit: true,
            meetingData: meeting
          }));
          
          setAllEvents(events);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading schedule:', error);
        setIsLoading(false);
      }
    };

    const handlePreviousWeek = () => {
        const newStart = new Date(currentWeekStart);
        newStart.setDate(newStart.getDate() - 7);
        setCurrentWeekStart(newStart);
    };

    const handleNextWeek = () => {
        const newStart = new Date(currentWeekStart);
        newStart.setDate(newStart.getDate() + 7);
        setCurrentWeekStart(newStart);
    };

    const handlePreviousMonth = () => {
        const newStart = new Date(currentMonthStart);
        newStart.setMonth(newStart.getMonth() - 1);
        setCurrentMonthStart(newStart);
    };

    const handleNextMonth = () => {
        const newStart = new Date(currentMonthStart);
        newStart.setMonth(newStart.getMonth() + 1);
        setCurrentMonthStart(newStart);
    };

    const handleToday = () => {
        const today = new Date();
        setCurrentWeekStart(getWeekStart(today));
        setCurrentMonthStart(getMonthStart(today));
    };

    const handleMiniCalendarDayClick = (date) => {
        setCurrentWeekStart(getWeekStart(date));
    };

    const handleDayClick = (date) => {
        setMeetingForm({
            title: '',
            date: formatDate(date),
            time: '10:00',
            duration: 60,
            type: 'online',
            notes: ''
        });
        setSelectedMeeting(null);
        setShowMeetingModal(true);
    };

    const handleEventClick = (event) => {
        setSelectedMeeting(event);
        setShowViewModal(true);
    };

    const handleEditFromView = () => {
        setMeetingForm({
            title: selectedMeeting.title,
            date: selectedMeeting.date,
            time: selectedMeeting.time,
            duration: selectedMeeting.duration || 60,
            type: selectedMeeting.meetingData?.meetingType || 'online',
            notes: selectedMeeting.notes || ''
        });
        setShowViewModal(false);
        setShowMeetingModal(true);
    };

    const handleCloseMeetingModal = () => {
        setShowMeetingModal(false);
        setShowViewModal(false);
        setSelectedMeeting(null);
        setMeetingForm({
            title: '',
            date: '',
            time: '',
            duration: 60,
            type: 'online',
            notes: ''
        });
    };

    const handleFormChange = (field, value) => {
        setMeetingForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveMeeting = async () => {
      try {
        const meetingData = {
          studentId: student.id,
          title: meetingForm.title,
          meetingDate: meetingForm.date,
          meetingTime: meetingForm.time,
          duration: meetingForm.duration,
          meetingType: meetingForm.type,
          notes: meetingForm.notes
        };

        if (selectedMeeting) {
          await updateMentorMeeting(selectedMeeting.meetingData.id, meetingData);
        } else {
          await createMentorMeeting(meetingData);
        }
        
        await loadSchedule();
        handleCloseMeetingModal();
      } catch (error) {
        console.error('Error saving meeting:', error);
      }
    };

    const handleDeleteMeeting = async (meetingId) => {
      if (!window.confirm(t('studentDetails.schedule.confirmDelete'))) return;

      try {
        await deleteMentorMeeting(meetingId);
        await loadSchedule();
        handleCloseMeetingModal();
      } catch (error) {
        console.error('Error deleting meeting:', error);
      }
    };

    const getEventIcon = (type) => {
        const icons = {
            course_lesson: '📚',
            mentor_meeting: '📅',
            lecture: '🎓',
            seminar: '🎯',
            presentation: '📊'
        };
        return icons[type] || '📝';
    };

    const getEventColor = (type) => {
        const colors = {
            course_lesson: { bg: '#dbeafe', border: '#2563eb' },
            mentor_meeting: { bg: '#fce7f3', border: '#db2777' },
            lecture: { bg: '#fef3c7', border: '#d97706' },
            seminar: { bg: '#d1fae5', border: '#059669' },
            presentation: { bg: '#e0e7ff', border: '#6366f1' }
        };
        return colors[type] || { bg: '#f3f4f6', border: '#9ca3af' };
    };

    const getEventsForDay = (date) => {
        const dateStr = formatDate(date);
        const dayEvents = allEvents.filter(event => event.date === dateStr);

        if (activeFilter === 'all') {
            return dayEvents;
        }
        return dayEvents.filter(event => event.type === activeFilter);
    };

    const hasEventsOnDay = (date) => {
        const dateStr = formatDate(date);
        return allEvents.some(event => event.date === dateStr);
    };

    const weekDays = getWeekDays(currentWeekStart);
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const monthDays = getMonthDays(currentMonthStart);

    if (!student) return null;

    return (
        <div className="student-schedule-tab">
            {/* HEADER */}
            <div className="student-schedule-header">
                <h3 className="student-schedule-title">
                    🗓️ {t('studentDetails.schedule.title')}
                </h3>

                <button
                    className="student-schedule-add-btn"
                    onClick={() => handleDayClick(new Date())}
                >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {t('studentDetails.schedule.addMeeting')}
                </button>
            </div>

            <div className="student-schedule-content-grid">
                {/* LEFT: MINI CALENDAR */}
                <div className="student-schedule-mini-calendar">
                    <div className="student-schedule-mini-header">
                        <button onClick={handlePreviousMonth}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <span>
                            {currentMonthStart.toLocaleDateString('bg-BG', { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={handleNextMonth}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>

                    <div className="student-schedule-mini-weekdays">
                        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map(day => (
                            <div key={day} className="student-schedule-mini-weekday">{day}</div>
                        ))}
                    </div>

                    <div className="student-schedule-mini-grid">
                        {monthDays.map((item, index) => {
                            const hasEvents = hasEventsOnDay(item.date);
                            const isTodayDate = isToday(item.date);

                            return (
                                <div
                                    key={index}
                                    className={`student-schedule-mini-day 
                    ${!item.isCurrentMonth ? 'student-schedule-mini-day-other' : ''} 
                    ${isTodayDate ? 'student-schedule-mini-day-today' : ''}
                    ${hasEvents ? 'student-schedule-mini-day-has-events' : ''}`}
                                    onClick={() => handleMiniCalendarDayClick(item.date)}
                                >
                                    <span>{item.date.getDate()}</span>
                                    {hasEvents && <div className="student-schedule-mini-dot"></div>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT: MAIN CONTENT */}
                <div className="student-schedule-main-content">
                    {/* LEGEND & FILTERS */}
                    <div className="student-schedule-legend">
                        <button
                            className={`student-schedule-legend-item ${activeFilter === 'all' ? 'student-schedule-legend-item-active' : ''}`}
                            onClick={() => setActiveFilter('all')}
                        >
                            <span className="student-schedule-legend-icon" style={{ background: '#f3f4f6' }}>🎯</span>
                            <span className="student-schedule-legend-label">{t('studentDetails.schedule.all')}</span>
                        </button>
                        <button
                            className={`student-schedule-legend-item ${activeFilter === 'mentor_meeting' ? 'student-schedule-legend-item-active' : ''}`}
                            onClick={() => setActiveFilter('mentor_meeting')}
                        >
                            <span className="student-schedule-legend-icon" style={{ background: '#fce7f3' }}>📅</span>
                            <span className="student-schedule-legend-label">{t('studentDetails.schedule.mentor_meeting')}</span>
                        </button>
                    </div>

                    {/* CALENDAR NAVIGATION */}
                    <div className="student-schedule-navigation">
                        <button className="student-schedule-nav-btn" onClick={handlePreviousWeek}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        <div className="student-schedule-week-range">
                            <span>{currentWeekStart.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })}</span>
                            <span>—</span>
                            <span>{weekEnd.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>

                        <button className="student-schedule-today-btn" onClick={handleToday}>
                            {t('studentDetails.schedule.today')}
                        </button>

                        <button className="student-schedule-nav-btn" onClick={handleNextWeek}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>

                    {/* CALENDAR GRID */}
                    {isLoading ? (
                        <div className="student-schedule-loading">
                            <p>{t('studentDetails.schedule.loading')}</p>
                        </div>
                    ) : (
                        <div className="student-schedule-calendar">
                            <div className="student-schedule-week-headers">
                                {weekDays.map((day, index) => (
                                    <div
                                        key={index}
                                        className={`student-schedule-day-header ${isToday(day) ? 'student-schedule-day-header-today' : ''}`}
                                    >
                                        <div className="student-schedule-day-name">
                                            {day.toLocaleDateString('bg-BG', { weekday: 'short' })}
                                        </div>
                                        <div className="student-schedule-day-number">
                                            {day.getDate()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="student-schedule-week-grid">
                                {weekDays.map((day, index) => {
                                    const dayEvents = getEventsForDay(day);
                                    return (
                                        <div
                                            key={index}
                                            className={`student-schedule-day-cell ${isToday(day) ? 'student-schedule-day-cell-today' : ''}`}
                                            onClick={() => handleDayClick(day)}
                                        >
                                            {dayEvents.length === 0 ? (
                                                <div className="student-schedule-day-empty">
                                                    <span>+</span>
                                                </div>
                                            ) : (
                                                <div className="student-schedule-day-events">
                                                    {dayEvents.map(event => {
                                                        const colors = getEventColor(event.type);
                                                        return (
                                                            <div
                                                                key={event.id}
                                                                className="student-schedule-event-chip"
                                                                style={{
                                                                    background: colors.bg,
                                                                    borderLeft: `3px solid ${colors.border}`
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEventClick(event);
                                                                }}
                                                            >
                                                                <span className="student-schedule-event-chip-icon">
                                                                    {getEventIcon(event.type)}
                                                                </span>
                                                                <div className="student-schedule-event-chip-content">
                                                                    <div className="student-schedule-event-chip-time">{event.time}</div>
                                                                    <div className="student-schedule-event-chip-title">{event.title}</div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* VIEW MODAL */}
            {showViewModal && selectedMeeting && (
                <div className="student-schedule-modal-overlay" onClick={handleCloseMeetingModal}>
                    <div className="student-schedule-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="student-schedule-modal-header">
                            <h3>{selectedMeeting.title}</h3>
                            <button onClick={handleCloseMeetingModal}>
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>

                        <div className="student-schedule-modal-body">
                            <div className="student-schedule-view-row">
                                <div className="student-schedule-view-label">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {t('studentDetails.schedule.form.date')}
                                </div>
                                <div className="student-schedule-view-value">
                                    {new Date(selectedMeeting.date).toLocaleDateString('bg-BG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>

                            <div className="student-schedule-view-row">
                                <div className="student-schedule-view-label">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {t('studentDetails.schedule.form.time')}
                                </div>
                                <div className="student-schedule-view-value">
                                    {selectedMeeting.time}
                                </div>
                            </div>

                            {selectedMeeting.duration && (
                                <div className="student-schedule-view-row">
                                    <div className="student-schedule-view-label">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        {t('studentDetails.schedule.form.duration')}
                                    </div>
                                    <div className="student-schedule-view-value">
                                        {selectedMeeting.duration} {t('studentDetails.schedule.minutes')}
                                    </div>
                                </div>
                            )}

                            <div className="student-schedule-view-row">
                                <div className="student-schedule-view-label">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7 20L2 17V11L7 8M7 20L12 23L17 20M7 20V14M17 20L22 17V11L17 8M17 20V14M17 8L12 5L7 8M17 8V14M7 8V14M7 14L12 17L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {t('studentDetails.schedule.form.type')}
                                </div>
                                <div className="student-schedule-view-value">
                                    {t(`studentDetails.schedule.form.type${(selectedMeeting.meetingData?.meetingType || 'online').charAt(0).toUpperCase() + (selectedMeeting.meetingData?.meetingType || 'online').slice(1)}`)}
                                </div>
                            </div>

                            {selectedMeeting.notes && (
                                <div className="student-schedule-view-section">
                                    <div className="student-schedule-view-label">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        {t('studentDetails.schedule.form.notes')}
                                    </div>
                                    <div className="student-schedule-view-notes">
                                        {selectedMeeting.notes}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="student-schedule-modal-footer">
                            {selectedMeeting.canEdit && (
                                <button
                                    className="student-schedule-modal-btn student-schedule-modal-btn-delete"
                                    onClick={() => handleDeleteMeeting(selectedMeeting.meetingData?.id)}
                                >
                                    {t('studentDetails.schedule.delete')}
                                </button>
                            )}
                            <div className="student-schedule-modal-footer-actions">
                                <button
                                    className="student-schedule-modal-btn student-schedule-modal-btn-cancel"
                                    onClick={handleCloseMeetingModal}
                                >
                                    {t('studentDetails.schedule.close')}
                                </button>
                                {selectedMeeting.canEdit && (
                                    <button
                                        className="student-schedule-modal-btn student-schedule-modal-btn-save"
                                        onClick={handleEditFromView}
                                    >
                                        {t('studentDetails.schedule.edit')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {showMeetingModal && (
                <div className="student-schedule-modal-overlay" onClick={handleCloseMeetingModal}>
                    <div className="student-schedule-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="student-schedule-modal-header">
                            <h3>{selectedMeeting ? t('studentDetails.schedule.editMeeting') : t('studentDetails.schedule.addMeeting')}</h3>
                            <button onClick={handleCloseMeetingModal}>
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>

                        <div className="student-schedule-modal-body">
                            <div className="student-schedule-form-group">
                                <label>{t('studentDetails.schedule.form.title')}</label>
                                <input
                                    type="text"
                                    value={meetingForm.title}
                                    onChange={(e) => handleFormChange('title', e.target.value)}
                                    placeholder={t('studentDetails.schedule.form.titlePlaceholder')}
                                />
                            </div>

                            <div className="student-schedule-form-row">
                                <div className="student-schedule-form-group">
                                    <label>{t('studentDetails.schedule.form.date')}</label>
                                    <input
                                        type="date"
                                        value={meetingForm.date}
                                        onChange={(e) => handleFormChange('date', e.target.value)}
                                    />
                                </div>

                                <div className="student-schedule-form-group">
                                    <label>{t('studentDetails.schedule.form.time')}</label>
                                    <input
                                        type="time"
                                        value={meetingForm.time}
                                        onChange={(e) => handleFormChange('time', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="student-schedule-form-row">
                                <div className="student-schedule-form-group">
                                    <label>{t('studentDetails.schedule.form.duration')}</label>
                                    <input
                                        type="number"
                                        value={meetingForm.duration}
                                        onChange={(e) => handleFormChange('duration', parseInt(e.target.value))}
                                        min="15"
                                        step="15"
                                    />
                                </div>

                                <div className="student-schedule-form-group">
                                    <label>{t('studentDetails.schedule.form.type')}</label>
                                    <select
                                        value={meetingForm.type}
                                        onChange={(e) => handleFormChange('type', e.target.value)}
                                    >
                                        <option value="online">{t('studentDetails.schedule.form.typeOnline')}</option>
                                        <option value="phone">{t('studentDetails.schedule.form.typePhone')}</option>
                                        <option value="in_person">{t('studentDetails.schedule.form.typeInPerson')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="student-schedule-form-group">
                                <label>{t('studentDetails.schedule.form.notes')}</label>
                                <textarea
                                    value={meetingForm.notes}
                                    onChange={(e) => handleFormChange('notes', e.target.value)}
                                    placeholder={t('studentDetails.schedule.form.notesPlaceholder')}
                                    rows="4"
                                />
                            </div>
                        </div>

                        <div className="student-schedule-modal-footer">
                            {selectedMeeting && (
                                <button
                                    className="student-schedule-modal-btn student-schedule-modal-btn-delete"
                                    onClick={() => handleDeleteMeeting(selectedMeeting.meetingData?.id)}
                                >
                                    {t('studentDetails.schedule.delete')}
                                </button>
                            )}
                            <div className="student-schedule-modal-footer-actions">
                                <button
                                    className="student-schedule-modal-btn student-schedule-modal-btn-cancel"
                                    onClick={handleCloseMeetingModal}
                                >
                                    {t('studentDetails.schedule.form.cancel')}
                                </button>
                                <button
                                    className="student-schedule-modal-btn student-schedule-modal-btn-save"
                                    onClick={handleSaveMeeting}
                                    disabled={!meetingForm.title || !meetingForm.date || !meetingForm.time}
                                >
                                    {t('studentDetails.schedule.form.save')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};