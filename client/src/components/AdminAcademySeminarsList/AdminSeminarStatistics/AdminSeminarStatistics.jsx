// src/components/AdminAcademySeminarsList/AdminSeminarStatistics/AdminSeminarStatistics.jsx
// Prefix: asst-

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAcademyCourses } from '../../contexts/AcademyCoursesProvider';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Minus, Users, Monitor, MapPin,
  Award, ChevronDown, ChevronUp, Search, XCircle, CheckCircle, Mail, Download,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import ScrollToTop from '../../ScrollToTop/ScrollToTop';
import SeminarEmailModal from './SeminarEmailModal';
import './adminSeminarStatistics.css';

const PERIODS = [
  { key: '7', label: '7 дни' },
  { key: '30', label: '30 дни' },
  { key: '180', label: '6 месеца' },
  { key: '365', label: '1 година' },
  { key: 'all', label: 'Всички' },
];

const TYPE_FILTERS = [
  { key: 'all', label: 'Всички' },
  { key: 'inperson', label: 'Присъствени' },
  { key: 'online', label: 'Онлайн' },
];

const STATUS_FILTERS = [
  { key: 'all', label: 'Всички' },
  { key: 'scheduled', label: 'Насрочени' },
  { key: 'completed', label: 'Приключили' },
  { key: 'cancelled', label: 'Отменени' },
  { key: 'live', label: 'На живо' },
];

const CHART_COLORS = {
  dark: {
    seminars: '#d4a853',
    registered: '#2cb5a0',
    guests: '#8b2040',
    total: '#8b6cc1',
    grid: '#333',
    axis: '#888',
    tooltipBg: '#1e1e24',
    tooltipBorder: '#333',
    tooltipText: '#ddd',
  },
  light: {
    seminars: '#b8860b',
    registered: '#0d7377',
    guests: '#9b1b30',
    total: '#6b4c9a',
    grid: '#e0e0e0',
    axis: '#555',
    tooltipBg: '#ffffff',
    tooltipBorder: '#d5d3cf',
    tooltipText: '#1a1a1e',
  },
};

const apiUrl = import.meta.env.VITE_API_URL;

const downloadPdf = async (url, filename) => {
  try {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
        Accept: 'application/pdf',
      },
      credentials: 'include',
    });

    if (!res.ok) {
      let errMsg = `HTTP ${res.status} ${res.statusText}`;
      try {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await res.json();
          errMsg = data?.message || data?.error || errMsg;
        } else {
          const text = await res.text();
          if (text) errMsg = text.slice(0, 200);
        }
      } catch { /* ignore parse errors */ }
      console.error('❌ downloadPdf failed:', errMsg);
      toast.error(`Грешка при сваляне: ${errMsg}`);
      return;
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/pdf')) {
      const text = await res.text();
      console.error('❌ downloadPdf: unexpected content-type:', contentType, text.slice(0, 500));
      toast.error(`Сървърът върна непознат формат: ${contentType || 'неизвестен'}`);
      return;
    }

    const arrayBuffer = await res.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const link = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = link;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(link), 1000);
  } catch (err) {
    console.error('❌ downloadPdf exception:', err);
    toast.error(`Грешка при сваляне: ${err?.message || 'неизвестна грешка'}`);
  }
};

