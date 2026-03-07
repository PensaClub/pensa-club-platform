// src/components/DigiBridge/DigiBridgeMentorDashboard/DigiBridgeMentorDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../contexts/UserContext';
import { 
  listenToChatRequests, 
  listenToMentorConversations,
  acceptChatRequest 
} from '../../firebase/firebaseChat';
// import { DashboardStats } from './DashboardStats';
// import { RequestCard } from './RequestCard';
// import { ConversationCard } from './ConversationCard';
import { toast } from 'react-toastify';
import { TextZoom } from '../../TextZoom/TextZoom';
import './digiBridgeMentorDashboard.css';
import { RequestCard } from './RequestCard';
import { DashboardStats } from './DashboardStats';
import { ConversationCard } from './ConversationCard';
import { Header } from '../../Header/Header';

export const DigiBridgeMentorDashboard = () => {
  const { t } = useTranslation('digibridge');
  const { profileData } = useAuthContext();
  
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'active' | 'completed'
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeConversations, setActiveConversations] = useState([]);
  const [completedConversations, setCompletedConversations] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAccepting, setIsAccepting] = useState(null); // ID на request който се приема

  const isAdmin = profileData?.role === 'admin';
  const mentorId = profileData?.email?.replace(/\./g, '_dot_').replace(/@/g, '_at_');
  const mentorName = profileData?.details?.username || profileData?.details?.firstName || 'Mentor';

  // Слушай за pending requests
  useEffect(() => {
    const unsubscribe = listenToChatRequests((requests) => {
      // Ако е admin, вижда всички; ако е mentor, вижда само своите
      const filtered = isAdmin 
        ? requests 
        : requests.filter(req => !req.mentorId || req.mentorId === mentorId);
      
      setPendingRequests(filtered);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAdmin, mentorId]);

  // Слушай за активни разговори
  useEffect(() => {
    if (!mentorId) return;

    // Ако е admin, слушай за ВСИЧКИ conversations (няма ready функция за това)
    // За сега, менторите виждат само своите
    const unsubscribe = listenToMentorConversations(mentorId, (conversations) => {
      const active = conversations.filter(c => c.status === 'active');
      const completed = conversations.filter(c => c.status === 'completed');
      
      setActiveConversations(active);
      setCompletedConversations(completed);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [mentorId]);

  // Приеми заявка
  const handleAcceptRequest = async (requestId) => {
    setIsAccepting(requestId);

    try {
      const conversationId = await acceptChatRequest(requestId, {
        mentorId: mentorId,
        mentorName: mentorName
      });

      toast.success(t('digiBridge.dashboard.requestAccepted'));
      
      // Автоматично превключи на Active Chats след 1 секунда
      setTimeout(() => {
        setActiveTab('active');
      }, 1000);
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error(t('digiBridge.dashboard.errorAccepting'));
    } finally {
      setIsAccepting(null);
    }
  };

  // Filter функции
  const filterByCategory = (items) => {
    if (filterCategory === 'all') return items;
    return items.filter(item => item.category === filterCategory);
  };

  const filterBySearch = (items) => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.userName?.toLowerCase().includes(query) ||
      item.problem?.toLowerCase().includes(query) ||
      item.userEmail?.toLowerCase().includes(query)
    );
  };

  // Категории за филтър
  const categories = [
    { value: 'all', label: t('digiBridge.dashboard.allCategories') },
    { value: 'General', label: t('digiBridge.chatWindow.categories.general') },
    { value: 'Online Banking', label: t('digiBridge.chatWindow.categories.banking') },
    { value: 'Social Media', label: t('digiBridge.chatWindow.categories.socialMedia') },
    { value: 'Digital Security', label: t('digiBridge.chatWindow.categories.security') },
    { value: 'Email', label: t('digiBridge.chatWindow.categories.email') },
    { value: 'Basic Computer Skills', label: t('digiBridge.chatWindow.categories.computer') }
  ];

  // Apply filters
  const filteredPendingRequests = filterBySearch(filterByCategory(pendingRequests));
  const filteredActiveConversations = filterBySearch(filterByCategory(activeConversations));
  const filteredCompletedConversations = filterBySearch(filterByCategory(completedConversations));

  return (
    <div className="digibridge-dashboard">
      
      {/* HEADER */}
      <div className="digibridge-dashboard-header">
        <Header />
        <TextZoom />
        <div className="digibridge-dashboard-title">
          <h1>{t('digiBridge.dashboard.title')}</h1>
          {isAdmin && (
            <span className="digibridge-dashboard-admin-badge">
              👑 {t('digiBridge.dashboard.adminMode')}
            </span>
          )}
        </div>
        <p className="digibridge-dashboard-subtitle">
          {t('digiBridge.dashboard.subtitle')}
        </p>
      </div>

      {/* STATS */}
      <DashboardStats 
        pendingCount={pendingRequests.length}
        activeCount={activeConversations.length}
        completedCount={completedConversations.length}
      />

      {/* TABS */}
      <div className="digibridge-dashboard-tabs">
        <button
          className={`digibridge-dashboard-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <span className="digibridge-dashboard-tab-icon">⏳</span>
          {t('digiBridge.dashboard.pendingRequests')}
          {pendingRequests.length > 0 && (
            <span className="digibridge-dashboard-tab-badge">{pendingRequests.length}</span>
          )}
        </button>

        <button
          className={`digibridge-dashboard-tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <span className="digibridge-dashboard-tab-icon">💬</span>
          {t('digiBridge.dashboard.activeChats')}
          {activeConversations.length > 0 && (
            <span className="digibridge-dashboard-tab-badge">{activeConversations.length}</span>
          )}
        </button>

        <button
          className={`digibridge-dashboard-tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <span className="digibridge-dashboard-tab-icon">✅</span>
          {t('digiBridge.dashboard.completedChats')}
        </button>
      </div>

      {/* FILTERS */}
      <div className="digibridge-dashboard-filters">
        <div className="digibridge-dashboard-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder={t('digiBridge.dashboard.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="digibridge-dashboard-category-filter"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* CONTENT */}
      <div className="digibridge-dashboard-content">
        
        {/* PENDING REQUESTS */}
        {activeTab === 'pending' && (
          <div className="digibridge-dashboard-list">
            {filteredPendingRequests.length === 0 ? (
              <div className="digibridge-dashboard-empty">
                <div className="digibridge-dashboard-empty-icon">📭</div>
                <h3>{t('digiBridge.dashboard.noPendingRequests')}</h3>
                <p>{t('digiBridge.dashboard.noPendingRequestsDesc')}</p>
              </div>
            ) : (
              filteredPendingRequests.map(request => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onAccept={() => handleAcceptRequest(request.id)}
                  isAccepting={isAccepting === request.id}
                />
              ))
            )}
          </div>
        )}

        {/* ACTIVE CONVERSATIONS */}
        {activeTab === 'active' && (
          <div className="digibridge-dashboard-list">
            {filteredActiveConversations.length === 0 ? (
              <div className="digibridge-dashboard-empty">
                <div className="digibridge-dashboard-empty-icon">💬</div>
                <h3>{t('digiBridge.dashboard.noActiveChats')}</h3>
                <p>{t('digiBridge.dashboard.noActiveChatsDesc')}</p>
              </div>
            ) : (
              filteredActiveConversations.map(conversation => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                />
              ))
            )}
          </div>
        )}

        {/* COMPLETED CONVERSATIONS */}
        {activeTab === 'completed' && (
          <div className="digibridge-dashboard-list">
            {filteredCompletedConversations.length === 0 ? (
              <div className="digibridge-dashboard-empty">
                <div className="digibridge-dashboard-empty-icon">✅</div>
                <h3>{t('digiBridge.dashboard.noCompletedChats')}</h3>
                <p>{t('digiBridge.dashboard.noCompletedChatsDesc')}</p>
              </div>
            ) : (
              filteredCompletedConversations.map(conversation => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  isCompleted={true}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};