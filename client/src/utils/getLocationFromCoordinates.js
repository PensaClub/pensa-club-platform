
// utils/locationUtils.js
import i18next from 'i18next';

export const getLocationFromCoordinates = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=bg,en`
        );
        
        const data = await response.json();
        
        if (data && data.address) {
            const city = data.address.city || 
                        data.address.town || 
                        data.address.village || 
                        data.address.municipality ||
                        i18next.t('location.unknownCity');
            
            const country = data.address.country || i18next.t('location.defaultCountry');
            
            return `${city}, ${country}`;
        }
        
        return i18next.t('location.unknownLocation');
        
    } catch (error) {
        console.error('Location error:', error);
        return i18next.t('location.unknownLocation');
    }
};