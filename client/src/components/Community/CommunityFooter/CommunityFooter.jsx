import { MenuCommunity } from "../MenuCommunity/MenuCommunity";
import "./communityFooter.css";


export const CommunityFooter = () => {
    return (
        <>
        <footer>
            <div className="footer-menu">
                <MenuCommunity/>
            </div>
        </footer>
        </>
    )
}