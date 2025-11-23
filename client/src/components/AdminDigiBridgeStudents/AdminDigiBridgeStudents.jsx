import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './adminDigiBridgeStudents.css';
import { useAcademy } from '../contexts/AcademyProvider';
import { StudentsOverviewStats } from './StudentsOverviewStats/StudentsOverviewStats';
import { StudentsStatsTabs } from './StudentsStatsTabs/StudentsStatsTabs';
import { AdminDgStudentsFilters } from './StudentsFilters/AdminDgStudentsFilter';
import { AdminDgStudentsTable } from './AdminDgStudentsTable/AdminDgStudentsTable';
import { AdminDgStudentDetailsModal } from './AdminDgStudentDetailsModal/AdminDgStudentDetailsModal';
import { AdminDgDeleteStudentConfirm } from './AdminDgDeleteStudentConfirm/AdminDgDeleteStudentConfirm';

export const AdminDigiBridgeStudents = () => {
  const { t } = useTranslation();
  const {
    getAllStudents,
    getStudentStatisticsOverview,
    deleteStudent,
    updateStudentStatus,
    assignMentorToStudent,
    updateStudent,
    sendEmailToStudent
  } = useAcademy();

  // States
  const [students, setStudents] = useState([]);
  const [overviewStats, setOverviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    mentorId: 'all',
    sortBy: 'newest'
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState('overview');

  // Modals
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangeMentorModal, setShowChangeMentorModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ===============================
  // FETCH OVERVIEW STATS
  // ===============================
  const fetchOverviewStats = async () => {
    try {
      const data = await getStudentStatisticsOverview();
      if (data?.success) {
        setOverviewStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching overview stats:', error);
    }
  };

  // ===============================
  // FETCH STUDENTS
  // ===============================
  const fetchStudents = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.limit,
        search: filters.search,
        status: filters.status,
        mentorId: filters.mentorId,
        sortBy: filters.sortBy
      };

      const data = await getAllStudents(params);

      if (data?.success) {
        setStudents(data.students || []);
        setPagination(data.pagination || {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0
        });
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // INITIAL LOAD
  // ===============================
  useEffect(() => {
    fetchOverviewStats();
    fetchStudents(1);
  }, [filters]);

  // ===============================
  // HANDLERS
  // ===============================
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchStudents(newPage);
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const handleChangeMentor = (student) => {
    setSelectedStudent(student);
    setShowChangeMentorModal(true);
  };

  const handleSendEmail = (student) => {
    setSelectedStudent(student);
    setShowEmailModal(true);
  };

  const handleDelete = (student) => {
    setSelectedStudent(student);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedStudent) return;

    try {
      await deleteStudent(selectedStudent.id);
      setShowDeleteConfirm(false);
      setSelectedStudent(null);
      fetchStudents(pagination.page);
      fetchOverviewStats();
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const handleStatusChange = async (studentId, newStatus) => {
    try {
      await updateStudentStatus(studentId, newStatus);
      fetchStudents(pagination.page);
      fetchOverviewStats();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleMentorAssign = async (studentId, mentorId) => {
    try {
      await assignMentorToStudent(studentId, mentorId);
      setShowChangeMentorModal(false);
      fetchStudents(pagination.page);
      fetchOverviewStats();
    } catch (error) {
      console.error('Error assigning mentor:', error);
    }
  };

  const handleStudentUpdate = async (studentId, data) => {
    try {
      await updateStudent(studentId, data);
      setShowEditModal(false);
      fetchStudents(pagination.page);
      fetchOverviewStats();
    } catch (error) {
      console.error('Error updating student:', error);
    }
  };

  const handleEmailSend = async (studentId, emailData) => {
    try {
      await sendEmailToStudent(studentId, emailData);
      setShowEmailModal(false);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  return (
    <div className="admin-digibridge-students">
      <div className="admin-digibridge-students-header">
        <h1>{t('adminDigiBridgeStudents.title')}</h1>
        <p className="admin-digibridge-students-subtitle">
          {t('adminDigiBridgeStudents.subtitle')}
        </p>
      </div>

      {/* OVERVIEW STATS */}
      <StudentsOverviewStats stats={overviewStats} loading={loading} />

      {/* STATS TABS */}
      <StudentsStatsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* FILTERS */}
      <AdminDgStudentsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        totalResults={pagination.total}
      />

      {/* STUDENTS TABLE */}
      <AdminDgStudentsTable
        students={students}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onViewDetails={handleViewDetails}
        onEdit={handleEdit}
        onChangeMentor={handleChangeMentor}
        onSendEmail={handleSendEmail}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />

      {/* MODALS */}
      {showDetailsModal && (
        <AdminDgStudentDetailsModal
          student={selectedStudent}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {/* {showEditModal && (
        <EditStudentModal
          student={selectedStudent}
          onClose={() => setShowEditModal(false)}
          onSave={handleStudentUpdate}
        />
      )} */}

      {/* {showChangeMentorModal && (
        <ChangeMentorModal
          student={selectedStudent}
          onClose={() => setShowChangeMentorModal(false)}
          onAssign={handleMentorAssign}
        />
      )} */}

      {/* {showEmailModal && (
        <SendEmailModal
          student={selectedStudent}
          onClose={() => setShowEmailModal(false)}
          onSend={handleEmailSend}
        />
      )} */}

      {showDeleteConfirm && (
  <AdminDgDeleteStudentConfirm
    student={selectedStudent}
    onClose={() => setShowDeleteConfirm(false)}
    onConfirm={handleConfirmDelete}
  />
)}
    </div>
  );
};