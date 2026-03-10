import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFactCheck } from '../contexts/FactCheckProvider';
import { useTheme } from '../contexts/ThemeContext';
import { TextZoom } from '../TextZoom/TextZoom';
import SEOHead from '../SEO/SEOHead';
import FactCheckHero from './FactCheckHero/FactCheckHero';
import FactCheckFilters from './FactCheckFilters/FactCheckFilters';
import FactCheckList from './FactCheckList/FactCheckList';
import FactCheckHowItWorks from './FactCheckHowItWorks/FactCheckHowItWorks';
import FactCheckSignalForm from './FactCheckSignalForm/FactCheckSignalForm';
import FactCheckPartners from './FactCheckPartners/FactCheckPartners';
import './factCheck.css';

const FactCheck = () => {
  const { t } = useTranslation('factcheck');
  const location = useLocation();
  const { getPublicFeed, getCategories, getPublicStats } = useFactCheck();
  const { theme, toggleTheme } = useTheme();
  const prevThemeRef = useRef(theme);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Default to light theme on this page, persist across refresh and back-navigation
  useEffect(() => {
    const isRefresh = localStorage.getItem('fc-page-active') === 'true';

    if (!isRefresh) {
      // Save the theme we're coming from (academy/global)
      localStorage.setItem('fc-prev-theme', theme);
      // Restore saved FC theme or default to light
      const savedFcTheme = localStorage.getItem('fc-theme') || 'light';
      localStorage.setItem('fc-theme', savedFcTheme);
      if (theme !== savedFcTheme) {
        toggleTheme();
      }
    }
    localStorage.setItem('fc-page-active', 'true');

    return () => {
      localStorage.removeItem('fc-page-active');
      // Keep fc-theme for back-navigation
      const prevTheme = localStorage.getItem('fc-prev-theme');
      if (prevTheme) {
        localStorage.removeItem('fc-prev-theme');
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme !== prevTheme) {
          toggleTheme();
        }
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Track theme changes while on FC page
  useEffect(() => {
    if (localStorage.getItem('fc-page-active') === 'true') {
      localStorage.setItem('fc-theme', theme);
    }
  }, [theme]);

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedVerdict, setSelectedVerdict] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sort, setSort] = useState('newest');

  const loadFeed = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort };
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedVerdict) params.verdict = selectedVerdict;
      if (selectedType) params.type = selectedType;

      const response = await getPublicFeed(params);
      setItems(response?.items || []);
      setPagination(response?.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      const [cats, statsData] = await Promise.all([
        getCategories(),
        getPublicStats(),
      ]);
      setCategories(cats);
      setStats(statsData);
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    loadFeed(1);
  }, [search, selectedCategory, selectedVerdict, selectedType, sort]);

  const handlePageChange = (newPage) => {
    loadFeed(newPage);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    // Reset verdict when switching to signals (signals don't have verdicts)
    if (type === 'signals') {
      setSelectedVerdict('');
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedVerdict('');
    setSelectedType('');
    setSort('newest');
  };

  return (
    <div className="fc">
      <SEOHead
        title={`${t('hero.title')} — ${t('hero.subtitle')} | Pensa Club`}
        description={t('hero.description')}
        keywords="проверка на факти, дезинформация, фалшиви новини, факт-чек, fact check, пенсионери, възрастни хора, Pensa Club"
        image="/images/factcheck/factcheck.jpg"
      />
      <TextZoom />
      <FactCheckHero
        stats={stats}
        onSearch={setSearch}
      />
      <FactCheckFilters
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedVerdict={selectedVerdict}
        onVerdictChange={setSelectedVerdict}
        selectedType={selectedType}
        onTypeChange={handleTypeChange}
        sort={sort}
        onSortChange={setSort}
        search={search}
        onSearchChange={setSearch}
        totalResults={pagination.total}
        onClearFilters={handleClearFilters}
      />
      <FactCheckList
        items={items}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
      <FactCheckHowItWorks />
      <FactCheckSignalForm />
      <FactCheckPartners />
    </div>
  );
};

export default FactCheck;
