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
  faShieldAlt,
  faChild,
  faHands,
  faMedkit
} from '@fortawesome/free-solid-svg-icons';
import './pensionersSpecificManager.css';

const PensionersSpecificManager = ({ 
  pensionersData, 
  onPensionersChange, 
  disabled = false 
}) => {
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState('healthServices');
  
  // Form visibility states
  const [showAddHealthLectureForm, setShowAddHealthLectureForm] = useState(false);
  const [showAddMedicalPartnerForm, setShowAddMedicalPartnerForm] = useState(false);
  const [showAddMemoryActivityForm, setShowAddMemoryActivityForm] = useState(false);
  const [showAddIntergenerationalForm, setShowAddIntergenerationalForm] = useState(false);
  const [showAddVolunteerProgramForm, setShowAddVolunteerProgramForm] = useState(false);
  const [showAddMentalHealthForm, setShowAddMentalHealthForm] = useState(false);
  const [showAddLowImpactActivityForm, setShowAddLowImpactActivityForm] = useState(false);
  const [showAddNutritionSupportForm, setShowAddNutritionSupportForm] = useState(false);
  
  // Editing states
  const [editingHealthLectureIndex, setEditingHealthLectureIndex] = useState(-1);
  const [editingMedicalPartnerIndex, setEditingMedicalPartnerIndex] = useState(-1);
  const [editingMemoryActivityIndex, setEditingMemoryActivityIndex] = useState(-1);
  const [editingIntergenerationalIndex, setEditingIntergenerationalIndex] = useState(-1);
  const [editingVolunteerProgramIndex, setEditingVolunteerProgramIndex] = useState(-1);
  const [editingMentalHealthIndex, setEditingMentalHealthIndex] = useState(-1);
  const [editingLowImpactActivityIndex, setEditingLowImpactActivityIndex] = useState(-1);
  const [editingNutritionSupportIndex, setEditingNutritionSupportIndex] = useState(-1);
  
  // Form states
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

  // Helper states for arrays
  const [newEmergencyContact, setNewEmergencyContact] = useState('');
  const [newSpecialNeed, setNewSpecialNeed] = useState('');

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

  // Memory activity frequency options
  const memoryFrequencyOptions = [
    { value: 'дневно', label: t('clubForm.pensioners.frequency.daily') },
    { value: 'седмично', label: t('clubForm.pensioners.frequency.weekly') },
    { value: 'два пъти седмично', label: t('clubForm.pensioners.frequency.twiceWeekly') },
    { value: 'три пъти седмично', label: t('clubForm.pensioners.frequency.thriceWeekly') },
    { value: 'месечно', label: t('clubForm.pensioners.frequency.monthly') }
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

  // Health Lectures functions
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

  // Medical Partners functions
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

  // Emergency Protocol functions
  const updateEmergencyProtocol = (field, value) => {
    const currentProtocol = pensionersData?.healthServices?.emergencyProtocol || {};
    updateHealthServices('emergencyProtocol', {
      ...currentProtocol,
      [field]: value
    });
  };

  const addEmergencyContact = () => {
    if (!newEmergencyContact.trim()) return;
    
    const currentContacts = pensionersData?.healthServices?.emergencyProtocol?.emergencyContacts || [];
    const updatedContacts = [...currentContacts, newEmergencyContact.trim()];
    updateEmergencyProtocol('emergencyContacts', updatedContacts);
    setNewEmergencyContact('');
  };

  const removeEmergencyContact = (index) => {
    const currentContacts = pensionersData?.healthServices?.emergencyProtocol?.emergencyContacts || [];
    const updatedContacts = currentContacts.filter((_, i) => i !== index);
    updateEmergencyProtocol('emergencyContacts', updatedContacts);
  };

  const addSpecialNeed = () => {
    if (!newSpecialNeed.trim()) return;
    
    const currentNeeds = pensionersData?.healthServices?.emergencyProtocol?.specialNeeds || [];
    const updatedNeeds = [...currentNeeds, newSpecialNeed.trim()];
    updateEmergencyProtocol('specialNeeds', updatedNeeds);
    setNewSpecialNeed('');
  };

  const removeSpecialNeed = (index) => {
    const currentNeeds = pensionersData?.healthServices?.emergencyProtocol?.specialNeeds || [];
    const updatedNeeds = currentNeeds.filter((_, i) => i !== index);
    updateEmergencyProtocol('specialNeeds', updatedNeeds);
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

  // Memory Activities functions
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

  // Intergenerational Programs functions
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

  const editIntergenerationalProgram = (index, updatedProgram) => {
    const currentPrograms = pensionersData?.specialPrograms?.intergenerationalPrograms || [];
    const updatedPrograms = currentPrograms.map((program, i) => 
      i === index ? updatedProgram : program
    );
    updateSpecialPrograms('intergenerationalPrograms', updatedPrograms);
    setEditingIntergenerationalIndex(-1);
  };

  const removeIntergenerationalProgram = (index) => {
    const currentPrograms = pensionersData?.specialPrograms?.intergenerationalPrograms || [];
    const updatedPrograms = currentPrograms.filter((_, i) => i !== index);
    updateSpecialPrograms('intergenerationalPrograms', updatedPrograms);
  };

  // Volunteer Programs functions
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

  const editVolunteerProgram = (index, updatedProgram) => {
    const currentPrograms = pensionersData?.specialPrograms?.volunteerPrograms || [];
    const updatedPrograms = currentPrograms.map((program, i) => 
      i === index ? updatedProgram : program
    );
    updateSpecialPrograms('volunteerPrograms', updatedPrograms);
    setEditingVolunteerProgramIndex(-1);
  };

  const removeVolunteerProgram = (index) => {
    const currentPrograms = pensionersData?.specialPrograms?.volunteerPrograms || [];
    const updatedPrograms = currentPrograms.filter((_, i) => i !== index);
    updateSpecialPrograms('volunteerPrograms', updatedPrograms);
  };

  // Mental Health Support functions
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

  const editMentalHealthSupport = (index, updatedSupport) => {
    const currentSupport = pensionersData?.specialPrograms?.mentalHealthSupport || [];
    const updatedSupportList = currentSupport.map((support, i) => 
      i === index ? updatedSupport : support
    );
    updateSpecialPrograms('mentalHealthSupport', updatedSupportList);
    setEditingMentalHealthIndex(-1);
  };

  const removeMentalHealthSupport = (index) => {
    const currentSupport = pensionersData?.specialPrograms?.mentalHealthSupport || [];
    const updatedSupport = currentSupport.filter((_, i) => i !== index);
    updateSpecialPrograms('mentalHealthSupport', updatedSupport);
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

  // Low Impact Activities functions
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

  const editLowImpactActivity = (index, updatedActivity) => {
    const currentActivities = pensionersData?.ageSpecificNeeds?.lowImpactActivities || [];
    const updatedActivities = currentActivities.map((activity, i) => 
      i === index ? updatedActivity : activity
    );
    updateAgeSpecificNeeds('lowImpactActivities', updatedActivities);
    setEditingLowImpactActivityIndex(-1);
  };

  const removeLowImpactActivity = (index) => {
    const currentActivities = pensionersData?.ageSpecificNeeds?.lowImpactActivities || [];
    const updatedActivities = currentActivities.filter((_, i) => i !== index);
    updateAgeSpecificNeeds('lowImpactActivities', updatedActivities);
  };

  // Nutrition Support functions
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

  const editNutritionSupport = (index, updatedSupport) => {
    const currentSupport = pensionersData?.ageSpecificNeeds?.nutritionSupport || [];
    const updatedSupportList = currentSupport.map((support, i) => 
      i === index ? updatedSupport : support
    );
    updateAgeSpecificNeeds('nutritionSupport', updatedSupportList);
    setEditingNutritionSupportIndex(-1);
  };

  const removeNutritionSupport = (index) => {
    const currentSupport = pensionersData?.ageSpecificNeeds?.nutritionSupport || [];
    const updatedSupport = currentSupport.filter((_, i) => i !== index);
    updateAgeSpecificNeeds('nutritionSupport', updatedSupport);
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

      {/* Medical Partners */}
      <div className="pensioners-specific-manager-subsection">
        <h5>{t('clubForm.pensioners.healthServices.medicalPartners.title')}</h5>
        
        {showAddMedicalPartnerForm && (
          <div className="pensioners-specific-manager-add-form">
            <div className="pensioners-specific-manager-form-header">
              <h6>{t('clubForm.pensioners.healthServices.medicalPartners.addNew')}</h6>
              <button 
                className="pensioners-specific-manager-close-btn"
                onClick={() => setShowAddMedicalPartnerForm(false)}
              >
                <FontAwesomeIcon icon={faTimes} className="pensioners-specific-manager-close-icon" />
              </button>
            </div>

            <div className="pensioners-specific-manager-form-grid">
              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faBuilding} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.healthServices.medicalPartners.fields.name')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.healthServices.medicalPartners.placeholders.name')}
                  value={newMedicalPartner.name}
                  onChange={(e) => setNewMedicalPartner({...newMedicalPartner, name: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faMedkit} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.healthServices.medicalPartners.fields.service')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.healthServices.medicalPartners.placeholders.service')}
                  value={newMedicalPartner.service}
                  onChange={(e) => setNewMedicalPartner({...newMedicalPartner, service: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faPhone} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.healthServices.medicalPartners.fields.contact')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.healthServices.medicalPartners.placeholders.contact')}
                  value={newMedicalPartner.contact}
                  onChange={(e) => setNewMedicalPartner({...newMedicalPartner, contact: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.healthServices.medicalPartners.fields.address')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.healthServices.medicalPartners.placeholders.address')}
                  value={newMedicalPartner.address}
                  onChange={(e) => setNewMedicalPartner({...newMedicalPartner, address: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faClock} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.healthServices.medicalPartners.fields.workingHours')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.healthServices.medicalPartners.placeholders.workingHours')}
                  value={newMedicalPartner.workingHours}
                  onChange={(e) => setNewMedicalPartner({...newMedicalPartner, workingHours: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faChartLine} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.healthServices.medicalPartners.fields.discount')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.healthServices.medicalPartners.placeholders.discount')}
                  value={newMedicalPartner.discount}
                  onChange={(e) => setNewMedicalPartner({...newMedicalPartner, discount: e.target.value})}
                  disabled={disabled}
                />
              </div>
            </div>

            <div className="pensioners-specific-manager-form-actions">
              <button
                type="button"
                className="pensioners-specific-manager-btn pensioners-specific-manager-btn-cancel"
                onClick={() => setShowAddMedicalPartnerForm(false)}
                disabled={disabled}
              >
                <FontAwesomeIcon icon={faTimes} className="pensioners-specific-manager-btn-icon" />
                {t('clubForm.pensioners.actions.cancel')}
              </button>
              
              <button
                type="button"
                className="pensioners-specific-manager-btn pensioners-specific-manager-btn-add"
                onClick={addMedicalPartner}
                disabled={disabled || !newMedicalPartner.name.trim()}
              >
                <FontAwesomeIcon icon={faCheck} className="pensioners-specific-manager-btn-icon" />
                {t('clubForm.pensioners.actions.add')}
              </button>
            </div>
          </div>
        )}

        {/* Medical Partners List */}
        {(pensionersData?.healthServices?.medicalPartners?.length > 0) ? (
          <div className="pensioners-specific-manager-partners-list">
            {pensionersData.healthServices.medicalPartners.map((partner, index) => (
              <div key={index} className="pensioners-specific-manager-partner-item">
                <div className="pensioners-specific-manager-partner-content">
                  <h6>{partner.name}</h6>
                  <div className="pensioners-specific-manager-partner-meta">
                    {partner.service && (
                      <span>
                        <FontAwesomeIcon icon={faMedkit} className="pensioners-specific-manager-meta-icon" />
                        {partner.service}
                      </span>
                    )}
                    {partner.contact && (
                      <span>
                        <FontAwesomeIcon icon={faPhone} className="pensioners-specific-manager-meta-icon" />
                        {partner.contact}
                      </span>
                    )}
                    {partner.discount && (
                      <span>
                        <FontAwesomeIcon icon={faChartLine} className="pensioners-specific-manager-meta-icon" />
                        {partner.discount}
                      </span>
                    )}
                  </div>
                  {partner.address && (
                    <p className="pensioners-specific-manager-partner-address">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="pensioners-specific-manager-meta-icon" />
                      {partner.address}
                    </p>
                  )}
                </div>
                <div className="pensioners-specific-manager-partner-actions">
                  <button
                    className="pensioners-specific-manager-action-btn pensioners-specific-manager-edit-btn"
                    onClick={() => setEditingMedicalPartnerIndex(index)}
                    disabled={disabled}
                  >
                    <FontAwesomeIcon icon={faEdit} className="pensioners-specific-manager-action-icon" />
                  </button>
                  <button
                    className="pensioners-specific-manager-action-btn pensioners-specific-manager-delete-btn"
                    onClick={() => removeMedicalPartner(index)}
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
            <FontAwesomeIcon icon={faMedkit} className="pensioners-specific-manager-empty-icon" />
            <p>{t('clubForm.pensioners.healthServices.medicalPartners.empty')}</p>
          </div>
        )}

        {!showAddMedicalPartnerForm && (
          <div className="pensioners-specific-manager-add-section">
            <button
              className="pensioners-specific-manager-add-btn"
              onClick={() => setShowAddMedicalPartnerForm(true)}
              disabled={disabled}
            >
              <FontAwesomeIcon icon={faPlus} className="pensioners-specific-manager-add-icon" />
              {t('clubForm.pensioners.healthServices.medicalPartners.addNew')}
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

          {/* Emergency Contacts */}
          <div className="pensioners-specific-manager-form-group">
            <label className="pensioners-specific-manager-form-label">
              <FontAwesomeIcon icon={faPhone} className="pensioners-specific-manager-label-icon" />
              {t('clubForm.pensioners.healthServices.emergencyProtocol.emergencyContacts')}
            </label>
            
            {(pensionersData?.healthServices?.emergencyProtocol?.emergencyContacts?.length > 0) && (
              <div className="pensioners-specific-manager-tags-list">
                {pensionersData.healthServices.emergencyProtocol.emergencyContacts.map((contact, index) => (
                  <div key={index} className="pensioners-specific-manager-tag">
                    <span>{contact}</span>
                    <button
                      className="pensioners-specific-manager-tag-remove"
                      onClick={() => removeEmergencyContact(index)}
                      disabled={disabled}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="pensioners-specific-manager-add-input">
              <input
                type="text"
                className="pensioners-specific-manager-form-input"
                placeholder={t('clubForm.pensioners.healthServices.emergencyProtocol.emergencyContactsPlaceholder')}
                value={newEmergencyContact}
                onChange={(e) => setNewEmergencyContact(e.target.value)}
                disabled={disabled}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addEmergencyContact();
                  }
                }}
              />
              <button
                className="pensioners-specific-manager-add-input-btn"
                onClick={addEmergencyContact}
                disabled={disabled || !newEmergencyContact.trim()}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
          </div>

          {/* Special Needs */}
          <div className="pensioners-specific-manager-form-group">
            <label className="pensioners-specific-manager-form-label">
              <FontAwesomeIcon icon={faInfoCircle} className="pensioners-specific-manager-label-icon" />
              {t('clubForm.pensioners.healthServices.emergencyProtocol.specialNeeds')}
            </label>
            
            {(pensionersData?.healthServices?.emergencyProtocol?.specialNeeds?.length > 0) && (
              <div className="pensioners-specific-manager-tags-list">
                {pensionersData.healthServices.emergencyProtocol.specialNeeds.map((need, index) => (
                  <div key={index} className="pensioners-specific-manager-tag">
                    <span>{need}</span>
                    <button
                      className="pensioners-specific-manager-tag-remove"
                      onClick={() => removeSpecialNeed(index)}
                      disabled={disabled}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="pensioners-specific-manager-add-input">
              <input
                type="text"
                className="pensioners-specific-manager-form-input"
                placeholder={t('clubForm.pensioners.healthServices.emergencyProtocol.specialNeedsPlaceholder')}
                value={newSpecialNeed}
                onChange={(e) => setNewSpecialNeed(e.target.value)}
                disabled={disabled}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSpecialNeed();
                  }
                }}
              />
              <button
                className="pensioners-specific-manager-add-input-btn"
                onClick={addSpecialNeed}
                disabled={disabled || !newSpecialNeed.trim()}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
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
                  {memoryFrequencyOptions.map(option => (
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
                      {memoryFrequencyOptions.find(f => f.value === activity.frequency)?.label || activity.frequency}
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

      {/* Intergenerational Programs */}
      <div className="pensioners-specific-manager-subsection">
        <h5>{t('clubForm.pensioners.specialPrograms.intergenerationalPrograms.title')}</h5>
        
        {showAddIntergenerationalForm && (
          <div className="pensioners-specific-manager-add-form">
            <div className="pensioners-specific-manager-form-header">
              <h6>{t('clubForm.pensioners.specialPrograms.intergenerationalPrograms.addNew')}</h6>
              <button 
                className="pensioners-specific-manager-close-btn"
                onClick={() => setShowAddIntergenerationalForm(false)}
              >
                <FontAwesomeIcon icon={faTimes} className="pensioners-specific-manager-close-icon" />
              </button>
            </div>

            <div className="pensioners-specific-manager-form-grid">
              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faChild} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.specialPrograms.intergenerationalPrograms.fields.name')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.specialPrograms.intergenerationalPrograms.placeholders.name')}
                  value={newIntergenerationalProgram.name}
                  onChange={(e) => setNewIntergenerationalProgram({...newIntergenerationalProgram, name: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faCalendarAlt} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.specialPrograms.intergenerationalPrograms.fields.frequency')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.specialPrograms.intergenerationalPrograms.placeholders.frequency')}
                  value={newIntergenerationalProgram.frequency}
                  onChange={(e) => setNewIntergenerationalProgram({...newIntergenerationalProgram, frequency: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faUsers} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.specialPrograms.intergenerationalPrograms.fields.participants')}
                </label>
                <input
                  type="number"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.specialPrograms.intergenerationalPrograms.placeholders.participants')}
                  value={newIntergenerationalProgram.participants}
                  onChange={(e) => setNewIntergenerationalProgram({...newIntergenerationalProgram, participants: parseInt(e.target.value) || 0})}
                  disabled={disabled}
                  min="0"
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faChild} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.specialPrograms.intergenerationalPrograms.fields.ageRange')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.specialPrograms.intergenerationalPrograms.placeholders.ageRange')}
                  value={newIntergenerationalProgram.ageRange}
                  onChange={(e) => setNewIntergenerationalProgram({...newIntergenerationalProgram, ageRange: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faUserFriends} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.specialPrograms.intergenerationalPrograms.fields.coordinator')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.specialPrograms.intergenerationalPrograms.placeholders.coordinator')}
                  value={newIntergenerationalProgram.coordinator}
                  onChange={(e) => setNewIntergenerationalProgram({...newIntergenerationalProgram, coordinator: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.specialPrograms.intergenerationalPrograms.fields.venue')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.specialPrograms.intergenerationalPrograms.placeholders.venue')}
                  value={newIntergenerationalProgram.venue}
                  onChange={(e) => setNewIntergenerationalProgram({...newIntergenerationalProgram, venue: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group pensioners-specific-manager-full-width">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faInfoCircle} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.specialPrograms.intergenerationalPrograms.fields.description')}
                </label>
                <textarea
                  className="pensioners-specific-manager-form-textarea"
                  placeholder={t('clubForm.pensioners.specialPrograms.intergenerationalPrograms.placeholders.description')}
                  value={newIntergenerationalProgram.description}
                  onChange={(e) => setNewIntergenerationalProgram({...newIntergenerationalProgram, description: e.target.value})}
                  disabled={disabled}
                  rows={3}
                />
              </div>
            </div>

            <div className="pensioners-specific-manager-form-actions">
              <button
                type="button"
                className="pensioners-specific-manager-btn pensioners-specific-manager-btn-cancel"
                onClick={() => setShowAddIntergenerationalForm(false)}
                disabled={disabled}
              >
                <FontAwesomeIcon icon={faTimes} className="pensioners-specific-manager-btn-icon" />
                {t('clubForm.pensioners.actions.cancel')}
              </button>
              
              <button
                type="button"
                className="pensioners-specific-manager-btn pensioners-specific-manager-btn-add"
                onClick={addIntergenerationalProgram}
                disabled={disabled || !newIntergenerationalProgram.name.trim()}
              >
                <FontAwesomeIcon icon={faCheck} className="pensioners-specific-manager-btn-icon" />
                {t('clubForm.pensioners.actions.add')}
              </button>
            </div>
          </div>
        )}

        {(pensionersData?.specialPrograms?.intergenerationalPrograms?.length > 0) ? (
          <div className="pensioners-specific-manager-activities-list">
            {pensionersData.specialPrograms.intergenerationalPrograms.map((program, index) => (
              <div key={index} className="pensioners-specific-manager-activity-item">
                <div className="pensioners-specific-manager-activity-icon">
                  <FontAwesomeIcon icon={faChild} className="pensioners-specific-manager-brain-icon" />
                </div>
                <div className="pensioners-specific-manager-activity-content">
                  <h6>{program.name}</h6>
                  <div className="pensioners-specific-manager-activity-meta">
                    {program.frequency && (
                      <span>
                        <FontAwesomeIcon icon={faCalendarAlt} className="pensioners-specific-manager-meta-icon" />
                        {program.frequency}
                      </span>
                    )}
                    {program.ageRange && (
                      <span>
                        <FontAwesomeIcon icon={faChild} className="pensioners-specific-manager-meta-icon" />
                        {program.ageRange}
                      </span>
                    )}
                    {program.participants > 0 && (
                      <span>
                        <FontAwesomeIcon icon={faUsers} className="pensioners-specific-manager-meta-icon" />
                        {program.participants} {t('clubForm.pensioners.participants')}
                      </span>
                    )}
                  </div>
                  {program.description && (
                    <p className="pensioners-specific-manager-activity-description">{program.description}</p>
                  )}
                </div>
                <div className="pensioners-specific-manager-activity-actions">
                  <button
                    className="pensioners-specific-manager-action-btn pensioners-specific-manager-edit-btn"
                    onClick={() => setEditingIntergenerationalIndex(index)}
                    disabled={disabled}
                  >
                    <FontAwesomeIcon icon={faEdit} className="pensioners-specific-manager-action-icon" />
                  </button>
                  <button
                    className="pensioners-specific-manager-action-btn pensioners-specific-manager-delete-btn"
                    onClick={() => removeIntergenerationalProgram(index)}
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
            <FontAwesomeIcon icon={faChild} className="pensioners-specific-manager-empty-icon" />
            <p>{t('clubForm.pensioners.specialPrograms.intergenerationalPrograms.empty')}</p>
          </div>
        )}

        {!showAddIntergenerationalForm && (
          <div className="pensioners-specific-manager-add-section">
            <button
              className="pensioners-specific-manager-add-btn"
              onClick={() => setShowAddIntergenerationalForm(true)}
              disabled={disabled}
            >
              <FontAwesomeIcon icon={faPlus} className="pensioners-specific-manager-add-icon" />
              {t('clubForm.pensioners.specialPrograms.intergenerationalPrograms.addNew')}
            </button>
          </div>
        )}
      </div>

      {/* Volunteer Programs */}
      <div className="pensioners-specific-manager-subsection">
        <h5>{t('clubForm.pensioners.specialPrograms.volunteerPrograms.title')}</h5>
        
        {showAddVolunteerProgramForm && (
          <div className="pensioners-specific-manager-add-form">
            <div className="pensioners-specific-manager-form-header">
              <h6>{t('clubForm.pensioners.specialPrograms.volunteerPrograms.addNew')}</h6>
              <button 
                className="pensioners-specific-manager-close-btn"
                onClick={() => setShowAddVolunteerProgramForm(false)}
              >
                <FontAwesomeIcon icon={faTimes} className="pensioners-specific-manager-close-icon" />
              </button>
            </div>

            <div className="pensioners-specific-manager-form-grid">
              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faHands} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.specialPrograms.volunteerPrograms.fields.name')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.specialPrograms.volunteerPrograms.placeholders.name')}
                  value={newVolunteerProgram.name}
                  onChange={(e) => setNewVolunteerProgram({...newVolunteerProgram, name: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faUsers} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.specialPrograms.volunteerPrograms.fields.volunteers')}
                </label>
                <input
                  type="number"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.specialPrograms.volunteerPrograms.placeholders.volunteers')}
                  value={newVolunteerProgram.volunteers}
                  onChange={(e) => setNewVolunteerProgram({...newVolunteerProgram, volunteers: parseInt(e.target.value) || 0})}
                  disabled={disabled}
                  min="0"
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faUserFriends} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.specialPrograms.volunteerPrograms.fields.coordinator')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.specialPrograms.volunteerPrograms.placeholders.coordinator')}
                  value={newVolunteerProgram.coordinator}
                  onChange={(e) => setNewVolunteerProgram({...newVolunteerProgram, coordinator: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faClock} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.specialPrograms.volunteerPrograms.fields.hoursPerWeek')}
                </label>
                <input
                  type="number"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.specialPrograms.volunteerPrograms.placeholders.hoursPerWeek')}
                  value={newVolunteerProgram.hoursPerWeek}
                  onChange={(e) => setNewVolunteerProgram({...newVolunteerProgram, hoursPerWeek: parseInt(e.target.value) || 0})}
                  disabled={disabled}
                  min="0"
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faGraduationCap} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.specialPrograms.volunteerPrograms.fields.training')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.specialPrograms.volunteerPrograms.placeholders.training')}
                  value={newVolunteerProgram.training}
                  onChange={(e) => setNewVolunteerProgram({...newVolunteerProgram, training: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group pensioners-specific-manager-full-width">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faInfoCircle} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.specialPrograms.volunteerPrograms.fields.description')}
                </label>
                <textarea
                  className="pensioners-specific-manager-form-textarea"
                  placeholder={t('clubForm.pensioners.specialPrograms.volunteerPrograms.placeholders.description')}
                  value={newVolunteerProgram.description}
                  onChange={(e) => setNewVolunteerProgram({...newVolunteerProgram, description: e.target.value})}
                  disabled={disabled}
                  rows={3}
                />
              </div>
            </div>

            <div className="pensioners-specific-manager-form-actions">
              <button
                type="button"
                className="pensioners-specific-manager-btn pensioners-specific-manager-btn-cancel"
                onClick={() => setShowAddVolunteerProgramForm(false)}
                disabled={disabled}
              >
                <FontAwesomeIcon icon={faTimes} className="pensioners-specific-manager-btn-icon" />
                {t('clubForm.pensioners.actions.cancel')}
              </button>
              
              <button
                type="button"
                className="pensioners-specific-manager-btn pensioners-specific-manager-btn-add"
                onClick={addVolunteerProgram}
                disabled={disabled || !newVolunteerProgram.name.trim()}
              >
                <FontAwesomeIcon icon={faCheck} className="pensioners-specific-manager-btn-icon" />
                {t('clubForm.pensioners.actions.add')}
              </button>
            </div>
          </div>
        )}

        {(pensionersData?.specialPrograms?.volunteerPrograms?.length > 0) ? (
          <div className="pensioners-specific-manager-activities-list">
            {pensionersData.specialPrograms.volunteerPrograms.map((program, index) => (
              <div key={index} className="pensioners-specific-manager-activity-item">
                <div className="pensioners-specific-manager-activity-icon">
                  <FontAwesomeIcon icon={faHands} className="pensioners-specific-manager-brain-icon" />
                </div>
                <div className="pensioners-specific-manager-activity-content">
                  <h6>{program.name}</h6>
                  <div className="pensioners-specific-manager-activity-meta">
                    {program.volunteers > 0 && (
                      <span>
                        <FontAwesomeIcon icon={faUsers} className="pensioners-specific-manager-meta-icon" />
                        {program.volunteers} {t('clubForm.pensioners.volunteers')}
                      </span>
                    )}
                    {program.hoursPerWeek > 0 && (
                      <span>
                        <FontAwesomeIcon icon={faClock} className="pensioners-specific-manager-meta-icon" />
                        {program.hoursPerWeek} ч./седм.
                      </span>
                    )}
                    {program.coordinator && (
                      <span>
                        <FontAwesomeIcon icon={faUserFriends} className="pensioners-specific-manager-meta-icon" />
                        {program.coordinator}
                      </span>
                    )}
                  </div>
                  {program.description && (
                    <p className="pensioners-specific-manager-activity-description">{program.description}</p>
                  )}
                </div>
                <div className="pensioners-specific-manager-activity-actions">
                  <button
                    className="pensioners-specific-manager-action-btn pensioners-specific-manager-edit-btn"
                    onClick={() => setEditingVolunteerProgramIndex(index)}
                    disabled={disabled}
                  >
                    <FontAwesomeIcon icon={faEdit} className="pensioners-specific-manager-action-icon" />
                  </button>
                  <button
                    className="pensioners-specific-manager-action-btn pensioners-specific-manager-delete-btn"
                    onClick={() => removeVolunteerProgram(index)}
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
            <FontAwesomeIcon icon={faHands} className="pensioners-specific-manager-empty-icon" />
            <p>{t('clubForm.pensioners.specialPrograms.volunteerPrograms.empty')}</p>
          </div>
        )}

        {!showAddVolunteerProgramForm && (
          <div className="pensioners-specific-manager-add-section">
            <button
              className="pensioners-specific-manager-add-btn"
              onClick={() => setShowAddVolunteerProgramForm(true)}
              disabled={disabled}
            >
              <FontAwesomeIcon icon={faPlus} className="pensioners-specific-manager-add-icon" />
              {t('clubForm.pensioners.specialPrograms.volunteerPrograms.addNew')}
            </button>
          </div>
        )}
      </div>

      {/* Mental Health Support */}
      <div className="pensioners-specific-manager-subsection">
        <h5>{t('clubForm.pensioners.specialPrograms.mentalHealthSupport.title')}</h5>
        
        {showAddMentalHealthForm && (
          <div className="pensioners-specific-manager-add-form">
            <div className="pensioners-specific-manager-form-header">
              <h6>{t('clubForm.pensioners.specialPrograms.mentalHealthSupport.addNew')}</h6>
              <button 
                className="pensioners-specific-manager-close-btn"
                onClick={() => setShowAddMentalHealthForm(false)}
              >
                <FontAwesomeIcon icon={faTimes} className="pensioners-specific-manager-close-icon" />
              </button>
            </div>

            <div className="pensioners-specific-manager-form-grid">
              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faUserMd} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.specialPrograms.mentalHealthSupport.fields.type')}
                </label>
                <select
                  className="pensioners-specific-manager-form-select"
                  value={newMentalHealthSupport.type}
                  onChange={(e) => setNewMentalHealthSupport({...newMentalHealthSupport, type: e.target.value})}
                  disabled={disabled}
                >
                  {mentalHealthTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faCalendarAlt} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.specialPrograms.mentalHealthSupport.fields.frequency')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.specialPrograms.mentalHealthSupport.placeholders.frequency')}
                  value={newMentalHealthSupport.frequency}
                  onChange={(e) => setNewMentalHealthSupport({...newMentalHealthSupport, frequency: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faUserMd} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.specialPrograms.mentalHealthSupport.fields.therapist')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.specialPrograms.mentalHealthSupport.placeholders.therapist')}
                  value={newMentalHealthSupport.therapist}
                  onChange={(e) => setNewMentalHealthSupport({...newMentalHealthSupport, therapist: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faUsers} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.specialPrograms.mentalHealthSupport.fields.participants')}
                </label>
                <input
                  type="number"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.specialPrograms.mentalHealthSupport.placeholders.participants')}
                  value={newMentalHealthSupport.participants}
                  onChange={(e) => setNewMentalHealthSupport({...newMentalHealthSupport, participants: parseInt(e.target.value) || 0})}
                  disabled={disabled}
                  min="0"
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faInfoCircle} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.specialPrograms.mentalHealthSupport.fields.focus')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.specialPrograms.mentalHealthSupport.placeholders.focus')}
                  value={newMentalHealthSupport.focus}
                  onChange={(e) => setNewMentalHealthSupport({...newMentalHealthSupport, focus: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faClock} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.specialPrograms.mentalHealthSupport.fields.availability')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.specialPrograms.mentalHealthSupport.placeholders.availability')}
                  value={newMentalHealthSupport.availability}
                  onChange={(e) => setNewMentalHealthSupport({...newMentalHealthSupport, availability: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faPhone} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.specialPrograms.mentalHealthSupport.fields.contact')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.specialPrograms.mentalHealthSupport.placeholders.contact')}
                  value={newMentalHealthSupport.contact}
                  onChange={(e) => setNewMentalHealthSupport({...newMentalHealthSupport, contact: e.target.value})}
                  disabled={disabled}
                />
              </div>
            </div>

            <div className="pensioners-specific-manager-form-actions">
              <button
                type="button"
                className="pensioners-specific-manager-btn pensioners-specific-manager-btn-cancel"
                onClick={() => setShowAddMentalHealthForm(false)}
                disabled={disabled}
              >
                <FontAwesomeIcon icon={faTimes} className="pensioners-specific-manager-btn-icon" />
                {t('clubForm.pensioners.actions.cancel')}
              </button>
              
              <button
                type="button"
                className="pensioners-specific-manager-btn pensioners-specific-manager-btn-add"
                onClick={addMentalHealthSupport}
                disabled={disabled || !newMentalHealthSupport.type.trim()}
              >
                <FontAwesomeIcon icon={faCheck} className="pensioners-specific-manager-btn-icon" />
                {t('clubForm.pensioners.actions.add')}
              </button>
            </div>
          </div>
        )}

        {(pensionersData?.specialPrograms?.mentalHealthSupport?.length > 0) ? (
          <div className="pensioners-specific-manager-activities-list">
            {pensionersData.specialPrograms.mentalHealthSupport.map((support, index) => (
              <div key={index} className="pensioners-specific-manager-activity-item">
                <div className="pensioners-specific-manager-activity-icon">
                  <FontAwesomeIcon icon={faUserMd} className="pensioners-specific-manager-brain-icon" />
                </div>
                <div className="pensioners-specific-manager-activity-content">
                  <h6>{mentalHealthTypes.find(t => t.value === support.type)?.label || support.type}</h6>
                  <div className="pensioners-specific-manager-activity-meta">
                    {support.frequency && (
                      <span>
                        <FontAwesomeIcon icon={faCalendarAlt} className="pensioners-specific-manager-meta-icon" />
                        {support.frequency}
                      </span>
                    )}
                    {support.therapist && (
                      <span>
                        <FontAwesomeIcon icon={faUserMd} className="pensioners-specific-manager-meta-icon" />
                        {support.therapist}
                      </span>
                    )}
                    {support.participants > 0 && (
                      <span>
                        <FontAwesomeIcon icon={faUsers} className="pensioners-specific-manager-meta-icon" />
                        {support.participants} {t('clubForm.pensioners.participants')}
                      </span>
                    )}
                    {support.availability && (
                      <span>
                        <FontAwesomeIcon icon={faClock} className="pensioners-specific-manager-meta-icon" />
                        {support.availability}
                      </span>
                    )}
                  </div>
                  {support.focus && (
                    <p className="pensioners-specific-manager-activity-description">
                      <strong>{t('clubForm.pensioners.specialPrograms.mentalHealthSupport.fields.focus')}:</strong> {support.focus}
                    </p>
                  )}
                </div>
                <div className="pensioners-specific-manager-activity-actions">
                  <button
                    className="pensioners-specific-manager-action-btn pensioners-specific-manager-edit-btn"
                    onClick={() => setEditingMentalHealthIndex(index)}
                    disabled={disabled}
                  >
                    <FontAwesomeIcon icon={faEdit} className="pensioners-specific-manager-action-icon" />
                  </button>
                  <button
                    className="pensioners-specific-manager-action-btn pensioners-specific-manager-delete-btn"
                    onClick={() => removeMentalHealthSupport(index)}
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
            <FontAwesomeIcon icon={faUserMd} className="pensioners-specific-manager-empty-icon" />
            <p>{t('clubForm.pensioners.specialPrograms.mentalHealthSupport.empty')}</p>
          </div>
        )}

        {!showAddMentalHealthForm && (
          <div className="pensioners-specific-manager-add-section">
            <button
              className="pensioners-specific-manager-add-btn"
              onClick={() => setShowAddMentalHealthForm(true)}
              disabled={disabled}
            >
              <FontAwesomeIcon icon={faPlus} className="pensioners-specific-manager-add-icon" />
              {t('clubForm.pensioners.specialPrograms.mentalHealthSupport.addNew')}
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

      {/* Low Impact Activities */}
      <div className="pensioners-specific-manager-subsection">
        <h5>{t('clubForm.pensioners.ageSpecificNeeds.lowImpactActivities.title')}</h5>
        
        {showAddLowImpactActivityForm && (
          <div className="pensioners-specific-manager-add-form">
            <div className="pensioners-specific-manager-form-header">
              <h6>{t('clubForm.pensioners.ageSpecificNeeds.lowImpactActivities.addNew')}</h6>
              <button 
                className="pensioners-specific-manager-close-btn"
                onClick={() => setShowAddLowImpactActivityForm(false)}
              >
                <FontAwesomeIcon icon={faTimes} className="pensioners-specific-manager-close-icon" />
              </button>
            </div>

            <div className="pensioners-specific-manager-form-grid">
              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faDumbbell} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.ageSpecificNeeds.lowImpactActivities.fields.name')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.ageSpecificNeeds.lowImpactActivities.placeholders.name')}
                  value={newLowImpactActivity.name}
                  onChange={(e) => setNewLowImpactActivity({...newLowImpactActivity, name: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faChartLine} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.ageSpecificNeeds.lowImpactActivities.fields.intensity')}
                </label>
                <select
                  className="pensioners-specific-manager-form-select"
                  value={newLowImpactActivity.intensity}
                  onChange={(e) => setNewLowImpactActivity({...newLowImpactActivity, intensity: e.target.value})}
                  disabled={disabled}
                >
                  {intensityLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faClock} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.ageSpecificNeeds.lowImpactActivities.fields.duration')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.ageSpecificNeeds.lowImpactActivities.placeholders.duration')}
                  value={newLowImpactActivity.duration}
                  onChange={(e) => setNewLowImpactActivity({...newLowImpactActivity, duration: e.target.value})}
                  disabled={disabled}
                />
              </div>
            </div>

            <div className="pensioners-specific-manager-form-actions">
              <button
                type="button"
                className="pensioners-specific-manager-btn pensioners-specific-manager-btn-cancel"
                onClick={() => setShowAddLowImpactActivityForm(false)}
                disabled={disabled}
              >
                <FontAwesomeIcon icon={faTimes} className="pensioners-specific-manager-btn-icon" />
                {t('clubForm.pensioners.actions.cancel')}
              </button>
              
              <button
                type="button"
                className="pensioners-specific-manager-btn pensioners-specific-manager-btn-add"
                onClick={addLowImpactActivity}
                disabled={disabled || !newLowImpactActivity.name.trim()}
              >
                <FontAwesomeIcon icon={faCheck} className="pensioners-specific-manager-btn-icon" />
                {t('clubForm.pensioners.actions.add')}
              </button>
            </div>
          </div>
        )}

        {(pensionersData?.ageSpecificNeeds?.lowImpactActivities?.length > 0) ? (
          <div className="pensioners-specific-manager-activities-list">
            {pensionersData.ageSpecificNeeds.lowImpactActivities.map((activity, index) => (
              <div key={index} className="pensioners-specific-manager-activity-item">
                <div className="pensioners-specific-manager-activity-icon">
                  <FontAwesomeIcon icon={faDumbbell} className="pensioners-specific-manager-brain-icon" />
                </div>
                <div className="pensioners-specific-manager-activity-content">
                  <h6>{activity.name}</h6>
                  <div className="pensioners-specific-manager-activity-meta">
                    <span>
                      <FontAwesomeIcon icon={faChartLine} className="pensioners-specific-manager-meta-icon" />
                      {intensityLevels.find(l => l.value === activity.intensity)?.label || activity.intensity}
                    </span>
                    {activity.duration && (
                      <span>
                        <FontAwesomeIcon icon={faClock} className="pensioners-specific-manager-meta-icon" />
                        {activity.duration}
                      </span>
                    )}
                  </div>
                </div>
                <div className="pensioners-specific-manager-activity-actions">
                  <button
                    className="pensioners-specific-manager-action-btn pensioners-specific-manager-edit-btn"
                    onClick={() => setEditingLowImpactActivityIndex(index)}
                    disabled={disabled}
                  >
                    <FontAwesomeIcon icon={faEdit} className="pensioners-specific-manager-action-icon" />
                  </button>
                  <button
                    className="pensioners-specific-manager-action-btn pensioners-specific-manager-delete-btn"
                    onClick={() => removeLowImpactActivity(index)}
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
            <FontAwesomeIcon icon={faDumbbell} className="pensioners-specific-manager-empty-icon" />
            <p>{t('clubForm.pensioners.ageSpecificNeeds.lowImpactActivities.empty')}</p>
          </div>
        )}

        {!showAddLowImpactActivityForm && (
          <div className="pensioners-specific-manager-add-section">
            <button
              className="pensioners-specific-manager-add-btn"
              onClick={() => setShowAddLowImpactActivityForm(true)}
              disabled={disabled}
            >
              <FontAwesomeIcon icon={faPlus} className="pensioners-specific-manager-add-icon" />
              {t('clubForm.pensioners.ageSpecificNeeds.lowImpactActivities.addNew')}
            </button>
          </div>
        )}
      </div>

      {/* Nutrition Support */}
      <div className="pensioners-specific-manager-subsection">
        <h5>{t('clubForm.pensioners.ageSpecificNeeds.nutritionSupport.title')}</h5>
        
        {showAddNutritionSupportForm && (
          <div className="pensioners-specific-manager-add-form">
            <div className="pensioners-specific-manager-form-header">
              <h6>{t('clubForm.pensioners.ageSpecificNeeds.nutritionSupport.addNew')}</h6>
              <button 
                className="pensioners-specific-manager-close-btn"
                onClick={() => setShowAddNutritionSupportForm(false)}
              >
                <FontAwesomeIcon icon={faTimes} className="pensioners-specific-manager-close-icon" />
              </button>
            </div>

            <div className="pensioners-specific-manager-form-grid">
              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faAppleAlt} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.ageSpecificNeeds.nutritionSupport.fields.service')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.ageSpecificNeeds.nutritionSupport.placeholders.service')}
                  value={newNutritionSupport.service}
                  onChange={(e) => setNewNutritionSupport({...newNutritionSupport, service: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faBuilding} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.ageSpecificNeeds.nutritionSupport.fields.provider')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.ageSpecificNeeds.nutritionSupport.placeholders.provider')}
                  value={newNutritionSupport.provider}
                  onChange={(e) => setNewNutritionSupport({...newNutritionSupport, provider: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faCalendarAlt} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.ageSpecificNeeds.nutritionSupport.fields.frequency')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.ageSpecificNeeds.nutritionSupport.placeholders.frequency')}
                  value={newNutritionSupport.frequency}
                  onChange={(e) => setNewNutritionSupport({...newNutritionSupport, frequency: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faChartLine} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.ageSpecificNeeds.nutritionSupport.fields.price')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.ageSpecificNeeds.nutritionSupport.placeholders.price')}
                  value={newNutritionSupport.price}
                  onChange={(e) => setNewNutritionSupport({...newNutritionSupport, price: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faInfoCircle} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.ageSpecificNeeds.nutritionSupport.fields.coverage')}
                </label>
                <input
                  type="text"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.ageSpecificNeeds.nutritionSupport.placeholders.coverage')}
                  value={newNutritionSupport.coverage}
                  onChange={(e) => setNewNutritionSupport({...newNutritionSupport, coverage: e.target.value})}
                  disabled={disabled}
                />
              </div>

              <div className="pensioners-specific-manager-form-group">
                <label className="pensioners-specific-manager-form-label">
                  <FontAwesomeIcon icon={faUsers} className="pensioners-specific-manager-label-icon" />
                  {t('clubForm.pensioners.ageSpecificNeeds.nutritionSupport.fields.volunteers')}
                </label>
                <input
                  type="number"
                  className="pensioners-specific-manager-form-input"
                  placeholder={t('clubForm.pensioners.ageSpecificNeeds.nutritionSupport.placeholders.volunteers')}
                  value={newNutritionSupport.volunteers}
                  onChange={(e) => setNewNutritionSupport({...newNutritionSupport, volunteers: parseInt(e.target.value) || 0})}
                  disabled={disabled}
                  min="0"
                />
              </div>
            </div>

            <div className="pensioners-specific-manager-form-actions">
              <button
                type="button"
                className="pensioners-specific-manager-btn pensioners-specific-manager-btn-cancel"
                onClick={() => setShowAddNutritionSupportForm(false)}
                disabled={disabled}
              >
                <FontAwesomeIcon icon={faTimes} className="pensioners-specific-manager-btn-icon" />
                {t('clubForm.pensioners.actions.cancel')}
              </button>
              
              <button
                type="button"
                className="pensioners-specific-manager-btn pensioners-specific-manager-btn-add"
                onClick={addNutritionSupport}
                disabled={disabled || !newNutritionSupport.service.trim()}
              >
                <FontAwesomeIcon icon={faCheck} className="pensioners-specific-manager-btn-icon" />
                {t('clubForm.pensioners.actions.add')}
              </button>
            </div>
          </div>
        )}

        {(pensionersData?.ageSpecificNeeds?.nutritionSupport?.length > 0) ? (
          <div className="pensioners-specific-manager-activities-list">
            {pensionersData.ageSpecificNeeds.nutritionSupport.map((support, index) => (
              <div key={index} className="pensioners-specific-manager-activity-item">
                <div className="pensioners-specific-manager-activity-icon">
                  <FontAwesomeIcon icon={faAppleAlt} className="pensioners-specific-manager-brain-icon" />
                </div>
                <div className="pensioners-specific-manager-activity-content">
                  <h6>{support.service}</h6>
                  <div className="pensioners-specific-manager-activity-meta">
                    {support.provider && (
                      <span>
                        <FontAwesomeIcon icon={faBuilding} className="pensioners-specific-manager-meta-icon" />
                        {support.provider}
                      </span>
                    )}
                    {support.frequency && (
                      <span>
                        <FontAwesomeIcon icon={faCalendarAlt} className="pensioners-specific-manager-meta-icon" />
                        {support.frequency}
                      </span>
                    )}
                    {support.price && (
                      <span>
                        <FontAwesomeIcon icon={faChartLine} className="pensioners-specific-manager-meta-icon" />
                        {support.price}
                      </span>
                    )}
                  </div>
                  {support.coverage && (
                    <p className="pensioners-specific-manager-activity-description">{support.coverage}</p>
                  )}
                </div>
                <div className="pensioners-specific-manager-activity-actions">
                  <button
                    className="pensioners-specific-manager-action-btn pensioners-specific-manager-edit-btn"
                    onClick={() => setEditingNutritionSupportIndex(index)}
                    disabled={disabled}
                  >
                    <FontAwesomeIcon icon={faEdit} className="pensioners-specific-manager-action-icon" />
                  </button>
                  <button
                    className="pensioners-specific-manager-action-btn pensioners-specific-manager-delete-btn"
                    onClick={() => removeNutritionSupport(index)}
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
            <FontAwesomeIcon icon={faAppleAlt} className="pensioners-specific-manager-empty-icon" />
            <p>{t('clubForm.pensioners.ageSpecificNeeds.nutritionSupport.empty')}</p>
          </div>
        )}

        {!showAddNutritionSupportForm && (
          <div className="pensioners-specific-manager-add-section">
            <button
              className="pensioners-specific-manager-add-btn"
              onClick={() => setShowAddNutritionSupportForm(true)}
              disabled={disabled}
            >
              <FontAwesomeIcon icon={faPlus} className="pensioners-specific-manager-add-icon" />
              {t('clubForm.pensioners.ageSpecificNeeds.nutritionSupport.addNew')}
            </button>
          </div>
        )}
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