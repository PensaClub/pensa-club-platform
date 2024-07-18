import { useState } from 'react';
import { Link } from 'react-router-dom';
import './pendingAnnouncements.css';
import { CommentModal } from './CommentModal';

const initialAnnouncements = [
  {
    id: 1,
    email: 'user1@example.com',
    title: 'Announcement 1',
    date: '2023-07-01',
  },
  {
    id: 2,
    email: 'user2@example.com',
    title: 'Announcement 2',
    date: '2023-07-02',
  },
  {
    id: 3,
    email: 'user3@example.com',
    title: 'Announcement 3',
    date: '2023-07-03',
  },
  {
    id: 4,
    email: 'user4@example.com',
    title: 'Announcement 4',
    date: '2023-07-04',
  },
  {
    id: 5,
    email: 'user5@example.com',
    title: 'Announcement 5',
    date: '2023-07-05',
  },
  {
    id: 6,
    email: 'user6@example.com',
    title: 'Announcement 6',
    date: '2023-07-06',
  },
  {
    id: 7,
    email: 'user7@example.com',
    title: 'Announcement 7',
    date: '2023-07-07',
  },
];

export const PendingAnnouncements = () => {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (sortConfig.key === 'email') {
      const emailA = a.email.split('@')[0];
      const emailB = b.email.split('@')[0];
      if (emailA < emailB) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (emailA > emailB) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    } else if (sortConfig.key === 'date') {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    } else {
      return sortConfig.direction === 'ascending' ? a[sortConfig.key] - b[sortConfig.key] : b[sortConfig.key] - a[sortConfig.key];
    }
  });

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleComment = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleSubmitComment = () => {
    setIsModalOpen(false);
    setComment('');
  };

  return (
    <div className="pending-announcements-container">
      <h2>Pending Announcements</h2>
      <hr />
      <div className="pending-announcements-table-container">
        <table className="pending-announcements-table">
          <thead >
            <tr >
              <th className="number-cell" onClick={() => requestSort('id')}>
                No.
                {sortConfig.key === 'id' ? (
                  sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
                ) : null}
              </th>
              <th onClick={() => requestSort('email')}>
                User Email
                {sortConfig.key === 'email' ? (
                  sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
                ) : null}
              </th>
              <th>Announcement Title</th>
              <th onClick={() => requestSort('date')}>
                Creation Date
                {sortConfig.key === 'date' ? (
                  sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
                ) : null}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAnnouncements.map((announcement, index) => (
              <tr key={announcement.id}>
                <td className="number-cell id-table-admin">{index + 1}</td> 
                <td>
                  <Link to={`#`}>{announcement.email}</Link>
                </td>
                <td>
                  <Link to={`#`}>{announcement.title}</Link>
                </td>
                <td>{announcement.date}</td>
                <td className="actions-admin">
                  <button className="btn-unapproved green-second" onClick={() => handleComment(announcement)}>
                    Comment
                  </button>
                  <button className="btn-unapproved orange">Approve</button>
                  <button className="btn-unapproved red">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CommentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitComment}
      >
        <h2>Comment on Announcement</h2>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="5"
          cols="50"
        />
      </CommentModal>
    </div>
  );
};
