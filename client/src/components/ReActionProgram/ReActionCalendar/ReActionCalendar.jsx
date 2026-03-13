import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useReAction } from '../../contexts/ReActionProvider';
import './reActionCalendar.css';

const ReActionCalendar = ({ selectedDate, onDateSelect }) => {
  const { t } = useTranslation('reaction');
  const { getAvailability } = useReAction();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(false);

  const months = t('calendar.months', { returnObjects: true });
  const weekdays = t('calendar.weekdays', { returnObjects: true });

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const response = await getAvailability({
          month: currentMonth + 1,
          year: currentYear,
        });
        setAvailableDates(response?.availability || []);
      } catch {
        setAvailableDates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, [currentMonth, currentYear]);

  const availableMap = useMemo(() => {
    const map = {};
    for (const d of availableDates) {
      const date = d.date || d;
      map[date] = d.availableSlots || 1;
    }
    return map;
  }, [availableDates]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  // Monday = 0, Sunday = 6
  const firstDayOfWeek = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;

  const handlePrev = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNext = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const formatDateString = (day) => {
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${currentYear}-${mm}-${dd}`;
  };

  const isPast = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    return date < today;
  };

  const isAvailable = (day) => {
    const dateStr = formatDateString(day);
    return dateStr in availableMap;
  };

  const getSlots = (day) => {
    return availableMap[formatDateString(day)] || 0;
  };

  const isSelected = (day) => {
    return selectedDate === formatDateString(day);
  };

  const handleDayClick = (day) => {
    if (isPast(day)) return;
    if (!isAvailable(day)) return;
    onDateSelect(formatDateString(day));
  };

  // Cannot go before current month
  const canGoPrev = currentYear > today.getFullYear() ||
    (currentYear === today.getFullYear() && currentMonth > today.getMonth());

  const cells = [];
  // Empty cells before first day
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(<div key={`empty-${i}`} className="rac-cell rac-cell--empty"></div>);
  }
  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const past = isPast(day);
    const available = isAvailable(day);
    const selected = isSelected(day);
    const slots = getSlots(day);

    let className = 'rac-cell';
    if (past) className += ' rac-cell--past';
    else if (selected) className += ' rac-cell--selected';
    else if (available) className += ' rac-cell--available';
    else className += ' rac-cell--unavailable';

    const title = past ? '' :
      selected ? t('calendar.selected') :
      available ? t('calendar.mentorsAvailable', { count: slots }) :
      t('calendar.unavailable');

    cells.push(
      <button
        key={day}
        className={className}
        onClick={() => handleDayClick(day)}
        disabled={past || !available}
        title={title}
        type="button"
      >
        <span className="rac-day">{day}</span>
        {!past && available && !selected && (
          <span className="rac-slots">{slots}</span>
        )}
      </button>
    );
  }

  const hasAvailable = !loading && Array.from({ length: daysInMonth }, (_, i) => i + 1)
    .some((day) => !isPast(day) && isAvailable(day));

  return (
    <div className="rac">
      <div className="rac-header">
        <button
          className="rac-nav"
          onClick={handlePrev}
          disabled={!canGoPrev}
          type="button"
          aria-label="Previous month"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="rac-month-label">
          {Array.isArray(months) ? months[currentMonth] : ''} {currentYear}
        </span>
        <button
          className="rac-nav"
          onClick={handleNext}
          type="button"
          aria-label="Next month"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="rac-weekdays">
        {Array.isArray(weekdays) && weekdays.map((wd) => (
          <div key={wd} className="rac-weekday">{wd}</div>
        ))}
      </div>

      <div className="rac-grid">
        {loading ? (
          <div className="rac-loading">
            <div className="rac-spinner"></div>
          </div>
        ) : (
          cells
        )}
      </div>

      {!loading && !hasAvailable && (
        <p className="rac-no-availability">{t('calendar.noAvailability')}</p>
      )}

      <div className="rac-legend">
        <div className="rac-legend-item">
          <span className="rac-legend-dot rac-legend-dot--available"></span>
          <span>{t('calendar.available')}</span>
        </div>
        <div className="rac-legend-item">
          <span className="rac-legend-dot rac-legend-dot--selected"></span>
          <span>{t('calendar.selected')}</span>
        </div>
        <div className="rac-legend-item">
          <span className="rac-legend-dot rac-legend-dot--unavailable"></span>
          <span>{t('calendar.unavailable')}</span>
        </div>
      </div>
    </div>
  );
};

export default ReActionCalendar;
