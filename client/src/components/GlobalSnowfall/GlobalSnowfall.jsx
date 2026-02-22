import { useMemo } from 'react';
import { useSiteSettingsAdminContext } from '../contexts/SiteSettingsAdminContext';
import './globalSnowfall.css';

/**
 * GlobalSnowfall - Глобални падащи снежинки за целия сайт
 * Уникален CSS prefix: global-snow-
 */
export const GlobalSnowfall = () => {
    const { settings } = useSiteSettingsAdminContext();

    const count = settings.snowfall_count ?? 50;
    const minSize = settings.snowfall_min_size ?? 10;
    const maxSize = settings.snowfall_max_size ?? 30;
    const minDuration = settings.snowfall_min_duration ?? 8;
    const maxDuration = settings.snowfall_max_duration ?? 20;
    const opacity = settings.snowfall_opacity ?? 0.8;
    const color = settings.snowfall_color ?? '#ffffff';

    // Генерираме снежинките веднъж с useMemo
    const snowflakes = useMemo(() => {
        return [...Array(count)].map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 10,
            duration: minDuration + Math.random() * (maxDuration - minDuration),
            size: minSize + Math.random() * (maxSize - minSize),
            opacity: (opacity * 0.5) + Math.random() * (opacity * 0.5),
        }));
    }, [count, minSize, maxSize, minDuration, maxDuration, opacity]);

    if (!settings.snowfall_enabled) return null;

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
                        '--flake-opacity': flake.opacity,
                        color: color,
                        textShadow: `0 0 5px ${color}80, 0 0 10px ${color}50`,
                    }}
                >
                    ❄
                </div>
            ))}
        </div>
    );
};

export default GlobalSnowfall;
