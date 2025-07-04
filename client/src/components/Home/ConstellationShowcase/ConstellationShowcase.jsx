import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import './constellationShowcase.css';
import { useInitiativeContext } from '../../contexts/InitiativeProvider';
import { ConstellationMap } from './ConstellationMap/ConstellationMap';
import { ConstellationLegend } from './ConstellationLegend/ConstellationLegend';
import { ConstellationControls } from './ConstellationControls/ConstellationControls';
import { mockInitiatives } from './mockInitiatives'; // Импортираме mock данните

export const ConstellationShowcase = () => {
    const { t } = useTranslation();
    const { initiatives, getAllInitiatives } = useInitiativeContext();
    const [constellationData, setConstellationData] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [hoveredNode, setHoveredNode] = useState(null);
    const sectionRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (initiatives.length === 0) {
            getAllInitiatives();
        }
    }, [initiatives.length, getAllInitiatives]);

    useEffect(() => {
        // Комбинираме реалните и фалшивите инициативи
        const combinedInitiatives = [...initiatives, ...mockInitiatives];
        const transformedData = transformToConstellationData(combinedInitiatives);
        setConstellationData(transformedData);
    }, [initiatives]);

    // Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.2 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) observer.unobserve(sectionRef.current);
        };
    }, []);

    const transformToConstellationData = (initiatives) => {
        const nodes = [];
        const connections = [];
        const initiativeNodeIds = []; 
        let nodeId = 0;

        // Предефиниран pattern за съзвездие
        const getConstellationPattern = () => {
            const width = window.innerWidth;

            if (width < 480) {
                // Много малки телефони - компактен pattern
                return [
                    { x: 20, y: -120 },
                    { x: 240, y: -30 },
                    { x: 30, y: 100 },
                    { x: 250, y: 220 },
                    { x: 20, y: 280 },
                    { x: 260, y: -210 }
                ];
            } else if (width < 640) {
                // Средни телефони - малко по-разпръснат
                return [
                    { x: -20, y: 200 },
                    { x: 240, y: 120 },
                    { x: 120, y: 180 },
                    { x: 200, y: 250 },
                    { x: 0, y: 380 },
                    { x: 220, y: 350 }
                ];
            } else if (width < 768) {
                // Големи телефони/малки таблети
                return [
                    { x: 80, y: 180 },
                    { x: 300, y: 80 },
                    { x: 200, y: 200 },
                    { x: 330, y: 180 },
                    { x: 100, y: 400 },
                    { x: 300, y: 320 }
                ];
            } else {
                // Десктоп - пълния pattern
                return [
                    { x: 50, y: 300 },
                    { x: 350, y: 50 },
                    { x: 400, y: 250 },
                    { x: 700, y: 100 },
                    { x: 950, y: 280 },
                    { x: 850, y: 430 },
                    { x: 450, y: 390 },
                    { x: 250, y: 350 },
                    { x: 950, y: 200 }
                ];
            }
        };

        // И после в transformToConstellationData:
        const constellationPattern = getConstellationPattern();

        initiatives.slice(0,7).forEach((initiative, initIndex) => {  // Променено на 9
            // Main initiative node (централна звезда)
            const pos = constellationPattern[initIndex % constellationPattern.length];
            const initiativeNode = {
                id: nodeId++,
                type: 'initiative',
                title: initiative.title,
                description: initiative.shortDescription,
                image: initiative.mainImage?.src,
                slug: initiative.slug,
                x: pos.x,  
                y: pos.y,  
                size: 'large',
                color: '#1B8B8A',
                pulse: true,
                isFake: initiative.isFake || false // Добавяме isFake флага
            };
            nodes.push(initiativeNode);
            initiativeNodeIds.push(initiativeNode.id);

            // Projects around initiative (планети)
            if (initiative.projects && initiative.projects.length > 0) {
                initiative.projects.slice(0, 3).forEach((project, projIndex) => {
                    const angle = (projIndex * 45 - 45) * (Math.PI / 180);
                    const getProjectRadius = (index) => {
                        const radiusMap = {
                            0: 160,  
                            1: 160,    
                            2: 100,  
                            3: 200,  
                        };
                        return radiusMap[index] || 120 + index * 30;
                    };

                    const radius = getProjectRadius(projIndex);

                    const projectNode = {
                        id: nodeId++,
                        type: 'project',
                        title: project.title,
                        description: project.description,
                        image: project.image,
                        slug: project.slug,
                        status: project.status,
                        x: initiativeNode.x + Math.cos(angle) * radius,
                        y: initiativeNode.y + Math.sin(angle) * radius,
                        size: 'medium',
                        color: '#E26020',
                        parentId: initiativeNode.id,
                        isFake: project.isFake || false // Добавяме isFake флага
                    };
                    nodes.push(projectNode);

                    // Connection line
                    connections.push({
                        from: initiativeNode.id,
                        to: projectNode.id,
                        type: 'project-connection'
                    });
                });
            }

            // Stories as satellites (спътници/комети)
            if (initiative.stories && initiative.stories.length > 0) {
                initiative.stories.slice(0, 2).forEach((story, storyIndex) => {
                    const angle = (storyIndex * 180 + 60) * (Math.PI / 180);
                    const getStoriesRadius = (index) => {
                        const radiusMap = {
                            0: 150,  // Първи проект
                            1: 130,  // Втори проект  
                            2: 130,  // Трети проект (по-близо)
                            3: 160,  // Четвърти проект (най-далече)
                        };
                        return radiusMap[index] || 120 + index * 30;
                    };

                    const radius = getStoriesRadius(storyIndex);

                    const storyNode = {
                        id: nodeId++,
                        type: 'story',
                        title: story.title,
                        description: story.excerpt,
                        image: story.image,
                        slug: story.slug,
                        x: initiativeNode.x + Math.cos(angle) * radius,
                        y: initiativeNode.y + Math.sin(angle) * radius,
                        size: 'small',
                        color: '#6366f1',
                        parentId: initiativeNode.id,
                        comet: true,
                        isFake: story.isFake || false // Добавяме isFake флага
                    };
                    nodes.push(storyNode);

                    connections.push({
                        from: initiativeNode.id,
                        to: storyNode.id,
                        type: 'story-connection'
                    });
                });
            }
        });

        // Свързваме инициативите в "съзвездие"
        for (let i = 0; i < initiativeNodeIds.length - 1; i++) {
            connections.push({
                from: initiativeNodeIds[i],
                to: initiativeNodeIds[i + 1],
                type: 'initiative-connection'
            });
        }

        return { nodes, connections };
    };
    const getFilteredData = () => {
        if (activeFilter === 'all') return constellationData;

        const filteredNodes = constellationData.nodes?.filter(node =>
            activeFilter === 'initiatives' ? node.type === 'initiative' :
                activeFilter === 'projects' ? node.type === 'project' :
                    activeFilter === 'stories' ? node.type === 'story' : true
        ) || [];

        const filteredNodeIds = filteredNodes.map(n => n.id);

        const filteredConnections = constellationData.connections?.filter(conn =>
            filteredNodeIds.includes(conn.from) && filteredNodeIds.includes(conn.to)
        ) || [];

        return { nodes: filteredNodes, connections: filteredConnections };
    };
    const filteredData = getFilteredData();
    return (
        <section className="constellation-showcase" ref={sectionRef}>
            <div className="constellation-background">
                <div className="nebula-1"></div>
                <div className="nebula-2"></div>
                <div className="star-field"></div>
            </div>

            <div className="constellation-container">
                {/* Header */}
                <div className={`constellation-header ${isVisible ? 'visible' : ''}`}>
                    <h2 className="constellation-title">
                        {t('home.constellation.title')}
                    </h2>
                    <p className="constellation-subtitle">
                        {t('home.constellation.subtitle')}
                    </p>
                </div>

                {/* Controls */}
                <ConstellationControls
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter}
                    isVisible={isVisible}
                />

                {/* Main Constellation Map */}
                <div className={`constellation-map-container ${isVisible ? 'visible' : ''}`}>
                    <ConstellationMap
                        data={filteredData}
                        hoveredNode={hoveredNode}
                        setHoveredNode={setHoveredNode}
                        isVisible={isVisible}
                    />
                </div>

                {/* Legend */}
                <ConstellationLegend isVisible={isVisible} />

                {/* Footer */}
                <div className={`constellation-footer ${isVisible ? 'visible' : ''}`}>
                    <a href="/initiatives" className="explore-universe-btn">
                        <span>{t('home.constellation.exploreUniverse')}</span>
                        <svg className="btn-icon" viewBox="0 0 24 24" width="20" height="20">
                            <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="currentColor" />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
};