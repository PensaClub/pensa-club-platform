import { useEffect, useRef } from 'react'
import { FiltersMap } from './FitlersMap/FiltersMap'
import { MapEditor } from './MapEditor/MapEditor'
import SearchCard from './SearchCard.jsx/SearchCard'
import { useTranslation } from 'react-i18next';



import './mapPage.css'
import { useMappingContext } from '../contexts/MapContext';



export const MapPage = () => {
    const {t} = useTranslation();

const { onAllUsers, allUsers } = useMappingContext();
console.log(allUsers)
const isFetched = useRef(false); //  флаг за  да проверявам за заявка - пробно 

useEffect(() => {
    window.scrollTo({ top: 0 });

    const fetchAllUsers = async () => {
        try {
            await onAllUsers();
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };
 
    if (!allUsers && !isFetched.current) {
        fetchAllUsers();
        isFetched.current = true; 
    }
}, [onAllUsers, allUsers]);

    return (
        <>
            <div className="map-section">
                <div className="map-line">
                    <h4>{t('map.welcome')}</h4>
                </div>

                <div className="map-main">
                    <FiltersMap />
                </div>
                {/* <section className="map">
                    <MapEditor/>
                    <div className="search-card-map-page">
                        <SearchCard/>
                    </div>
                </section> */}
            </div>


        </>
    )
}