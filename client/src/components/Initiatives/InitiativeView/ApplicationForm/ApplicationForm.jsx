import { useState, useEffect } from 'react';
import { useAuthContext } from '../../../contexts/UserContext';
import { useInitiativeContext } from '../../../contexts/InitiativeProvider';
import './applicationForm.css';

export const ApplicationForm = ({ project, onSubmit }) => {
  const { profileData, isAuthentication } = useAuthContext();
  const { recentApplications } = useInitiativeContext();
  const [isLoading, setIsLoading] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profileData?.details?.firstName || '',
    lastName: profileData?.details?.lastName || '',
    email: profileData?.email || '',
    phone: profileData?.details?.phone || '',
    isAnonymous: false
  });

  // Проверяваме дали потребителят вече е кандидатствал
  useEffect(() => {
    if (profileData?.email && recentApplications) {
      const userApplication = recentApplications.find(app => app.email === profileData.email);
      setHasApplied(!!userApplication);
    }
  }, [profileData?.email, recentApplications]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthentication) {
      alert('Трябва да сте логнати за да кандидатствате!');
      return;
    }

    if (hasApplied) {
      alert('Вече сте кандидатствали за този проект!');
      return;
    }

    setIsLoading(true);
    
    try {
      const applicationData = {
        projectId: project.id,
        ...formData,
        appliedAt: new Date().toISOString()
      };

      await onSubmit(applicationData);
      setHasApplied(true);
      
    } catch (error) {
      console.error('Application failed:', error);
      alert('Възникна грешка при кандидатстването. Моля опитайте отново.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Подреждаме кандидатурите по дата (най-новите първо)
  const sortedApplications = recentApplications ? 
    [...recentApplications].sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)) : [];

  if (!isAuthentication) {
    return (
      <div className="application-form-container" id="application-form">
        <div className="application-form-header">
          <h2 className="application-form-title">Необходимо е влизане</h2>
          <p className="application-form-subtitle">
            За да кандидатствате за този проект, моля влезте в профила си.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="application-form-container" id="application-form">
      {hasApplied && (
        <div className="application-form-success">
          ✅ Вече сте кандидатствали за този проект! Екипът на Pensa Club ще се свърже с Вас.
        </div>
      )}

      <div className="application-form-header">
        <h2 className="application-form-title">
          {hasApplied ? 'Вашата кандидатура' : 'Кандидатствай за проекта'}
        </h2>
        <p className="application-form-subtitle">
          {hasApplied 
            ? `Успешно сте кандидатствали за участие в "${project.title}"`
            : `Попълнете формуляра по-долу за да кандидатствате за участие в "${project.title}"`
          }
        </p>
      </div>

      {!hasApplied && (
        <form className="application-form-form" onSubmit={handleSubmit}>
          <div className="application-form-row">
            <div className="application-form-field">
              <label htmlFor="firstName" className="application-form-label required">
                Име
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="application-form-input"
                required
                disabled={isLoading}
              />
            </div>

            <div className="application-form-field">
              <label htmlFor="lastName" className="application-form-label required">
                Фамилия
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="application-form-input"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="application-form-row">
            <div className="application-form-field">
              <label htmlFor="email" className="application-form-label required">
                Имейл адрес
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="application-form-input"
                required
                disabled={isLoading}
              />
            </div>

            <div className="application-form-field">
              <label htmlFor="phone" className="application-form-label">
                Телефон
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="application-form-input"
                placeholder="+359 888 123 456"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="application-form-field full-width">
            <div className="application-form-checkbox-container">
              <label className="application-form-checkbox">
                <input
                  type="checkbox"
                  name="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <span className="application-form-checkbox-mark"></span>
              </label>
              <label htmlFor="isAnonymous" className="application-form-checkbox-label">
                Направи кандидатурата анонимна (името ви няма да се показва публично)
              </label>
            </div>
          </div>

          <div className="application-form-actions">
            <button 
              type="submit" 
              className="application-form-btn application-form-btn-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="application-form-loading">
                  ⏳ Изпращане...
                </span>
              ) : (
                '📤 Изпрати кандидатура'
              )}
            </button>
          </div>
        </form>
      )}

      {/* Recent Applications */}
      <div className="application-form-recent-applications">
        <h3 className="application-form-recent-title">
          Последни кандидатури ({sortedApplications?.length || 0})
        </h3>
        
        {sortedApplications && sortedApplications.length > 0 ? (
          <div className="application-form-recent-list">
            {sortedApplications.slice(0, 5).map((application, index) => (
              <div key={application.id || index} className="application-form-recent-item">
                <span className="application-form-recent-user">
                  {application.isAnonymous ? 'Анонимен потребител' : `${application.firstName} ${application.lastName}`}
                </span>
                <span className="application-form-recent-date">
                  {formatDate(application.appliedAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="application-form-recent-empty">
            Все още няма кандидати за този проект. Бъдете първи! 🚀
          </div>
        )}
      </div>
    </div>
  );
};