const AdminSeminarStatistics = () => {
  const { t } = useTranslation('academy-admin');
  const { getAdminSeminarStatistics, getSeminarAttendanceDetail, searchSeminarAttendee } = useAcademyCourses();
  const { theme } = useTheme();
  const colors = CHART_COLORS[theme] || CHART_COLORS.dark;

  const [period, setPeriod] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Table state
  const [search, setSearch] = useState('');
  const [mentorFilter, setMentorFilter] = useState('all');
  const [sortKey, setSortKey] = useState('scheduledDate');
  const [sortDir, setSortDir] = useState('desc');

  // Expanded row
  const [expandedId, setExpandedId] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [attendanceLoading, setAttendanceLoading] = useState(null);
  const [attendanceTab, setAttendanceTab] = useState('all');

  // Email modal
  const [emailTarget, setEmailTarget] = useState(null);

  // Global attendee search
  const [attendeeQuery, setAttendeeQuery] = useState('');
  const [attendeeResults, setAttendeeResults] = useState(null);
  const [attendeeSearchLoading, setAttendeeSearchLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const params = { period, type: typeFilter };
      if (statusFilter !== 'all') params.status = statusFilter;
      const result = await getAdminSeminarStatistics(params);
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [period, typeFilter, statusFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Debounced global attendee search
  useEffect(() => {
    if (!attendeeQuery.trim() || attendeeQuery.trim().length < 2) {
      setAttendeeResults(null);
      return;
    }
    const timeout = setTimeout(async () => {
      setAttendeeSearchLoading(true);
      try {
        const res = await searchSeminarAttendee(attendeeQuery.trim());
        setAttendeeResults(res?.results || []);
      } catch {
        setAttendeeResults([]);
      } finally {
        setAttendeeSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [attendeeQuery]);

  const handleExpandRow = async (seminarId) => {
    if (expandedId === seminarId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(seminarId);
    setAttendanceTab('all');

    if (!attendanceData[seminarId]) {
      try {
        setAttendanceLoading(seminarId);
        const detail = await getSeminarAttendanceDetail(seminarId);
        if (detail && detail.success !== false) {
          setAttendanceData(prev => ({ ...prev, [seminarId]: detail }));
        } else {
          setAttendanceData(prev => ({ ...prev, [seminarId]: { all: [], registered: [], guests: [], counts: { all: 0, registered: 0, guests: 0 } } }));
        }
      } catch (err) {
        console.error('Attendance detail error:', err);
        setAttendanceData(prev => ({ ...prev, [seminarId]: { all: [], registered: [], guests: [], counts: { all: 0, registered: 0, guests: 0 } } }));
      } finally {
        setAttendanceLoading(null);
      }
    }
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  if (loading) {
    return <div className="asst-loading"><div className="asst-spinner" /></div>;
  }

  if (!data) {
    return <div className="asst-empty">{t('seminarStats.noData', 'Няма данни за статистика')}</div>;
  }

  const { overview, monthlyData, seminars, mentors, facilitatorsFilter } = data;

  // Group facilitators by type for the dropdown sections.
  const facilitatorsByType = {
    mentor: (facilitatorsFilter || []).filter(f => f.type === 'mentor'),
    admin: (facilitatorsFilter || []).filter(f => f.type === 'admin'),
    external: (facilitatorsFilter || []).filter(f => f.type === 'external'),
  };
  const hasAnyFacilitators = (facilitatorsFilter || []).length > 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('bg-BG', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  // Filter & sort seminars table
  let filteredSeminars = [...(seminars || [])];
  if (search.trim()) {
    const q = search.toLowerCase();
    filteredSeminars = filteredSeminars.filter(s =>
      s.title?.toLowerCase().includes(q) ||
      formatDate(s.scheduledDate).includes(q)
    );
  }
  if (mentorFilter !== 'all') {
    const [filterType, filterIdStr] = mentorFilter.split(':');
    const filterId = parseInt(filterIdStr);
    if (filterType && !isNaN(filterId)) {
      filteredSeminars = filteredSeminars.filter(s =>
        (s.facilitators || []).some(f => f.type === filterType && f.sourceId === filterId)
      );
    }
  }

  filteredSeminars.sort((a, b) => {
    let valA = a[sortKey];
    let valB = b[sortKey];
    if (sortKey === 'scheduledDate') {
      valA = new Date(valA || 0).getTime();
      valB = new Date(valB || 0).getTime();
    }
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const SortHeader = ({ label, sortKeyName }) => (
    <th className="asst-th-sortable" onClick={() => handleSort(sortKeyName)}>
      <span>{label}</span>
      {sortKey === sortKeyName && (
        sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
      )}
    </th>
  );

  const statusSeminarLabel = (st) => {
    const labels = { scheduled: 'Насрочен', live: 'На живо', completed: 'Приключил', cancelled: 'Отменен' };
    return labels[st] || st || '—';
  };

  const participationLabel = (level) => {
    const labels = { active: 'Активно', moderate: 'Умерено', passive: 'Пасивно' };
    return labels[level] || level || '—';
  };

  const statusLabel = (st) => {
    const labels = { approved: 'Одобрен', pending: 'Изчакващ', registered: 'Записан', rejected: 'Отхвърлен', cancelled: 'Отказан' };
    return labels[st] || st || '—';
  };

  return (
    <div className="asst-container">
      {/* Filters */}
      <div className="asst-filters">
        <div className="asst-filter-group">
          <span className="asst-filter-label">{t('seminarStats.period', 'Период')}:</span>
          <div className="asst-periods">
            {PERIODS.map(p => (
              <button
                key={p.key}
                className={`asst-period-btn ${period === p.key ? 'asst-period-active' : ''}`}
                onClick={() => setPeriod(p.key)}
              >{p.label}</button>
            ))}
          </div>
        </div>
        <div className="asst-filter-group">
          <span className="asst-filter-label">{t('seminarStats.type', 'Тип')}:</span>
          <div className="asst-periods">
            {TYPE_FILTERS.map(tf => (
              <button
                key={tf.key}
                className={`asst-period-btn ${typeFilter === tf.key ? 'asst-period-active' : ''}`}
                onClick={() => setTypeFilter(tf.key)}
              >{tf.label}</button>
            ))}
          </div>
        </div>
        <div className="asst-filter-group">
          <span className="asst-filter-label">{t('seminarStats.statusFilter', 'Статус')}:</span>
          <div className="asst-periods">
            {STATUS_FILTERS.map(sf => (
              <button
                key={sf.key}
                className={`asst-period-btn ${statusFilter === sf.key ? 'asst-period-active' : ''}`}
                onClick={() => setStatusFilter(sf.key)}
              >{sf.label}</button>
            ))}
          </div>
        </div>
        <button
          className="asst-export-btn"
          onClick={() => {
            const params = new URLSearchParams();
            if (period !== 'all') params.set('period', period);
            if (typeFilter !== 'all') params.set('type', typeFilter);
            if (statusFilter !== 'all') params.set('status', statusFilter);
            downloadPdf(
              `${apiUrl}/academy/seminars/admin/export-report?${params.toString()}`,
              `seminar-report-${new Date().toISOString().slice(0, 10)}.pdf`
            );
          }}
        >
          <Download size={14} /> {t('seminarStats.exportReport', 'Свали доклад')}
        </button>
      </div>

      {/* Overview Cards */}
      <div className="asst-overview-grid">
        <OverviewCard
          icon={<Users size={20} />}
          value={overview.totalSeminars}
          label={t('seminarStats.totalSeminars', 'Общо семинари')}
          colorClass="asst-color-teal"
        />
        <OverviewCard
          icon={<Users size={20} />}
          value={overview.totalAttended}
          label={t('seminarStats.totalAttended', 'Общо присъствали')}
          sub={`${overview.registeredAttended} ${t('seminarStats.registered', 'рег.')} + ${overview.guestAttended} ${t('seminarStats.guests', 'гости')}`}
          colorClass="asst-color-amber"
        />
        <OverviewCard
          icon={<TrendingUp size={20} />}
          value={overview.avgAttendance}
          label={t('seminarStats.avgAttendance', 'Средно на семинар')}
          colorClass="asst-color-violet"
        />
        <OverviewCard
          icon={<Monitor size={20} />}
          value={`${overview.onlineCount} / ${overview.inpersonCount}`}
          label={t('seminarStats.onlineInperson', 'Онлайн / Присъствени')}
          colorClass="asst-color-emerald"
        />
        <OverviewCard
          icon={<Award size={20} />}
          value={overview.totalCredits}
          label={t('seminarStats.totalCredits', 'Раздадени кредити')}
          colorClass="asst-color-rose"
        />
        <OverviewCard
          icon={<CheckCircle size={20} />}
          value={overview.completedCount || 0}
          label={t('seminarStats.completed', 'Приключили')}
          colorClass="asst-color-teal"
        />
        <OverviewCard
          icon={<XCircle size={20} />}
          value={overview.cancelledCount || 0}
          label={t('seminarStats.cancelled', 'Отменени')}
          colorClass="asst-color-red"
        />
      </div>

      {/* Area Chart */}
      {monthlyData && monthlyData.length > 0 && (
        <div className="asst-chart-card">
          <h4 className="asst-chart-title">{t('seminarStats.monthlyChart', 'Семинари и присъстващи по месеци')}</h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradSeminars" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.seminars} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors.seminars} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradRegistered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.registered} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors.registered} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradGuests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.guests} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors.guests} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis dataKey="label" stroke={colors.axis} fontSize={11} />
              <YAxis stroke={colors.axis} fontSize={11} />
              <Tooltip contentStyle={{
                background: colors.tooltipBg,
                border: `1px solid ${colors.tooltipBorder}`,
                borderRadius: 6,
                fontSize: 12,
                color: colors.tooltipText,
              }} />
              <Legend />
              <Area type="monotone" dataKey="seminars" name={t('seminarStats.seminars', 'Семинари')} stroke={colors.seminars} fill="url(#gradSeminars)" strokeWidth={2} />
              <Area type="monotone" dataKey="registered" name={t('seminarStats.regAttendees', 'Регистрирани')} stroke={colors.registered} fill="url(#gradRegistered)" strokeWidth={2} />
              <Area type="monotone" dataKey="guests" name={t('seminarStats.guestAttendees', 'Гости')} stroke={colors.guests} fill="url(#gradGuests)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Global Attendee Search */}
      <div className="asst-chart-card">
        <div className="asst-table-header">
          <h4 className="asst-chart-title">{t('seminarStats.searchParticipant', 'Търсене на участник')}</h4>
          <div className="asst-search-wrap asst-search-wide">
            <Search size={14} />
            <input
              type="text"
              className="asst-search-input"
              placeholder={t('seminarStats.searchAttendeeGlobal', 'Въведете име или имейл на участник...')}
              value={attendeeQuery}
              onChange={e => setAttendeeQuery(e.target.value)}
            />
            {attendeeQuery && (
              <button className="asst-search-clear" onClick={() => setAttendeeQuery('')}>&times;</button>
            )}
          </div>
        </div>

        {attendeeSearchLoading && (
          <div className="asst-detail-loading"><div className="asst-spinner-sm" /></div>
        )}

        {attendeeResults && !attendeeSearchLoading && (
          attendeeResults.length === 0 ? (
            <div className="asst-detail-empty">{t('seminarStats.noResults', 'Няма намерени резултати')}</div>
          ) : (
            <div className="asst-table-wrap">
              <div className="asst-search-results-count">
                {t('seminarStats.foundResults', 'Намерени')}: <strong>{attendeeResults.length}</strong>
              </div>
              <table className="asst-detail-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>{t('seminarStats.col.name', 'Име')}</th>
                    <th>{t('seminarStats.col.email', 'Имейл')}</th>
                    <th>{t('seminarStats.col.phone', 'Телефон')}</th>
                    <th>{t('seminarStats.col.typeUser', 'Тип')}</th>
                    <th>{t('seminarStats.col.title', 'Семинар')}</th>
                    <th>{t('seminarStats.col.date', 'Дата')}</th>
                    <th>{t('seminarStats.col.participation', 'Участие')}</th>
                    <th>{t('seminarStats.col.earnedCredits', 'Кредити')}</th>
                    <th>{t('seminarStats.col.status', 'Статус')}</th>
                  </tr>
                </thead>
                <tbody>
                  {attendeeResults.map((r, idx) => (
                    <tr key={`sr-${idx}`}>
                      <td className="asst-cell-action">
                        {r.email && (
                          <button
                            className="asst-email-btn"
                            onClick={() => setEmailTarget({ name: `${r.firstName} ${r.lastName}`.trim(), email: r.email })}
                            title={t('seminarStats.sendEmail', 'Изпрати имейл')}
                          >
                            <Mail size={14} />
                          </button>
                        )}
                      </td>
                      <td>{`${r.firstName} ${r.lastName}`.trim() || '—'}</td>
                      <td>
                        {r.email ? (
                          <span
                            className="asst-email-link"
                            onClick={() => setEmailTarget({ name: `${r.firstName} ${r.lastName}`.trim(), email: r.email })}
                          >{r.email}</span>
                        ) : '—'}
                      </td>
                      <td>{r.phone || '—'}</td>
                      <td>
                        <span className={`asst-type-badge ${r.type === 'registered' ? 'asst-type-reg' : 'asst-type-guest'}`}>
                          {r.type === 'registered' ? t('seminarStats.platform', 'Платформа') : t('seminarStats.guest', 'Гост')}
                        </span>
                      </td>
                      <td className="asst-cell-title">{r.seminarTitle || '—'}</td>
                      <td>{formatDate(r.seminarDate)}</td>
                      <td>{participationLabel(r.participationLevel)}</td>
                      <td className="asst-cell-num">{r.earnedCredits || 0}</td>
                      <td>{statusLabel(r.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Seminars Table */}
      <div className="asst-chart-card">
        <div className="asst-table-header">
          <h4 className="asst-chart-title">{t('seminarStats.seminarsTable', 'Семинари')}</h4>
          <div className="asst-table-filters">
            <div className="asst-search-wrap">
              <Search size={14} />
              <input
                type="text"
                className="asst-search-input"
                placeholder={t('seminarStats.searchTitle', 'Заглавие или дата...')}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {hasAnyFacilitators && (
              <select
                className="asst-mentor-select"
                value={mentorFilter}
                onChange={e => setMentorFilter(e.target.value)}
              >
                <option value="all">{t('seminarStats.allFacilitators', 'Всички водещи')}</option>
                {facilitatorsByType.mentor.length > 0 && (
                  <optgroup label={t('seminarStats.mentorsGroup', 'Ментори')}>
                    {facilitatorsByType.mentor.map(f => (
                      <option key={`mentor:${f.id}`} value={`mentor:${f.id}`}>{f.name}</option>
                    ))}
                  </optgroup>
                )}
                {facilitatorsByType.admin.length > 0 && (
                  <optgroup label={t('seminarStats.adminsGroup', 'Администратори')}>
                    {facilitatorsByType.admin.map(f => (
                      <option key={`admin:${f.id}`} value={`admin:${f.id}`}>{f.name}</option>
                    ))}
                  </optgroup>
                )}
                {facilitatorsByType.external.length > 0 && (
                  <optgroup label={t('seminarStats.externalsGroup', 'Външни лектори')}>
                    {facilitatorsByType.external.map(f => (
                      <option key={`external:${f.id}`} value={`external:${f.id}`}>{f.name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            )}
          </div>
        </div>

        <div className="asst-table-wrap">
          <table className="asst-table">
            <thead>
              <tr>
                <SortHeader label={t('seminarStats.col.date', 'Дата')} sortKeyName="scheduledDate" />
                <SortHeader label={t('seminarStats.col.title', 'Заглавие')} sortKeyName="title" />
                <SortHeader label={t('seminarStats.col.status', 'Статус')} sortKeyName="status" />
                <th>{t('seminarStats.col.type', 'Тип')}</th>
                <th>{t('seminarStats.col.location', 'Място')}</th>
                <th>{t('seminarStats.col.facilitator', 'Лектор')}</th>
                <SortHeader label={t('seminarStats.col.registered', 'Записани')} sortKeyName="registeredCount" />
                <SortHeader label={t('seminarStats.col.attendedReg', 'Прис. рег.')} sortKeyName="attendedRegistered" />
                <SortHeader label={t('seminarStats.col.attendedGuests', 'Прис. гости')} sortKeyName="attendedGuests" />
                <SortHeader label={t('seminarStats.col.attendedTotal', 'Общо прис.')} sortKeyName="attendedTotal" />
                <SortHeader label={t('seminarStats.col.credits', 'Кредити')} sortKeyName="earnedCredits" />
              </tr>
            </thead>
            <tbody>
              {filteredSeminars.length === 0 ? (
                <tr><td colSpan={11} className="asst-table-empty">{t('seminarStats.noSeminars', 'Няма намерени семинари')}</td></tr>
              ) : filteredSeminars.map(sem => (
                <React.Fragment key={sem.id}>
                  <tr
                    className={`asst-table-row ${expandedId === sem.id ? 'asst-row-expanded' : ''}`}
                    onClick={() => handleExpandRow(sem.id)}
                  >
                    <td>{formatDate(sem.scheduledDate)}</td>
                    <td className="asst-cell-title">{sem.title}</td>
                    <td>
                      <span className={`asst-status-badge asst-status-${sem.status}`}>
                        {statusSeminarLabel(sem.status)}
                      </span>
                    </td>
                    <td>
                      <span className={`asst-badge ${sem.isOnline ? 'asst-badge-online' : 'asst-badge-inperson'}`}>
                        {sem.isOnline ? <Monitor size={11} /> : <MapPin size={11} />}
                        {sem.isOnline ? t('seminarStats.online', 'Онлайн') : t('seminarStats.inperson', 'Присъствен')}
                      </span>
                    </td>
                    <td className="asst-cell-location">{sem.isOnline ? 'Онлайн' : (sem.location || sem.address || '—')}</td>
                    <td>
                      {(() => {
                        const facs = Array.isArray(sem.facilitators) ? sem.facilitators : [];
                        if (facs.length === 0) return sem.facilitator || '—';
                        const names = facs.map(f => f.name).filter(Boolean);
                        if (names.length <= 2) return names.join(', ');
                        return `${names[0]}, ${names[1]}, +${names.length - 2}`;
                      })()}
                    </td>
                    <td className="asst-cell-num">{sem.registeredCount}</td>
                    <td className="asst-cell-num">{sem.attendedRegistered}</td>
                    <td className="asst-cell-num">{sem.attendedGuests}</td>
                    <td className="asst-cell-num asst-cell-bold">{sem.attendedTotal}</td>
                    <td className="asst-cell-num">{sem.earnedCredits}</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {expandedId && (
          <div className="asst-detail-section">
            <div className="asst-detail-section-header">
              <div className="asst-detail-section-title">
                {filteredSeminars.find(s => s.id === expandedId)?.title}
              </div>
              <button
                className="asst-export-btn asst-export-btn-sm"
                onClick={() => downloadPdf(
                  `${apiUrl}/academy/seminars/admin/export-attendees/${expandedId}?type=${attendanceTab}`,
                  `attendees-${expandedId}-${attendanceTab}-${new Date().toISOString().slice(0, 10)}.pdf`
                )}
              >
                <Download size={13} /> {t('seminarStats.exportAttendees', 'Свали списък')}
              </button>
            </div>
            {attendanceLoading === expandedId ? (
              <div className="asst-detail-loading"><div className="asst-spinner-sm" /></div>
            ) : !attendanceData[expandedId] ? (
              <div className="asst-detail-empty">{t('seminarStats.noAttendance', 'Няма данни')}</div>
            ) : (
              <AttendanceDetail
                data={attendanceData[expandedId]}
                activeTab={attendanceTab}
                setActiveTab={setAttendanceTab}
                formatDate={formatDate}
                participationLabel={participationLabel}
                statusLabel={statusLabel}
                onSendEmail={setEmailTarget}
                t={t}
              />
            )}
          </div>
        )}
      </div>

      <ScrollToTop />

      {emailTarget && (
        <SeminarEmailModal
          recipient={emailTarget}
          onClose={() => setEmailTarget(null)}
        />
      )}
    </div>
  );
};

// Overview Card
const OverviewCard = ({ icon, value, label, sub, colorClass }) => (
  <div className={`asst-overview-card ${colorClass}`}>
    <div className="asst-overview-icon">{icon}</div>
    <div className="asst-overview-value">{value}</div>
    <div className="asst-overview-label">{label}</div>
    {sub && <div className="asst-overview-sub">{sub}</div>}
  </div>
);

// Attendance Detail (2C)
const AttendanceDetail = ({ data, activeTab, setActiveTab, formatDate, participationLabel, statusLabel, onSendEmail, t }) => {
  const { all, registered, guests, counts } = data;
  const [attendeeSearch, setAttendeeSearch] = useState('');

  const TABS = [
    { key: 'all', label: t('seminarStats.tabAll', 'Всички'), count: counts.all },
    { key: 'registered', label: t('seminarStats.tabRegistered', 'Регистрирани'), count: counts.registered },
    { key: 'guests', label: t('seminarStats.tabGuests', 'Гости'), count: counts.guests },
  ];

  const rawList = activeTab === 'all' ? all : activeTab === 'registered' ? registered : guests;

  let currentList = rawList;
  if (attendeeSearch.trim()) {
    const q = attendeeSearch.toLowerCase();
    currentList = rawList.filter(p =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      (p.email && p.email.toLowerCase().includes(q))
    );
  }

  const showRegisteredCols = activeTab === 'all' || activeTab === 'registered';
  const showGuestCols = activeTab === 'all' || activeTab === 'guests';

  return (
    <div className="asst-detail-content">
      <div className="asst-detail-header">
        <div className="asst-detail-tabs">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`asst-detail-tab ${activeTab === tab.key ? 'asst-detail-tab-active' : ''}`}
              onClick={e => { e.stopPropagation(); setActiveTab(tab.key); }}
            >
              {tab.label} <span className="asst-detail-tab-count">({tab.count})</span>
            </button>
          ))}
        </div>
        <div className="asst-detail-search" onClick={e => e.stopPropagation()}>
          <Search size={13} />
          <input
            type="text"
            className="asst-detail-search-input"
            placeholder={t('seminarStats.searchAttendee', 'Име или имейл...')}
            value={attendeeSearch}
            onChange={e => setAttendeeSearch(e.target.value)}
          />
        </div>
      </div>

      {currentList.length === 0 ? (
        <div className="asst-detail-empty">{t('seminarStats.noAttendees', 'Няма участници')}</div>
      ) : (
        <div className="asst-detail-table-wrap">
          <table className="asst-detail-table">
            <thead>
              <tr>
                <th></th>
                <th>{t('seminarStats.col.name', 'Име')}</th>
                <th>{t('seminarStats.col.email', 'Имейл')}</th>
                <th>{t('seminarStats.col.phone', 'Телефон')}</th>
                {activeTab === 'all' && <th>{t('seminarStats.col.typeUser', 'Тип')}</th>}
                <th>{t('seminarStats.col.registeredAt', 'Записан на')}</th>
                {showRegisteredCols && activeTab !== 'guests' && (
                  <>
                    <th>{t('seminarStats.col.attendedAt', 'Присъствие')}</th>
                    <th>{t('seminarStats.col.participation', 'Участие')}</th>
                    <th>{t('seminarStats.col.earnedCredits', 'Кредити')}</th>
                    <th>{t('seminarStats.col.status', 'Статус')}</th>
                  </>
                )}
                {activeTab === 'guests' && (
                  <>
                    <th>{t('seminarStats.col.participation', 'Участие')}</th>
                    <th>{t('seminarStats.col.markedBy', 'Записан от')}</th>
                    <th>{t('seminarStats.col.converted', 'Конвертиран')}</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {currentList.map((person, idx) => (
                <tr key={`${person.type}-${person.id}-${idx}`} onClick={e => e.stopPropagation()}>
                  <td className="asst-cell-action">
                    {person.email && (
                      <button
                        className="asst-email-btn"
                        onClick={() => onSendEmail({
                          name: `${person.firstName} ${person.lastName}`.trim(),
                          email: person.email,
                        })}
                        title={t('seminarStats.sendEmail', 'Изпрати имейл')}
                      >
                        <Mail size={14} />
                      </button>
                    )}
                  </td>
                  <td>{`${person.firstName} ${person.lastName}`.trim() || '—'}</td>
                  <td>
                    {person.email ? (
                      <span
                        className="asst-email-link"
                        onClick={() => onSendEmail({
                          name: `${person.firstName} ${person.lastName}`.trim(),
                          email: person.email,
                        })}
                      >
                        {person.email}
                      </span>
                    ) : '—'}
                  </td>
                  <td>{person.phone || '—'}</td>
                  {activeTab === 'all' && (
                    <td>
                      <span className={`asst-type-badge ${person.type === 'registered' ? 'asst-type-reg' : 'asst-type-guest'}`}>
                        {person.type === 'registered' ? t('seminarStats.platform', 'Платформа') : t('seminarStats.guest', 'Гост')}
                      </span>
                    </td>
                  )}
                  <td>{formatDate(person.registeredAt)}</td>
                  {showRegisteredCols && activeTab !== 'guests' && (
                    <>
                      <td>{person.type === 'registered' ? (person.attended ? formatDate(person.attendedAt) : '—') : '—'}</td>
                      <td>{person.type === 'registered' ? participationLabel(person.participationLevel) : (person.participationLevel ? participationLabel(person.participationLevel) : '—')}</td>
                      <td className="asst-cell-num">{person.type === 'registered' ? (person.earnedCredits || 0) : '—'}</td>
                      <td>{person.type === 'registered' ? statusLabel(person.status) : '—'}</td>
                    </>
                  )}
                  {activeTab === 'guests' && (
                    <>
                      <td>{participationLabel(person.participationLevel)}</td>
                      <td>{person.markedByName || '—'}</td>
                      <td>{person.convertedToUserId ? `ID: ${person.convertedToUserId}` : '—'}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminSeminarStatistics;
