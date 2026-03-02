
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
    Activity, 
    BookOpen, 
    Video, 
    Users, 
    CheckCircle, 
    PlayCircle, 
    Award,
    FileText,
    ArrowRight 
} from 'lucide-react';
import './studentRecentActivity.css';

const StudentRecentActivity = ({ activities = [] }) => {
    const { t } = useTranslation('student-dashboard');

    const getActivityIcon = (type) => {
        switch (type) {
            case 'lesson_completed':
                return <CheckCircle className="sdra-activity-icon sdra-icon-success" />;
            case 'lesson_started':
                return <PlayCircle className="sdra-activity-icon sdra-icon-primary" />;
            case 'course_enrolled':
                return <BookOpen className="sdra-activity-icon sdra-icon-info" />;
            case 'course_completed':
                return <Award className="sdra-activity-icon sdra-icon-gold" />;
            case 'lecture_attended':
                return <Video className="sdra-activity-icon sdra-icon-purple" />;
            case 'seminar_attended':
                return <Users className="sdra-activity-icon sdra-icon-green" />;
            case 'test_passed':
                return <CheckCircle className="sdra-activity-icon sdra-icon-success" />;
            case 'test_failed':
                return <FileText className="sdra-activity-icon sdra-icon-warning" />;
            case 'certificate_earned':
                return <Award className="sdra-activity-icon sdra-icon-gold" />;
            default:
                return <Activity className="sdra-activity-icon sdra-icon-default" />;
        }
    };

    const getActivityLabel = (type) => {
        return t(`studentRecentActivity.types.${type}`, type);
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return t('studentRecentActivity.time.justNow');
        if (diffMins < 60) return t('studentRecentActivity.time.minutesAgo', { minutes: diffMins });
        if (diffHours < 24) return t('studentRecentActivity.time.hoursAgo', { hours: diffHours });
        if (diffDays === 1) return t('studentRecentActivity.time.yesterday');
        if (diffDays < 7) return t('studentRecentActivity.time.daysAgo', { days: diffDays });
        
        return date.toLocaleDateString('bg-BG', {
            day: '2-digit',
            month: '2-digit'
        });
    };

    const getActivityLink = (activity) => {
        switch (activity.type) {
            case 'lesson_completed':
            case 'lesson_started':
                return `/academy/courses/${activity.courseSlug}/lessons/${activity.lessonSlug}`;
            case 'course_enrolled':
            case 'course_completed':
                return `/academy/courses/${activity.courseSlug || activity.slug}`;
            case 'lecture_attended':
                return `/academy/lectures/${activity.lectureSlug || activity.slug}`;
            case 'seminar_attended':
                return `/academy/seminars/${activity.seminarSlug || activity.slug}`;
            case 'test_passed':
            case 'test_failed':
                return `/academy/courses/${activity.courseSlug}/lessons/${activity.lessonSlug}`;
            default:
                return null;
        }
    };

    if (!activities || activities.length === 0) {
        return (
            <div className="sdra-container">
                <div className="sdra-header">
                    <h3 className="sdra-title">
                        <Activity className="sdra-title-icon" />
                        {t('studentRecentActivity.title')}
                    </h3>
                </div>
                <div className="sdra-empty">
                    <Activity className="sdra-empty-icon" />
                    <p className="sdra-empty-text">{t('studentRecentActivity.noActivity')}</p>
                    <Link to="/academy/courses" className="sdra-empty-link">
                        {t('studentRecentActivity.startLearning')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="sdra-container">
            <div className="sdra-header">
                <h3 className="sdra-title">
                    <Activity className="sdra-title-icon" />
                    {t('studentRecentActivity.title')}
                </h3>
                <Link to="/academy/my/activity" className="sdra-view-all">
                    {t('studentRecentActivity.viewAll')}
                    <ArrowRight className="sdra-view-all-icon" />
                </Link>
            </div>

            <div className="sdra-list">
                {activities.slice(0, 8).map((activity, index) => {
                    const link = getActivityLink(activity);
                    const content = (
                        <>
                            <div className="sdra-activity-icon-wrapper">
                                {getActivityIcon(activity.type)}
                            </div>
                            <div className="sdra-activity-content">
                                <p className="sdra-activity-text">
                                    <span className="sdra-activity-type">{getActivityLabel(activity.type)}</span>
                                    {activity.title && (
                                        <span className="sdra-activity-title">{activity.title}</span>
                                    )}
                                </p>
                                {activity.credits > 0 && (
                                    <span className="sdra-activity-credits">+{activity.credits} {t('studentRecentActivity.credits')}</span>
                                )}
                            </div>
                            <span className="sdra-activity-time">{formatTimeAgo(activity.createdAt || activity.date)}</span>
                        </>
                    );

                    return link ? (
                        <Link key={activity.id || index} to={link} className="sdra-activity-item sdra-activity-link">
                            {content}
                        </Link>
                    ) : (
                        <div key={activity.id || index} className="sdra-activity-item">
                            {content}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StudentRecentActivity;