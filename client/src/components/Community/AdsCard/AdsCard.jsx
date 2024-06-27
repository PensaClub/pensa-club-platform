import './adsCard.css';


export const AdsCard = ({ cards }) => {
    const ads =
        [
            {
                "id": 1,
                "created_date": "2024-06-26",
                "expiry_date": "2024-07-26",
                "title": "Продавам велосипед",
                "type": "продавам",
                "image": "/community/ads.jpg",
                "user_name": "Иван Иванов",
                "city": "София",
                "item": "Велосипед"
            },
            {
                "id": 2,
                "created_date": "2024-06-20",
                "expiry_date": "2024-07-20",
                "title": "Купувам лаптоп",
                "type": "купувам",
                "image": "/community/ads.jpg",
                "user_name": "Мария Петрова",
                "city": "Пловдив",
                "item": "Лаптоп"
            },
            {
                "id": 3,
                "created_date": "2024-06-15",
                "expiry_date": "2024-07-15",
                "title": "Подарявам диван",
                "type": "Дарявам",
                "image": "/community/ads.jpg",
                "user_name": "Георги Георгиев",
                "city": "Варна",
                "item": "Диван"
            }
        ]
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