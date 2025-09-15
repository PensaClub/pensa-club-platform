// useClubStatus.js
import { useTranslation } from 'react-i18next';

export const useClubStatus = (status) => {
  const { t } = useTranslation();
  
  const statusMap = {
    active: {
      className: 'active',
      label: t('clubs.ClubHero.status.activeClub'),
      color: '#22c55e',
      bgColor: 'rgba(34, 197, 94, 0.1)',
      borderColor: 'rgba(34, 197, 94, 0.3)'
    },
    inactive: {
      className: 'inactive', 
      label: t('clubs.ClubHero.status.inactiveClub'),
      color: '#9ca3af',
      bgColor: 'rgba(156, 163, 175, 0.1)',
      borderColor: 'rgba(156, 163, 175, 0.3)'
    },
    suspended: {
      className: 'suspended',
      label: t('clubs.ClubHero.status.suspendedClub'), 
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      borderColor: 'rgba(239, 68, 68, 0.3)'
    },
    draft: {
      className: 'draft',
      label: t('clubs.ClubHero.status.draftClub'),
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      borderColor: 'rgba(245, 158, 11, 0.3)'
    },
    rejected: {
      className: 'rejected',
      label: t('clubs.ClubHero.status.rejectedClub'),
      color: '#dc2626',
      bgColor: 'rgba(220, 38, 38, 0.1)',
      borderColor: 'rgba(220, 38, 38, 0.3)'
    }
  };

  return statusMap[status] || {
    className: 'unknown',
    label: t('clubs.ClubHero.status.unknownStatus'),
    color: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.1)',
    borderColor: 'rgba(107, 114, 128, 0.3)'
  };
};