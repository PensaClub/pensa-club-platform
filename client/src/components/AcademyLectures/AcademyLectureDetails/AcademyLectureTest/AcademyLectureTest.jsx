// src/components/AcademyLectures/AcademyLectureTest/AcademyLectureTest.jsx

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { LocalizedLink as Link } from '../../../LocalizedLink/LocalizedLink';
import { useLocalizedNavigate } from '../../../../hooks/useLocalizedNavigate';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../../contexts/UserContext';
import { useAcademyCourses } from '../../../contexts/AcademyCoursesProvider';
import './academyLectureTest.css';
import AcademyLectureTestSkeleton from './AcademyLectureTestSkeleton/AcademyLectureTestSkeleton';
import { TextZoom } from '../../../TextZoom/TextZoom';

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

const calculateScorePercentage = (correctAnswers, totalQuestions) => {
  if (!totalQuestions || totalQuestions === 0) return 0;
  return Math.round((correctAnswers / totalQuestions) * 100);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('bg-BG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatTime = (seconds) => {
  if (seconds === null || seconds === undefined) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const AcademyLectureTest = () => {
  const { slug } = useParams();
  const { t } = useTranslation('academy');
  const navigate = useLocalizedNavigate();
  const { isAuthentication } = useAuthContext();
  const {
    getLectureBySlug,
    startLectureTest,
    getLectureTestStatus,
    submitLectureAnswer,
    submitLectureTest,
    isLoading
  } = useAcademyCourses();

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════════════

  const [lecture, setLecture] = useState(null);
  const [testData, setTestData] = useState(null);
  const [testStatus, setTestStatus] = useState(null);
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

  // History & Results state
  const [previousAttempts, setPreviousAttempts] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showQuestionsReview, setShowQuestionsReview] = useState(false);
  const [questionsResult, setQuestionsResult] = useState([]);
  const [canStartNewAttempt, setCanStartNewAttempt] = useState(true);
  const [remainingAttempts, setRemainingAttempts] = useState(0);
  const [hasPassedTest, setHasPassedTest] = useState(false);
  const [bestAttempt, setBestAttempt] = useState(null);

  // Refs
  const timerRef = useRef(null);
  const fetchedRef = useRef(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA FETCHING
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    const fetchTestData = async () => {
      if (!slug) return;

      const cacheKey = slug;
      if (fetchedRef.current === cacheKey && testData) return;

      try {
        fetchedRef.current = cacheKey;
        setError(null);
        setIsLoadingTest(true);

        // 1. Get lecture info
        const lectureResponse = await getLectureBySlug(slug);
        const lectureInfo = lectureResponse?.lecture || lectureResponse;
        setLecture(lectureInfo);

        if (!lectureInfo || !lectureInfo.id) {
          throw new Error(t('academyLectureTest.errors.lectureNotFound'));
        }

        if (!lectureInfo.hasTest) {
          throw new Error(t('academyLectureTest.errors.noTest'));
        }

        // 2. Get test status + previous attempts
        let statusData = null;
        try {
          statusData = await getLectureTestStatus(lectureInfo.id);
          setTestStatus(statusData);

          // Store all the rich data from status
          if (statusData?.attempts) {
            setPreviousAttempts(statusData.attempts);
          }

          if (statusData?.bestAttempt) {
            setBestAttempt(statusData.bestAttempt);
          }

          // Use the correct field names from API
          setCanStartNewAttempt(statusData?.canStartNew ?? true);
          setRemainingAttempts(statusData?.remainingAttempts ?? 0);
          setHasPassedTest(statusData?.hasPassedTest ?? false);

          // ✅ ПРОВЕРКА: Ако няма повече опити - покажи съобщение
          if (statusData?.remainingAttempts === 0 && !statusData?.activeAttempt) {
            // Покажи последния/най-добрия резултат
            const displayAttempt = statusData.bestAttempt || statusData.lastAttempt;
            if (displayAttempt) {
              const scorePercent = displayAttempt.score ?? calculateScorePercentage(displayAttempt.correctAnswers, displayAttempt.totalQuestions);
              const isPassed = scorePercent >= (statusData?.test?.passingScore || 70);

              setShowResults(true);
              setResults({
                scorePercentage: scorePercent,
                correctAnswers: displayAttempt.correctAnswers || 0,
                wrongAnswers: displayAttempt.wrongAnswers || ((displayAttempt.totalQuestions || 0) - (displayAttempt.correctAnswers || 0)),
                totalQuestions: displayAttempt.totalQuestions || 0,
                passed: isPassed,
                earnedCredits: displayAttempt.earnedCredits || 0,
                attemptId: displayAttempt.id,
                attemptNumber: displayAttempt.attemptNumber || 1
              });

              if (displayAttempt.questionsResult) {
                setQuestionsResult(displayAttempt.questionsResult);
              }

              setTestData({ test: statusData.test, attempt: displayAttempt });
            }
            return; // ✅ САМО тук return - когато НЯМА повече опити
          }

          // ✅ Ако има активен опит - продължи го
          if (statusData?.activeAttempt) {
            const data = await startLectureTest(lectureInfo.id);
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
            }
            return;
          }

          // ✅ Ако има завършен опит (минал или не) - покажи резултатите
          // но НЕ return-вай - позволи retry ако има опити
          const lastAttempt = statusData?.lastAttempt;
          if (lastAttempt?.status === 'completed') {
            const scorePercent = lastAttempt.score ?? calculateScorePercentage(lastAttempt.correctAnswers, lastAttempt.totalQuestions);
            const isPassed = scorePercent >= (statusData?.test?.passingScore || 70);

            setShowResults(true);
            setResults({
              scorePercentage: scorePercent,
              correctAnswers: lastAttempt.correctAnswers || 0,
              wrongAnswers: lastAttempt.wrongAnswers || ((lastAttempt.totalQuestions || 0) - (lastAttempt.correctAnswers || 0)),
              totalQuestions: lastAttempt.totalQuestions || 0,
              passed: isPassed,
              earnedCredits: lastAttempt.earnedCredits || 0,
              attemptId: lastAttempt.id,
              attemptNumber: lastAttempt.attemptNumber || 1
            });

            if (lastAttempt.questionsResult) {
              setQuestionsResult(lastAttempt.questionsResult);
            }

            setTestData({ test: statusData.test, attempt: lastAttempt });
            // ❌ НЕ return-вай тук - позволи retry бутона да работи
            return;
          }

        } catch (err) {
          console.warn('Could not get test status, will try to start:', err);
        }

        // 3. Започни нов тест ако може
        if (!statusData || statusData?.canStartNew) {
          const data = await startLectureTest(lectureInfo.id);

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

            if (data.attempt?.status === 'completed') {
              const scorePercent = data.attempt.score ?? calculateScorePercentage(data.attempt.correctAnswers, data.attempt.totalQuestions);
              const isPassed = scorePercent >= (data.test?.passingScore || 70);

              setShowResults(true);
              setResults({
                scorePercentage: scorePercent,
                correctAnswers: data.attempt.correctAnswers || 0,
                wrongAnswers: data.attempt.wrongAnswers || ((data.attempt.totalQuestions || data.questions?.length || 0) - (data.attempt.correctAnswers || 0)),
                totalQuestions: data.attempt.totalQuestions || data.questions?.length || 0,
                passed: isPassed,
                earnedCredits: data.attempt.earnedCredits || 0,
                attemptId: data.attempt.id,
                attemptNumber: data.attempt.attemptNumber || 1
              });

              if (data.attempt.questionsResult) {
                setQuestionsResult(data.attempt.questionsResult);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching test:', err);
        setError(err.message || t('academyLectureTest.errors.loadFailed'));
      } finally {
        setIsLoadingTest(false);
      }
    };

    if (isAuthentication) {
      fetchTestData();
    }
  }, [slug, isAuthentication]);

  // ═══════════════════════════════════════════════════════════════════════════
  // TIMER
  // ═══════════════════════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTED VALUES
  // ═══════════════════════════════════════════════════════════════════════════

  const currentQuestion = useMemo(() => {
    if (!questions?.length) return null;
    return questions[currentQuestionIndex];
  }, [questions, currentQuestionIndex]);

  const test = testData?.test;
  const attemptNumber = results?.attemptNumber || testData?.attempt?.attemptNumber || 1;
  const maxAttempts = test?.maxAttempts || 3;
  const canRetry = remainingAttempts > 0 && canStartNewAttempt;

  const isTimeWarning = timeRemaining !== null && timeRemaining <= 60;
  const isTimeCritical = timeRemaining !== null && timeRemaining <= 30;

  const getQuestionStatus = useCallback((questionId) => {
    const answer = answers[questionId];
    if (answer !== undefined && answer !== null) {
      if (Array.isArray(answer)) {
        return answer.length > 0 ? 'answered' : 'unanswered';
      }
      return 'answered';
    }
    return 'unanswered';
  }, [answers]);

  const getAnsweredCount = useCallback(() => {
    return questions.filter(q => getQuestionStatus(q.id) === 'answered').length;
  }, [questions, getQuestionStatus]);

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleAnswerSelect = useCallback(async (questionId, answerId, isMultiple = false) => {
    // ✅ Изчисли новата стойност ПРЕДИ setAnswers
    let newAnswerValue;

    if (isMultiple) {
      const currentAnswers = answers[questionId] || [];
      newAnswerValue = currentAnswers.includes(answerId)
        ? currentAnswers.filter(id => id !== answerId)
        : [...currentAnswers, answerId];
    } else {
      newAnswerValue = answerId;
    }

    // Обнови state-а
    setAnswers(prev => ({ ...prev, [questionId]: newAnswerValue }));

    // Изпрати към backend-а
    if (testData?.test?.id) {
      setIsSavingAnswer(true);
      try {
        await submitLectureAnswer(testData.test.id, {
          questionId,
          answerId: newAnswerValue  // ✅ Сега има стойност!
        });
      } catch (err) {
        console.error('Error saving answer:', err);
      } finally {
        setIsSavingAnswer(false);
      }
    }
  }, [testData, submitLectureAnswer, answers]);  // ✅ Добави answers в dependencies

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
          t('academyLectureTest.confirmSubmitUnanswered', {
            count: unanswered.length
          })
        );
        if (!confirm) return;
      }
    }

    setIsSubmitting(true);
    try {
      const response = await submitLectureTest(testData.test.id);

      const resultData = response.result || response;

      // Calculate score if not provided
      const scorePercent = resultData.scorePercentage ?? resultData.score ??
        calculateScorePercentage(resultData.correctAnswers, resultData.totalQuestions || questions.length);

      const isPassed = resultData.passed ?? resultData.isPassed ??
        (scorePercent >= (testData.test?.passingScore || 70));

      setResults({
        scorePercentage: scorePercent,
        correctAnswers: resultData.correctAnswers ?? 0,
        wrongAnswers: resultData.wrongAnswers ?? ((resultData.totalQuestions ?? questions.length) - (resultData.correctAnswers ?? 0)),
        totalQuestions: resultData.totalQuestions ?? questions.length,
        passed: isPassed,
        earnedCredits: resultData.earnedCredits ?? 0,
        earnedPoints: resultData.earnedPoints ?? 0,
        totalPoints: resultData.totalPoints ?? 0,
        attemptId: resultData.attemptId,
        attemptNumber: testData.attempt?.attemptNumber || 1
      });

      // Store questions result if available
      if (resultData.questionsResult) {
        setQuestionsResult(resultData.questionsResult);
      }

      // Update remaining attempts
      if (remainingAttempts > 0) {
        setRemainingAttempts(prev => prev - 1);
      }

      if (isPassed) {
        setHasPassedTest(true);
      }

      setShowResults(true);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    } catch (err) {
      console.error('Error submitting test:', err);
      setError(err.message || t('academyLectureTest.errors.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLecture = () => {
    navigate(`/academy/lectures/${slug}`);
  };

  const handleRetryTest = async () => {
    if (!canStartNewAttempt || remainingAttempts <= 0) return;

    // Reset state
    setTestData(null);
    setQuestions([]);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setResults(null);
    setTimeRemaining(null);
    setQuestionsResult([]);
    setShowQuestionsReview(false);
    fetchedRef.current = null;
    setIsLoadingTest(true);

    try {
      const data = await startLectureTest(lecture.id);

      if (data) {
        setTestData(data);
        setQuestions(data.questions || []);

        if (data.test?.timeLimitMinutes) {
          setTimeRemaining(data.test.timeLimitMinutes * 60);
        }
      }
    } catch (err) {
      console.error('Error starting new attempt:', err);
      setError(err.message || t('academyLectureTest.errors.retryFailed'));
    } finally {
      setIsLoadingTest(false);
    }
  };

  const handleViewAttemptQuestions = (attempt) => {
    if (attempt.questionsResult) {
      setQuestionsResult(attempt.questionsResult);
      setShowQuestionsReview(true);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER STATES
  // ═══════════════════════════════════════════════════════════════════════════

  if (!isAuthentication) {
    return (
      <div className="alt">
        <div className="alt-error">
          <div className="alt-error__icon">🔐</div>
          <h2>{t('academyLectureTest.loginRequired')}</h2>
          <p>{t('academyLectureTest.loginRequiredDesc')}</p>
          <Link to="/sign-in" className="alt-error__btn">
            {t('academyLectureTest.login')}
          </Link>
        </div>
      </div>
    );
  }

  if (isLoadingTest || isLoading) {
    return <AcademyLectureTestSkeleton />;
  }

  if (error) {
    return (
      <div className="alt">
        <div className="alt-error">
          <div className="alt-error__icon">⚠️</div>
          <h2>{t('academyLectureTest.error')}</h2>
          <p>{error}</p>
          <button onClick={handleBackToLecture} className="alt-error__btn">
            {t('academyLectureTest.backToLecture')}
          </button>
        </div>
      </div>
    );
  }

  if (!testData || !testData.test) {
    return (
      <div className="alt">
        <div className="alt-error">
          <div className="alt-error__icon">📝</div>
          <h2>{t('academyLectureTest.notFound')}</h2>
          <button onClick={handleBackToLecture} className="alt-error__btn">
            {t('academyLectureTest.backToLecture')}
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RESULTS SCREEN
  // ═══════════════════════════════════════════════════════════════════════════

  if (showResults && results) {
    const scorePercentage = results.scorePercentage ?? 0;
    const isPassed = results.passed ?? false;
    const correctAnswers = results.correctAnswers ?? 0;
    const wrongAnswers = results.wrongAnswers ?? 0;
    const totalQuestionsCount = results.totalQuestions ?? questions.length;
    const earnedCredits = results.earnedCredits ?? 0;

    return (
      <div className="alt alt--results">
        <div className="alt-results">
          <div className={`alt-results__card ${isPassed ? 'alt-results__card--passed' : 'alt-results__card--failed'}`}>
            {/* Icon */}
            <div className="alt-results__icon">
              {isPassed ? '🎉' : '😔'}
            </div>

            {/* Title */}
            <h1 className="alt-results__title">
              {isPassed
                ? t('academyLectureTest.results.passed')
                : t('academyLectureTest.results.failed')
              }
            </h1>

            {/* Subtitle */}
            <p className="alt-results__subtitle">
              {isPassed
                ? t('academyLectureTest.results.passedDesc')
                : t('academyLectureTest.results.failedDesc')
              }
            </p>

            {/* Score Circle */}
            <div className="alt-results__score">
              <div className="alt-results__score-circle">
                <svg viewBox="0 0 100 100">
                  <circle
                    className="alt-results__score-bg"
                    cx="50" cy="50" r="45"
                  />
                  <circle
                    className="alt-results__score-fill"
                    cx="50" cy="50" r="45"
                    style={{
                      strokeDasharray: `${(scorePercentage / 100) * 283} 283`,
                      stroke: isPassed ? '#10b981' : '#ef4444'
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
                <span className="alt-results__stat-label">
                  {t('academyLectureTest.results.correct')}
                </span>
              </div>
              <div className="alt-results__stat-divider"></div>
              <div className="alt-results__stat">
                <span className="alt-results__stat-value alt-results__stat-value--wrong">
                  {wrongAnswers}
                </span>
                <span className="alt-results__stat-label">
                  {t('academyLectureTest.results.wrong')}
                </span>
              </div>
              <div className="alt-results__stat-divider"></div>
              <div className="alt-results__stat">
                <span className="alt-results__stat-value">{totalQuestionsCount}</span>
                <span className="alt-results__stat-label">
                  {t('academyLectureTest.results.total')}
                </span>
              </div>
              <div className="alt-results__stat-divider"></div>
              <div className="alt-results__stat">
                <span className="alt-results__stat-value">{test.passingScore}%</span>
                <span className="alt-results__stat-label">
                  {t('academyLectureTest.results.passing')}
                </span>
              </div>
            </div>

            {/* Earned Credits */}
            {isPassed && earnedCredits > 0 && (
              <div className="alt-results__credits">
                <span className="alt-results__credits-icon">🪙</span>
                <span>+{earnedCredits} {t('academyLectureTest.results.creditsEarned')}</span>
              </div>
            )}

            {/* Questions Review Toggle */}
            {questionsResult.length > 0 && test.showCorrectAnswers && (
              <div className="alt-results__review">
                <button
                  className="alt-results__review-toggle"
                  onClick={() => setShowQuestionsReview(!showQuestionsReview)}
                >
                  <span>📋 {t('academyLectureTest.results.reviewAnswers')}</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ transform: showQuestionsReview ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {showQuestionsReview && (
                  <div className="alt-results__review-list">
                    {questionsResult.map((q, idx) => (
                      <div
                        key={q.questionId || idx}
                        className={`alt-results__review-item ${q.isCorrect ? 'alt-results__review-item--correct' : 'alt-results__review-item--wrong'}`}
                      >
                        <div className="alt-results__review-header">
                          <span className="alt-results__review-num">
                            {q.questionNumber || idx + 1}.
                          </span>
                          <span className={`alt-results__review-badge ${q.isCorrect ? 'alt-results__review-badge--correct' : 'alt-results__review-badge--wrong'}`}>
                            {q.isCorrect
                              ? `✓ ${t('academyLectureTest.results.correctLabel')}`
                              : `✗ ${t('academyLectureTest.results.wrongLabel')}`
                            }
                          </span>
                        </div>
                        <p className="alt-results__review-question">
                          {q.questionText}
                        </p>
                        <div className="alt-results__review-answer">
                          <span className="alt-results__review-label">{t('academyLectureTest.results.yourAnswer')}:</span>
                          <span className={`alt-results__review-value ${q.isCorrect ? '' : 'alt-results__review-value--wrong'}`}>
                            {q.yourAnswer || t('academyLectureTest.results.noAnswer')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Attempt Info */}
            <div className="alt-results__attempts">
  <span className="alt-results__attempts-icon">📊</span>
  {t('academyLectureTest.results.attemptInfo', {
    current: attemptNumber,
    max: maxAttempts
  })}
  {/* ✅ Показвай remaining attempts винаги, не само при !isPassed */}
  {remainingAttempts > 0 && (
    <span className="alt-results__attempts-remaining">
      {' '}• {t('academyLectureTest.results.remainingAttempts', {
        count: remainingAttempts
      })}
    </span>
  )}
  {remainingAttempts === 0 && (
    <span className="alt-results__attempts-exhausted">
      {' '}• {t('academyLectureTest.results.noMoreAttempts')}
    </span>
  )}
</div>

            {/* Previous Attempts History */}
            {previousAttempts.length > 0 && (
              <div className="alt-results__history">
                <button
                  className="alt-results__history-toggle"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <span>📜 {t('academyLectureTest.results.attemptHistory')} ({previousAttempts.length})</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ transform: showHistory ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {showHistory && (
                  <div className="alt-results__history-list">
                    {previousAttempts.map((attempt, idx) => {
                      const attemptScore = attempt.score ?? calculateScorePercentage(attempt.correctAnswers, attempt.totalQuestions);
                      const attemptPassed = attemptScore >= (test.passingScore || 70);

                      return (
                        <div
                          key={attempt.id}
                          className={`alt-results__history-item ${attemptPassed ? 'alt-results__history-item--passed' : ''}`}
                        >
                          <span className="alt-results__history-num">#{attempt.attemptNumber || idx + 1}</span>
                          <span className="alt-results__history-date">{formatDate(attempt.completedAt || attempt.startedAt)}</span>
                          <span className="alt-results__history-details">
                            {attempt.correctAnswers}/{attempt.totalQuestions}
                          </span>
                          <span className={`alt-results__history-score ${attemptPassed ? 'alt-results__history-score--passed' : ''}`}>
                            {Math.round(attemptScore)}%
                          </span>
                          {attemptPassed && <span className="alt-results__history-badge">✅</span>}
                          {attempt.questionsResult && test.showCorrectAnswers && (
                            <button
                              className="alt-results__history-view"
                              onClick={() => handleViewAttemptQuestions(attempt)}
                              title={t('academyLectureTest.results.viewAnswers')}
                            >
                              👁️
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Best Attempt Info */}
            {bestAttempt && previousAttempts.length > 1 && (
              <div className="alt-results__best">
                <span className="alt-results__best-icon">🏆</span>
                <span className="alt-results__best-text">
                  {t('academyLectureTest.results.bestAttempt')}: {' '}
                  <strong>{Math.round(bestAttempt.score ?? calculateScorePercentage(bestAttempt.correctAnswers, bestAttempt.totalQuestions))}%</strong>
                  {' '}({t('academyLectureTest.results.attempt')} #{bestAttempt.attemptNumber})
                </span>
              </div>
            )}
            {/* Actions */}
            <div className="alt-results__actions">
        
              {canRetry && (
                <button
                  onClick={handleRetryTest}
                  className={`alt-results__btn ${isPassed ? 'alt-results__btn--secondary' : 'alt-results__btn--retry'}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 4v6h6M23 20v-6h-6" />
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                  </svg>
                  {t('academyLectureTest.results.tryAgain')}
                </button>
              )}

              <button
                onClick={handleBackToLecture}
                className={`alt-results__btn ${isPassed && !canRetry ? 'alt-results__btn--primary' : 'alt-results__btn--secondary'}`}
              >
                {isPassed && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
                {t('academyLectureTest.results.backToLecture')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN TEST UI
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <>
    <TextZoom />
    <div className="alt">
      {/* Header */}
      <header className="alt-header">
        <div className="alt-header__left">
          <button onClick={handleBackToLecture} className="alt-header__back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="alt-header__info">
            <h1 className="alt-header__title">{test.title}</h1>
            <span className="alt-header__meta">
              {t('academyLectureTest.questionOf', {
                current: currentQuestionIndex + 1,
                total: questions.length
              })}
            </span>
          </div>
        </div>

        <div className="alt-header__right">
          {timeRemaining !== null && (
            <div className={`alt-header__timer ${isTimeWarning ? 'alt-header__timer--warning' : ''} ${isTimeCritical ? 'alt-header__timer--critical' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
              <span>{formatTime(timeRemaining)}</span>
            </div>
          )}

          <div className="alt-header__progress">
            <span>{getAnsweredCount()}/{questions.length}</span>
            <div className="alt-header__progress-bar">
              <div
                className="alt-header__progress-fill"
                style={{ width: `${(getAnsweredCount() / questions.length) * 100}%` }}
              ></div>
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
            <h3 className="alt-sidebar__title">
              {t('academyLectureTest.questions')}
            </h3>
            <div className="alt-sidebar__grid">
              {questions.map((q, index) => (
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
                <span>{t('academyLectureTest.answered')}</span>
              </div>
              <div className="alt-sidebar__legend-item">
                <span className="alt-sidebar__legend-dot alt-sidebar__legend-dot--unanswered"></span>
                <span>{t('academyLectureTest.unanswered')}</span>
              </div>
              <div className="alt-sidebar__legend-item">
                <span className="alt-sidebar__legend-dot alt-sidebar__legend-dot--current"></span>
                <span>{t('academyLectureTest.current')}</span>
              </div>
            </div>
          </aside>

          {/* Question Card */}
          <div className="alt-question">
            {currentQuestion && (
              <>
                <div className="alt-question__header">
                  <span className="alt-question__number">
                    {t('academyLectureTest.question')} {currentQuestionIndex + 1}
                  </span>
                  <span className="alt-question__points">
                    {currentQuestion.points} {currentQuestion.points === 1
                      ? t('academyLectureTest.point')
                      : t('academyLectureTest.points')
                    }
                  </span>
                  <span className={`alt-question__type alt-question__type--${currentQuestion.questionType}`}>
                    {currentQuestion.questionType === 'single' && t('academyLectureTest.typeSingle')}
                    {currentQuestion.questionType === 'multiple' && t('academyLectureTest.typeMultiple')}
                    {currentQuestion.questionType === 'true_false' && t('academyLectureTest.typeTrueFalse')}
                  </span>
                </div>

                <h2 className="alt-question__text">
                  {currentQuestion.questionText}
                </h2>

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
                        onClick={() => handleAnswerSelect(currentQuestion.id, option.id, isMultiple)}
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
                    {t('academyLectureTest.prev')}
                  </button>

                  {currentQuestionIndex === questions.length - 1 ? (
                    <button
                      onClick={() => handleSubmitTest(false)}
                      disabled={isSubmitting}
                      className="alt-question__nav-btn alt-question__nav-btn--submit"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="alt-question__nav-spinner"></span>
                          {t('academyLectureTest.submitting')}
                        </>
                      ) : (
                        <>
                          {t('academyLectureTest.submit')}
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
                      {t('academyLectureTest.next')}
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
          <span>📋 {test.title}</span>
          <span>•</span>
          <span>🎯 {t('academyLectureTest.passingScore')}: {test.passingScore}%</span>
          <span>•</span>
          <span>🪙 {t('academyLectureTest.maxCredits')}: {test.maxCredits || test.creditsForPassing || 0}</span>
          {maxAttempts && (
            <>
              <span>•</span>
              <span>🔄 {t('academyLectureTest.attempt')}: {attemptNumber}/{maxAttempts}</span>
            </>
          )}
        </div>
      </footer>
    </div>
    </>
  );
};

export default AcademyLectureTest;