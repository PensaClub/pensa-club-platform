import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/UserContext';
import './forgetPassword.css'

export const ReSendEmail = () => {
    const location = useLocation();
    const { email } = location.state || {};
    const { onForgetPasswordSubmit } = useAuthContext();

    const handleResendEmail = async () => {
        if (email) {
            await onForgetPasswordSubmit({ email });

        }
    }


    return (
        <>
            <section className="forget-pass">
                <div className="forget-pass-container">
                    <h2>Проверете електронната си поща</h2>
                    <p>Ще получите връзка в предоставения от Вас имейл, която ще ви позволи да нулирате паролата на акаунта си.</p>
                    {email && <p><span>{`Имейл: ${email}`}</span></p>}
                    <p>Ако не виждате имейла в пощенската си кутия, моля проверете и в папките за нежелана поща, спам, социални мрежи или други папки, където може да е попаднал.
                    </p>
                    <button className='forget-resend-btn' type="submit" onClick={handleResendEmail}>Повторно изпращане</button>
                    <Link to="/sign-up"> Обратно към Вход</Link>
                </div>
                <div className="logo-forget-pass">
                    <Link to="/">
                        <img src="/images/homePage/logo.png" alt="logo" className='logo-reset-pass' />Penca Club
                    </Link>
                </div>
            </section>
        </>
    )
}