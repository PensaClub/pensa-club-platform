// src/components/AcademyCourses/AcademyTestPlayer/AcademyTestPlayer.jsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../contexts/UserContext';
import { useAcademyCourses } from '../../contexts/AcademyCoursesProvider';
import './academytestplayer.css';

const AcademyTestPlayer = () => {
  const { t } = useTranslation();
  const { courseSlug, lessonSlug } = useParams();
  const navigate = useNavigate();
  
  const { isAuthentication } = useAuthContext();
  const { 
    getLessonBySlug,
    startTest,
    submitAnswer,
    submitTest,
    isLoading 
  } = useAcademyCourses();

  // State
  const [testData, setTestData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);
  const [isLoadingTest, setIsLoadingTest] = useState(true);

  const timerRef = useRef(null);
  const fetchedRef = useRef(null);

  // =========================================================
  //                    DATA FETCHING
  // =========================================================

  useEffect(() => {
    const fetchTestData = async () => {
      if (!courseSlug || !lessonSlug) return;
      
      const cacheKey = `${courseSlug}-${lessonSlug}`;
      if (fetchedRef.current === cacheKey && testData) return;

      try {
        fetchedRef.current = cacheKey;
        setError(null);
        setIsLoadingTest(true);
        
        const lessonResponse = await getLessonBySlug(courseSlug, lessonSlug);
        const lesson = lessonResponse?.lesson || lessonResponse;
        
        if (!lesson || !lesson.id) {
          throw new Error('Урокът не е намерен');
        }

        if (!lesson.hasTest) {
          throw new Error('Този урок няма тест');
        }

        const data = await startTest(lesson.id);
        
        if (data) {
          setTestData(data);
          setQuestions(data.questions || []);
          
          if (data.attempt?.answers && typeof data.attempt.answers === 'object') {
            setAnswers(data.attempt.answers);
          }
          
          if (data.timeRemaining !== undefined && data.timeRemaining > 0) {
            setTimeRemaining(data.timeRemaining);
          } else if (data.test?.timeLimitMinutes) {
            setTimeRemaining(data.test.timeLimitMinutes * 60);
          }
          
          // Ако тестът вече е завършен - показваме резултатите
          if (data.attempt?.status === 'completed') {
            setShowResults(true);
            // Нормализираме данните от attempt
            setResults({
              scorePercentage: data.attempt.score || 0,
              correctAnswers: data.attempt.correctAnswers || 0,
              wrongAnswers: data.attempt.wrongAnswers || 0,
              totalQuestions: data.attempt.totalQuestions || data.questions?.length || 0,
              passed: data.attempt.isPassed || false,
              earnedCredits: data.attempt.earnedCredits || 0,
              attemptId: data.attempt.id
            });
          }
        }
      } catch (err) {
        console.error('Error fetching test:', err);
        setError(err.message || 'Грешка при зареждане на теста');
      } finally {
        setIsLoadingTest(false);
      }
    };

    if (isAuthentication) {
      fetchTestData();
    }
  }, [courseSlug, lessonSlug, isAuthentication, getLessonBySlug, startTest]);

  // =========================================================
  //                    TIMER
  // =========================================================

  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || showResults) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmitTest(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeRemaining, showResults]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // =========================================================
  //                    HANDLERS
  // =========================================================

  const handleAnswerSelect = useCallback(async (questionId, answerId, isMultiple = false) => {
    let newAnswerValue;
    
    setAnswers(prev => {
      if (isMultiple) {
        const currentAnswers = prev[questionId] || [];
        newAnswerValue = currentAnswers.includes(answerId)
          ? currentAnswers.filter(id => id !== answerId)
          : [...currentAnswers, answerId];
      } else {
        newAnswerValue = answerId;
      }
      return { ...prev, [questionId]: newAnswerValue };
    });

    if (testData?.test?.id) {
      setIsSavingAnswer(true);
      try {
        await submitAnswer(testData.test.id, {
          questionId,
          answerId: isMultiple ? undefined : answerId,
          answerIds: isMultiple ? newAnswerValue : undefined
        });
      } catch (err) {
        console.error('Error saving answer:', err);
      } finally {
        setIsSavingAnswer(false);
      }
    }
  }, [testData, submitAnswer]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
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

  const handleSubmitTest = async (isAutoSubmit = false) => {
    if (isSubmitting || !testData?.test?.id) return;
    
    if (!isAutoSubmit) {
      const unanswered = questions.filter(q => !answers[q.id] || 
        (Array.isArray(answers[q.id]) && answers[q.id].length === 0));
      if (unanswered.length > 0) {
        const confirm = window.confirm(
          t('academyTestPlayer.confirmSubmitUnanswered', {
            count: unanswered.length,
            defaultValue: `Имате ${unanswered.length} неотговорени въпроса. Сигурни ли сте, че искате да предадете теста?`
          })
        );
        if (!confirm) return;
      }
    }

    setIsSubmitting(true);
    try {
      const response = await submitTest(testData.test.id);
      
      // Нормализираме response-а - данните са в response.result
      const resultData = response.result || response;
      
      setResults({
        scorePercentage: resultData.scorePercentage ?? resultData.score ?? 0,
        correctAnswers: resultData.correctAnswers ?? 0,
        wrongAnswers: resultData.wrongAnswers ?? 0,
        totalQuestions: resultData.totalQuestions ?? questions.length,
        passed: resultData.passed ?? resultData.isPassed ?? false,
        earnedCredits: resultData.earnedCredits ?? 0,
        earnedPoints: resultData.earnedPoints ?? 0,
        totalPoints: resultData.totalPoints ?? 0,
        attemptId: resultData.attemptId
      });
      
      setShowResults(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    } catch (err) {
      console.error('Error submitting test:', err);
      setError(err.message || 'Грешка при предаване на теста');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLesson = () => {
    navigate(`/academy/courses/${courseSlug}/lessons/${lessonSlug}`);
  };

  const handleContinueCourse = () => {
    navigate(`/academy/courses/${courseSlug}`);
  };

  const handleRetryTest = () => {
    setTestData(null);
    setQuestions([]);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setResults(null);
    setTimeRemaining(null);
    fetchedRef.current = null;
    window.location.reload();
  };

  // =========================================================
  //                    HELPERS
  // =========================================================

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  const getAnsweredCount = () => {
    return questions.filter(q => getQuestionStatus(q.id) === 'answered').length;
  };

  const isTimeWarning = timeRemaining !== null && timeRemaining <= 60;
  const isTimeCritical = timeRemaining !== null && timeRemaining <= 30;

  // =========================================================
  //                    RENDER STATES
  // =========================================================

  if (!isAuthentication) {
    return (
      <div className="atp">
        <div className="atp-error">
          <div className="atp-error__icon">🔐</div>
          <h2>{t('academyTestPlayer.loginRequired', 'Влезте в профила си')}</h2>
          <p>{t('academyTestPlayer.loginRequiredDesc', 'Трябва да влезете, за да решите теста.')}</p>
          <Link to="/sign-in" className="atp-error__btn">
            {t('academyTestPlayer.login', 'Вход')}
          </Link>
        </div>
      </div>
    );
  }

  if (isLoadingTest || isLoading) {
    return (
      <div className="atp">
        <div className="atp-loading">
          <div className="atp-loading__spinner"></div>
          <p>{t('academyTestPlayer.loading', 'Зареждане на теста...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="atp">
        <div className="atp-error">
          <div className="atp-error__icon">⚠️</div>
          <h2>{t('academyTestPlayer.error', 'Грешка')}</h2>
          <p>{error}</p>
          <button onClick={handleBackToLesson} className="atp-error__btn">
            {t('academyTestPlayer.backToLesson', 'Към урока')}
          </button>
        </div>
      </div>
    );
  }

  if (!testData || !testData.test) {
    return (
      <div className="atp">
        <div className="atp-error">
          <div className="atp-error__icon">📝</div>
          <h2>{t('academyTestPlayer.notFound', 'Тестът не е намерен')}</h2>
          <button onClick={handleBackToLesson} className="atp-error__btn">
            {t('academyTestPlayer.backToLesson', 'Към урока')}
          </button>
        </div>
      </div>
    );
  }

  const test = testData.test;
  const currentQuestion = questions[currentQuestionIndex];
  const attemptNumber = testData.attempt?.attemptNumber ?? 1;
  const canRetry = !results?.passed && test.maxAttempts > attemptNumber;

  // =========================================================
  //                    RESULTS SCREEN
  // =========================================================

  if (showResults && results) {
    const scorePercentage = results.scorePercentage ?? 0;
    const isPassed = results.passed ?? false;
    const correctAnswers = results.correctAnswers ?? 0;
    const wrongAnswers = results.wrongAnswers ?? 0;
    const totalQuestions = results.totalQuestions ?? questions.length;
    const earnedCredits = results.earnedCredits ?? 0;
    
    return (
      <div className="atp atp--results">
        <div className="atp-results">
          <div className={`atp-results__card ${isPassed ? 'atp-results__card--passed' : 'atp-results__card--failed'}`}>
            {/* Icon */}
            <div className="atp-results__icon">
              {isPassed ? '🎉' : '😔'}
            </div>
            
            {/* Title */}
            <h1 className="atp-results__title">
              {isPassed 
                ? t('academyTestPlayer.results.passed', 'Поздравления!')
                : t('academyTestPlayer.results.failed', 'Опитайте отново')
              }
            </h1>
            
            {/* Subtitle */}
            <p className="atp-results__subtitle">
              {isPassed 
                ? t('academyTestPlayer.results.passedDesc', 'Успешно преминахте теста!')
                : t('academyTestPlayer.results.failedDesc', 'За съжаление не достигнахте минималния резултат.')
              }
            </p>

            {/* Score Circle */}
            <div className="atp-results__score">
              <div className="atp-results__score-circle">
                <svg viewBox="0 0 100 100">
                  <circle 
                    className="atp-results__score-bg" 
                    cx="50" cy="50" r="45"
                  />
                  <circle 
                    className="atp-results__score-fill" 
                    cx="50" cy="50" r="45"
                    style={{ 
                      strokeDasharray: `${(scorePercentage / 100) * 283} 283`,
                      stroke: isPassed ? '#10b981' : '#ef4444'
                    }}
                  />
                </svg>
                <span className="atp-results__score-value">{Math.round(scorePercentage)}%</span>
              </div>
              <span className="atp-results__score-label">
                {t('academyTestPlayer.results.yourScore', 'Вашият резултат')}
              </span>
            </div>

            {/* Stats */}
            <div className="atp-results__stats">
              <div className="atp-results__stat">
                <span className="atp-results__stat-value atp-results__stat-value--correct">
                  {correctAnswers}
                </span>
                <span className="atp-results__stat-label">
                  {t('academyTestPlayer.results.correct', 'Верни')}
                </span>
              </div>
              <div className="atp-results__stat-divider"></div>
              <div className="atp-results__stat">
                <span className="atp-results__stat-value atp-results__stat-value--wrong">
                  {wrongAnswers}
                </span>
                <span className="atp-results__stat-label">
                  {t('academyTestPlayer.results.wrong', 'Грешни')}
                </span>
              </div>
              <div className="atp-results__stat-divider"></div>
              <div className="atp-results__stat">
                <span className="atp-results__stat-value">{totalQuestions}</span>
                <span className="atp-results__stat-label">
                  {t('academyTestPlayer.results.total', 'Общо')}
                </span>
              </div>
              <div className="atp-results__stat-divider"></div>
              <div className="atp-results__stat">
                <span className="atp-results__stat-value">{test.passingScore}%</span>
                <span className="atp-results__stat-label">
                  {t('academyTestPlayer.results.passing', 'Минимум')}
                </span>
              </div>
            </div>

            {/* Earned Credits - показваме само ако има и е преминал */}
            {isPassed && earnedCredits > 0 && (
              <div className="atp-results__credits">
                <span className="atp-results__credits-icon">🪙</span>
                <span>+{earnedCredits} {t('academyTestPlayer.results.creditsEarned', 'кредита спечелени!')}</span>
              </div>
            )}

            {/* Actions */}
            <div className="atp-results__actions">
              {isPassed ? (
                // Ако е преминал - бутон за продължаване
                <>
                  <button onClick={handleContinueCourse} className="atp-results__btn atp-results__btn--primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    {t('academyTestPlayer.results.continueCourse', 'Продължи с курса')}
                  </button>
                  <button onClick={handleBackToLesson} className="atp-results__btn atp-results__btn--secondary">
                    {t('academyTestPlayer.results.backToLesson', 'Към урока')}
                  </button>
                </>
              ) : (
                // Ако не е преминал
                <>
                  <button onClick={handleBackToLesson} className="atp-results__btn atp-results__btn--primary">
                    {t('academyTestPlayer.results.backToLesson', 'Към урока')}
                  </button>
                  
                  {canRetry && (
                    <button 
                      onClick={handleRetryTest} 
                      className="atp-results__btn atp-results__btn--retry"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 4v6h6M23 20v-6h-6" />
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                      </svg>
                      {t('academyTestPlayer.results.tryAgain', 'Опитай отново')}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Attempt Info */}
            <div className="atp-results__attempts">
              <span className="atp-results__attempts-icon">📊</span>
              {t('academyTestPlayer.results.attemptInfo', {
                current: attemptNumber,
                max: test.maxAttempts,
                defaultValue: `Опит ${attemptNumber} от ${test.maxAttempts}`
              })}
              {!canRetry && !isPassed && (
                <span className="atp-results__attempts-exhausted">
                  {' '}• {t('academyTestPlayer.results.noMoreAttempts', 'Няма повече опити')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  //                    MAIN TEST UI
  // =========================================================

  return (
    <div className="atp">
      {/* Header */}
      <header className="atp-header">
        <div className="atp-header__left">
          <button onClick={handleBackToLesson} className="atp-header__back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="atp-header__info">
            <h1 className="atp-header__title">{test.title}</h1>
            <span className="atp-header__meta">
              {t('academyTestPlayer.questionOf', {
                current: currentQuestionIndex + 1,
                total: questions.length,
                defaultValue: `Въпрос ${currentQuestionIndex + 1} от ${questions.length}`
              })}
            </span>
          </div>
        </div>

        <div className="atp-header__right">
          {timeRemaining !== null && (
            <div className={`atp-header__timer ${isTimeWarning ? 'atp-header__timer--warning' : ''} ${isTimeCritical ? 'atp-header__timer--critical' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
              <span>{formatTime(timeRemaining)}</span>
            </div>
          )}

          <div className="atp-header__progress">
            <span>{getAnsweredCount()}/{questions.length}</span>
            <div className="atp-header__progress-bar">
              <div 
                className="atp-header__progress-fill"
                style={{ width: `${(getAnsweredCount() / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {isSavingAnswer && (
            <div className="atp-header__saving">
              <div className="atp-header__saving-spinner"></div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="atp-main">
        <div className="atp-container">
          {/* Sidebar */}
          <aside className="atp-sidebar">
            <h3 className="atp-sidebar__title">
              {t('academyTestPlayer.questions', 'Въпроси')}
            </h3>
            <div className="atp-sidebar__grid">
              {questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => handleGoToQuestion(index)}
                  className={`atp-sidebar__item 
                    ${index === currentQuestionIndex ? 'atp-sidebar__item--active' : ''}
                    ${getQuestionStatus(q.id) === 'answered' ? 'atp-sidebar__item--answered' : ''}
                  `}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div className="atp-sidebar__legend">
              <div className="atp-sidebar__legend-item">
                <span className="atp-sidebar__legend-dot atp-sidebar__legend-dot--answered"></span>
                <span>{t('academyTestPlayer.answered', 'Отговорен')}</span>
              </div>
              <div className="atp-sidebar__legend-item">
                <span className="atp-sidebar__legend-dot atp-sidebar__legend-dot--unanswered"></span>
                <span>{t('academyTestPlayer.unanswered', 'Неотговорен')}</span>
              </div>
              <div className="atp-sidebar__legend-item">
                <span className="atp-sidebar__legend-dot atp-sidebar__legend-dot--current"></span>
                <span>{t('academyTestPlayer.current', 'Текущ')}</span>
              </div>
            </div>
          </aside>

          {/* Question Card */}
          <div className="atp-question">
            {currentQuestion && (
              <>
                <div className="atp-question__header">
                  <span className="atp-question__number">
                    {t('academyTestPlayer.question', 'Въпрос')} {currentQuestionIndex + 1}
                  </span>
                  <span className="atp-question__points">
                    {currentQuestion.points} {currentQuestion.points === 1 
                      ? t('academyTestPlayer.point', 'точка')
                      : t('academyTestPlayer.points', 'точки')
                    }
                  </span>
                  <span className={`atp-question__type atp-question__type--${currentQuestion.questionType}`}>
                    {currentQuestion.questionType === 'single' && t('academyTestPlayer.typeSingle', 'Един верен')}
                    {currentQuestion.questionType === 'multiple' && t('academyTestPlayer.typeMultiple', 'Няколко верни')}
                    {currentQuestion.questionType === 'true_false' && t('academyTestPlayer.typeTrueFalse', 'Вярно/Невярно')}
                  </span>
                </div>

                <h2 className="atp-question__text">
                  {currentQuestion.questionText}
                </h2>

                {currentQuestion.imageUrl && (
                  <div className="atp-question__image">
                    <img src={currentQuestion.imageUrl} alt="" />
                  </div>
                )}

                <div className="atp-question__answers">
                  {currentQuestion.answerOptions?.map((option) => {
                    const isMultiple = currentQuestion.questionType === 'multiple';
                    const currentAnswer = answers[currentQuestion.id];
                    const isSelected = isMultiple
                      ? (currentAnswer || []).includes(option.id)
                      : currentAnswer === option.id;

                    return (
                      <button
                        key={option.id}
                        onClick={() => handleAnswerSelect(currentQuestion.id, option.id, isMultiple)}
                        className={`atp-question__answer ${isSelected ? 'atp-question__answer--selected' : ''}`}
                      >
                        <span className="atp-question__answer-indicator">
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
                        <span className="atp-question__answer-text">{option.answerText}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="atp-question__nav">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="atp-question__nav-btn atp-question__nav-btn--prev"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    {t('academyTestPlayer.prev', 'Предишен')}
                  </button>

                  {currentQuestionIndex === questions.length - 1 ? (
                    <button
                      onClick={() => handleSubmitTest(false)}
                      disabled={isSubmitting}
                      className="atp-question__nav-btn atp-question__nav-btn--submit"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="atp-question__nav-spinner"></span>
                          {t('academyTestPlayer.submitting', 'Предаване...')}
                        </>
                      ) : (
                        <>
                          {t('academyTestPlayer.submit', 'Предай теста')}
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="atp-question__nav-btn atp-question__nav-btn--next"
                    >
                      {t('academyTestPlayer.next', 'Следващ')}
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
      <footer className="atp-footer">
        <div className="atp-footer__info">
          <span>📋 {test.title}</span>
          <span>•</span>
          <span>🎯 {t('academyTestPlayer.passingScore', 'Минимум')}: {test.passingScore}%</span>
          <span>•</span>
          <span>🪙 {t('academyTestPlayer.maxCredits', 'Макс. кредити')}: {test.maxCredits}</span>
          {test.maxAttempts && (
            <>
              <span>•</span>
              <span>🔄 {t('academyTestPlayer.attempt', 'Опит')}: {attemptNumber}/{test.maxAttempts}</span>
            </>
          )}
        </div>
      </footer>
    </div>
  );
};

export default AcademyTestPlayer;