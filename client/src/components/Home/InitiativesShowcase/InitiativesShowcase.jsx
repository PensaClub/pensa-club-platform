import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import './initiativesShowcase.css';
import { useInitiativeContext } from '../../contexts/InitiativeProvider';
import { ShowcaseHeader } from './ShowcaseHeader/ShowcaseHeader';
import { ShowcaseNavigation } from './ShowcaseNavigation/ShowcaseNavigation';
import { ShowcaseGrid } from './ShowcaseGrid/ShowcaseGrid';
import { ShowcaseFooter } from './ShowcaseFooter/ShowcaseFooter';

export const InitiativesShowcase = () => {
  const { t } = useTranslation();
  const { initiatives, getAllInitiatives } = useInitiativeContext();
  const [activeTab, setActiveTab] = useState('initiatives');
  const [featuredData, setFeaturedData] = useState({
    initiatives: [],
    projects: [],
    stories: []
  });
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (initiatives.length === 0) {
      getAllInitiatives();
    }
  }, [initiatives.length, getAllInitiatives]);

  useEffect(() => {
    if (initiatives.length > 0) {
      const featuredInitiatives = initiatives.slice(0, 3);
      
      const allProjects = [];
      initiatives.forEach(initiative => {
        if (initiative.projects && initiative.projects.length > 0) {
          initiative.projects.forEach(project => {
            allProjects.push({
              ...project,
              initiativeTitle: initiative.title,
              initiativeSlug: initiative.slug
            });
          });
        }
      });
      
      const allStories = [];
      initiatives.forEach(initiative => {
        if (initiative.stories && initiative.stories.length > 0) {
          initiative.stories.forEach(story => {
            allStories.push({
              ...story,
              initiativeTitle: initiative.title,
              initiativeSlug: initiative.slug
            });
          });
        }
      });

      setFeaturedData({
        initiatives: featuredInitiatives,
        projects: allProjects.slice(0, 3),
        stories: allStories.slice(0, 3)
      });
    }
  }, [initiatives]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const currentData = featuredData[activeTab] || [];

  return (
    <section className="initiatives-showcase" ref={sectionRef}>
      <div className="showcase-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
        <div className="showcase-pattern"></div>
      </div>

      <div className="showcase-container">
        <ShowcaseHeader isVisible={isVisible} />
        
        <ShowcaseNavigation 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          featuredData={featuredData}
          isVisible={isVisible}
        />
        
        <ShowcaseGrid 
          data={currentData}
          activeTab={activeTab}
          isVisible={isVisible}
        />
        
        <ShowcaseFooter isVisible={isVisible} />
      </div>
    </section>
  );
};