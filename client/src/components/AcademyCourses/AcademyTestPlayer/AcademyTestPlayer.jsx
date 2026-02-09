// src/components/AcademyCourses/AcademyTestPlayer/AcademyTestPlayer.jsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../contexts/UserContext';
import { useAcademyCourses } from '../../contexts/AcademyCoursesProvider';
import './academyTestPlayer.css';

const AcademyTestPlayer = () => {
  const { t } = useTranslation();
  const { courseSlug, lessonSlug } = useParams();
  const isCourseTest = !lessonSlug;
  const navigate = useNavigate();

  const { isAuthentication } = useAuthContext();
  const {
    getLessonBySlug,
    getTestStatus,
    startTest,
    startTestById,
    getCourseTestStatus,
    getCourseBySlug,
    currentCourse,
    submitAnswer,
    submitTest,
    isLoading
  } = useAcademyCourses();

  // State
  const [lesson, setLesson] = useState(null);
  const [testStatus, setTestStatus] = useState(null);
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

  // History & Results state
  const [previousAttempts, setPreviousAttempts] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showQuestionsReview, setShowQuestionsReview] = useState(false);
  const [questionsResult, setQuestionsResult] = useState([]);
  const [canStartNewAttempt, setCanStartNewAttempt] = useState(true);
  const [remainingAttempts, setRemainingAttempts] = useState(0);
  const [hasPassedTest, setHasPassedTest] = useState(false);
  const [bestAttempt, setBestAttempt] = useState(null);

  const timerRef = useRef(null);
  const fetchedRef = useRef(null);

  // =========================================================
  //                    HELPER: Calculate Score
  // =========================================================

  const calculateScorePercentage = (correctAnswers, totalQuestions) => {
    if (!totalQuestions || totalQuestions === 0) return 0;
    return Math.round((correctAnswers / totalQuestions) * 100);
  };

  // =========================================================
  //                    DATA FETCHING
  // =========================================================

  useEffect(() => {
    const fetchTestData = async () => {
      // ========== COURSE TEST MODE ==========
      if (isCourseTest) {
        if (!courseSlug) return;

        const cacheKey = `course-${courseSlug}`;
        if (fetchedRef.current === cacheKey && testData) return;

        try {
          fetchedRef.current = cacheKey;
          setError(null);
          setIsLoadingTest(true);

          // 1. Get course info
          const courseResponse = await getCourseBySlug(courseSlug);
          const courseInfo = courseResponse?.course || courseResponse || currentCourse;

          if (!courseInfo || !courseInfo.id) {
            throw new Error('Курсът не е намерен');
          }

          // Set a pseudo-lesson object for display purposes
          setLesson({
            id: null,
            title: courseInfo.name || courseInfo.title,
            courseId: courseInfo.id,
            slug: courseSlug
          });

          // 2. Get course test status
          let statusData = null;
          try {
            statusData = await getCourseTestStatus(courseInfo.id);

            if (!statusData?.hasTest) {
              throw new Error('Този курс няма финален тест');
            }

            setTestStatus(statusData);

            if (statusData?.attempts) setPreviousAttempts(statusData.attempts);
            if (statusData?.bestAttempt) setBestAttempt(statusData.bestAttempt);
            setCanStartNewAttempt(statusData?.canStartNew ?? true);
            setRemainingAttempts(statusData?.remainingAttempts ?? 0);
            setHasPassedTest(statusData?.hasPassedTest ?? false);

            if (!statusData?.testAccessible) {
              throw new Error('Завършете всички уроци в курса, за да отключите теста.');
            }

            // If passed - show best attempt
            if (statusData?.hasPassedTest && statusData?.bestAttempt) {
              const best = statusData.bestAttempt;
              const scorePercent = best.score ?? calculateScorePercentage(best.correctAnswers, best.totalQuestions);

              setShowResults(true);
              setResults({
                scorePercentage: scorePercent,
                correctAnswers: best.correctAnswers || 0,
                wrongAnswers: best.wrongAnswers || 0,
                totalQuestions: best.totalQuestions || 0,
                passed: true,
                earnedCredits: best.earnedCredits || 0,
                attemptId: best.id,
                attemptNumber: best.attemptNumber || 1
              });

              if (best.questionsResult) setQuestionsResult(best.questionsResult);
              setTestData({ test: statusData.test, attempt: best });
              return;
            }

            // If completed last attempt (not passed)
            const lastAttempt = statusData?.lastAttempt;
            if (lastAttempt?.status === 'completed' && !statusData?.activeAttempt) {
              const scorePercent = lastAttempt.score ?? calculateScorePercentage(lastAttempt.correctAnswers, lastAttempt.totalQuestions);
              const isPassed = scorePercent >= (statusData?.test?.passingScore || 70);

              setShowResults(true);
              setResults({
                scorePercentage: scorePercent,
                correctAnswers: lastAttempt.correctAnswers || 0,
                wrongAnswers: lastAttempt.wrongAnswers || 0,
                totalQuestions: lastAttempt.totalQuestions || 0,
                passed: isPassed,
                earnedCredits: lastAttempt.earnedCredits || 0,
                attemptId: lastAttempt.id,
                attemptNumber: lastAttempt.attemptNumber || 1
              });

              if (lastAttempt.questionsResult) setQuestionsResult(lastAttempt.questionsResult);
              setTestData({ test: statusData.test, attempt: lastAttempt });
              return;
            }

            // Active attempt or start new — use generic startTestById
            if (statusData?.activeAttempt || statusData?.canStartNew) {
              const data = await startTestById(statusData.test.id);
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
                    wrongAnswers: data.attempt.wrongAnswers || 0,
                    totalQuestions: data.attempt.totalQuestions || data.questions?.length || 0,
                    passed: isPassed,
                    earnedCredits: data.attempt.earnedCredits || 0,
                    attemptId: data.attempt.id,
                    attemptNumber: data.attempt.attemptNumber || 1
                  });

                  if (data.attempt.questionsResult) setQuestionsResult(data.attempt.questionsResult);
                }
              }
            }

          } catch (err) {
            console.error('Error with course test status:', err);
            setError(err.message || 'Грешка при зареждане на теста');
          }
        } catch (err) {
          console.error('Error fetching course test:', err);
          setError(err.message || 'Грешка при зареждане на теста');
        } finally {
          setIsLoadingTest(false);
        }
        return;
      }

      // ========== LESSON TEST MODE (existing logic) ==========
      if (!courseSlug || !lessonSlug) return;

      const cacheKey = `${courseSlug}-${lessonSlug}`;
      if (fetchedRef.current === cacheKey && testData) return;

      try {
        fetchedRef.current = cacheKey;
        setError(null);
        setIsLoadingTest(true);

        // 1. Get lesson info
        const lessonResponse = await getLessonBySlug(courseSlug, lessonSlug);
        const lessonInfo = lessonResponse?.lesson || lessonResponse;
        setLesson(lessonInfo);

        if (!lessonInfo || !lessonInfo.id) {
          throw new Error('Урокът не е намерен');
        }

        if (!lessonInfo.hasTest) {
          throw new Error('Този урок няма тест');
        }

        // 2. Get test status + previous attempts
        let statusData = null;
        try {
          statusData = await getTestStatus(lessonInfo.id);
          setTestStatus(statusData);

          if (statusData?.attempts) setPreviousAttempts(statusData.attempts);
          if (statusData?.bestAttempt) setBestAttempt(statusData.bestAttempt);
          setCanStartNewAttempt(statusData?.canStartNew ?? true);
          setRemainingAttempts(statusData?.remainingAttempts ?? 0);
          setHasPassedTest(statusData?.hasPassedTest ?? false);

          // If test is already passed
          if (statusData?.hasPassedTest && statusData?.bestAttempt) {
            const best = statusData.bestAttempt;
            const scorePercent = best.score ?? calculateScorePercentage(best.correctAnswers, best.totalQuestions);

            setShowResults(true);
            setResults({
              scorePercentage: scorePercent,
              correctAnswers: best.correctAnswers || 0,
              wrongAnswers: best.wrongAnswers || 0,
              totalQuestions: best.totalQuestions || 0,
              passed: true,
              earnedCredits: best.earnedCredits || 0,
              attemptId: best.id,
              attemptNumber: best.attemptNumber || 1
            });

            if (best.questionsResult) setQuestionsResult(best.questionsResult);
            setTestData({ test: statusData.test, attempt: best });
            return;
          }

          // If there's a completed last attempt (not passed)
          const lastAttempt = statusData?.lastAttempt;
          if (lastAttempt?.status === 'completed' && !statusData?.activeAttempt) {
            const scorePercent = lastAttempt.score ?? calculateScorePercentage(lastAttempt.correctAnswers, lastAttempt.totalQuestions);
            const isPassed = scorePercent >= (statusData?.test?.passingScore || 70);

            setShowResults(true);
            setResults({
              scorePercentage: scorePercent,
              correctAnswers: lastAttempt.correctAnswers || 0,
              wrongAnswers: lastAttempt.wrongAnswers || 0,
              totalQuestions: lastAttempt.totalQuestions || 0,
              passed: isPassed,
              earnedCredits: lastAttempt.earnedCredits || 0,
              attemptId: lastAttempt.id,
              attemptNumber: lastAttempt.attemptNumber || 1
            });

            if (lastAttempt.questionsResult) setQuestionsResult(lastAttempt.questionsResult);
            setTestData({ test: statusData.test, attempt: lastAttempt });
            return;
          }

          // If there's an active attempt
          if (statusData?.activeAttempt) {
            const data = await startTest(lessonInfo.id);
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

        } catch (err) {
          console.warn('Could not get test status, will try to start:', err);
        }

        // 3. No active attempt and can start new
        if (canStartNewAttempt || !statusData) {
          const data = await startTest(lessonInfo.id);

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
                wrongAnswers: data.attempt.wrongAnswers || 0,
                totalQuestions: data.attempt.totalQuestions || data.questions?.length || 0,
                passed: isPassed,
                earnedCredits: data.attempt.earnedCredits || 0,
                attemptId: data.attempt.id,
                attemptNumber: data.attempt.attemptNumber || 1
              });

              if (data.attempt.questionsResult) setQuestionsResult(data.attempt.questionsResult);
            }
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
  }, [courseSlug, lessonSlug, isCourseTest, isAuthentication, getLessonBySlug, getTestStatus, startTest, startTestById, getCourseTestStatus, getCourseBySlug]);

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

  const answerDebounceRef = useRef(null);

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
      if (isMultiple) {
        // Debounce за multiple_choice — изчаква 600ms след последния клик
        if (answerDebounceRef.current) {
          clearTimeout(answerDebounceRef.current);
        }
        answerDebounceRef.current = setTimeout(async () => {
          setIsSavingAnswer(true);
          try {
            await submitAnswer(testData.test.id, {
              questionId,
              answerId: newAnswerValue,
            });
          } catch (err) {
            console.error('Error saving answer:', err);
          } finally {
            setIsSavingAnswer(false);
          }
        }, 600);
      } else {
        // Single choice / true_false — веднага
        setIsSavingAnswer(true);
        try {
          await submitAnswer(testData.test.id, {
            questionId,
            answerId: answerId,
          });
        } catch (err) {
          console.error('Error saving answer:', err);
        } finally {
          setIsSavingAnswer(false);
        }
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

      const resultData = response.result || response;

      // Calculate score if not provided
      const scorePercent = resultData.scorePercentage ?? resultData.score ??
        calculateScorePercentage(resultData.correctAnswers, resultData.totalQuestions || questions.length);

      const isPassed = resultData.passed ?? resultData.isPassed ??
        (scorePercent >= (testData.test?.passingScore || 70));

      setResults({
        scorePercentage: scorePercent,
        correctAnswers: resultData.correctAnswers ?? 0,
        wrongAnswers: resultData.wrongAnswers ?? 0,
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
      setError(err.message || 'Грешка при предаване на теста');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLesson = () => {
    if (isCourseTest) {
      navigate(`/academy/courses/${courseSlug}`);
    } else {
      navigate(`/academy/courses/${courseSlug}/lessons/${lessonSlug}`);
    }
  };

  const handleContinueCourse = () => {
    navigate(`/academy/courses/${courseSlug}`);
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
      const data = isCourseTest
        ? await startTestById(testStatus?.test?.id || testData?.test?.id)
        : await startTest(lesson.id);

      if (data) {
        setTestData(data);
        setQuestions(data.questions || []);

        if (data.test?.timeLimitMinutes) {
          setTimeRemaining(data.test.timeLimitMinutes * 60);
        }
      }
    } catch (err) {
      console.error('Error starting new attempt:', err);
      setError(err.message || 'Грешка при стартиране на нов опит');
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

  // =========================================================
  //                    HELPERS
  // =========================================================

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
  const attemptNumber = results?.attemptNumber || testData.attempt?.attemptNumber || 1;
  const maxAttempts = test.maxAttempts || 3;
  const canRetry = !results?.passed && remainingAttempts > 0 && canStartNewAttempt;

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

            {/* Earned Credits */}
            {isPassed && earnedCredits > 0 && (
              <div className="atp-results__credits">
                <span className="atp-results__credits-icon">🪙</span>
                <span>+{earnedCredits} {t('academyTestPlayer.results.creditsEarned', 'кредита спечелени!')}</span>
              </div>
            )}

            {/* Questions Review Toggle */}
            {questionsResult.length > 0 && test.showCorrectAnswers && (
              <div className="atp-results__review">
                <button
                  className="atp-results__review-toggle"
                  onClick={() => setShowQuestionsReview(!showQuestionsReview)}
                >
                  <span>📋 {t('academyTestPlayer.results.reviewAnswers', 'Преглед на отговорите')}</span>
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
                  <div className="atp-results__review-list">
                    {questionsResult.map((q, idx) => (
                      <div
                        key={q.questionId || idx}
                        className={`atp-results__review-item ${q.isCorrect ? 'atp-results__review-item--correct' : 'atp-results__review-item--wrong'}`}
                      >
                        <div className="atp-results__review-header">
                          <span className="atp-results__review-num">
                            {q.questionNumber || idx + 1}.
                          </span>
                          <span className={`atp-results__review-badge ${q.isCorrect ? 'atp-results__review-badge--correct' : 'atp-results__review-badge--wrong'}`}>
                            {q.isCorrect ? '✓ Вярно' : '✗ Грешно'}
                          </span>
                        </div>
                        <p className="atp-results__review-question">
                          {q.questionText}
                        </p>
                        <div className="atp-results__review-answer">
                          <span className="atp-results__review-label">Вашият отговор:</span>
                          <span className={`atp-results__review-value ${q.isCorrect ? '' : 'atp-results__review-value--wrong'}`}>
                            {q.yourAnswer || 'Без отговор'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Attempt Info */}
            <div className="atp-results__attempts">
              <span className="atp-results__attempts-icon">📊</span>
              {t('academyTestPlayer.results.attemptInfo', {
                current: attemptNumber,
                max: maxAttempts,
                defaultValue: `Опит ${attemptNumber} от ${maxAttempts}`
              })}
              {remainingAttempts > 0 && !isPassed && (
                <span className="atp-results__attempts-remaining">
                  {' '}• {t('academyTestPlayer.results.remainingAttempts', {
                    count: remainingAttempts,
                    defaultValue: `Оставащи: ${remainingAttempts}`
                  })}
                </span>
              )}
              {remainingAttempts === 0 && !isPassed && (
                <span className="atp-results__attempts-exhausted">
                  {' '}• {t('academyTestPlayer.results.noMoreAttempts', 'Няма повече опити')}
                </span>
              )}
            </div>

            {/* Previous Attempts History */}
            {previousAttempts.length > 0 && (
              <div className="atp-results__history">
                <button
                  className="atp-results__history-toggle"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <span>📜 {t('academyTestPlayer.results.attemptHistory', 'История на опитите')} ({previousAttempts.length})</span>
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
                  <div className="atp-results__history-list">
                    {previousAttempts.map((attempt, idx) => {
                      const attemptScore = attempt.score ?? calculateScorePercentage(attempt.correctAnswers, attempt.totalQuestions);
                      const attemptPassed = attemptScore >= (test.passingScore || 70);

                      return (
                        <div
                          key={attempt.id}
                          className={`atp-results__history-item ${attemptPassed ? 'atp-results__history-item--passed' : ''}`}
                        >
                          <span className="atp-results__history-num">#{attempt.attemptNumber || idx + 1}</span>
                          <span className="atp-results__history-date">{formatDate(attempt.completedAt || attempt.startedAt)}</span>
                          <span className="atp-results__history-details">
                            {attempt.correctAnswers}/{attempt.totalQuestions}
                          </span>
                          <span className={`atp-results__history-score ${attemptPassed ? 'atp-results__history-score--passed' : ''}`}>
                            {Math.round(attemptScore)}%
                          </span>
                          {attemptPassed && <span className="atp-results__history-badge">✅</span>}
                          {attempt.questionsResult && test.showCorrectAnswers && (
                            <button
                              className="atp-results__history-view"
                              onClick={() => handleViewAttemptQuestions(attempt)}
                              title="Преглед на отговорите"
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
              <div className="atp-results__best">
                <span className="atp-results__best-icon">🏆</span>
                <span className="atp-results__best-text">
                  {t('academyTestPlayer.results.bestAttempt', 'Най-добър резултат')}: {' '}
                  <strong>{Math.round(bestAttempt.score ?? calculateScorePercentage(bestAttempt.correctAnswers, bestAttempt.totalQuestions))}%</strong>
                  {' '}({t('academyTestPlayer.results.attempt', 'опит')} #{bestAttempt.attemptNumber})
                </span>
              </div>
            )}

            {/* Actions - НАЙ-ОТДОЛУ */}
            <div className="atp-results__actions">
              {isPassed ? (
                <>
                  <button onClick={handleBackToLesson} className="atp-results__btn atp-results__btn--secondary">
                    {t('academyTestPlayer.results.backToLesson', 'Към урока')}
                  </button>
                  <button onClick={handleContinueCourse} className="atp-results__btn atp-results__btn--primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    {t('academyTestPlayer.results.continueCourse', 'Продължи с курса')}
                  </button>
                </>
              ) : (
                <>
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
                  <button onClick={handleBackToLesson} className="atp-results__btn atp-results__btn--primary">
                    {t('academyTestPlayer.results.backToLesson', 'Към урока')}
                  </button>
                </>
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
                    {currentQuestion.questionType === 'single_choice' && t('academyTestPlayer.typeSingle', 'Един верен')}
                    {currentQuestion.questionType === 'multiple_choice' && t('academyTestPlayer.typeMultiple', 'Няколко верни')}
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
                    const isMultiple = currentQuestion.questionType === 'multiple_choice';
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
          {maxAttempts && (
            <>
              <span>•</span>
              <span>🔄 {t('academyTestPlayer.attempt', 'Опит')}: {attemptNumber}/{maxAttempts}</span>
            </>
          )}
        </div>
      </footer>
    </div>
  );
};

export default AcademyTestPlayer;