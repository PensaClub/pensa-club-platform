import { Link } from 'react-router-dom'
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
            </header>
        </>
    )
}