import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLocalizedNavigate } from '../../../../hooks/useLocalizedNavigate';
import { useTranslation } from 'react-i18next';
import { InitiativePreview } from '../InitiativePreview/InitiativePreview';
import { notify } from '../../../../utils/notify.jsx';
import '../InitiativePreview/initiativePreview.css'; // Използваме същия CSS
import '../../InitiativeView/initiativeView.css'; // Нови стилове за preview
export const InitiativePreviewPage = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useLocalizedNavigate();
    const [previewData, setPreviewData] = useState(null);

    useEffect(() => {
        // Получаваме данните от state при navigation
        if (location.state?.previewData) {
            setPreviewData(location.state.previewData);
        } else {
            // Ако няма данни, пренасочваме към create формата
            notify('warning', 'Няма данни за preview. Пренасочване към формата...');
            navigate('/profile/initiative-create');
        }
    }, [location.state, navigate]);

    const handleBackToEdit = () => {
        // Връщаме към формата с данните
        navigate('/profile/initiative-create', {
            state: { formData: previewData }
        });
    };

    if (!previewData) {
        return (
            <div className="loading-state">
                <h2>Зареждане на preview...</h2>
                <p>Ако страницата не се зареди, <button onClick={() => navigate('/profile/initiative-create')}>върнете се към формата</button></p>
            </div>
        );
    }

    return (
        <InitiativePreview 
            values={previewData} 
            onBackToEdit={handleBackToEdit}
        />
    );
};