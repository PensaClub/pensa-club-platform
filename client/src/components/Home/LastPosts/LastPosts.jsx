import "./lastPosts.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCommunityContext } from "../../contexts/CommunityContext";
import { useTranslation } from "react-i18next";

export const LastPosts = () => {
  const { getLatestAds } = useCommunityContext();
  const [latestAds, setLatestAds] = useState();
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    window.scrollTo({ top: 0 });

    const fetchLatestAds = async () => {
      const ads = await getLatestAds();
      setLatestAds(ads);
    };

    const fetchCategories = async () => {
      const response = await fetch("/search-criteria.json");
      const data = await response.json();
      setCategories(data.searchCriteria);
    };

    fetchLatestAds();
    fetchCategories();
  }, []);
  const translateCategory = (value) => {
    const category = categories.find((cat) => cat.value === value);
    return category ? t(category.name) : value;
  };
  return (
    <section className="last-posts">
      <h2> {t("home.our_latest_ads")}</h2>
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
                <h4 className="post-category">
                  {translateCategory(ad.category)}
                </h4>
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
            {t("home.see_more_ads")}
          </Link>
        </div>
      </section>
    </section>
  );
};
