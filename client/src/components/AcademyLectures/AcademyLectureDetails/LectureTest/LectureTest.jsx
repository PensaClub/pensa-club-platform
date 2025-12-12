// src/components/AcademyLectures/AcademyLectureDetails/components/LectureTest.jsx

import { useState } from 'react';
import { useAcademyCourses } from '../../../contexts/AcademyCoursesProvider';

export const LectureTest = ({ lecture, status, t }) => {
  const { startLectureTest, getLectureTestStatus } = useAcademyCourses();
  const [testStatus, setTestStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleStartTest = async () => {
    setLoading(true);
    try {
      const result = await startLectureTest(lecture.id);
      console.log('Test started:', result);
      // TODO: Navigate to test page or show test component
    } catch (err) {
      console.error('Error starting test:', err);
    } finally {
      setLoading(false);
    }
  };

  const canTakeTest = status === 'recording' || status === 'completed';

  return (
    <div className="ald-test-section">
      <div className="ald-test-card">
        <div className="ald-test-header">
          <div className="ald-test-icon">📝</div>
          <div className="ald-test-info">
            <h3>Тест към лекцията</h3>
            <p>Проверете знанията си и спечелете допълнителни кредити</p>
          </div>
        </div>
        
        <div className="ald-test-details">
          <div className="ald-test-detail">
            <span className="ald-test-detail-label">Кредити</span>
            <span className="ald-test-detail-value">+{lecture.creditsForTest || 0} 🪙</span>
          </div>
          <div className="ald-test-detail">
            <span className="ald-test-detail-label">Минимум за преминаване</span>
            <span className="ald-test-detail-value">{lecture.testPassingScore || 70}%</span>
          </div>
        </div>

        <button 
          className="ald-test-btn" 
          disabled={!canTakeTest || loading}
          onClick={handleStartTest}
        >
          {loading ? (
            <>⏳ Зареждане...</>
          ) : canTakeTest ? (
            <>🚀 Започни теста</>
          ) : (
            <>🔒 Достъпен след лекцията</>
          )}
        </button>
      </div>
    </div>
  );
};