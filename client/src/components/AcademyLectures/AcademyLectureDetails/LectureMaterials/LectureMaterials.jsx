// src/components/AcademyLectures/AcademyLectureDetails/components/LectureMaterials.jsx

const getMaterialIcon = (type) => {
  const icons = { pdf: '📄', video: '🎬', link: '🔗', document: '📝', image: '🖼️' };
  return icons[type] || '📁';
};

export const LectureMaterials = ({ materials, t }) => {
  if (!materials || materials.length === 0) {
    return (
      <div className="ald-materials-empty">
        <div className="ald-materials-empty-icon">📁</div>
        <p>Няма налични материали за тази лекция</p>
      </div>
    );
  }

  return (
    <div className="ald-materials-grid">
      {materials.map((material, index) => (
        <div key={material.id || index} className="ald-material-card">
          <div className="ald-material-icon">{getMaterialIcon(material.type)}</div>
          <div className="ald-material-info">
            <h4 className="ald-material-title">{material.title}</h4>
            {material.description && (
              <p className="ald-material-desc">{material.description}</p>
            )}
            <span className="ald-material-type">{material.type?.toUpperCase()}</span>
          </div>
          <a 
            href={material.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="ald-material-download"
          >
            ⬇️
          </a>
        </div>
      ))}
    </div>
  );
};