import './connectionLines.css';

export const ConnectionLines = ({ connections, nodes, hoveredNode }) => {
    if (!connections || !nodes) return null;

    const getNodeById = (id) => nodes.find(node => node.id === id);

    return (
        <g className="connection-lines">
            {connections.map((connection, index) => {
                const fromNode = getNodeById(connection.from);
                const toNode = getNodeById(connection.to);

                if (!fromNode || !toNode) return null;

                const isHighlighted = hoveredNode === fromNode.id || hoveredNode === toNode.id;

                return (
                    <g key={index} className={`connection ${connection.type} ${isHighlighted ? 'highlighted' : ''}`}>
                        {/* Animated flow particles */}
                        <defs>
                            <linearGradient id={`flow-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={fromNode.color} stopOpacity="0" />
                                <stop offset="50%" stopColor={fromNode.color} stopOpacity="0.8" />
                                <stop offset="100%" stopColor={toNode.color} stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Main connection line */}
                        <line
                            x1={fromNode.x}
                            y1={fromNode.y}
                            x2={toNode.x}
                            y2={toNode.y}
                            stroke={isHighlighted ? fromNode.color : 'rgba(148, 163, 184, 0.9)'}
                            strokeWidth={isHighlighted ? "2" : "1"}
                            strokeDasharray={
                                connection.type === 'story-connection' ||
                                    connection.type === 'initiative-connection'
                                    ? "10,10"
                                    : "none"

                            }
                            className="connection-line"
                        />

                        {/* Animated flow */}
                        {isHighlighted && (
                            <line
                                x1={fromNode.x}
                                y1={fromNode.y}
                                x2={toNode.x}
                                y2={toNode.y}
                                stroke={`url(#flow-${index})`}
                                strokeWidth="3"
                                className="connection-flow"
                            />
                        )}

                        {/* Flow particles */}
                        {isHighlighted && (
                            <circle r="3" fill={fromNode.color} opacity="0.8">
                                <animateMotion dur="2s" repeatCount="indefinite">
                                    <path d={`M${fromNode.x},${fromNode.y} L${toNode.x},${toNode.y}`} />
                                </animateMotion>
                                <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
                            </circle>
                        )}
                    </g>
                );
            })}
        </g>
    );
};