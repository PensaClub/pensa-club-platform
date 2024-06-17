import { useEffect } from 'react'
import { FiltersMap } from './FitlersMap/FiltersMap'
import { MapEditor } from './MapEditor/MapEditor'
import SearchCard from './SearchCard.jsx/SearchCard'
import { useTranslation } from 'react-i18next';



import './mapPage.css'



export const MapPage = () => {
    const {t} = useTranslation();

    useEffect(() => {
        window.scrollTo({top:0})
      },[])
      

    return (
        <>
            <div className="map-section">
                <div className="map-line">
                    <h4>{t('map.welcome')}</h4>
                </div>

                <div className="map-main">
                    <FiltersMap />
                </div>
                <section className="map">
                    <MapEditor/>
                    <div className="search-card-map-page">
                        {/* <SearchCard/> */}
                    </div>
                </section>
            </div>


        </>
    )
}