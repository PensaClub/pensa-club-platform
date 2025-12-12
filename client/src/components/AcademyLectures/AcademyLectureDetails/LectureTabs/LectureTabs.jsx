// src/components/AcademyLectures/AcademyLectureDetails/components/LectureTabs.jsx

import { LectureMaterials } from '../LectureMaterials/LectureMaterials';
import { LectureTest } from '../LectureTest/LectureTest';

export const LectureTabs = ({ lecture, status, activeTab, setActiveTab, t }) => {
  const materials = lecture.materials || [];

  // Определи наличните табове
  const tabs = [
    { id: 'overview', icon: '📋', label: 'Преглед' }
  ];
  
  if (status === 'live') {
    tabs.push({ id: 'live', icon: '📡', label: 'На живо', badge: 'LIVE', badgeClass: 'live' });
  }
  if (status === 'recording' && lecture.videoUrl) {
    tabs.push({ id: 'video', icon: '▶️', label: 'Видео' });
  }
  if (materials.length > 0) {
    tabs.push({ id: 'materials', icon: '📁', label: 'Материали', badge: materials.length });
  }
  if (lecture.hasTest) {
    tabs.push({ id: 'test', icon: '📝', label: 'Тест' });
  }

  return (
    <>
      {/* Tab Buttons */}
      <div className="ald-tabs">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            className={`ald-tab ${activeTab === tab.id ? 'is-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="ald-tab-icon">{tab.icon}</span>
            <span className="ald-tab-label">{tab.label}</span>
            {tab.badge && (
              <span className={`ald-tab-badge ${tab.badgeClass ? `ald-tab-badge--${tab.badgeClass}` : ''}`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="ald-tab-content">
        
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="ald-overview">
            <section className="ald-section">
              <h2 className="ald-section-title">📖 Описание</h2>
              <div className="ald-text" style={{ whiteSpace: 'pre-line' }}>
                {lecture.description || lecture.shortDescription}
              </div>
            </section>

            <section className="ald-section">
              <h2 className="ald-section-title">🎯 Какво ще научите</h2>
              <div className="ald-learn-grid">
                <div className="ald-learn-item"><span className="ald-learn-icon">✓</span> Основни понятия и концепции</div>
                <div className="ald-learn-item"><span className="ald-learn-icon">✓</span> Практически примери</div>
                <div className="ald-learn-item"><span className="ald-learn-icon">✓</span> Полезни съвети и трикове</div>
                <div className="ald-learn-item"><span className="ald-learn-icon">✓</span> Отговори на въпроси</div>
              </div>
            </section>

            {lecture.tags?.length > 0 && (
              <section className="ald-section">
                <h2 className="ald-section-title">🏷️ Тагове</h2>
                <div className="ald-tags">
                  {lecture.tags.map((tag, i) => (
                    <span key={i} className="ald-tag">#{tag}</span>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Live */}
        {activeTab === 'live' && status === 'live' && (
          <div className="ald-live-section">
            <div className="ald-video-container">
              <div className="ald-video-placeholder">
                <div className="ald-video-live-badge">
                  <span className="ald-video-live-dot"></span>
                  НА ЖИВО
                </div>
                <div className="ald-video-icon">📡</div>
                <p>Видео стриймът е в отделен прозорец</p>
                <a 
                  href={lecture.meetingLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ald-video-btn"
                >
                  Отвори в {lecture.videoProvider === 'youtube' ? 'YouTube' : 'Google Meet'}
                </a>
              </div>
            </div>

            {/* Chat Placeholder */}
            <div className="ald-chat-container">
              <div className="ald-chat-header">
                <h3>💬 Чат на живо</h3>
                <span className="ald-chat-viewers">
                  <span className="ald-chat-viewers-dot"></span>
                  {lecture.registeredCount || 0} участници
                </span>
              </div>
              <div className="ald-chat-messages">
                <div className="ald-chat-placeholder">
                  <div className="ald-chat-placeholder-icon">💬</div>
                  <p>Чатът ще бъде активен по време на лекцията</p>
                  <span>Powered by Firebase</span>
                </div>
              </div>
              <div className="ald-chat-input-container">
                <input type="text" placeholder="Напишете съобщение..." disabled />
                <button disabled>📤</button>
              </div>
            </div>
          </div>
        )}

        {/* Video */}
        {activeTab === 'video' && status === 'recording' && (
          <div className="ald-video-section">
            <div className="ald-video-player">
              {lecture.videoUrl ? (
                <div className="ald-video-embed">
                  <iframe
                    src={lecture.videoUrl.replace('watch?v=', 'embed/')}
                    title={lecture.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="ald-video-placeholder">
                  <div className="ald-video-icon">📹</div>
                  <p>Записът ще бъде достъпен скоро</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Materials */}
        {activeTab === 'materials' && (
          <LectureMaterials materials={materials} t={t} />
        )}

        {/* Test */}
        {activeTab === 'test' && lecture.hasTest && (
          <LectureTest lecture={lecture} status={status} t={t} />
        )}
      </div>
    </>
  );
};