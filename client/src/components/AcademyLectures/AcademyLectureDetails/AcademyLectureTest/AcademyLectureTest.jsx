// src/components/AcademyLectures/AcademyLectureTest/AcademyLectureTest.jsx

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../../contexts/UserContext';
import { useAcademyCourses } from '../../../contexts/AcademyCoursesProvider';
import './academyLectureTest.css';

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const AcademyLectureTest = () => {
  const { slug } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthentication } = useAuthContext();
  const { 
    getLectureBySlug,
    startLectureTest,
    submitAnswer,
    submitTest,
    isLoading 
  } = useAcademyCourses();

  // State
  const [lecture, setLecture] = useState(null);
  const [testData, setTestData] = useState(null); // { attempt, test, questions, timeRemaining }
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [testState, setTestState] = useState('loading');
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);

  // Refs
  const loadingRef = useRef(false);
  const timerRef = useRef(null);

  // Load lecture and test data
  useEffect(() => {
    if (!slug || loadingRef.current || !isAuthentication) return;

    const loadData = async () => {
      loadingRef.current = true;
      try {
        // 1. Зареди лекцията
        const lectureRes = await getLectureBySlug(slug);
        const lectureData = lectureRes.lecture || lectureRes;
        setLecture(lectureData);

        if (!lectureData.hasTest) {
          setError(t('academyLectureTest.error.noTest'));
          setTestState('error');
          return;
        }

        // 2. Стартирай/продължи теста
        try {
          const response = await startLectureTest(lectureData.id);
          
          if (response?.attempt) {
            // Запази целия response
            setTestData(response);
            
            // Зареди предишни отговори ако има
            if (response.attempt.answers && typeof response.attempt.answers === 'object') {
              setAnswers(response.attempt.answers);
            }
            
            // Настрой таймера
            if (response.timeRemaining !== undefined && response.timeRemaining > 0) {
              setTimeLeft(response.timeRemaining);
            } else if (response.test?.timeLimitMinutes) {
              // Ако няма timeRemaining, изчисли от началото
              const elapsed = (Date.now() - new Date(response.attempt.startedAt).getTime()) / 1000;
              const remaining = Math.max(0, response.test.timeLimitMinutes * 60 - elapsed);
              setTimeLeft(Math.floor(remaining));
            }
            
            // Провери статуса
            if (response.attempt.status === 'completed') {
              setTestResult({
                score: response.attempt.score,
                correctCount: response.attempt.correctAnswers,
                totalCount: response.attempt.totalQuestions || response.questions?.length || 0,
                passed: response.attempt.isPassed
              });
              setTestState('results');
            } else {
              setTestState('active');
            }
          } else {
            setTestState('intro');
          }
        } catch (err) {
          console.error('Start test error:', err);
          setTestState('intro');
        }
      } catch (err) {
        console.error('Error loading test:', err);
        setError(err.message);
        setTestState('error');
      } finally {
        loadingRef.current = false;
      }
    };

    loadData();
  }, [slug, isAuthentication, t, getLectureBySlug, startLectureTest]);

  // Timer
  useEffect(() => {
    if (testState !== 'active' || timeLeft === null || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [testState, timeLeft]);

  // Current question - взимаме от testData.questions
  const currentQuestion = useMemo(() => {
    if (!testData?.questions?.length) return null;
    return testData.questions[currentQuestionIndex];
  }, [testData, currentQuestionIndex]);

  const totalQuestions = testData?.questions?.length || 0;
  const answeredCount = Object.keys(answers).length;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  // Format time
  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isTimeWarning = timeLeft !== null && timeLeft <= 60;
  const isTimeCritical = timeLeft !== null && timeLeft <= 30;

  // Handlers
  const handleStartTest = async () => {
    setTestState('loading');
    try {
      const response = await startLectureTest(lecture.id);
      
      if (response?.attempt) {
        setTestData(response);
        setAnswers(response.attempt.answers || {});
        setCurrentQuestionIndex(0);
        
        if (response.timeRemaining !== undefined && response.timeRemaining > 0) {
          setTimeLeft(response.timeRemaining);
        } else if (response.test?.timeLimitMinutes) {
          setTimeLeft(response.test.timeLimitMinutes * 60);
        }
        
        setTestState('active');
      }
    } catch (err) {
      console.error('Start test error:', err);
      setError(err.message);
      setTestState('error');
    }
  };

 const handleSelectAnswer = async (questionId, answerId, isMultiple = false) => {
  // Изчисли новата стойност ПРЕДИ setAnswers
  let newAnswerValue;
  
  if (isMultiple) {
    const currentAnswers = answers[questionId] || [];
    newAnswerValue = currentAnswers.includes(answerId)
      ? currentAnswers.filter(id => id !== answerId)
      : [...currentAnswers, answerId];
  } else {
    newAnswerValue = answerId;
  }
  
  // Сетни state-а
  setAnswers(prev => ({ ...prev, [questionId]: newAnswerValue }));

  // Използвай submitAnswer с правилния формат
  if (testData?.test?.id) {
    setIsSavingAnswer(true);
    try {
      await submitAnswer(testData.test.id, {
        questionId: questionId,
        answer: newAnswerValue
      });
    } catch (err) {
      console.error('Save answer error:', err);
    } finally {
      setIsSavingAnswer(false);
    }
  }
};

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleGoToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitTest = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    clearInterval(timerRef.current);
    
    try {
      // Използваме testData.attempt.id
      const result = await submitTest(testData.test.id);
      
      // Парсваме резултата
      const resultData = result?.result || result?.attempt || result;
      
      setTestResult({
        score: resultData.score ?? resultData.scorePercentage ?? 0,
        correctCount: resultData.correctAnswers ?? resultData.correctCount ?? 0,
        totalCount: resultData.totalQuestions ?? resultData.totalCount ?? totalQuestions,
        passed: resultData.isPassed ?? resultData.passed ?? false
      });
      setTestState('results');
    } catch (err) {
      console.error('Submit test error:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = async () => {
  setTestResult(null);
  setAnswers({});
  setCurrentQuestionIndex(0);
  setTestData(null);
  setTimeLeft(null);
  loadingRef.current = false;
  setTestState('loading');
  
  try {
    const response = await startLectureTest(lecture.id);
    
    // 🔍 Debug - виж какво връща сървърът
    console.log('🔄 Retry response:', {
      attemptId: response?.attempt?.id,
      attemptStatus: response?.attempt?.status,
      startedAt: response?.attempt?.startedAt,
      timeRemaining: response?.timeRemaining,
      attemptNumber: response?.attempt?.attemptNumber
    });
    
    if (response?.attempt) {
      // Провери дали attempt-ът е нов или е стар submitted
      if (response.attempt.status === 'completed' || response.attempt.status === 'submitted') {
        console.warn('⚠️ Server returned old completed attempt!');
        // Може би трябва друг endpoint за нов опит?
        setTestState('intro');
        return;
      }
      
      setTestData(response);
      
      // Използвай timeRemaining от сървъра ако има
      if (response.timeRemaining !== undefined && response.timeRemaining > 0) {
        setTimeLeft(response.timeRemaining);
      } else if (response.test?.timeLimitMinutes) {
        setTimeLeft(response.test.timeLimitMinutes * 60);
      }
      
      setTestState('active');
    } else {
      setTestState('intro');
    }
  } catch (err) {
    console.error('Retry error:', err);
    setTestState('intro');
  }
};
  const handleGoBack = () => {
    navigate(`/academy/lectures/${slug}`);
  };

  const getQuestionStatus = (questionId) => {
    const answer = answers[questionId];
    if (answer !== undefined && answer !== null) {
      if (Array.isArray(answer)) {
        return answer.length > 0 ? 'answered' : 'unanswered';
      }
      return 'answered';
    }
    return 'unanswered';
  };

  // Auth required
  if (!isAuthentication) {
    return (
      <div className="alt">
        <div className="alt-error">
          <div className="alt-error__icon">🔐</div>
          <h2>{t('academyLectureTest.auth.title')}</h2>
          <p>{t('academyLectureTest.auth.description')}</p>
          <Link to="/sign-up" className="alt-error__btn">
            {t('academyLectureTest.auth.login')}
          </Link>
        </div>
      </div>
    );
  }

  // Loading
  if (testState === 'loading' || isLoading) {
    return (
      <div className="alt">
        <div className="alt-loading">
          <div className="alt-loading__spinner"></div>
          <p>{t('academyLectureTest.loading')}</p>
        </div>
      </div>
    );
  }

  // Error
  if (testState === 'error' || error) {
    return (
      <div className="alt">
        <div className="alt-error">
          <div className="alt-error__icon">⚠️</div>
          <h2>{t('academyLectureTest.error.title')}</h2>
          <p>{error}</p>
          <button onClick={handleGoBack} className="alt-error__btn">
            {t('academyLectureTest.error.back')}
          </button>
        </div>
      </div>
    );
  }

  // Intro screen
  if (testState === 'intro') {
    return (
      <div className="alt">
        <div className="alt-intro">
          <div className="alt-intro__card">
            <div className="alt-intro__icon">📝</div>
            <h1 className="alt-intro__title">{t('academyLectureTest.intro.title')}</h1>
            <p className="alt-intro__lecture">{lecture?.title}</p>
            
            <div className="alt-intro__info">
              {(testData?.test?.timeLimitMinutes || lecture?.testTimeLimit) && (
                <div className="alt-intro__info-item">
                  <span className="alt-intro__info-icon">⏱️</span>
                  <span>{testData?.test?.timeLimitMinutes || lecture?.testTimeLimit} {t('academyLectureTest.intro.minutes')}</span>
                </div>
              )}
              <div className="alt-intro__info-item">
                <span className="alt-intro__info-icon">🪙</span>
                <span>+{testData?.test?.creditsForPassing || lecture?.creditsForTest || 0} {t('academyLectureTest.intro.credits')}</span>
              </div>
              <div className="alt-intro__info-item">
                <span className="alt-intro__info-icon">✓</span>
                <span>{testData?.test?.passingScore || lecture?.testPassingScore || 70}% {t('academyLectureTest.intro.toPass')}</span>
              </div>
            </div>

            <div className="alt-intro__rules">
              <h3>{t('academyLectureTest.intro.rulesTitle')}</h3>
              <ul>
                <li>{t('academyLectureTest.intro.rule1')}</li>
                <li>{t('academyLectureTest.intro.rule2')}</li>
                <li>{t('academyLectureTest.intro.rule3')}</li>
              </ul>
            </div>

            <div className="alt-intro__actions">
              <button className="alt-intro__start" onClick={handleStartTest}>
                🚀 {t('academyLectureTest.intro.start')}
              </button>
              <button className="alt-intro__back" onClick={handleGoBack}>
                {t('academyLectureTest.intro.back')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (testState === 'results' && testResult) {
    const passingScore = testData?.test?.passingScore || lecture?.testPassingScore || 70;
    const passed = testResult.score >= passingScore;
    const scorePercentage = testResult.score || 0;
    const correctAnswers = testResult.correctCount || 0;
    const wrongAnswers = (testResult.totalCount || 0) - correctAnswers;
    const creditsEarned = testData?.test?.creditsForPassing || lecture?.creditsForTest || 0;
    
    return (
      <div className="alt alt--results">
        <div className="alt-results">
          <div className={`alt-results__card ${passed ? 'alt-results__card--passed' : 'alt-results__card--failed'}`}>
            <div className="alt-results__icon">
              {passed ? '🎉' : '😔'}
            </div>
            
            <h1 className="alt-results__title">
              {passed 
                ? t('academyLectureTest.results.passedTitle')
                : t('academyLectureTest.results.failedTitle')}
            </h1>
            
            <p className="alt-results__subtitle">
              {passed 
                ? t('academyLectureTest.results.passedDesc')
                : t('academyLectureTest.results.failedDesc')}
            </p>

            {/* Score Circle */}
            <div className="alt-results__score">
              <div className="alt-results__score-circle">
                <svg viewBox="0 0 100 100">
                  <circle className="alt-results__score-bg" cx="50" cy="50" r="45" />
                  <circle 
                    className="alt-results__score-fill" 
                    cx="50" cy="50" r="45"
                    style={{ 
                      strokeDasharray: `${(scorePercentage / 100) * 283} 283`,
                      stroke: passed ? '#10b981' : '#ef4444'
                    }}
                  />
                </svg>
                <span className="alt-results__score-value">{Math.round(scorePercentage)}%</span>
              </div>
              <span className="alt-results__score-label">
                {t('academyLectureTest.results.yourScore')}
              </span>
            </div>

            {/* Stats */}
            <div className="alt-results__stats">
              <div className="alt-results__stat">
                <span className="alt-results__stat-value alt-results__stat-value--correct">
                  {correctAnswers}
                </span>
                <span className="alt-results__stat-label">{t('academyLectureTest.results.correct')}</span>
              </div>
              <div className="alt-results__stat-divider"></div>
              <div className="alt-results__stat">
                <span className="alt-results__stat-value alt-results__stat-value--wrong">
                  {wrongAnswers}
                </span>
                <span className="alt-results__stat-label">{t('academyLectureTest.results.wrong')}</span>
              </div>
              <div className="alt-results__stat-divider"></div>
              <div className="alt-results__stat">
                <span className="alt-results__stat-value">{testResult.totalCount || 0}</span>
                <span className="alt-results__stat-label">{t('academyLectureTest.results.total')}</span>
              </div>
            </div>

            {/* Earned Credits */}
            {passed && creditsEarned > 0 && (
              <div className="alt-results__credits">
                <span className="alt-results__credits-icon">🪙</span>
                <span>+{creditsEarned} {t('academyLectureTest.results.creditsEarned')}</span>
              </div>
            )}

            {/* Actions */}
            <div className="alt-results__actions">
              {passed ? (
                <button onClick={handleGoBack} className="alt-results__btn alt-results__btn--primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  {t('academyLectureTest.results.backToLecture')}
                </button>
              ) : (
                <>
                  <button onClick={handleRetry} className="alt-results__btn alt-results__btn--retry">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 4v6h6M23 20v-6h-6" />
                      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                    </svg>
                    {t('academyLectureTest.results.retry')}
                  </button>
                  <button onClick={handleGoBack} className="alt-results__btn alt-results__btn--secondary">
                    {t('academyLectureTest.results.backToLecture')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active test
  return (
    <div className="alt">
      {/* Header */}
      <header className="alt-header">
        <div className="alt-header__left">
          <button onClick={handleGoBack} className="alt-header__back" title={t('academyLectureTest.header.exit')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="alt-header__info">
            <h1 className="alt-header__title">{testData?.test?.title || lecture?.title}</h1>
            <span className="alt-header__meta">
              {t('academyLectureTest.question.label')} {currentQuestionIndex + 1} / {totalQuestions}
            </span>
          </div>
        </div>

        <div className="alt-header__right">
          {timeLeft !== null && (
            <div className={`alt-header__timer ${isTimeWarning ? 'alt-header__timer--warning' : ''} ${isTimeCritical ? 'alt-header__timer--critical' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}

          <div className="alt-header__progress">
            <span>{answeredCount}/{totalQuestions}</span>
            <div className="alt-header__progress-bar">
              <div className="alt-header__progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          {isSavingAnswer && (
            <div className="alt-header__saving">
              <div className="alt-header__saving-spinner"></div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="alt-main">
        <div className="alt-container">
          {/* Sidebar */}
          <aside className="alt-sidebar">
            <h3 className="alt-sidebar__title">{t('academyLectureTest.navigator.title')}</h3>
            <div className="alt-sidebar__grid">
              {testData?.questions?.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => handleGoToQuestion(index)}
                  className={`alt-sidebar__item 
                    ${index === currentQuestionIndex ? 'alt-sidebar__item--active' : ''}
                    ${getQuestionStatus(q.id) === 'answered' ? 'alt-sidebar__item--answered' : ''}
                  `}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div className="alt-sidebar__legend">
              <div className="alt-sidebar__legend-item">
                <span className="alt-sidebar__legend-dot alt-sidebar__legend-dot--answered"></span>
                <span>{t('academyLectureTest.legend.answered')}</span>
              </div>
              <div className="alt-sidebar__legend-item">
                <span className="alt-sidebar__legend-dot alt-sidebar__legend-dot--unanswered"></span>
                <span>{t('academyLectureTest.legend.unanswered')}</span>
              </div>
              <div className="alt-sidebar__legend-item">
                <span className="alt-sidebar__legend-dot alt-sidebar__legend-dot--current"></span>
                <span>{t('academyLectureTest.legend.current')}</span>
              </div>
            </div>
          </aside>

          {/* Question Card */}
          <div className="alt-question">
            {currentQuestion && (
              <>
                <div className="alt-question__header">
                  <span className="alt-question__number">
                    {t('academyLectureTest.question.label')} {currentQuestionIndex + 1}
                  </span>
                  {currentQuestion.points && (
                    <span className="alt-question__points">
                      {currentQuestion.points} {currentQuestion.points === 1 ? t('academyLectureTest.question.point') : t('academyLectureTest.question.points')}
                    </span>
                  )}
                </div>

                <h2 className="alt-question__text">{currentQuestion.questionText}</h2>

                {currentQuestion.imageUrl && (
                  <div className="alt-question__image">
                    <img src={currentQuestion.imageUrl} alt="" />
                  </div>
                )}

                <div className="alt-question__answers">
                  {currentQuestion.answerOptions?.map((option) => {
                    const isMultiple = currentQuestion.questionType === 'multiple';
                    const currentAnswer = answers[currentQuestion.id];
                    const isSelected = isMultiple
                      ? (currentAnswer || []).includes(option.id)
                      : currentAnswer === option.id;

                    return (
                      <button
                        key={option.id}
                        onClick={() => handleSelectAnswer(currentQuestion.id, option.id, isMultiple)}
                        className={`alt-question__answer ${isSelected ? 'alt-question__answer--selected' : ''}`}
                      >
                        <span className="alt-question__answer-indicator">
                          {isMultiple ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              {isSelected ? (
                                <>
                                  <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" />
                                  <polyline points="9,12 11,14 15,10" stroke="white" strokeWidth="2" />
                                </>
                              ) : (
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                              )}
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="9" />
                              {isSelected && <circle cx="12" cy="12" r="5" fill="currentColor" />}
                            </svg>
                          )}
                        </span>
                        <span className="alt-question__answer-text">{option.answerText}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="alt-question__nav">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="alt-question__nav-btn alt-question__nav-btn--prev"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    {t('academyLectureTest.navigation.prev')}
                  </button>

                  {currentQuestionIndex === totalQuestions - 1 ? (
                    <button
                      onClick={() => handleSubmitTest()}
                      disabled={isSubmitting}
                      className="alt-question__nav-btn alt-question__nav-btn--submit"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="alt-question__nav-spinner"></span>
                          {t('academyLectureTest.submit.submitting')}
                        </>
                      ) : (
                        <>
                          {t('academyLectureTest.submit.button')}
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="alt-question__nav-btn alt-question__nav-btn--next"
                    >
                      {t('academyLectureTest.navigation.next')}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="alt-footer">
        <div className="alt-footer__info">
          <span>📋 {testData?.test?.title || t('academyLectureTest.header.test')}</span>
          <span>•</span>
          <span>🎯 {t('academyLectureTest.footer.passing')}: {testData?.test?.passingScore || lecture?.testPassingScore || 70}%</span>
          <span>•</span>
          <span>🪙 {t('academyLectureTest.footer.credits')}: {testData?.test?.creditsForPassing || lecture?.creditsForTest || 0}</span>
        </div>
      </footer>
    </div>
  );
};

export default AcademyLectureTest;