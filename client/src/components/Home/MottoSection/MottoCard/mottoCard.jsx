import "./mottoCard.css";

import { useTranslation, Trans } from "react-i18next";

export const MottoCard = ({icon, title, desc}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="motto-card">
      <i className={icon}></i>
        <h2>{title}</h2>
        <p>{desc}</p>
      </div>
    </>
  );
};
