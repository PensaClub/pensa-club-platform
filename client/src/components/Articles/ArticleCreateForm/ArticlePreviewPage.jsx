import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ArticlePreview from './ArticlePreview/ArticlePreview';
import { convertSlateToHtml } from '../../Initiatives/CreateIniciative/Utils/initiativeEditorUtils.jsx';
// const convertSlateToHtml = (slateValue) => {
//   if (!Array.isArray(slateValue)) return '';

//   const serialize = (node) => {
//     if (typeof node === 'string') return node;
//     if (!node || !node.children) return '';

//     // 🔧 БЕЗОПАСНА обработка на children
//     const children = node.children && Array.isArray(node.children)
//       ? node.children.map(n => serialize(n)).join('')
//       : '';

//     switch (node.type) {
//       case 'heading-one':
//         return `<h1>${children}</h1>`;
//       case 'heading-two':
//         return `<h2>${children}</h2>`;
//       case 'block-quote':
//         return `<blockquote>${children}</blockquote>`;
//       case 'bulleted-list':
//         return `<ul>${children}</ul>`;
//       case 'numbered-list':
//         return `<ol>${children}</ol>`;
//       case 'list-item':
//         return `<li>${children}</li>`;
//       case 'paragraph':
//       default:
//         let text = children;
//         if (node.bold) text = `<strong>${text}</strong>`;
//         if (node.italic) text = `<em>${text}</em>`;
//         if (node.underline) text = `<u>${text}</u>`;
//         return node.type === 'paragraph' ? `<p>${text}</p>` : text;
//     }
//   };

//   try {
//     const result = slateValue.map(serialize).join('');
//     return result || '';
//   } catch (error) {
//     console.error('Грешка при конвертиране на Slate в HTML:', error);
//     return '';
//   }
// };
const ArticlePreviewPage = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    const { previewData, mediaFiles } = location.state || {};

    useEffect(() => {
        // Ако няма данни, пренасочи към създаване на статия
        if (!previewData) {
            navigate('/admin/articles/create');
        }
    }, [previewData, navigate]);

    const handleBack = () => {
        navigate(-1); // Върни се назад
    };

    if (!previewData) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>{t('articles.preview.loading')}</p>
            </div>
        );
    }

    return (
        <ArticlePreview
            article={previewData}
            onBack={handleBack}
            mediaFiles={mediaFiles || { mainImage: [], sectionImages: {} }}
            convertEditorToHtml={convertSlateToHtml}
        />
    );
};

export default ArticlePreviewPage;