import './profile.css'
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export const ProfileImage =() => {
    const { t } = useTranslation();

    return ( 
        <>
      <section className="profile-data">
                        <div className="avatar">
                            <img src="/images/sign-up/avatar.jpg" alt="User avatar" />
                        </div>
                        <div className="user-data">
                            <Link to="#"><h3>{t('profile.change_photo')}</h3></Link>
                            
                        </div>
                    </section>
        </>
    )
}