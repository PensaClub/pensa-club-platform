import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faImages,
  faVideo,
  faCamera,
  faPlay,
  faDownload,
  faShare,
  faHeart,
  faEye,
  faCalendarAlt,
  faMapMarkerAlt,
  faUsers,
  faQuoteLeft,
  faStar,
  faChevronLeft,
  faChevronRight,
  faTimes,
  faExpand,
  faMusic,
  faTheaterMasks,
  faPalette,
  faGift,
  faAward,
  faBirthdayCake,
  faTree
} from '@fortawesome/free-solid-svg-icons';
import './culturalGallery.css';

export const CulturalGallery = ({ club }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Mock данни за галерията
  const galleryItems = [
    {
      id: 1,
      type: 'image',
      src: 'https://picsum.photos/800/600?random=1',
      thumbnail: 'https://picsum.photos/400/300?random=1',
      title: 'Коледен концерт 2024',
      description: 'Незабравими моменти от нашия традиционен коледен концерт',
      date: '2024-12-20',
      location: 'Основна зала',
      category: 'concerts',
      views: 245,
      likes: 32
    },
    {
      id: 2,
      type: 'video',
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: 'https://picsum.photos/400/300?random=2',
      title: 'Народни танци - Демонстрация',
      description: 'Нашата танцова група показва красотата на българските народни танци',
      date: '2024-11-15',
      location: 'Танцова зала',
      category: 'workshops',
      duration: '3:45',
      views: 156,
      likes: 28
    },
    {
      id: 3,
      type: 'image',
      src: 'https://picsum.photos/800/600?random=3',
      thumbnail: 'https://picsum.photos/400/300?random=3',
      title: 'Великденски базар',
      description: 'Цветни моменти от нашия великденски базар с домашни лакомства',
      date: '2024-04-28',
      location: 'Клубна тераса',
      category: 'events',
      views: 189,
      likes: 41
    },
    {
      id: 4,
      type: 'image',
      src: 'https://picsum.photos/800/600?random=4',
      thumbnail: 'https://picsum.photos/400/300?random=4',
      title: 'Хор "Родопски звуци"',
      description: 'Репетиция на нашия любим хор преди голямо изпълнение',
      date: '2024-10-05',
      location: 'Репетиционна зала',
      category: 'concerts',
      views: 134,
      likes: 25
    },
    {
      id: 5,
      type: 'image',
      src: 'https://picsum.photos/800/600?random=5',
      thumbnail: 'https://picsum.photos/400/300?random=5',
      title: 'Творческа работилница',
      description: 'Създаваме красиви мартеници и традиционни украси',
      date: '2024-02-25',
      location: 'Творческа стая',
      category: 'workshops',
      views: 98,
      likes: 19
    },
    {
      id: 6,
      type: 'image',
      src: 'https://picsum.photos/800/600?random=6',
      thumbnail: 'https://picsum.photos/400/300?random=6',
      title: 'Екскурзия до Копривщица',
      description: 'Прекрасен ден сред българската история и традиции',
      date: '2024-09-15',
      location: 'Копривщица',
      category: 'trips',
      views: 267,
      likes: 48
    },
    {
      id: 7,
      type: 'video',
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnail: 'https://picsum.photos/400/300?random=7',
      title: 'Интервю с председателя',
      description: 'Анка Димитрова разказва за мисията и визията на клуба',
      date: '2024-08-10',
      location: 'Офис на клуба',
      category: 'interviews',
      duration: '8:20',
      views: 312,
      likes: 56
    },
    {
      id: 8,
      type: 'image',
      src: 'https://picsum.photos/800/600?random=8',
      thumbnail: 'https://picsum.photos/400/300?random=8',
      title: 'Нова година в клуба',
      description: 'Празненство, което ще помним дълго време',
      date: '2023-12-31',
      location: 'Основна зала',
      category: 'events',
      views: 423,
      likes: 73
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: "Мария Стоянова",
      age: 68,
      avatar: "https://picsum.photos/100/100?random=201",
      text: "В този клуб намерих не само хобита, но и истински приятели. Всеки ден тук е като празник!",
      rating: 5,
      memberSince: "2020"
    },
    {
      id: 2,
      name: "Георги Петков",
      age: 72,
      avatar: "https://picsum.photos/100/100?random=202",
      text: "Хорът ми дава сили и радост. Никога не съм се чувствал толкова жив и активен!",
      rating: 5,
      memberSince: "2018"
    },
    {
      id: 3,
      name: "Елена Николова",
      age: 65,
      avatar: "https://picsum.photos/100/100?random=203",
      text: "Творческите работилници развиха таланти, за които не знаех, че имам. Препоръчвам на всички!",
      rating: 5,
      memberSince: "2021"
    }
  ];

  const categories = {
    all: { label: 'Всички', icon: faImages, count: galleryItems.length },
    concerts: { label: 'Концерти', icon: faMusic, count: galleryItems.filter(item => item.category === 'concerts').length },
    events: { label: 'Събития', icon: faBirthdayCake, count: galleryItems.filter(item => item.category === 'events').length },
    workshops: { label: 'Работилници', icon: faPalette, count: galleryItems.filter(item => item.category === 'workshops').length },
    trips: { label: 'Екскурзии', icon: faMapMarkerAlt, count: galleryItems.filter(item => item.category === 'trips').length },
    interviews: { label: 'Интервюта', icon: faUsers, count: galleryItems.filter(item => item.category === 'interviews').length }
  };

  const getFilteredItems = () => {
    if (activeFilter === 'all') return galleryItems;
    return galleryItems.filter(item => item.category === activeFilter);
  };

  const handleLike = (itemId) => {
    alert(`Харесахте материала с ID: ${itemId}`);
  };

  const handleShare = (item) => {
    alert(`Споделяте: ${item.title}`);
  };

  const handleDownload = (item) => {
    alert(`Изтегляте: ${item.title}`);
  };

  const openLightbox = (item, index) => {
    setSelectedMedia(item);
    setCurrentSlide(index);
  };

  const closeLightbox = () => {
    setSelectedMedia(null);
  };

  const nextSlide = () => {
    const filteredItems = getFilteredItems();
    setCurrentSlide((prev) => (prev + 1) % filteredItems.length);
    setSelectedMedia(filteredItems[(currentSlide + 1) % filteredItems.length]);
  };

  const prevSlide = () => {
    const filteredItems = getFilteredItems();
    setCurrentSlide((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    setSelectedMedia(filteredItems[(currentSlide - 1 + filteredItems.length) % filteredItems.length]);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('bg-BG', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <section id="club-gallery" className="cultural-gallery-main-section">
      <div className="cultural-gallery-container">
        
        {/* Header */}
        <div className="cultural-gallery-header">
          <div className="cultural-gallery-badge">
            <FontAwesomeIcon icon={faImages} />
            <span>Галерия и спомени</span>
          </div>
          <h2 className="cultural-gallery-title">Нашите незабравими моменти</h2>
          <p className="cultural-gallery-subtitle">
            Разгледайте снимки и видеа от нашите събития, концерти и ежедневния живот в клуба
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="cultural-gallery-filters">
          {Object.entries(categories).map(([key, category]) => (
            <button
              key={key}
              className={`cultural-gallery-filter ${activeFilter === key ? 'active' : ''}`}
              onClick={() => setActiveFilter(key)}
            >
              <FontAwesomeIcon icon={category.icon} />
              <span>{category.label}</span>
              <span className="cultural-gallery-filter-count">({category.count})</span>
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="cultural-gallery-grid">
          {getFilteredItems().map((item, index) => (
            <div key={item.id} className="cultural-gallery-item">
              <div className="cultural-gallery-item-image" onClick={() => openLightbox(item, index)}>
                <img src={item.thumbnail} alt={item.title} />
                
                {item.type === 'video' && (
                  <div className="cultural-gallery-video-overlay">
                    <FontAwesomeIcon icon={faPlay} />
                    {item.duration && (
                      <span className="cultural-gallery-duration">{item.duration}</span>
                    )}
                  </div>
                )}
                
                <div className="cultural-gallery-item-overlay">
                  <button className="cultural-gallery-overlay-btn">
                    <FontAwesomeIcon icon={faExpand} />
                  </button>
                </div>
              </div>
              
              <div className="cultural-gallery-item-content">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                
                <div className="cultural-gallery-item-meta">
                  <div className="cultural-gallery-meta-info">
                    <span className="cultural-gallery-date">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {formatDate(item.date)}
                    </span>
                    <span className="cultural-gallery-location">
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      {item.location}
                    </span>
                  </div>
                  
                  <div className="cultural-gallery-stats">
                    <span className="cultural-gallery-stat">
                      <FontAwesomeIcon icon={faEye} />
                      {item.views}
                    </span>
                    <span className="cultural-gallery-stat">
                      <FontAwesomeIcon icon={faHeart} />
                      {item.likes}
                    </span>
                  </div>
                </div>
                
                <div className="cultural-gallery-item-actions">
                  <button 
                    className="cultural-gallery-action-btn like"
                    onClick={() => handleLike(item.id)}
                  >
                    <FontAwesomeIcon icon={faHeart} />
                  </button>
                  <button 
                    className="cultural-gallery-action-btn share"
                    onClick={() => handleShare(item)}
                  >
                    <FontAwesomeIcon icon={faShare} />
                  </button>
                  <button 
                    className="cultural-gallery-action-btn download"
                    onClick={() => handleDownload(item)}
                  >
                    <FontAwesomeIcon icon={faDownload} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div className="cultural-gallery-stats-section">
          <div className="cultural-gallery-stats-grid">
            <div className="cultural-gallery-stat-card">
              <div className="cultural-gallery-stat-icon">
                <FontAwesomeIcon icon={faImages} />
              </div>
              <div className="cultural-gallery-stat-info">
                <div className="cultural-gallery-stat-number">500+</div>
                <div className="cultural-gallery-stat-label">Снимки в архива</div>
              </div>
            </div>
            
            <div className="cultural-gallery-stat-card">
              <div className="cultural-gallery-stat-icon">
                <FontAwesomeIcon icon={faVideo} />
              </div>
              <div className="cultural-gallery-stat-info">
                <div className="cultural-gallery-stat-number">24</div>
                <div className="cultural-gallery-stat-label">Видео записи</div>
              </div>
            </div>
            
            <div className="cultural-gallery-stat-card">
              <div className="cultural-gallery-stat-icon">
                <FontAwesomeIcon icon={faCalendarAlt} />
              </div>
              <div className="cultural-gallery-stat-info">
                <div className="cultural-gallery-stat-number">48</div>
                <div className="cultural-gallery-stat-label">Документирани събития</div>
              </div>
            </div>
            
            <div className="cultural-gallery-stat-card">
              <div className="cultural-gallery-stat-icon">
                <FontAwesomeIcon icon={faEye} />
              </div>
              <div className="cultural-gallery-stat-info">
                <div className="cultural-gallery-stat-number">12K+</div>
                <div className="cultural-gallery-stat-label">Общо гледания</div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="cultural-gallery-testimonials">
          <div className="cultural-gallery-testimonials-header">
            <h3>Какво казват нашите членове</h3>
            <p>Историите на хората, които правят нашия клуб специално място</p>
          </div>
          
          <div className="cultural-gallery-testimonials-grid">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="cultural-gallery-testimonial-card">
                <div className="cultural-gallery-testimonial-quote">
                  <FontAwesomeIcon icon={faQuoteLeft} />
                </div>
                
                <div className="cultural-gallery-testimonial-content">
                  <p>"{testimonial.text}"</p>
                  
                  <div className="cultural-gallery-testimonial-rating">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FontAwesomeIcon key={i} icon={faStar} />
                    ))}
                  </div>
                </div>
                
                <div className="cultural-gallery-testimonial-author">
                  <img src={testimonial.avatar} alt={testimonial.name} />
                  <div className="cultural-gallery-author-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.age} години • Член от {testimonial.memberSince}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="cultural-gallery-cta">
          <div className="cultural-gallery-cta-content">
            <h3>Искате да сте част от следващите снимки?</h3>
            <p>Присъединете се към нашия клуб и създайте незабравими спомени заедно с нас</p>
            <div className="cultural-gallery-cta-buttons">
              <button className="cultural-gallery-cta-primary">
                <FontAwesomeIcon icon={faUsers} />
                Станете член
              </button>
              <button className="cultural-gallery-cta-secondary">
                <FontAwesomeIcon icon={faCamera} />
                Изпратете снимки
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedMedia && (
        <div className="cultural-gallery-lightbox" onClick={closeLightbox}>
          <div className="cultural-gallery-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="cultural-gallery-lightbox-close" onClick={closeLightbox}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <button className="cultural-gallery-lightbox-nav prev" onClick={prevSlide}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            
            <button className="cultural-gallery-lightbox-nav next" onClick={nextSlide}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
            
            <div className="cultural-gallery-lightbox-media">
              {selectedMedia.type === 'video' ? (
                <video controls autoPlay>
                  <source src={selectedMedia.src} type="video/mp4" />
                </video>
              ) : (
                <img src={selectedMedia.src} alt={selectedMedia.title} />
              )}
            </div>
            
            <div className="cultural-gallery-lightbox-info">
              <h3>{selectedMedia.title}</h3>
              <p>{selectedMedia.description}</p>
              <div className="cultural-gallery-lightbox-meta">
                <span>{formatDate(selectedMedia.date)}</span>
                <span>{selectedMedia.location}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CulturalGallery;