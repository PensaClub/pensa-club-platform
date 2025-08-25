import React, { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faPlus,
  faMinus,
  faEdit,
  faTrash,
  faCheck,
  faTimes,
  faInfoCircle,
  faClock,
  faUsers,
  faEuroSign,
  faMapMarkerAlt,
  faUser,
  faTools,
  faStar,
  faGraduationCap,
  faHeart,
  faDumbbell,
  faPalette,
  faMusic,
  faTheaterMasks,
  faBook,
  faGamepad,
  faHandHoldingHeart,
  faSpinner,
  faCalendarCheck,
  faCalendarDay,
  faCalendarWeek,
  faRepeat,
  faRoute,
  faImages,
  faVideo,
  faUpload,
  faEye,
  faCopy,
  faExternalLinkAlt,
  faCloudUploadAlt,
  faImage,
  faFileVideo
} from '@fortawesome/free-solid-svg-icons';
import { useFirebaseUpload } from '../../../hooks/useFirebaseUpload';
import './activitiesManager.css';

const ActivitiesManager = ({
  activitiesData,
  onActivitiesChange,
  disabled = false
}) => {
  const { t } = useTranslation();
  const { uploadFile, uploadMultipleFiles, uploading, uploadProgress } = useFirebaseUpload();

  const [activeTab, setActiveTab] = useState('regular');
  const [editingActivity, setEditingActivity] = useState(null);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // New activity states for each type
  const [newRegularActivity, setNewRegularActivity] = useState({
    name: '',
    description: '',
    type: 'regular',
    category: 'general',
    schedule: {
      frequency: 'weekly',
      dayOfWeek: 1,
      startTime: '09:00',
      duration: 60
    },
    ageGroup: { min: 18, max: 100 },
    capacity: { min: 1, max: 20 },
    fee: { amount: 0, period: 'session', required: false },
    instructor: '',
    requirements: '',
    equipment: []
  });
console.log("newRegularActivity", newRegularActivity);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '10:00',
    type: 'cultural',
    participants: 0,
    description: '',
    location: '',
    organizer: '',
    highlights: [],
    featured: false,
    price: '',
    images: [],
    videos: []
  });

  const [newTrip, setNewTrip] = useState({
    destination: '',
    date: '',
    participants: 0,
    price: 0,
    description: ''
  });

  const [newCourse, setNewCourse] = useState({
    name: '',
    duration: '4 седмици',
    participants: 0,
    instructor: '',
    description: ''
  });

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Activity tabs
  const activityTabs = [
    { id: 'regular', label: t('clubForm.activities.tabs.regular'), icon: faRepeat },
    { id: 'events', label: t('clubForm.activities.tabs.events'), icon: faCalendarCheck },
    { id: 'trips', label: t('clubForm.activities.tabs.trips'), icon: faRoute },
    { id: 'courses', label: t('clubForm.activities.tabs.courses'), icon: faGraduationCap }
  ];
  // Activity categories
  const activityCategories = [
    { value: 'general', label: 'Общи' },
    { value: 'cultural', label: 'Културни' },
    { value: 'sports', label: 'Спортни' },
    { value: 'educational', label: 'Образователни' },
    { value: 'social', label: 'Социални' },
    { value: 'entertainment', label: 'Развлекателни' },
    { value: 'music', label: 'Музикални' },
    { value: 'arts', label: 'Изкуства' },
    { value: 'charity', label: 'Благотворителни' }
  ];

  // Frequency options
  const frequencyOptions = [
    { value: 'daily', label: 'Ежедневно' },
    { value: 'weekly', label: 'Седмично' },
    { value: 'biweekly', label: 'На две седмици' },
    { value: 'monthly', label: 'Месечно' },
    { value: 'onetime', label: 'Еднократно' }
  ];

  // Fee periods
  const feePeriods = [
    { value: 'session', label: 'На сесия' },
    { value: 'monthly', label: 'Месечно' },
    { value: 'package', label: 'На пакет' },
    { value: 'annual', label: 'Годишно' }
  ];

  // Equipment options
  const equipmentOptions = [
    'Столове', 'Маси', 'Проектор', 'Компютър', 'Звукова система',
    'Микрофон', 'Спортно оборудване', 'Хартия и химикали',
    'Музикални инструменти', 'Художествени материали', 'Кухненски принадлежности',
    'Постелки за йога', 'Танцови килими'
  ];
  // Days of week for regular activities
  const daysOfWeek = [
    { value: 1, label: 'понеделник' },
    { value: 2, label: 'вторник' },
    { value: 3, label: 'сряда' },
    { value: 4, label: 'четвъртък' },
    { value: 5, label: 'петък' },
    { value: 6, label: 'събота' },
    { value: 0, label: 'неделя' }
  ];

  // Event types
  const eventTypes = [
    { value: 'cultural', label: t('clubForm.activities.eventTypes.cultural') },
    { value: 'traditional', label: t('clubForm.activities.eventTypes.traditional') },
    { value: 'social', label: t('clubForm.activities.eventTypes.social') },
    { value: 'charity', label: t('clubForm.activities.eventTypes.charity') },
    { value: 'community', label: t('clubForm.activities.eventTypes.community') },
    { value: 'sports_competition', label: t('clubForm.activities.eventTypes.sportsCompetition') },
    { value: 'wellness_event', label: t('clubForm.activities.eventTypes.wellnessEvent') },
    { value: 'sports_festival', label: t('clubForm.activities.eventTypes.sportsFestival') },
    { value: 'swimming_competition', label: t('clubForm.activities.eventTypes.swimmingCompetition') }
  ];

  // Course duration options
  const courseDurations = [
    '2 седмици', '4 седмици', '6 седмици', '8 седмици', '2 месеца', '3 месеца',
    '6 месеца', '10 часа', '20 часа', '40 часа'
  ];

  // Handle field changes for different activity types
  const handleRegularActivityChange = (field, value) => {
    if (field.includes('.')) {
      const keys = field.split('.');
      setNewRegularActivity(prev => {
        const updated = { ...prev };
        let current = updated;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return updated;
      });
    } else {
      setNewRegularActivity(prev => ({ ...prev, [field]: value }));
    }
  };
  // Toggle equipment
  const toggleEquipment = (equipment) => {
    const currentEquipment = newRegularActivity.equipment || [];
    const updatedEquipment = currentEquipment.includes(equipment)
      ? currentEquipment.filter(e => e !== equipment)
      : [...currentEquipment, equipment];

    handleRegularActivityChange('equipment', updatedEquipment);
  };
  const handleEventChange = (field, value) => {
    setNewEvent(prev => ({ ...prev, [field]: value }));
  };

  const handleTripChange = (field, value) => {
    setNewTrip(prev => ({ ...prev, [field]: value }));
  };

  const handleCourseChange = (field, value) => {
    setNewCourse(prev => ({ ...prev, [field]: value }));
  };

  // Handle highlights for events
  const addHighlight = () => {
    const highlight = prompt(t('clubForm.activities.prompts.addHighlight'));
    if (highlight && highlight.trim()) {
      setNewEvent(prev => ({
        ...prev,
        highlights: [...prev.highlights, highlight.trim()]
      }));
    }
  };

  const removeHighlight = (index) => {
    setNewEvent(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  // Media upload functions
  const handleImageUpload = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    try {
      const uploadedImages = await uploadMultipleFiles(files, 'activities/events/images');

      const newImages = uploadedImages.map(upload => ({
        src: upload.url,
        alt: upload.name,
        caption: '',
        isMain: newEvent.images.length === 0
      }));

      setNewEvent(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));

    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Image upload failed. Please try again.');
    }
  }, [uploadMultipleFiles, newEvent.images.length]);

  const handleVideoUpload = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    try {
      const uploadedVideos = await uploadMultipleFiles(files, 'activities/events/videos');

      const newVideos = uploadedVideos.map(upload => {
        // Generate thumbnail URL (placeholder for now)
        const thumbnail = upload.url.replace(/\.[^/.]+$/, '_thumb.jpg');

        return {
          src: upload.url,
          alt: upload.name,
          caption: '',
          duration: '00:00',
          thumbnail: upload.url // Use video URL as thumbnail for now
        };
      });

      setNewEvent(prev => ({
        ...prev,
        videos: [...prev.videos, ...newVideos]
      }));

    } catch (error) {
      console.error('Error uploading videos:', error);
      alert('Video upload failed. Please try again.');
    }
  }, [uploadMultipleFiles]);

  // Remove media functions
  const removeImage = (index) => {
    setNewEvent(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeVideo = (index) => {
    setNewEvent(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  const setMainImage = (index) => {
    setNewEvent(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isMain: i === index
      }))
    }));
  };

  // Update image/video captions
  const updateImageCaption = (index, caption) => {
    setNewEvent(prev => ({
      ...prev,
      images: prev.images.map((img, i) =>
        i === index ? { ...img, caption } : img
      )
    }));
  };

  const updateVideoCaption = (index, caption) => {
    setNewEvent(prev => ({
      ...prev,
      videos: prev.videos.map((vid, i) =>
        i === index ? { ...vid, caption } : vid
      )
    }));
  };

  const updateVideoDuration = (index, duration) => {
    setNewEvent(prev => ({
      ...prev,
      videos: prev.videos.map((vid, i) =>
        i === index ? { ...vid, duration } : vid
      )
    }));
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e, type) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);

    if (type === 'image') {
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        handleImageUpload(imageFiles);
      }
    } else if (type === 'video') {
      const videoFiles = files.filter(file => file.type.startsWith('video/'));
      if (videoFiles.length > 0) {
        handleVideoUpload(videoFiles);
      }
    }
  }, [handleImageUpload, handleVideoUpload]);

  // Add activities functions
  const addRegularActivity = () => {
    if (!newRegularActivity.name.trim()) return;

    const currentRegular = activitiesData?.regular || [];
    const updatedRegular = [...currentRegular, {
      ...newRegularActivity,
      id: `regular_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }];

    onActivitiesChange('regular', updatedRegular);

    // Reset form
    setNewRegularActivity({
      name: '',
      description: '',
      type: 'regular',
      category: 'general',
      schedule: {
        frequency: 'weekly',
        dayOfWeek: 1,
        startTime: '09:00',
        duration: 60
      },
      ageGroup: { min: 18, max: 100 },
      capacity: { min: 1, max: 20 },
      fee: { amount: 0, period: 'session', required: false },
      instructor: '',
      requirements: '',
      equipment: []
    });
  };

  const addEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date) return;

    const currentEvents = activitiesData?.events || [];
    const updatedEvents = [...currentEvents, {
      ...newEvent,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }];

    onActivitiesChange('events', updatedEvents);
    setNewEvent({
      title: '',
      date: '',
      time: '10:00',
      type: 'cultural',
      participants: 0,
      description: '',
      location: '',
      organizer: '',
      highlights: [],
      featured: false,
      price: '',
      images: [],
      videos: []
    });
  };

  const addTrip = () => {
    if (!newTrip.destination.trim() || !newTrip.date) return;

    const currentTrips = activitiesData?.trips || [];
    const updatedTrips = [...currentTrips, { ...newTrip }];

    onActivitiesChange('trips', updatedTrips);
    setNewTrip({
      destination: '',
      date: '',
      participants: 0,
      price: 0,
      description: ''
    });
  };

  const addCourse = () => {
    if (!newCourse.name.trim()) return;

    const currentCourses = activitiesData?.courses || [];
    const updatedCourses = [...currentCourses, { ...newCourse }];

    onActivitiesChange('courses', updatedCourses);
    setNewCourse({
      name: '',
      duration: '4 седмици',
      participants: 0,
      instructor: '',
      description: ''
    });
  };

  // Remove activities functions
  const removeActivity = (type, index) => {
    const currentActivities = activitiesData?.[type] || [];
    const updatedActivities = currentActivities.filter((_, i) => i !== index);
    onActivitiesChange(type, updatedActivities);
  };

  // Render upload area for event media
  const renderMediaUploadArea = (type) => {
    return (
      <div
        className={`media-upload-zone ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, type)}
        onClick={() => {
          if (type === 'image') imageInputRef.current?.click();
          else if (type === 'video') videoInputRef.current?.click();
        }}
      >
        <div className="upload-content">
          <div className="upload-icon">
            {uploading ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={type === 'image' ? faImage : faVideo} />
            )}
          </div>
          <h5>
            {type === 'image' ? t('clubForm.activities.uploadImages') : t('clubForm.activities.uploadVideos')}
          </h5>
          <p>
            {type === 'image' ? 'PNG, JPG up to 10MB each' : 'MP4, WebM up to 100MB each'}
          </p>
        </div>

        <input
          ref={type === 'image' ? imageInputRef : videoInputRef}
          type="file"
          multiple
          accept={type === 'image' ? 'image/*' : 'video/*'}
          onChange={(e) => {
            const files = Array.from(e.target.files);
            if (type === 'image') {
              handleImageUpload(files);
            } else if (type === 'video') {
              handleVideoUpload(files);
            }
            e.target.value = '';
          }}
          disabled={disabled || uploading}
          style={{ display: 'none' }}
        />
      </div>
    );
  };

  // Render media grid
  const renderMediaGrid = (mediaType) => {
    const media = mediaType === 'images' ? newEvent.images : newEvent.videos;

    if (media.length === 0) return null;

    return (
      <div className="media-grid">
        {media.map((item, index) => (
          <div key={index} className={`media-item ${item.isMain ? 'main' : ''}`}>
            {mediaType === 'images' ? (
              <img src={item.src} alt={item.alt} className="media-preview" />
            ) : (
              <div className="video-preview">
                <video src={item.src} className="media-preview" />
                <div className="video-overlay">
                  <FontAwesomeIcon icon={faVideo} />
                </div>
              </div>
            )}

            <div className="media-overlay">
              <button
                className="action-btn preview"
                onClick={() => setPreviewMedia({ url: item.src, type: mediaType.slice(0, -1) })}
              >
                <FontAwesomeIcon icon={faEye} />
              </button>

              {mediaType === 'images' && (
                <button
                  className={`action-btn main ${item.isMain ? 'active' : ''}`}
                  onClick={() => setMainImage(index)}
                  title={t('clubForm.activities.setMainImage')}
                >
                  <FontAwesomeIcon icon={faStar} />
                </button>
              )}

              <button
                className="action-btn delete"
                onClick={() => mediaType === 'images' ? removeImage(index) : removeVideo(index)}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>

            <div className="media-info">
              <input
                type="text"
                placeholder={mediaType === 'images' ? t('clubForm.activities.imageCaption') : t('clubForm.activities.videoCaption')}
                value={item.caption}
                onChange={(e) =>
                  mediaType === 'images'
                    ? updateImageCaption(index, e.target.value)
                    : updateVideoCaption(index, e.target.value)
                }
                className="caption-input"
              />

              {mediaType === 'videos' && (
                <input
                  type="text"
                  placeholder="Duration (mm:ss)"
                  value={item.duration}
                  onChange={(e) => updateVideoDuration(index, e.target.value)}
                  className="duration-input"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="activities-manager">

      {/* Header */}
      <div className="activities-manager-header">
        <h3 className="activities-manager-title">
          <FontAwesomeIcon icon={faCalendarAlt} />
          {t('clubForm.activities.title')}
        </h3>
        <p className="activities-manager-subtitle">
          {t('clubForm.activities.subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className="activities-tabs">
        {activityTabs.map(tab => (
          <button
            key={tab.id}
            className={`activities-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            disabled={disabled}
          >
            <FontAwesomeIcon icon={tab.icon} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="activities-content">

        {/* Regular Activities Tab */}
        {activeTab === 'regular' && (
          <div className="tab-content">
            <div className="section-header">
              <h4>Редовни дейности</h4>
              <p>Седмични и повтарящи се клубни активности</p>
            </div>

            {/* Current Regular Activities */}
            {(activitiesData?.regular?.length > 0) && (
              <div className="activities-mgr-regular-list">
                {activitiesData.regular.map((activity, index) => (
                  <div key={activity.id || index} className="activities-mgr-regular-card">
                    <div className="activities-mgr-regular-header">
                      <div className="activities-mgr-regular-title-section">
                        <h5 className="activities-mgr-regular-name">{activity.name}</h5>
                        <span className="activities-mgr-regular-category-badge">
                          {activityCategories.find(c => c.value === activity.category)?.label || activity.category}
                        </span>
                      </div>
                      <button
                        className="activities-mgr-regular-delete-btn"
                        onClick={() => removeActivity('regular', index)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>

                    <div className="activities-mgr-regular-meta">
                      <span className="activities-mgr-regular-meta-item">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        {frequencyOptions.find(f => f.value === activity.schedule?.frequency)?.label || 'Седмично'}
                        {activity.schedule?.frequency !== 'onetime' && activity.schedule?.dayOfWeek !== undefined && (
                          <> - {daysOfWeek.find(d => d.value === activity.schedule?.dayOfWeek)?.label}</>
                        )}
                      </span>

                      {activity.schedule?.startTime && (
                        <span className="activities-mgr-regular-meta-item">
                          <FontAwesomeIcon icon={faClock} />
                          {activity.schedule.startTime} ({activity.schedule.duration || 60} мин)
                        </span>
                      )}

                      <span className="activities-mgr-regular-meta-item">
                        <FontAwesomeIcon icon={faUsers} />
                        Възраст: {activity.ageGroup?.min || 18}-{activity.ageGroup?.max || 100} г.
                      </span>

                      <span className="activities-mgr-regular-meta-item">
                        <FontAwesomeIcon icon={faUsers} />
                        Капацитет: {activity.capacity?.min || 1}-{activity.capacity?.max || 20} души
                      </span>

                      {activity.instructor && (
                        <span className="activities-mgr-regular-meta-item">
                          <FontAwesomeIcon icon={faUser} /> {activity.instructor}
                        </span>
                      )}

                      {activity.fee?.required && (
                        <span className="activities-mgr-regular-meta-item activities-mgr-regular-fee">
                          <FontAwesomeIcon icon={faEuroSign} />
                          {activity.fee.amount} лв. / {feePeriods.find(p => p.value === activity.fee.period)?.label}
                        </span>
                      )}
                    </div>

                    {activity.description && (
                      <p className="activities-mgr-regular-description">{activity.description}</p>
                    )}

                    {activity.requirements && (
                      <div className="activities-mgr-regular-requirements">
                        <strong>Изисквания:</strong> {activity.requirements}
                      </div>
                    )}

                    {activity.equipment && activity.equipment.length > 0 && (
                      <div className="activities-mgr-regular-equipment">
                        <strong>Оборудване:</strong> {activity.equipment.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {/* Add Regular Activity Form */}
            <div className="activities-mgr-add-form">
              <h5 className="activities-mgr-add-form-title">Добави редовна дейност</h5>

              {/* Basic Info */}
              <div className="activities-mgr-form-row">
                <div className="activities-mgr-form-group">
                  <label>Име на дейността</label>
                  <input
                    type="text"
                    value={newRegularActivity.name}
                    onChange={(e) => handleRegularActivityChange('name', e.target.value)}
                    placeholder="Име на дейността"
                  />
                </div>

                <div className="activities-mgr-form-group">
                  <label>Тип</label>
                  <select
                    value={newRegularActivity.type}
                    onChange={(e) => handleRegularActivityChange('type', e.target.value)}
                  >
                    <option value="regular">Редовна</option>
                    <option value="seasonal">Сезонна</option>
                    <option value="workshop">Семинар</option>
                  </select>
                </div>

                <div className="activities-mgr-form-group">
                  <label>Категория</label>
                  <select
                    value={newRegularActivity.category}
                    onChange={(e) => handleRegularActivityChange('category', e.target.value)}
                  >
                    {activityCategories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="activities-mgr-form-group">
                <label>Описание</label>
                <textarea
                  value={newRegularActivity.description}
                  onChange={(e) => handleRegularActivityChange('description', e.target.value)}
                  placeholder="Описание на дейността"
                  rows={3}
                />
              </div>

              {/* Schedule Section */}
              <div className="activities-mgr-schedule-section">
                <h6><FontAwesomeIcon icon={faClock} /> График</h6>

                <div className="activities-mgr-form-row">
                  <div className="activities-mgr-form-group">
                    <label>Честота</label>
                    <select
                      value={newRegularActivity.schedule.frequency}
                      onChange={(e) => handleRegularActivityChange('schedule.frequency', e.target.value)}
                    >
                      {frequencyOptions.map(freq => (
                        <option key={freq.value} value={freq.value}>{freq.label}</option>
                      ))}
                    </select>
                  </div>

                  {newRegularActivity.schedule.frequency !== 'onetime' && (
                    <>
                      <div className="activities-mgr-form-group">
                        <label>Ден от седмицата</label>
                        <select
                          value={newRegularActivity.schedule.dayOfWeek}
                          onChange={(e) => handleRegularActivityChange('schedule.dayOfWeek', parseInt(e.target.value))}
                        >
                          {daysOfWeek.map(day => (
                            <option key={day.value} value={day.value}>{day.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="activities-mgr-form-group">
                        <label>Начален час</label>
                        <input
                          type="time"
                          value={newRegularActivity.schedule.startTime}
                          onChange={(e) => handleRegularActivityChange('schedule.startTime', e.target.value)}
                        />
                      </div>

                      <div className="activities-mgr-form-group">
                        <label>Продължителност (мин)</label>
                        <input
                          type="number"
                          value={newRegularActivity.schedule.duration}
                          onChange={(e) => handleRegularActivityChange('schedule.duration', parseInt(e.target.value) || 60)}
                          min="15"
                          max="480"
                          placeholder="60"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Participants Section */}
              <div className="activities-mgr-participants-section">
                <h6><FontAwesomeIcon icon={faUsers} /> Участници</h6>

                <div className="activities-mgr-form-row">
                  <div className="activities-mgr-form-group">
                    <label>Минимална възраст</label>
                    <input
                      type="number"
                      value={newRegularActivity.ageGroup.min}
                      onChange={(e) => handleRegularActivityChange('ageGroup.min', parseInt(e.target.value) || 18)}
                      min="0"
                      max="100"
                      placeholder="18"
                    />
                  </div>

                  <div className="activities-mgr-form-group">
                    <label>Максимална възраст</label>
                    <input
                      type="number"
                      value={newRegularActivity.ageGroup.max}
                      onChange={(e) => handleRegularActivityChange('ageGroup.max', parseInt(e.target.value) || 100)}
                      min="0"
                      max="100"
                      placeholder="100"
                    />
                  </div>

                  <div className="activities-mgr-form-group">
                    <label>Минимален брой участници</label>
                    <input
                      type="number"
                      value={newRegularActivity.capacity.min}
                      onChange={(e) => handleRegularActivityChange('capacity.min', parseInt(e.target.value) || 1)}
                      min="1"
                      placeholder="1"
                    />
                  </div>

                  <div className="activities-mgr-form-group">
                    <label>Максимален брой участници</label>
                    <input
                      type="number"
                      value={newRegularActivity.capacity.max}
                      onChange={(e) => handleRegularActivityChange('capacity.max', parseInt(e.target.value) || 20)}
                      min="1"
                      placeholder="20"
                    />
                  </div>
                </div>
              </div>

              {/* Fee Section */}
              <div className="activities-mgr-fee-section">
                <h6><FontAwesomeIcon icon={faEuroSign} /> Такса</h6>

                <div className="activities-mgr-fee-toggle">
                  <label className="activities-mgr-checkbox-label">
                    <input
                      type="checkbox"
                      checked={newRegularActivity.fee.required}
                      onChange={(e) => handleRegularActivityChange('fee.required', e.target.checked)}
                    />
                    <span className="activities-mgr-checkbox"></span>
                    Има такса за участие
                  </label>
                </div>

                {newRegularActivity.fee.required && (
                  <div className="activities-mgr-form-row">
                    <div className="activities-mgr-form-group">
                      <label>Сума (лв.)</label>
                      <input
                        type="number"
                        value={newRegularActivity.fee.amount}
                        onChange={(e) => handleRegularActivityChange('fee.amount', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        placeholder="0"
                      />
                    </div>

                    <div className="activities-mgr-form-group">
                      <label>Период</label>
                      <select
                        value={newRegularActivity.fee.period}
                        onChange={(e) => handleRegularActivityChange('fee.period', e.target.value)}
                      >
                        {feePeriods.map(period => (
                          <option key={period.value} value={period.value}>
                            {period.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="activities-mgr-additional-section">
                <h6><FontAwesomeIcon icon={faInfoCircle} /> Допълнителна информация</h6>

                <div className="activities-mgr-form-row">
                  <div className="activities-mgr-form-group">
                    <label>Инструктор</label>
                    <input
                      type="text"
                      value={newRegularActivity.instructor}
                      onChange={(e) => handleRegularActivityChange('instructor', e.target.value)}
                      placeholder="Име на инструктора"
                    />
                  </div>
                </div>

                <div className="activities-mgr-form-group">
                  <label>Изисквания</label>
                  <textarea
                    value={newRegularActivity.requirements}
                    onChange={(e) => handleRegularActivityChange('requirements', e.target.value)}
                    placeholder="Специални изисквания или препоръки"
                    rows={2}
                  />
                </div>

                {/* Equipment */}
                <div className="activities-mgr-equipment">
                  <label className="activities-mgr-form-label">
                    <FontAwesomeIcon icon={faTools} />
                    Необходимо оборудване
                  </label>
                  <div className="activities-mgr-equipment-grid">
                    {equipmentOptions.map(equipment => (
                      <label
                        key={equipment}
                        className="activities-mgr-equipment-item"
                      >
                        <input
                          type="checkbox"
                          checked={newRegularActivity.equipment.includes(equipment)}
                          onChange={() => toggleEquipment(equipment)}
                          disabled={disabled}
                        />
                        <span className="activities-mgr-equipment-checkbox"></span>
                        <span className="activities-mgr-equipment-label">{equipment}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="add-btn"
                onClick={addRegularActivity}
                disabled={!newRegularActivity.name.trim()}
              >
                <FontAwesomeIcon icon={faPlus} />
                Добави дейност
              </button>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="activities-mgr-tab-content">
            <div className="activities-mgr-section-header">
              <h4>{t('clubForm.activities.events')}</h4>
              <p>{t('clubForm.activities.eventsDesc')}</p>
            </div>

            {/* Current Events */}
            {(activitiesData?.events?.length > 0) && (
              <div className="activities-mgr-events-list">
                {activitiesData.events.map((event, index) => (
                  <div key={event.id || index} className="activities-mgr-event-item">
                    <div className="activities-mgr-event-header">
                      <h5 className="activities-mgr-event-title">
                        {event.title}
                        {event.featured && <FontAwesomeIcon icon={faStar} className="activities-mgr-featured-icon" />}
                      </h5>
                      <button
                        className="activities-mgr-remove-btn"
                        onClick={() => removeActivity('events', index)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>

                    <div className="activities-mgr-event-details">
                      <span className="activities-mgr-detail-item"><FontAwesomeIcon icon={faCalendarAlt} /> {event.date}</span>
                      <span className="activities-mgr-detail-item"><FontAwesomeIcon icon={faClock} /> {event.time}</span>
                      <span className="activities-mgr-detail-item"><FontAwesomeIcon icon={faUsers} /> {event.participants}</span>
                      {event.location && <span className="activities-mgr-detail-item"><FontAwesomeIcon icon={faMapMarkerAlt} /> {event.location}</span>}
                      {event.price && <span className="activities-mgr-detail-item"><FontAwesomeIcon icon={faEuroSign} /> {event.price}</span>}
                    </div>

                    {event.highlights && event.highlights.length > 0 && (
                      <div className="activities-mgr-event-highlights">
                        {event.highlights.map((highlight, i) => (
                          <span key={i} className="activities-mgr-highlight-tag">{highlight}</span>
                        ))}
                      </div>
                    )}

                    {event.description && (
                      <p className="activities-mgr-event-description">{event.description}</p>
                    )}

                    {/* Event Media Preview */}
                    {(event.images?.length > 0 || event.videos?.length > 0) && (
                      <div className="activities-mgr-event-media-preview">
                        {event.images?.slice(0, 3).map((img, i) => (
                          <img key={i} src={img.src} alt={img.alt} className="activities-mgr-media-thumb" />
                        ))}
                        {event.videos?.slice(0, 2).map((vid, i) => (
                          <div key={i} className="activities-mgr-video-thumb">
                            <FontAwesomeIcon icon={faVideo} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add Event Form */}
            <div className="activities-mgr-add-form activities-mgr-event-form">
              <h5 className="activities-mgr-add-form-title">{t('clubForm.activities.addEvent')}</h5>

              {/* Basic Event Info */}
              <div className="activities-mgr-form-row">
                <div className="activities-mgr-form-group">
                  <label>{t('clubForm.activities.fields.title')}</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => handleEventChange('title', e.target.value)}
                    placeholder={t('clubForm.activities.placeholders.eventTitle')}
                  />
                </div>

                <div className="activities-mgr-form-group">
                  <label>{t('clubForm.activities.fields.date')}</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => handleEventChange('date', e.target.value)}
                  />
                </div>

                <div className="activities-mgr-form-group">
                  <label>{t('clubForm.activities.fields.time')}</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => handleEventChange('time', e.target.value)}
                  />
                </div>
              </div>

              <div className="activities-mgr-form-row">
                <div className="activities-mgr-form-group">
                  <label>{t('clubForm.activities.fields.type')}</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => handleEventChange('type', e.target.value)}
                  >
                    {eventTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="activities-mgr-form-group">
                  <label>{t('clubForm.activities.fields.participants')}</label>
                  <input
                    type="number"
                    value={newEvent.participants}
                    onChange={(e) => handleEventChange('participants', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>

                <div className="activities-mgr-form-group">
                  <label>{t('clubForm.activities.fields.price')}</label>
                  <input
                    type="text"
                    value={newEvent.price}
                    onChange={(e) => handleEventChange('price', e.target.value)}
                    placeholder="Безплатно / 10 лв."
                  />
                </div>
              </div>

              <div className="activities-mgr-form-row">
                <div className="activities-mgr-form-group">
                  <label>{t('clubForm.activities.fields.location')}</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => handleEventChange('location', e.target.value)}
                    placeholder={t('clubForm.activities.placeholders.location')}
                  />
                </div>

                <div className="activities-mgr-form-group">
                  <label>{t('clubForm.activities.fields.organizer')}</label>
                  <input
                    type="text"
                    value={newEvent.organizer}
                    onChange={(e) => handleEventChange('organizer', e.target.value)}
                    placeholder={t('clubForm.activities.placeholders.organizer')}
                  />
                </div>
              </div>

              <div className="activities-mgr-form-group">
                <label>{t('clubForm.activities.fields.description')}</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => handleEventChange('description', e.target.value)}
                  placeholder={t('clubForm.activities.placeholders.eventDescription')}
                  rows={4}
                />
              </div>

              {/* Event Highlights */}
              <div className="activities-mgr-form-group">
                <label>{t('clubForm.activities.fields.highlights')}</label>
                <div className="activities-mgr-highlights-section">
                  <div className="activities-mgr-highlights-list">
                    {newEvent.highlights.map((highlight, index) => (
                      <span key={index} className="activities-mgr-highlight-tag">
                        {highlight}
                        <button
                          type="button"
                          onClick={() => removeHighlight(index)}
                          className="activities-mgr-remove-highlight"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <button type="button" onClick={addHighlight} className="activities-mgr-add-highlight-btn">
                    <FontAwesomeIcon icon={faPlus} />
                    {t('clubForm.activities.addHighlight')}
                  </button>
                </div>
              </div>

              {/* Featured Toggle */}
              <div className="activities-mgr-form-group">
                <label className="activities-mgr-checkbox-label">
                  <input
                    type="checkbox"
                    checked={newEvent.featured}
                    onChange={(e) => handleEventChange('featured', e.target.checked)}
                  />
                  <span className="activities-mgr-checkbox"></span>
                  {t('clubForm.activities.fields.featured')}
                </label>
              </div>

              {/* Event Media Upload */}
              <div className="activities-mgr-media-upload-section">
                <h6 className="activities-mgr-media-section-title">{t('clubForm.activities.eventMedia')}</h6>

                {/* Images Upload */}
                <div className="activities-mgr-media-upload-group">
                  <label>{t('clubForm.activities.eventImages')}</label>
                  {renderMediaUploadArea('image')}
                  {renderMediaGrid('images')}
                </div>

                {/* Videos Upload */}
                <div className="activities-mgr-media-upload-group">
                  <label>{t('clubForm.activities.eventVideos')}</label>
                  {renderMediaUploadArea('video')}
                  {renderMediaGrid('videos')}
                </div>
              </div>

              <button
                type="button"
                className="activities-mgr-add-btn"
                onClick={addEvent}
                disabled={!newEvent.title.trim() || !newEvent.date}
              >
                <FontAwesomeIcon icon={faPlus} />
                {t('clubForm.activities.actions.addEvent')}
              </button>
            </div>
          </div>
        )}

        {/* Trips Tab */}
        {activeTab === 'trips' && (
          <div className="activities-mgr-tab-content">
            <div className="activities-mgr-section-header">
              <h4>{t('clubForm.activities.trips')}</h4>
              <p>{t('clubForm.activities.tripsDesc')}</p>
            </div>

            {/* Current Trips */}
            {(activitiesData?.trips?.length > 0) && (
              <div className="activities-mgr-trips-list">
                {activitiesData.trips.map((trip, index) => (
                  <div key={index} className="activities-mgr-trip-item">
                    <div className="activities-mgr-trip-header">
                      <h5 className="activities-mgr-trip-title">{trip.destination}</h5>
                      <button
                        className="activities-mgr-remove-btn"
                        onClick={() => removeActivity('trips', index)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                    <div className="activities-mgr-trip-details">
                      <span className="activities-mgr-detail-item"><FontAwesomeIcon icon={faCalendarAlt} /> {trip.date}</span>
                      <span className="activities-mgr-detail-item"><FontAwesomeIcon icon={faUsers} /> {trip.participants}</span>
                      <span className="activities-mgr-detail-item"><FontAwesomeIcon icon={faEuroSign} /> {trip.price} лв.</span>
                    </div>
                    {trip.description && (
                      <p className="activities-mgr-trip-description">{trip.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add Trip Form */}
            <div className="activities-mgr-add-form">
              <h5 className="activities-mgr-add-form-title">{t('clubForm.activities.addTrip')}</h5>

              <div className="activities-mgr-form-row">
                <div className="activities-mgr-form-group">
                  <label>{t('clubForm.activities.fields.destination')}</label>
                  <input
                    type="text"
                    value={newTrip.destination}
                    onChange={(e) => handleTripChange('destination', e.target.value)}
                    placeholder={t('clubForm.activities.placeholders.destination')}
                  />
                </div>

                <div className="activities-mgr-form-group">
                  <label>{t('clubForm.activities.fields.date')}</label>
                  <input
                    type="date"
                    value={newTrip.date}
                    onChange={(e) => handleTripChange('date', e.target.value)}
                  />
                </div>
              </div>

              <div className="activities-mgr-form-row">
                <div className="activities-mgr-form-group">
                  <label>{t('clubForm.activities.fields.participants')}</label>
                  <input
                    type="number"
                    value={newTrip.participants}
                    onChange={(e) => handleTripChange('participants', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>

                <div className="activities-mgr-form-group">
                  <label>{t('clubForm.activities.fields.price')} (лв.)</label>
                  <input
                    type="number"
                    value={newTrip.price}
                    onChange={(e) => handleTripChange('price', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="activities-mgr-form-group">
                <label>{t('clubForm.activities.fields.description')}</label>
                <textarea
                  value={newTrip.description}
                  onChange={(e) => handleTripChange('description', e.target.value)}
                  placeholder={t('clubForm.activities.placeholders.tripDescription')}
                  rows={3}
                />
              </div>

              <button
                type="button"
                className="activities-mgr-add-btn"
                onClick={addTrip}
                disabled={!newTrip.destination.trim() || !newTrip.date}
              >
                <FontAwesomeIcon icon={faPlus} />
                {t('clubForm.activities.actions.addTrip')}
              </button>
            </div>
          </div>
        )}


        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="activities-mgr-tab-content">
            <div className="activities-mgr-section-header">
              <h4>{t('clubForm.activities.courses')}</h4>
              <p>{t('clubForm.activities.coursesDesc')}</p>
            </div>

            {/* Current Courses */}
            {(activitiesData?.courses?.length > 0) && (
              <div className="activities-mgr-courses-list">
                {activitiesData.courses.map((course, index) => (
                  <div key={index} className="activities-mgr-course-item">
                    <div className="activities-mgr-course-header">
                      <h5 className="activities-mgr-course-title">{course.name}</h5>
                      <button
                        className="activities-mgr-remove-btn"
                        onClick={() => removeActivity('courses', index)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                    <div className="activities-mgr-course-details">
                      <span className="activities-mgr-detail-item"><FontAwesomeIcon icon={faClock} /> {course.duration}</span>
                      <span className="activities-mgr-detail-item"><FontAwesomeIcon icon={faUsers} /> {course.participants}</span>
                      {course.instructor && <span className="activities-mgr-detail-item"><FontAwesomeIcon icon={faUser} /> {course.instructor}</span>}
                    </div>
                    {course.description && (
                      <p className="activities-mgr-course-description">{course.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add Course Form */}
            <div className="activities-mgr-add-form">
              <h5 className="activities-mgr-add-form-title">{t('clubForm.activities.addCourse')}</h5>

              <div className="activities-mgr-form-row">
                <div className="activities-mgr-form-group">
                  <label>{t('clubForm.activities.fields.name')}</label>
                  <input
                    type="text"
                    value={newCourse.name}
                    onChange={(e) => handleCourseChange('name', e.target.value)}
                    placeholder={t('clubForm.activities.placeholders.courseName')}
                  />
                </div>

                <div className="activities-mgr-form-group">
                  <label>{t('clubForm.activities.fields.duration')}</label>
                  <select
                    value={newCourse.duration}
                    onChange={(e) => handleCourseChange('duration', e.target.value)}
                  >
                    {courseDurations.map(duration => (
                      <option key={duration} value={duration}>{duration}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="activities-mgr-form-row">
                <div className="activities-mgr-form-group">
                  <label>{t('clubForm.activities.fields.participants')}</label>
                  <input
                    type="number"
                    value={newCourse.participants}
                    onChange={(e) => handleCourseChange('participants', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>

                <div className="activities-mgr-form-group">
                  <label>{t('clubForm.activities.fields.instructor')}</label>
                  <input
                    type="text"
                    value={newCourse.instructor}
                    onChange={(e) => handleCourseChange('instructor', e.target.value)}
                    placeholder={t('clubForm.activities.placeholders.instructor')}
                  />
                </div>
              </div>

              <div className="activities-mgr-form-group">
                <label>{t('clubForm.activities.fields.description')}</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => handleCourseChange('description', e.target.value)}
                  placeholder={t('clubForm.activities.placeholders.courseDescription')}
                  rows={3}
                />
              </div>

              <button
                type="button"
                className="activities-mgr-add-btn"
                onClick={addCourse}
                disabled={!newCourse.name.trim()}
              >
                <FontAwesomeIcon icon={faPlus} />
                {t('clubForm.activities.actions.addCourse')}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Preview Modal */}
      {previewMedia && (
        <div className="activities-mgr-preview-modal">
          <div className="activities-mgr-modal-overlay" onClick={() => setPreviewMedia(null)}></div>
          <div className="activities-mgr-modal-container">
            <button
              className="activities-mgr-modal-close"
              onClick={() => setPreviewMedia(null)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            <div className="activities-mgr-modal-media">
              {previewMedia.type === 'video' ? (
                <video
                  src={previewMedia.url}
                  controls
                  className="activities-mgr-modal-video"
                />
              ) : (
                <img
                  src={previewMedia.url}
                  alt="Preview"
                  className="activities-mgr-modal-image"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="activities-manager-help">
        <div className="activities-manager-help-icon">
          <FontAwesomeIcon icon={faInfoCircle} />
        </div>
        <div className="activities-manager-help-content">
          <h5>{t('clubForm.activities.help.title')}</h5>
          <p>{t('clubForm.activities.help.description')}</p>
        </div>
      </div>

    </div>
  );
};

export default ActivitiesManager;