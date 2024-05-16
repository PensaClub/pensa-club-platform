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
                <MottoSection/>
                <LastPosts/>
                <NewsSubscribe/>
            </div>
        </>

    )
}