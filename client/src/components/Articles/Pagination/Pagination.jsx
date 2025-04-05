// Pagination.jsx
import React from 'react';
import './pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    if (totalPages <= 5) {

      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
   
      if (currentPage <= 3) {
  
        pageNumbers.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {

        pageNumbers.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {

        pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="pagination-container">
      <button 
        className={`pagination-arrow prev ${currentPage === 1 ? 'disabled' : ''}`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="arrow-icon">
          <polyline points="15.5 5 8.5 12 15.5 19" className="arrow-secondary" />
          <polyline points="10 19 3 12 10 5" className="arrow-primary" />
          <polyline points="21 5 14 12 21 19" className="arrow-primary-2" />
        </svg>
      </button>
      
      <div className="pagination-numbers">
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {typeof page === 'number' ? (
              <button 
                className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            ) : (
              <span className="pagination-ellipsis">{page}</span>
            )}
          </React.Fragment>
        ))}
      </div>
      
      <button 
        className={`pagination-arrow next ${currentPage === totalPages ? 'disabled' : ''}`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="arrow-icon rotated">
          <polyline points="15.5 5 8.5 12 15.5 19" className="arrow-secondary" />
          <polyline points="10 19 3 12 10 5" className="arrow-primary" />
          <polyline points="21 5 14 12 21 19" className="arrow-primary-2" />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;