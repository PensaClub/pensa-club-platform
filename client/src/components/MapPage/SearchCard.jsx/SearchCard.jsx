import React, { useState, useEffect, useRef } from 'react';
import './searchCard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faSquarePollHorizontal } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';


const adsData = [
    {
        id: 1,
        name: "John Doe",
        description: "Looking for help with gardening.",
        img: "https://toppng.com/uploads/preview/stock-person-png-stock-photo-man-11563049686zqeb9zmqjd.png",
    },



    {
        id: 22,
        name: "Jane Smith",
        description: "Need assistance with grocery shopping.",
        img: "https://toppng.com/uploads/preview/free-png-happy-black-person-png-images-transparent-black-man-thumbs-up-11563648491mkncpzrjrf.png",
    },
    {
        id: 13,
        name: "Jane Smith",
        description: "Need assistance with grocery shopping.",
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqZctoWcCyQuSUlcN9bKPmSD-B8Gyy_mVo5A&s",
    },
    {
        id: 14,
        name: "Jane Smith",
        description: "Need assistance with grocery shopping.",
        img: "https://toppng.com/uploads/preview/stock-person-png-stock-photo-man-11563049686zqeb9zmqjd.png",

    },
    {
        id: 15,
        name: "Jane Smith",
        description: "Need assistance with grocery shopping.",
        img: "https://toppng.com/uploads/preview/free-png-happy-black-person-png-images-transparent-black-man-thumbs-up-11563648491mkncpzrjrf.png",

    },
    {
        id: 36,
        name: "Jane Smith",
        description: "Need assistance with grocery shopping.",
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqZctoWcCyQuSUlcN9bKPmSD-B8Gyy_mVo5A&s",

    },

];

const SearchCard = ({ ads = adsData }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(true);
    const containerRef = useRef(null);

    const filteredAds = ads.filter(ad =>
        ad.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.description.toLowerCase().includes(searchTerm.toLowerCase()) // да се добавят още опции за филтриране 
    );

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    // const handleClickOutside = (event) => {
    //     if (containerRef.current && !containerRef.current.contains(event.target)) {
    //         setIsOpen(false);
    //     }
    // };

    // Изключил съм го пробно 

    // useEffect(() => {
    //     document.addEventListener('mousedown', handleClickOutside);
    //     return () => {
    //         document.removeEventListener('mousedown', handleClickOutside);
    //     };
    // }, []); 

    return (
        <div className="search-carts-container" ref={containerRef}>
            <div className="selected-option-search" onClick={handleToggle}>
                <FontAwesomeIcon icon={faSquarePollHorizontal} style={{ marginRight: '8px' }} />
                {ads.length > 0 ? <span>{ads.length} - Резултатa от търсенето...</span> : <span> Няма намерени ресултати ...</span>}
                <span className={`arrow ${isOpen ? 'open' : ''}`}></span>
            </div>
            {isOpen && (
                <div className="options-container-search">
                    <div className="search-input-container">
                        <FontAwesomeIcon icon={faMagnifyingGlass} style={{ marginRight: '8px', color: "#e26020" }} />
                        <input
                            type="text"
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Търсене..."
                        />
                    </div>
                    <div className="ads-container">

                        {filteredAds.map(ad => (
                            <>
                                <div key={ad.id} className="ad-card">
                                    <img src={ad.img} alt={ad.name} className="ad-img" />
                                    <div className="ad-details">
                                        <h3 className="ad-name">{ad.name}</h3>
                                        <p className="ad-description">{ad.description}</p>
                                        <Link to="#" className="read-more">Прочети повече</Link>
                                    </div>

                                </div>
                            </>

                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchCard;
