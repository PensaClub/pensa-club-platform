
import { useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import './newsSubscribe.css'

export const NewsSubscribe = () => {
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [errors, setErrors] = useState({ userEmail: '', userName: '' })

    const validateEmail = (email) => {
        const ve = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return ve.test(email);
    }

    const handleNameChange = (e) => {
        setUserName(e.target.value)
        if (e.target.value) {
            setErrors(prev => ({ ...prev, userName: "" }))
        }
    }
    const handleEmailChange = (e) => {
        setUserEmail(e.target.value)
        if (validateEmail(e.target.value)) {
            setErrors(prev => ({ ...prev, userEmail: "" }))
        }
    }
    const form = useRef()
    const sendEmail = (e) => {
        e.preventDefault()
        let hasError = false;
        let newErrors = { userName: "", userEmail: "" }
        if (!userName) {
            newErrors.userName = "Моля, въведете име";
            hasError = true;
        }


        if (!userEmail) {
            newErrors.userEmail = "Моля, въведете имейл адрес.";
            hasError = true;
        } else if (!validateEmail(userEmail)) {
            newErrors.userEmail = "Моля, въведете валиден имейл адрес.";
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            return;
        }


        emailjs
            .sendForm(
                "service_zxhuqbx",
                "template_7tkpsx5",
                form.current,
                "iRYFR4BuAXZEBF1ld",
            )
            .then(result => {

            }).then(
                (result) => {
                    console.log("Email sent successfully:", result);
                    setUserName("");
                    setUserEmail("");
                    setErrors({ userName: '', userEmail: '' });
                },

                (err) => {
                    throw new Error(err)
                }
            )
        console.log(form.current)

    }
    return (
        <>

            <section className="subscribe-news">
                <div className="single-subscribe-info">
                    <h3>Бъдете в течение с <span>Pensa club</span></h3>
                    <p>Регистрирайте се за последните новини, актуализации и съвети.</p>
                </div>
                <form ref={form} onSubmit={sendEmail} className="news-form mb-lg-0">
                    <div className="form-row">
                        <div className="col-subscribe form-group">
                            <div className="error-username">
                                <input type="text" name="user_name" className="input" id="name" placeholder="Име*" value={userName} onChange={handleNameChange} />
                                {errors.userName && <div className="error-message">{errors.userName}</div>}
                            </div>
                            <div className="error-email">
                                <input type="email" className="input" name="user_email" id="email" placeholder="Имейл адрес*" value={userEmail} onChange={handleEmailChange} />
                                {errors.userEmail && <div className="error-message">{errors.userEmail}</div>}
                            </div>
                        </div>
                    </div>
                    <div className="news-btn">
                        <button type="submit" className="btn-general btn-green" id="btn-subscribe">Абонирай се </button>
                    </div>
                </form>

            </section>
            <div className="after-news"></div>

        </>
    )

}