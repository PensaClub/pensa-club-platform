/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './storyPubView.css';

import { useInitiativeContext } from '../../../contexts/InitiativeProvider';
import { Comments } from '../Comments/Comments';
import { Loader } from '../../../Loader/Loader';
import ScrollToTop from '../../../ScrollToTop/ScrollToTop';
import ClubCardPromo from '../../../Articles/ArticlesList/ClubCardPromo/ClubCardPromo';
import { useAnalytics } from '../../../contexts/AnalyticsContext';
import { getDownloadsCountText, getLikesCountText, getViewCountText } from '../../../../utils/textUtils';
import { ShareButton } from '../../../ShareButton/ShareButton';

export const StoryPubView = ({ type, previewMode = false, previewData = null }) => {
    const { slug } = useParams();
    const { t } = useTranslation();
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
        getPublicationBySlug,
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
                    // Use preview data directly
                    data = previewData;
                } else if (type === 'story') {
                    data = await getStoryBySlug(slug);
                } else {
                    data = await getPublicationBySlug(slug);
                }

                setContent(data);

                // Only load related content and analytics for non-preview mode
                if (data && !previewMode) {
                    await trackStoryOrPublication(data.id, data.title, type);

                    const updatedData = await getPublicationBySlug(slug);
                    setContent(updatedData);

                    await loadContentViewCounts([data.id], type);
                    // Зарежда download counts за publications
                    if (type === 'publication') {
                        await loadDownloadCounts([data.id], type);
                    }
                    await loadShareCounts([data.id], type);

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
            // For preview mode, set content immediately
            setContent(previewData);
            setIsLoading(false);
        } else if (slug) {
            fetchContent();
        }
    }, [slug, type, previewMode, previewData]);

    // Add a new useEffect to sync content with context state
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
        // Не спираме default behavior-а - файлът ще се свали нормално
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

    // Получаване на реалния download count
    const getRealDownloadCount = () => {
        if (!content || type !== 'publication') return 0;
        return content.downloads || 0;
    };

    // Check if there are any connections to show
    const hasConnections = () => {
        if (!content || type !== 'publication') return false;
        return (content.initiatives && content.initiatives.length > 0) ||
               (content.projects && content.projects.length > 0);
    };

    // Generate a slug for section if it doesn't have one
    const generateSectionSlug = (title, index) => {
        if (!title) return `section-${index}`;
        return title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-') || `section-${index}`;
    };

    // Handle TOC link click with proper offset
    const handleTOCClick = (e, sectionSlug) => {
        e.preventDefault();
        const target = document.getElementById(sectionSlug);
        if (target) {
            const headerHeight = 100;
            const targetPosition = target.offsetTop - headerHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    };

    if (isLoading) {
        return <Loader />;
    }

    if (!content) {
        return (
            <div className="story-pub-not-found">
                <div className="container">
                    <h1>{t('publications.view.notFound.title')}</h1>
                    <p>{t('publications.view.notFound.description')}</p>
                    <Link to="/initiatives" className="back-link">
                        {t('publications.view.notFound.backToInitiatives')}
                    </Link>
                </div>
            </div>
        );
    }

    // Don't render breadcrumbs, actions, comments, or related content in preview mode
    const shouldShowActions = !previewMode;
    const shouldShowComments = !previewMode && content?.commentsEnabled;
    const shouldShowRelated = !previewMode && relatedContent.length > 0;
    // Fix TOC logic - show if there are sections with titles
    const shouldShowTOC = content.sections && content.sections.length > 0 &&
                         content.sections.some(section => section.title && section.title.trim());
    const shouldShowConnections = !previewMode && hasConnections();

    return (
        <article className="story-pub-view">
            {/* Hero Section */}
            <section className="story-pub-hero">
                <div className="story-pub-hero-background">
                    {content.image?.src ? (
                        <img
                            src={content.image.src}
                            alt={content.image.alt || content.title || 'Publication'}
                            className="story-pub-hero-image"
                        />
                    ) : (
                        <div className="story-pub-hero-placeholder">
                            <span
                                className="story-pub-hero-placeholder-text"
                                style={{ zIndex: '3' }}
                            >
                                {t('publications.preview.noImageAvailable')}
                            </span>
                        </div>
                    )}
                    <div className="story-pub-hero-overlay"></div>
                </div>

                <div className="story-pub-hero-content">
                    <div className="container">
                        <div className="story-pub-hero-main">
                            <div className="story-pub-meta-badges">
                                <span className="story-pub-type-badge">{getTypeTranslation()}</span>
                                <span className="story-pub-category-badge">
                                    {content.category || t('publications.categories.other')}
                                </span>
                            </div>

                            <h1 className="story-pub-title">{content.title}</h1>
                            <p className="story-pub-description">{content.shortDescription}</p>

                            <div className="story-pub-meta">
                                <div className="story-pub-meta-item">
                                    <span className="story-pub-meta-icon">📅</span>
                                    <span className="story-pub-meta-text">{formatDate(content.publishedAt)}</span>
                                </div>

                                {content.author && (
                                    <div className="story-pub-meta-item">
                                        <span className="story-pub-meta-icon">✍️</span>
                                        <span className="story-pub-meta-text">{content.author}</span>
                                    </div>
                                )}

                                <div className="story-pub-meta-item">
                                    <span className="story-pub-meta-icon">⏱️</span>
                                    <span className="story-pub-meta-text">{content.readTime}</span>
                                </div>

                                {/* Always show views, even if 0 */}
                                <div className="story-pub-meta-item">
                                    <span className="story-pub-meta-icon">👁️</span>
                                    <span className="story-pub-meta-text">{getViewCountText(getCurrentViewCount(), t)}</span>
                                </div>

                                {/* Always show downloads for publications, even if 0 */}
                                {type === 'publication' && (
                                    <div className="story-pub-meta-item">
                                        <span className="story-pub-meta-icon">⬇️</span>
                                        <span className="story-pub-meta-text">{getDownloadsCountText(getRealDownloadCount(), t)}</span>
                                    </div>
                                )}
                            </div>

                            {content.tags && content.tags.length > 0 && (
                                <div className="story-pub-tags">
                                    {content.tags.map((tag, index) => (
                                        <span key={index} className="story-pub-tag">#{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="story-pub-content">
                <div className="container">
                    <div className="story-pub-layout">
                        {/* Article Content */}
                        <div className="story-pub-article">

                            {/* Кратко описание */}
                            <div className="story-pub-excerpt">
                                <p>{content.shortDescription}</p>
                            </div>

                            {/* Sections */}
                            {content.sections && content.sections.length > 0 ? (
                                <div className="story-pub-sections">
                                    {content.sections.map((section, index) => {
                                        const sectionSlug = section.titleSlug || generateSectionSlug(section.title, index);
                                        return (
                                            <section key={index} className="story-pub-section" id={sectionSlug}>
                                                <h2 className="story-pub-section-title">{section.title}</h2>

                                                {section.image && (
                                                    <div className="story-pub-section-image">
                                                        <img
                                                            src={section.image.src}
                                                            alt={section.image.alt}
                                                        />
                                                    </div>
                                                )}

                                                <div className="story-pub-section-content">
                                                    {section.content}
                                                </div>
                                            </section>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="story-pub-empty-content">
                                    <h3>No content sections added yet</h3>
                                    <p>Add some content sections to see them in the preview.</p>
                                </div>
                            )}

                            {/* Author Info for Stories */}
                            {type === 'story' && content.author && (
                                <div className="story-pub-author">
                                    <div className="author-avatar">
                                        {content.authorImage ? (
                                            <img src={content.authorImage} alt={content.author} />
                                        ) : (
                                            <div className="author-placeholder">
                                                {content.author.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="author-info">
                                        <h4 className="author-name">{content.author}</h4>
                                        <p className="author-title">
                                            {t('publications.view.author.label')}
                                        </p>
                                        {content.authorEmail && (
                                            <a href={`mailto:${content.authorEmail}`} className="author-email">
                                                {content.authorEmail}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Social Actions */}
                            {shouldShowActions && (
                                <div className="story-pub-actions">
                                    {type === 'publication' && (
                                        <button
                                            className={`action-btn like-btn ${content.isLiked ? 'liked' : ''}`}
                                            onClick={handleLike}
                                        >
                                            <span className="action-icon">
                                                {content.isLiked ? '❤️' : '🤍'}
                                            </span>
                                            <span className="action-text">
                                                {getLikesCountText(content.likes || 0, t)}
                                            </span>
                                        </button>
                                    )}
                                    <ShareButton
                                        contentId={content.id}
                                        contentTitle={content.title}
                                        contentType={type}
                                        onShare={handleShare}
                                        className="action-btn"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        {(shouldShowRelated || shouldShowTOC || shouldShowConnections || (type === 'publication' && content.downloadUrl && !previewMode)) && (
                            <aside className="story-pub-sidebar">
                                {/* Download Button for Publications - Top of sidebar */}
                                {type === 'publication' && content.downloadUrl && !previewMode && (
                                    <div className="story-pub-download-sidebar">
                                        <h3 className="download-sidebar-title">
                                            {t('publications.view.download.title')}
                                        </h3>
                                        <a href={content.downloadUrl}
                                            className="story-pub-download-btn-sidebar"
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={handleDownload}
                                        >
                                            <div className="download-btn-content">
                                                <span className="download-icon-sidebar">📄</span>
                                                <div className="download-info-sidebar">
                                                    <span className="download-text-sidebar">
                                                        {t('publications.view.download.button')}
                                                    </span>
                                                    <span className="download-details-sidebar">
                                                        {content.fileType?.toUpperCase()} • {content.fileSize}
                                                    </span>
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                )}

                                {/* Connections Section - Second in sidebar */}
                                {shouldShowConnections && (
                                    <div className="story-pub-connections">
                                        <h3 className="connections-title">
                                            {t('publications.view.connections.title')}
                                        </h3>
                                        <div className="connections-content">
                                            {/* Initiative Connections */}
                                            {content.initiatives && content.initiatives.length > 0 && (
                                                <>
                                                    <h4 className="connections-group-title">
                                                        {t('publications.view.connections.initiatives')}
                                                    </h4>
                                                    <ul className="connections-list">
                                                        {content.initiatives.map((initiative) => (
                                                            <li key={initiative.id} className="connection-item">
                                                                <Link
                                                                    to={`/initiatives/${initiative.slug}`}
                                                                    className="connection-link"
                                                                >
                                                                    <span className="connection-text">
                                                                        {initiative.title}
                                                                        {initiative.isDraft && (
                                                                            <span className="draft-badge"> ({t('publications.connections.draft')})</span>
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
                                                    <h4 className="connections-group-title">
                                                        {t('publications.view.connections.projects')}
                                                    </h4>
                                                    <ul className="connections-list">
                                                        {content.projects.map((project) => (
                                                            <li key={project.id} className="connection-item">
                                                                <Link
                                                                    to={`/projects/${project.slug}`}
                                                                    className="connection-link"
                                                                >
                                                                    <span className="connection-text">
                                                                        {project.title}
                                                                        {project.isDraft && (
                                                                            <span className="draft-badge"> ({t('publications.connections.draft')})</span>
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
                                    <div className="story-pub-toc">
                                        <h3 className="toc-title">
                                            {t('publications.view.toc.title')}
                                        </h3>
                                        <div className="toc-content">
                                            <ul className="toc-list">
                                                {content.sections
                                                    .filter(section => section.title && section.title.trim())
                                                    .map((section, index) => {
                                                        const sectionSlug = section.titleSlug || generateSectionSlug(section.title, index);
                                                        return (
                                                            <li key={index} className="toc-item">
                                                                <a
                                                                    href={`#${sectionSlug}`}
                                                                    className="toc-link"
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
                                    <div className="story-pub-related">
                                        <h3 className="story-pub-related-title">
                                            {t('publications.view.related.title')}
                                        </h3>
                                        <div className="story-pub-related-list">
                                            {relatedContent.slice(0, 3).map((item) => (
                                                <Link
                                                    key={item.id}
                                                    to={`/${type}s/${item.slug}`}
                                                    className="story-pub-related-card"
                                                >
                                                    <div className="related-image">
                                                        <img src={item.image.src} alt={item.image.alt} />
                                                    </div>
                                                    <div className="related-info">
                                                        <span className="related-type">{getTypeTranslation()}</span>
                                                        <h4 className="related-title">{item.title}</h4>
                                                        <p className="related-excerpt">{item.shortDescription}</p>
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
                        <section className="story-pub-comments">
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
    );
};
