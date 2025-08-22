import React, { useState } from 'react';
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
  faRepeat
} from '@fortawesome/free-solid-svg-icons';
import './activitiesManager.css';

const ActivitiesManager = ({ 
  activitiesData, 
  onActivitiesChange, 
  disabled = false 
}) => {
  const { t } = useTranslation();
  
  const [editingActivity, setEditingActivity] = useState(null);
  const [newActivity, setNewActivity] = useState({
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

  // Activity types
  const activityTypes = [
    { value: 'regular', label: t('clubForm.activities.types.regular'), icon: faRepeat },
    { value: 'event', label: t('clubForm.activities.types.event'), icon: faCalendarCheck },
    { value: 'workshop', label: t('clubForm.activities.types.workshop'), icon: faGraduationCap },
    { value: 'seasonal', label: t('clubForm.activities.types.seasonal'), icon: faCalendarDay }
  ];

  // Activity categories
  const activityCategories = [
    { value: 'general', label: t('clubForm.activities.categories.general'), icon: faUsers },
    { value: 'cultural', label: t('clubForm.activities.categories.cultural'), icon: faPalette },
    { value: 'sports', label: t('clubForm.activities.categories.sports'), icon: faDumbbell },
    { value: 'educational', label: t('clubForm.activities.categories.educational'), icon: faBook },
    { value: 'social', label: t('clubForm.activities.categories.social'), icon: faHeart },
    { value: 'entertainment', label: t('clubForm.activities.categories.entertainment'), icon: faGamepad },
    { value: 'music', label: t('clubForm.activities.categories.music'), icon: faMusic },
    { value: 'arts', label: t('clubForm.activities.categories.arts'), icon: faTheaterMasks },
    { value: 'charity', label: t('clubForm.activities.categories.charity'), icon: faHandHoldingHeart }
  ];

  // Frequency options
  const frequencyOptions = [
    { value: 'daily', label: t('clubForm.activities.frequency.daily') },
    { value: 'weekly', label: t('clubForm.activities.frequency.weekly') },
    { value: 'biweekly', label: t('clubForm.activities.frequency.biweekly') },
    { value: 'monthly', label: t('clubForm.activities.frequency.monthly') },
    { value: 'onetime', label: t('clubForm.activities.frequency.onetime') }
  ];

  // Days of week
  const daysOfWeek = [
    { value: 1, label: t('clubForm.activities.days.monday') },
    { value: 2, label: t('clubForm.activities.days.tuesday') },
    { value: 3, label: t('clubForm.activities.days.wednesday') },
    { value: 4, label: t('clubForm.activities.days.thursday') },
    { value: 5, label: t('clubForm.activities.days.friday') },
    { value: 6, label: t('clubForm.activities.days.saturday') },
    { value: 0, label: t('clubForm.activities.days.sunday') }
  ];

  // Fee periods
  const feePeriods = [
    { value: 'session', label: t('clubForm.activities.feePeriods.session') },
    { value: 'monthly', label: t('clubForm.activities.feePeriods.monthly') },
    { value: 'package', label: t('clubForm.activities.feePeriods.package') },
    { value: 'annual', label: t('clubForm.activities.feePeriods.annual') }
  ];

  // Equipment/Material options
  const equipmentOptions = [
    'Столове', 'Маси', 'Проектор', 'Компютър', 'Звукова система', 
    'Микрофон', 'Спортно оборудване', 'Хартия и химикали', 
    'Музикални инструменти', 'Художествени материали', 'Кухненски принадлежности'
  ];

  // Handle field changes
  const handleFieldChange = (field, value) => {
    const updatedActivities = { ...activitiesData };
    
    if (field.includes('.')) {
      const keys = field.split('.');
      let current = updatedActivities;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
    } else {
      updatedActivities[field] = value;
    }
    
    onActivitiesChange(updatedActivities);
  };

  // Handle new activity field changes
  const handleNewActivityChange = (field, value) => {
    if (field.includes('.')) {
      const keys = field.split('.');
      const updated = { ...newActivity };
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      setNewActivity(updated);
    } else {
      setNewActivity({ ...newActivity, [field]: value });
    }
  };

  // Add new activity
  const addActivity = () => {
    if (!newActivity.name.trim()) return;
    
    const activities = [...(activitiesData.list || [])];
    activities.push({ ...newActivity, id: Date.now() });
    
    handleFieldChange('list', activities);
    setNewActivity({
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

  // Remove activity
  const removeActivity = (activityIndex) => {
    const activities = [...(activitiesData.list || [])];
    activities.splice(activityIndex, 1);
    handleFieldChange('list', activities);
  };

  // Toggle equipment
  const toggleEquipment = (equipment) => {
    const currentEquipment = newActivity.equipment || [];
    const updatedEquipment = currentEquipment.includes(equipment)
      ? currentEquipment.filter(e => e !== equipment)
      : [...currentEquipment, equipment];
    
    handleNewActivityChange('equipment', updatedEquipment);
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const cat = activityCategories.find(c => c.value === category);
    return cat ? cat.icon : faUsers;
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

      {/* Activities List */}
      {(activitiesData?.list?.length > 0) && (
        <div className="activities-manager-section">
          <h4 className="activities-manager-section-title">
            <FontAwesomeIcon icon={faCalendarCheck} />
            {t('clubForm.activities.currentActivities')}
          </h4>
          
          <div className="activities-manager-list">
            {activitiesData.list.map((activity, index) => (
              <div key={activity.id || index} className="activities-manager-activity-card">
                
                <div className="activities-manager-activity-header">
                  <div className="activities-manager-activity-icon">
                    <FontAwesomeIcon icon={getCategoryIcon(activity.category)} />
                  </div>
                  <div className="activities-manager-activity-info">
                    <h5>{activity.name}</h5>
                    <div className="activities-manager-activity-meta">
                      <span className="activities-manager-activity-type">
                        {activityTypes.find(t => t.value === activity.type)?.label}
                      </span>
                      <span className="activities-manager-activity-category">
                        {activityCategories.find(c => c.value === activity.category)?.label}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="activities-manager-remove-btn"
                    onClick={() => removeActivity(index)}
                    disabled={disabled}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>

                <div className="activities-manager-activity-content">
                  {activity.description && (
                    <p className="activities-manager-activity-description">
                      {activity.description}
                    </p>
                  )}

                  <div className="activities-manager-activity-details">
                    
                    {/* Schedule */}
                    <div className="activities-manager-detail-item">
                      <FontAwesomeIcon icon={faClock} />
                      <span>
                        {frequencyOptions.find(f => f.value === activity.schedule.frequency)?.label}
                        {activity.schedule.frequency !== 'onetime' && (
                          <>
                            {' - '}
                            {daysOfWeek.find(d => d.value === activity.schedule.dayOfWeek)?.label}
                            {' '}
                            {activity.schedule.startTime}
                            {' '}
                            ({activity.schedule.duration} мин)
                          </>
                        )}
                      </span>
                    </div>

                    {/* Age Group */}
                    <div className="activities-manager-detail-item">
                      <FontAwesomeIcon icon={faUsers} />
                      <span>
                        {t('clubForm.activities.ageRange')}: {activity.ageGroup.min}-{activity.ageGroup.max} {t('clubForm.activities.years')}
                      </span>
                    </div>

                    {/* Capacity */}
                    <div className="activities-manager-detail-item">
                      <FontAwesomeIcon icon={faUsers} />
                      <span>
                        {t('clubForm.activities.capacity')}: {activity.capacity.min}-{activity.capacity.max} {t('clubForm.activities.people')}
                      </span>
                    </div>

                    {/* Fee */}
                    {activity.fee.required && (
                      <div className="activities-manager-detail-item">
                        <FontAwesomeIcon icon={faEuroSign} />
                        <span>
                          {activity.fee.amount} лв. / {feePeriods.find(p => p.value === activity.fee.period)?.label}
                        </span>
                      </div>
                    )}

                    {/* Instructor */}
                    {activity.instructor && (
                      <div className="activities-manager-detail-item">
                        <FontAwesomeIcon icon={faUser} />
                        <span>{activity.instructor}</span>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Activity */}
      <div className="activities-manager-section">
        <h4 className="activities-manager-section-title">
          <FontAwesomeIcon icon={faPlus} />
          {t('clubForm.activities.addNewActivity')}
        </h4>
        
        <div className="activities-manager-add-form">
          
          {/* Basic Info */}
          <div className="activities-manager-form-row">
            <div className="activities-manager-form-group">
              <label className="activities-manager-form-label">
                {t('clubForm.activities.fields.name')}
              </label>
              <input
                type="text"
                className="activities-manager-form-input"
                placeholder={t('clubForm.activities.placeholders.name')}
                value={newActivity.name}
                onChange={(e) => handleNewActivityChange('name', e.target.value)}
                disabled={disabled}
              />
            </div>

            <div className="activities-manager-form-group">
              <label className="activities-manager-form-label">
                {t('clubForm.activities.fields.type')}
              </label>
              <select
                className="activities-manager-form-select"
                value={newActivity.type}
                onChange={(e) => handleNewActivityChange('type', e.target.value)}
                disabled={disabled}
              >
                {activityTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="activities-manager-form-group">
              <label className="activities-manager-form-label">
                {t('clubForm.activities.fields.category')}
              </label>
              <select
                className="activities-manager-form-select"
                value={newActivity.category}
                onChange={(e) => handleNewActivityChange('category', e.target.value)}
                disabled={disabled}
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
          <div className="activities-manager-form-group">
            <label className="activities-manager-form-label">
              {t('clubForm.activities.fields.description')}
            </label>
            <textarea
              className="activities-manager-form-textarea"
              placeholder={t('clubForm.activities.placeholders.description')}
              value={newActivity.description}
              onChange={(e) => handleNewActivityChange('description', e.target.value)}
              disabled={disabled}
              rows={3}
            />
          </div>

          {/* Schedule */}
          <div className="activities-manager-schedule-section">
            <h5 className="activities-manager-subsection-title">
              <FontAwesomeIcon icon={faClock} />
              {t('clubForm.activities.scheduleSection')}
            </h5>
            
            <div className="activities-manager-form-row">
              <div className="activities-manager-form-group">
                <label className="activities-manager-form-label">
                  {t('clubForm.activities.fields.frequency')}
                </label>
                <select
                  className="activities-manager-form-select"
                  value={newActivity.schedule.frequency}
                  onChange={(e) => handleNewActivityChange('schedule.frequency', e.target.value)}
                  disabled={disabled}
                >
                  {frequencyOptions.map(freq => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>

              {newActivity.schedule.frequency !== 'onetime' && (
                <>
                  <div className="activities-manager-form-group">
                    <label className="activities-manager-form-label">
                      {t('clubForm.activities.fields.dayOfWeek')}
                    </label>
                    <select
                      className="activities-manager-form-select"
                      value={newActivity.schedule.dayOfWeek}
                      onChange={(e) => handleNewActivityChange('schedule.dayOfWeek', parseInt(e.target.value))}
                      disabled={disabled}
                    >
                      {daysOfWeek.map(day => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="activities-manager-form-group">
                    <label className="activities-manager-form-label">
                      {t('clubForm.activities.fields.startTime')}
                    </label>
                    <input
                      type="time"
                      className="activities-manager-form-input"
                      value={newActivity.schedule.startTime}
                      onChange={(e) => handleNewActivityChange('schedule.startTime', e.target.value)}
                      disabled={disabled}
                    />
                  </div>

                  <div className="activities-manager-form-group">
                    <label className="activities-manager-form-label">
                      {t('clubForm.activities.fields.duration')} (мин)
                    </label>
                    <input
                      type="number"
                      className="activities-manager-form-input"
                      placeholder="60"
                      value={newActivity.schedule.duration}
                      onChange={(e) => handleNewActivityChange('schedule.duration', parseInt(e.target.value) || 60)}
                      disabled={disabled}
                      min="15"
                      max="480"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Participants */}
          <div className="activities-manager-participants-section">
            <h5 className="activities-manager-subsection-title">
              <FontAwesomeIcon icon={faUsers} />
              {t('clubForm.activities.participantsSection')}
            </h5>
            
            <div className="activities-manager-form-row">
              <div className="activities-manager-form-group">
                <label className="activities-manager-form-label">
                  {t('clubForm.activities.fields.minAge')}
                </label>
                <input
                  type="number"
                  className="activities-manager-form-input"
                  placeholder="18"
                  value={newActivity.ageGroup.min}
                  onChange={(e) => handleNewActivityChange('ageGroup.min', parseInt(e.target.value) || 18)}
                  disabled={disabled}
                  min="0"
                  max="100"
                />
              </div>

              <div className="activities-manager-form-group">
                <label className="activities-manager-form-label">
                  {t('clubForm.activities.fields.maxAge')}
                </label>
                <input
                  type="number"
                  className="activities-manager-form-input"
                  placeholder="100"
                  value={newActivity.ageGroup.max}
                  onChange={(e) => handleNewActivityChange('ageGroup.max', parseInt(e.target.value) || 100)}
                  disabled={disabled}
                  min="0"
                  max="100"
                />
              </div>

              <div className="activities-manager-form-group">
                <label className="activities-manager-form-label">
                  {t('clubForm.activities.fields.minCapacity')}
                </label>
                <input
                  type="number"
                  className="activities-manager-form-input"
                  placeholder="1"
                  value={newActivity.capacity.min}
                  onChange={(e) => handleNewActivityChange('capacity.min', parseInt(e.target.value) || 1)}
                  disabled={disabled}
                  min="1"
                />
              </div>

              <div className="activities-manager-form-group">
                <label className="activities-manager-form-label">
                  {t('clubForm.activities.fields.maxCapacity')}
                </label>
                <input
                  type="number"
                  className="activities-manager-form-input"
                  placeholder="20"
                  value={newActivity.capacity.max}
                  onChange={(e) => handleNewActivityChange('capacity.max', parseInt(e.target.value) || 20)}
                  disabled={disabled}
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Fee */}
          <div className="activities-manager-fee-section">
            <h5 className="activities-manager-subsection-title">
              <FontAwesomeIcon icon={faEuroSign} />
              {t('clubForm.activities.feeSection')}
            </h5>
            
            <div className="activities-manager-fee-toggle">
              <label className="activities-manager-checkbox-label">
                <input
                  type="checkbox"
                  checked={newActivity.fee.required}
                  onChange={(e) => handleNewActivityChange('fee.required', e.target.checked)}
                  disabled={disabled}
                />
                <span className="activities-manager-checkbox"></span>
                {t('clubForm.activities.fields.feeRequired')}
              </label>
            </div>

            {newActivity.fee.required && (
              <div className="activities-manager-form-row">
                <div className="activities-manager-form-group">
                  <label className="activities-manager-form-label">
                    {t('clubForm.activities.fields.feeAmount')}
                  </label>
                  <input
                    type="number"
                    className="activities-manager-form-input"
                    placeholder="0"
                    value={newActivity.fee.amount}
                    onChange={(e) => handleNewActivityChange('fee.amount', parseFloat(e.target.value) || 0)}
                    disabled={disabled}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="activities-manager-form-group">
                  <label className="activities-manager-form-label">
                    {t('clubForm.activities.fields.feePeriod')}
                  </label>
                  <select
                    className="activities-manager-form-select"
                    value={newActivity.fee.period}
                    onChange={(e) => handleNewActivityChange('fee.period', e.target.value)}
                    disabled={disabled}
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
          <div className="activities-manager-additional-section">
            <h5 className="activities-manager-subsection-title">
              <FontAwesomeIcon icon={faInfoCircle} />
              {t('clubForm.activities.additionalSection')}
            </h5>
            
            <div className="activities-manager-form-row">
              <div className="activities-manager-form-group">
                <label className="activities-manager-form-label">
                  {t('clubForm.activities.fields.instructor')}
                </label>
                <input
                  type="text"
                  className="activities-manager-form-input"
                  placeholder={t('clubForm.activities.placeholders.instructor')}
                  value={newActivity.instructor}
                  onChange={(e) => handleNewActivityChange('instructor', e.target.value)}
                  disabled={disabled}
                />
              </div>
            </div>

            <div className="activities-manager-form-group">
              <label className="activities-manager-form-label">
                {t('clubForm.activities.fields.requirements')}
              </label>
              <textarea
                className="activities-manager-form-textarea"
                placeholder={t('clubForm.activities.placeholders.requirements')}
                value={newActivity.requirements}
                onChange={(e) => handleNewActivityChange('requirements', e.target.value)}
                disabled={disabled}
                rows={2}
              />
            </div>

            {/* Equipment */}
            <div className="activities-manager-equipment">
              <label className="activities-manager-form-label">
                <FontAwesomeIcon icon={faTools} />
                {t('clubForm.activities.fields.equipment')}
              </label>
              <div className="activities-manager-equipment-grid">
                {equipmentOptions.map(equipment => (
                  <label
                    key={equipment}
                    className="activities-manager-equipment-item"
                  >
                    <input
                      type="checkbox"
                      checked={newActivity.equipment.includes(equipment)}
                      onChange={() => toggleEquipment(equipment)}
                      disabled={disabled}
                    />
                    <span className="activities-manager-equipment-checkbox"></span>
                    <span className="activities-manager-equipment-label">{equipment}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Add Button */}
          <div className="activities-manager-add-actions">
            <button
              type="button"
              className="activities-manager-add-btn"
              onClick={addActivity}
              disabled={disabled || !newActivity.name.trim()}
            >
              <FontAwesomeIcon icon={faPlus} />
              {t('clubForm.activities.actions.addActivity')}
            </button>
          </div>
        </div>
      </div>

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