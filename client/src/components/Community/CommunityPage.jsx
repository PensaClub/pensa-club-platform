import { HeaderCommunity } from "./HeaderCommunity/HeaderCommunity"
import './communityPage.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faLocationDot, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FiltersCommunity } from "./FiltersCommunity/FiltersCommunity";
import { CommunityFooter } from "./CommunityFooter/CommunityFooter";

export const CommunityPage = () => {
    return (
        <>
        <section className="background-community">
            <section className="community-page">
                <HeaderCommunity />
                <section className="main-community">
                    <div className="hero-bg">
                        {/* <img src="/community/community-bg.jpg" alt="" /> */}
                    </div>
                    <div className="hero-section-commun">
                        <h1>Общност</h1>
                        <div className="search-bar-commun">
                            <div className="icons-com">
                                <FontAwesomeIcon icon={faMagnifyingGlass} className="commun-icon" /><p>Какво търсиш?</p>
                            </div>

                            <div className="divider"></div>
                            <div className="icons-com">
                                <FontAwesomeIcon icon={faLocationDot} className="commun-icon" /><p>Къде?</p>
                            </div>
                            <div className="divider"></div>
                            <div className="icons-com">
                                <FontAwesomeIcon icon={faCalendar} className="commun-icon" /><p>Кога?</p>
                                <button className="search-button">Търси</button>
                            </div>

                        </div>
                    </div>
                    <FiltersCommunity />

                </section>
                <CommunityFooter />

            </section>
            </section>
        </>
    )
}