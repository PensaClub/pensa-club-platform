import React from "react";
import "./motto.css";
import { useTranslation } from "react-i18next";

import { MottoCard } from "./MottoCard/mottoCard";

export const MottoSection = () => {
  const { t } = useTranslation('home');

  return (
    <section className="motto-section-modern">
      <h2 className="motto-main-title">{t('motto.main-title')}</h2>

      <div className="motto-cards-container">
        <MottoCard
          icon={"fa fa-comments-o"}
          title={t("motto.title1")}
          desc={t("motto.desc1")}
          index={0}
        />
        <MottoCard
          icon={"fa fa-puzzle-piece"}
          title={t("motto.title2")}
          desc={t("motto.desc2")}
          index={1}
        />
        <MottoCard
          icon={"fa fa-heart"}
          title={t("motto.title3")}
          desc={t("motto.desc3")}
          index={2}
        />
      </div>
    </section>
  );
};
