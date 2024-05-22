import React, { useState, useEffect, useRef } from 'react';
import './testimonials.css'
const Testimonials = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const totalSlides = 5;
    const transitioning = useRef(false);
    const intervalRef = useRef(null);

    const updateSlide = (shouldAnimate = true) => {
        const main = document.querySelector('main');
        const slideRow = document.getElementById('slide-row');
        const mainWidth = main.offsetWidth;
        const translateValue = currentIndex * -mainWidth;

        slideRow.style.transition = shouldAnimate ? 'transform 0.5s ease' : 'none';
        slideRow.style.transform = `translateX(${translateValue}px)`;

        const btns = document.querySelectorAll('.btn');
        btns.forEach((btn, index) => {
            btn.classList.toggle('active', index === currentIndex);
        });
    };

    useEffect(() => {
        const handleResize = () => updateSlide(true);
        window.addEventListener('resize', handleResize);

        if (!isPaused) {
            startAutoSlide();
        }

        updateSlide(true);

        return () => {
            window.removeEventListener('resize', handleResize);
            stopAutoSlide();
        };
    }, [isPaused]);

    useEffect(() => {
        if (transitioning.current) {
            updateSlide(false);
            setTimeout(() => {
                updateSlide(true);
                transitioning.current = false;
            }, 10);
        } else {
            updateSlide(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentIndex]);

    const startAutoSlide = () => {
        stopAutoSlide();
        intervalRef.current = setInterval(() => {
            if (!isPaused) {
                setCurrentIndex((prevIndex) => {
                    if (prevIndex + 1 === totalSlides) {
                        transitioning.current = true;
                        return 0;
                    } else {
                        return prevIndex + 1;
                    }
                });
            }
        }, 5000);
    };

    const stopAutoSlide = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };


    const testimonials = [
        {

            title: 'Първа индустриална революция ',
            description: 'Отличава се с въвеждането на парната машина, което доведе до механизацията на производството и развитието на железопътния транспорт.',
            imageUrl: '/images/homePage/FIR.webp'
        },
        {

            title: 'Втора индустриална революция',
            description: 'Характеризира се с масовото разпространение на електрическата енергия и поточните линии, което увеличи производствената ефективност и стимулира индустриалния растеж.',
            imageUrl: '/images/homePage/SIR.webp'
        },
        {

            title: 'Трета индустриална революция',
            description: 'Наречена още Цифрова революция, тази ера е обозначена с въвеждането на компютрите, интернета и автоматизацията, което радикално промени начина, по който се управляват и контролират производствените процеси.',
            imageUrl: '/images/homePage/TIR.png'
        },
        {

            title: 'Индустрия 4.0',
            description: 'Съсредоточена върху интелигентните фабрики, които използват интернет на нещата (IoT), автоматизирано вземане на решения и машинно обучение за по-нататъшно повишаване на производствената ефективност.',
            imageUrl: '/images/homePage/FourthIR.webp'
        },
        {

            title: 'Индустрия 5.0',
            description: 'Това е последният етап в развитието, който включва използването на изкуствен интелект не само за автоматизация, но и за интегриране на човешкия творчески и аналитичен потенциал ',
            imageUrl: '/images/homePage/ai2.png'
        }
    ];

    return (
        <main
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="slider">
                <div className="slide-row" id="slide-row">
                    {testimonials.map((testimonial, index) => (
                        <div className="slide-col" key={index}>
                            <div className="content">
                                <h2>{testimonial.title}</h2>
                                <p>{testimonial.description}</p>
                            </div>
                            <div className="hero">
                                <img src={testimonial.imageUrl} alt={testimonial.title} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="indicator">
                {testimonials.map((_, index) => (
                    <span
                        key={index}
                        className={`btn-news ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(index)}
                    ></span>
                ))}
            </div>
        </main>
    );
};

export default Testimonials;
