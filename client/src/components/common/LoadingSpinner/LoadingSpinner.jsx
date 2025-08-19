// components/common/LoadingSpinner/LoadingSpinner.jsx
import './loadingSpinner.css';

export const LoadingSpinner = ({ size = 'medium', color = 'primary', text, className = '' }) => {
  const getSpinnerClass = () => {
    return `loading-spinner loading-spinner-${size} loading-spinner-${color} ${className}`;
  };

  return (
    <div className="loading-spinner-container">
      <div className={getSpinnerClass()}>
        <div className="loading-spinner-inner">
          <div className="loading-spinner-circle"></div>
          <div className="loading-spinner-circle"></div>
          <div className="loading-spinner-circle"></div>
          <div className="loading-spinner-circle"></div>
        </div>
      </div>
      {text && <p className="loading-spinner-text">{text}</p>}
    </div>
  );
};