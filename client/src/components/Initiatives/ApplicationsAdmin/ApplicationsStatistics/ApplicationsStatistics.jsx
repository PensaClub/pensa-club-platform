import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Area,
    AreaChart
} from 'recharts';
import { format, subDays, eachDayOfInterval, getHours, startOfWeek, endOfWeek } from 'date-fns';
import { bg, enUS } from 'date-fns/locale';
import './ApplicationsStatistics.css';
import { ProjectDetailsModal } from './ProjectDetailsModal';

export const ApplicationsStatistics = ({ applications }) => {
    const { t, i18n } = useTranslation();
    const currentLocale = i18n.language === 'bg' ? bg : enUS;
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

    // Цветова палитра
    const colors = {
        primary: '#3B82C7',
        secondary: '#1B8B8A',
        success: '#1B6D4D',
        warning: '#f97316',
        danger: '#ef4444',
        info: '#059669',
        gradient: ['#3B82C7', '#1E5A96']
    };

    const chartColors = [colors.primary, colors.secondary, colors.success, colors.warning, colors.danger, colors.info];

    // Изчисляване на статистики по дни (последните 30 дни)
    const dailyStats = useMemo(() => {
        const last30Days = eachDayOfInterval({
            start: subDays(new Date(), 29),
            end: new Date()
        });

        return last30Days.map(day => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const dayApplications = applications.filter(app =>
                format(new Date(app.appliedAt), 'yyyy-MM-dd') === dayStr
            );

            return {
                date: format(day, 'dd.MM', { locale: currentLocale }),
                fullDate: format(day, 'dd MMMM yyyy', { locale: currentLocale }),
                count: dayApplications.length,
                dayName: format(day, 'EEEE', { locale: currentLocale })
            };
        });
    }, [applications, currentLocale]);

