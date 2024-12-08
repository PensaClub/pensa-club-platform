import "./about.css";
import { useTranslation, Trans } from "react-i18next";
import { Link } from "react-router-dom";

export const AboutSection = () => {
  const { t } = useTranslation();

  return (
    <>
      <section className="about">
        <div className="bg-about">
          <img
            src="/images/homePage/logo-2.png"
            alt="Pensa"
          />
        </div>
        <div className="about-content-img">
          <img src="/images/homePage/about-img.webp" alt="" />
        </div>
        <div className="about-content">
          <h3>{ t("about.title")}</h3>
          <p>
            { t("about.desc")}
          </p>
          <Link
                  to="/profile"
                  className="btn-general btn-orange"
                  id="btn-join"
                >
                  {t("motto.about-btn")}
                </Link>
                <Link
                  to="/suggest-user"
                  className="btn-general btn-green"
                  id="btn-suggestion"
                >
                  {t("motto.suggestion-btn")}
                </Link>
        </div>
      </section>
    </>
  );
};
