// src/components/Home/NewsSubscribe/NewsSubscribe.jsx

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../contexts/UserContext';
import { useCommunityContext } from '../../contexts/CommunityContext';
import SubscribeForm from './SubscribeForm/SubscribeForm';
import PreferencesStep from './PreferencesStep/PreferencesStep';
import ShowcaseSlider from './ShowcaseSlider/ShowcaseSlider';
import './newsSubscribe.css';

const API_URL = import.meta.env.VITE_API_URL;

export const NewsSubscribe = () => {
    const { t } = useTranslation('home');
    const { username: lsUsername, userEmail: lsEmail } = useAuthContext();
    const { subscribeNewUser, updatePreferences } = useCommunityContext();

    const [step, setStep] = useState('form'); // form | preferences | already
    const [unsubscribeToken, setUnsubscribeToken] = useState(null);
    const [slides, setSlides] = useState([]);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    sectionRef.current?.classList.add('ns-visible');
                }
            },
            { threshold: 0.15 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const loadSlides = async () => {
            try {
                const res = await fetch(`${API_URL}/showcase/slides`);
                const data = await res.json();
                setSlides(data.slides || []);
            } catch {
                setSlides([]);
            }
        };
        loadSlides();
    }, []);

    const handleSubscribe = async (name, email) => {
        const response = await subscribeNewUser(name, email, 'homepage');
        if (response?.alreadySubscribed) {
            setStep('already');
        } else if (response?.message === 'Subscriber added successfully.') {
            setUnsubscribeToken(response.unsubscribeToken);
            setStep('preferences');
        }
    };

    const handleSavePreferences = async (preferences) => {
        if (unsubscribeToken) {
            await updatePreferences(unsubscribeToken, preferences);
        }
    };

    return (
        <section className="ns-section" ref={sectionRef}>
            <div className="ns-bg">
                <div className="ns-bg-gradient" />
            </div>

            <div className="ns-container">
                {slides.length > 0 && (
                    <div className="ns-slider-area">
                        <ShowcaseSlider slides={slides} />
                    </div>
                )}

                <div className={`ns-subscribe-row ${slides.length === 0 ? 'ns-subscribe-row-full' : ''}`}>
                    <div className="ns-content">
                        <h2 className="ns-title">
                            {t('news-subscribe.title')}{' '}
                            <span className="ns-highlight">Pensa Club</span>
                        </h2>
                        <p className="ns-desc">{t('news-subscribe.desc')}</p>
                    </div>

                    <div className="ns-form-area">
                        {step === 'form' && (
                            <SubscribeForm onSuccess={handleSubscribe} />
                        )}
                        {step === 'preferences' && (
                            <PreferencesStep onSave={handleSavePreferences} />
                        )}
                        {step === 'already' && (
                            <div className="ns-already">
                                <p className="ns-already-text">
                                    {t('news-subscribe.already-subscribed', 'Вече сте абониран/а с този имейл. Благодарим!')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