const handleViewTopProject = () => {
  const topProject = projectStats[0];
  if (topProject?.fullProject) {
    setSelectedProjectId(topProject.fullProject);
    setIsProjectModalOpen(true);
  }
};
    // Статистики по проекти
    const projectStats = useMemo(() => {
        const projectCounts = {};
        applications.forEach(app => {
            projectCounts[app.projectId] = (projectCounts[app.projectId] || 0) + 1;
        });

        return Object.entries(projectCounts)
            .map(([project, count]) => ({
                project: project.length > 25 ? project.substring(0, 25) + '...' : project,
                fullProject: project,
                count,
                percentage: ((count / applications.length) * 100).toFixed(1)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Показваме топ 10
    }, [applications]);

    // Статистики по часове (24-часов формат)
    const hourlyStats = useMemo(() => {
        const hourCounts = Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            hourLabel: `${i.toString().padStart(2, '0')}:00`,
            count: 0
        }));

        applications.forEach(app => {
            const hour = getHours(new Date(app.appliedAt));
            hourCounts[hour].count++;
        });

        return hourCounts;
    }, [applications]);

    // Седмични статистики (последните 8 седмици)
    const weeklyStats = useMemo(() => {
        const weeks = [];
        for (let i = 7; i >= 0; i--) {
            const weekStart = startOfWeek(subDays(new Date(), i * 7), { weekStartsOn: 1 });
            const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

            const weekApplications = applications.filter(app => {
                const appDate = new Date(app.appliedAt);
                return appDate >= weekStart && appDate <= weekEnd;
            });

            weeks.push({
                week: format(weekStart, 'dd.MM', { locale: currentLocale }),
                fullWeek: `${format(weekStart, 'dd MMM', { locale: currentLocale })} - ${format(weekEnd, 'dd MMM', { locale: currentLocale })}`,
                count: weekApplications.length
            });
        }
        return weeks;
    }, [applications, currentLocale]);

    // Топ проекти за pie chart
    const topProjectsForPie = useMemo(() => {
        return projectStats.slice(0, 6);
    }, [projectStats]);

    // Общи статистики
    const generalStats = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = subDays(today, 7);
        const monthAgo = subDays(today, 30);

        const todayApps = applications.filter(app =>
            new Date(app.appliedAt) >= today
        ).length;

        const weekApps = applications.filter(app =>
            new Date(app.appliedAt) >= weekAgo
        ).length;

        const monthApps = applications.filter(app =>
            new Date(app.appliedAt) >= monthAgo
        ).length;

        const avgPerDay = applications.length > 0 ?
            (monthApps / 30).toFixed(1) : 0;

        const peakHour = hourlyStats.reduce((max, hour) =>
            hour.count > max.count ? hour : max, hourlyStats[0]
        );

        const mostPopularProject = projectStats[0];

        return {
            today: todayApps,
            thisWeek: weekApps,
            thisMonth: monthApps,
            avgPerDay,
            peakHour: peakHour?.hourLabel || '00:00',
            peakHourCount: peakHour?.count || 0,
            topProject: mostPopularProject?.fullProject || t('applications.statistics.noData'),
            topProjectCount: mostPopularProject?.count || 0
        };
    }, [applications, hourlyStats, projectStats, t]);

    // Custom Tooltip за графиките
    // Замени CustomTooltip функцията с тази:
    const CustomTooltip = ({ active, payload, label, labelFormatter, formatter }) => {
        if (!active || !payload || !payload.length) return null;

        return (
            <div className="applications-statistics-tooltip">
                <div className="applications-statistics-tooltip-label">
                    {labelFormatter ? labelFormatter(label) : label}
                </div>
                {payload.map((entry, index) => {
                    if (!entry) return null;

                    let displayValue = entry.value;
                    let displayName = entry.name || '';

                    if (formatter) {
                        try {
                            const formatterResult = formatter(entry.value, entry.name, entry);
                            if (Array.isArray(formatterResult)) {
                                displayValue = formatterResult[0];
                                displayName = formatterResult[1] || displayName;
                            } else {
                                displayValue = formatterResult;
                            }
                        } catch (error) {
                            console.warn('Formatter error:', error);
                            displayValue = entry.value;
                        }
                    }

                    return (
                        <div key={index} className="applications-statistics-tooltip-item">
                            <span
                                className="applications-statistics-tooltip-color"
                                style={{ backgroundColor: entry.color }}
                            ></span>
                            <span className="applications-statistics-tooltip-value">
                                {displayValue} {displayName}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="applications-statistics-container">
            {/* Stats Overview */}
            <div className="applications-statistics-overview">
                <div className="applications-statistics-summary-grid">
                    <div className="applications-statistics-summary-card primary">
                        <div className="applications-statistics-summary-icon">📊</div>
                        <div className="applications-statistics-summary-content">
                            <div className="applications-statistics-summary-number">{generalStats.thisMonth}</div>
                            <div className="applications-statistics-summary-label">{t('applications.statistics.thisMonth')}</div>
                        </div>
                    </div>

                    <div className="applications-statistics-summary-card success">
                        <div className="applications-statistics-summary-icon">⏰</div>
                        <div className="applications-statistics-summary-content">
                            <div className="applications-statistics-summary-number">{generalStats.avgPerDay}</div>
                            <div className="applications-statistics-summary-label">{t('applications.statistics.avgPerDay')}</div>
                        </div>
                    </div>

                    <div className="applications-statistics-summary-card warning">
                        <div className="applications-statistics-summary-icon">🕐</div>
                        <div className="applications-statistics-summary-content">
                            <div className="applications-statistics-summary-number">{generalStats.peakHour}</div>
                            <div className="applications-statistics-summary-label">{t('applications.statistics.peakHour')}</div>
                        </div>
                    </div>

                    <div className="applications-statistics-summary-card info">
                        <div className="applications-statistics-summary-icon">🎯</div>
                        <div className="applications-statistics-summary-content">
                            <div className="applications-statistics-summary-number">{generalStats.topProjectCount}</div>
                            <div className="applications-statistics-summary-label">{t('applications.statistics.topProject')}</div>
                        </div>
                        <button 
    onClick={handleViewTopProject}
    className="applications-statistics-view-project-btn"
    title={t('applications.statistics.viewTopProject')}
    disabled={!generalStats.topProject || generalStats.topProject === t('applications.statistics.noData')}
  >
    👁️
  </button>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="applications-statistics-charts-grid">
                {/* Daily Activity - Line Chart */}
                <div className="applications-statistics-chart-card large">
                    <h3 className="applications-statistics-chart-title">
                        <span className="applications-statistics-chart-icon">📈</span>
                        {t('applications.statistics.dailyActivity')}
                    </h3>
                    <div className="applications-statistics-chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={dailyStats}>
                                <defs>
                                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#718096"
                                    fontSize={12}
                                    tick={{ fontSize: 11 }}
                                />
                                <YAxis
                                    stroke="#718096"
                                    fontSize={12}
                                    tick={{ fontSize: 11 }}
                                />
                                <Tooltip
                                    content={<CustomTooltip
                                        labelFormatter={(label) => {
                                            const found = dailyStats.find(d => d.date === label);
                                            return found?.fullDate || label;
                                        }}
                                        formatter={(value) => [`${value}`, t('applications.statistics.applications')]}
                                    />}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke={colors.primary}
                                    strokeWidth={3}
                                    fill="url(#areaGradient)"
                                    dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: colors.primary, strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Projects Distribution - Bar Chart */}
                <div className="applications-statistics-chart-card large">
                    <h3 className="applications-statistics-chart-title">
                        <span className="applications-statistics-chart-icon">🎯</span>
                        {t('applications.statistics.projectsDistribution')}
                    </h3>
                    <div className="applications-statistics-chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={projectStats} margin={{ bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="project"
                                    stroke="#718096"
                                    fontSize={11}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                    tick={{ fontSize: 10 }}
                                />
                                <YAxis
                                    stroke="#718096"
                                    fontSize={12}
                                    tick={{ fontSize: 11 }}
                                />
                                <Tooltip
                                    content={<CustomTooltip
                                        labelFormatter={(label) => {
                                            const found = projectStats.find(p => p.project === label);
                                            return found?.fullProject || label;
                                        }}
                                        formatter={(value) => [`${value}`, t('applications.statistics.applications')]}
                                    />}
                                />
                                <Bar
                                    dataKey="count"
                                    fill={colors.secondary}
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Projects - Pie Chart */}
                <div className="applications-statistics-chart-card medium">
                    <h3 className="applications-statistics-chart-title">
                        <span className="applications-statistics-chart-icon">🥧</span>
                        {t('applications.statistics.topProjects')}
                    </h3>
                    <div className="applications-statistics-chart-container">
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={topProjectsForPie}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="count"
                                    label={({ percentage }) => `${percentage}%`}
                                    labelLine={false}
                                >
                                    {topProjectsForPie.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={<CustomTooltip
                                        formatter={(value, name, props) => {
                                            if (!props || !props.payload) return [value, name];
                                            return [
                                                `${value} ${t('applications.statistics.applications')} (${props.payload.percentage}%)`,
                                                props.payload.fullProject || name
                                            ];
                                        }}
                                    />}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="applications-statistics-pie-legend">
                        {topProjectsForPie.map((project, index) => (
                            <div key={project.fullProject} className="applications-statistics-legend-item">
                                <div
                                    className="applications-statistics-legend-color"
                                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                                ></div>
                                <span className="applications-statistics-legend-text" title={project.fullProject}>
                                    {project.project}
                                </span>
                                <span className="applications-statistics-legend-count">
                                    {project.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hourly Activity */}
                <div className="applications-statistics-chart-card medium">
                    <h3 className="applications-statistics-chart-title">
                        <span className="applications-statistics-chart-icon">🕒</span>
                        {t('applications.statistics.hourlyActivity')}
                    </h3>
                    <div className="applications-statistics-chart-container">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={hourlyStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="hourLabel"
                                    stroke="#718096"
                                    fontSize={10}
                                    tick={{ fontSize: 9 }}
                                />
                                <YAxis
                                    stroke="#718096"
                                    fontSize={11}
                                    tick={{ fontSize: 10 }}
                                />
                                <Tooltip
                                    content={<CustomTooltip
                                        formatter={(value) => [value, t('applications.statistics.applications')]}
                                    />}
                                />
                                <Bar
                                    dataKey="count"
                                    fill={colors.success}
                                    radius={[2, 2, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Weekly Trend */}
                <div className="applications-statistics-chart-card large">
                    <h3 className="applications-statistics-chart-title">
                        <span className="applications-statistics-chart-icon">📅</span>
                        {t('applications.statistics.weeklyTrend')}
                    </h3>
                    <div className="applications-statistics-chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={weeklyStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="week"
                                    stroke="#718096"
                                    fontSize={12}
                                    tick={{ fontSize: 11 }}
                                />
                                <YAxis
                                    stroke="#718096"
                                    fontSize={12}
                                    tick={{ fontSize: 11 }}
                                />
                                <Tooltip
                                    content={<CustomTooltip
                                        labelFormatter={(label) => {
                                            const found = weeklyStats.find(w => w.week === label);
                                            return found?.fullWeek || label;
                                        }}
                                        formatter={(value) => [`${value}`, t('applications.statistics.applications')]}
                                    />}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke={colors.warning}
                                    strokeWidth={3}
                                    dot={{ fill: colors.warning, strokeWidth: 2, r: 5 }}
                                    activeDot={{ r: 7, stroke: colors.warning, strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Quick Insights */}
            <div className="applications-statistics-insights">
                <h3 className="applications-statistics-insights-title">
                    <span className="applications-statistics-insights-icon">💡</span>
                    {t('applications.statistics.quickInsights')}
                </h3>
                <div className="applications-statistics-insights-grid">
                    <div className="applications-statistics-insight-card">
                        <div className="applications-statistics-insight-text">
                            {t('applications.statistics.insight1', {
                                project: generalStats.topProject,
                                count: generalStats.topProjectCount
                            })}
                        </div>
                    </div>

                    <div className="applications-statistics-insight-card">
                        <div className="applications-statistics-insight-text">
                            {t('applications.statistics.insight2', {
                                hour: generalStats.peakHour,
                                count: generalStats.peakHourCount
                            })}
                        </div>
                    </div>

                    <div className="applications-statistics-insight-card">
                        <div className="applications-statistics-insight-text">
                            {t('applications.statistics.insight3', {
                                avg: generalStats.avgPerDay
                            })}
                        </div>
                    </div>
                </div>
            </div>
            {/* Project Details Modal */}
      <ProjectDetailsModal
        projectId={selectedProjectId}
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setSelectedProjectId(null);
        }}
        applicationsCount={generalStats.topProjectCount}
      />

        </div>
    );
};