import React, { useEffect, useRef } from "react";
import "./mottoCard.css";

export const MottoCard = ({ icon, title, desc, index }) => {
  const cardRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          cardRef.current.classList.add('visible');
        }
      },
      { threshold: 0.2 }
    );
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div className="motto-card-modern" ref={cardRef}>
      <div className="card-header-modern">
        <div className="icon-container-modern">
          <div className="icon-glow"></div>
          <i className={icon}></i>
        </div>
        <h3 className="card-title-modern">{title}</h3>
      </div>
      <div className="card-body-modern">
        <p>{desc}</p>
        <div className="card-indicator">0{index + 1}</div>
      </div>
    </div>
  );
};