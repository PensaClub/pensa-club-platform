import './hero.css';

import Testimonials from './Testimonials/Testimonials';
import { Fade, Slide, } from "react-awesome-reveal";

import './hero.css';

import {Link} from 'react-router-dom'
import { useTranslation, Trans } from "react-i18next";



export const Hero = () => {
    const {t} = useTranslation();
    return (
        <>
            <section className="hero-section">
                <div className="parent-hero">
                    <Slide direction='left' duration="2000" triggerOnce='true'>
                        <div className="left-side">
                            <h1>{t("hero.title")}</h1>
                            <p><Trans i18nKey="hero.desc" components={{ span: <strong />}} /></p>
                        </div>
                    </Slide>
                    {/* <Fade direction='right' duration="2000" triggerOnce='true'>

                        <Testimonials />
                    </Fade> */}

                </div>
            </section>

        </>
    )
}