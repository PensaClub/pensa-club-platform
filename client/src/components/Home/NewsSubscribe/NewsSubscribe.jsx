
import { useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import './newsSubscribe.css'

export const NewsSubscribe = () => {
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");

    const form = useRef()
    const sendEmail = (e) => {
        e.preventDefault()
        if (!userName || !userEmail) {
            alert("Please fill in all required fields");
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
                            <input type="text" name="user_name" className="form-control" id="name" placeholder="Име*" value={userName} onChange={(e) => setUserName(e.target.value)} />
                            <input type="email" className="form-control" name="user_email" id="email" placeholder="Имейл адрес*" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                        </div>
                    </div>
                    <div className="news-btn">
                        <button type="submit" className="btn btn-light">Абонирай се </button>
                    </div>
                </form>
            </section>
        </>
    )

}