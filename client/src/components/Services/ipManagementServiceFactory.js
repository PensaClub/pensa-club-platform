import { requestFactory } from './requester';

const apiUrl = import.meta.env.VITE_API_URL;

export const ipManagementServiceFactory = (token) => {
    const requester = requestFactory(token);

    return {
        // Visits
        getVisits: async (params = {}) => {
            const queryString = new URLSearchParams(params).toString();
            return requester.get(`${apiUrl}/admin/ip-management/visits?${queryString}`);
        },

        // Blocked
        getBlocked: async () => {
            return requester.get(`${apiUrl}/admin/ip-management/blocked`);
        },

        blockIp: async (ipAddress, reason, password) => {
            return requester.post(`${apiUrl}/admin/ip-management/block`, { ipAddress, reason, password });
        },

        unblockIp: async (id, password) => {
            return requester.del(`${apiUrl}/admin/ip-management/unblock/${id}`, password ? { password } : undefined);
        },

        // Whitelist
        getWhitelist: async () => {
            return requester.get(`${apiUrl}/admin/ip-management/whitelist`);
        },

        addToWhitelist: async (ipAddress, label) => {
            return requester.post(`${apiUrl}/admin/ip-management/whitelist`, { ipAddress, label });
        },

        removeFromWhitelist: async (id, password) => {
            return requester.del(`${apiUrl}/admin/ip-management/whitelist/${id}`, password ? { password } : undefined);
        },

        blockFromWhitelist: async (id, reason, password) => {
            return requester.post(`${apiUrl}/admin/ip-management/whitelist/${id}/block`, { reason, password });
        },
    };
};

export default ipManagementServiceFactory;
