import { Fade, Slide } from 'react-awesome-reveal'
import { Hero } from './HeroSection/Hero'
import { LastPosts } from './LastPosts/LastPosts'
import { MottoSection } from './MottoSection/MottoSection'
import { NewsSubscribe } from './NewsSubscribe/NewsSubscribe'
import './home.css'

export const Home = () => {
    return (
        <>
            <div className="home-container">
                <Hero />
                <Fade delay="30" duration="3000" fraction="0.1" triggerOnce='true'>
                    <MottoSection />
                </Fade>
                <Slide direction='left' duration="3000" triggerOnce='true'>
                    <LastPosts />
                </Slide>
                <Fade delay="10" duration="2000" triggerOnce='true'>
                    <NewsSubscribe />
                </Fade>

            </div>
        </>

    )
}
