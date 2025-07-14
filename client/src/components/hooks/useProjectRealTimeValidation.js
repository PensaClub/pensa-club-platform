import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { validateProjectForm } from '../Initiatives/CreateProject/utils/validateProjectForm';

export const useProjectRealTimeValidation = (values, setErrors) => {
    const { t } = useTranslation();

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const newErrors = validateProjectForm(values, t);
            
            // Обновяваме errors само ако има промяна
            setErrors(prev => {
                const hasChanges = JSON.stringify(prev) !== JSON.stringify(newErrors);
                return hasChanges ? newErrors : prev;
            });
        }, 300); // 300ms debounce за performance

        return () => clearTimeout(timeoutId);
    }, [values, t, setErrors]);
};