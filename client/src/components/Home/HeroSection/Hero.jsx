import Testimonials from './Testimonials/Testimonials';
import './hero.css';


export const Hero = () => {
    return (
        <>
            <section className="hero-section">
                <div className="parent-hero">
                    <div className="left-side">
                        <h1>Explore Our Resources</h1>
                        <p>Discover a vibrant community of pensioners, connect with like-minded individuals, and explore a world of opportunities.</p>
                        <div className="btn-hero">
                            <a href="">View Resources</a>
                            <a href="">Join Community</a>
                        </div>
                    </div>
                    <Testimonials />
                </div>
            </section>

        </>
    )
}