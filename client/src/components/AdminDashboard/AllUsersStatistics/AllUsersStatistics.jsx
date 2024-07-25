import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMappingContext } from '../../contexts/MapContext';
import './allUsersStatistics.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

export const AllUsersStatistics = () => {
  const { onAllUsers, allUsers } = useMappingContext();
  const { t } = useTranslation();
  const [hiddenBar, setHiddenBar] = useState([]);
  const [hiddenLine, setHiddenLine] = useState([]);
  const [hiddenPie, setHiddenPie] = useState([]);
  const [registrationFilter, setRegistrationFilter] = useState('last_week');
  const [optionData, setOptionData] = useState({ skills: [], workOptions: [], interestOptions: [] });
  useEffect(() => {
    const fetchData = async () => {
      await onAllUsers();
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetch('/options.json')
        .then(response => response.json())
        .then(data => setOptionData(data))
        .catch(error => console.error('Failed to load JSON data', error));
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
    return pastDate;
  };

  const translateValue = (category, value) => {
    const found = optionData[category].find(item => item.value === value);
      return found ? t(found.name) : value;
  };

  const generateRolesData = () => {
    if (!allUsers || !allUsers.response || !allUsers.response.accounts) return [];
    const users = allUsers.response.accounts;
    const roles = ["user", "admin", "banned"];
    return roles.map(role => ({
      role,
      total: users.filter(user => user.role === role).length,
      completed: users.filter(user => user.role === role && user.enabled).length,
      notCompleted: users.filter(user => user.role === role && !user.enabled).length,
    }));
  };

  const generateStatusData = () => {
    if (!allUsers || !allUsers.response || !allUsers.response.accounts) return [];
    const users = allUsers.response.accounts;
    return [
      {
        status: t('admin.active'),
        count: users.filter(user => user.enabled).length
      },
      {
        status: t('admin.inactive'),
        count: users.filter(user => !user.enabled).length
      }
    ];
  };

  const generateRegistrationData = () => {
    if (!allUsers || !allUsers.response || !allUsers.response.accounts) return [];
    const users = allUsers.response.accounts;
    let startDate;
    if (registrationFilter === 'last_week') {
      startDate = getLastNDays(7);
    } else if (registrationFilter === 'last_month') {
      startDate = getLastNDays(30);
    } else {
      startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    }

    // eslint-disable-next-line no-unused-vars
    const dateSet = new Set(users.map(user => formatDate(user.createdAt)).filter(date => new Date(date) >= startDate));
    
    const dates = [];
    const currentDate = new Date(startDate);
    const today = new Date();

    while (currentDate <= today) {
      dates.push(formatDate(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const registrationData = dates.map(date => ({
      date,
      count: users.filter(user => formatDate(user.createdAt) === date).length,
    }));

    return registrationData;
  };

  const generateRegionData = () => {
    if (!allUsers || !allUsers.response || !allUsers.response.accounts) return [];
    const users = allUsers.response.accounts;
    const regions = Array.from(new Set(users
      .filter(user => user.details && user.details.region)
      .map(user => user.details.region)
    ));
    return regions.map(region => ({
      region,
      count: users.filter(user => user.details && user.details.region === region).length
    }));
  };

  const generateAdsPerUserData = () => {
    if (!allUsers || !allUsers.response || !allUsers.response.accounts) return [];
    const users = allUsers.response.accounts;
    const adCounts = users.map(user => user.ads.length);
    const totalAds = adCounts.reduce((sum, count) => sum + count, 0);
    return [
      {
        name: t('admin.average_ads_per_user'),
        value: totalAds / users.length
      }
    ];
  };

  const generateMonthlyUserGrowthData = () => {
    if (!allUsers || !allUsers.response || !allUsers.response.accounts) return [];
    const users = allUsers.response.accounts;
    const currentYear = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, index) => new Date(currentYear, index).toLocaleString('default', { month: 'short' }));
    return months.map((month, index) => {
      const monthStart = new Date(currentYear, index, 1);
      const monthEnd = new Date(currentYear, index + 1, 0);
      return {
        month,
        count: users.filter(user => new Date(user.createdAt) >= monthStart && new Date(user.createdAt) <= monthEnd).length
      };
    });
  };

  const generateInterestsData = () => {
    if (!allUsers || !allUsers.response || !allUsers.response.accounts) return [];
    const users = allUsers.response.accounts;
    const interests = Array.from(new Set(users
      .filter(user => user.details && user.details.interestOptions)
      .flatMap(user => user.details.interestOptions)
    ));
    return interests.map(interest => ({
      interest: translateValue('interestOptions', interest),
      count: users.filter(user => user.details && user.details.interestOptions.includes(interest)).length
    }));
  };

  const generateSkillsData = () => {
    if (!allUsers || !allUsers.response || !allUsers.response.accounts) return [];
    const users = allUsers.response.accounts;
    const skills = Array.from(new Set(users
      .filter(user => user.details && user.details.skills)
      .flatMap(user => user.details.skills)
    ));
    return skills.map(skill => ({
      skill: translateValue('skills', skill),
      count: users.filter(user => user.details && user.details.skills.includes(skill)).length
    }));
  };

  const generateWorkOptionsData = () => {
    if (!allUsers || !allUsers.response || !allUsers.response.accounts) return [];
    const users = allUsers.response.accounts;
    const workOptions = Array.from(new Set(users
      .filter(user => user.details && user.details.workOptions)
      .flatMap(user => user.details.workOptions)
    ));
    return workOptions.map(workOption => ({
      workOption: translateValue('workOptions', workOption),
      count: users.filter(user => user.details && user.details.workOptions.includes(workOption)).length
    }));
  };

  const categoriesData = generateRolesData();
  const statusData = generateStatusData();
  const registrationData = generateRegistrationData();
  const regionData = generateRegionData();
  const adsPerUserData = generateAdsPerUserData();
  const monthlyUserGrowthData = generateMonthlyUserGrowthData(); 
  const interestsData = generateInterestsData();
  const skillsData = generateSkillsData();
  const workOptionsData = generateWorkOptionsData();

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
    <div className="all-users-statistics">
      <h2>{t('admin.all_users_statistics')}</h2>

      <div className="chart-container">
        <h3>{t('admin.users_by_role')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="role" />
            <YAxis />
            <Tooltip content={renderCustomTooltip} />
            <Legend onClick={(e) => handleLegendClickBar(e.dataKey)} />
            <Bar dataKey="total" fill="#FFCE56" fillOpacity={hiddenBar.includes('total') ? 0.2 : 1} />
            <Bar dataKey="completed" fill="#82ca9d" fillOpacity={hiddenBar.includes('completed') ? 0.2 : 1} />
            <Bar dataKey="notCompleted" fill="#FF6384" fillOpacity={hiddenBar.includes('notCompleted') ? 0.2 : 1} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>{t('admin.users_by_status')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={(entry) => `${entry.status}: ${entry.count}`}
              labelLine={true}
            >
              {statusData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.status === t('admin.active') ? '#82ca9d' : '#FF6384'}
                  fillOpacity={hiddenPie.includes(entry.status) ? 0.2 : 1}
                  onClick={() => handleLegendClickPie(entry.status)}
                />
              ))}
            </Pie>
            <Tooltip content={renderCustomTooltip} />
            <Legend onClick={(e) => handleLegendClickPie(e.value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>{t('admin.users_by_registration_date')}</h3>
        <div className="filter-buttons">
          <button className={`filter-btn ${registrationFilter === 'last_week' ? 'active' : ''}`} onClick={() => setRegistrationFilter('last_week')}>{t('admin.last_week')}</button>
          <button className={`filter-btn ${registrationFilter === 'last_month' ? 'active' : ''}`} onClick={() => setRegistrationFilter('last_month')}>{t('admin.last_month')}</button>
          <button className={`filter-btn ${registrationFilter === 'last_year' ? 'active' : ''}`} onClick={() => setRegistrationFilter('last_year')}>{t('admin.last_year')}</button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={registrationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={renderCustomTooltip} />
            <Legend onClick={(e) => handleLegendClickLine(e.dataKey)} />
            <Line type="monotone" dataKey="count" stroke="#82ca9d" strokeOpacity={hiddenLine.includes('count') ? 0.2 : 1} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>{t('admin.users_by_region')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={regionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="region" />
            <YAxis />
            <Tooltip content={renderCustomTooltip} />
            <Legend onClick={(e) => handleLegendClickBar(e.dataKey)} />
            <Bar dataKey="count" fill="#FFCE56" fillOpacity={hiddenBar.includes('count') ? 0.2 : 1} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>{t('admin.average_ads_per_user')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={adsPerUserData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={(entry) => `${entry.name}: ${entry.value.toFixed(2)}`} //dobawen po kusno 
              labelLine={true}
            >
              {adsPerUserData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={'#FFCE56'}
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

      <div className="chart-container">
        <h3>{t('admin.monthly_user_growth')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyUserGrowthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip content={renderCustomTooltip} />
            <Legend onClick={(e) => handleLegendClickLine(e.dataKey)} />
            <Line type="monotone" dataKey="count" stroke="#82ca9d" strokeOpacity={hiddenLine.includes('count') ? 0.2 : 1} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>{t('admin.users_by_interests')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={interestsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="interest" />
            <YAxis />
            <Tooltip content={renderCustomTooltip} />
            <Legend onClick={(e) => handleLegendClickBar(e.dataKey)} />
            <Bar dataKey="count" fill="#FFCE56" fillOpacity={hiddenBar.includes('count') ? 0.2 : 1} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>{t('admin.users_by_skills')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={skillsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="skill" />
            <YAxis />
            <Tooltip content={renderCustomTooltip} />
            <Legend onClick={(e) => handleLegendClickBar(e.dataKey)} />
            <Bar dataKey="count" fill="#8884d8" fillOpacity={hiddenBar.includes('count') ? 0.2 : 1} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>{t('admin.users_by_work_options')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={workOptionsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="workOption" />
            <YAxis />
            <Tooltip content={renderCustomTooltip} />
            <Legend onClick={(e) => handleLegendClickBar(e.dataKey)} />
            <Bar dataKey="count" fill="#8dd1e1" fillOpacity={hiddenBar.includes('count') ? 0.2 : 1} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
