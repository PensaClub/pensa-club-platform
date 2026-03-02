import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMappingContext } from '../../contexts/MapContext';
import './allUsersStatistics.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line,
  PieChart, Pie, Cell, ResponsiveContainer,
  Area, AreaChart
} from 'recharts';

export const AllUsersStatistics = () => {
  const { onAllUsers, allUsers } = useMappingContext();
  const { t } = useTranslation('admin');
  const [hiddenBar, setHiddenBar] = useState([]);
  const [hiddenLine, setHiddenLine] = useState([]);
  const [hiddenPie, setHiddenPie] = useState([]);
  const [registrationFilter, setRegistrationFilter] = useState('last_week');
  const [optionData, setOptionData] = useState({ skills: [], workOptions: [], interestOptions: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await onAllUsers();
      } finally {
        setIsLoading(false);
      }
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
    
    const availableRoles = Array.from(new Set(users.map(user => user.role)));
     
    const rolesMap = {
      "user": t('admin.users'),
      "admin": t('admin.admins'),
      "guest": t('admin.guests')
    };
  
    return availableRoles.map(role => ({
      role: rolesMap[role] || role, 
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
    })).sort((a, b) => b.count - a.count); // Sort by count descending
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
      count: users.filter(user => user.details && user.details.interestOptions && user.details.interestOptions.includes(interest)).length
    })).sort((a, b) => b.count - a.count); // Sort by count descending
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
      count: users.filter(user => user.details && user.details.skills && user.details.skills.includes(skill)).length
    })).sort((a, b) => b.count - a.count); // Sort by count descending
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
      count: users.filter(user => user.details && user.details.workOptions && user.details.workOptions.includes(workOption)).length
    })).sort((a, b) => b.count - a.count); // Sort by count descending
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

  // Calculate totals for summary metrics
  const getTotalUsers = () => {
    if (!allUsers || !allUsers.response || !allUsers.response.accounts) return 0;
    return allUsers.response.accounts.length;
  };

  const getActiveUsers = () => {
    if (!allUsers || !allUsers.response || !allUsers.response.accounts) return 0;
    return allUsers.response.accounts.filter(user => user.enabled).length;
  };

  const getTotalAds = () => {
    if (!allUsers || !allUsers.response || !allUsers.response.accounts) return 0;
    return allUsers.response.accounts.reduce((sum, user) => sum + (user.ads ? user.ads.length : 0), 0);
  };

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

  // Define chart colors
  const COLORS = ['#3a86ff', '#ff006e', '#8338ec', '#38b000', '#ffbe0b', '#fb5607', '#00b4d8'];
  const PIE_COLORS = ['#38b000', '#ff006e', '#3a86ff', '#ffbe0b', '#8338ec', '#00b4d8'];

  return (
    <div className="all-users-statistics">
      <div className="dashboard-header">
        <h2 className="dashboard-title">{t('admin.all_users_statistics')}</h2>
        <p className="dashboard-subtitle">{t('admin.statistics_desc')}</p>
      </div>

      {isLoading ? (
        <div className="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="6" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p className="empty-state-message">{t('admin.loading_data')}</p>
        </div>
      ) : (
        <>
          <div className="dashboard-metrics">
            <div className="metric-card">
              <div className="metric-value">{getTotalUsers()}</div>
              <div className="metric-label">{t('admin.total_users')}</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{getActiveUsers()}</div>
              <div className="metric-label">{t('admin.active_users')}</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{getTotalAds()}</div>
              <div className="metric-label">{t('admin.total_ads')}</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">
                {getTotalUsers() > 0 ? (getActiveUsers() / getTotalUsers() * 100).toFixed(1) + '%' : '0%'}
              </div>
              <div className="metric-label">{t('admin.completion_rate')}</div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-container">
              <div className="chart-header">
                <h3 className="chart-title">{t('admin.users_by_role')}</h3>
              </div>
              <div className="chart-area">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoriesData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="role" tick={{ fontSize: 12 }} />
                    <YAxis width={35} tick={{ fontSize: 12 }} />
                    <Tooltip content={renderCustomTooltip} />
                    <Legend onClick={(e) => handleLegendClickBar(e.dataKey)} />
                    <Bar 
                      dataKey="total" 
                      name={t('admin.total')} 
                      fill={COLORS[0]} 
                      fillOpacity={hiddenBar.includes('total') ? 0.2 : 1}
                      animationDuration={1000}
                    />
                    <Bar 
                      dataKey="completed" 
                      name={t('admin.completed')} 
                      fill={COLORS[3]} 
                      fillOpacity={hiddenBar.includes('completed') ? 0.2 : 1}
                      animationDuration={1000}
                    />
                    <Bar 
                      dataKey="notCompleted" 
                      name={t('admin.not_completed')} 
                      fill={COLORS[1]} 
                      fillOpacity={hiddenBar.includes('notCompleted') ? 0.2 : 1}
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-container">
              <div className="chart-header">
                <h3 className="chart-title">{t('admin.users_by_status')}</h3>
              </div>
              <div className="chart-area">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      labelLine={true}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      animationDuration={1000}
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.status === t('admin.active') ? COLORS[3] : COLORS[1]}
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
            </div>

            <div className="chart-container full-width">
              <div className="chart-header">
                <h3 className="chart-title">{t('admin.users_by_registration_date')}</h3>
                <div className="filter-buttons">
                  <button 
                    className={`filter-btn ${registrationFilter === 'last_week' ? 'active' : ''}`} 
                    onClick={() => setRegistrationFilter('last_week')}
                  >
                    {t('admin.last_week')}
                  </button>
                  <button 
                    className={`filter-btn ${registrationFilter === 'last_month' ? 'active' : ''}`} 
                    onClick={() => setRegistrationFilter('last_month')}
                  >
                    {t('admin.last_month')}
                  </button>
                  <button 
                    className={`filter-btn ${registrationFilter === 'last_year' ? 'active' : ''}`} 
                    onClick={() => setRegistrationFilter('last_year')}
                  >
                    {t('admin.last_year')}
                  </button>
                </div>
              </div>
              <div className="chart-area">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={registrationData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0.2} /> 
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      interval={registrationFilter === 'last_year' ? 30 : registrationFilter === 'last_month' ? 5 : 1}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis width={35} tick={{ fontSize: 12 }} />
                    <Tooltip content={renderCustomTooltip} />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      name={t('admin.new_users')} 
                      stroke={COLORS[0]} 
                      fillOpacity={1}
                      fill="url(#colorCount)" 
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-container">
              <div className="chart-header">
                <h3 className="chart-title">{t('admin.monthly_user_growth')}</h3>
              </div>
              <div className="chart-area">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyUserGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis width={35} tick={{ fontSize: 12 }} />
                    <Tooltip content={renderCustomTooltip} />
                    <Legend onClick={(e) => handleLegendClickLine(e.dataKey)} />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      name={t('admin.count')} 
                      stroke={COLORS[2]} 
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                      strokeOpacity={hiddenLine.includes('count') ? 0.2 : 1}
                      animationDuration={1000}
                    />
            </LineChart>
               </ResponsiveContainer>
             </div>
           </div>

           <div className="chart-container">
             <div className="chart-header">
               <h3 className="chart-title">{t('admin.average_ads_per_user')}</h3>
             </div>
             <div className="chart-area">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={adsPerUserData}
                     dataKey="value"
                     nameKey="name"
                     cx="50%"
                     cy="50%"
                     outerRadius={80}
                     label={({ name, value }) => `${name}: ${value.toFixed(2)}`}
                     labelLine={true}
                     animationDuration={1000}
                   >
                     {adsPerUserData.map((entry, index) => (
                       <Cell
                         key={`cell-${index}`}
                         fill={COLORS[4]}
                         fillOpacity={hiddenPie.includes(entry.name) ? 0.2 : 1}
                         onClick={() => handleLegendClickPie(entry.name)}
                       />
                     ))}
                   </Pie>
                   <Tooltip content={renderCustomTooltip} />
                 </PieChart>
               </ResponsiveContainer>
             </div>
           </div>

           <div className="chart-container">
             <div className="chart-header">
               <h3 className="chart-title">{t('admin.users_by_region')}</h3>
             </div>
             <div className="chart-area">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart 
                   data={regionData.slice(0, 10)} 
                   layout="vertical" 
                   margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                 >
                   <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
                   <XAxis type="number" tick={{ fontSize: 12 }} />
                   <YAxis 
                     type="category" 
                     dataKey="region" 
                     width={80}
                     tick={{ fontSize: 12 }}
                   />
                   <Tooltip content={renderCustomTooltip} />
                   <Legend onClick={(e) => handleLegendClickBar(e.dataKey)} />
                   <Bar 
                     dataKey="count" 
                     name={t('admin.count')} 
                     fill={COLORS[5]} 
                     fillOpacity={hiddenBar.includes('count') ? 0.2 : 1}
                     animationDuration={1000}
                   />
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </div>

           <div className="chart-container">
             <div className="chart-header">
               <h3 className="chart-title">{t('admin.users_by_interests')}</h3>
             </div>
             <div className="chart-area">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart 
                   data={interestsData.slice(0, 10)} 
                   layout="vertical" 
                   margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                 >
                   <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
                   <XAxis type="number" tick={{ fontSize: 12 }} />
                   <YAxis 
                     type="category" 
                     dataKey="interest" 
                     width={150}
                     tick={{ fontSize: 12 }}
                   />
                   <Tooltip content={renderCustomTooltip} />
                   <Legend onClick={(e) => handleLegendClickBar(e.dataKey)} />
                   <Bar 
                     dataKey="count" 
                     name={t('admin.count')} 
                     fill={COLORS[0]} 
                     fillOpacity={hiddenBar.includes('count') ? 0.2 : 1}
                     animationDuration={1000}
                   />
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </div>

           <div className="chart-container">
             <div className="chart-header">
               <h3 className="chart-title">{t('admin.users_by_skills')}</h3>
             </div>
             <div className="chart-area">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart 
                   data={skillsData.slice(0, 10)} 
                   layout="vertical" 
                   margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                 >
                   <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
                   <XAxis type="number" tick={{ fontSize: 12 }} />
                   <YAxis 
                     type="category" 
                     dataKey="skill" 
                     width={150}
                     tick={{ fontSize: 12 }}
                   />
                   <Tooltip content={renderCustomTooltip} />
                   <Legend onClick={(e) => handleLegendClickBar(e.dataKey)} />
                   <Bar 
                     dataKey="count" 
                     name={t('admin.count')} 
                     fill={COLORS[2]} 
                     fillOpacity={hiddenBar.includes('count') ? 0.2 : 1}
                     animationDuration={1000}
                   />
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </div>

           <div className="chart-container">
             <div className="chart-header">
               <h3 className="chart-title">{t('admin.users_by_work_options')}</h3>
             </div>
             <div className="chart-area">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart 
                   data={workOptionsData.slice(0, 10)} 
                   layout="vertical" 
                   margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                 >
                   <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
                   <XAxis type="number" tick={{ fontSize: 12 }} />
                   <YAxis 
                     type="category" 
                     dataKey="workOption" 
                     width={150}
                     tick={{ fontSize: 12 }}
                   />
                   <Tooltip content={renderCustomTooltip} />
                   <Legend onClick={(e) => handleLegendClickBar(e.dataKey)} />
                   <Bar 
                     dataKey="count" 
                     name={t('admin.count')} 
                     fill={COLORS[6]} 
                     fillOpacity={hiddenBar.includes('count') ? 0.2 : 1}
                     animationDuration={1000}
                   />
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </div>
         </div>
       </>
     )}
   </div>
 );
};