import { Hero } from './HeroSection/Hero'
import { LastPosts } from './LastPosts/LastPosts'
import './home.css'

export const Home = () => {
    return (
        <>
            <div className="home-container">
                <Hero />
                <LastPosts/>
            </div>
        </>

    )
}