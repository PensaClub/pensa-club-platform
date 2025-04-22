import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave, faTimes, faEdit, faCalendarAlt, 
  faUser, faEye, faExclamationTriangle, faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

import "./editArticle.css";
import { useArticleContext } from "../../../contexts/ArticleContext";
import { createEditorState } from "../../articleUtils/editor";
import { useAnalytics } from "../../../contexts/AnalyticsContext";
import AnalyticsPanel from "../AnalyticsPanel/AnalyticsPanel";
import { notify } from "../../../../utils/notify";
// import EditArticleForm from "../EditArticleFrom/EditArticleFrom";
import ArticleCreateForm from "../../ArticleCreateForm/ArticleCreateForm";
function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getArticleById, updateArticle } = useArticleContext();
  const { getViewCount } = useAnalytics();
  
  const [originalArticle, setOriginalArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [articleFormKey, setArticleFormKey] = useState(`article-form-${Date.now()}`);
  
  // Зареждане на статията при монтиране на компонента
  useEffect(() => {
    const loadArticle = async () => {
      try {
        setIsLoading(true);
        const article = await getArticleById(id);
        
        if (!article) {
          throw new Error("Статията не беше намерена");
        }
        
        // Преобразуваме HTML съдържанието обратно към формат на редактора
        const preparedArticle = prepareArticleForEdit(article);
        setOriginalArticle(preparedArticle);
        setIsLoading(false);
        
        console.log("Подготвена статия за формата:", preparedArticle);
        
        // Генерираме нов ключ за формата, за да е сигурно, че ще се рендерира отначало
        setArticleFormKey(`article-form-${Date.now()}`);
      } catch (error) {
        console.error("Грешка при зареждане на статията:", error);
        notify("error", error.message);
        setIsLoading(false);
        navigate("/profile/articles");
      }
    };
    
    loadArticle();
  }, [id, navigate]);
  
  // Функция за подготовка на статия за редактиране
  const prepareArticleForEdit = (article) => {
    // Копираме статията
    const preparedArticle = { ...article };
    // Преобразуваме резюмето към EditorState
    preparedArticle.summary = createEditorState(article.summary);
    
    // КЛЮЧОВА ПРОМЯНА: Проверяваме за видео URL в sources масива
    if (preparedArticle.mainImage) {
        // Запазваме типа и thumbnail
        preparedArticle.mainImage.type = article.mainImage.type || "image";
        preparedArticle.mainImage.thumbnail = article.mainImage.thumbnail || "";
        
        // ВАЖНО: Извличане на videoUrl от sources масива
        if (preparedArticle.mainImage.type === "video") {
            // Ако videoUrl е undefined, но имаме sources масив с поне един елемент
            if (!preparedArticle.mainImage.videoUrl && 
                preparedArticle.mainImage.sources && 
                preparedArticle.mainImage.sources.length > 0) {
                
                preparedArticle.mainImage.videoUrl = preparedArticle.mainImage.sources[0];

            }
        }
        
        // Преобразуваме alt текста
        if (preparedArticle.mainImage.alt) {
            preparedArticle.mainImage.alt = createEditorState(preparedArticle.mainImage.alt);
        } else {
            preparedArticle.mainImage.alt = createEditorState();
        }
    }
    
    // Преобразуваме секциите
    if (preparedArticle.sections && preparedArticle.sections.length > 0) {
        preparedArticle.sections = preparedArticle.sections.map(section => {
            // Преобразуваме съдържанието към EditorState
            const sectionCopy = {
                ...section,
                content: createEditorState(section.content)
            };
            
            // ВАЖНО: Инициализираме масив image, ако не съществува
            if (!sectionCopy.image) {
                sectionCopy.image = [];
            }
            
            // Проверяваме дали секцията има sectionImages (вложени изображения)
            if (section.sectionImages && Array.isArray(section.sectionImages)) {
                // Вече имаме масив image, затова добавяме всички изображения от sectionImages
                section.sectionImages.forEach(img => {
                    if (img.src) {
                        sectionCopy.image.push({
                            src: img.src,
                            alt: img.alt ? createEditorState(img.alt) : createEditorState(),
                            caption: img.caption ? createEditorState(img.caption) : createEditorState()
                        });
                    }
                });
            }
            
            // Обработка на изображенията в секцията (ако вече имаме масив image)
            if (Array.isArray(section.image)) {
                // Трансформираме съществуващия масив image
                const transformedImages = section.image.map(img => ({
                    ...img,
                    src: img.src,
                    alt: img.alt ? createEditorState(img.alt) : createEditorState(),
                    caption: img.caption ? createEditorState(img.caption) : createEditorState()
                }));
                
                // Обединяваме с вече добавените от sectionImages
                sectionCopy.image = [...sectionCopy.image, ...transformedImages];
            }
            else if (section.image && section.image.src) {
                // Ако имаме само едно изображение, което не е в масив
                sectionCopy.image.push({
                    src: section.image.src,
                    alt: section.image.alt ? createEditorState(section.image.alt) : createEditorState(),
                    caption: section.image.caption ? createEditorState(section.image.caption) : createEditorState()
                });
            }
            
            return sectionCopy;
        });
    }
    
    return preparedArticle;
};
  
  // Функция за обработка на Submit от формата
  const handleUpdateArticle = async (formData) => {
    try {
      setStatusMessage({
        type: "warning",
        text: "Запазване на статията..."
      });
      
      // Добавяме id и updateAt към formData
      const articleToUpdate = {
        ...formData,
        id: originalArticle.id,
        updateAt: new Date().toISOString()
      };
      
      // Подаваме към updateArticle функцията
      await updateArticle(id, articleToUpdate);
      
      setStatusMessage({
        type: "success",
        text: "Статията беше успешно обновена!"
      });
      
      setLastSaved(new Date());
      
      // Изчистваме съобщението след известно време
      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
      
    } catch (error) {
      console.error("Грешка при обновяване на статията:", error);
      setStatusMessage({
        type: "error",
        text: `Грешка: ${error.message}`
      });
      notify("error", error.message);
    }
  };
  
  // Функция за отказ и връщане към списъка със статии
  const handleCancel = () => {
    navigate("/profile/articles");
  };
  
  // Ако още зареждаме статията, показваме съобщение за зареждане
  if (isLoading || !originalArticle) {
    return (
      <div className="edit-article-container">
        <div className="edit-article-loading">
          <h2>Зареждане на статията...</h2>
        </div>
      </div>
    );
  }
  
  // Форматиране на дата
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="edit-article-container">
      <div className="edit-article-main">
        <div className="edit-article-header">
          <h1 className="edit-article-title">
            <FontAwesomeIcon icon={faEdit} /> Редактиране на статия
          </h1>
          
          <div className="edit-article-actions">
            <button className="edit-article-action-btn cancel-btn" onClick={handleCancel}>
              <FontAwesomeIcon icon={faTimes} /> Отказ
            </button>
          </div>
        </div>
        
        {/* Статус съобщение */}
        {statusMessage && (
          <div className={`edit-article-status ${statusMessage.type}`}>
            <FontAwesomeIcon 
              icon={
                statusMessage.type === "success" ? faCheckCircle : 
                statusMessage.type === "error" ? faExclamationTriangle :
                faExclamationTriangle
              } 
            />
            <p className="status-message">{statusMessage.text}</p>
          </div>
        )}
        
        {/* Форма за редактиране на статия */}
        {originalArticle && (
          <ArticleCreateForm 
            key={articleFormKey}
            initialValues={originalArticle}
            onSubmitHandler={handleUpdateArticle}
            isEditMode={true}
          />
        )}
      </div>
      
      <div className="edit-article-sidebar">
        {/* Информация за статията */}
        <div className="edit-article-info">
          <h3>Информация за статията</h3>
          
          <div className="article-info-item">
            <span className="article-info-label">
              <FontAwesomeIcon icon={faEye} /> Прегледи:
            </span>
            <span className="article-info-value">
              {getViewCount(originalArticle.id) || 0}
            </span>
          </div>
          
          <div className="article-info-item">
            <span className="article-info-label">
              <FontAwesomeIcon icon={faCalendarAlt} /> Създадена на:
            </span>
            <span className="article-info-value">
              {formatDate(originalArticle.publishDate)}
            </span>
          </div>
          
          {originalArticle.updateAt && (
            <div className="article-info-item">
              <span className="article-info-label">
                <FontAwesomeIcon icon={faCalendarAlt} /> Последна промяна:
              </span>
              <span className="article-info-value">
                {formatDate(originalArticle.updateAt)}
              </span>
            </div>
          )}
          
          {lastSaved && (
            <div className="article-info-item">
              <span className="article-info-label">
                <FontAwesomeIcon icon={faCalendarAlt} /> Току-що запазена:
              </span>
              <span className="article-info-value">
                {formatDate(lastSaved)}
              </span>
            </div>
          )}
          
          <div className="article-info-item">
            <span className="article-info-label">
              <FontAwesomeIcon icon={faUser} /> Автор:
            </span>
            <span className="article-info-value">
              {originalArticle.author}
            </span>
          </div>
        </div>
        
        {/* Панел с аналитични данни */}
        <AnalyticsPanel articleId={originalArticle.id} articleTitle={originalArticle.title} />
      </div>
    </div>
  );
}

export default EditArticle;