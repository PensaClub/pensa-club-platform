import { useMemo } from 'react';
import './globalSnowfall.css';

/**
 * GlobalSnowfall - Глобални падащи снежинки за целия сайт
 * Уникален CSS prefix: global-snow-
 */
export const GlobalSnowfall = ({ count = 50 }) => {
    // Генерираме снежинките веднъж с useMemo
    const snowflakes = useMemo(() => {
        return [...Array(count)].map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 10,
            duration: 8 + Math.random() * 12,
            size: 10 + Math.random() * 20,
            opacity: 0.4 + Math.random() * 0.6
        }));
    }, [count]);

    return (
        <div className="global-snow-container" aria-hidden="true">
            {snowflakes.map((flake) => (
                <div
                    key={flake.id}
                    className="global-snow-flake"
                    style={{
                        left: `${flake.left}%`,
                        animationDelay: `${flake.delay}s`,
                        animationDuration: `${flake.duration}s`,
                        fontSize: `${flake.size}px`,
                        opacity: flake.opacity
                    }}
                >
                    ❄
                </div>
            ))}
        </div>
    );
};

export default GlobalSnowfall;