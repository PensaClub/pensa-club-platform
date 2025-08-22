import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserMd,
  faHandsHelping,
  faUniversalAccess,
  faBrain,
  faHeartbeat,
  faPlus,
  faEdit,
  faTrash,
  faTimes,
  faCheck,
  faCalendarAlt,
  faBuilding,
  faInfoCircle,
  faPhone,
  faClock,
  faMapMarkerAlt,
  faUserFriends,
  faHome,
  faShoppingCart,
  faFileAlt,
  faCar,
  faUtensils,
  faBroom,
  faLaptop,
  faWheelchair,
  faElevator,
  faVolumeUp,
  faEye,
  faHandPaper,
  faLightbulb,
  faCouch,
  faExclamationTriangle,
  faAmbulance,
  faPills,
  faUsers,
  faGraduationCap,
  faChartLine,
  faDumbbell,
  faAppleAlt,
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import './pensionersSpecificManager.css';

const PensionersSpecificManager = ({ 
  pensionersData, 
  onPensionersChange, 
  disabled = false 
}) => {
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState('healthServices');
  const [showAddHealthLectureForm, setShowAddHealthLectureForm] = useState(false);
  const [showAddMedicalPartnerForm, setShowAddMedicalPartnerForm] = useState(false);
  const [showAddMemoryActivityForm, setShowAddMemoryActivityForm] = useState(false);
  const [showAddIntergenerationalForm, setShowAddIntergenerationalForm] = useState(false);
  const [showAddVolunteerProgramForm, setShowAddVolunteerProgramForm] = useState(false);
  const [showAddMentalHealthForm, setShowAddMentalHealthForm] = useState(false);
  const [showAddLowImpactActivityForm, setShowAddLowImpactActivityForm] = useState(false);
  const [showAddNutritionSupportForm, setShowAddNutritionSupportForm] = useState(false);
  
  const [editingHealthLectureIndex, setEditingHealthLectureIndex] = useState(-1);
  const [editingMedicalPartnerIndex, setEditingMedicalPartnerIndex] = useState(-1);
  const [editingMemoryActivityIndex, setEditingMemoryActivityIndex] = useState(-1);
  const [editingIntergenerationalIndex, setEditingIntergenerationalIndex] = useState(-1);
  const [editingVolunteerProgramIndex, setEditingVolunteerProgramIndex] = useState(-1);
  const [editingMentalHealthIndex, setEditingMentalHealthIndex] = useState(-1);
  const [editingLowImpactActivityIndex, setEditingLowImpactActivityIndex] = useState(-1);
  const [editingNutritionSupportIndex, setEditingNutritionSupportIndex] = useState(-1);
  
  const [newHealthLecture, setNewHealthLecture] = useState({
    topic: '',
    lecturer: '',
    frequency: 'месечно',
    nextDate: '',
    duration: ''
  });
  
  const [newMedicalPartner, setNewMedicalPartner] = useState({
    name: '',
    service: '',
    contact: '',
    address: '',
    workingHours: '',
    discount: ''
  });
  
  const [newMemoryActivity, setNewMemoryActivity] = useState({
    name: '',
    frequency: 'седмично',
    description: '',
    instructor: '',
    participants: 0
  });
  
  const [newIntergenerationalProgram, setNewIntergenerationalProgram] = useState({
    name: '',
    description: '',
    frequency: '',
    participants: 0,
    ageRange: '',
    coordinator: '',
    venue: ''
  });
  
  const [newVolunteerProgram, setNewVolunteerProgram] = useState({
    name: '',
    volunteers: 0,
    coordinator: '',
    description: '',
    hoursPerWeek: 0,
    training: ''
  });
  
  const [newMentalHealthSupport, setNewMentalHealthSupport] = useState({
    type: 'индивидуална',
    frequency: '',
    therapist: '',
    participants: 0,
    focus: '',
    availability: '',
    contact: ''
  });
  
  const [newLowImpactActivity, setNewLowImpactActivity] = useState({
    name: '',
    intensity: 'ниска',
    suitableFor: [],
    duration: ''
  });
  
  const [newNutritionSupport, setNewNutritionSupport] = useState({
    service: '',
    provider: '',
    frequency: '',
    price: '',
    coverage: '',
    volunteers: 0
  });

  // Tabs configuration
  const pensionersTabs = [
    { id: 'healthServices', label: t('clubForm.pensioners.tabs.healthServices'), icon: faUserMd },
    { id: 'supportServices', label: t('clubForm.pensioners.tabs.supportServices'), icon: faHandsHelping },
    { id: 'accessibility', label: t('clubForm.pensioners.tabs.accessibility'), icon: faUniversalAccess },
    { id: 'specialPrograms', label: t('clubForm.pensioners.tabs.specialPrograms'), icon: faBrain },
    { id: 'ageSpecificNeeds', label: t('clubForm.pensioners.tabs.ageSpecificNeeds'), icon: faHeartbeat }
  ];

  // Frequency options
  const frequencyOptions = [
    { value: 'дневно', label: t('clubForm.pensioners.frequency.daily') },
    { value: 'седмично', label: t('clubForm.pensioners.frequency.weekly') },
    { value: 'двуседмично', label: t('clubForm.pensioners.frequency.biweekly') },
    { value: 'месечно', label: t('clubForm.pensioners.frequency.monthly') },
    { value: 'тримесечно', label: t('clubForm.pensioners.frequency.quarterly') },
    { value: 'годишно', label: t('clubForm.pensioners.frequency.yearly') },
    { value: '24/7', label: t('clubForm.pensioners.frequency.24_7') }
  ];

  // Mental health types
  const mentalHealthTypes = [
    { value: 'индивидуална', label: t('clubForm.pensioners.mentalHealth.types.individual') },
    { value: 'групова', label: t('clubForm.pensioners.mentalHealth.types.group') },
    { value: 'семейна', label: t('clubForm.pensioners.mentalHealth.types.family') },
    { value: 'кризисна интервенция', label: t('clubForm.pensioners.mentalHealth.types.crisis') },
    { value: 'подкрепителни групи', label: t('clubForm.pensioners.mentalHealth.types.support') },
    { value: 'спортна психология', label: t('clubForm.pensioners.mentalHealth.types.sports') }
  ];

  // Intensity levels
  const intensityLevels = [
    { value: 'ниска', label: t('clubForm.pensioners.intensity.low') },
    { value: 'средна', label: t('clubForm.pensioners.intensity.medium') },
    { value: 'висока', label: t('clubForm.pensioners.intensity.high') },
    { value: 'ниска до средна', label: t('clubForm.pensioners.intensity.lowToMedium') }
  ];

  // Health Services functions
  const updateHealthServices = (field, value) => {
    const currentHealthServices = pensionersData?.healthServices || {};
    onPensionersChange({
      ...pensionersData,
      healthServices: {
        ...currentHealthServices,
        [field]: value
      }
    });
  };

  const addHealthLecture = () => {
    if (!newHealthLecture.topic.trim()) return;
    
    const currentLectures = pensionersData?.healthServices?.healthLectures || [];
    const updatedLectures = [...currentLectures, { ...newHealthLecture }];
    updateHealthServices('healthLectures', updatedLectures);
    
    setNewHealthLecture({
      topic: '',
      lecturer: '',
      frequency: 'месечно',
      nextDate: '',
      duration: ''
    });
    setShowAddHealthLectureForm(false);
  };

  const editHealthLecture = (index, updatedLecture) => {
    const currentLectures = pensionersData?.healthServices?.healthLectures || [];
    const updatedLectures = currentLectures.map((lecture, i) => 
      i === index ? updatedLecture : lecture
    );
    updateHealthServices('healthLectures', updatedLectures);
    setEditingHealthLectureIndex(-1);
  };

  const removeHealthLecture = (index) => {
    const currentLectures = pensionersData?.healthServices?.healthLectures || [];
    const updatedLectures = currentLectures.filter((_, i) => i !== index);
    updateHealthServices('healthLectures', updatedLectures);
  };

  const addMedicalPartner = () => {
    if (!newMedicalPartner.name.trim()) return;
    
    const currentPartners = pensionersData?.healthServices?.medicalPartners || [];
    const updatedPartners = [...currentPartners, { ...newMedicalPartner }];
    updateHealthServices('medicalPartners', updatedPartners);
    
    setNewMedicalPartner({
      name: '',
      service: '',
      contact: '',
      address: '',
      workingHours: '',
      discount: ''
    });
    setShowAddMedicalPartnerForm(false);
  };

  const editMedicalPartner = (index, updatedPartner) => {
    const currentPartners = pensionersData?.healthServices?.medicalPartners || [];
    const updatedPartners = currentPartners.map((partner, i) => 
      i === index ? updatedPartner : partner
    );
    updateHealthServices('medicalPartners', updatedPartners);
    setEditingMedicalPartnerIndex(-1);
  };

  const removeMedicalPartner = (index) => {
    const currentPartners = pensionersData?.healthServices?.medicalPartners || [];
    const updatedPartners = currentPartners.filter((_, i) => i !== index);
    updateHealthServices('medicalPartners', updatedPartners);
  };

  const updateEmergencyProtocol = (field, value) => {
    const currentProtocol = pensionersData?.healthServices?.emergencyProtocol || {};
    updateHealthServices('emergencyProtocol', {
      ...currentProtocol,
      [field]: value
    });
  };

  // Support Services functions
  const updateSupportServices = (field, value) => {
    const currentSupportServices = pensionersData?.supportServices || {};
    onPensionersChange({
      ...pensionersData,
      supportServices: {
        ...currentSupportServices,
        [field]: value
      }
    });
  };

  // Accessibility functions
  const updateAccessibility = (field, value) => {
    const currentAccessibility = pensionersData?.accessibility || {};
    onPensionersChange({
      ...pensionersData,
      accessibility: {
        ...currentAccessibility,
        [field]: value
      }
    });
  };

  // Special Programs functions
  const updateSpecialPrograms = (field, value) => {
    const currentSpecialPrograms = pensionersData?.specialPrograms || {};
    onPensionersChange({
      ...pensionersData,
      specialPrograms: {
        ...currentSpecialPrograms,
        [field]: value
      }
    });
  };

  const addMemoryActivity = () => {
    if (!newMemoryActivity.name.trim()) return;
    
    const currentActivities = pensionersData?.specialPrograms?.memoryActivities || [];
    const updatedActivities = [...currentActivities, { ...newMemoryActivity }];
    updateSpecialPrograms('memoryActivities', updatedActivities);
    
    setNewMemoryActivity({
      name: '',
      frequency: 'седмично',
      description: '',
      instructor: '',
      participants: 0
    });
    setShowAddMemoryActivityForm(false);
  };

  const editMemoryActivity = (index, updatedActivity) => {
    const currentActivities = pensionersData?.specialPrograms?.memoryActivities || [];
    const updatedActivities = currentActivities.map((activity, i) => 
      i === index ? updatedActivity : activity
    );
    updateSpecialPrograms('memoryActivities', updatedActivities);
    setEditingMemoryActivityIndex(-1);
  };

  const removeMemoryActivity = (index) => {
    const currentActivities = pensionersData?.specialPrograms?.memoryActivities || [];
    const updatedActivities = currentActivities.filter((_, i) => i !== index);
    updateSpecialPrograms('memoryActivities', updatedActivities);
  };

  // Similar functions for other special programs...
  const addIntergenerationalProgram = () => {
    if (!newIntergenerationalProgram.name.trim()) return;
    
    const currentPrograms = pensionersData?.specialPrograms?.intergenerationalPrograms || [];
    const updatedPrograms = [...currentPrograms, { ...newIntergenerationalProgram }];
    updateSpecialPrograms('intergenerationalPrograms', updatedPrograms);
    
    setNewIntergenerationalProgram({
      name: '',
      description: '',
      frequency: '',
      participants: 0,
      ageRange: '',
      coordinator: '',
      venue: ''
    });
    setShowAddIntergenerationalForm(false);
  };

  const addVolunteerProgram = () => {
    if (!newVolunteerProgram.name.trim()) return;
    
    const currentPrograms = pensionersData?.specialPrograms?.volunteerPrograms || [];
    const updatedPrograms = [...currentPrograms, { ...newVolunteerProgram }];
    updateSpecialPrograms('volunteerPrograms', updatedPrograms);
    
    setNewVolunteerProgram({
      name: '',
      volunteers: 0,
      coordinator: '',
      description: '',
      hoursPerWeek: 0,
      training: ''
    });
    setShowAddVolunteerProgramForm(false);
  };

  const addMentalHealthSupport = () => {
    if (!newMentalHealthSupport.type.trim()) return;
    
    const currentSupport = pensionersData?.specialPrograms?.mentalHealthSupport || [];
    const updatedSupport = [...currentSupport, { ...newMentalHealthSupport }];
    updateSpecialPrograms('mentalHealthSupport', updatedSupport);
    
    setNewMentalHealthSupport({
      type: 'индивидуална',
      frequency: '',
      therapist: '',
      participants: 0,
      focus: '',
      availability: '',
      contact: ''
    });
    setShowAddMentalHealthForm(false);
  };

  // Age Specific Needs functions
  const updateAgeSpecificNeeds = (field, value) => {
    const currentNeeds = pensionersData?.ageSpecificNeeds || {};
    onPensionersChange({
      ...pensionersData,
      ageSpecificNeeds: {
        ...currentNeeds,
        [field]: value
      }
    });
  };

  const addLowImpactActivity = () => {
    if (!newLowImpactActivity.name.trim()) return;
    
    const currentActivities = pensionersData?.ageSpecificNeeds?.lowImpactActivities || [];
    const updatedActivities = [...currentActivities, { ...newLowImpactActivity }];
    updateAgeSpecificNeeds('lowImpactActivities', updatedActivities);
    
    setNewLowImpactActivity({
      name: '',
      intensity: 'ниска',
      suitableFor: [],
      duration: ''
    });
    setShowAddLowImpactActivityForm(false);
  };

  const addNutritionSupport = () => {
    if (!newNutritionSupport.service.trim()) return;
    
    const currentSupport = pensionersData?.ageSpecificNeeds?.nutritionSupport || [];
    const updatedSupport = [...currentSupport, { ...newNutritionSupport }];
    updateAgeSpecificNeeds('nutritionSupport', updatedSupport);
    
    setNewNutritionSupport({
      service: '',
      provider: '',
      frequency: '',
      price: '',
      coverage: '',
      volunteers: 0
    });
    setShowAddNutritionSupportForm(false);
  };

  // Add/remove functions for simple arrays
  const addToSimpleArray = (category, field, value) => {
    if (!value.trim()) return;
    
    const currentArray = pensionersData?.[category]?.[field] || [];
    const updatedArray = [...currentArray, value.trim()];
    
    if (category === 'healthServices') {
      updateHealthServices(field, updatedArray);
    } else if (category === 'ageSpecificNeeds') {
      updateAgeSpecificNeeds(field, updatedArray);
    }
  };

  const removeFromSimpleArray = (category, field, index) => {
    const currentArray = pensionersData?.[category]?.[field] || [];
    const updatedArray = currentArray.filter((_, i) => i !== index);
    
    if (category === 'healthServices') {
      updateHealthServices(field, updatedArray);
    } else if (category === 'ageSpecificNeeds') {
      updateAgeSpecificNeeds(field, updatedArray);
    }
  };

  // Render Health Services section
  const renderHealthServicesSection = () => (
    <div className="pensioners-specific-manager-tab-content">
      <div className="pensioners-specific-manager-section-header">
        <h4>
          <FontAwesomeIcon icon={faUserMd} className="pensioners-specific-manager-section-icon" />
          {t('clubForm.pensioners.healthServices.title')}
        </h4>
        <p>{t('clubForm.pensioners.healthServices.description')}</p>
      </div>

      {/* Basic Health Services */}
      <div className="pensioners-specific-manager-subsection">
        <h5>{t('clubForm.pensioners.healthServices.basic.title')}</h5>
        <div className="pensioners-specific-manager-checkboxes-grid">
          <div className="pensioners-specific-manager-checkbox-item">
            <label className="pensioners-specific-manager-checkbox">
              <input
                type="checkbox"
                checked={pensionersData?.healthServices?.regularCheckups || false}
                onChange={(e) => updateHealthServices('regularCheckups', e.target.checked)}
                disabled={disabled}
              />
              <span className="pensioners-specific-manager-checkbox-checkmark"></span>
              <div className="pensioners-specific-manager-checkbox-content">
                <FontAwesomeIcon icon={faHeartbeat} className="pensioners-specific-manager-checkbox-icon" />
                <div>
                  <h6>{t('clubForm.pensioners.healthServices.basic.regularCheckups.title')}</h6>
                  <p>{t('clubForm.pensioners.healthServices.basic.regularCheckups.description')}</p>
                </div>
              </div>
            </label>
          </div>

          <div className="pensioners-specific-manager-checkbox-item">
            <label className="pensioners-specific-manager-checkbox">
              <input
                type="checkbox"
                checked={pensionersData?.healthServices?.bloodPressureMonitoring || false}
                onChange={(e) => updateHealthServices('bloodPressureMonitoring', e.target.checked)}
                disabled={disabled}
              />
              <span className="pensioners-specific-manager-checkbox-checkmark"></span>
              <div className="pensioners-specific-manager-checkbox-content">
                <FontAwesomeIcon icon={faHeartbeat} className="pensioners-specific-manager-checkbox-icon" />
                <div>
                  <h6>{t('clubForm.pensioners.healthServices.basic.bloodPressureMonitoring.title')}</h6>
                  <p>{t('clubForm.pensioners.healthServices.basic.bloodPressureMonitoring.description')}</p>
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Health Lectures */}
      <div className="pensioners-specific-manager-subsection">
        <h5>{t('clubForm.pensioners.healthServices.healthLectures.title')}</h5>
        
        {/* Add Form */}
        {showAddHealthLectureForm && (
          <div className="pensioners-specific-manager-add-form">
            <div className="pensioners-specific-manager-form-header">
              <h6>{t('clubForm.pensioners.healthServices.healthLectures.addNew')}</h6>
              <button 
                className="pensioners-specific-manager-close-btn"
                onClick={() => setShowAddHealthLectureForm(false)}
              >
                <FontAwesomeIcon icon={faTimes} className="pensioners-specific-manager-close-icon" />
              </button>
            </div>

            <div className="pensioners-specific-manager-form-grid">
              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faGraduationCap} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.healthServices.healthLectures.fields.topic')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.healthServices.healthLectures.placeholders.topic')}
                  value={newHealthLecture.topic}
                  onChange={(e) => setNewHealthLecture({...newHealthLecture, topic: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faUserMd} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.healthServices.healthLectures.fields.lecturer')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.healthServices.healthLectures.placeholders.lecturer')}
                  value={newHealthLecture.lecturer}
                  onChange={(e) => setNewHealthLecture({...newHealthLecture, lecturer: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faCalendarAlt} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.healthServices.healthLectures.fields.frequency')}
                </label>
                <select
                  className="pensioners-specific-manager-form-select"
                  value={newHealthLecture.frequency}
                  onChange={(e) => setNewHealthLecture({...newHealthLecture, frequency: e.target.value})}
                  disabled={disabled}
                >
                  {frequencyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faCalendarAlt} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.healthServices.healthLectures.fields.nextDate')}
                </label>
                <input
                  type="date"
                  className="pensioners-specific-manager-form-input"
                  value={newHealthLecture.nextDate}
                  onChange={(e) => setNewHealthLecture({...newHealthLecture, nextDate: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faClock} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.healthServices.healthLectures.fields.duration')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.healthServices.healthLectures.placeholders.duration')}
                  value={newHealthLecture.duration}
                  onChange={(e) => setNewHealthLecture({...newHealthLecture, duration: e.target.value})}
                  disabled={disabled}
                />
              </div>
            </div>

            <div className="pensioners-specific-manager-form-actions">
              <button
                type="button"
                className="pensioners-specific-manager-btn pensioners-specific-manager-btn-cancel"
                onClick={() => setShowAddHealthLectureForm(false)}
                disabled={disabled}
              >
                <FontAwesomeIcon icon={faTimes} className="pensioners-specific-manager-btn-icon" />
                {t('clubForm.pensioners.actions.cancel')}
              </button>
              
              <button
                type="button"
                className="pensioners-specific-manager-btn pensioners-specific-manager-btn-add"
                onClick={addHealthLecture}
                disabled={disabled || !newHealthLecture.topic.trim()}
              >
                <FontAwesomeIcon icon={faCheck} className="pensioners-specific-manager-btn-icon" />
                {t('clubForm.pensioners.actions.add')}
              </button>
            </div>
          </div>
        )}

        {/* Health Lectures List */}
        {(pensionersData?.healthServices?.healthLectures?.length > 0) ? (
          <div className="pensioners-specific-manager-lectures-list">
            {pensionersData.healthServices.healthLectures.map((lecture, index) => (
              <div key={index} className="pensioners-specific-manager-lecture-item">
                <div className="pensioners-specific-manager-lecture-content">
                  <h6>{lecture.topic}</h6>
                  <div className="pensioners-specific-manager-lecture-meta">
                    {lecture.lecturer && (
                      <span>
                        <FontAwesomeIcon icon={faUserMd} className="pensioners-specific-manager-meta-icon" />
                        {lecture.lecturer}
                      </span>
                    )}
                    <span>
                      <FontAwesomeIcon icon={faCalendarAlt} className="pensioners-specific-manager-meta-icon" />
                      {frequencyOptions.find(f => f.value === lecture.frequency)?.label || lecture.frequency}
                    </span>
                    {lecture.duration && (
                      <span>
                        <FontAwesomeIcon icon={faClock} className="pensioners-specific-manager-meta-icon" />
                        {lecture.duration}
                      </span>
                    )}
                  </div>
                </div>
                <div className="pensioners-specific-manager-lecture-actions">
                  <button
                    className="pensioners-specific-manager-action-btn pensioners-specific-manager-edit-btn"
                    onClick={() => setEditingHealthLectureIndex(index)}
                    disabled={disabled}
                  >
                    <FontAwesomeIcon icon={faEdit} className="pensioners-specific-manager-action-icon" />
                  </button>
                  <button
                    className="pensioners-specific-manager-action-btn pensioners-specific-manager-delete-btn"
                    onClick={() => removeHealthLecture(index)}
                    disabled={disabled}
                  >
                    <FontAwesomeIcon icon={faTrash} className="pensioners-specific-manager-action-icon" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="pensioners-specific-manager-empty-state">
            <FontAwesomeIcon icon={faGraduationCap} className="pensioners-specific-manager-empty-icon" />
            <p>{t('clubForm.pensioners.healthServices.healthLectures.empty')}</p>
          </div>
        )}

        {!showAddHealthLectureForm && (
          <div className="pensioners-specific-manager-add-section">
            <button
              className="pensioners-specific-manager-add-btn"
              onClick={() => setShowAddHealthLectureForm(true)}
              disabled={disabled}
            >
              <FontAwesomeIcon icon={faPlus} className="pensioners-specific-manager-add-icon" />
              {t('clubForm.pensioners.healthServices.healthLectures.addNew')}
            </button>
          </div>
        )}
      </div>

      {/* Emergency Protocol */}
      <div className="pensioners-specific-manager-subsection">
        <h5>{t('clubForm.pensioners.healthServices.emergencyProtocol.title')}</h5>
        
        <div className="pensioners-specific-manager-emergency-form">
          <div className="pensioners-specific-manager-checkbox-item">
            <label className="pensioners-specific-manager-checkbox">
              <input
                type="checkbox"
                checked={pensionersData?.healthServices?.emergencyProtocol?.hasEmergencyPlan || false}
                onChange={(e) => updateEmergencyProtocol('hasEmergencyPlan', e.target.checked)}
                disabled={disabled}
              />
              <span className="pensioners-specific-manager-checkbox-checkmark"></span>
              <div className="pensioners-specific-manager-checkbox-content">
                <FontAwesomeIcon icon={faExclamationTriangle} className="pensioners-specific-manager-checkbox-icon" />
                <div>
                  <h6>{t('clubForm.pensioners.healthServices.emergencyProtocol.hasEmergencyPlan.title')}</h6>
                  <p>{t('clubForm.pensioners.healthServices.emergencyProtocol.hasEmergencyPlan.description')}</p>
                </div>
              </div>
            </label>
          </div>

          <div className="pensioners-specific-manager-form-group">
            <label className="pensioners-specific-manager-form-label">
              <FontAwesomeIcon icon={faAmbulance} className="pensioners-specific-manager-label-icon" />
              {t('clubForm.pensioners.healthServices.emergencyProtocol.nearestHospital')}
            </label>
            <input
              type="text"
              className="pensioners-specific-manager-form-input"
              placeholder={t('clubForm.pensioners.healthServices.emergencyProtocol.nearestHospitalPlaceholder')}
              value={pensionersData?.healthServices?.emergencyProtocol?.nearestHospital || ''}
              onChange={(e) => updateEmergencyProtocol('nearestHospital', e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Render Support Services section
  const renderSupportServicesSection = () => {
    const supportServices = [
      { key: 'homeVisits', icon: faHome, title: 'homeVisits', description: 'homeVisitsDesc' },
      { key: 'shoppingAssistance', icon: faShoppingCart, title: 'shoppingAssistance', description: 'shoppingAssistanceDesc' },
      { key: 'documentHelp', icon: faFileAlt, title: 'documentHelp', description: 'documentHelpDesc' },
      { key: 'companionship', icon: faUserFriends, title: 'companionship', description: 'companionshipDesc' },
      { key: 'transportService', icon: faCar, title: 'transportService', description: 'transportServiceDesc' },
      { key: 'mealDelivery', icon: faUtensils, title: 'mealDelivery', description: 'mealDeliveryDesc' },
      { key: 'cleaningHelp', icon: faBroom, title: 'cleaningHelp', description: 'cleaningHelpDesc' },
      { key: 'techSupport', icon: faLaptop, title: 'techSupport', description: 'techSupportDesc' }
    ];

    return (
      <div className="pensioners-specific-manager-tab-content">
        <div className="pensioners-specific-manager-section-header">
          <h4>
            <FontAwesomeIcon icon={faHandsHelping} className="pensioners-specific-manager-section-icon" />
            {t('clubForm.pensioners.supportServices.title')}
          </h4>
          <p>{t('clubForm.pensioners.supportServices.description')}</p>
        </div>

        <div className="pensioners-specific-manager-checkboxes-grid">
          {supportServices.map(service => (
            <div key={service.key} className="pensioners-specific-manager-checkbox-item">
              <label className="pensioners-specific-manager-checkbox">
                <input
                  type="checkbox"
                  checked={pensionersData?.supportServices?.[service.key] || false}
                  onChange={(e) => updateSupportServices(service.key, e.target.checked)}
                  disabled={disabled}
                />
                <span className="pensioners-specific-manager-checkbox-checkmark"></span>
                <div className="pensioners-specific-manager-checkbox-content">
                  <FontAwesomeIcon icon={service.icon} className="pensioners-specific-manager-checkbox-icon" />
                  <div>
                    <h6>{t(`clubForm.pensioners.supportServices.${service.title}.title`)}</h6>
                    <p>{t(`clubForm.pensioners.supportServices.${service.description}`)}</p>
                  </div>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Accessibility section
  const renderAccessibilitySection = () => {
    const accessibilityFeatures = [
      { key: 'wheelchairAccess', icon: faWheelchair, title: 'wheelchairAccess', description: 'wheelchairAccessDesc' },
      { key: 'elevatorAccess', icon: faElevator, title: 'elevatorAccess', description: 'elevatorAccessDesc' },
      { key: 'hearingLoop', icon: faVolumeUp, title: 'hearingLoop', description: 'hearingLoopDesc' },
      { key: 'largeTextMaterials', icon: faEye, title: 'largeTextMaterials', description: 'largeTextMaterialsDesc' },
      { key: 'handrails', icon: faHandPaper, title: 'handrails', description: 'handrailsDesc' },
      { key: 'nonSlipFloors', icon: faShieldAlt, title: 'nonSlipFloors', description: 'nonSlipFloorsDesc' },
      { key: 'goodLighting', icon: faLightbulb, title: 'goodLighting', description: 'goodLightingDesc' },
      { key: 'restingAreas', icon: faCouch, title: 'restingAreas', description: 'restingAreasDesc' }
    ];

    return (
      <div className="pensioners-specific-manager-tab-content">
        <div className="pensioners-specific-manager-section-header">
          <h4>
            <FontAwesomeIcon icon={faUniversalAccess} className="pensioners-specific-manager-section-icon" />
            {t('clubForm.pensioners.accessibility.title')}
          </h4>
          <p>{t('clubForm.pensioners.accessibility.description')}</p>
        </div>

        <div className="pensioners-specific-manager-checkboxes-grid">
          {accessibilityFeatures.map(feature => (
            <div key={feature.key} className="pensioners-specific-manager-checkbox-item">
              <label className="pensioners-specific-manager-checkbox">
                <input
                  type="checkbox"
                  checked={pensionersData?.accessibility?.[feature.key] || false}
                  onChange={(e) => updateAccessibility(feature.key, e.target.checked)}
                  disabled={disabled}
                />
                <span className="pensioners-specific-manager-checkbox-checkmark"></span>
                <div className="pensioners-specific-manager-checkbox-content">
                  <FontAwesomeIcon icon={feature.icon} className="pensioners-specific-manager-checkbox-icon" />
                  <div>
                    <h6>{t(`clubForm.pensioners.accessibility.${feature.title}.title`)}</h6>
                    <p>{t(`clubForm.pensioners.accessibility.${feature.description}`)}</p>
                  </div>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Special Programs section
  const renderSpecialProgramsSection = () => (
    <div className="pensioners-specific-manager-tab-content">
      <div className="pensioners-specific-manager-section-header">
        <h4>
          <FontAwesomeIcon icon={faBrain} className="pensioners-specific-manager-section-icon" />
          {t('clubForm.pensioners.specialPrograms.title')}
        </h4>
        <p>{t('clubForm.pensioners.specialPrograms.description')}</p>
      </div>

      {/* Memory Activities */}
      <div className="pensioners-specific-manager-subsection">
        <h5>{t('clubForm.pensioners.specialPrograms.memoryActivities.title')}</h5>
        
        {/* Add Form */}
        {showAddMemoryActivityForm && (
          <div className="pensioners-specific-manager-add-form">
            <div className="pensioners-specific-manager-form-header">
              <h6>{t('clubForm.pensioners.specialPrograms.memoryActivities.addNew')}</h6>
              <button 
                className="pensioners-specific-manager-close-btn"
                onClick={() => setShowAddMemoryActivityForm(false)}
              >
                <FontAwesomeIcon icon={faTimes} className="pensioners-specific-manager-close-icon" />
              </button>
            </div>

            <div className="pensioners-specific-manager-form-grid">
              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faBrain} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.specialPrograms.memoryActivities.fields.name')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.specialPrograms.memoryActivities.placeholders.name')}
                  value={newMemoryActivity.name}
                  onChange={(e) => setNewMemoryActivity({...newMemoryActivity, name: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faCalendarAlt} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.specialPrograms.memoryActivities.fields.frequency')}
                </label>
                <select
                  className="pensioners-specific-manager-form-select"
                  value={newMemoryActivity.frequency}
                  onChange={(e) => setNewMemoryActivity({...newMemoryActivity, frequency: e.target.value})}
                  disabled={disabled}
                >
                  {frequencyOptions.slice(0, 6).map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faUserFriends} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.specialPrograms.memoryActivities.fields.instructor')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.specialPrograms.memoryActivities.placeholders.instructor')}
                  value={newMemoryActivity.instructor}
                  onChange={(e) => setNewMemoryActivity({...newMemoryActivity, instructor: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faUsers} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.specialPrograms.memoryActivities.fields.participants')}
                </label>
                <input
                  type="number"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.specialPrograms.memoryActivities.placeholders.participants')}
                  value={newMemoryActivity.participants}
                  onChange={(e) => setNewMemoryActivity({...newMemoryActivity, participants: parseInt(e.target.value) || 0})}
                  disabled={disabled}
                  min="0"
                />
              </div>

              <div className="pensioners-specific-manager-form-group pensioners-specific-manager-full-width">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faInfoCircle} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.specialPrograms.memoryActivities.fields.description')}
                </label>
                <textarea
                  className="pensioners-specific-manager-form-textarea"
                  placeholder={t('clubForm.pensioners.specialPrograms.memoryActivities.placeholders.description')}
                  value={newMemoryActivity.description}
                  onChange={(e) => setNewMemoryActivity({...newMemoryActivity, description: e.target.value})}
                  disabled={disabled}
                  rows={3}
                />
              </div>
            </div>

            <div className="pensioners-specific-manager-form-actions">
              <button
                type="button"
                className="pensioners-specific-manager-btn pensioners-specific-manager-btn-cancel"
                onClick={() => setShowAddMemoryActivityForm(false)}
                disabled={disabled}
              >
                <FontAwesomeIcon icon={faTimes} className="pensioners-specific-manager-btn-icon" />
                {t('clubForm.pensioners.actions.cancel')}
              </button>
              
              <button
                type="button"
                className="pensioners-specific-manager-btn pensioners-specific-manager-btn-add"
                onClick={addMemoryActivity}
                disabled={disabled || !newMemoryActivity.name.trim()}
              >
                <FontAwesomeIcon icon={faCheck} className="pensioners-specific-manager-btn-icon" />
                {t('clubForm.pensioners.actions.add')}
              </button>
            </div>
          </div>
        )}

        {/* Memory Activities List */}
        {(pensionersData?.specialPrograms?.memoryActivities?.length > 0) ? (
          <div className="pensioners-specific-manager-activities-list">
            {pensionersData.specialPrograms.memoryActivities.map((activity, index) => (
              <div key={index} className="pensioners-specific-manager-activity-item">
                <div className="pensioners-specific-manager-activity-icon">
                  <FontAwesomeIcon icon={faBrain} className="pensioners-specific-manager-brain-icon" />
                </div>
                <div className="pensioners-specific-manager-activity-content">
                  <h6>{activity.name}</h6>
                  <div className="pensioners-specific-manager-activity-meta">
                    <span>
                      <FontAwesomeIcon icon={faCalendarAlt} className="pensioners-specific-manager-meta-icon" />
                      {frequencyOptions.find(f => f.value === activity.frequency)?.label || activity.frequency}
                    </span>
                    {activity.instructor && (
                      <span>
                        <FontAwesomeIcon icon={faUserFriends} className="pensioners-specific-manager-meta-icon" />
                        {activity.instructor}
                      </span>
                    )}
                    {activity.participants > 0 && (
                      <span>
                        <FontAwesomeIcon icon={faUsers} className="pensioners-specific-manager-meta-icon" />
                        {activity.participants} {t('clubForm.pensioners.participants')}
                      </span>
                    )}
                  </div>
                  {activity.description && (
                    <p className="pensioners-specific-manager-activity-description">{activity.description}</p>
                  )}
                </div>
                <div className="pensioners-specific-manager-activity-actions">
                  <button
                    className="pensioners-specific-manager-action-btn pensioners-specific-manager-edit-btn"
                    onClick={() => setEditingMemoryActivityIndex(index)}
                    disabled={disabled}
                  >
                    <FontAwesomeIcon icon={faEdit} className="pensioners-specific-manager-action-icon" />
                  </button>
                  <button
                    className="pensioners-specific-manager-action-btn pensioners-specific-manager-delete-btn"
                    onClick={() => removeMemoryActivity(index)}
                    disabled={disabled}
                  >
                    <FontAwesomeIcon icon={faTrash} className="pensioners-specific-manager-action-icon" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="pensioners-specific-manager-empty-state">
            <FontAwesomeIcon icon={faBrain} className="pensioners-specific-manager-empty-icon" />
            <p>{t('clubForm.pensioners.specialPrograms.memoryActivities.empty')}</p>
          </div>
        )}

        {!showAddMemoryActivityForm && (
          <div className="pensioners-specific-manager-add-section">
            <button
              className="pensioners-specific-manager-add-btn"
              onClick={() => setShowAddMemoryActivityForm(true)}
              disabled={disabled}
            >
              <FontAwesomeIcon icon={faPlus} className="pensioners-specific-manager-add-icon" />
              {t('clubForm.pensioners.specialPrograms.memoryActivities.addNew')}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Render Age Specific Needs section
  const renderAgeSpecificNeedsSection = () => (
    <div className="pensioners-specific-manager-tab-content">
      <div className="pensioners-specific-manager-section-header">
        <h4>
          <FontAwesomeIcon icon={faHeartbeat} className="pensioners-specific-manager-section-icon" />
          {t('clubForm.pensioners.ageSpecificNeeds.title')}
        </h4>
        <p>{t('clubForm.pensioners.ageSpecificNeeds.description')}</p>
      </div>

      {/* Medication Reminders */}
      <div className="pensioners-specific-manager-subsection">
        <div className="pensioners-specific-manager-checkbox-item">
          <label className="pensioners-specific-manager-checkbox">
            <input
              type="checkbox"
              checked={pensionersData?.ageSpecificNeeds?.medicationReminders || false}
              onChange={(e) => updateAgeSpecificNeeds('medicationReminders', e.target.checked)}
              disabled={disabled}
            />
            <span className="pensioners-specific-manager-checkbox-checkmark"></span>
            <div className="pensioners-specific-manager-checkbox-content">
              <FontAwesomeIcon icon={faPills} className="pensioners-specific-manager-checkbox-icon" />
              <div>
                <h6>{t('clubForm.pensioners.ageSpecificNeeds.medicationReminders.title')}</h6>
                <p>{t('clubForm.pensioners.ageSpecificNeeds.medicationReminders.description')}</p>
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pensioners-specific-manager">
      
      {/* Header */}
      <div className="pensioners-specific-manager-header">
        <h3 className="pensioners-specific-manager-title">
          <FontAwesomeIcon icon={faUserMd} className="pensioners-specific-manager-title-icon" />
          {t('clubForm.pensioners.title')}
        </h3>
        <p className="pensioners-specific-manager-subtitle">
          {t('clubForm.pensioners.subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className="pensioners-specific-manager-tabs">
        {pensionersTabs.map(tab => (
          <button
            key={tab.id}
            className={`pensioners-specific-manager-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            disabled={disabled}
          >
            <FontAwesomeIcon icon={tab.icon} className="pensioners-specific-manager-tab-icon" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pensioners-specific-manager-content">
        {activeTab === 'healthServices' && renderHealthServicesSection()}
        {activeTab === 'supportServices' && renderSupportServicesSection()}
        {activeTab === 'accessibility' && renderAccessibilitySection()}
        {activeTab === 'specialPrograms' && renderSpecialProgramsSection()}
        {activeTab === 'ageSpecificNeeds' && renderAgeSpecificNeedsSection()}
      </div>

    </div>
  );
};

export default PensionersSpecificManager;