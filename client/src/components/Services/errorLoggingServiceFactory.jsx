import { requestFactory } from './requester';

const apiUrl = import.meta.env.VITE_API_URL;

export const errorLoggingServiceFactory = () => {
    const requester = requestFactory();

    return {
        logError: async (data) => {
            try {
                return await requester.post(`${apiUrl}/error-logging/log`, data);
            } catch {
                // Silent fail - don't let error logging cause more errors
                return { success: false };
            }
        },
        getErrorLogs: async (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return requester.get(`${apiUrl}/error-logging/admin/logs?${query}`);
        },
        deleteErrorLog: async (id) => {
            return requester.del(`${apiUrl}/error-logging/admin/logs/${id}`);
        },
        clearAllErrorLogs: async () => {
            return requester.del(`${apiUrl}/error-logging/admin/logs`);
        },
        exportErrorLogs: async () => {
            return requester.get(`${apiUrl}/error-logging/admin/logs/export`);
        },
    };
};
