import { useTranslation } from 'react-i18next';
import './constellationNode.css';

export const ConstellationNode = ({ node, isHovered, onHover }) => {
    const { t } = useTranslation('home');

    const getNodeSize = () => {
        const width = window.innerWidth;
        // Плавен преход от 0.7 при 320px до 1.0 при 768px
        const minWidth = 320;
        const maxWidth = 768;
        const minMultiplier = 0.7;
        const maxMultiplier = 1.2

        let multiplier;
        if (width <= minWidth) {
            multiplier = minMultiplier;
        } else if (width >= maxWidth) {
            multiplier = maxMultiplier;
        } else {
            // Линейна интерполация
            multiplier = minMultiplier +
                (width - minWidth) * (maxMultiplier - minMultiplier) / (maxWidth - minWidth);
        }

        switch (node.size) {
            case 'large': return 50 * multiplier;
            case 'medium': return 38 * multiplier;
            case 'small': return 30 * multiplier;
            default: return 28 * multiplier;
        }
    };

    const getNodeLink = () => {
        switch (node.type) {
            case 'initiative': return `/initiatives/${node.slug}`;
            case 'project': return `/projects/${node.slug}`;
            case 'story': return `/stories/${node.slug}`;
            default: return '#';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#10b981';
            case 'planned': return '#f59e0b';
            case 'in-progress': return '#3b82f6';
            case 'completed': return '#6b7280';
            default: return '#6b7280';
        }
    };

    const nodeSize = getNodeSize();
    const tooltipOnRight = node.x < 800;  // Ако е в лявата част на екрана
    const tooltipX = tooltipOnRight
        ? node.x + nodeSize + 15
        : node.x - nodeSize - 195;  // 195 = ширина(180) + 15

    return (
         <g 
    id={`node-${node.id}`}
    className={`constellation-node ${node.type} ${isHovered ? 'hovered' : ''}`}
    onMouseEnter={() => onHover && onHover(node.id)}
    onMouseLeave={() => onHover && onHover(null)}
    onClick={() => !node.isFake && (window.location.href = getNodeLink())} // Проверява isFake
    style={{ cursor: node.isFake ? 'default' : 'pointer' }}  // Различен курсор за fake
  >
            {/* Comet tail за stories */}
            {node.comet && (
                <ellipse
                    cx={node.x - 30}
                    cy={node.y}
                    rx="25"
                    ry="3"
                    fill="url(#cometTail)"
                    className="comet-tail"
                />
            )}

            {/* Outer glow ring */}
            <circle
                cx={node.x}
                cy={node.y}
                r={nodeSize + 8}
                fill="none"
                stroke={node.color}
                strokeWidth="2"
                strokeOpacity="0.3"
                className={`glow-ring ${node.pulse ? 'pulse' : ''}`}

            />

            {/* Main node circle */}
            <circle
                cx={node.x}
                cy={node.y}
                r={nodeSize}
                fill={`url(#nodeGradient-${node.type})`}
                stroke={node.color}
                strokeWidth="2"
                filter={node.size === 'large' ? 'url(#glow-initiative)' : 'url(#glow-project)'}
                className="main-circle"
            />

            {/* Node image/icon */}
            {node.image ? (
                <image
                    x={node.x - nodeSize + 6}
                    y={node.y - nodeSize + 6}
                    width={nodeSize * 2 - 12}
                    height={nodeSize * 2 - 12}
                    href={node.image}
                    clipPath={`circle(${nodeSize - 6}px at 50% 50%)`}
                />
            ) : (
                <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={nodeSize / 2}
                    fill={node.color}
                    fontWeight="bold"
                >
                    {node.type === 'initiative' && '🎯'}
                    {node.type === 'project' && '🚀'}
                    {node.type === 'story' && '📖'}
                </text>
            )}

            {/* Status indicator за projects */}
            {node.type === 'project' && node.status && (
                <circle
                    cx={node.x + nodeSize - 5}
                    cy={node.y - nodeSize + 5}
                    r="6"
                    fill={getStatusColor(node.status)}
                    stroke="white"
                    strokeWidth="2"
                />
            )}

            {/* Hover tooltip ВЪТРЕ В SVG */}
            {isHovered && (
                <g className="node-tooltip">
                    <rect
                        x={tooltipX}
                        y={node.y - 35}
                        width="240"
                        height="60"
                        fill="white"
                        stroke={node.color}
                        strokeWidth="2"
                        rx="8"
                        filter="drop-shadow(0 4px 12px rgba(0,0,0,0.15))"
                    />
                    <text
                        x={tooltipX + 5}
                        y={node.y - 15}
                        fontSize="16"
                        fontWeight="bold"
                        fill="#1e293b"
                    >
                        {node.title.length > 20 ? `${node.title.substring(0, 20)}...` : node.title}
                    </text>
                    <text
                        x={tooltipX + 5}
                        y={node.y + 2}
                        fontSize="14"
                        fill="#64748b"
                    >
                        {t(`home.constellation.${node.type}`)}
                    </text>
                    <text
                        x={tooltipX + 5}
                        y={node.y + 20}
                        fontSize="12"
                        fill="#94a3b8"
                    >
                        {t('home.constellation.clickToExplore')}
                    </text>
                </g>
            )}
        </g>
    );
};