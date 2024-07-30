/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import './ProfileMessages.css';
import { useCommunityContext } from '../contexts/CommunityContext';

export const ProfileMessages = () => {
  const { getMyAds } = useCommunityContext();
  const [messages, setMessages] = useState([]);
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const messagesPerPage = 15;
  const totalPages = Math.ceil(messages.length / messagesPerPage);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const adsResponse = await getMyAds();
        const ads = adsResponse.ads || [];
        const newMessages = ads
          .filter(ad => ad.adminComment)
          .map(ad => ({
            id: ad.adId,
            summary: ad.adminComment.slice(0, 10),
            description: ad.adminComment,
            creationDate: new Date(ad.creationDate),
            type: 'admin'
          }));
        setMessages(newMessages.sort((a, b) => b.creationDate - a.creationDate));
      } catch (error) {
        console.error('Error fetching ads:', error);
      }
    };

    fetchAds();
  }, []);

  const handleToggleMessage = (id) => {
    setExpandedMessage(expandedMessage === id ? null : id);
  };

  const handleSearch = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);
    const filteredMessages = messages.filter(message =>
      message.summary.toLowerCase().includes(searchTerm)
    );
    setMessages(filteredMessages);
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

  return (
    <div className="profile-messages">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by description..."
          onChange={handleSearch}
          value={searchTerm}
          className="search-input"
        />
        <button className="search-button-message">Search</button>
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
