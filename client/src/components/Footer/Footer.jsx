
import './footer.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebook, faLinkedin, faYoutube } from "@fortawesome/free-brands-svg-icons";

export const Footer = () => {

    return (
        <footer>
            <section className="footer">
                <img src="/images/homePage/logo.png" alt="logo" />
                <div className="footer-links">
                    <h3>Карта на сайта </h3>
                    <p>Communities</p>
                    <p>Map</p>
                    <p>Craiglist</p>

                </div>
                <div className="footer-links">
                    <h3>Партньори</h3>
                    <p>СофтУни БУДИТЕЛ</p>
                </div>
                <div className="footer-info">
                    <div className="second-info">
                        <img src="/images/homePage/logo.png" alt="logo" />
                        <h3>Pensa club &copy;</h3>
                    </div>
                    <p>България, София</p>
                    <p>бул. Скобелев, 13А</p>
                    <p>Тел.: (359) 2 881 95 53</p>
                    <p>Факс: (359) 2 881 95 55</p>
                    <div className="footer-social">
                        <FontAwesomeIcon icon={faFacebook} />
                        <FontAwesomeIcon icon={faLinkedin} />
                        <FontAwesomeIcon icon={faYoutube} />
                    </div>
                </div>
            </section>
            <section className='footer-privacy'>
                <p>Privacy</p>
                <p>&copy; 2024 Pensa club. All rights reserved</p>
            </section>



        </footer>

    );

}