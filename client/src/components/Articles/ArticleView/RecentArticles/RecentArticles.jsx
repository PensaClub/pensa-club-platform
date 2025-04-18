import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import './recentArticles.css';
import { useArticleContext } from '../../../contexts/ArticleContext';
import { filterArticles } from '../../articleUtils/search'; 

const RecentArticles = ({ currentArticleId }) => {
  const [recentArticles, setRecentArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(true);
  const [isArticlesExpanded, setIsArticlesExpanded] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const sidebarRef = useRef(null);
  const { getAllArticles, articles, articlesLoaded } = useArticleContext();
  const [serverArticles, setServerArticles] = useState([]);

  useEffect(() => {
    const loadArticles = async () => {

      let allArticles = articles;
      
      // Ако нямаме статии в контекста, опитваме да ги заредим
      if (!articlesLoaded || articles.length === 0) {
        allArticles = await getAllArticles();
      } else {
        // console.log('RecentArticles: Използваме статии от контекста:', articles.length);
      }
      
      // Запазваме статиите от сървъра в отделна променлива
      setServerArticles(allArticles || []);
      
      if (allArticles && allArticles.length > 0) {
        // Сортираме статиите по дата (от най-нови към най-стари)
        const sortedArticles = [...allArticles].sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        
        // Филтрираме текущата статия и взимаме първите 5
        const recent = sortedArticles
          .filter(article => article.id !== Number(currentArticleId))
          .slice(0, 5);

        setRecentArticles(recent);
      } else {
        console.warn('RecentArticles: Няма налични статии за показване');
      }
    };
    
    loadArticles();
  }, [currentArticleId, articles, articlesLoaded, getAllArticles]);

  const handleSearch = (e) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      setIsSearching(false);
      return;
    }

    // Проверяваме дали имаме заредени статии от сървъра
    if (!serverArticles || serverArticles.length === 0) {
      console.warn('Няма заредени статии за търсене');
      setFilteredArticles([]);
      setIsSearching(true);
      return;
    }

    const results = filterArticles(serverArticles, searchTerm).slice(0, 5);

    setFilteredArticles(results);
    setIsSearching(true);
    setIsArticlesExpanded(true); 
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
  };

  return (
    <div className={`sidebar-widgets ${isSticky ? 'is-sticky' : ''}`} ref={sidebarRef}>
      <div className="search-widget">
        <div
          className="widget-header"
          onClick={() => setIsSearchExpanded(!isSearchExpanded)}
        >
          <h3>Търсене</h3>
          <FontAwesomeIcon icon={isSearchExpanded ? faMinus : faPlus} />
        </div>

        {isSearchExpanded && (
          <div className="search-content">
            <form onSubmit={handleSearch}>
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Търсене в публикациите..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="search-button">
                  <svg width="30px" height="30px" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g id="search">
                      <g id="search_2">
                        <path id="Combined Shape" fillRule="evenodd" clipRule="evenodd" d="M33.2768 28.9321C34.9961 26.3812 35.9996 23.3078 35.9996 19.9994C35.9996 11.1624 28.8372 3.9994 19.9996 3.9994C11.1633 3.9994 3.99957 11.1631 3.99957 19.9994C3.99957 28.837 11.1626 35.9994 19.9996 35.9994C24.8047 35.9994 29.1142 33.8826 32.0467 30.5304L41.6591 40.1427C42.0745 40.5582 42.0745 41.229 41.6591 41.6445C41.4569 41.8467 41.1888 41.9556 40.9102 41.9556C40.6297 41.9556 40.3616 41.8468 40.1593 41.6445L32.6653 34.1505C32.2748 33.76 31.6416 33.76 31.2511 34.1505C30.8605 34.541 30.8605 35.1742 31.2511 35.5647L38.7451 43.0587C39.3261 43.6398 40.1044 43.9556 40.9102 43.9556C41.7144 43.9556 42.4925 43.6395 43.0733 43.0587C44.2698 41.8622 44.2698 39.925 43.0733 38.7285L33.2768 28.9321ZM31.8319 27.4872C33.2048 25.3219 33.9996 22.7537 33.9996 19.9994C33.9996 12.267 27.7326 5.9994 19.9996 5.9994C12.2679 5.9994 5.99957 12.2677 5.99957 19.9994C5.99957 27.7324 12.2671 33.9994 19.9996 33.9994C24.2525 33.9994 28.0616 32.1044 30.6289 29.1126L28.3871 26.8707C27.9965 26.4802 27.9965 25.847 28.3871 25.4565C28.7776 25.066 29.4108 25.066 29.8013 25.4565L31.8319 27.4872ZM25.4238 28.4021C23.8214 29.4393 21.9526 29.9996 19.9992 29.9996C14.4767 29.9996 9.99917 25.5226 9.99917 19.9996C9.99917 19.4473 9.55146 18.9996 8.99917 18.9996C8.44689 18.9996 7.99917 19.4473 7.99917 19.9996C7.99917 26.6272 13.3722 31.9996 19.9992 31.9996C22.3411 31.9996 24.5867 31.3263 26.5105 30.0811C26.9742 29.781 27.1068 29.1619 26.8067 28.6982C26.5066 28.2346 25.8874 28.102 25.4238 28.4021Z" fill="black" />
                      </g>
                    </g>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="recent-articles-widget">
        <div
          className="widget-header"
          onClick={() => setIsArticlesExpanded(!isArticlesExpanded)}
        >
          <h3>
            {isSearching ? 'Резултати от търсене' : 'Последни публикации'}
            {isSearching && (
              <button className="clear-search" onClick={clearSearch}>
                Изчисти
              </button>
            )}
          </h3>
          <FontAwesomeIcon icon={isArticlesExpanded ? faMinus : faPlus} />
        </div>

        {isArticlesExpanded && (
          <div className="recent-articles-list">
            {recentArticles.length === 0 && !isSearching && (
              <div className="no-results">
                <p>Зареждане на последни публикации...</p>
              </div>
            )}
            
            {(isSearching ? filteredArticles : recentArticles).map(article => (
              <div className="recent-article-item" key={article.id}>
                <Link to={`/articles/${article.slug}`} className="recent-article-link">
                  <div className="recent-article-image">
                    <img
                      src={article.mainImage.type === 'video' ?
                        article.mainImage.thumbnail || article.mainImage.sources[0] :
                        article.mainImage.sources[0]}
                      alt={article.title}
                    />
                  </div>
                  <div className="recent-article-content">
                    <div className="article-category">
                      {article.tags && article.tags.length > 0 ?
                        article.tags[0].toUpperCase() :
                        'ДИГИТАЛНА ГРАМОТНОСТ'}
                    </div>
                    <h4 className="recent-article-title">{article.title}</h4>
                  </div>
                </Link>
              </div>
            ))}

            {isSearching && filteredArticles.length === 0 && (
              <div className="no-results">
                <p>Няма намерени резултати за "{searchTerm}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentArticles;