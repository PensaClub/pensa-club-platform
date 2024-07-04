import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus} from '@fortawesome/free-solid-svg-icons';
import './headerCommunity.css'
export const HeaderCommunity = () => {
    return (
        <>
            <header className="header-community">
                <div className="header-community-logo">
                    <Link to="/">
                        <img src="/images/homePage/logo.png" alt="logo" className="logo" />{' '}
                        Pensa Club
                    </Link>
                </div>
                <div className="plus-icon-container">
                  <Link to="/ad/create">  <FontAwesomeIcon icon={faPlus} className="plus-icon" /></Link>
                </div>
            </header>
        </>
    )
}