import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useForum } from '../../contexts/ForumProvider';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { Search, X, Loader2 } from 'lucide-react';
import './forumSearch.css';

const ForumSearch = () => {
  const { t } = useTranslation('forum');
  const { searchPosts } = useForum();
  const navigate = useLocalizedNavigate();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef(null);

  const handleSearch = useCallback((q) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchPosts({ q: q.trim(), limit: 8 });
        setResults(data.results || []);
        setShowResults(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, [searchPosts]);

  const handleSelect = (slug) => {
    navigate(`/academy/community/post/${slug}`);
    setShowResults(false);
    setQuery('');
  };

  return (
    <div className="fsr-container">
      <div className="fsr-input-wrap">
        <Search size={15} className="fsr-icon" />
        <input
          className="fsr-input"
          type="text"
          placeholder={t('forumCommunity.search.placeholder', 'Търсене във форума...')}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
        />
        {searching && <Loader2 size={14} className="fsr-spinner" />}
        {query && !searching && (
          <button className="fsr-clear" onClick={() => { setQuery(''); setResults([]); setShowResults(false); }}>
            <X size={14} />
          </button>
        )}
      </div>

      {showResults && (
        <div className="fsr-dropdown">
          {results.length === 0 ? (
            <div className="fsr-no-results">Няма резултати</div>
          ) : (
            results.map(post => (
              <button key={post.id} className="fsr-result" onClick={() => handleSelect(post.slug)}>
                <span className="fsr-result-title">{post.title}</span>
                <span className="fsr-result-excerpt">{post.excerpt?.substring(0, 80)}</span>
              </button>
            ))
          )}
        </div>
      )}

      {showResults && <div className="fsr-backdrop" onClick={() => setShowResults(false)} />}
    </div>
  );
};

export default ForumSearch;
