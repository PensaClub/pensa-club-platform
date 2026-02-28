import { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// import { DigiBridgeHeader } from './DigiBridgeHeader/DigiBridgeHeader';
import { DigiBridgeHero } from './DigiBridgeHero/DigiBridgeHero';
import './digiBridgeAcademy.css';
import { DigiBridgeAbout } from './DigiBridgeAbout/DigiBridgeAbout';
import { DigiBridgeHowItWorks } from './DigiBridgeHowItWorks/DigiBridgeHowItWorks';
import { DigiBridgeFeatures } from './DigiBridgeFeatures/DigiBridgeFeatures';
import { DigiBridgeMentors } from './DigiBridgeMentors/DigiBridgeMentors';
import { DigiBridgeTestimonials } from './DigiBridgeTestimonials/DigiBridgeTestimonials';
import { DigiBridgeCTA } from './DigiBridgeCTA/DigiBridgeCTA';
import { DigiBridgePartners } from './DigiBridgePartners/DigiBridgePartners';
import { DigiBridgeFAQ } from './DigiBridgeFAQ/DigiBridgeFAQ';
import { DigiBridgeTestimonialForm } from './DigiBridgeTestimonialForm/DigiBridgeTestimonialForm';
import { useAcademy } from '../contexts/AcademyProvider';
import SEOHead from '../SEO/SEOHead';

export const DigiBridgeAcademy = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { fetchStats } = useAcademy(); 

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await fetchStats(); 
        setStats(data);
      } catch (error) {
        console.error('Error fetching academy stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [fetchStats]);

  // ✅ META DATA
  const metaData = useMemo(() => {
    const title = t('digiBridge.meta.title', {
      defaultValue: 'DigiBridge Academy - Дигитална грамотност за всички | Pensa Club'
    });

    const description = t('digiBridge.meta.description', {
      defaultValue: 'Безплатна платформа за обучение по дигитална грамотност. Свържете се с ментор и започнете своето дигитално пътешествие днес. Част от европейския проект BRIDGE.'
    });

    const keywords = t('digiBridge.meta.keywords', {
      defaultValue: 'дигитална грамотност, обучение онлайн, ментори, BRIDGE проект, безплатни курсове, пенсионери, възрастни, Pensa Club, образование'
    });

    return {
      title,
      description,
      keywords,
      image: '/images/digibridge/hero-image.jpg'
    };
  }, [t]);

  // ✅ STRUCTURED DATA - EDUCATIONAL ORGANIZATION + COURSE
  const structuredData = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "EducationalOrganization",
          "name": "DigiBridge Academy",
          "description": metaData.description,
          "url": "https://pensa.club/academy",
          "logo": "https://pensa.club/images/digibridge/logo.png",
          "image": "https://pensa.club/images/digibridge/hero-image.jpg",
          "parentOrganization": {
            "@type": "Organization",
            "name": "Pensa Foundation",
            "url": "https://pensa.club"
          },
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "BG"
          },
          ...(stats && {
            "numberOfStudents": stats.totalStudents || 0,
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": stats.averageRating || 4.8,
              "ratingCount": stats.totalReviews || 1
            }
          }),
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer support",
            "email": "info@pensa.club"
          },
          "sameAs": [
            "https://www.facebook.com/profile.php?id=61578204366479"
          ],
          "inLanguage": ["bg", "de", "en"]
        },
        {
          "@type": "Course",
          "name": "Програма за дигитална грамотност",
          "description": "Безплатна програма за обучение по дигитална грамотност с персонален ментор",
          "provider": {
            "@type": "EducationalOrganization",
            "name": "DigiBridge Academy",
            "url": "https://pensa.club/academy"
          },
          "educationalLevel": "Beginner to Intermediate",
          "isAccessibleForFree": true,
          "availableLanguage": ["bg", "de", "en"],
          "teaches": "Дигитална грамотност, използване на компютър, интернет, мобилни устройства",
          "timeRequired": "P3M",
          "coursePrerequisites": "Няма предварителни изисквания",
          "hasCourseInstance": {
            "@type": "CourseInstance",
            "courseMode": "online",
            "courseWorkload": "PT2H",
            "instructor": {
              "@type": "Person",
              "name": "Ментори на DigiBridge Academy"
            }
          }
        },
        {
          "@type": "WebPage",
          "name": metaData.title,
          "description": metaData.description,
          "url": "https://pensa.club/academy",
          "inLanguage": i18n.language,
          "isPartOf": {
            "@type": "WebSite",
            "name": "Pensa Club",
            "url": "https://pensa.club"
          },
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Начало",
                "item": "https://pensa.club"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "DigiBridge Academy",
                "item": "https://pensa.club/academy"
              }
            ]
          }
        }
      ]
    };
  }, [metaData, stats, i18n.language]);

  if (loading) {
    return (
      <div className="digibridge-academy-wrapper">
        <SEOHead
          title={metaData.title}
          description={metaData.description}
          keywords={metaData.keywords}
          image={metaData.image}
          type="website"
          structuredData={structuredData}
          canonical="https://pensa.club/academy"
        />
        <div className="dba-skeleton">
          <div className="dba-skeleton-hero">
            <div className="dba-skeleton-line dba-skeleton-title"></div>
            <div className="dba-skeleton-line dba-skeleton-subtitle"></div>
            <div className="dba-skeleton-line dba-skeleton-subtitle-sm"></div>
            <div className="dba-skeleton-btn"></div>
          </div>
          <div className="dba-skeleton-stats">
            <div className="dba-skeleton-stat-card"></div>
            <div className="dba-skeleton-stat-card"></div>
            <div className="dba-skeleton-stat-card"></div>
            <div className="dba-skeleton-stat-card"></div>
          </div>
          <div className="dba-skeleton-content">
            <div className="dba-skeleton-section">
              <div className="dba-skeleton-line dba-skeleton-section-title"></div>
              <div className="dba-skeleton-line dba-skeleton-text"></div>
              <div className="dba-skeleton-line dba-skeleton-text"></div>
              <div className="dba-skeleton-line dba-skeleton-text-short"></div>
            </div>
            <div className="dba-skeleton-cards">
              <div className="dba-skeleton-card"></div>
              <div className="dba-skeleton-card"></div>
              <div className="dba-skeleton-card"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="digibridge-academy-wrapper">
      {/* ✅ SEO HEAD */}
      <SEOHead
        title={metaData.title}
        description={metaData.description}
        keywords={metaData.keywords}
        image={metaData.image}
        type="website"
        structuredData={structuredData}
        canonical="https://pensa.club/academy"
      />

      {/* <DigiBridgeHeader /> */}
      <DigiBridgeHero />

      <DigiBridgeAbout stats={stats} loading={loading} />
      <DigiBridgeHowItWorks />
      <DigiBridgeFeatures />
      <DigiBridgeMentors stats={stats} loading={loading} />
      <DigiBridgeTestimonials />
      <DigiBridgeCTA />
      <DigiBridgePartners />
      <DigiBridgeFAQ />
      <DigiBridgeTestimonialForm />
    </div>
  );
};

export default DigiBridgeAcademy;