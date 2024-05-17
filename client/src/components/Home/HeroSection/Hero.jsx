import Testimonials from './Testimonials/Testimonials';
import { Bounce, Fade, Flip, Hinge, JackInTheBox, Roll, Rotate, Slide, Zoom } from "react-awesome-reveal";

import './hero.css';


export const Hero = () => {
    return (
        <>
            <section className="hero-section">
                <div className="parent-hero">
                <Slide direction='left' duration="3000" triggerOnce='true'>
                    <div className="left-side">
                        <h1>Explore Our Resources</h1>
                        <p>Discover a vibrant community of pensioners, connect with like-minded individuals, and explore a world of opportunities.</p>
                        <div className="btn-hero">
                            <a href="">View Resources</a>
                            <a href="">Join Community</a>
                        </div>
                    </div>
                    </Slide>
                <Fade direction='right' duration="3000" triggerOnce='true'>

                    <Testimonials />
                    </Fade>

                </div>
            </section>

        </>
    )
}