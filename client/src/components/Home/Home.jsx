import { Hero } from './HeroSection/Hero'
import { LastPosts } from './LastPosts/LastPosts'
import { NewsSubscribe } from './NewsSubscribe/NewsSubscribe'
import './home.css'

export const Home = () => {
    return (
        <>
            <div className="home-container">
                <Hero />
                <LastPosts/>
                <NewsSubscribe/>
            </div>
        </>

    )
}