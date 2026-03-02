import React, { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faImages, 
  faUpload,
  faTrash,
  faEye,
  faCheck,
  faTimes,
  faSpinner,
  faInfoCircle,
  faCloudUploadAlt,
  faImage,
  faVideo,
  faMusic,
  faGlobe,
  faLink,
  faClock,
  faEdit,
  faCopy,
  faExternalLinkAlt,
  faPalette,
  faThLarge,
  faList,
  faTh,
  faCheckSquare,
  faSquare,
  faFileAudio,
  faFileVideo
} from '@fortawesome/free-solid-svg-icons';
import { useFirebaseUpload } from '../../../hooks/useFirebaseUpload';
import './mediaManager.css';

const MediaManager = ({ 
  mediaData, 
  onMediaChange, 
  disabled = false 
}) => {
  const { t } = useTranslation('clubs');
  const { uploadFile, uploading: firebaseUploading } = useFirebaseUpload();
  
  const [activeTab, setActiveTab] = useState('logo');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [previewMedia, setPreviewMedia] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [galleryView, setGalleryView] = useState('grid');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showAddAudioForm, setShowAddAudioForm] = useState(false);
  const [showAddVideoForm, setShowAddVideoForm] = useState(false);
  const [newAudioFile, setNewAudioFile] = useState({
    url: '',
    title: '',
    description: '',
    duration: ''
  });
  const [newVideoFile, setNewVideoFile] = useState({
    url: '',
    title: '',
    description: '',
    type: 'intro',
    duration: ''
  });
  
  const logoInputRef = useRef(null);
  const mainImageInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);

  // Video types
  const videoTypes = [
    { value: 'intro', label: t('clubForm.media.videoTypes.intro') },
    { value: 'event', label: t('clubForm.media.videoTypes.event') },
    { value: 'cultural', label: t('clubForm.media.videoTypes.cultural') },
    { value: 'social', label: t('clubForm.media.videoTypes.social') },
    { value: 'fitness', label: t('clubForm.media.videoTypes.fitness') },
    { value: 'charity', label: t('clubForm.media.videoTypes.charity') }
  ];

  // Tabs configuration
  const mediaTabs = [
    { id: 'logo', label: t('clubForm.media.tabs.logo'), icon: faImage, required: true },
    { id: 'mainImage', label: t('clubForm.media.tabs.mainImage'), icon: faPalette, required: false },
    { id: 'gallery', label: t('clubForm.media.tabs.gallery'), icon: faImages, required: false },
    { id: 'videos', label: t('clubForm.media.tabs.videos'), icon: faVideo, required: false },
    { id: 'virtualTour', label: t('clubForm.media.tabs.virtualTour'), icon: faGlobe, required: false },
    { id: 'audioFiles', label: t('clubForm.media.tabs.audioFiles'), icon: faMusic, required: false }
  ];

  // File validation
  const validateFile = (file, type = 'image') => {
    const errors = [];
    const maxSizes = {
      logo: 2 * 1024 * 1024, 
      mainImage: 5 * 1024 * 1024, 
      gallery: 10 * 1024 * 1024, 
      video: 100 * 1024 * 1024, 
      audio: 50 * 1024 * 1024 
    };
    
    const allowedFormats = {
      image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      video: ['video/mp4', 'video/webm', 'video/ogg'],
      audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a']
    };
    
    if (type === 'image' && !allowedFormats.image.includes(file.type)) {
      errors.push('Invalid image format. Use JPG, PNG or WebP.');
    }
    
    if (type === 'video' && !allowedFormats.video.includes(file.type)) {
      errors.push('Invalid video format. Use MP4, WebM or OGG.');
    }
    
    if (type === 'audio' && !allowedFormats.audio.includes(file.type)) {
      errors.push('Invalid audio format. Use MP3, WAV or OGG.');
    }
    
    const maxSize = activeTab === 'logo' ? maxSizes.logo : 
                   activeTab === 'mainImage' ? maxSizes.mainImage :
                   activeTab === 'videos' ? maxSizes.video : 
                   activeTab === 'audioFiles' ? maxSizes.audio : maxSizes.gallery;
    
    if (file.size > maxSize) {
      errors.push(`File too large. Max size: ${(maxSize / (1024 * 1024)).toFixed(0)}MB`);
    }
    
    return errors;
  };

  // ДИРЕКТЕН FIREBASE UPLOAD - БЕЗ BLOB
  const handleFileUpload = useCallback(async (files, category = activeTab) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const fileType = file.type.startsWith('video/') ? 'video' : 
                        file.type.startsWith('audio/') ? 'audio' : 'image';
        const errors = validateFile(file, fileType);
        
        if (errors.length > 0) {
          alert(errors.join('\n'));
          return null;
        }
        
        // Progress tracking
        const progressKey = `${category}_${index}`;
        setUploadProgress(prev => ({ ...prev, [progressKey]: 0 }));
        
        try {
          // ДИРЕКТНО към Firebase
          const uploadPath = `clubs/${category}`;
          const result = await uploadFile(file, uploadPath);
          
          // Progress complete
          setUploadProgress(prev => ({ ...prev, [progressKey]: 100 }));
          
          return result.url; // Връщаме Firebase URL
        } catch (error) {
          console.error('Upload error:', error);
          return null;
        }
      });
      
      const uploadedUrls = await Promise.all(uploadPromises);
      const successfulUrls = uploadedUrls.filter(url => url !== null);
      
      if (successfulUrls.length > 0) {
        if (category === 'logo') {
          onMediaChange(successfulUrls[0], 'logo');
        } else if (category === 'mainImage') {
          onMediaChange(successfulUrls[0], 'mainImage');
        } else if (category === 'gallery') {
          const currentGallery = Array.isArray(mediaData?.gallery) ? mediaData.gallery : [];
          const newGallery = [...currentGallery, ...successfulUrls];
          onMediaChange(newGallery, 'gallery');
        }
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  }, [activeTab, mediaData, onMediaChange, uploadFile]);

  // Handle audio file upload
  const handleAudioUpload = useCallback(async (file) => {
    if (!file) return;
    
    const errors = validateFile(file, 'audio');
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }
    
    setUploading(true);
    
    try {
      const uploadPath = 'clubs/audio';
      const result = await uploadFile(file, uploadPath);
      
      setNewAudioFile(prev => ({
        ...prev,
        url: result.url
      }));
      
      // Auto-detect duration
      const audio = new Audio(result.url);
      audio.addEventListener('loadedmetadata', () => {
        const minutes = Math.floor(audio.duration / 60);
        const seconds = Math.floor(audio.duration % 60);
        const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        setNewAudioFile(prev => ({
          ...prev,
          duration: duration
        }));
      });
      
    } catch (error) {
      console.error('Audio upload error:', error);
      alert('Audio upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [uploadFile]);

  // Handle video file upload
  const handleVideoUpload = useCallback(async (file) => {
    if (!file) return;
    
    const errors = validateFile(file, 'video');
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }
    
    setUploading(true);
    
    try {
      const uploadPath = 'clubs/videos';
      const result = await uploadFile(file, uploadPath);
      
      setNewVideoFile(prev => ({
        ...prev,
        url: result.url
      }));
      
      // Auto-detect duration
      const video = document.createElement('video');
      video.addEventListener('loadedmetadata', () => {
        const minutes = Math.floor(video.duration / 60);
        const seconds = Math.floor(video.duration % 60);
        const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        setNewVideoFile(prev => ({
          ...prev,
          duration: duration
        }));
      });
      video.src = result.url;
      
    } catch (error) {
      console.error('Video upload error:', error);
      alert('Video upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [uploadFile]);

  // Add audio file to list
  const addAudioFile = () => {
    if (!newAudioFile.url || !newAudioFile.title.trim()) return;
    
    const currentAudioFiles = mediaData?.media?.audioFiles || [];
    const updatedAudioFiles = [...currentAudioFiles, { ...newAudioFile }];
    
    onMediaChange(updatedAudioFiles, 'media.audioFiles');
    
    setNewAudioFile({
      url: '',
      title: '',
      description: '',
      duration: ''
    });
    setShowAddAudioForm(false);
  };

  // Add video file to list
  const addVideoFile = () => {
    if (!newVideoFile.url || !newVideoFile.title.trim()) return;
    
    const currentVideos = mediaData?.media?.videos || [];
    const updatedVideos = [...currentVideos, { ...newVideoFile }];
    
    onMediaChange(updatedVideos, 'media.videos');
    
    setNewVideoFile({
      url: '',
      title: '',
      description: '',
      type: 'intro',
      duration: ''
    });
    setShowAddVideoForm(false);
  };

  // Remove audio file
  const removeAudioFile = (index) => {
    const currentAudioFiles = mediaData?.media?.audioFiles || [];
    const updatedAudioFiles = currentAudioFiles.filter((_, i) => i !== index);
    onMediaChange(updatedAudioFiles, 'media.audioFiles');
  };

  // Remove video file
  const removeVideoFile = (index) => {
    const currentVideos = mediaData?.media?.videos || [];
    const updatedVideos = currentVideos.filter((_, i) => i !== index);
    onMediaChange(updatedVideos, 'media.videos');
  };

  // Update virtual tour URL
  const updateVirtualTour = (url) => {
    onMediaChange(url, 'media.virtualTour');
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    
    if (activeTab === 'audioFiles') {
      const audioFiles = files.filter(file => file.type.startsWith('audio/'));
      if (audioFiles.length > 0) {
        handleAudioUpload(audioFiles[0]);
        setShowAddAudioForm(true);
      }
    } else if (activeTab === 'videos') {
      const videoFiles = files.filter(file => file.type.startsWith('video/'));
      if (videoFiles.length > 0) {
        handleVideoUpload(videoFiles[0]);
        setShowAddVideoForm(true);
      }
    } else {
      handleFileUpload(files);
    }
  }, [handleFileUpload, handleAudioUpload, handleVideoUpload, activeTab]);

  // Remove gallery image by index
  const removeGalleryImage = (index) => {
    const currentGallery = mediaData?.gallery || [];
    const updatedGallery = currentGallery.filter((_, i) => i !== index);
    onMediaChange(updatedGallery, 'gallery');
  };

  // Toggle image selection by index
  const toggleImageSelection = (index) => {
    setSelectedImages(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // Select all images
  const selectAllImages = () => {
    const gallery = mediaData?.gallery || [];
    setSelectedImages(gallery.map((_, index) => index));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedImages([]);
  };

  // Bulk delete selected images
  const bulkDeleteSelected = () => {
    const currentGallery = mediaData?.gallery || [];
    const updatedGallery = currentGallery.filter((_, index) => !selectedImages.includes(index));
    onMediaChange(updatedGallery, 'gallery');
    setSelectedImages([]);
    setShowBulkActions(false);
  };

  // Check if has content for preview
  const hasContent = (category) => {
    if (category === 'logo') {
      return mediaData?.logo && mediaData.logo.trim() !== '';
    }
    if (category === 'mainImage') {
      return mediaData?.mainImage && mediaData.mainImage.trim() !== '';
    }
    return false;
  };
// Render videos list
const renderVideosList = () => {
  const videos = mediaData?.media?.videos || [];
  
  if (videos.length === 0) {
    return (
      <div className="empty-state">
        <FontAwesomeIcon icon={faVideo} />
        <h4>No videos uploaded</h4>
        <p>Upload your first video to get started</p>
      </div>
    );
  }
  
  return (
    <div className="video-list">
      {videos.map((video, index) => (
        <div key={index} className="video-item">
          <div className="video-player">
            <video controls >
              <source src={video.url} type="video/mp4" />
              Video not supported
            </video>
          </div>
          
          <div className="video-info">
            <h5>{video.title}</h5>
            {video.description && (
              <p className="video-description">{video.description}</p>
            )}
            <div className="video-meta">
              <span className="video-type">
                {videoTypes.find(t => t.value === video.type)?.label || video.type}
              </span>
              {video.duration && (
                <span className="video-duration">
                  <FontAwesomeIcon icon={faClock} />
                  {video.duration}
                </span>
              )}
            </div>
          </div>

          <div className="video-actions">
            <button
              className="action-btn share"
              onClick={() => navigator.clipboard.writeText(video.url)}
              title="Copy Link"
            >
              <FontAwesomeIcon icon={faCopy} />
            </button>
            
            <button
              className="action-btn delete"
              onClick={() => removeVideoFile(index)}
              title="Delete"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
  // Render upload area
  const renderUploadArea = (category, multiple = false) => {
    if ((category === 'logo' || category === 'mainImage') && hasContent(category)) {
      const imageUrl = category === 'logo' ? mediaData.logo : mediaData.mainImage;
      return renderImagePreview(imageUrl, category);
    }
    
    return (
      <div 
        className={`upload-zone ${dragOver ? 'drag-over' : ''} ${uploading || firebaseUploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (category === 'logo') logoInputRef.current?.click();
          else if (category === 'mainImage') mainImageInputRef.current?.click();
          else if (category === 'gallery') galleryInputRef.current?.click();
          else if (category === 'videos') videoInputRef.current?.click();
          else if (category === 'audioFiles') audioInputRef.current?.click();
        }}
      >
        <div className="upload-content">
          <div className="upload-icon">
            {uploading || firebaseUploading ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faCloudUploadAlt} />
            )}
          </div>
          <h4>
            {category === 'logo' && 'Upload Logo'}
            {category === 'mainImage' && 'Upload Main Image'}
            {category === 'gallery' && 'Upload Images to Gallery'}
            {category === 'videos' && 'Upload Video'}
            {category === 'audioFiles' && 'Upload Audio'}
          </h4>
          <p>
            {category === 'logo' && 'PNG, JPG up to 2MB'}
            {category === 'mainImage' && 'PNG, JPG up to 5MB'}
            {category === 'gallery' && 'PNG, JPG up to 10MB each'}
            {category === 'videos' && 'MP4, WebM up to 100MB'}
            {category === 'audioFiles' && 'MP3, WAV up to 50MB'}
          </p>
        </div>
        
        <input
          ref={category === 'logo' ? logoInputRef : 
               category === 'mainImage' ? mainImageInputRef :
               category === 'gallery' ? galleryInputRef : 
               category === 'videos' ? videoInputRef : audioInputRef}
          type="file"
          multiple={multiple}
          accept={category === 'videos' ? 'video/*' : 
                  category === 'audioFiles' ? 'audio/*' : 'image/*'}
          onChange={(e) => {
            const files = Array.from(e.target.files);
            
            if (category === 'audioFiles' && files.length > 0) {
              handleAudioUpload(files[0]);
              setShowAddAudioForm(true);
            } else if (category === 'videos' && files.length > 0) {
              handleVideoUpload(files[0]);
              setShowAddVideoForm(true);
            } else {
              handleFileUpload(files);
            }
            
            e.target.value = '';
          }}
          disabled={disabled || uploading || firebaseUploading}
          style={{ display: 'none' }}
        />
      </div>
    );
  };

  // Render image preview
  const renderImagePreview = (imageUrl, category) => {
    if (!imageUrl || imageUrl.trim() === '') {
      return renderUploadArea(category);
    }
    
    return (
      <div className="image-preview">
        <img 
          src={imageUrl} 
          alt={category} 
          className="preview-image"
        />
        
        <div className="preview-overlay">
          <button
            className="action-btn preview"
            onClick={() => setPreviewMedia({ url: imageUrl, type: 'image' })}
          >
            <FontAwesomeIcon icon={faEye} />
          </button>
          <button
            className="action-btn delete"
            onClick={() => onMediaChange('', category)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
        
        <div className="replace-btn">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (category === 'logo') logoInputRef.current?.click();
              else if (category === 'mainImage') mainImageInputRef.current?.click();
            }}
          >
            <FontAwesomeIcon icon={faUpload} />
            Replace
          </button>
        </div>
        
        <input
          ref={category === 'logo' ? logoInputRef : mainImageInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
              handleFileUpload(files, category);
            }
            e.target.value = '';
          }}
          style={{ display: 'none' }}
        />
      </div>
    );
  };

  // Render gallery grid
  const renderGalleryGrid = () => {
    const gallery = mediaData?.gallery || [];
    
    if (!Array.isArray(gallery) || gallery.length === 0) {
      return (
        <div className="empty-state">
          <FontAwesomeIcon icon={faImages} />
          <h4>No images in gallery</h4>
          <p>Upload some images to get started</p>
        </div>
      );
    }
    
    return (
      <div className={`gallery-grid ${galleryView}`}>
        {gallery.map((imageUrl, index) => {
          if (!imageUrl || typeof imageUrl !== 'string') {
            return null;
          }
          
          return (
            <div key={index} className={`gallery-item ${selectedImages.includes(index) ? 'selected' : ''}`}>
              {showBulkActions && (
                <div className="selection-checkbox">
                  <button
                    className="checkbox-btn"
                    onClick={() => toggleImageSelection(index)}
                  >
                    <FontAwesomeIcon icon={selectedImages.includes(index) ? faCheckSquare : faSquare} />
                  </button>
                </div>
              )}
              
              <img 
                src={imageUrl} 
                alt={`Gallery ${index + 1}`} 
                className="gallery-image"
              />
              
              <div className="gallery-overlay">
                <button
                  className="action-btn preview"
                  onClick={() => setPreviewMedia({ url: imageUrl, type: 'image' })}
                >
                  <FontAwesomeIcon icon={faEye} />
                </button>
                
                <button
                  className="action-btn share"
                  onClick={() => navigator.clipboard.writeText(imageUrl)}
                >
                  <FontAwesomeIcon icon={faCopy} />
                </button>
                
                <button
                  className="action-btn delete"
                  onClick={() => removeGalleryImage(index)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="media-manager">
      
      {/* Header */}
      <div className="media-header">
        <h3 className="media-title">
          <FontAwesomeIcon icon={faImages} />
          Media Management
        </h3>
        <p className="media-subtitle">
          Upload and manage your club's visual content
        </p>
      </div>

      {/* Tabs */}
      <div className="media-tabs">
        {mediaTabs.map(tab => (
          <button
            key={tab.id}
            className={`media-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            disabled={disabled}
          >
            <FontAwesomeIcon icon={tab.icon} />
            <span>{tab.label}</span>
            {tab.required && <span className="required">*</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="media-content">
        
        {/* Logo Tab */}
        {activeTab === 'logo' && (
          <div className="tab-content">
            <div className="section-header">
              <h4>Club Logo</h4>
              <p>Upload your club's official logo</p>
            </div>
            {renderUploadArea('logo')}
          </div>
        )}

        {/* Main Image Tab */}
        {activeTab === 'mainImage' && (
          <div className="tab-content">
            <div className="section-header">
              <h4>Main Cover Image</h4>
              <p>Upload a main image that represents your club</p>
            </div>
            {renderUploadArea('mainImage')}
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="tab-content">
            <div className="section-header">
              <h4>Photo Gallery</h4>
              <p>Upload multiple images to showcase your club</p>
            </div>
            
            {/* Gallery Controls */}
            <div className="gallery-controls">
              <div className="view-controls">
                <button
                  className={`view-btn ${galleryView === 'grid' ? 'active' : ''}`}
                  onClick={() => setGalleryView('grid')}
                >
                  <FontAwesomeIcon icon={faThLarge} />
                </button>
                <button
                  className={`view-btn ${galleryView === 'list' ? 'active' : ''}`}
                  onClick={() => setGalleryView('list')}
                >
                  <FontAwesomeIcon icon={faList} />
                </button>
                <button
                  className={`view-btn ${galleryView === 'mosaic' ? 'active' : ''}`}
                  onClick={() => setGalleryView('mosaic')}
                >
                  <FontAwesomeIcon icon={faTh} />
                </button>
              </div>
              
              {/* Bulk Actions */}
              {(mediaData?.gallery?.length > 0) && (
                <div className="bulk-actions">
                  {!showBulkActions ? (
                    <button
                      className="bulk-toggle"
                      onClick={() => setShowBulkActions(true)}
                    >
                      <FontAwesomeIcon icon={faCheckSquare} />
                      Select Mode
                    </button>
                  ) : (
                    <div className="bulk-controls">
                      <button className="bulk-btn" onClick={selectAllImages}>
                        Select All
                      </button>
                      <button className="bulk-btn" onClick={clearSelection}>
                        Clear
                      </button>
                      <button 
                        className="bulk-btn delete" 
                        onClick={bulkDeleteSelected}
                        disabled={selectedImages.length === 0}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        Delete ({selectedImages.length})
                      </button>
                      <button
                        className="bulk-btn"
                        onClick={() => {
                          setShowBulkActions(false);
                          clearSelection();
                        }}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {renderUploadArea('gallery', true)}
            {renderGalleryGrid()}
          </div>
        )}
{/* Videos Tab */}
{activeTab === 'videos' && (
  <div className="tab-content">
    <div className="section-header">
      <h4>Videos</h4>
      <p>Upload and manage your club's videos</p>
    </div>
    
    {/* Add Form */}
    {showAddVideoForm && (
      <div className="video-add-form">
        <div className="add-form-header">
          <h5>Add New Video</h5>
          <button 
            className="close-form-btn"
            onClick={() => {
              setNewVideoFile({
                url: '',
                title: '',
                description: '',
                type: 'intro',
                duration: ''
              });
              setShowAddVideoForm(false);
            }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">
              <FontAwesomeIcon icon={faFileVideo} />
              Video File
            </label>
            {!newVideoFile.url ? (
              renderUploadArea('videos')
            ) : (
              <div className="video-preview">
                <video controls style={{ width: '100%', height: 'auto' }}>
                  <source src={newVideoFile.url} type="video/mp4" />
                  Video not supported
                </video>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              <FontAwesomeIcon icon={faEdit} />
              Title
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Video title"
              value={newVideoFile.title}
              onChange={(e) => setNewVideoFile({...newVideoFile, title: e.target.value})}
              disabled={disabled}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <FontAwesomeIcon icon={faVideo} />
              Type
            </label>
            <select
              className="form-input"
              value={newVideoFile.type}
              onChange={(e) => setNewVideoFile({...newVideoFile, type: e.target.value})}
              disabled={disabled}
            >
              {videoTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group full-width">
            <label className="form-label">
              <FontAwesomeIcon icon={faInfoCircle} />
              Description
            </label>
            <textarea
              className="form-input"
              placeholder="Video description"
              value={newVideoFile.description}
              onChange={(e) => setNewVideoFile({...newVideoFile, description: e.target.value})}
              disabled={disabled}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <FontAwesomeIcon icon={faClock} />
              Duration
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="5:30"
              value={newVideoFile.duration}
              onChange={(e) => setNewVideoFile({...newVideoFile, duration: e.target.value})}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="form-btn cancel"
            onClick={() => {
              setNewVideoFile({
                url: '',
                title: '',
                description: '',
                type: 'intro',
                duration: ''
              });
              setShowAddVideoForm(false);
            }}
            disabled={disabled}
          >
            <FontAwesomeIcon icon={faTimes} />
            Cancel
          </button>
          
          <button
            type="button"
            className="form-btn add"
            onClick={addVideoFile}
            disabled={disabled || !newVideoFile.url || !newVideoFile.title.trim()}
          >
            <FontAwesomeIcon icon={faCheck} />
            Add Video
          </button>
        </div>
      </div>
    )}

    {/* Videos List */}
    {renderVideosList()}

    {/* Add Button */}
    {!showAddVideoForm && (
      <div className="add-section">
        <button
          className="add-btn"
          onClick={() => setShowAddVideoForm(true)}
          disabled={disabled}
        >
          <FontAwesomeIcon icon={faVideo} />
          Add Video
        </button>
      </div>
    )}
  </div>
)}

        {/* Virtual Tour Tab */}
        {activeTab === 'virtualTour' && (
          <div className="tab-content">
            <div className="section-header">
              <h4>Virtual Tour</h4>
              <p>Add a virtual tour URL for your club</p>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <FontAwesomeIcon icon={faLink} />
                Virtual Tour URL
              </label>
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com/virtual-tour"
                value={mediaData?.media?.virtualTour || ''}
                onChange={(e) => updateVirtualTour(e.target.value)}
                disabled={disabled}
              />
            </div>
            
            {mediaData?.media?.virtualTour && (
              <div className="virtual-tour-preview">
                <h5>Preview</h5>
                <iframe
                  src={mediaData.media.virtualTour}
                  width="100%"
                  height="400"
                  frameBorder="0"
                  allowFullScreen
                  title="Virtual Tour"
                ></iframe>
                <div className="tour-actions">
                  <button
                    className="action-btn external"
                    onClick={() => window.open(mediaData.media.virtualTour, '_blank')}
                  >
                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                    Open External
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => updateVirtualTour('')}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Audio Files Tab */}
        {activeTab === 'audioFiles' && (
          <div className="tab-content">
            <div className="section-header">
              <h4>Audio Files</h4>
              <p>Upload and manage audio content</p>
            </div>
            
            {/* Audio upload and management would go here */}
            {renderUploadArea('audioFiles')}
          </div>
        )}

      </div>

      {/* Preview Modal */}
      {previewMedia && (
        <div className="preview-modal">
          <div className="modal-overlay" onClick={() => setPreviewMedia(null)}></div>
          <div className="modal-container">
            <button 
              className="modal-close"
              onClick={() => setPreviewMedia(null)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="modal-media">
              {previewMedia.type === 'video' ? (
                <video 
                  src={previewMedia.url} 
                  controls
                  className="modal-video"
                />
              ) : (
                <img 
                  src={previewMedia.url} 
                  alt="Preview"
                  className="modal-image"
                />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MediaManager;