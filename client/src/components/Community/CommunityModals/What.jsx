import React, { useState } from "react";
import "./what.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useCommunityContext } from "../../contexts/CommunityContext";
import { useTranslation } from "react-i18next";

export const What = ({ isOpen, onClose, setFilters, filters }) => {
  const [searchQuery, setSearchQuery] = useState(filters.tags);
  const [openCategories, setOpenCategories] = useState(false);
  const [searchType, setSearchType] = useState(filters.category);
  const { searchCriteria } = useCommunityContext();
  const { t } = useTranslation(['community', 'auth']);

  const handleCategory = (category) => {
    setFilters((prev) => ({
      ...prev,
      tags: searchQuery,
      category: prev.category.includes(category)
        ? prev.category.filter((c) => c !== category)
        : [...prev.category, category],
    }));
  };

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      tags: searchQuery,
      category: prev.category.length == 0 ? ["all"] : prev.category,
    }));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="what-modal-overlay">
      <div className="what-modal-content">
        <button className="what-close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faXmark} style={{ color: "#000000" }} />
        </button>
        <h2>{t("community.what_search")}?</h2>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("community.tag_search")}
          className="what-input"
        />
        {/* <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="what-select">
                    <option value="all">{t('search-criteria.all_menu')}</option>
                    {searchCriteria.searchCriteria?.map(criteria => (
                        <option key={criteria.value} value={criteria.value}> {t(criteria.name)}</option>
                    ))}
                </select> */}
        <div className="what-select">
          <button className="open-categories" onClick={() => setOpenCategories(pr => !pr)}>
            <p>{t("search-criteria.all_menu")}</p>
            <p>&#x25BC;</p>
          </button>
          { openCategories && 
          <div className="what-categories">
            {searchCriteria?.searchCriteria?.map((criteria) => (
              <label htmlFor={criteria.value} key={criteria.value}>
                <input
                  type="checkbox"
                  id={criteria.value}
                  name={t("community.what_search")}
                  onChange={(e) => handleCategory(e.target.id)}
                  checked={
                    filters.category.includes(criteria.value) ? true : false
                  }
                />
                {t(criteria.name)}
              </label>
            ))}
          </div>}
        </div>
        <button onClick={handleSearch} className="btn-general btn-orange">
          {t("community.apply_btn")}
        </button>
      </div>
    </div>
  );
};
