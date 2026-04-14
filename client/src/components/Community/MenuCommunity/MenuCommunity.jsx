import "./menuCommunity.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapLocation, faHouseUser, faUser, faBars, faCircleExclamation, faPlus, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { useAuthContext } from "../../contexts/UserContext";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import AlertModal from "../../Header/AlertModal/AlertModal";
import { localePath, stripLangFromPath } from "../../../utils/languageUtils";

export const MenuCommunity = () => {
    const { isAuthentication, isFinish, profileData } = useAuthContext();
    const [finishProfile, setFinishProfile] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const navigate = useLocalizedNavigate();
    const rawNavigate = useNavigate();
    const dropdownRef = useRef(null);

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleUserClick = () => {
        if (!isAuthentication) {
            navigate('/sign-up');
        } else {
            navigate('/profile/data');
        }
    };

    const handleReloadPage = () => {
        navigate('/community?reset=true');
    };

    const getLocation = (path) => {
        return location.pathname === path ? 'commun-menu-icons active' : 'commun-menu-icons';
    };

    const handleModalToggle = () => {
        setIsModalOpen(!isModalOpen);
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsDropdownOpen(false);
        }
    };

    useEffect(() => {
        setFinishProfile(isFinish);

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isFinish]);

    const changeLanguage = async (lng) => {
        if (lng === i18n.language) return;
        const cleanPath = stripLangFromPath(window.location.pathname);
        const targetPath = localePath(cleanPath, lng);
        await i18n.changeLanguage(lng);
        rawNavigate(targetPath, { replace: true });
      };
      const currentLanguage = i18n.language;

    return (
        <>
            <nav className="menu-community">
                <FontAwesomeIcon icon={faHouseUser} className={getLocation('/')} onClick={() => handleNavigation('/')} />
                <FontAwesomeIcon icon={faUserGroup} className={getLocation('/community')} onClick={handleReloadPage} />
                <FontAwesomeIcon icon={faPlus} className={getLocation('/ad/create')} onClick={() => handleNavigation('/ad/create')}/>
                <FontAwesomeIcon icon={faMapLocation} className={getLocation('/map')} onClick={() => handleNavigation('/map')} />
                {/* <div className="profile-container" ref={dropdownRef}>
                    <FontAwesomeIcon icon={faUser} className={getLocation('/profile/data')} onClick={handleUserClick} />
                    {isAuthentication && !finishProfile && (
                        <span
                            className="warning-icon-image-community"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleModalToggle();
                            }}
                        >
                            <FontAwesomeIcon icon={faCircleExclamation} />
                        </span>
                    )}
                </div> */}
            </nav>

            <AlertModal isOpen={isModalOpen} onClose={handleModalToggle}>
                <p>
                {t("profile.alert_message")}
                </p>
            </AlertModal>
        </>
    );
};
