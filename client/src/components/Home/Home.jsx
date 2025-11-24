import "./home.css";
import { Fade, Slide } from "react-awesome-reveal";
import { Hero } from "./HeroSection/Hero";
import { LastPosts } from "./LastPosts/LastPosts";
import { NewsSubscribe } from "./NewsSubscribe/NewsSubscribe";
import { useEffect, useMemo } from 'react';
import { MottoSection } from "./MottoSection/MottoSection";
import { AboutSection } from "./AboutSection/About";
import { UserSuggestion } from "../UserSuggestion/UserSuggestion";
import { FeaturedArticles } from "./FeaturedArticles/FeaturedArticles";
import { InitiativesShowcase } from "./InitiativesShowcase/InitiativesShowcase";
import { ConstellationShowcase } from "./ConstellationShowcase/ConstellationShowcase";
import { PlatformStats } from "./PlatformStats/PlatformStats";
import ScrollToTop from "../ScrollToTop/ScrollToTop";
import { TextZoom } from "../TextZoom/TextZoom";
import { useTranslation } from 'react-i18next';
import SEOHead from "../SEO/SEOHead";

export const Home = () => {

  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const metaData = useMemo(() => {
    return {
      title: t('home.meta.title', {
        defaultValue: 'Pensa Club - Платформа за пенсионери в дигиталния свят | DigiBridge Academy'
      }),
      description: t('home.meta.description', {
        defaultValue: 'Присъединете се към най-голямата дигитална общност за пенсионери в България! Над 150 клуба, безплатни курсове за дигитална грамотност, ментори, PensaMap карта. Научете се да използвате технологиите безопасно и уверено.'
      }),
      keywords: t('home.meta.keywords', {
        defaultValue: 'Pensa Club, пенсионери, пенсионерски клубове, DigiBridge Academy, дигитална грамотност, безплатни курсове, ментори, PensaMap, карта на клубове, технологии за възрастни, общност 60+, активен живот, интернет сигурност, електронна комуникация'
      }),
      image: '/images/iniciatives/iniciatives-2.jpg'
    };
  }, [t]);

  // ✅ STRUCTURED DATA - ORGANIZATION
  const organizationData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Pensa Club",
    "alternateName": ["Pensa Foundation", "Пенса Клуб"],
    "url": "https://pensa.club",
    "logo": {
      "@type": "ImageObject",
      "url": "https://pensa.club/logo.png",
      "width": 250,
      "height": 60
    },
    "description": "Иновативна дигитална платформа за подобряване качеството на живот на възрастните хора в България",
    "foundingDate": "2023",
    "slogan": "Достоен живот в третата възраст",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "BG",
      "addressLocality": "България"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "availableLanguage": ["Bulgarian", "German", "English"]
    },
    "sameAs": [
      "https://www.facebook.com/profile.php?id=61578204366479"
    ],
    "areaServed": {
      "@type": "Country",
      "name": "Bulgaria"
    },
    "knowsAbout": [
      "Дигитална грамотност",
      "Образование за възрастни",
      "Технологии за пенсионери",
      "Интернет безопасност",
      "Електронна комуникация"
    ]
  }), []);

  // ✅ STRUCTURED DATA - WEBSITE
  const websiteData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Pensa Club",
    "url": "https://pensa.club",
    "description": "Дигитална платформа за пенсионери - курсове, ментори, общност, карта на клубове",
    "inLanguage": ["bg", "de", "en"],
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://pensa.club/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Pensa Foundation",
      "logo": {
        "@type": "ImageObject",
        "url": "https://pensa.club/logo.png"
      }
    }
  }), []);

  // ✅ STRUCTURED DATA - EDUCATIONAL ORGANIZATION (DigiBridge Academy)
  const educationalOrgData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "DigiBridge Academy",
    "url": "https://pensa.club/academy",
    "description": "Безплатна образователна платформа за дигитално обучение на възрастни хора. Курсове по дигитална грамотност, интернет сигурност, електронна комуникация.",
    "parentOrganization": {
      "@type": "Organization",
      "name": "Pensa Club"
    },
    "areaServed": ["BG", "DE"],
    "audience": {
      "@type": "PeopleAudience",
      "suggestedMinAge": 60,
      "audienceType": "Пенсионери и възрастни хора"
    },
    "educationalCredentialAwarded": "Сертификат за дигитална грамотност",
    "courseMode": "online",
    "financialAid": "Безплатни курсове финансирани от EU Civic Innovation Fund",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Курсове по дигитална грамотност",
      "itemListElement": [
        {
          "@type": "Course",
          "name": "Основи на интернета",
          "description": "Базови умения за работа с интернет",
          "provider": {
            "@type": "Organization",
            "name": "DigiBridge Academy"
          }
        },
        {
          "@type": "Course",
          "name": "Интернет безопасност",
          "description": "Как да се предпазим от онлайн измами",
          "provider": {
            "@type": "Organization",
            "name": "DigiBridge Academy"
          }
        },
        {
          "@type": "Course",
          "name": "Електронна комуникация",
          "description": "Имейл, видео разговори и чат",
          "provider": {
            "@type": "Organization",
            "name": "DigiBridge Academy"
          }
        }
      ]
    }
  }), []);

  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@graph": [
      organizationData,
      websiteData,
      educationalOrgData
    ]
  }), [organizationData, websiteData, educationalOrgData]);

  return (
    <>
      {/* ✅ SEO HEAD */}
      <SEOHead
        title={metaData.title}
        description={metaData.description}
        keywords={metaData.keywords}
        image={metaData.image}
        type="website"
        structuredData={structuredData}
      />

      <TextZoom />
      <div className="home-container">
        <Hero />
        <PlatformStats />
        <MottoSection />
        <AboutSection />
        <ConstellationShowcase />
        <FeaturedArticles />
        <NewsSubscribe />
        <ScrollToTop />
      </div>
    </>
  );
};