


import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import './publicationsSearch.css';

export const PublicationsSearch = ({ publications, onFilter }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: t('publications.categories.all') },
    { value: 'technology', label: t('publications.categories.technology') },
    { value: 'health', label: t('publications.categories.health') },
    { value: 'lifestyle', label: t('publications.categories.lifestyle') },
    { value: 'education', label: t('publications.categories.education') },
    { value: 'community', label: t('publications.categories.community') },
    { value: 'other', label: t('publications.categories.other') }
  ];

  useEffect(() => {
    const filtered = publications.filter(publication => {
      const matchesSearch = publication.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           publication.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || publication.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    onFilter(filtered);
  }, [searchTerm, selectedCategory, publications, onFilter]);

  return (
    <div className="publications-search">
      <div className="container">
        <div className="publications-search-content">
          <div className="publications-search-input-group">
            <div className="publications-search-input-wrapper">
              <FontAwesomeIcon icon={faSearch} className="publications-search-icon" />
              <input
                type="text"
                placeholder={t('publications.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="publications-search-input"
              />
            </div>
          </div>

          <div className="publications-filter-group">
            <FontAwesomeIcon icon={faFilter} className="publications-filter-icon" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="publications-filter-select"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
