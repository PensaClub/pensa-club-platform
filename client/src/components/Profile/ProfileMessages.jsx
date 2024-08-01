/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import './ProfileMessages.css';
import { useCommunityContext } from '../contexts/CommunityContext';
import { useAuthContext } from '../contexts/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';

export const ProfileMessages = () => {
  const { getMyAds } = useCommunityContext();
  const { getProfileData } = useAuthContext();
  const [messages, setMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const messagesPerPage = 15;
  const totalPages = Math.ceil(messages.length / messagesPerPage);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const adsResponse = await getMyAds();
        const ads = adsResponse.ads || [];
        const adMessages = ads
          .filter(ad => ad.adminComment)
          .map(ad => ({
            id: ad.adId,
            summary: ad.adminComment.split(': ')[0]+ ':',
            description: ad.adminComment.split(': ')[1],
            creationDate: new Date(ad.creationDate),
            type: 'admin'
          }));

        const profileResponse = await getProfileData();
        const profile = profileResponse || {};
        const profileMessages = profile.roleChangeComment ? [{
          id: profile.email,
          summary: profile.roleChangeComment.split(': ')[0] + ':',
          description: profile.roleChangeComment.split(': ')[1],
          creationDate: new Date(profile.updatedAt),
          type: 'admin'
        }] : [];

        const combinedMessages = [...adMessages, ...profileMessages].sort((a, b) => b.creationDate - a.creationDate);
        setMessages(combinedMessages);
        setAllMessages(combinedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, []);

  const handleToggleMessage = (id) => {
    setExpandedMessage(expandedMessage === id ? null : id);
  };

  const handleSearch = () => {
    if (searchTerm === '') {
      setMessages(allMessages);
    } else {
      const filteredMessages = allMessages.filter(message =>
        message.summary.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setMessages(filteredMessages);
    }
    setCurrentPage(1);
  };

  const handleSelectAll = (event) => {
    const currentMessages = getCurrentMessages();
    if (event.target.checked) {
      setSelectedMessages(currentMessages.map(message => message.id));
    } else {
      setSelectedMessages([]);
    }
  };

  const handleSelectMessage = (id) => {
    setSelectedMessages(prevSelected =>
      prevSelected.includes(id)
        ? prevSelected.filter(messageId => messageId !== id)
        : [...prevSelected, id]
    );
  };

  const handleDeleteMessage = (id) => {

  };

  const getCurrentMessages = () => {
    const startIndex = (currentPage - 1) * messagesPerPage;
    return messages.slice(startIndex, startIndex + messagesPerPage);
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setMessages(allMessages);
    setCurrentPage(1);
  };

  return (
    <div className="profile-messages">
      <div className="search-container-message">
        <input
          type="text"
          placeholder="Search by description..."
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
          className="search-input-message"
        />
        <div className="search-actions-messages">
          <button className="search-button-message" onClick={handleSearch}>Search</button>
          {searchTerm && (
            <div className="reset-icon-container">
              <FontAwesomeIcon
                icon={faArrowRotateLeft}
                className="reset-icon"
                onClick={resetFilters}
              />
              <span className="reset-text" onClick={resetFilters}>Изчисти търсенето</span>
            </div>
          )}
        </div>
      </div>
      <div className="messages-container">
        <div className="messages-header">
          <input
            type="checkbox"
            className="select-all-checkbox"
            onChange={handleSelectAll}
            checked={selectedMessages.length === getCurrentMessages().length && getCurrentMessages().length > 0}
          />
          <span>Select All</span>
          <span className="delete-icon">🗑️</span>
        </div>
        {getCurrentMessages().map(message => (
          <div key={message.id} className="message-wrapper">
            <div className="message-row">
              <input
                type="checkbox"
                className="message-checkbox"
                checked={selectedMessages.includes(message.id)}
                onChange={() => handleSelectMessage(message.id)}
              />
              <div className="message-summary" onClick={() => handleToggleMessage(message.id)}>
                {message.summary}
              </div>
              <div className="message-author">Admin</div>
              {selectedMessages.includes(message.id) && (
                <span
                  className="delete-icon-row"
                  onClick={() => handleDeleteMessage(message.id)}
                >
                  🗑️
                </span>
              )}
            </div>
            {expandedMessage === message.id && (
              <div className="message-description">
                {message.description}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="pagination-container">
        <button className="pagination-button" onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</button>
        <span className="pagination-info">Page {currentPage} of {totalPages}</span>
        <button className="pagination-button" onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
      </div>
    </div>
  );
};
