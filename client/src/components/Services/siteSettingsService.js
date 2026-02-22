import { requestFactory } from './requester';

const apiUrl = import.meta.env.VITE_API_URL;

export const siteSettingsServiceFactory = () => {
    const requester = requestFactory();

    return {
        getAll: async () => {
            return requester.get(`${apiUrl}/admin/site-settings`);
        },
        update: async (settings) => {
            return requester.put(`${apiUrl}/admin/site-settings`, { settings });
        },
    };
};
