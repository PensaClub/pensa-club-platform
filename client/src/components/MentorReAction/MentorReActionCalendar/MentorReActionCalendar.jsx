import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useReAction } from '../../contexts/ReActionProvider';
import './mentorReActionCalendar.css';

export const MentorReActionCalendar = () => {
    const { t } = useTranslation('reaction');
    const { getMentorAvailability, setMentorAvailability, getMentorAssignments } = useReAction();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [availability, setAvailability] = useState({});
    const [assignments, setAssignments] = useState([]);
    const [changedDates, setChangedDates] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = t('calendar.months', { returnObjects: true, defaultValue: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]});

    const weekdays = t('calendar.weekdays', { returnObjects: true, defaultValue: [
        'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
    ]});

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [availRes, assignRes] = await Promise.all([
                getMentorAvailability(),
                getMentorAssignments(),
            ]);

            const availMap = {};
            (availRes?.availabilities || []).forEach((item) => {
                availMap[item.date] = item.isAvailable;
            });
            setAvailability(availMap);
            setAssignments(assignRes?.assignments || []);
        } catch (error) {
            console.error('Error fetching calendar data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [getMentorAvailability, getMentorAssignments]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (y, m) => {
        const day = new Date(y, m, 1).getDay();
        return day === 0 ? 6 : day - 1; // Monday = 0
    };

    const formatDate = (y, m, d) => {
        const mm = String(m + 1).padStart(2, '0');
        const dd = String(d).padStart(2, '0');
        return `${y}-${mm}-${dd}`;
    };

    const getDateStatus = (dateStr) => {
        if (changedDates[dateStr] !== undefined) {
            return changedDates[dateStr] ? 'available' : 'unavailable';
        }
        if (availability[dateStr] === true) return 'available';
        if (availability[dateStr] === false) return 'unavailable';
        return 'unset';
    };

    const hasAssignment = (dateStr) => {
        return assignments.some((a) => a.preferredDate === dateStr);
    };

    const toggleDay = (dateStr) => {
        const currentStatus = getDateStatus(dateStr);
        const newAvailable = currentStatus !== 'available';
        setChangedDates((prev) => ({ ...prev, [dateStr]: newAvailable }));
    };

    const markAllWeekdays = () => {
        const daysInMonth = getDaysInMonth(year, month);
        const newChanges = { ...changedDates };
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const dayOfWeek = date.getDay();
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                newChanges[formatDate(year, month, d)] = true;
            }
        }
        setChangedDates(newChanges);
    };

    const clearMonth = () => {
        const daysInMonth = getDaysInMonth(year, month);
        const newChanges = { ...changedDates };
        for (let d = 1; d <= daysInMonth; d++) {
            newChanges[formatDate(year, month, d)] = false;
        }
        setChangedDates(newChanges);
    };

    const handleSave = async () => {
        if (Object.keys(changedDates).length === 0) return;
        setIsSaving(true);
        try {
            const availableDates = Object.entries(changedDates)
                .filter(([, isAvail]) => isAvail)
                .map(([date]) => date);
            const unavailableDates = Object.entries(changedDates)
                .filter(([, isAvail]) => !isAvail)
                .map(([date]) => date);

            if (availableDates.length > 0) {
                await setMentorAvailability({ dates: availableDates, isAvailable: true });
            }
            if (unavailableDates.length > 0) {
                await setMentorAvailability({ dates: unavailableDates, isAvailable: false });
            }
            setChangedDates({});
            await fetchData();
        } catch (error) {
            console.error('Error saving availability:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const navigateMonth = (direction) => {
        setCurrentDate(new Date(year, month + direction, 1));
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const cells = [];

        for (let i = 0; i < firstDay; i++) {
            cells.push(<div key={`empty-${i}`} className="mrac-day mrac-day--empty" />);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = formatDate(year, month, d);
            const status = getDateStatus(dateStr);
            const hasAssign = hasAssignment(dateStr);
            const isChanged = changedDates[dateStr] !== undefined;
            const today = new Date();
            const isToday =
                today.getFullYear() === year &&
                today.getMonth() === month &&
                today.getDate() === d;
            const isPast = new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

            cells.push(
                <button
                    key={d}
                    className={`mrac-day mrac-day--${status} ${hasAssign ? 'mrac-day--assigned' : ''} ${isChanged ? 'mrac-day--changed' : ''} ${isToday ? 'mrac-day--today' : ''} ${isPast ? 'mrac-day--past' : ''}`}
                    onClick={() => !isPast && toggleDay(dateStr)}
                    disabled={isPast}
                    title={
                        hasAssign
                            ? t('mentor.calendar.hasAssignment', 'Has assigned visit')
                            : status === 'available'
                            ? t('mentor.calendar.available', 'Available')
                            : status === 'unavailable'
                            ? t('mentor.calendar.unavailable', 'Unavailable')
                            : t('mentor.calendar.notSet', 'Not set')
                    }
                >
                    <span className="mrac-day-number">{d}</span>
                    {hasAssign && (
                        <span className="mrac-day-badge">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                        </span>
                    )}
                </button>
            );
        }

        return cells;
    };

    if (isLoading) {
        return (
            <div className="mrac-loading">
                <div className="mrac-spinner" />
                <p>{t('mentor.calendar.loading', 'Loading calendar...')}</p>
            </div>
        );
    }

    const hasChanges = Object.keys(changedDates).length > 0;

    return (
        <div className="mrac">
            {/* Bulk Actions */}
            <div className="mrac-actions">
                <button className="mrac-bulk-btn mrac-bulk-btn--weekdays" onClick={markAllWeekdays}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                    </svg>
                    {t('mentor.calendar.markWeekdays', 'Mark all weekdays as available')}
                </button>
                <button className="mrac-bulk-btn mrac-bulk-btn--clear" onClick={clearMonth}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    {t('mentor.calendar.clearMonth', 'Clear month')}
                </button>
            </div>

            {/* Calendar Header */}
            <div className="mrac-header">
                <button className="mrac-nav-btn" onClick={() => navigateMonth(-1)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <h2 className="mrac-month-title">
                    {Array.isArray(monthNames) ? monthNames[month] : month + 1} {year}
                </h2>
                <button className="mrac-nav-btn" onClick={() => navigateMonth(1)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>

            {/* Legend */}
            <div className="mrac-legend">
                <div className="mrac-legend-item">
                    <span className="mrac-legend-dot mrac-legend-dot--available" />
                    {t('mentor.calendar.legendAvailable', 'Available')}
                </div>
                <div className="mrac-legend-item">
                    <span className="mrac-legend-dot mrac-legend-dot--unavailable" />
                    {t('mentor.calendar.legendUnavailable', 'Unavailable')}
                </div>
                <div className="mrac-legend-item">
                    <span className="mrac-legend-dot mrac-legend-dot--assigned" />
                    {t('mentor.calendar.legendAssigned', 'Assigned visit')}
                </div>
                <div className="mrac-legend-item">
                    <span className="mrac-legend-dot mrac-legend-dot--unset" />
                    {t('mentor.calendar.legendUnset', 'Not set')}
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="mrac-grid">
                {(Array.isArray(weekdays) ? weekdays : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']).map((day) => (
                    <div key={day} className="mrac-weekday">{day}</div>
                ))}
                {renderCalendar()}
            </div>

            {/* Save Button */}
            {hasChanges && (
                <div className="mrac-save-bar">
                    <p className="mrac-save-info">
                        {t('mentor.calendar.unsavedChanges', '{{count}} unsaved changes', { count: Object.keys(changedDates).length })}
                    </p>
                    <button
                        className="mrac-save-btn"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving
                            ? t('mentor.calendar.saving', 'Saving...')
                            : t('mentor.calendar.save', 'Save changes')
                        }
                    </button>
                </div>
            )}
        </div>
    );
};
