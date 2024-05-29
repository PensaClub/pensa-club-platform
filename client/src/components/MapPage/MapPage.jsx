import { FiltersMap } from './FitlersMap/FiltersMap'
import { MapEditor } from './MapEditor/MapEditor'
import SearchCard from './SearchCard.jsx/SearchCard'



import './mapPage.css'



export const MapPage = () => {



    return (
        <>
            <div className="map-section">
                <div className="map-line">
                    <h4>Добре дошли в Pensa Club! Открийте местни обяви за взаимопомощ с помощта на нашата Карта - Публикувайте обяви или предложения - Разглеждайте и участвайте в локални инициативи</h4>
                </div>

                <div className="map-main">
                    <FiltersMap />
                </div>
                <section className="map">
                    <MapEditor/>
                    <div className="search-card-map-page">
                        <SearchCard/>
                    </div>
                </section>
            </div>


        </>
    )
}