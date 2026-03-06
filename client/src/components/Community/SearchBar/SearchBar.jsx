import './searchBar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faLocationDot,
  faCalendar,
} from '@fortawesome/free-solid-svg-icons';

import { useEffect, useState } from 'react';
import { What } from "../CommunityModals/What";
import { SearchWhere } from "../CommunityModals/SearchWhere";
import { SearchWhen } from "../CommunityModals/SearchWhen";

import { useTranslation } from 'react-i18next';

export const SearchBar = ({ handleSearch }) => {
  
  const [isSearchWhatOpen, setIsSearchWhatOpen] = useState(false);
  const [isSearchWhereOpen, setIsSearchWhereOpen] = useState(false);
  const [isSearchWhenOpen, setIsSearchWhenOpen] = useState(false);
  const [creationDateLabel, setCreationDateLabel] = useState('');

  const { t, i18n } = useTranslation(['community', 'auth']);

  const [filters, setFilters] = useState({
    tags: '',
    category: '',
    where: '',
    creationDate: '',
    expirationDate: '',
    startDate: '',
    endDate: '',
    adRegion: '',
    adSubregion: '',
    adTown: '',
    adRegionName: '',
    adSubregionName: '',
    adTownName: '',
  });
  // eslint-disable-next-line no-unused-vars
  const handleSearchClick = () => {
    handleSearch(filters);
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
    return t('community.where_search');
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <>
      <div className="search-bar-commun">
        <div className="icons-com" onClick={() => setIsSearchWhatOpen(true)}>
          <FontAwesomeIcon icon={faMagnifyingGlass} className="commun-icon" />
          <p>
            {filters.tags || filters.category !== ''
              ? `${filters.tags} ${
                  filters.category !== 'all'
                    ? `${t(`search-criteria.${filters.category}`)}`
                    : `${t('search-criteria.all_menu')}`
                }`
              : t('community.what_search') + '?'}
          </p>
        </div>
        <div className="divider"></div>
        <div className="icons-com" onClick={() => setIsSearchWhereOpen(true)}>
          <FontAwesomeIcon icon={faLocationDot} className="commun-icon" />
          <p>{getWhereLabel()}</p>
        </div>
        <div className="divider"></div>
        <div className="icons-com" onClick={() => setIsSearchWhenOpen(true)}>
          <FontAwesomeIcon icon={faCalendar} className="commun-icon" />
          <p>
            {creationDateLabel
              ? creationDateLabel === t('community.specific_period') &&
                filters.startDate &&
                filters.endDate
                ? `${t('community.from_date')} ${new Date(filters.startDate).toLocaleDateString(
                    i18n.language
                  )} ${t('community.to_date')} ${new Date(filters.endDate).toLocaleDateString(
                    i18n.language
                  )}`
                : `${creationDateLabel}`
              : t('community.when_search') + '?'}
          </p>
        </div>
        <button className="btn-orange btn-general" onClick={handleSearchClick}>
          {t('community.search_btn')}
        </button>
      </div>

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
