
import './adPage.css'
import '../CommunityFooter/communityFooter.css'

import { HeaderCommunity } from '../HeaderCommunity/HeaderCommunity'
import { CommunityFooter } from '../CommunityFooter/CommunityFooter'

export const AdPage = () => {
    return (
        <>  
        <section className="ad-community-background">
            <section className='ad-page'>

            <HeaderCommunity />

            </section>
 
            <CommunityFooter />
        </section>

        </>
    )
}