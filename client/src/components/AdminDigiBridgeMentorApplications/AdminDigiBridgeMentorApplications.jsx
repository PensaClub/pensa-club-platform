// src/components/AdminDigiBridgeMentorApplications/AdminDigiBridgeMentorApplications.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import './adminDigiBridgeMentorApplications.css';
import { useAcademy } from '../contexts/AcademyProvider';
// import { ApplicationsStats } from './ApplicationsStats/ApplicationsStats';
// import { ApplicationsFilters } from './ApplicationsFilters/ApplicationsFilters';
// import { ApplicationCard } from './ApplicationCard/ApplicationCard';
// import { ApplicationDetailModal } from './ApplicationDetailModal/ApplicationDetailModal';
// import { SendEmailToApplicantModal } from './SendEmailToApplicantModal/SendEmailToApplicantModal';

// ===================================
// МОКНАТИ ДАННИ ЗА ТЕСТВАНЕ
// ===================================
const MOCK_APPLICATIONS = [
  {
    id: 101,
    name: "Даниела Стоянова",
    email: "daniela.stoyanova@example.com",
    phone: "+359888111222",
    age: 25,
    photoUrl: "https://randomuser.me/api/portraits/women/28.jpg",
    specialization: "Digital Security",
    education: "ВТУ - Информационна сигурност, Бакалавър 2024",
    experience: "1 година опит в кибер сигурност",
    motivation: "Искам да помагам на възрастните хора да се предпазят от онлайн измами и да разберат важността на сигурността в дигиталния свят.",
    availability: "Гъвкав график, предпочитам следобед",
    languages: ["bg", "en"],
    viber: "+359888111222",
    facebook: "facebook.com/daniela.stoyanova",
    linkedin: "linkedin.com/in/danielastoyanova",
    otherContact: "",
    cvUrl: "https://example.com/cv_daniela.pdf",
    cvOriginalName: "Daniela_Stoyanova_CV.pdf",
    status: "pending",
    createdAt: "2025-01-28T09:30:00Z"
  },
  {
    id: 102,
    name: "Георги Михайлов",
    email: "georgi.mihailov@example.com",
    phone: "+359887333444",
    age: 30,
    photoUrl: "https://randomuser.me/api/portraits/men/45.jpg",
    specialization: "Media Literacy",
    education: "СУ - Журналистика, Магистър 2020",
    experience: "5 години в медийния сектор като журналист",
    motivation: "Имам страст да обучавам хората как да разпознават фалшиви новини и да се ориентират в дигиталната медийна среда.",
    availability: "Вечер и уикенди",
    languages: ["bg", "en", "de"],
    viber: "",
    facebook: "facebook.com/georgi.mihailov",
    linkedin: "linkedin.com/in/georgimihailov",
    otherContact: "Telegram: @georgim",
    cvUrl: "https://example.com/cv_georgi.pdf",
    cvOriginalName: "Georgi_Mihailov_CV.pdf",
    status: "pending",
    createdAt: "2025-01-27T14:20:00Z"
  },
  {
    id: 103,
    name: "Радостина Колева",
    email: "radostina.koleva@example.com",
    phone: "+359889555666",
    age: 27,
    photoUrl: "https://randomuser.me/api/portraits/women/52.jpg",
    specialization: "Online Banking",
    education: "УНСС - Банково дело и застраховане, Бакалавър 2021",
    experience: "3 години работа в банков сектор",
    motivation: "Желая да помогна на възрастните хора да се чувстват уверени при използване на онлайн банкиране и дигитални платежни методи.",
    availability: "Работни дни следобед",
    languages: ["bg", "en"],
    viber: "+359889555666",
    facebook: "",
    linkedin: "linkedin.com/in/radostinakoleva",
    otherContact: "",
    cvUrl: "https://example.com/cv_radostina.pdf",
    cvOriginalName: "Radostina_Koleva_CV.pdf",
    status: "pending",
    createdAt: "2025-01-26T11:00:00Z"
  }
];

