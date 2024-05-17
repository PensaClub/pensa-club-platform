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
                <Fade delay="50" duration="5000" fraction="0.4"triggerOnce='true'>
                    <MottoSection />
                </Fade>
                <Slide direction='left' duration="3000" triggerOnce='true'>
                    <LastPosts />
                </Slide>
                <Fade delay="50" duration="5000" triggerOnce='true'>
                    <NewsSubscribe />
                </Fade>

            </div>
        </>

    )
}