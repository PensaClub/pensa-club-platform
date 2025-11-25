// src/components/AdminDigiBridgeStudents/AdminDgStudentsTable/AdminDgStudentsTable.jsx

import { useTranslation } from 'react-i18next';
import './adminDgStudentsTable.css';

export const AdminDgStudentsTable = ({
  students,
  loading,
  pagination,
  onPageChange,
  onViewDetails,
  onEdit,
  onChangeMentor,
  onSendEmail,
  onDelete,
  onStatusChange
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="adminDgStudentsTable-container">
        <div className="adminDgStudentsTable-loading">
          <div className="adminDgStudentsTable-spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="adminDgStudentsTable-container">
        <div className="adminDgStudentsTable-empty">
          <svg className="adminDgStudentsTable-emptyIcon" width="64" height="64" viewBox="0 0 64 64">
            <path d="M32 8C18.7 8 8 18.7 8 32s10.7 24 24 24 24-10.7 24-24S45.3 8 32 8zm0 44c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20z" fill="currentColor"/>
            <path d="M32 28c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z" fill="currentColor"/>
          </svg>
          <h3 className="adminDgStudentsTable-emptyTitle">
            {t('adminDigiBridgeStudents.table.noStudents')}
          </h3>
          <p className="adminDgStudentsTable-emptyText">
            {t('adminDigiBridgeStudents.table.noStudentsDesc')}
          </p>
        </div>
      </div>
    );
  }

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      active: 'adminDgStudentsTable-statusBadge--active',
      inactive: 'adminDgStudentsTable-statusBadge--inactive',
      suspended: 'adminDgStudentsTable-statusBadge--suspended'
    };
    return statusMap[status] || 'adminDgStudentsTable-statusBadge--default';
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, pagination.page - Math.floor(maxVisible / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="adminDgStudentsTable-pagination">
        <button
          className="adminDgStudentsTable-paginationBtn"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        </button>

        {startPage > 1 && (
          <>
            <button
              className="adminDgStudentsTable-paginationPage"
              onClick={() => onPageChange(1)}
              type="button"
            >
              1
            </button>
            {startPage > 2 && <span className="adminDgStudentsTable-paginationDots">...</span>}
          </>
        )}

        {pages.map(page => (
          <button
            key={page}
            className={`adminDgStudentsTable-paginationPage ${
              page === pagination.page ? 'adminDgStudentsTable-paginationPage--active' : ''
            }`}
            onClick={() => onPageChange(page)}
            type="button"
          >
            {page}
          </button>
        ))}

        {endPage < pagination.totalPages && (
          <>
            {endPage < pagination.totalPages - 1 && <span className="adminDgStudentsTable-paginationDots">...</span>}
            <button
              className="adminDgStudentsTable-paginationPage"
              onClick={() => onPageChange(pagination.totalPages)}
              type="button"
            >
              {pagination.totalPages}
            </button>
          </>
        )}

        <button
          className="adminDgStudentsTable-paginationBtn"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div className="adminDgStudentsTable-container">
      {/* Desktop Table */}
      <div className="adminDgStudentsTable-desktopView">
        <table className="adminDgStudentsTable-table">
          <thead className="adminDgStudentsTable-thead">
            <tr className="adminDgStudentsTable-tr">
              <th className="adminDgStudentsTable-th">{t('adminDigiBridgeStudents.table.student')}</th>
              <th className="adminDgStudentsTable-th">{t('adminDigiBridgeStudents.table.email')}</th>
              <th className="adminDgStudentsTable-th">{t('adminDigiBridgeStudents.table.mentor')}</th>
              <th className="adminDgStudentsTable-th">{t('adminDigiBridgeStudents.table.credits')}</th>
              <th className="adminDgStudentsTable-th">{t('adminDigiBridgeStudents.table.attendance')}</th>
              <th className="adminDgStudentsTable-th">{t('adminDigiBridgeStudents.table.status')}</th>
              <th className="adminDgStudentsTable-th adminDgStudentsTable-th--actions">
                {t('adminDigiBridgeStudents.table.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="adminDgStudentsTable-tbody">
            {students.map((student) => (
              <tr key={student.id} className="adminDgStudentsTable-tr">
                <td className="adminDgStudentsTable-td">
                  <div className="adminDgStudentsTable-studentCell">
                    <div className="adminDgStudentsTable-avatar">
                      {student.avatar ? (
                        <img src={student.avatar} alt={student.name} />
                      ) : (
                        <div className="adminDgStudentsTable-avatarPlaceholder">
                          {student.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    <span className="adminDgStudentsTable-studentName">{student.name}</span>
                  </div>
                </td>
                <td className="adminDgStudentsTable-td">
                  <span className="adminDgStudentsTable-email">{student.email}</span>
                </td>
                <td className="adminDgStudentsTable-td">
                  <span className="adminDgStudentsTable-mentor">
                    {student.currentMentor?.name || t('adminDigiBridgeStudents.table.noMentor')}
                  </span>
                </td>
                <td className="adminDgStudentsTable-td">
                  <span className="adminDgStudentsTable-credits">{student.totalCreditsEarned || 0}</span>
                </td>
                <td className="adminDgStudentsTable-td">
                  <span className="adminDgStudentsTable-attendance">{student.attendanceRate || 0}%</span>
                </td>
                <td className="adminDgStudentsTable-td">
                  <span className={`adminDgStudentsTable-statusBadge ${getStatusBadgeClass(student.status)}`}>
                    {t(`adminDigiBridgeStudents.table.${student.status}`)}
                  </span>
                </td>
                <td className="adminDgStudentsTable-td adminDgStudentsTable-td--actions">
                  <div className="adminDgStudentsTable-actions">
                    <button
                      className="adminDgStudentsTable-actionBtn adminDgStudentsTable-actionBtn--view"
                      onClick={() => onViewDetails(student)}
                      title={t('adminDigiBridgeStudents.table.view')}
                      type="button"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16">
                        <path d="M8 3C4.5 3 1.5 5.5 0 8c1.5 2.5 4.5 5 8 5s6.5-2.5 8-5c-1.5-2.5-4.5-5-8-5zm0 8c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" fill="currentColor"/>
                        <circle cx="8" cy="8" r="2" fill="currentColor"/>
                      </svg>
                    </button>
                    <button
                      className="adminDgStudentsTable-actionBtn adminDgStudentsTable-actionBtn--edit"
                      onClick={() => onEdit(student)}
                      title={t('adminDigiBridgeStudents.table.edit')}
                      type="button"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16">
                        <path d="M12.854 1.146a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.708-.708l10-10a.5.5 0 0 1 .708 0z" fill="currentColor"/>
                        <path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" fill="currentColor"/>
                      </svg>
                    </button>
                    <button
                      className="adminDgStudentsTable-actionBtn adminDgStudentsTable-actionBtn--delete"
                      onClick={() => onDelete(student)}
                      title={t('adminDigiBridgeStudents.table.delete')}
                      type="button"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" fill="currentColor"/>
                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1z" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="adminDgStudentsTable-mobileView">
        {students.map((student) => (
          <div key={student.id} className="adminDgStudentsTable-card">
            <div className="adminDgStudentsTable-cardHeader">
              <div className="adminDgStudentsTable-cardStudent">
                <div className="adminDgStudentsTable-avatar">
                  {student.avatar ? (
                    <img src={student.avatar} alt={student.name} />
                  ) : (
                    <div className="adminDgStudentsTable-avatarPlaceholder">
                      {student.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div className="adminDgStudentsTable-cardInfo">
                  <span className="adminDgStudentsTable-cardName">{student.name}</span>
                  <span className="adminDgStudentsTable-cardEmail">{student.email}</span>
                </div>
              </div>
              <span className={`adminDgStudentsTable-statusBadge ${getStatusBadgeClass(student.status)}`}>
                {t(`adminDigiBridgeStudents.table.${student.status}`)}
              </span>
            </div>

            <div className="adminDgStudentsTable-cardBody">
              <div className="adminDgStudentsTable-cardRow">
                <span className="adminDgStudentsTable-cardLabel">
                  {t('adminDigiBridgeStudents.table.mentor')}:
                </span>
                <span className="adminDgStudentsTable-cardValue">
                  {student.currentMentor?.name || t('adminDigiBridgeStudents.table.noMentor')}
                </span>
              </div>
              <div className="adminDgStudentsTable-cardRow">
                <span className="adminDgStudentsTable-cardLabel">
                  {t('adminDigiBridgeStudents.table.credits')}:
                </span>
                <span className="adminDgStudentsTable-cardValue">{student.totalCreditsEarned || 0}</span>
              </div>
              <div className="adminDgStudentsTable-cardRow">
                <span className="adminDgStudentsTable-cardLabel">
                  {t('adminDigiBridgeStudents.table.attendance')}:
                </span>
                <span className="adminDgStudentsTable-cardValue">{student.attendanceRate || 0}%</span>
              </div>
            </div>

            <div className="adminDgStudentsTable-cardActions">
              <button
                className="adminDgStudentsTable-cardActionBtn adminDgStudentsTable-cardActionBtn--view"
                onClick={() => onViewDetails(student)}
                type="button"
              >
                <svg width="18" height="18" viewBox="0 0 16 16">
                  <path d="M8 3C4.5 3 1.5 5.5 0 8c1.5 2.5 4.5 5 8 5s6.5-2.5 8-5c-1.5-2.5-4.5-5-8-5zm0 8c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" fill="currentColor"/>
                  <circle cx="8" cy="8" r="2" fill="currentColor"/>
                </svg>
                {t('adminDigiBridgeStudents.table.view')}
              </button>
              <button
                className="adminDgStudentsTable-cardActionBtn adminDgStudentsTable-cardActionBtn--edit"
                onClick={() => onEdit(student)}
                type="button"
              >
                <svg width="18" height="18" viewBox="0 0 16 16">
                  <path d="M12.854 1.146a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.708-.708l10-10a.5.5 0 0 1 .708 0z" fill="currentColor"/>
                  <path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" fill="currentColor"/>
                </svg>
                {t('adminDigiBridgeStudents.table.edit')}
              </button>
              <button
                className="adminDgStudentsTable-cardActionBtn adminDgStudentsTable-cardActionBtn--delete"
                onClick={() => onDelete(student)}
                type="button"
              >
                <svg width="18" height="18" viewBox="0 0 16 16">
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" fill="currentColor"/>
                  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1z" fill="currentColor"/>
                </svg>
                {t('adminDigiBridgeStudents.table.delete')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};