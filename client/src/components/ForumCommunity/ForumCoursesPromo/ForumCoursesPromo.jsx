import { useState, useEffect } from 'react';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { forumServiceFactory } from '../../Services/forumServiceFactory';
import { BookOpen } from 'lucide-react';
import './forumCoursesPromo.css';

const ForumCoursesPromo = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useLocalizedNavigate();
  const service = forumServiceFactory();

  useEffect(() => {
    service.getRecommendedCourses().then(data => setCourses(data.courses || [])).catch(() => {});
  }, []);

  if (courses.length === 0) return null;

  return (
    <div className="fcpr-list">
      {courses.map(c => (
        <button key={c.id} className="fcpr-item" onClick={() => navigate(`/academy/courses/${c.slug}`)}>
          {c.thumbnailUrl ? (
            <img src={c.thumbnailUrl} alt="" className="fcpr-thumb" loading="lazy" />
          ) : (
            <div className="fcpr-thumb-placeholder"><BookOpen size={16} /></div>
          )}
          <div className="fcpr-info">
            <span className="fcpr-title">{c.title}</span>
            {c.shortDescription && (
              <span className="fcpr-desc">{c.shortDescription.substring(0, 60)}</span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default ForumCoursesPromo;
