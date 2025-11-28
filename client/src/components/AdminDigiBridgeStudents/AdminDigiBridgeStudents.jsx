// src/components/AdminDigiBridgeStudents/adminDigiBridgeStudents.jsx

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './adminDigiBridgeStudents.css';
import { useAcademy } from '../contexts/AcademyProvider';
import { StudentsOverviewStats } from './StudentsOverviewStats/StudentsOverviewStats';
import { StudentsStatsTabs } from './StudentsStatsTabs/StudentsStatsTabs';
import { AdminDgStudentsTable } from './AdminDgStudentsTable/AdminDgStudentsTable';
import { AdminDgStudentDetailsModal } from './AdminDgStudentDetailsModal/AdminDgStudentDetailsModal';
import { AdminDgDeleteStudentConfirm } from './AdminDgDeleteStudentConfirm/AdminDgDeleteStudentConfirm';
import { AdminDgEditStudentModal } from './AdminDgEditStudentModal/AdminDgEditStudentModal';
import { AdminDgChangeMentorModal } from './AdminDgChangeMentorModal/AdminDgChangeMentorModal';
import { AdminDgSendEmailModal } from './AdminDgSendEmailModal/AdminDgSendEmailModal';
import { AdminDgStudentsFilters } from './AdminDgStudentsFilters/AdminDgStudentsFilters';

// Chart Components
import { StudentsByStatusChart } from './StudentsStatsCharts/StudentsByStatusChart';
import { StudentsByMentorChart } from './StudentsStatsCharts/StudentsByMentorChart';
import { StudentsCreditsChart } from './StudentsStatsCharts/StudentsCreditsChart';
import { StudentsAttendanceChart } from './StudentsStatsCharts/StudentsAttendanceChart';
import { TopPerformersTable } from './StudentsStatsCharts/TopPerformersTable';
import { StudentsEngagementChart } from './StudentsStatsCharts/StudentsEngagementChart';

