import { useEffect, useRef, useState } from 'react';
import { ConstellationNode } from '../ConstellationNode/ConstellationNode';
import { ConnectionLines } from '../ConnectionLines/ConnectionLines';
import './constellationMap.css';

export const ConstellationMap = ({ data, hoveredNode, setHoveredNode, isVisible }) => {
    const svgRef = useRef(null);
    const [viewBox, setViewBox] = useState("0 0 1200 600");

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768 && data.nodes?.length > 0) {
                // Намери центъра на всички nodes
                const avgX = data.nodes.reduce((sum, node) => sum + node.x, 0) / data.nodes.length;
                const avgY = data.nodes.reduce((sum, node) => sum + node.y, 0) / data.nodes.length;

                // ViewBox центриран около средната точка
                const width = 390;
                const height = 400;
                const yOffset = 50;
                setViewBox(`${avgX - width / 2} ${avgY - height / 2 + yOffset} ${width} ${height}`);
            } else {
                setViewBox("-100 -50 1200 600");
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [data.nodes]);

    useEffect(() => {
        if (!isVisible || !data.nodes) return;

        const timer = setTimeout(() => {
            data.nodes.forEach((node, index) => {
                setTimeout(() => {
                    const nodeElement = document.getElementById(`node-${node.id}`);
                    if (nodeElement) {
                        nodeElement.classList.add('animate-in');
                    }
                }, index * 200);
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [isVisible, data.nodes]);

    if (!data.nodes || data.nodes.length === 0) return null;

    return (
        <div className="constellation-map">
            <svg
                ref={svgRef}
                className="constellation-svg"
                viewBox={viewBox}
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="1" />
                    </pattern>

                    <filter id="glow-initiative">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <filter id="glow-project">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <radialGradient id="nodeGradient-initiative">
                        <stop offset="0%" stopColor="#1B8B8A" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#1B8B8A" stopOpacity="0.1" />
                    </radialGradient>

                    <radialGradient id="nodeGradient-project">
                        <stop offset="0%" stopColor="#E26020" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#E26020" stopOpacity="0.1" />
                    </radialGradient>

                    <radialGradient id="nodeGradient-story">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
                    </radialGradient>
                    <linearGradient id="cometTail" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.6" />
                    </linearGradient>
                </defs>
                <g className="decorative-stars">
                    {/* Генерирай фалшиви nodes */}
                    {[...Array(24)].map((_, i) => {
                        // По-органични позиции
                        const positions = [
                         { x: 0, y: 450 }, { x: 980, y: 120 }, { x: 1100, y: 380 },
    { x: 200, y: 80 }, { x: 750, y: 480 }, { x: 50, y: 60 },
    { x: 880, y: 520 }, { x: 0, y: 300 }, { x: 1150, y: 250 },
    { x: 320, y: 500 }, { x: 600, y: 550 }, { x: 950, y: 400 },
    // Нови 12 позиции
    { x: 20, y: 180 }, { x: 680, y: 320 }, { x: 1050, y: 500 },
    { x: 380, y: 150 }, { x: 820, y: 80 }, { x: 550, y: 420 },
    { x: 150, y: 380 }, { x: 920, y: 280 }, { x: 180, y: 250 },
    { x: 700, y: 180 }, { x: 480, y: 320 }, { x: 1180, y: 450 }
                        ];

                        const pos = positions[i % positions.length];
                        const types = ['initiative', 'project', 'story', 'story']; // Повече stories за комети
                        const type = types[i % types.length];
                        const isComet = type === 'story';
                        const colors = {
                            'initiative': '#1B8B8A',
                            'project': '#E26020',
                            'story': '#6366f1'
                        };
                        const nodeSize = type === 'initiative' ? 25 : type === 'project' ? 18 : 12;

                        return (
                            <g key={`fake-node-${i}`} opacity="0.35">
                                {/* Comet tail за stories */}
                                {isComet && (
                                    <ellipse
                                        cx={pos.x - 20}
                                        cy={pos.y}
                                        rx="30"
                                        ry="2"
                                        fill="url(#cometTail)"
                                        className="comet-tail"
                                        transform={`rotate(${i * 45} ${pos.x} ${pos.y})`}
                                    />
                                )}

                                {/* Само glow за някои */}
                                {i % 3 === 0 && (
                                    <circle
                                        cx={pos.x}
                                        cy={pos.y}
                                        r={nodeSize + 6}
                                        fill="none"
                                        stroke={colors[type]}
                                        strokeWidth="1"
                                        strokeOpacity="0.2"
                                        className="glow-ring pulse"
                                    />
                                )}

                                {/* Main circle */}
                                <circle
                                    cx={pos.x}
                                    cy={pos.y}
                                    r={nodeSize}
                                    fill="transparent"
                                    stroke={colors[type]}
                                    strokeWidth="2"
                                    strokeOpacity="0.4"
                                />
                            </g>
                        );
                    })}
                     {/* прелитащи комети */}
    {[...Array(5)].map((_, i) => {
    // Различни траектории за разнообразие
    const paths = [
        { startX: -100, startY: 100, endX: 1300, endY: 300 },
        { startX: 1300, startY: 50, endX: -100, endY: 250 },
        { startX: -100, startY: 400, endX: 1300, endY: 150 },
        { startX: 600, startY: -50, endX: 300, endY: 650 },
        { startX: 1300, startY: 500, endX: -80, endY: 50 },
        { startX: -100, startY: 200, endX: 1300, endY: 450 }
    ];
    
    const path = paths[i % paths.length];
    
    // Настройки за всяка комета - 4 къси и последната дълга
    const cometConfig = i < 4 
        ? { tailLength: 40 + (i * 10), speed: 8 + (i * 2), size: 2 }  // Къси опашки
        : { tailLength: 150, speed: 18, size: 4 };  // Дълга опашка за последната
    
    return (
        <g key={`flying-comet-${i}`} opacity="0.5">
            {/* Опашка на кометата */}
            <defs>
                <linearGradient id={`flying-gradient-${i}`}>
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0"/>
                    <stop offset="50%" stopColor="#818cf8" stopOpacity="0.5"/>
                    <stop offset="80%" stopColor="#fbbf24" stopOpacity="0.7"/>
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.9"/>
                </linearGradient>
            </defs>
            
            <ellipse 
                rx={cometConfig.tailLength}  // 👈 Дължина: 40,50,60,70 за първите 4, 150 за последната
                ry={cometConfig.size} 
                fill={`url(#flying-gradient-${i})`}
            >
                <animateTransform
                    attributeName="transform"
                    type="translate"
                    from={`${path.startX} ${path.startY}`}
                    to={`${path.endX} ${path.endY}`}
                    dur={`${cometConfig.speed}s`}  // 👈 Скорост: 8s,10s,12s,14s,18s
                    repeatCount="indefinite"
                />
                <animate
                    attributeName="opacity"
                    values="0;0.6;0.6;0" 
                    dur={`${cometConfig.speed}s`}
                    repeatCount="indefinite"
                />
            </ellipse>
            
            {/* Главата на кометата */}
            <circle r={cometConfig.size + 1} fill="#fef3c7"> 
                <animateTransform
                    attributeName="transform"
                    type="translate"
                    from={`${path.startX} ${path.startY}`}
                    to={`${path.endX} ${path.endY}`}
                    dur={`${cometConfig.speed}s`}
                    repeatCount="indefinite"
                />
                <animate
                    attributeName="opacity"
                    values="0;1;1;0" 
                    dur={`${cometConfig.speed}s`}
                    repeatCount="indefinite"
                />
            </circle>
        </g>
    );
})}
                </g>
                {/* Background grid */}
                <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3" />

                {/* Connection Lines */}
                <ConnectionLines
                    connections={data.connections || []}
                    nodes={data.nodes || []}
                    hoveredNode={hoveredNode}
                />

                {/* Nodes - ВИНАГИ РЕНДЕРИРАМЕ ВСИЧКИ */}
                {data.nodes.map((node) => (
                    <ConstellationNode
                        key={`node-${node.id}`}
                        node={node}
                        isHovered={hoveredNode === node.id}
                        onHover={setHoveredNode}
                    />
                ))}

                {/* Shooting stars */}
                {isVisible && (
                    <g className="shooting-stars">
                        <circle className="shooting-star-1" r="2" fill="#fbbf24">
                            <animateMotion dur="3s" repeatCount="indefinite">
                                <path d="M-10,50 Q200,100 500,150" />
                            </animateMotion>
                        </circle>
                    </g>
                )}
            </svg>
        </div>
    );
};