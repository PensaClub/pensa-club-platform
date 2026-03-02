import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useClubContext } from '../../contexts/ClubContext';
import { useArticleContext } from '../../contexts/ArticleContext';
import { useInitiativeContext } from '../../contexts/InitiativeProvider';
import './platformStats.css';

export const PlatformStats = () => {
  const { t } = useTranslation('home');
  const navigate = useNavigate();
  const { getAllClubs } = useClubContext();
  const { getAllArticles } = useArticleContext();
  const { 
    initiatives, 
    projects,
    publications,
    getAllInitiatives, 
    getAllProjects,
    getAllPublications
  } = useInitiativeContext();

  const [stats, setStats] = useState({
    clubs: 0,
    articles: 0,
    initiatives: 0,
    publications: 0,
    projects: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        setIsLoading(true);

        const [clubsResponse, articlesData] = await Promise.all([
          getAllClubs(false, 1, 500),
          getAllArticles(false)
        ]);

        const clubsData = clubsResponse.clubs || clubsResponse || [];

        await getAllInitiatives(1);
        await getAllProjects(1, false);
        await getAllPublications(1, false, false);

        setTimeout(() => {
          setStats({
            clubs: Array.isArray(clubsData) ? clubsData.length : 0,
            articles: Array.isArray(articlesData) ? articlesData.length : 0,
            initiatives: Array.isArray(initiatives) ? initiatives.length : 0,
            publications: Array.isArray(publications) ? publications.length : 0,
            projects: Array.isArray(projects) ? projects.length : 0
          });

          setIsLoading(false);
        }, 300);

      } catch (error) {
        console.error('Error fetching platform statistics:', error);
        setIsLoading(false);
      }
    };

    fetchAllStats();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setStats(prevStats => ({
        ...prevStats,
        initiatives: Array.isArray(initiatives) ? initiatives.length : 0,
        publications: Array.isArray(publications) ? publications.length : 0,
        projects: Array.isArray(projects) ? projects.length : 0
      }));
    }
  }, [initiatives, publications, projects, isLoading]);

  const getLabel = (key, count) => {
    if (count === 1) {
      return t(`platformStats.${key}.singular`);
    }
    return t(`platformStats.${key}.plural`);
  };

  const statsConfig = [
    {
      key: 'clubs',
      color: '#1B6D4D',
      bgColor: 'rgba(27, 109, 77, 0.1)',
      path: '/clubs'
    },
    {
      key: 'articles',
      color: '#E26020',
      bgColor: 'rgba(226, 96, 32, 0.1)',
      path: '/articles'
    },
    {
      key: 'initiatives',
      color: '#0072B5',
      bgColor: 'rgba(0, 114, 181, 0.1)',
      path: '/initiatives'
    },
    {
      key: 'publications',
      color: '#8A4F7D',
      bgColor: 'rgba(138, 79, 125, 0.1)',
      path: '/publications'
    },
    {
      key: 'projects',
      color: '#1B8B8A',
      bgColor: 'rgba(27, 139, 138, 0.1)',
      path: '/projects'
    }
  ];

  const visibleStats = statsConfig.filter(config => stats[config.key] > 0);

  const handleStatClick = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <section className="platform-stats-section">
        <div className="platform-stats-container">
          <div className="platform-stats-loading">
            <div className="platform-stats-spinner"></div>
          </div>
        </div>
      </section>
    );
  }

  if (visibleStats.length === 0) {
    return null;
  }

  return (
    <section className="platform-stats-section">
      <div className="platform-stats-container">
        <div className="platform-stats-grid">
          {visibleStats.map((config, index) => (
            <div
              key={config.key}
              className="platform-stat-card"
              style={{
                '--stat-color': config.color,
                '--stat-bg-color': config.bgColor,
                '--animation-delay': `${index * 0.1}s`
              }}
              onClick={() => handleStatClick(config.path)}
            >
              <div className="platform-stat-content">
                <div className="platform-stat-number">
                  {stats[config.key]}
                </div>
                <div className="platform-stat-label">
                  {getLabel(config.key, stats[config.key])}
                </div>
              </div>
              <div className="platform-stat-decoration"></div>
            </div>
          ))}
        </div>

        <div className="platform-stats-wave">
          <svg viewBox="0 0 1200 100" preserveAspectRatio="none">
            <path
              d="M0,50 Q300,10 600,50 T1200,50 L1200,100 L0,100 Z"
              fill="rgba(226, 96, 32, 0.05)"
            />
          </svg>
        </div>
      </div>
    </section>
  );
};