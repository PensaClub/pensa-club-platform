import { useTranslation } from 'react-i18next';
import './reActionLandingAbout.css';

const ReActionLandingAbout = () => {
    const { t } = useTranslation('reaction');

    return (
        <section className="rala">
            <div className="rala-container">
                <div className="rala-text">
                    <h2 className="rala-title">{t('hub.about.title', 'За програмата')}</h2>
                    <p className="rala-description">
                        {t(
                            'hub.about.text',
                            'Програма ReАкция е инициатива на Български фонд за жените и Фондация ПЕНСА. Обучени ментори посещават пенсионерски клубове, за да разговарят за разпознаване на невярна информация, изборни права и дигитална грамотност.'
                        )}
                    </p>
                </div>

                <a
                    href="https://pensa.club/projects/programa-reaktsia-2026"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rala-image-link"
                >
                    <div className="rala-image-frame">
                        <img
                            src="/images/reaction/reaction.jpg"
                            alt={t('hub.about.linkText', 'Виж проекта')}
                            className="rala-image"
                        />
                        <div className="rala-image-tape rala-image-tape--top" />
                        <div className="rala-image-tape rala-image-tape--bottom" />
                    </div>
                    <span className="rala-image-caption">
                        {t('hub.about.linkText', 'Виж проекта →')}
                    </span>
                </a>
            </div>
        </section>
    );
};

export default ReActionLandingAbout;
