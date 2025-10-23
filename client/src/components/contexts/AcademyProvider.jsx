import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuthContext } from './UserContext';
import academyServiceFactory from '../Services/academyServiceFactory';

export const AcademyContext = createContext();

export const AcademyProvider = ({ children }) => {
  const { token } = useAuthContext();
  const academyService = academyServiceFactory(token);

  // State САМО за landing page данни
  const [stats, setStats] = useState({
    totalCourses: 15,
    activeMentors: 12,
    totalParticipants: 250,
    countries: 3,
    satisfactionRate: 98
  });

  const [featuredMentors, setFeaturedMentors] = useState([]);
  const [featuredTestimonials, setFeaturedTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ===============================
  // FETCH ФУНКЦИИ
  // ===============================

  const fetchStats = useCallback(async () => {
    try {
      const data = await academyService.getStats();
      setStats(data);
      return data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback на default данни ако няма backend
      return stats;
    }
  }, []);

  const fetchFeaturedMentors = useCallback(async (limit = 3) => {
    try {
      const data = await academyService.getFeaturedMentors(limit);
      setFeaturedMentors(data.mentors || data);
      return data;
    } catch (error) {
      console.error('Error fetching mentors:', error);
      // Fallback на празен масив
      return [];
    }
  }, []);

  const fetchFeaturedTestimonials = useCallback(async (limit = 5) => {
    try {
      const data = await academyService.getFeaturedTestimonials(limit);
      setFeaturedTestimonials(data.testimonials || data);
      return data;
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      // Fallback на празен масив
      return [];
    }
  }, []);

  // Auto-load данни при mount (опционално)
  useEffect(() => {
    // да се Разкоментират когато backend е готов
    // fetchStats();
    // fetchFeaturedMentors();
    // fetchFeaturedTestimonials();
  }, []);

  // ===============================
  // CONTEXT VALUE
  // ===============================

  const contextValue = {
    // Data
    stats,
    featuredMentors,
    featuredTestimonials,
    isLoading,

    // Functions
    fetchStats,
    fetchFeaturedMentors,
    fetchFeaturedTestimonials,
  };

  return (
    <AcademyContext.Provider value={contextValue}>
      {children}
    </AcademyContext.Provider>
  );
};

export const useAcademy = () => {
  const context = useContext(AcademyContext);
  if (!context) {
    throw new Error('useAcademy must be used within AcademyProvider');
  }
  return context;
};