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
        img: "http://1.gravatar.com/avatar/47db31bd2e0b161008607d84c74305b5?s=96&d=mm&r=g"
    },
    {
        id: 2,
        name: "Jane Smith",
        description: "Need assistance with grocery shopping.",
        img: "http://1.gravatar.com/avatar/47db31bd2e0b161008607d84c74305b5?s=96&d=mm&r=g"
    },
    {
        id: 2,
        name: "Jane Smith",
        description: "Need assistance with grocery shopping.",
        img: "http://1.gravatar.com/avatar/47db31bd2e0b161008607d84c74305b5?s=96&d=mm&r=g"
    },
    {
        id: 2,
        name: "Jane Smith",
        description: "Need assistance with grocery shopping.",
        img: "http://1.gravatar.com/avatar/47db31bd2e0b161008607d84c74305b5?s=96&d=mm&r=g"
    },
    {
        id: 2,
        name: "Jane Smith",
        description: "Need assistance with grocery shopping.",
        img: "http://1.gravatar.com/avatar/47db31bd2e0b161008607d84c74305b5?s=96&d=mm&r=g"
    },
    {
        id: 2,
        name: "Jane Smith",
        description: "Need assistance with grocery shopping.",
        img: "http://1.gravatar.com/avatar/47db31bd2e0b161008607d84c74305b5?s=96&d=mm&r=g"
    },

];

const SearchCard = ({ ads = adsData }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(true);
    const containerRef = useRef(null);

    const filteredAds = ads.filter(ad =>
        ad.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleClickOutside = (event) => {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="search-carts-container" ref={containerRef}>
            <div className="selected-option-search" onClick={handleToggle}>
                <FontAwesomeIcon icon={faSquarePollHorizontal} style={{ marginRight: '8px' }} />
                <span>{ads.length} - Резултатa от търсенето...</span>
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
