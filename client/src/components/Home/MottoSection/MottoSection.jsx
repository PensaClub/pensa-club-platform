import "./motto.css";
import { useTranslation} from "react-i18next";
import { MottoCard } from "./MottoCard/mottoCard";
import { Slide } from "react-awesome-reveal";

export const MottoSection = () => {
  const { t } = useTranslation();

  return (
    <>
      {/* <Slide delay="30" duration="3000" fraction="0.1" triggerOnce="true"> */}
        <section className="motto-section">
          <MottoCard
            icon={"fa fa-comments-o"}
            title={t("motto.title1")}
            desc={t("motto.desc1")}
          />
          <MottoCard
            icon={"fa fa-puzzle-piece"}
            title={t("motto.title2")}
            desc={t("motto.desc2")}
          />
          <MottoCard
            icon={"fa fa-heart"}
            title={t("motto.title3")}
            desc={t("motto.desc3")}
          />
        </section>
      {/* </Slide> */}
    </>
  );
};