export const AdminDigiBridgeStudents = () => {
  const { t } = useTranslation();
  const {
    getAllStudents,
    getStudentStatisticsOverview,
    getStudentsByStatus,
    getStudentsByMentor,
    getStudentsCreditsDistribution,
    getStudentsAttendanceTrends,
    getTopPerformingStudents,
    getStudentsEngagement,
    deleteStudent,
    updateStudentStatus,
    assignMentorToStudent,
    updateStudent
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

  // Stats States
  const [statusStats, setStatusStats] = useState(null);
  const [mentorStats, setMentorStats] = useState(null);
  const [creditsStats, setCreditsStats] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [topPerformers, setTopPerformers] = useState([]);
  const [engagementStats, setEngagementStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    mentorId: '',
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
  // FETCH TAB-SPECIFIC STATS
  // ===============================
  const fetchTabStats = async (tab) => {
    setStatsLoading(true);
    try {
      switch (tab) {
        case 'byStatus':
          if (!statusStats) {
            const statusData = await getStudentsByStatus();
            if (statusData?.success) {
              setStatusStats(statusData.statistics);
            }
          }
          break;

        case 'byMentor':
          if (!mentorStats) {
            const mentorData = await getStudentsByMentor();
            if (mentorData?.success) {
              setMentorStats(mentorData.statistics);
            }
          }
          break;

        case 'credits':
          if (!creditsStats) {
            const creditsData = await getStudentsCreditsDistribution();
            if (creditsData?.success) {
              setCreditsStats(creditsData.distribution);
            }
          }
          break;

        case 'attendance':
          if (!attendanceStats) {
            const attendanceData = await getStudentsAttendanceTrends();
            if (attendanceData?.success) {
              setAttendanceStats(attendanceData.trends);
            }
          }
          break;

        case 'topPerformers':
          if (topPerformers.length === 0) {
            const topData = await getTopPerformingStudents(10);
            if (topData?.success) {
              setTopPerformers(topData.topPerformers || topData.students || []);
            }
          }
          break;

        case 'engagement':
          if (!engagementStats) {
            const engagementData = await getStudentsEngagement();
            if (engagementData?.success) {
              setEngagementStats(engagementData.engagement);
            }
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${tab} stats:`, error);
    } finally {
      setStatsLoading(false);
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
        search: filters.search || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        mentorId: filters.mentorId || undefined,
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
  }, []);

  // Fetch when filters change
  useEffect(() => {
    fetchStudents(1);
  }, [filters]);

  // Fetch tab-specific stats when tab changes
  useEffect(() => {
    if (activeTab !== 'overview') {
      fetchTabStats(activeTab);
    }
  }, [activeTab]);

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
    setShowDetailsModal(false);
    setShowEditModal(true);
  };

  const handleChangeMentor = (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(false);
    setShowChangeMentorModal(true);
  };

  const handleSendEmail = (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(false);
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
      setStatusStats(null);
      setMentorStats(null);
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const handleStatusChange = async (studentId, newStatus) => {
    try {
      await updateStudentStatus(studentId, newStatus);
      fetchStudents(pagination.page);
      fetchOverviewStats();
      setStatusStats(null);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleMentorAssign = async (studentId, mentorId) => {
    try {
      await assignMentorToStudent(studentId, mentorId);
      setShowChangeMentorModal(false);
      setSelectedStudent(null);
      fetchStudents(pagination.page);
      fetchOverviewStats();
      setMentorStats(null);
    } catch (error) {
      console.error('Error assigning mentor:', error);
    }
  };

  const handleStudentUpdate = async (studentId, data) => {
    try {
      await updateStudent(studentId, data);
      setShowEditModal(false);
      setSelectedStudent(null);
      fetchStudents(pagination.page);
      fetchOverviewStats();
    } catch (error) {
      console.error('Error updating student:', error);
    }
  };

  // ===============================
  // RENDER TAB CONTENT
  // ===============================
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <StudentsOverviewStats stats={overviewStats} loading={loading} />
            
            <AdminDgStudentsFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              totalResults={pagination?.total || students.length}
            />

            <AdminDgStudentsTable
              students={students}
              loading={loading}
              pagination={pagination}
              onPageChange={handlePageChange}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          </>
        );

      case 'byStatus':
        return (
          <StudentsByStatusChart 
            data={statusStats} 
            loading={statsLoading} 
          />
        );

      case 'byMentor':
        return (
          <StudentsByMentorChart 
            data={mentorStats} 
            loading={statsLoading} 
          />
        );

      case 'credits':
        return (
          <StudentsCreditsChart 
            data={creditsStats} 
            loading={statsLoading} 
          />
        );

      case 'attendance':
        return (
          <StudentsAttendanceChart 
            data={attendanceStats} 
            loading={statsLoading} 
          />
        );

      case 'topPerformers':
        return (
          <TopPerformersTable 
            students={topPerformers} 
            loading={statsLoading}
            onViewDetails={handleViewDetails}
          />
        );

      case 'engagement':
        return (
          <StudentsEngagementChart 
            data={engagementStats} 
            loading={statsLoading} 
          />
        );

      default:
        return null;
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

      {/* STATS TABS */}
      <StudentsStatsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* TAB CONTENT */}
      <div className="admin-digibridge-students-content">
        {renderTabContent()}
      </div>

      {/* MODALS */}
      {showDetailsModal && (
        <AdminDgStudentDetailsModal
          student={selectedStudent}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedStudent(null);
          }}
          onEdit={handleEdit}
          onChangeMentor={handleChangeMentor}
          onSendEmail={handleSendEmail}
        />
      )}

      {showEditModal && (
        <AdminDgEditStudentModal
          student={selectedStudent}
          onClose={() => {
            setShowEditModal(false);
            setSelectedStudent(null);
          }}
          onSave={handleStudentUpdate}
        />
      )}

      {showChangeMentorModal && (
        <AdminDgChangeMentorModal
          student={selectedStudent}
          onClose={() => {
            setShowChangeMentorModal(false);
            setSelectedStudent(null);
          }}
          onAssign={handleMentorAssign}
        />
      )}

      {showEmailModal && (
        <AdminDgSendEmailModal
          student={selectedStudent}
          onClose={() => {
            setShowEmailModal(false);
            setSelectedStudent(null);
          }}
          onSuccess={() => {
            console.log('Email sent successfully!');
          }}
        />
      )}

      {showDeleteConfirm && (
        <AdminDgDeleteStudentConfirm
          student={selectedStudent}
          onClose={() => {
            setShowDeleteConfirm(false);
            setSelectedStudent(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};