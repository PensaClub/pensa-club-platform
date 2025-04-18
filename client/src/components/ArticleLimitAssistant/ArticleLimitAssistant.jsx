import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import './articleLimitAssistant.css';
import assistantAnimation from './animations.json'; 

const ArticleLimitAssistant = ({ isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isVisible]);
  
  if (!isVisible) return null;
  
  return (
    <div className="assistant-backdrop" onClick={onClose}>
      <motion.div 
        className="assistant-container"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="assistant-content">
          <div className="assistant-message">
            <h3>Харесва ли Ви съдържанието?</h3>
            <p>Регистрирайте се, за да продължите да четете неограничен брой статии и да получите пълен достъп до платформата.</p>
            <div className="assistant-buttons">
              <Link to="/sign-up" className="assistant-btn register-btn">Регистрация</Link>
              <Link to="/sign-up?tab=login" className="assistant-btn login-btn">Вход</Link>
            </div>
          </div>
          
          <div className="lottie-container">
            <Lottie 
              animationData={assistantAnimation} 
              loop={true}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
        
        <button className="assistant-close" onClick={onClose}>×</button>
      </motion.div>
    </div>
  );
};

export default ArticleLimitAssistant;