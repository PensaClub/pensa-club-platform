import { useTranslation } from 'react-i18next';
import './reActionTestimonials.css';

const ReActionTestimonials = ({ testimonials = [] }) => {
  const { t } = useTranslation('reaction');

  if (!testimonials.length) return null;

  return (
    <section className="rat">
      <div className="rat-container">
        <h2 className="rat-title">{t('testimonials.title')}</h2>

        <div className="rat-grid">
          {testimonials.map((item, index) => (
            <div key={item.id || index} className="rat-card">
              <div className="rat-card-quote">
                <svg className="rat-card-quote-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="rat-card-text">{item.quote}</p>
              </div>
              <div className="rat-card-footer">
                <div className="rat-card-info">
                  <span className="rat-card-club">{item.clubName}</span>
                  <span className="rat-card-city">{item.city}</span>
                </div>
                {item.authorName && (
                  <span className="rat-card-author">— {item.authorName}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReActionTestimonials;
