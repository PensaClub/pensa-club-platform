// src/components/AcademyCourses/AcademyCourses.jsx

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useAcademyCourses } from '../contexts/AcademyCoursesProvider';
import { AcademyCoursesHero } from './AcademyCoursesHero/AcademyCoursesHero';
import { AcademyProgramTracks } from './AcademyProgramTracks/AcademyProgramTracks';
import { AcademyCoursesList } from './AcademyCoursesList/AcademyCoursesList';
import './academyCourses.css';
import AcademyCoursesSkeleton from './AcademyCoursesSkeleton/AcademyCoursesSkeleton';
import SEOHead from '../SEO/SEOHead';
import ScrollToTop from '../ScrollToTop/ScrollToTop';
import { TextZoom } from '../TextZoom/TextZoom';

const PROGRAM_COLORS = {
  'Мобилни устройства': { primary: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', icon: '📱' },
  'Интернет сигурност': { primary: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', icon: '🔒' },
  'Дигитална грамотност': { primary: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', icon: '📚' },
  'Социални мрежи': { primary: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', icon: '💬' },
  'Офис приложения': { primary: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', icon: '📄' },
  'Онлайн банкиране': { primary: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', icon: '💳' },
  'default': { primary: '#ff6347', gradient: 'linear-gradient(135deg, #ff6347 0%, #e5533d 100%)', icon: '🎓' }
};

export const AcademyCourses = () => {
  const { t } = useTranslation('academy');
  const { getCourses, getCourseCategories } = useAcademyCourses();
  const [searchParams, setSearchParams] = useSearchParams();

  // Local state
  const [localCourses, setLocalCourses] = useState([]);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const cacheRef = useRef({});

  // Read filters from URL
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const currentCategory = searchParams.get('category') || '';
  const currentDifficulty = searchParams.get('difficulty') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sortBy') || '';
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  // Update URL params
  const updateParams = useCallback((updates) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);

      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== '' && value !== 'all') {
          newParams.set(key, String(value));
        } else {
          newParams.delete(key);
        }
      });

      // Reset page to 1 when non-page filters change
      if (!('page' in updates)) {
        newParams.delete('page');
      } else if (updates.page === 1) {
        newParams.delete('page');
      }

      return newParams;
    }, { replace: true });
  }, [setSearchParams]);

  // Fetch categories
  useEffect(() => {
    if (!categoriesLoaded) {
      const loadCategories = async () => {
        const data = await getCourseCategories();
        const normalized = (data || []).map((cat, index) => {
          const name = typeof cat === 'string' ? cat : cat.name;
          const colors = PROGRAM_COLORS[name] || PROGRAM_COLORS.default;
          return { id: index, slug: name, name, ...colors };
        });
        setCategories(normalized);
        setCategoriesLoaded(true);
      };
      loadCategories();
    }
  }, [getCourseCategories, categoriesLoaded]);

  // Fetch courses based on URL params
  useEffect(() => {
    const cacheKey = JSON.stringify({
      p: currentPage,
      c: currentCategory,
      d: currentDifficulty,
      s: currentSearch,
      sb: currentSort
    });

    if (cacheRef.current[cacheKey]) {
      setLocalCourses(cacheRef.current[cacheKey].courses);
      setPagination(cacheRef.current[cacheKey].pagination);
      setLoading(false);
      return;
    }

    const fetchCourses = async () => {
      setLoading(true);
      try {
        const params = { page: currentPage, limit: 12 };
        if (currentCategory) params.category = currentCategory;
        if (currentDifficulty && currentDifficulty !== 'all') params.difficulty = currentDifficulty;
        if (currentSearch) params.search = currentSearch;
        if (currentSort) params.sortBy = currentSort;

        const data = await getCourses(params);
        const result = {
          courses: data.courses || [],
          pagination: data.pagination || {}
        };

        cacheRef.current[cacheKey] = result;
        setLocalCourses(result.courses);
        setPagination(result.pagination);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setLocalCourses([]);
        setPagination({});
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [currentPage, currentCategory, currentDifficulty, currentSearch, currentSort, getCourses]);

  // Stats for hero
  const stats = useMemo(() => ({
    totalCourses: pagination.total || localCourses.length,
    totalPrograms: categories.length,
    totalEnrolled: localCourses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0)
  }), [localCourses, categories, pagination]);

  // Handle program select (toggle category)
  const handleProgramSelect = useCallback((programSlug) => {
    const newCategory = currentCategory === programSlug ? '' : programSlug;
    updateParams({ category: newCategory });
  }, [currentCategory, updateParams]);

  // Selected category data for visual styling
  const selectedCategoryData = useMemo(() => {
    if (!currentCategory) return null;
    return categories.find(c => c.name === currentCategory) || null;
  }, [currentCategory, categories]);

  // SEO meta data
  const metaData = useMemo(() => {
    const siteName = 'DigiBridge Academy';
    let title, description;

    if (currentSearch) {
      title = t('academyCoursesSeo.searchTitle', { term: currentSearch, defaultValue: `Търсене: ${currentSearch} | Курсове | ${siteName}` });
      description = t('academyCoursesSeo.searchDescription', { term: currentSearch, count: pagination.total || 0, defaultValue: `Намерени ${pagination.total || 0} курса за "${currentSearch}" в ${siteName}.` });
    } else if (currentCategory) {
      title = t('academyCoursesSeo.categoryTitle', { category: currentCategory, defaultValue: `Курсове по ${currentCategory} | ${siteName}` });
      description = t('academyCoursesSeo.categoryDescription', { category: currentCategory, defaultValue: `Безплатни онлайн курсове по ${currentCategory} за дигитална грамотност. ${siteName} — обучение за възрастни хора 60+.` });
    } else if (currentPage > 1) {
      title = t('academyCoursesSeo.pageTitle', { page: currentPage, defaultValue: `Курсове - Страница ${currentPage} | ${siteName}` });
      description = t('academyCoursesSeo.listDescription', { defaultValue: 'Безплатни онлайн курсове за дигитална грамотност, интернет сигурност и технологии. DigiBridge Academy — обучение за възрастни хора 60+.' });
    } else {
      title = t('academyCoursesSeo.listTitle', { defaultValue: `Курсове за дигитална грамотност | ${siteName}` });
      description = t('academyCoursesSeo.listDescription', { defaultValue: 'Безплатни онлайн курсове за дигитална грамотност, интернет сигурност и технологии. DigiBridge Academy — обучение за възрастни хора 60+.' });
    }

    return {
      title,
      description,
      keywords: 'курсове, дигитална грамотност, DigiBridge Academy, Pensa Club, безплатни курсове, обучение, пенсионери, 60+, интернет сигурност'
    };
  }, [currentSearch, currentCategory, currentPage, pagination.total, t]);

  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": metaData.title,
    "description": metaData.description,
    "url": window.location.href,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Pensa Club",
      "url": "https://pensa.club"
    },
    "provider": {
      "@type": "EducationalOrganization",
      "name": "DigiBridge Academy",
      "url": "https://pensa.club/academy",
      "sameAs": ["https://www.facebook.com/profile.php?id=61578204366479"]
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": window.location.href
    }
  }), [metaData]);

  if (loading) {
    return <AcademyCoursesSkeleton />;
  }

  return (
    <div className="academyCourses">
      <TextZoom />
      <SEOHead
        title={metaData.title}
        description={metaData.description}
        keywords={metaData.keywords}
        image="/images/digibridge/hero-image.jpg"
        type="website"
        structuredData={structuredData}
      />
      <AcademyCoursesHero
        totalCourses={stats.totalCourses}
        totalPrograms={stats.totalPrograms}
        totalEnrolled={stats.totalEnrolled}
      />

      <div className="academyCourses-main">
        {/* Program Tracks */}
        <section className="academyCourses-section">
          <div className="academyCourses-section-header">
            <h2 className="academyCourses-section-title">
              {t('academyCourses.programsTitle')}
            </h2>
            <p className="academyCourses-section-subtitle">
              {t('academyCourses.programsSubtitle')}
            </p>
          </div>

          <AcademyProgramTracks
            programs={categories}
            selectedProgram={currentCategory}
            onProgramSelect={handleProgramSelect}
          />
        </section>

        {/* Courses List */}
        <section className="academyCourses-section academyCourses-section--courses">
          <AcademyCoursesList
            courses={localCourses}
            pagination={pagination}
            isLoading={loading}
            program={selectedCategoryData}
            onClose={() => updateParams({ category: '' })}
            difficulty={currentDifficulty}
            search={currentSearch}
            sortBy={currentSort}
            onFilterChange={updateParams}
          />
        </section>
      </div>
      <ScrollToTop />

    </div>
  );
};

export default AcademyCourses;