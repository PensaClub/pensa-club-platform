import "./hero.css";

import { Fade, Slide } from "react-awesome-reveal";

import "./hero.css";

import { useTranslation, Trans } from "react-i18next";
import { Link } from "react-router-dom";

export const Hero = () => {
  const { t } = useTranslation();
  return (
    <>
      <section className="hero-section">
        <div className="information-slide">
          <marquee>{t("hero.slide-info")}</marquee>
        </div>
        <div className="parent-hero">
          <Slide direction="left" duration="2000" triggerOnce="true">
            <div className="left-side">
              <p>{t("hero.short-desc")}</p>
              <h1>{t("hero.title")}</h1>
              <p>
                <Trans i18nKey="hero.desc" components={{ span: <strong /> }} />
              </p>
              <Link
                to="/profile"
                className="btn-general btn-orange"
                id="btn-join"
              >
                {t("motto.about-btn")}
              </Link>
            </div>
            {/* <div className="right-side">
              <div className="frame-container">
              <iframe
            className="responsive-iframe"
                src="https://www.youtube.com/embed/BqSxjmvXzzY?autoplay=1&mute=1&loop=1&playlist=BqSxjmvXzzY&showinfo=0&modestbranding=1"
                title="57 Years Apart - A Boy And a Man Talk About Life"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
              ></iframe>
              </div>
            </div> */}
          </Slide>
        </div>
      </section>
    </>
  );
};
