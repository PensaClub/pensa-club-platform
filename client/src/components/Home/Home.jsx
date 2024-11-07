import "./home.css";
import { Fade, Slide } from "react-awesome-reveal";
import { Hero } from "./HeroSection/Hero";
import { LastPosts } from "./LastPosts/LastPosts";
import { NewsSubscribe } from "./NewsSubscribe/NewsSubscribe";
import { useEffect } from "react";
import { MottoSection } from "./MottoSection/MottoSection";
import { AboutSection } from "./AboutSection/About";

export const Home = () => {
  useEffect(() => {
    window.scrollTo({ top: 0 });
},[])
  return (
    <>
      <div className="home-container">
        <Hero />
        {/* <Fade delay="30" duration="3000" fraction="0.1" triggerOnce='true'>
                    <MottoSection />
                </Fade> */}
        <MottoSection />
        <Slide direction="left" duration="3000" triggerOnce="true">
          <AboutSection/>
        </Slide>
        <Fade delay="10" duration="2000" triggerOnce="true">
          <NewsSubscribe />
        </Fade>
      </div>
    </>
  );
};
