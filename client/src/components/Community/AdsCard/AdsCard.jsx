import './adsCard.css';


export const AdsCard = ({ ads }) => {
   
        return (
            <section className="ads-main">
                {ads.map(ad => (
                    <div key={ad.id} className="ads-card">
                        <div className="img-ads">
                            <img src={ad.image} alt={ad.title} />
                            <p>{ad.type}</p>
                        </div>
                        <div className="ads-info">
                            <h3 className="title-card">{ad.title}</h3>
                            <div className="subinfo-ads">
                                <p>{ad.item}</p>
                                <p>{ad.city}</p>
                                <p className='ads-exp'>{new Date(ad.created_date).toLocaleDateString('bg-BG', { month: 'long' })}</p>
                            </div>
                            <p className="ads-data">Валидна до: {new Date(ad.expiry_date).toLocaleDateString('bg-BG')}</p>
                            <div className="ads-user-info">
                                <img src="/images/homePage/avatar2.png" alt={ad.user_name} />
                                <p>{ad.user_name}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </section>
        );
}