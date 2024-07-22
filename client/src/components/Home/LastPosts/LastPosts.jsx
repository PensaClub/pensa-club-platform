import "./lastPosts.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCommunityContext } from "../../contexts/CommunityContext";
import { useTranslation } from "react-i18next";

export const LastPosts = () => {
  const { getLatestAds } = useCommunityContext();
  const [latestAds, setLatestAds] = useState();
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo({ top: 0 });

    const fetchLatestAds = async () => {
      const ads = await getLatestAds();
      setLatestAds(ads);
    };

    fetchLatestAds();
  }, []);
  return (
    <section className="last-posts">
      <h2>Последните наши публикации</h2>
      <section className="home-posts">
        {latestAds &&
          latestAds.map((ad, index) => (
            <div
              key={ad.adId}
              className={`single-card card-${index === 0 ? "1" : "2"}`}
            >
              <img src={ad.images[0].firebaseImagePath} alt={`card-${index}`} />
              <div className="card-info">
                <p className="post-desc">{ad.description}</p>
                <h4 className="post-category">{t(ad.category)}</h4>
                <div className="color-line-second"></div>
              </div>
              <div className="color-line"></div>
            </div>
          ))}
        <div>
          <Link
            to="/craigslist"
            className="btn-general btn-orange"
            id="more-btn"
          >
            Вижте още публикации
          </Link>
        </div>
      </section>
    </section>
  );
};
