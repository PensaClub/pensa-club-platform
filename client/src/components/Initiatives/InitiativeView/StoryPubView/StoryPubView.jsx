/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { LocalizedLink as Link } from '../../../LocalizedLink/LocalizedLink';
import { useTranslation } from 'react-i18next';
import './storyPubView.css';
import { renderSlateContent } from '../../../../utils/slateRenderer.jsx';
import { useInitiativeContext } from '../../../contexts/InitiativeProvider';
import { Comments } from '../Comments/Comments';
import { Loader } from '../../../Loader/Loader';
import ScrollToTop from '../../../ScrollToTop/ScrollToTop';
import ClubCardPromo from '../../../Articles/ArticlesList/ClubCardPromo/ClubCardPromo';
import { useAnalytics } from '../../../contexts/AnalyticsContext';
import { getDownloadsCountText, getLikesCountText, getViewCountText } from '../../../../utils/textUtils';
import { ShareButton } from '../../../ShareButton/ShareButton';
import SEOHead from '../../../SEO/SEOHead';
import { TextZoom } from '../../../TextZoom/TextZoom.jsx';

export const StoryPubView = ({ type, previewMode = false, previewData = null }) => {
    const { slug } = useParams();
    const { t } = useTranslation('content');
    const [content, setContent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [relatedContent, setRelatedContent] = useState([]);
    const {
        trackStoryOrPublication,
        getViewCount,
        loadContentViewCounts,
        trackContentDownload,
        loadDownloadCounts,
        getCurrentDownloadCount,
        trackContentShare,
        loadShareCounts,
        getCurrentShareCount
    } = useAnalytics();

    const {
        getStoryBySlug,
        getPublicationById,
        getRelatedContent,
        likePublication,
        currentPublication,
    } = useInitiativeContext();

    useEffect(() => {
        const fetchContent = async () => {
            setIsLoading(true);
            try {
                let data;

                if (previewMode && previewData) {
                    data = previewData;
                } else if (type === 'story') {
                    data = await getStoryBySlug(slug);
                } else {
                    data = await getPublicationById(slug);
                }

                setContent(data);

                if (data) {
                    if (!previewMode) {
                        await trackStoryOrPublication(data.id, data.title, type);

                        const updatedData = type === 'story' ? await getStoryBySlug(slug) : await getPublicationById(slug);
                        setContent(updatedData);

                        await loadContentViewCounts([data.id], type);
                        if (type === 'publication') {
                            await loadDownloadCounts([data.id], type);
                        }
                        await loadShareCounts([data.id], type);
                    }

                    const related = await getRelatedContent(type, data.id);
                    setRelatedContent(related);
                }
            } catch (error) {
                console.error(`Error fetching ${type}:`, error);
                setContent(null);
            } finally {
                setIsLoading(false);
            }
        };

        if (previewMode && previewData) {
            setContent(previewData);
            setIsLoading(false);

            if (previewData.id) {
                getRelatedContent(type, previewData.id)
                    .then(related => setRelatedContent(related))
                    .catch(error => console.error('Error loading related content for preview:', error));
            }
        } else if (slug) {
            fetchContent();
        }
    }, [slug, type, previewMode, previewData]);

    useEffect(() => {
        if (type === 'publication' && currentPublication && content && currentPublication.id === content.id) {
            setContent(currentPublication);
        }
    }, [currentPublication, content, type]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('bg-BG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getTypeTranslation = () => {
        return type === 'story'
            ? t('publications.view.types.story', 'История')
            : t('publications.view.types.publication', 'Публикация');
    };

    const getCommentsEntityType = () => {
        return type === 'story' ? 'story' : 'publication';
    };

    const getCurrentViewCount = () => {
        if (!content) return 0;
        return content.views || 0;
    };

    const handleDownload = (e) => {
        if (content && type === 'publication') {
            trackContentDownload(
                content.id,
                content.title,
                type,
                content.fileType,
                content.fileSize
            );
        }
    };

    const handleShare = (contentId, contentTitle, contentType, shareMethod) => {
        trackContentShare(contentId, contentTitle, contentType, shareMethod);
    };

    const handleLike = async () => {
        if (!content || type !== 'publication') return;

        try {
            await likePublication(content.id, (updatedPublication) => {
                setContent(updatedPublication);
            });
        } catch (error) {
            console.error('Error liking publication:', error);
        }
    };

    const getRealDownloadCount = () => {
        if (!content || type !== 'publication') return 0;
        return content.downloads || 0;
    };

    const hasConnections = () => {
        if (!content) return false;

        if (type === 'publication') {
            return (content.initiatives && content.initiatives.length > 0) ||
                (content.projects && content.projects.length > 0) ||
                (content.relatedPublications && content.relatedPublications.length > 0);
        } else if (type === 'story') {
            return (content.initiatives && content.initiatives.length > 0) ||
                (content.projects && content.projects.length > 0) ||
                (content.relatedStories && content.relatedStories.length > 0);
        }

        return false;
    };

    const generateSectionSlug = (title, index) => {
        if (!title) return `section-${index}`;
        return title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-') || `section-${index}`;
    };

    const handleTOCClick = (e, sectionSlug) => {
        e.preventDefault();
        const target = document.getElementById(sectionSlug);
        if (target) {
            const headerHeight = 100;

            if (previewMode) {
                const modalBody = target.closest('.publication-preview-modal-body');
                if (modalBody) {
                    const targetPosition = target.offsetTop - headerHeight;
                    modalBody.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    return;
                }
            }

            const targetPosition = target.offsetTop - headerHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    };

    const getCategoryTranslation = (categoryKey) => {
        if (!categoryKey) return t('publications.categories.other');

        const translationKey = `publications.categories.${categoryKey}`;
        const translation = t(translationKey);

        if (translation === translationKey) {
            return categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
        }

        return translation;
    };

    const getSortedSections = () => {
        if (!content?.sections || content.sections.length === 0) return [];
        return [...content.sections].sort((a, b) => (a.order || 0) - (b.order || 0));
    };

    const renderSectionContent = (content) => {
        if (!content) {
            return <p>{t('publications.preview.noContent', 'Няма съдържание')}</p>;
        }

        // Ако е HTML string - рендирай с dangerouslySetInnerHTML
        if (typeof content === 'string') {
            // Проверка дали съдържа HTML тагове
            if (content.includes('<') && content.includes('>')) {
                return (
                    <div
                        className="story-pub-view-html-content"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                );
            }
            // Plain text
            return <p>{content}</p>;
        }

        if (Array.isArray(content)) {
            return renderSlateContent(content);
        }

        // Fallback
        return <p>{String(content)}</p>;
    };
    // ✅ SEO META DATA
    const metaData = useMemo(() => {
        if (!content) {
            return {
                title: type === 'story'
                    ? 'Зареждане на история... | Pensa Club'
                    : 'Зареждане на публикация... | Pensa Club',
                description: 'Зареждане на съдържание от Pensa Club',
                keywords: 'Pensa Club, дигитална грамотност, пенсионери',
                image: 'https://pensa.club/images/iniciatives/iniciatives-2.jpg',
                publishedTime: null,
                modifiedTime: null,
                author: 'Pensa Club'
            };
        }

        // Clean description
        const cleanDescription = content.shortDescription?.replace(/<[^>]*>/g, '').trim() || '';
        const description = cleanDescription.substring(0, 160) + (cleanDescription.length > 160 ? '...' : '');

        // Keywords от tags
        const baseKeywords = type === 'story'
            ? 'истории, Pensa Club, пенсионери, дигитална грамотност'
            : 'публикации, Pensa Club, пенсионери, дигитална грамотност';

        const keywords = content.tags && content.tags.length > 0
            ? `${content.tags.join(', ')}, ${baseKeywords}`
            : baseKeywords;

        // Image URL
        let imageUrl = 'https://pensa.club/images/iniciatives/iniciatives-2.jpg';
        if (content.image?.src) {
            imageUrl = content.image.src.startsWith('http')
                ? content.image.src
                : `https://pensa.club${content.image.src}`;
        }

        return {
            title: `${content.title} | Pensa Club`,
            description,
            keywords,
            image: imageUrl,
            publishedTime: content.publishedAt || content.createdAt,
            modifiedTime: content.updatedAt || content.publishedAt,
            author: content.author || 'Pensa Club',
            section: getCategoryTranslation(content.category)
        };
    }, [content, type, t]);

    // ✅ STRUCTURED DATA ЗА SCHEMA.ORG
    const structuredData = useMemo(() => {
        if (!content) return null;

        const cleanDescription = content.shortDescription?.replace(/<[^>]*>/g, '').trim() || '';

        let imageUrl = 'https://pensa.club/images/iniciatives/iniciatives-2.jpg';
        if (content.image?.src) {
            imageUrl = content.image.src.startsWith('http')
                ? content.image.src
                : `https://pensa.club${content.image.src}`;
        }

        return {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": content.title,
            "description": cleanDescription.substring(0, 200),
            "image": imageUrl,
            "author": {
                "@type": content.author ? "Person" : "Organization",
                "name": content.author || "Pensa Club"
            },
            "publisher": {
                "@type": "Organization",
                "name": "Pensa Club",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://pensa.club/logo.png"
                },
                "sameAs": [
                    "https://www.facebook.com/profile.php?id=61578204366479"
                ]
            },
            "datePublished": content.publishedAt || content.createdAt,
            "dateModified": content.updatedAt || content.publishedAt,
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `https://pensa.club/${type}s/${content.slug}`
            },
            "keywords": content.tags?.join(', ') || "дигитална грамотност, пенсионери",
            "articleSection": getCategoryTranslation(content.category) || (type === 'story' ? 'Истории' : 'Публикации'),
            "inLanguage": "bg",
            "url": `https://pensa.club/${type}s/${content.slug}`
        };
    }, [content, type, t]);

    if (isLoading) {
        return <Loader />;
    }

    if (!content) {
        return (
            <div className="story-pub-view-not-found">
                <div className="story-pub-view-container">
                    <h1>{t('publications.view.notFound.title')}</h1>
                    <p>{t('publications.view.notFound.description')}</p>
                    <Link
                        to={type === 'story' ? '/stories' : '/publications'}
                        className="story-pub-view-back-link"
                    >
                        {t(`publications.view.notFound.backTo${type === 'story' ? 'Stories' : 'Publications'}`)}
                    </Link>
                </div>
            </div>
        );
    }

    const shouldShowActions = !previewMode;
    const shouldShowComments = !previewMode && content?.commentsEnabled;
    const shouldShowRelated = relatedContent.length > 0;

    const sortedSections = getSortedSections();

    const shouldShowTOC = sortedSections.length > 0 &&
        sortedSections.some(section => section.title && section.title.trim());

    const shouldShowConnections = hasConnections();

    const shouldShowSidebar = shouldShowTOC || shouldShowConnections ||
        (type === 'publication' && content.downloadUrl) ||
        shouldShowRelated;

    return (
        <>
        <article className="story-pub-view">
            {/* ✅ SEO HEAD */}
            {!previewMode && content && (
                <SEOHead
                    title={metaData.title}
                    description={metaData.description}
                    keywords={metaData.keywords}
                    image={metaData.image}
                    type="article"
                    publishedTime={metaData.publishedTime}
                    modifiedTime={metaData.modifiedTime}
                    author={metaData.author}
                    section={metaData.section}
                    tags={content.tags || []}
                    structuredData={structuredData}
                />
            )}

            {/* Hero Section */}
            <section className="story-pub-view-hero">
                <div className="story-pub-view-hero-background">
                    {content.image?.src ? (
                        <img
                            src={content.image.src}
                            alt={content.image.alt || content.title || 'Publication'}
                            className="story-pub-view-hero-image"
                        />
                    ) : (
                        <div className="story-pub-view-hero-placeholder">
                            <span
                                className="story-pub-view-hero-placeholder-text"
                                style={{ zIndex: '3' }}
                            >
                                {t('publications.preview.noImageAvailable')}
                            </span>
                        </div>
                    )}
                    <div className="story-pub-view-hero-overlay"></div>
                </div>

                <div className="story-pub-view-hero-content">
                    <div className="story-pub-view-container">
                        <div className="story-pub-view-hero-main">
                            <div className="story-pub-view-meta-badges">
                                <span className="story-pub-view-type-badge">{getTypeTranslation()}</span>
                                <span className="story-pub-view-category-badge">
                                    {getCategoryTranslation(content.category)}
                                </span>
                            </div>

                            <h1 className="story-pub-view-title">{content.title}</h1>
                            <p className="story-pub-view-description">{content.shortDescription}</p>

                            <div className="story-pub-view-meta">
                                <div className="story-pub-view-meta-item">
                                    <span className="story-pub-view-meta-icon">📅</span>
                                    <span className="story-pub-view-meta-text">{formatDate(content.publishedAt)}</span>
                                </div>

                                {content.author && (
                                    <div className="story-pub-view-meta-item">
                                        <span className="story-pub-view-meta-icon">✍️</span>
                                        <span className="story-pub-view-meta-text">{content.author}</span>
                                    </div>
                                )}

                                <div className="story-pub-view-meta-item">
                                    <span className="story-pub-view-meta-icon">⏱️</span>
                                    <span className="story-pub-view-meta-text">{content.readTime}</span>
                                </div>

                                <div className="story-pub-view-meta-item">
                                    <span className="story-pub-view-meta-icon">👁️</span>
                                    <span className="story-pub-view-meta-text">{getViewCountText(getCurrentViewCount(), t)}</span>
                                </div>

                                {type === 'publication' && (
                                    <div className="story-pub-view-meta-item">
                                        <span className="story-pub-view-meta-icon">⬇️</span>
                                        <span className="story-pub-view-meta-text">{getDownloadsCountText(getRealDownloadCount(), t)}</span>
                                    </div>
                                )}
                            </div>

                            {content.tags && content.tags.length > 0 && (
                                <div className="story-pub-view-tags">
                                    {content.tags.map((tag, index) => (
                                        <span key={index} className="story-pub-view-tag">#{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="story-pub-view-content">
                <div className="story-pub-view-container">
                    <div className="story-pub-view-layout">
                        {/* Article Content */}
                        <div className="story-pub-view-article">

                            {/* Кратко описание */}
                            <div className="story-pub-view-excerpt">
                                <p>{content.shortDescription}</p>
                            </div>

                            {/* Sections - Сортирани по ID */}
                            {sortedSections.length > 0 ? (
                                <div className="story-pub-view-sections">
                                    {sortedSections.map((section, index) => {
                                        const sectionSlug = section.titleSlug || generateSectionSlug(section.title, index);
                                        return (
                                            <section key={section.id || index} className="story-pub-view-section" id={sectionSlug}>
                                                <h2 className="story-pub-view-section-title">{section.title}</h2>

                                                {/* Section Image */}
                                                {(section.image?.src || section.sectionImage?.src) && (
                                                    <div className="story-pub-view-section-image">
                                                        <img
                                                            src={section.image?.src || section.sectionImage?.src}
                                                            alt={section.image?.alt || section.sectionImage?.alt || section.title}
                                                        />
                                                    </div>
                                                )}

                                                {/* Section Video */}
                                                {section.videoUrl && (
                                                    <div className="story-pub-view-section-video">
                                                        <video
                                                            controls
                                                            poster={section.thumbnailUrl}
                                                            preload="metadata"
                                                            className="story-pub-view-video-player"
                                                        >
                                                            <source src={section.videoUrl} type="video/mp4" />
                                                            <source src={section.videoUrl} type="video/webm" />
                                                            <source src={section.videoUrl} type="video/ogg" />
                                                            {t('publications.video.notSupported', 'Вашият браузър не поддържа видео.')}
                                                        </video>
                                                    </div>
                                                )}

                                                <div className="story-pub-view-section-content">
                                                    {renderSectionContent(section.content)}
                                                </div>
                                            </section>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="story-pub-view-empty-content">
                                    <h3>No content sections added yet</h3>
                                    <p>Add some content sections to see them in the preview.</p>
                                </div>
                            )}

                            {/* Author Info for Stories */}
                            {type === 'story' && content.author && (
                                <div className="story-pub-view-author">
                                    <div className="story-pub-view-author-avatar">
                                        {content.authorImage ? (
                                            <img
                                                src={content.authorImage}
                                                alt={content.author}
                                            />
                                        ) : (
                                            <div className="story-pub-view-author-placeholder">
                                                {content.author.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="story-pub-view-author-info">
                                        <h4 className="story-pub-view-author-name">{content.author}</h4>
                                        {content.authorEmail && (
                                            <p className="story-pub-view-author-email">{content.authorEmail}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Social Actions */}
                            {shouldShowActions && (
                                <div className="story-pub-view-actions">
                                    {type === 'publication' && (
                                        <button
                                            className={`story-pub-view-action-btn story-pub-view-like-btn ${content.isLiked ? 'story-pub-view-liked' : ''}`}
                                            onClick={handleLike}
                                        >
                                            <span className="story-pub-view-action-icon">
                                                {content.isLiked ? '❤️' : '🤍'}
                                            </span>
                                            <span className="story-pub-view-action-text">
                                                {getLikesCountText(content.likes || 0, t)}
                                            </span>
                                        </button>
                                    )}
                                    <ShareButton
                                        contentId={content.id}
                                        contentTitle={content.title}
                                        contentType={type}
                                        onShare={handleShare}
                                        className="story-pub-view-action-btn"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        {shouldShowSidebar && (
                            <aside className="story-pub-view-sidebar">
                                {/* Download Button for Publications - Top of sidebar */}
                                {type === 'publication' && content.downloadUrl && (
                                    <div className="story-pub-view-download-sidebar">
                                        <h3 className="story-pub-view-download-sidebar-title">
                                            {t('publications.view.download.title')}
                                        </h3>
                                        <a href={content.downloadUrl}
                                            className="story-pub-view-download-btn-sidebar"
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={handleDownload}
                                        >
                                            <div className="story-pub-view-download-btn-content">
                                                <span className="story-pub-view-download-icon-sidebar">📄</span>
                                                <div className="story-pub-view-download-info-sidebar">
                                                    <span className="story-pub-view-download-text-sidebar">
                                                        {t('publications.view.download.button')}
                                                    </span>
                                                    <span className="story-pub-view-download-details-sidebar">
                                                        {content.fileType?.toUpperCase()} • {content.fileSize}
                                                    </span>
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                )}

                                {/* Connections Section - Second in sidebar */}
                                {shouldShowConnections && (
                                    <div className="story-pub-view-connections">
                                        <h3 className="story-pub-view-connections-title">
                                            {t('publications.view.connections.title')}
                                        </h3>
                                        <div className="story-pub-view-connections-content">
                                            {/* Initiative Connections */}
                                            {content.initiatives && content.initiatives.length > 0 && (
                                                <>
                                                    <h4 className="story-pub-view-connections-group-title">
                                                        {t('publications.view.connections.initiatives')}
                                                    </h4>
                                                    <ul className="story-pub-view-connections-list">
                                                        {content.initiatives.map((initiative, index) => (
                                                            <li key={`initiative-${initiative.id || initiative.slug || index}`} className="story-pub-view-connection-item">
                                                                <Link
                                                                    to={`/initiatives/${initiative.slug}`}
                                                                    className="story-pub-view-connection-link"
                                                                >
                                                                    <span className="story-pub-view-connection-text">
                                                                        {initiative.title}
                                                                        {initiative.isDraft && (
                                                                            <span className="story-pub-view-draft-badge"> ({t('publications.connections.draft')})</span>
                                                                        )}
                                                                    </span>
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </>
                                            )}

                                            {/* Project Connections */}
                                            {content.projects && content.projects.length > 0 && (
                                                <>
                                                    <h4 className="story-pub-view-connections-group-title">
                                                        {t('publications.view.connections.projects')}
                                                    </h4>
                                                    <ul className="story-pub-view-connections-list">
                                                        {content.projects.map((project, index) => (
                                                            <li key={`project-${project.id || project.slug || index}`} className="story-pub-view-connection-item">
                                                                <Link
                                                                    to={`/projects/${project.slug}`}
                                                                    className="story-pub-view-connection-link"
                                                                >
                                                                    <span className="story-pub-view-connection-text">
                                                                        {project.title}
                                                                        {project.isDraft && (
                                                                            <span className="story-pub-view-draft-badge"> ({t('publications.connections.draft')})</span>
                                                                        )}
                                                                    </span>
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </>
                                            )}

                                            {/* Related Publications Connections */}
                                            {content.relatedPublications && content.relatedPublications.length > 0 && (
                                                <>
                                                    <h4 className="story-pub-view-connections-group-title">
                                                        {t('publications.view.connections.publications')}
                                                    </h4>
                                                    <ul className="story-pub-view-connections-list">
                                                        {content.relatedPublications.map((publication, index) => (
                                                            <li key={`related-pub-${publication.id || index}`} className="story-pub-view-connection-item">
                                                                <Link
                                                                    to={`/publications/${publication.slug}`}
                                                                    className="story-pub-view-connection-link"
                                                                >
                                                                    <span className="story-pub-view-connection-text">
                                                                        {publication.title}
                                                                        {publication.isDraft && (
                                                                            <span className="story-pub-view-draft-badge"> ({t('publications.connections.draft')})</span>
                                                                        )}
                                                                    </span>
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </>
                                            )}

                                            {/* Related Stories Connections - for stories only */}
                                            {type === 'story' && content.relatedStories && content.relatedStories.length > 0 && (
                                                <>
                                                    <h4 className="story-pub-view-connections-group-title">
                                                        {t('publications.view.connections.stories')}
                                                    </h4>
                                                    <ul className="story-pub-view-connections-list">
                                                        {content.relatedStories.map((story, index) => (
                                                            <li key={`related-story-${story.id || index}`} className="story-pub-view-connection-item">
                                                                <Link
                                                                    to={`/stories/${story.slug}`}
                                                                    className="story-pub-view-connection-link"
                                                                >
                                                                    <span className="story-pub-view-connection-text">
                                                                        {story.title}
                                                                        {story.isDraft && (
                                                                            <span className="story-pub-view-draft-badge"> ({t('publications.connections.draft')})</span>
                                                                        )}
                                                                    </span>
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Table of Contents - Third in sidebar */}
                                {shouldShowTOC && (
                                    <div className="story-pub-view-toc">
                                        <h3 className="story-pub-view-toc-title">
                                            {t('publications.view.toc.title')}
                                        </h3>
                                        <div className="story-pub-view-toc-content">
                                            <ul className="story-pub-view-toc-list">
                                                {sortedSections
                                                    .filter(section => section.title && section.title.trim())
                                                    .map((section, index) => {
                                                        const sectionSlug = section.titleSlug || generateSectionSlug(section.title, index);
                                                        return (
                                                            <li key={section.id || index} className="story-pub-view-toc-item">

                                                                <a href={`#${sectionSlug}`}
                                                                    className="story-pub-view-toc-link"
                                                                    onClick={(e) => handleTOCClick(e, sectionSlug)}
                                                                >
                                                                    {section.title}
                                                                </a>
                                                            </li>
                                                        );
                                                    })}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {/* Related Content - Fourth in sidebar */}
                                {shouldShowRelated && (
                                    <div className="story-pub-view-related">
                                        <h3 className="story-pub-view-related-title">
                                            {t('publications.view.related.title')}
                                        </h3>
                                        <div className="story-pub-view-related-list">
                                            {relatedContent.slice(0, 3).map((item) => (
                                                <Link
                                                    key={item.id}
                                                    to={`/${type}s/${item.slug}`}
                                                    className="story-pub-view-related-card"
                                                >
                                                    <div className="story-pub-view-related-image">
                                                        <img src={item.image.src} alt={item.image.alt} />
                                                    </div>
                                                    <div className="story-pub-view-related-info">
                                                        <span className="story-pub-view-related-type">{getTypeTranslation()}</span>
                                                        <h4 className="story-pub-view-related-card-title">{item.title}</h4>
                                                        <p className="story-pub-view-related-excerpt">{item.shortDescription}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ClubCardPromo - Always at bottom */}
                                <ClubCardPromo />
                            </aside>
                        )}
                    </div>

                    {/* Comments Section */}
                    {shouldShowComments && (
                        <section className="story-pub-view-comments">
                            <Comments
                                entityId={content.id}
                                entityType={getCommentsEntityType()}
                                commentsEnabled={content.commentsEnabled}
                            />
                        </section>
                    )}
                </div>
            </main>
            <ScrollToTop />
        </article>
        <TextZoom />
        </>
    );
};