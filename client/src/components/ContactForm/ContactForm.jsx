/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslation } from "react-i18next";
import "./contactForm.css";
import { notify } from "../../utils/notify";
import { requestFactory } from "../Services/requester";
import { useAuthContext } from "../contexts/UserContext";

export const ContactForm = () => {
    const { t } = useTranslation();
    const { userEmail, token, sendContactForm } = useAuthContext();
    const [formData, setFormData] = useState({
        name: "",
        email: userEmail || "",
        subject: "",
        message: "",
    });
    const [errors, setErrors] = useState({});
    const [formFocus, setFormFocus] = useState({
        name: false,
        email: false,
        subject: false,
        message: false,
    });
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const [showRecaptcha, setShowRecaptcha] = useState(false);
    const [recaptchaSize, setRecaptchaSize] = useState("normal");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const sectionRef = useRef(null);
    
    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [])

    useEffect(() => {
        const token = localStorage.getItem("contactRecaptchaToken");
        const count = parseInt(localStorage.getItem("contactSubmissionCount") || "0");

        if (token && count < 3) {
            setRecaptchaToken(token);
        } else {
            localStorage.removeItem("contactRecaptchaToken");
        }
      
        const updateRecaptchaSize = () => {
            if (window.innerWidth <= 450) {
                setRecaptchaSize("compact");
            } else {
                setRecaptchaSize("normal");
            }
        };

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    sectionRef.current.classList.add("visible");
                }
            },
            { threshold: 0.2 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        updateRecaptchaSize(); 
        window.addEventListener("resize", updateRecaptchaSize);
       
        return () => {
            window.removeEventListener("resize", updateRecaptchaSize);
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    const validateEmail = (email) => {
        const ve = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return ve.test(email);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (value) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const handleFocus = (field) => {
        setFormFocus({ ...formFocus, [field]: true });
    };

    const handleBlur = (field) => {
        setFormFocus({ ...formFocus, [field]: false });
    };

    const onRecaptchaChange = (token) => {
        setRecaptchaToken(token);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name) {
            newErrors.name = t("contact.errors.required-field");
        }

        if (!formData.email) {
            newErrors.email = t("contact.errors.required-field");
        } else if (!validateEmail(formData.email)) {
            newErrors.email = t("contact.errors.invalid-email");
        }

        if (!formData.subject) {
            newErrors.subject = t("contact.errors.required-field");
        }

        if (!formData.message) {
            newErrors.message = t("contact.errors.required-field");
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    //тъпият брояч за recaptcha който забравих
    const incrementSubmissionCount = () => {
        const count = parseInt(localStorage.getItem("contactSubmissionCount") || "0");
        if (count >= 3) { // След 3 изпращания
          localStorage.removeItem("contactRecaptchaToken"); 
          localStorage.setItem("contactSubmissionCount", "0"); 
        } else {
          localStorage.setItem("contactSubmissionCount", String(count + 1));
        }
      };
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!recaptchaToken) {
            setShowRecaptcha(true);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await sendContactForm({
                name: formData.name,
                email: formData.email,
                subject: formData.subject,
                message: formData.message,
                recaptchaToken
            });

            if (response) {
                setSubmitSuccess(true);
                setFormData({ name: "", email: userEmail || "", subject: "", message: "" });
                localStorage.setItem("contactRecaptchaToken", recaptchaToken);
                setShowRecaptcha(false);
                setRecaptchaToken(null);
                incrementSubmissionCount();
              
                setTimeout(() => {
                    setSubmitSuccess(false);
                }, 5000);
            } else {
                setShowRecaptcha(true);
                throw new Error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setErrors({ submit: t("contact.errors.submit-error") });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="contact-section" ref={sectionRef}>
            <div className="contact-background">
                <div className="bg-wave"></div>
                <div className="bg-shape shape1"></div>
                <div className="bg-shape shape2"></div>
                <div className="contact-pattern"></div>
            </div>

            <div className="contact-container">
                <div className="contact-header">
                    <h2 className="contact-title">
                        {t("contact.title")}
                        <span className="highlight">Pensa club</span>
                    </h2>
                    <p className="contact-description">{t("contact.description")}</p>
                </div>

                <div className="contact-content">
                    <div className="contact-info">
                        <div className="contact-card">
                            <div className="card-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="none" stroke="currentColor" strokeWidth="2"
                                        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                            </div>
                            <div className="card-content">
                                <h3>{t("contact.location.title")}</h3>
                                <p>{t("contact.location.address")}</p>
                            </div>
                        </div>

                        <div className="contact-card">
                            <div className="card-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="none" stroke="currentColor" strokeWidth="2"
                                        d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6M22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6M22 6L12 13L2 6" />
                                </svg>
                            </div>
                            <div className="card-content">
                                <h3>{t("contact.email.title")}</h3>
                                <p>help@pensa.club</p>
                            </div>
                        </div>

                        <div className="contact-card">
                            <div className="card-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="none" stroke="currentColor" strokeWidth="2"
                                        d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H4c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h16c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1z" />
                                </svg>
                            </div>
                            <div className="card-content">
                                <h3>{t("contact.social.title")}</h3>
                                <div className="social-links">
                                    <a href="https://facebook.com/pensaclub" target="_blank" rel="noopener noreferrer">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                                            <path fill="currentColor" d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C15.9 21.59 18.03 20.37 19.58 18.54C21.13 16.7 21.98 14.35 22 11.91C22 6.48 17.5 2.04 12 2.04Z" />
                                        </svg>
                                    </a>
                                    <a href="https://twitter.com/pensaclub" target="_blank" rel="noopener noreferrer">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                                            <path fill="currentColor" d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                                        </svg>
                                    </a>
                                    <a href="https://instagram.com/pensaclub" target="_blank" rel="noopener noreferrer">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                                            <path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="map-container">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d93836.9586578648!2d23.26855800441234!3d42.69814863188764!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40aa8682cb317bf5%3A0x400a01269bf5e60!2z0KHQvtGE0LjRjywg0JHRitC70LPQsNGA0LjRjw!5e0!3m2!1sbg!2sbg!4v1714664918592!5m2!1sbg!2sbg"
                                width="100%"
                                height="250"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Pensa Club Map"
                            ></iframe>
                        </div>
                    </div>

                    <div className="contact-form-container">
                     
                        {submitSuccess && (
                            <div className="success-message">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="currentColor" d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-2.3-8.7l1.3 1.29 3.3-3.3a1 1 0 0 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-2-2a1 1 0 0 1 1.4-1.42z" />
                                </svg>
                                <p>{t("contact.success")}</p>
                                <p className="success-details">{t("contact.confirmation_email")}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="form-group">
                                <div className={`input-wrapper ${formFocus.name ? 'focused' : ''} ${errors.name ? 'error' : ''}`}>
                                    <div className="input-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                            <path fill="none" stroke="currentColor" strokeWidth="2"
                                                d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11ZM16 15H8C5.79086 15 4 16.7909 4 19V21H20V19C20 16.7909 18.2091 15 16 15Z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        placeholder={t("contact.form.name")}
                                        value={formData.name}
                                        onChange={handleChange}
                                        onFocus={() => handleFocus('name')}
                                        onBlur={() => handleBlur('name')}
                                    />
                                </div>
                                {errors.name && <div className="error-message-contact">{errors.name}</div>}
                            </div>

                            <div className="form-group">
                                <div className={`input-wrapper ${formFocus.email ? 'focused' : ''} ${errors.email ? 'error' : ''}`}>
                                    <div className="input-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                            <path fill="none" stroke="currentColor" strokeWidth="2" d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6M22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6M22 6L12 13L2 6" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        placeholder={t("contact.form.email")}
                                        value={formData.email}
                                        onChange={handleChange}
                                        onFocus={() => handleFocus('email')}
                                        onBlur={() => handleBlur('email')}
                                    />
                                </div>
                                {errors.email && <div className="error-message-contact">{errors.email}</div>}
                            </div>

                            <div className="form-group">
                                <div className={`input-wrapper ${formFocus.subject ? 'focused' : ''} ${errors.subject ? 'error' : ''}`}>
                                    <div className="input-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                            <path fill="none" stroke="currentColor" strokeWidth="2"
                                                d="M3.5 3.5h17v17h-17z M7 9h10 M7 13h10 M7 17h5" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        name="subject"
                                        id="subject"
                                        placeholder={t("contact.form.subject")}
                                        value={formData.subject}
                                        onChange={handleChange}
                                        onFocus={() => handleFocus('subject')}
                                        onBlur={() => handleBlur('subject')}
                                    />
                                </div>
                                {errors.subject && <div className="error-message-contact">{errors.subject}</div>}
                            </div>

                            <div className="form-group">
                                <div className={`input-wrapper textarea ${formFocus.message ? 'focused' : ''} ${errors.message ? 'error' : ''}`}>
                                    <div className="input-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                            <path fill="none" stroke="currentColor" strokeWidth="2"
                                                d="M3 20.4V3.6a.6.6 0 01.6-.6h16.8a.6.6 0 01.6.6v16.8a.6.6 0 01-.6.6H3.6a.6.6 0 01-.6-.6z M16 8H8 M16 12H8 M16 16H8" />
                                        </svg>
                                    </div>
                                    <textarea
                                        name="message"
                                        id="message"
                                        placeholder={t("contact.form.message")}
                                        value={formData.message}
                                        onChange={handleChange}
                                        onFocus={() => handleFocus('message')}
                                        onBlur={() => handleBlur('message')}
                                        rows="5"
                                    ></textarea>
                                </div>
                                {errors.message && <div className="error-message-contact">{errors.message}</div>}
                            </div>

                            {errors.submit && <div className="error-message-contact submit-error">{errors.submit}</div>}

                            <button type="submit" className="contact-button" disabled={isSubmitting}>
                                <span>{isSubmitting ? t("contact.form.sending") : t("contact.form.send")}</span>
                                {!isSubmitting && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                        <path fill="none" stroke="currentColor" strokeWidth="2"
                                            d="M2 12l5.5 5.5m-5.5-5.5l5.5-5.5M2 12h18.5" />
                                    </svg>
                                )}
                                {isSubmitting && (
                                    <svg className="loading-spinner" viewBox="0 0 50 50">
                                        <circle className="spinner-path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                                    </svg>
                                )}
                            </button>
                        </form>
                        {showRecaptcha && (
                            <div className="recaptcha-wrapper">
                                <ReCAPTCHA
                                    sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                                    onChange={onRecaptchaChange}
                                    size={recaptchaSize}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactForm;