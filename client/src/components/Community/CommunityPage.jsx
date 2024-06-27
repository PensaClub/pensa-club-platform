import { HeaderCommunity } from "./HeaderCommunity/HeaderCommunity"
import './communityPage.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faLocationDot, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FiltersCommunity } from "./FiltersCommunity/FiltersCommunity";
import { CommunityFooter } from "./CommunityFooter/CommunityFooter";
import { AdsCard } from "./AdsCard/AdsCard";

export const CommunityPage = () => {
    const ads =
    [
        {
            "id": 1,
            "created_date": "2024-06-26",
            "expiry_date": "2024-07-26",
            "title": "Продавам велосипед",
            "type": "продавам",
            "image": "/community/ads.jpg",
            "user_name": "Иван Иванов",
            "city": "София",
            "item": "Велосипед"
        },
        {
            "id": 2,
            "created_date": "2024-06-20",
            "expiry_date": "2024-07-20",
            "title": "Купувам лаптоп",
            "type": "купувам",
            "image": "/community/ads.jpg",
            "user_name": "Мария Петрова",
            "city": "Пловдив",
            "item": "Лаптоп"
        },
        {
            "id": 3,
            "created_date": "2024-06-15",
            "expiry_date": "2024-07-15",
            "title": "Подарявам диван",
            "type": "Дарявам",
            "image": "/community/ads.jpg",
            "user_name": "Георги Георгиев",
            "city": "Варна",
            "item": "Диван"
        }
    ]
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
                    {ads.length>0 ?<AdsCard ads={ads}/>: <FiltersCommunity />
                    }
                </section>
                <CommunityFooter />

            </section>
            </section>
        </>
    )
}