export const AdminDigiBridgeMentorApplications = () => {
  const { t } = useTranslation();
  const {
    sendPersonalEmail,
    approveMentor,
    // rejectMentorApplication - ще го добавим към context
  } = useAcademy();

  // STATE
  const [applications, setApplications] = useState(MOCK_APPLICATIONS);
  const [filteredApplications, setFilteredApplications] = useState(MOCK_APPLICATIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // MODALS
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  // FILTERS
  const [filters, setFilters] = useState({
    search: '',
    specialization: 'all',
    sortBy: 'newest'
  });

  // ===================================
  // EFFECTS
  // ===================================
  
  useEffect(() => {
    // TODO: Зареди кандидатури от backend
    // fetchApplications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, applications]);

  // ===================================
  // FILTER LOGIC
  // ===================================

  const applyFilters = () => {
    let filtered = [...applications];

    // Search
    if (filters.search) {
      filtered = filtered.filter(app =>
        app.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        app.email.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Specialization
    if (filters.specialization !== 'all') {
      filtered = filtered.filter(app => app.specialization === filters.specialization);
    }

    // Sort
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    setFilteredApplications(filtered);
  };

  // ===================================
  // HANDLERS
  // ===================================

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setDetailModalOpen(true);
  };

  const handleSendEmail = (application) => {
    setSelectedApplication(application);
    setEmailModalOpen(true);
  };

  const handleApprove = async (applicationId, additionalNotes = '') => {
    try {
      setIsLoading(true);
      await approveMentor(applicationId);
      
      // Премахва от списъка
      setApplications(prev => prev.filter(app => app.id !== applicationId));
      
      toast.success(t('AdminDigiBridgeMentorApplications.approveSuccess'));
      setDetailModalOpen(false);
    } catch (error) {
      toast.error(t('AdminDigiBridgeMentorApplications.approveError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (applicationId, rejectionReason) => {
    try {
      setIsLoading(true);
      // TODO: Добави rejectMentorApplication към context
      // await rejectMentorApplication(applicationId, rejectionReason);
      
      // TEMP: Премахва от списъка
      setApplications(prev => prev.filter(app => app.id !== applicationId));
      
      toast.success(t('AdminDigiBridgeMentorApplications.rejectSuccess'));
      setDetailModalOpen(false);
    } catch (error) {
      toast.error(t('AdminDigiBridgeMentorApplications.rejectError'));
    } finally {
      setIsLoading(false);
    }
  };

  // ===================================
  // STATS
  // ===================================

  const stats = {
    totalApplications: applications.length,
    newToday: applications.filter(app => {
      const today = new Date().toDateString();
      return new Date(app.createdAt).toDateString() === today;
    }).length,
    pending: applications.filter(app => app.status === 'pending').length
  };

  // ===================================
  // RENDER
  // ===================================

  return (
    <div className="admin-digibridge-mentor-applications">
      {/* HERO SECTION */}
      <div className="admin-digibridge-mentor-applications-hero">
        <div className="admin-digibridge-mentor-applications-hero-content">
          <h1>{t('AdminDigiBridgeMentorApplications.title')}</h1>
          <p>{t('AdminDigiBridgeMentorApplications.description')}</p>
        </div>
      </div>

      {/* STATS */}
      {/* <ApplicationsStats stats={stats} /> */}

      {/* FILTERS */}
      {/* <ApplicationsFilters 
        filters={filters} 
        onFilterChange={setFilters}
      /> */}

      {/* APPLICATIONS LIST */}
      <div className="admin-digibridge-mentor-applications-list">
        {isLoading ? (
          <div className="admin-digibridge-mentor-applications-loading">
            <div className="admin-digibridge-mentor-applications-spinner"></div>
            <p>{t('AdminDigiBridgeMentorApplications.loading')}</p>
          </div>
        ) : filteredApplications.length > 0 ? (
          <div className="admin-digibridge-mentor-applications-grid">
            {/* {filteredApplications.map(application => (
              <ApplicationCard
                key={application.id}
                application={application}
                onViewDetails={handleViewDetails}
                onSendEmail={handleSendEmail}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))} */}
          </div>
        ) : (
          <div className="admin-digibridge-mentor-applications-empty">
            <div className="admin-digibridge-mentor-applications-empty-icon">📭</div>
            <h3>{t('AdminDigiBridgeMentorApplications.noApplications')}</h3>
            <p>{t('AdminDigiBridgeMentorApplications.noApplicationsDescription')}</p>
          </div>
        )}
      </div>

      {/* MODALS */}
      {/* {detailModalOpen && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => setDetailModalOpen(false)}
          onApprove={handleApprove}
          onReject={handleReject}
          onSendEmail={() => {
            setDetailModalOpen(false);
            setEmailModalOpen(true);
          }}
        />
      )} */}

      {/* {emailModalOpen && (
        <SendEmailToApplicantModal
          application={selectedApplication}
          onClose={() => setEmailModalOpen(false)}
        />
      )} */}
    </div>
  );
};