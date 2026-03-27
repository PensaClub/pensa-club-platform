import { useState, useEffect } from 'react';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { forumServiceFactory } from '../../Services/forumServiceFactory';
import { Calendar, MapPin, Wifi } from 'lucide-react';
import './forumUpcomingSeminars.css';

const ForumUpcomingSeminars = () => {
  const [seminars, setSeminars] = useState([]);
  const navigate = useLocalizedNavigate();
  const service = forumServiceFactory();

  useEffect(() => {
    service.getUpcomingSeminars().then(data => setSeminars(data.seminars || [])).catch(() => {});
  }, []);

  if (seminars.length === 0) return <p className="fus-empty">Няма предстоящи семинари</p>;

  return (
    <div className="fus-list">
      {seminars.map(s => (
        <button key={s.id} className="fus-item" onClick={() => navigate(`/academy/seminars/${s.slug}`)}>
          <div className="fus-date-badge">
            <span className="fus-day">{new Date(s.scheduledDate).getDate()}</span>
            <span className="fus-month">{new Date(s.scheduledDate).toLocaleString('bg-BG', { month: 'short' })}</span>
          </div>
          <div className="fus-info">
            <span className="fus-title">{s.title}</span>
            <span className="fus-meta">
              {s.isOnline ? <><Wifi size={10} /> Онлайн</> : <><MapPin size={10} /> {s.location || 'Присъствено'}</>}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ForumUpcomingSeminars;
