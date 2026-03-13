// src/components/AdminReAction/AdminReActionCalendar/AdminReActionCalendar.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './adminReActionCalendar.css';
import { useReAction } from '../../contexts/ReActionProvider';
import { AdminReActionRequestModal } from '../AdminReActionRequestModal/AdminReActionRequestModal';
import { AdminReActionEmailModal } from '../AdminReActionEmailModal/AdminReActionEmailModal';

export const AdminReActionCalendar = ({ onRefresh }) => {
    const { t } = useTranslation('reaction');
    const { getCalendar, getAdminRequestById, updateRequest } = useReAction();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarData, setCalendarData] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [modalRequest, setModalRequest] = useState(null);
    const [modalLoading, setModalLoading] = useState(null);
    const [emailModalRequest, setEmailModalRequest] = useState(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // ===================================
    // FETCH CALENDAR DATA
    // ===================================

    const fetchCalendar = useCallback(async () => {
        setIsLoading(true);
        try {
            const dateFrom = `${year}-${String(month + 1).padStart(2, '0')}-01`;
            const lastDay = new Date(year, month + 1, 0).getDate();
            const dateTo = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
            const res = await getCalendar({ dateFrom, dateTo });

            // Transform raw requests + availabilities into days map
            const days = {};
            (res?.requests || []).forEach((r) => {
                const dateStr = r.preferredDate;
                if (!days[dateStr]) days[dateStr] = { bookings: [], availableMentors: 0, availableMentorsList: [] };
                days[dateStr].bookings.push({
                    id: r.id,
                    clubName: r.clubName,
                    city: r.city,
                    status: r.status,
                    mentorName: r.assignedMentor?.name || null,
                });
            });
            (res?.availabilities || []).forEach((a) => {
                const dateStr = a.date;
                if (!days[dateStr]) days[dateStr] = { bookings: [], availableMentors: 0, availableMentorsList: [] };
                days[dateStr].availableMentors += 1;
                if (a.mentor) {
                    days[dateStr].availableMentorsList.push({ name: a.mentor.name, id: a.mentor.id });
                }
            });
            setCalendarData({ days });
        } catch (error) {
            console.error('Error fetching calendar data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [getCalendar, year, month]);

    useEffect(() => {
        fetchCalendar();
    }, [fetchCalendar]);

    // ===================================
    // NAVIGATION
    // ===================================

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
        setSelectedDay(null);
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
        setSelectedDay(null);
    };

    // ===================================
    // QUICK EDIT MODAL
    // ===================================

    const handleOpenRequest = async (requestId) => {
        setModalLoading(requestId);
        try {
            const res = await getAdminRequestById(requestId);
            if (res?.request) {
                setModalRequest(res.request);
            }
        } catch (error) {
            console.error('Error fetching request:', error);
        } finally {
            setModalLoading(null);
        }
    };

    const handleModalSave = async (id, data) => {
        try {
            await updateRequest(id, data);
            setModalRequest(null);
            fetchCalendar();
            onRefresh();
        } catch (error) {
            console.error('Error saving request:', error);
        }
    };

    // ===================================
    // CALENDAR HELPERS
    // ===================================

    const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (y, m) => {
        const day = new Date(y, m, 1).getDay();
        return day === 0 ? 6 : day - 1; // Monday = 0
    };

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const weekdays = [
        t('admin.calendar.mon'),
        t('admin.calendar.tue'),
        t('admin.calendar.wed'),
        t('admin.calendar.thu'),
        t('admin.calendar.fri'),
        t('admin.calendar.sat'),
        t('admin.calendar.sun'),
    ];

    const monthNames = [
        t('admin.calendar.january'),
        t('admin.calendar.february'),
        t('admin.calendar.march'),
        t('admin.calendar.april'),
        t('admin.calendar.may'),
        t('admin.calendar.june'),
        t('admin.calendar.july'),
        t('admin.calendar.august'),
        t('admin.calendar.september'),
        t('admin.calendar.october'),
        t('admin.calendar.november'),
        t('admin.calendar.december'),
    ];

    // ===================================
    // DAY DATA HELPERS
    // ===================================

    const getDayData = (day) => {
        if (!calendarData || !calendarData.days) return null;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return calendarData.days[dateStr] || null;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return '#dc2626';
            case 'reviewing': return '#3b82f6';
            case 'mentor_assigned': return '#ea580c';
            case 'confirmed': return '#16a34a';
            case 'completed': return '#6b7280';
            case 'cancelled': return '#9ca3af';
            default: return '#6b7280';
        }
    };

    const getDayCellClass = (dayData) => {
        if (!dayData) return '';
        const { bookings = [], availableMentors = 0 } = dayData;
        if (bookings.length === 0 && availableMentors === 0) return 'arac-day--empty';
        if (bookings.length === 0 && availableMentors > 0) return 'arac-day--available';
        if (bookings.length > 0 && availableMentors > bookings.length) return 'arac-day--partial';
        if (bookings.length > 0 && availableMentors <= bookings.length) return 'arac-day--full';
        return '';
    };

    // ===================================
    // RENDER CALENDAR CELLS
    // ===================================

    const renderCells = () => {
        const cells = [];

        // Empty cells before first day
        for (let i = 0; i < firstDay; i++) {
            cells.push(<div key={`empty-${i}`} className="arac-day arac-day--outside"></div>);
        }

        // Day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const dayData = getDayData(day);
            const bookings = dayData?.bookings || [];
            const availableMentors = dayData?.availableMentors || 0;
            const isSelected = selectedDay === day;
            const cellClass = getDayCellClass(dayData);

            cells.push(
                <div
                    key={day}
                    className={`arac-day ${cellClass} ${isSelected ? 'arac-day--selected' : ''}`}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                >
                    <span className="arac-day-number">{day}</span>
                    {bookings.length > 0 && (
                        <div className="arac-day-dots">
                            {bookings.slice(0, 4).map((b, i) => (
                                <span
                                    key={i}
                                    className="arac-day-dot"
                                    style={{ backgroundColor: getStatusColor(b.status) }}
                                ></span>
                            ))}
                            {bookings.length > 4 && (
                                <span className="arac-day-more">+{bookings.length - 4}</span>
                            )}
                        </div>
                    )}
                    {availableMentors > 0 && (
                        <span className="arac-day-mentors">{availableMentors}</span>
                    )}
                </div>
            );
        }

        return cells;
    };

    // ===================================
    // RENDER SELECTED DAY DETAILS
    // ===================================

    const renderDayDetails = () => {
        if (!selectedDay) return null;
        const dayData = getDayData(selectedDay);
        const bookings = dayData?.bookings || [];
        const mentors = dayData?.availableMentorsList || [];

        return (
            <div className="arac-details">
                <h3 className="arac-details-title">
                    {selectedDay} {monthNames[month]} {year}
                </h3>

                {/* Bookings */}
                <div className="arac-details-section">
                    <h4 className="arac-details-label">{t('admin.calendar.bookings')}</h4>
                    {bookings.length > 0 ? (
                        <div className="arac-details-list">
                            {bookings.map((b, i) => (
                                <div key={i} className="arac-details-item">
                                    <span
                                        className="arac-details-status-dot"
                                        style={{ backgroundColor: getStatusColor(b.status) }}
                                    ></span>
                                    <div className="arac-details-item-info">
                                        <span className="arac-details-item-name">{b.clubName}</span>
                                        <span className="arac-details-item-meta">
                                            {t(`admin.statuses.${b.status}`, b.status)}
                                            {b.mentorName && ` — ${b.mentorName}`}
                                        </span>
                                    </div>
                                    <button
                                        className="arac-details-edit-btn"
                                        onClick={() => handleOpenRequest(b.id)}
                                        disabled={modalLoading === b.id}
                                        title={t('admin.calendar.editRequest')}
                                    >
                                        {modalLoading === b.id ? (
                                            <div className="arac-details-edit-spinner"></div>
                                        ) : (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="arac-details-empty">{t('admin.calendar.noBookings')}</p>
                    )}
                </div>

                {/* Available Mentors */}
                <div className="arac-details-section">
                    <h4 className="arac-details-label">{t('admin.calendar.availableMentors')}</h4>
                    {mentors.length > 0 ? (
                        <div className="arac-details-list">
                            {mentors.map((m, i) => (
                                <div key={i} className="arac-details-item">
                                    <span className="arac-details-mentor-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                    </span>
                                    <div className="arac-details-item-info">
                                        <span className="arac-details-item-name">{m.name}</span>
                                        <span className="arac-details-item-meta">{m.city}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="arac-details-empty">{t('admin.calendar.noMentors')}</p>
                    )}
                </div>
            </div>
        );
    };

    // ===================================
    // RENDER
    // ===================================

    if (isLoading) {
        return (
            <div className="arac">
                <div className="arac-loading">
                    <div className="arac-spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="arac">
            {/* HEADER */}
            <div className="arac-header">
                <h2 className="arac-title">{t('admin.calendar.title')}</h2>
            </div>

            {/* MONTH NAVIGATION */}
            <div className="arac-nav">
                <button className="arac-nav-btn" onClick={handlePrevMonth}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <span className="arac-nav-label">{monthNames[month]} {year}</span>
                <button className="arac-nav-btn" onClick={handleNextMonth}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>

            {/* LEGEND */}
            <div className="arac-legend">
                <span className="arac-legend-item">
                    <span className="arac-legend-swatch arac-legend-swatch--available"></span>
                    {t('admin.calendar.legendAvailable')}
                </span>
                <span className="arac-legend-item">
                    <span className="arac-legend-swatch arac-legend-swatch--partial"></span>
                    {t('admin.calendar.legendPartial')}
                </span>
                <span className="arac-legend-item">
                    <span className="arac-legend-swatch arac-legend-swatch--full"></span>
                    {t('admin.calendar.legendFull')}
                </span>
            </div>

            {/* CALENDAR GRID (desktop) */}
            <div className="arac-grid-wrapper">
                <div className="arac-grid">
                    {/* Weekday headers */}
                    {weekdays.map((wd) => (
                        <div key={wd} className="arac-weekday">{wd}</div>
                    ))}
                    {/* Day cells */}
                    {renderCells()}
                </div>
            </div>

            {/* MOBILE LIST VIEW */}
            <div className="arac-mobile-list">
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const dayData = getDayData(day);
                    const bookings = dayData?.bookings || [];
                    const availableMentors = dayData?.availableMentors || 0;
                    if (bookings.length === 0 && availableMentors === 0) return null;

                    return (
                        <div
                            key={day}
                            className={`arac-mobile-day ${selectedDay === day ? 'arac-mobile-day--selected' : ''}`}
                            onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                        >
                            <div className="arac-mobile-day-header">
                                <span className="arac-mobile-day-number">{day} {monthNames[month]}</span>
                                <div className="arac-mobile-day-badges">
                                    {bookings.length > 0 && (
                                        <span className="arac-mobile-badge arac-mobile-badge--bookings">
                                            {bookings.length} {t('admin.calendar.bookings')}
                                        </span>
                                    )}
                                    {availableMentors > 0 && (
                                        <span className="arac-mobile-badge arac-mobile-badge--mentors">
                                            {availableMentors} {t('admin.calendar.mentors')}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {selectedDay === day && (
                                <div className="arac-mobile-day-details">
                                    {bookings.map((b, i) => (
                                        <div key={i} className="arac-mobile-booking">
                                            <span
                                                className="arac-details-status-dot"
                                                style={{ backgroundColor: getStatusColor(b.status) }}
                                            ></span>
                                            <span>{b.clubName}</span>
                                            <span className="arac-mobile-booking-status">
                                                {t(`admin.statuses.${b.status}`, b.status)}
                                            </span>
                                            <button
                                                className="arac-details-edit-btn"
                                                onClick={(e) => { e.stopPropagation(); handleOpenRequest(b.id); }}
                                                disabled={modalLoading === b.id}
                                                title={t('admin.calendar.editRequest')}
                                            >
                                                {modalLoading === b.id ? (
                                                    <div className="arac-details-edit-spinner"></div>
                                                ) : (
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* SELECTED DAY DETAILS (desktop) */}
            {renderDayDetails()}

            {/* REQUEST MODAL */}
            {modalRequest && (
                <AdminReActionRequestModal
                    request={modalRequest}
                    onClose={() => setModalRequest(null)}
                    onSave={handleModalSave}
                    onSendEmail={(request) => {
                        setEmailModalRequest(request);
                    }}
                    onRefresh={() => {
                        fetchCalendar();
                        onRefresh();
                    }}
                />
            )}

            {/* EMAIL MODAL */}
            {emailModalRequest && (
                <AdminReActionEmailModal
                    request={emailModalRequest}
                    onClose={() => setEmailModalRequest(null)}
                />
            )}
        </div>
    );
};
