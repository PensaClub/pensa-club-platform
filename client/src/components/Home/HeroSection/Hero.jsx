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
        <div className="parent-hero">
          <Slide direction="left" duration="2000" triggerOnce="true">
            <div className="left-side">
              <h1>{t("hero.title")}</h1>
              <p>
                <Trans i18nKey="hero.desc" components={{ span: <strong /> }} />
              </p>
            </div>
          </Slide>
        </div>
        <img src="/images/homePage/logo-2.png" alt="logo" className="logo" />
        <Fade delay="30" duration="3000" fraction="0.1" triggerOnce="true">
          <div className="parent-motto">
            <div className="motto-img">
              <img
                src="/images/homePage/models-full-img.png"
                alt=""
                className="hero-img-desktop"
              />
            </div>
            <div className="motto-desc">
              <div className="motto-info">
                <img
                  src="/images/homePage/models-1-2.png"
                  alt=""
                  className="hero-img-mobile"
                />
                <h3>{t("motto.title1")} </h3>
                <img
                  src="/images/homePage/models-3.png"
                  alt=""
                  className="hero-img-mobile"
                />
                <h3>{t("motto.title2")}</h3>
                <img
                  src="/images/homePage/models-4-5.png"
                  alt=""
                  className="hero-img-mobile"
                />
                <h3>{t("motto.title3")} </h3>
                <p>
                  <Trans
                    i18nKey="motto.desc"
                    components={{ span: <strong /> }}
                  />
                </p>
                <Link
                  to="/suggest-user"
                  className="btn-general btn-orange"
                  id="btn-join"
                >
                  {t("motto.about-btn")}
                </Link>
              </div>
            </div>
          </div>
        </Fade>
      </section>
    </>
  );
};
