// src/components/AcademyCourses/AcademyCourses.jsx

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademyCourses } from '../contexts/AcademyCoursesProvider';
import { AcademyCoursesHero } from './AcademyCoursesHero/AcademyCoursesHero';
// import { AcademyProgramTracks } from './AcademyProgramTracks/AcademyProgramTracks';
// import { AcademyCoursesList } from './AcademyCoursesList/AcademyCoursesList';
import './academyCourses.css';
import { AcademyProgramTracks } from './AcademyProgramTracks/AcademyProgramTracks';
import { AcademyCoursesList } from './AcademyCoursesList/AcademyCoursesList';

// Цветова схема за програмите
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
  const { t } = useTranslation();
  const { 
    courses,
    isLoading,
    getCourses, 
    getCourseCategories 
  } = useAcademyCourses();

  const [categories, setCategories] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  // Fetch categories
  useEffect(() => {
    if (!categoriesLoaded) {
      const loadCategories = async () => {
        const data = await getCourseCategories();
        const normalized = (data || []).map((cat, index) => {
          const name = typeof cat === 'string' ? cat : cat.name;
          const colors = PROGRAM_COLORS[name] || PROGRAM_COLORS.default;
          return {
            id: index,
            slug: name,
            name: name,
            ...colors
          };
        });
        setCategories(normalized);
        setCategoriesLoaded(true);
      };
      loadCategories();
    }
  }, [getCourseCategories, categoriesLoaded]);

  // Fetch courses
  useEffect(() => {
    if (courses.length === 0) {
      getCourses({});
    }
  }, []);

  // Group courses by category
  const programsWithCourses = useMemo(() => {
    return categories.map(category => {
      const categoryCourses = courses.filter(course => {
        const courseCat = course.category?.name || course.categoryName || course.category;
        return courseCat === category.name;
      });
      return {
        ...category,
        courses: categoryCourses,
        courseCount: categoryCourses.length
      };
    }).filter(p => p.courseCount > 0);
  }, [categories, courses]);

  // Stats
  const stats = useMemo(() => ({
    totalCourses: courses.length,
    totalPrograms: programsWithCourses.length,
    totalEnrolled: courses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0)
  }), [courses, programsWithCourses]);

  // Selected program courses
  const selectedProgramData = useMemo(() => {
    if (!selectedProgram) return null;
    return programsWithCourses.find(p => p.slug === selectedProgram);
  }, [selectedProgram, programsWithCourses]);

  const handleProgramSelect = useCallback((programSlug) => {
    setSelectedProgram(prev => prev === programSlug ? null : programSlug);
  }, []);

  return (
    <div className="academyCourses">
      {/* Hero */}
      <AcademyCoursesHero 
        totalCourses={stats.totalCourses}
        totalPrograms={stats.totalPrograms}
        totalEnrolled={stats.totalEnrolled}
      />

      {/* Main Content */}
      <div className="academyCourses-main">
        {isLoading ? (
          <div className="academyCourses-loading">
            <div className="academyCourses-loading-spinner">
              <div className="academyCourses-loading-ring"></div>
              <div className="academyCourses-loading-ring"></div>
              <div className="academyCourses-loading-ring"></div>
            </div>
            <p className="academyCourses-loading-text">{t('academyCourses.loading')}</p>
          </div>
        ) : programsWithCourses.length === 0 ? (
          <div className="academyCourses-empty">
            <div className="academyCourses-empty-icon">📚</div>
            <h3 className="academyCourses-empty-title">{t('academyCourses.noCourses')}</h3>
            <p className="academyCourses-empty-text">{t('academyCourses.checkBackLater')}</p>
          </div>
        ) : (
          <>
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
                programs={programsWithCourses}
                selectedProgram={selectedProgram}
                onProgramSelect={handleProgramSelect}
              />
            </section>

            {/* Courses List */}
            {selectedProgramData && (
              <section className="academyCourses-section academyCourses-section--courses">
                <AcademyCoursesList 
                  program={selectedProgramData}
                  courses={selectedProgramData.courses}
                  onClose={() => setSelectedProgram(null)}
                />
              </section>
            )}

            {/* All Courses Preview (when no program selected) */}
            {!selectedProgram && (
              <section className="academyCourses-section">
                <div className="academyCourses-section-header">
                  <h2 className="academyCourses-section-title">
                    {t('academyCourses.popularCourses')}
                  </h2>
                  <p className="academyCourses-section-subtitle">
                    {t('academyCourses.popularCoursesSubtitle')}
                  </p>
                </div>
                
                <AcademyCoursesList 
                  courses={courses.slice(0, 8)}
                  showViewAll={courses.length > 8}
                />
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};