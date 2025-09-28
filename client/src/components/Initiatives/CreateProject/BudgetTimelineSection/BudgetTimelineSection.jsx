// components/Projects/ProjectCreateForm/BudgetTimelineSection/BudgetTimelineSection.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import './budgetTimelineSection.css'; // Assuming you have a CSS file for styles
const BudgetTimelineSection = ({
    values,
    errors,
    onChangeHandler,
    onBlurHandler,
    setValues,
    addMilestone,
    removeMilestone,
    calculateDuration,
    formatDate
}) => {
    const { t } = useTranslation();

    return (
        <div className="project-form-section-card">
            <div className="project-form-section-header">
                <h2 className="project-form-section-title">
                    💰
                    {t('projects.create.budgetTimeline')}
                </h2>
            </div>
            <div className="project-form-section-content">

                {/* 💰 BUDGET SECTION */}
                <div className="project-budget-section">
                    <h3>💰 {t('projects.create.budget')}</h3>

                    <div className="project-form-row">
                        {/* Budget Goal */}
                        <div className="project-form-group-budget">
                            <label htmlFor="budgetGoal">
                                {t('projects.create.budgetGoal')}
                            </label>
                            <div className="project-budget-input-group">
                                <input
                                    type="number"
                                    id="budgetGoal"
                                    name="budget.goal"
                                    value={values.budget?.goal || ''}
                                    onChange={onChangeHandler}
                                    onBlur={onBlurHandler}
                                    className={errors['budget.goal'] ? 'error' : ''}
                                    placeholder="0"
                                    min="0"
                                    step="100"
                                />
                                <select
                                    name="budget.currency"
                                    value={values.budget?.currency || 'BGN'}
                                    onChange={onChangeHandler}
                                    className="project-budget-currency-select" // 🔧 СПЕЦИФИЧЕН КЛАС
                                >
                                    <option value="BGN">BGN</option>
                                    <option value="EUR">EUR</option>
                                    <option value="USD">USD</option>
                                    <option value="GBP">GBP</option>
                                </select>
                            </div>
                            <div className="project-field-help">
                                {t('projects.create.budget-goal-help')}
                            </div>
                            {errors['budget.goal'] && <div className="project-error-message">{errors['budget.goal']}</div>}
                        </div>

                        {/* Budget Total */}
                        <div className="project-form-group-budget">
                            <label htmlFor="budgetTotal">
                                {t('projects.create.budgetTotal')}
                            </label>
                            <div className="project-budget-input-group">
                                <input
                                    type="number"
                                    id="budgetTotal"
                                    name="budget.total"
                                    value={values.budget?.total || ''}
                                    onChange={onChangeHandler}
                                    onBlur={onBlurHandler}
                                    className={errors['budget.total'] ? 'error' : ''}
                                    placeholder="0"
                                    min="0"
                                    step="100"
                                />
                                <span className="project-currency-display">{values.budget?.currency || 'BGN'}</span>
                            </div>
                            <div className="project-field-help">
                                {t('projects.create.budget-total-help')}
                            </div>
                            {errors['budget.total'] && <div className="project-error-message">{errors['budget.total']}</div>}
                        </div>
                    </div>

                    <div className="project-form-row">
                        {/* Budget Funded */}
                        <div className="project-form-group-budget">
                            <label htmlFor="budgetFunded">
                                {t('projects.create.budgetFunded')}
                            </label>
                            <div className="project-budget-input-group">
                                <input
                                    type="number"
                                    id="budgetFunded"
                                    name="budget.funded"
                                    value={values.budget?.funded || ''}
                                    onChange={onChangeHandler}
                                    onBlur={onBlurHandler}
                                    className={errors['budget.funded'] ? 'error' : ''}
                                    placeholder="0"
                                    min="0"
                                    step="100"
                                />
                                <span className="project-currency-display">{values.budget?.currency || 'BGN'}</span>
                            </div>
                            <div className="project-field-help">
                                {t('projects.create.budget-funded-help')}
                            </div>
                            {errors['budget.funded'] && <div className="project-error-message">{errors['budget.funded']}</div>}
                        </div>

                        {/* Budget Progress Visual */}
                        {values.budget?.total && values.budget?.funded && (
                            <div className="project-budget-progress">
                                <h4>📊 {t('projects.create.fundingProgress')}</h4>
                                <div className="project-funding-bar">
                                    <div
                                        className="project-funding-fill"
                                        style={{
                                            width: `${Math.min((values.budget.funded / values.budget.total) * 100, 100)}%`
                                        }}
                                    ></div>
                                </div>
                                <div className="project-funding-stats">
                                    <span>{parseInt(values.budget.funded).toLocaleString()} {values.budget.currency}</span>
                                    <span>/</span>
                                    <span>{parseInt(values.budget.total).toLocaleString()} {values.budget.currency}</span>
                                    <span className="project-funding-percentage">
                                        ({Math.round((values.budget.funded / values.budget.total) * 100)}%)
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ⏰ TIMELINE SECTION */}
                <div className="project-timeline-section">
                    <h3>⏰ {t('projects.create.timeline')}</h3>

                    <div className="project-form-row">
                        {/* Start Date */}
                        <div className="project-form-group-budget">
                            <label htmlFor="startDate">
                                {t('projects.create.startDate')}
                                <span className="project-required-indicator">*</span>
                            </label>
                            <input
                                type="date"
                                id="startDate"
                                name="timeline.startDate"
                                value={values.timeline?.startDate ? new Date(values.timeline.startDate).toISOString().split('T')[0] : ''}
                                onChange={onChangeHandler}
                                onBlur={onBlurHandler}
                                className={errors['timeline.startDate'] ? 'error' : ''}
                            />
                            <div className="project-field-help">
                                {t('projects.create.start-date-help')}
                            </div>
                            {errors['timeline.startDate'] && <div className="project-error-message">{errors['timeline.startDate']}</div>}
                        </div>

                        {/* End Date */}
                        <div className="project-form-group-budget">
                            <label htmlFor="endDate">
                                {t('projects.create.endDate')}
                            </label>
                            <input
                                type="date"
                                id="endDate"
                                name="timeline.endDate"
                                value={values.timeline?.endDate ? new Date(values.timeline.endDate).toISOString().split('T')[0] : ''}
                                onChange={onChangeHandler}
                                onBlur={onBlurHandler}
                                className={errors['timeline.endDate'] ? 'error' : ''}
                                min={values.timeline?.startDate ? new Date(values.timeline.startDate).toISOString().split('T')[0] : ''}
                            />
                            <div className="project-field-help">
                                {t('projects.create.end-date-help')}
                            </div>
                            {errors['timeline.endDate'] && <div className="project-error-message">{errors['timeline.endDate']}</div>}
                        </div>
                    </div>

                    {/* Duration Display */}
                    {values.timeline?.startDate && values.timeline?.endDate && (
                        <div className="project-duration-display">
                            <h4>📅 {t('projects.create.duration')}</h4>
                            <span className="project-duration-value">
                                {calculateDuration(values.timeline.startDate, values.timeline.endDate)} {t('projects.create.days')}
                            </span>
                        </div>
                    )}
                </div>

                {/* 🎯 MILESTONES SECTION */}
                <div className="project-milestones-section">
                    <div className="project-dynamic-section-header">
                        <h3>🎯 {t('projects.create.milestones')}</h3>
                        <button
                            type="button"
                            className="project-form-btn accent"
                            onClick={addMilestone}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            {t('projects.create.addMilestone')}
                        </button>
                    </div>
                    <div className="project-field-help">
                        {t('projects.create.milestones-help')}
                    </div>

                    {values.milestones?.length === 0 ? (
                        <div className="project-empty-milestones">
                            <p>{t('projects.create.noMilestones')}</p>
                            <button
                                type="button"
                                className="project-form-btn primary"
                                onClick={addMilestone}
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                {t('projects.create.addFirstMilestone')}
                            </button>
                        </div>
                    ) : (
                        <div className="project-milestones-list">
                            {values.milestones.map((milestone, index) => (
                                <div key={index} className="project-milestone-item">
                                    <div className="project-milestone-header">
                                        <h5>
                                            {t('projects.create.milestoneNumber', { number: index + 1 })}
                                            {(errors[`milestones[${index}].title`] || errors[`milestones[${index}].dueDate`]) && (
                                                <span className="project-error-indicator">⚠️</span>
                                            )}
                                        </h5>
                                        <button
                                            type="button"
                                            className="project-remove-milestone-btn"  
                                            onClick={() => removeMilestone(index)}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                            {t('projects.create.remove')}
                                        </button>
                                    </div>

                                  <div className="project-milestone-fields">
  <div className="project-milestone-title-field">
    <label>{t('projects.create.milestoneTitle')}</label>
    <input
      type="text"
      value={milestone.title || ''}
      onChange={(e) => {
        const updatedMilestones = [...values.milestones];
        updatedMilestones[index] = {
          ...updatedMilestones[index],
          title: e.target.value
        };
        setValues(prev => ({ ...prev, milestones: updatedMilestones }));
      }}
      placeholder={t('projects.create.milestoneTitlePlaceholder')}
      className={errors[`milestones[${index}].title`] ? 'error' : ''}
    />
    {errors[`milestones[${index}].title`] && (
      <div className="project-error-message">{errors[`milestones[${index}].title`]}</div>
    )}
  </div>

  <div className="project-milestone-date-field">
    <label>{t('projects.create.milestoneDate')}</label>
    <input
      type="date"
      value={milestone.dueDate ? new Date(milestone.dueDate).toISOString().split('T')[0] : ''}
      onChange={(e) => {
        const updatedMilestones = [...values.milestones];
        updatedMilestones[index] = {
          ...updatedMilestones[index],
          dueDate: e.target.value
        };
        setValues(prev => ({ ...prev, milestones: updatedMilestones }));
      }}
      min={values.timeline?.startDate ? new Date(values.timeline.startDate).toISOString().split('T')[0] : ''}
      max={values.timeline?.endDate ? new Date(values.timeline.endDate).toISOString().split('T')[0] : ''}
      className={errors[`milestones[${index}].dueDate`] ? 'error' : ''}
    />
    {errors[`milestones[${index}].dueDate`] && (
      <div className="project-error-message">{errors[`milestones[${index}].dueDate`]}</div>
    )}
  </div>

  {/* 🆕 ДОБАВИ СТАТУС ПОЛЕТО */}
  <div className="project-milestone-status-field">
    <label>{t('projects.create.milestoneStatus')}</label>
    <select
      value={milestone.status || 'pending'}
      onChange={(e) => {
        const updatedMilestones = [...values.milestones];
        updatedMilestones[index] = {
          ...updatedMilestones[index],
          status: e.target.value
        };
        setValues(prev => ({ ...prev, milestones: updatedMilestones }));
      }}
      className={errors[`milestones[${index}].status`] ? 'error' : ''}
    >
      <option value="pending">{t('projects.milestones.status.pending')}</option>
      <option value="in-progress">{t('projects.milestones.status.inProgress')}</option>
      <option value="completed">{t('projects.milestones.status.completed')}</option>
      <option value="cancelled">{t('projects.milestones.status.cancelled')}</option>
    </select>
    {errors[`milestones[${index}].status`] && (
      <div className="project-error-message">{errors[`milestones[${index}].status`]}</div>
    )}
  </div>

  <div className="project-milestone-description-field">
    <label>{t('projects.create.milestoneDescription')}</label>
    <textarea
      value={milestone.description || ''}
      onChange={(e) => {
        const updatedMilestones = [...values.milestones];
        updatedMilestones[index] = {
          ...updatedMilestones[index],
          description: e.target.value
        };
        setValues(prev => ({ ...prev, milestones: updatedMilestones }));
      }}
      placeholder={t('projects.create.milestoneDescriptionPlaceholder')}
      rows={2}
      className={errors[`milestones[${index}].description`] ? 'error' : ''}
      maxLength={500}
    />
    <div className="project-character-count">
      {milestone.description?.length || 0}/500
    </div>
    {errors[`milestones[${index}].description`] && (
      <div className="project-error-message">{errors[`milestones[${index}].description`]}</div>
    )}
  </div>
</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Timeline Visual Preview */}
                    {values.timeline?.startDate && values.timeline?.endDate && values.milestones?.length > 0 && (
                        <div className="project-timeline-preview">
                            <h4>📊 {t('projects.create.timelinePreview')}</h4>
                            <div className="project-timeline-visual">
                                <div className="project-timeline-point project-timeline-start">
                                    <div className="project-timeline-dot"></div>
                                    <span className="project-timeline-date">{formatDate(values.timeline.startDate)}</span>
                                    <span className="project-timeline-label">{t('projects.create.start')}</span>
                                </div>

                                {values.milestones
                                    .filter(m => m.dueDate)
                                    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                                    .map((milestone, index) => (
                                        <div key={index} className="project-timeline-point project-timeline-milestone">
                                            <div className="project-timeline-dot project-milestone-dot"></div>
                                            <span className="project-timeline-date">{formatDate(milestone.dueDate)}</span>
                                            <span className="project-timeline-label">{milestone.title || milestone.description}</span>
                                        </div>
                                    ))}

                                <div className="project-timeline-point project-timeline-end">
                                    <div className="project-timeline-dot"></div>
                                    <span className="project-timeline-date">{formatDate(values.timeline.endDate)}</span>
                                    <span className="project-timeline-label">{t('projects.create.end')}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default BudgetTimelineSection;