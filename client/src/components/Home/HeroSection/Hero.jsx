import './hero.css';

import Testimonials from './Testimonials/Testimonials';
import { Fade, Slide, } from "react-awesome-reveal";
import {Link} from 'react-router-dom'
import { useTranslation } from "react-i18next";


export const Hero = () => {
    const {t} = useTranslation();
    return (
        <>
            <section className="hero-section">
                <div className="parent-hero">
                    <Slide direction='left' duration="2000" triggerOnce='true'>
                        <div className="left-side">
                            <h1>ДОСТОЕН ЖИВОТ ЗА ХОРАТА  ОТ ТРЕТАТА ВЪЗРАСТ</h1>
                            <p>	България е държавата в Европейския съюз (ЕС), в която <span> възрастните хора </span> са най-заплашени от бедност, социално изключване и материални затруднения, показват данни на европейската статистическа служба Евростат. <span>Българските пенсионери</span> са и най-изолираните от интернет в ЕС. Едва един от всеки десет души ползва мрежата, а от тези, които имат интернет, половината пишат имейли, четат новини и търсят информация за стоки. <span>Само 2 на сто </span>от тях пазаруват онлайн, а всеки трети влиза в социалните мрежи. </p>
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