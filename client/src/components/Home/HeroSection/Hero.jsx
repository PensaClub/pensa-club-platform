import Testimonials from './Testimonials/Testimonials';
import { Fade, Slide, } from "react-awesome-reveal";
import {Link} from 'react-router-dom'

import './hero.css';


export const Hero = () => {
    return (
        <>
            <section className="hero-section">
                <div className="parent-hero">
                    <Slide direction='left' duration="2000" triggerOnce='true'>
                        <div className="left-side">
                            <h1>Explore Our Resources</h1>
                            <p>Discover a vibrant community of pensioners, connect with like-minded individuals, and explore a world of opportunities.</p>
                            <div className="btn-hero">
                                <Link to="/#" className="btn-general btn-green">View Resources</Link>
                                <Link to="/sign-up" className="btn-general btn-orange">Join Community</Link>
                            </div>
                        </div>
                    </Slide>
                    {/* <Fade direction='right' duration="2000" triggerOnce='true'>

                        <Testimonials />
                    </Fade> */}

                </div>
            </section>

        </>
    )
}