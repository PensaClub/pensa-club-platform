import React, { useState, useEffect, useRef } from 'react';
import './testimonials.css'
const Testimonials = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const totalSlides = 5; 
    const transitioning = useRef(false); 

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

        const interval = setInterval(() => {
            let nextIndex = (currentIndex + 1) % totalSlides;
            transitioning.current = true; 
            setCurrentIndex(nextIndex);
        }, 7000);

        updateSlide(true);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearInterval(interval);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentIndex]);

    useEffect(() => {
        if (transitioning.current) {
            if (currentIndex === 0) { 
                updateSlide(false); 
                setTimeout(() => updateSlide(true), 20); 
            } else {
                updateSlide(true);
            }
            transitioning.current = false; 
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentIndex]);


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
        <main>

            <div className="slider">
                <div className="slide-row" id="slide-row">
                    {testimonials.map((testimonial, index) => (
                        <div className="slide-col" key={index}>
                            <div className="content">
                                <h2>{testimonial.title}</h2>
                                <p>{testimonial.description}</p>
                            </div>
                            <div className="hero">
                                <img src={testimonial.imageUrl} alt={testimonial.name} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="indicator">
                {testimonials.map((_, index) => (
                    <span
                        key={index}
                        className={`btn ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(index)}
                    ></span>
                ))}
            </div>
        </main>
    );
};

export default Testimonials;
