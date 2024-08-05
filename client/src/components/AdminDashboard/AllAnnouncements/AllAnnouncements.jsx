import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminContext } from '../../contexts/AdminContext';
import './allAnnouncements.css';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line,
    PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

export const AllAnnouncements = () => {
    const { fetchPendingAds, fetchApprovedAds, fetchRejectAds, pendingAds = [], approvedAds = [], rejectAds = [] } = useAdminContext();
    const { t } = useTranslation();
    const [hiddenBar, setHiddenBar] = useState([]);
    const [hiddenLine, setHiddenLine] = useState([]);
    const [hiddenPie, setHiddenPie] = useState([]);
    const [isYearly, setIsYearly] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            await fetchPendingAds();
            await fetchApprovedAds();
            await fetchRejectAds();

            // Fetch categories data from search-criteria.json
            const response = await fetch('/search-criteria.json');
            const data = await response.json();
            setCategories(data?.searchCriteria);
        };
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLegendClickBar = (dataKey) => {
        setHiddenBar(hiddenBar.includes(dataKey)
            ? hiddenBar.filter(key => key !== dataKey)
            : [...hiddenBar, dataKey]);
    };

    const handleLegendClickLine = (dataKey) => {
        setHiddenLine(hiddenLine.includes(dataKey)
            ? hiddenLine.filter(key => key !== dataKey)
            : [...hiddenLine, dataKey]);
    };

    const handleLegendClickPie = (name) => {
        setHiddenPie(hiddenPie.includes(name)
            ? hiddenPie.filter(key => key !== name)
            : [...hiddenPie, name]);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const getLastNDays = (days) => {
        const today = new Date();
        const pastDate = new Date(today);
        pastDate.setDate(today.getDate() - days);
        return pastDate.toISOString().split('T')[0];
    };

    const translateCategory = (value) => {
        const category = categories.find(cat => cat.value === value);
        return category ? t(category.name) : value;
    };

    const generateCategoriesData = () => {
        const categoryValues = categories.map(cat => cat.value);
        return categoryValues.map(category => ({
            category: translateCategory(category),
            pending: pendingAds.filter(ad => ad.category === category).length,
            approved: approvedAds.filter(ad => ad.category === category).length,
            rejected: rejectAds.filter(ad => ad.category === category).length,
        }));
    };

    const generateDateData = () => {
        const startDate = isYearly ? new Date(new Date().setFullYear(new Date().getFullYear() - 1)) : new Date(getLastNDays(10));
        const dateSet = new Set();

        [...pendingAds, ...approvedAds, ...rejectAds].forEach(ad => {
            if (ad.creationDate && new Date(ad.creationDate) >= startDate) {
                dateSet.add(ad.creationDate);
            }
        });

        const sortedDates = Array.from(dateSet).sort();
        return sortedDates.map(date => {
            const formattedDate = formatDate(date);
            return {
                date: formattedDate,
                pending: pendingAds.filter(ad => formatDate(ad.creationDate) === formattedDate).length,
                approved: approvedAds.filter(ad => formatDate(ad.creationDate) === formattedDate).length,
                rejected: rejectAds.filter(ad => formatDate(ad.creationDate) === formattedDate).length,
            };
        });
    };

    const mockData = [
        { date: '2024-07-19', pending: 10, approved: 20, rejected: 5 },
        { date: '2024-07-20', pending: 15, approved: 25, rejected: 10 },
        { date: '2024-07-21', pending: 5, approved: 30, rejected: 20 }
    ];

    const categoriesData = generateCategoriesData();
    const dateData = generateDateData().length ? generateDateData() : mockData;

    const pieData = [
        { name: 'Pending Ads', value: pendingAds.length, color: '#FFCE56' },
        { name: 'Approved Ads', value: approvedAds.length, color: '#82ca9d' },
        { name: 'Rejected Ads', value: rejectAds.length, color: '#FF6384' }
    ];

    const renderCustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-title">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="tooltip-item" style={{ color: entry.color }}>
                            {`${entry.name}: ${entry.value.toLocaleString()}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="all-announcements">
            <h2>{t('admin.all_announcements_statistic')}</h2>

            <div className="bar-chart">
                <h3>{t('admin.ads_by_category')}</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip content={renderCustomTooltip} />
                        <Legend onClick={(e) => handleLegendClickBar(e.dataKey)} />
                        <Bar dataKey="pending" fill="#FFCE56" fillOpacity={hiddenBar.includes('pending') ? 0.2 : 1} />
                        <Bar dataKey="approved" fill="#82ca9d" fillOpacity={hiddenBar.includes('approved') ? 0.2 : 1} />
                        <Bar dataKey="rejected" fill="#FF6384" fillOpacity={hiddenBar.includes('rejected') ? 0.2 : 1} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="chart-row">
                <div className="line-chart">
                    <h3>{t('admin.ads_by_date')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dateData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip content={renderCustomTooltip} />
                            <Legend
                                onClick={(e) => {
                                    if (e.dataKey === 'year') {
                                        setIsYearly(!isYearly);
                                    } else {
                                        handleLegendClickLine(e.dataKey);
                                    }
                                }}
                            />
                            <Line type="monotone" dataKey="pending" stroke="#FFCE56" strokeOpacity={hiddenLine.includes('pending') ? 0.2 : 1} />
                            <Line type="monotone" dataKey="approved" stroke="#82ca9d" strokeOpacity={hiddenLine.includes('approved') ? 0.2 : 1} />
                            <Line type="monotone" dataKey="rejected" stroke="#FF6384" strokeOpacity={hiddenLine.includes('rejected') ? 0.2 : 1} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="pie-chart">
                    <h3>{t('admin.ads_distribution')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={(entry) => `${entry.name}: ${entry.value}`}
                                labelLine={true}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        fillOpacity={hiddenPie.includes(entry.name) ? 0.2 : 1}
                                        onClick={() => handleLegendClickPie(entry.name)}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={renderCustomTooltip} />
                            <Legend onClick={(e) => handleLegendClickPie(e.value)} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
