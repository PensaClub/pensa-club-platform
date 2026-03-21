import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../contexts/UserContext';
import { useAcademyCourses } from '../../contexts/AcademyCoursesProvider';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const SeminarCheckin = () => {
    const { t } = useTranslation('academy');
    const { seminarId } = useParams();
    const { isAuthentication } = useAuthContext();
    const { checkinSeminar } = useAcademyCourses();
    const navigate = useLocalizedNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, already, error, login
    const [credits, setCredits] = useState(0);

    useEffect(() => {
        if (!isAuthentication) {
            setStatus('login');
            return;
        }

        const doCheckin = async () => {
            try {
                const resp = await checkinSeminar(seminarId);
                if (resp?.alreadyAttended) {
                    setStatus('already');
                } else {
                    setCredits(resp?.earnedCredits || 0);
                    setStatus('success');
                }
            } catch (err) {
                console.error('Checkin error:', err);
                setStatus('error');
            }
        };
        doCheckin();
    }, [seminarId, isAuthentication]);

    const containerStyle = {
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', padding: '40px 20px', textAlign: 'center', gap: '16px'
    };

    if (status === 'loading') return (
        <div style={containerStyle}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#00d2ff' }} />
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Записване на присъствие...</p>
        </div>
    );

    if (status === 'login') return (
        <div style={containerStyle}>
            <AlertCircle size={40} style={{ color: '#f59e0b' }} />
            <h2 style={{ color: '#fff', margin: 0 }}>Влезте в профила си</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>За да запишете присъствие, трябва да сте логнати.</p>
            <button onClick={() => navigate(`/sign-up?view=login&redirect=/academy/seminars/${seminarId}/checkin`)}
                style={{ padding: '12px 32px', borderRadius: '10px', border: 'none', background: '#00d2ff', color: '#000', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
                Вход
            </button>
        </div>
    );

    if (status === 'success') return (
        <div style={containerStyle}>
            <CheckCircle size={48} style={{ color: '#10b981' }} />
            <h2 style={{ color: '#fff', margin: 0 }}>Присъствието е записано!</h2>
            {credits > 0 && <p style={{ color: '#fbbf24', fontSize: '1.1rem', fontWeight: 600 }}>+{credits}</p>}
            <button onClick={() => navigate('/academy/seminars')}
                style={{ padding: '10px 24px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '0.85rem' }}>
                Към семинарите
            </button>
        </div>
    );

    if (status === 'already') return (
        <div style={containerStyle}>
            <CheckCircle size={48} style={{ color: '#60a5fa' }} />
            <h2 style={{ color: '#fff', margin: 0 }}>Вече сте записани</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Присъствието ви вече е отбелязано за този семинар.</p>
        </div>
    );

    return (
        <div style={containerStyle}>
            <AlertCircle size={48} style={{ color: '#ef4444' }} />
            <h2 style={{ color: '#fff', margin: 0 }}>Грешка</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Неуспешно записване на присъствие.</p>
        </div>
    );
};

export default SeminarCheckin;
