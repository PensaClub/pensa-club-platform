import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './usefulLinksCategory.css';

const UsefulLinksCategory = ({ selectedCategory, onCategoryChange, links = [], allCategories = [] }) => {
  const { t } = useTranslation('useful-links');

  const availableCategories = useMemo(() => {
    // Use allCategories (accumulated across all pages) if available,
    // otherwise derive from current links
    const cats = allCategories.length > 0
      ? allCategories
      : [...new Set(links.map(link => link.category).filter(Boolean))];
    return cats.sort();
  }, [links, allCategories]);

  if (links.length === 0 && availableCategories.length === 0) return null;

  const getCategoryLabel = (cat) => {
    const translated = t(`categories.${cat}`, { defaultValue: '' });
    if (translated && translated !== `categories.${cat}` && translated !== '') return translated;
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  return (
    <div className="ulcat-wrapper">
      <div className="ulcat-scroll">
        <button
          className={`ulcat-chip ${!selectedCategory ? 'ulcat-chip-active' : ''}`}
          onClick={() => onCategoryChange(null)}
        >
          {t('page.allCategories')}
        </button>
        {availableCategories.map(cat => (
          <button
            key={cat}
            className={`ulcat-chip ulcat-chip-${cat} ${selectedCategory === cat ? 'ulcat-chip-active' : ''}`}
            onClick={() => onCategoryChange(cat)}
          >
            {getCategoryLabel(cat)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UsefulLinksCategory;
