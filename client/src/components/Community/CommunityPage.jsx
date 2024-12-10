/* eslint-disable react-hooks/exhaustive-deps */
import "./communityPage.css";
import { FiltersCommunity } from "./FiltersCommunity/FiltersCommunity";
import { AdsCard } from "./AdsCard/AdsCard";
import { useEffect, useState, useCallback, useRef } from "react";
import debounce from "lodash.debounce";
import { useLocation, useNavigate } from "react-router-dom";

import { What } from "./CommunityModals/What";
import { SearchWhere } from "./CommunityModals/SearchWhere";
import { SearchWhen } from "./CommunityModals/SearchWhen";
import { useCommunityContext } from "../contexts/CommunityContext";
import { useTranslation } from "react-i18next";
import { SearchCommunityBar } from "./SearchCommunityBar";
import { SearchCategory } from "./CommunityModals/SearchCategory";

export const CommunityPage = () => {
  const { isLoading, searchAds, regions, subregions, fetchTowns } =
    useCommunityContext();
  const [isSearchWhatOpen, setIsSearchWhatOpen] = useState(false);
  const [isSearchWhereOpen, setIsSearchWhereOpen] = useState(false);
  const [isSearchWhenOpen, setIsSearchWhenOpen] = useState(false);
  const [creationDateLabel, setCreationDateLabel] = useState("");
  const [showResetIcon, setShowResetIcon] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [lastPage, setLastPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const [filters, setFilters] = useState({
    tags: "",
    category: [],
    where: "",
    creationDate: "",
    expirationDate: "",
    startDate: "",
    endDate: "",
    adRegion: "",
    adSubregion: "",
    adTown: "",
    adRegionName: "",
    adSubregionName: "",
    adTownName: "",
  });

  const [ads, setAds] = useState({ result: [] });
  const [page, setPage] = useState(1);
  const loaderRef = useRef(null);

  const getAdTownValue = (language, town) => {
    return language === "bg" ? town.bg : town.en;
  };
  useEffect(() => {
    window.scrollTo({ top: 0 });
    handleSearch();
  }, []);
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const filtersFromQuery = Object.fromEntries(query.entries());
    
    setFilters((prevFilters) => ({ ...prevFilters, ...filtersFromQuery }));
    //бутона от менюто за навигация слага кеури ресет=true ао го има ресетва филтрите
    if (query.get("reset") === "true") {
      resetFilters();
      navigate("/craigslist", { replace: true });
    } else if (Object.keys(filtersFromQuery).length > 0) {
      handleSearch(filtersFromQuery, 1);
    }
  }, [location.search, navigate]);

  const handleSearch = async (customFilters = null, pageNum = 1) => {
    const searchFilters = customFilters ? customFilters : filters;

    try {
      const queryFilters = Object.fromEntries(
        Object.entries(searchFilters).filter(
          ([key, value]) =>
            key !== "adRegionName" &&
            key !== "adSubregionName" &&
            key !== "adTownName" &&
            value &&
            value !== "all"
        )
      );
      const result = await searchAds(queryFilters, pageNum);

      if (result.result && result.result.length > 0) {
        const adsWithNames = await Promise.all(
          result.result.map(async (ad) => {
            const townsData = await fetchTowns(
              Number(ad.adRegion),
              Number(ad.adSubregion)
            );
            const town = townsData.find((t) => t.id === Number(ad.adTown));
            return {
              ...ad,
              adRegion:
                regions.find((region) => region.id === Number(ad.adRegion))?.[
                  currentLanguage
                ] || ad.adRegion,
              adSubregion:
                subregions[Number(ad.adRegion)]?.find(
                  (subregion) => subregion.id === Number(ad.adSubregion)
                )?.[currentLanguage] || ad.adSubregion,
              adTown: town ? getAdTownValue(currentLanguage, town) : ad.adTown,
            };
          })
        );
        setAds((prevAds) => ({
          result:
            pageNum === 1 ? adsWithNames : [...prevAds.result, ...adsWithNames],
        }));
        setSearchPerformed(true);
        setLastPage(result.lastPage);
      } else if (pageNum === 1) {
        setAds({ result: [] });
        setSearchPerformed(true);
        setLastPage(true);
      }
      setShowResetIcon(true);
    } finally {
      setLoadingMore(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      tags: "",
      category: "",
      where: "",
      creationDate: "",
      expirationDate: "",
      startDate: "",
      endDate: "",
      adRegion: "",
      adSubregion: "",
      adTown: "",
      adRegionName: "",
      adSubregionName: "",
      adTownName: "",
    });
    setAds({ result: [] });
    setCreationDateLabel("");
    setShowResetIcon(false);
    setSearchPerformed(false);
    setPage(1);
  };

  const getWhereLabel = () => {
    if (filters.adTownName) {
      return filters.adTownName;
    }
    if (filters.adSubregionName) {
      return filters.adSubregionName;
    }
    if (filters.adRegionName) {
      return filters.adRegionName;
    }
    return t("community.where_search");
  };

  const loadMoreAds = useCallback(
    debounce(() => {
      if (!isLoading && !lastPage && searchPerformed && !loadingMore) {
        setLoadingMore(true);
        const nextPage = page + 1;
        setPage(nextPage);
        handleSearch(filters, nextPage);
      }
    }, 400),
    [filters, page, isLoading, lastPage, searchPerformed, loadingMore]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isLoading &&
          searchPerformed &&
          !lastPage
        ) {
          loadMoreAds();
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 1.0,
      }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [isLoading, loadMoreAds, searchPerformed, lastPage]);

  return (
    <>
      <section className="background-community">
        <section className="community-page">
          <SearchCategory
            setFilters={setFilters}
            filters={filters}
            handleSearch={handleSearch}
          />
          <section className="main-community">
            <div className="hero-section-commun">
              <div className="header-commun">
                <img src="/images/homePage/logo-2.png" alt="Pensa" />
                <h1>{t("community.community")}</h1>
              </div>
              <SearchCommunityBar
                filters={filters}
                setFilters={setFilters}
                setIsSearchWhatOpen={setIsSearchWhatOpen}
                setIsSearchWhereOpen={setIsSearchWhereOpen}
                setIsSearchWhenOpen={setIsSearchWhenOpen}
                handleSearch={handleSearch}
                resetFilters={resetFilters}
                getWhereLabel={getWhereLabel}
                creationDateLabel={creationDateLabel}
                showResetIcon={showResetIcon}
              />
            </div>

            {ads.result.length > 0 ? (
              <AdsCard ads={ads} isLoading={isLoading} />
            ) : searchPerformed ? (
              <div className="no-ads-container">
                <h3>{t("community.no_ads_found")}</h3>
                <div className="no-ads-message">
                  <p>{t("community.no_ads_message")}</p>
                  <button
                    className="clear-filters-button"
                    onClick={resetFilters}
                  >
                    {t("community.clear_filters")}
                  </button>
                </div>
              </div>
            ) : (
              <FiltersCommunity handleSearch={handleSearch} />
              // <FiltersCommunity handleSearch={handleSearch()} />
            )}
            <div ref={loaderRef} />
          </section>
        </section>
      </section>
      <What
        isOpen={isSearchWhatOpen}
        onClose={() => setIsSearchWhatOpen(false)}
        setFilters={setFilters}
        filters={filters}
      />
      <SearchWhere
        isOpen={isSearchWhereOpen}
        onClose={() => setIsSearchWhereOpen(false)}
        setFilters={setFilters}
        filters={filters}
      />
      <SearchWhen
        isOpen={isSearchWhenOpen}
        onClose={() => setIsSearchWhenOpen(false)}
        setFilters={setFilters}
        filters={filters}
        setCreationDateLabel={setCreationDateLabel}
      />
    </>
  );
};
