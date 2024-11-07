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
          </Slide>
        </div>
      </section>
    </>
  );
};
