// src/components/AdminAcademySeminarsList/SeminarCard/SeminarCard.jsx
// Prefix: asmc-

import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import {
  Pencil, Eye, EyeOff, Trash2, XCircle,
  Calendar, Clock, Users, MapPin, UserCheck,
} from 'lucide-react';
import './seminarCard.css';

const SeminarCard = ({ seminar, actionLoading, onPublishToggle, onDelete, onCancel }) => {
  const { t } = useTranslation('academy-admin');
  const navigate = useLocalizedNavigate();

  const getStatusBadgeClass = () => {
    if (seminar.status === 'cancelled') return 'asmc-badge-cancelled';
    if (seminar.status === 'live') return 'asmc-badge-live';
    if (seminar.status === 'completed') return 'asmc-badge-completed';
    if (seminar.status === 'scheduled') return 'asmc-badge-scheduled';
    if (!seminar.isPublished) return 'asmc-badge-draft';
    return 'asmc-badge-published';
  };

  const getStatusLabel = () => {
    if (seminar.status === 'cancelled') return t('seminarCard.statuses.cancelled', 'Отменен');
    if (seminar.status === 'live') return t('seminarCard.statuses.live', 'В МОМЕНТА');
    if (seminar.status === 'completed') return t('seminarCard.statuses.completed', 'Приключил');
    if (seminar.status === 'scheduled') return t('seminarCard.statuses.scheduled', 'Насрочен');
    if (!seminar.isPublished) return t('seminarCard.statuses.draft', 'Чернова');
    return t('seminarCard.statuses.published', 'Публикуван');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('bg-BG', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const isDisabled = actionLoading === seminar.id;

  return (
    <div className={`asmc-card ${!seminar.isPublished && seminar.status !== 'live' ? 'asmc-card-draft' : ''}`}>
      {/* Thumbnail — server-side fallback fills thumbnailUrl from first
          uploaded video; if neither cover nor video exists we render the
          default academy OG image so the card never looks broken. */}
      <div className="asmc-card-thumb">
        <img
          src={seminar.thumbnailUrl || '/images/academy/academy-seminars-og.jpg'}
          alt={seminar.title}
          className="asmc-card-img"
        />

        <span className={`asmc-badge ${getStatusBadgeClass()}`}>
          {seminar.status === 'live' && <span className="asmc-live-dot" />}
          {getStatusLabel()}
        </span>

        <span className="asmc-badge asmc-badge-type">
          {t(`seminarCard.types.${seminar.seminarType}`, seminar.seminarType)}
        </span>
      </div>

      {/* Body */}
      <div className="asmc-card-body">
        {seminar.category && (
          <span className="asmc-card-category">{seminar.category}</span>
        )}
        <h3 className="asmc-card-title">{seminar.title}</h3>
        {seminar.shortDescription && (
          <p className="asmc-card-desc">{seminar.shortDescription}</p>
        )}

        {/* Facilitators — lead + count badge */}
        {(() => {
          const facs = Array.isArray(seminar.facilitators) && seminar.facilitators.length > 0
            ? seminar.facilitators
            : seminar.facilitator
              ? [{ type: 'mentor', name: seminar.facilitator.name, photoUrl: seminar.facilitator.photoUrl, isLead: true }]
              : [];
          if (facs.length === 0) return null;
          const lead = facs.find(f => f.isLead) || facs[0];
          const extra = facs.length - 1;
          return (
            <div className="asmc-card-facilitator">
              {lead.photoUrl ? (
                <img src={lead.photoUrl} alt={lead.name} className="asmc-facilitator-avatar" />
              ) : (
                <div className="asmc-facilitator-avatar-placeholder">
                  {(lead.name || '?')[0]}
                </div>
              )}
              <span className="asmc-facilitator-name">
                {lead.name}
                {extra > 0 && <span className="asmc-facilitator-extra">+{extra}</span>}
              </span>
            </div>
          );
        })()}

        {/* Stats */}
        <div className="asmc-card-stats">
          <div className="asmc-card-stat" title={t('seminarCard.date', 'Дата')}>
            <Calendar size={14} />
            <span>{formatDate(seminar.scheduledDate)}</span>
          </div>
          {seminar.durationMinutes > 0 && (
            <div className="asmc-card-stat" title={t('seminarCard.duration', 'Продължителност')}>
              <Clock size={14} />
              <span>{seminar.durationMinutes} {t('seminarCard.min', 'мин.')}</span>
            </div>
          )}
          <div className="asmc-card-stat" title={t('seminarCard.registered', 'Записани')}>
            <Users size={14} />
            <span>
              {seminar.registeredCount || 0}
              {seminar.maxParticipants ? ` / ${seminar.maxParticipants}` : ''}
            </span>
          </div>
          {(seminar.location || seminar.address) && (
            <div className="asmc-card-stat asmc-card-stat-location" title={t('seminarCard.location', 'Място')}>
              <MapPin size={14} />
              <span>{seminar.location || seminar.address}</span>
            </div>
          )}
        </div>

        {/* Approval badge */}
        {seminar.requiresApproval && (
          <div className="asmc-card-approval">
            <UserCheck size={13} />
            <span>{t('seminarCard.requiresApproval', 'Изисква одобрение')}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="asmc-card-actions">
        <button
          className="asmc-action-btn asmc-action-edit"
          onClick={() => navigate(`/academy/admin/edit-seminar/${seminar.slug}`)}
          title={t('seminarCard.actions.edit', 'Редактирай')}
        >
          <Pencil size={15} />
        </button>

        <button
          className={`asmc-action-btn ${seminar.isPublished ? 'asmc-action-unpublish' : 'asmc-action-publish'}`}
          onClick={() => onPublishToggle(seminar)}
          disabled={isDisabled || seminar.status === 'cancelled'}
          title={seminar.isPublished
            ? t('seminarCard.actions.unpublish', 'Скрий')
            : t('seminarCard.actions.publish', 'Публикувай')}
        >
          {seminar.isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>

        {seminar.status !== 'cancelled' && seminar.status !== 'completed' && (
          <button
            className="asmc-action-btn asmc-action-cancel"
            onClick={() => onCancel(seminar)}
            disabled={isDisabled}
            title={t('seminarCard.actions.cancel', 'Отмени')}
          >
            <XCircle size={15} />
          </button>
        )}

        <button
          className="asmc-action-btn asmc-action-delete"
          onClick={() => onDelete(seminar)}
          disabled={isDisabled}
          title={t('seminarCard.actions.delete', 'Изтрий')}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};

export default SeminarCard;