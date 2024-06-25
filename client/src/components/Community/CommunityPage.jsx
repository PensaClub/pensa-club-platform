import { HeaderCommunity } from "./HeaderCommunity/HeaderCommunity"
import './communityPage.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faLocationDot, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FiltersCommunity } from "./FiltersCommunity/FiltersCommunity";
import { CommunityFooter } from "./CommunityFooter/CommunityFooter";

export const CommunityPage = () => {
    return (
        <>
            <section className="community-page">
                <HeaderCommunity />
                <section className="main-community">
                    <div className="hero-section-commun">
                        <h1>Общност</h1>
                        <div className="search-bar-commun">
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="commun-icon" />
                            <div className="divider"></div>
                            <FontAwesomeIcon icon={faLocationDot} className="commun-icon" />
                            <div className="divider"></div>
                            <FontAwesomeIcon icon={faCalendar} className="commun-icon" />
                            <button className="search-button">Търси</button>
                        </div>
                    </div>
                </section>
                <FiltersCommunity />
                <CommunityFooter />

            </section>

        </>
    )
}