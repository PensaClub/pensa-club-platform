/* eslint-disable react-hooks/exhaustive-deps */
import "./lastPosts.css";
import { LocalizedLink as Link } from '../../LocalizedLink/LocalizedLink';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { useEffect, useState } from "react";
import { useCommunityContext } from "../../contexts/CommunityContext";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "../../contexts/UserContext";

export const LastPosts = () => {
  const { getLatestAds, fetchTowns } = useCommunityContext();
  const {isAuthentication} = useAuthContext();
  const [latestAds, setLatestAds] = useState([]);
  const { t, i18n } = useTranslation('home');
  const [categories, setCategories] = useState([]);
  const [townNames, setTownNames] = useState({});
  const navigate = useLocalizedNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0 });

    const fetchLatestAds = async () => {
      const { result } = await getLatestAds();
      setLatestAds(result);

      const townsDataPromises = result.map(async ad => {
        const townsData = await fetchTowns(Number(ad.adRegion), Number(ad.adSubregion));
        const town = townsData.find(t => t.id === Number(ad.adTown));
        return {
          adId: ad.adId,
          townName: i18n.language === 'bg' ? town.bg : town.en
        };
      });

      const townsData = await Promise.all(townsDataPromises);
      const townNamesMap = townsData.reduce((acc, { adId, townName }) => {
        acc[adId] = townName;
        return acc;
      }, {});
      setTownNames(townNamesMap);
    };

    const fetchCategories = async () => {
      const response = await fetch("/search-criteria.json");
      const data = await response.json();
      setCategories(data.searchCriteria);
    };

    fetchLatestAds();
    fetchCategories();
  }, [i18n.language]);

  const handleAdClick = (ad) => {
    if (isAuthentication) {
      navigate(`/ad/details/${ad.adId}`);
    } else{
      navigate(`/sign-up`);
  }
  };

  const translateCategory = (value) => {
    const category = categories.find((cat) => cat.value === value);
    return category ? t(category.name) : value;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(i18n.language, options);
  };

  const getDisplayName = (account) => {
    if (account?.details?.firstName && account?.details?.lastName) {
      return `${account.details.firstName} ${account.details.lastName}`;
    }
    return account?.details?.username;
  };

  return (
    <section className="last-posts">
      <h2>{t('home.our_latest_ads')}</h2>
      <section className="home-posts">
        {latestAds && latestAds.length > 0 ? (
            <>
            {latestAds.length > 0 && (
              <div className="second-row-section-first">
                <div className="single-card card-1" key={latestAds[0]?.adId} onClick={() => handleAdClick(latestAds[0])}>
                  <img src={latestAds[0]?.images[0]?.imageURL} alt="card-1" />
                  <div className="card-info">
                    <h3 className="post-summary">{latestAds[0]?.summary}</h3>
                    <p className="post-author" style={{ fontStyle: 'italic' }}>
                      {getDisplayName(latestAds[0]?.account)}
                    </p>
                    <div className="latest-description">
                      <p className="post-desc">
                        {t("home.town")}: {townNames[latestAds[0]?.adId]}
                      </p>
                      <h4 className="post-category">
                        {translateCategory(latestAds[0]?.category)} | {formatDate(latestAds[0]?.creationDate)}
                      </h4>
                    </div>
                    <div className="color-line-second"></div>
                  </div>
                </div>
              </div>
            )}
            {latestAds.length > 1 && (
              <div className="second-row-section-second">
                {latestAds.slice(1).map((ad, index) => (
                  <div className="single-card card-2" key={ad.adId} onClick={() => handleAdClick(ad)}>
                    <img src={ad?.images[0]?.imageURL} alt={`card-${index + 2}`} />
                    <div className="card-info">
                      <h3 className="post-summary">{ad.summary}</h3>
                      <p className="post-author" style={{ fontStyle: 'italic' }}>
                        {getDisplayName(ad.account)}
                      </p>
                      <div className="latest-description">
                        <p className="post-desc">
                          {t("home.town")}: {townNames[ad.adId]}
                        </p>
                        <h4 className="post-category">
                          {translateCategory(ad.category)} | {formatDate(ad.creationDate)}
                        </h4>
                      </div>
                      <div className="color-line-second"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <h2>{t('home.no_results')}</h2>
        )}
        <div>
          <Link to="/craigslist" className="btn-general btn-orange" id="more-btn">
            {t('home.see_more_ads')}
          </Link>
        </div>
      </section>
    </section>
  );
};
