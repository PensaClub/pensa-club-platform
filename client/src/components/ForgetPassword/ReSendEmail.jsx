import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/UserContext';
import { useState, useEffect } from 'react';
import './forgetPassword.css';

export const ReSendEmail = () => {
    const location = useLocation();
    const { email } = location.state || {};
    const { onForgetPasswordSubmit } = useAuthContext();
    const [attempts, setAttempts] = useState(() => Number(localStorage.getItem('attempts')) || 0);
    const [timer, setTimer] = useState(() => Number(localStorage.getItem('timer')) || 0);
    const [isLocked, setIsLocked] = useState(() => {
        const savedAttempts = Number(localStorage.getItem('attempts')) || 0;
        return savedAttempts > 0;
    });

    useEffect(() => {
        let interval;
        if (isLocked) {
            interval = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer > 0) {
                        localStorage.setItem('timer', prevTimer - 1);
                        return prevTimer - 1;
                    } else {
                        setIsLocked(false);
                        localStorage.removeItem('timer');
                        localStorage.removeItem('attempts');
                        clearInterval(interval);
                        return 0;
                    }
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isLocked]);

    useEffect(() => {
        if (attempts > 0 && attempts < 3) {
            setIsLocked(true);
            setTimer(60);
            localStorage.setItem('timer', 60);
        } else if (attempts >= 3) {
            setIsLocked(true);
            setTimer(15 * 60); // 15 минути след трети опит
            localStorage.setItem('timer', 15 * 60);
        }
        localStorage.setItem('attempts', attempts);
    }, [attempts]);

    const handleResendEmail = async () => {
        if (!isLocked && email) {
            await onForgetPasswordSubmit({ email });
            setAttempts((prevAttempts) => prevAttempts + 1);
        }
    };

    return (
        <>
            <section className="forget-pass">
                <div className="forget-pass-container">
                    <h2>Проверете електронната си поща</h2>
                    <p>Ще получите връзка в предоставения от Вас имейл, която ще ви позволи да нулирате паролата на акаунта си.</p>
                    {email && <p><span>{`Имейл: ${email}`}</span></p>}
                    <p>Ако не виждате имейла в пощенската си кутия, моля проверете и в папките за нежелана поща, спам, социални мрежи или други папки, където може да е попаднал.</p>
                    <button className='forget-resend-btn' type="submit" onClick={handleResendEmail} disabled={isLocked}>
                        Повторно изпращане {isLocked && `(изчакайте ${Math.floor(timer / 60)}:${timer % 60 < 10 ? '0' : ''}${timer % 60} мин)`}
                    </button>
                    {isLocked && attempts >= 3 && <p>Превишихте броя на опитите. Моля, опитайте отново след {Math.floor(timer / 60)} минути и {timer % 60} секунди.</p>}
                    <Link to="/sign-up">Обратно към Вход</Link>
                </div>
                <div className="logo-forget-pass">
                    <Link to="/">
                        <img src="/images/homePage/logo.png" alt="logo" className='logo-reset-pass' />Penca Club
                    </Link>
                </div>
            </section>
        </>
    );
}
