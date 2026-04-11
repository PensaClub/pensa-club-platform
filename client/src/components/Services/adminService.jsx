import { requestFactory } from "./requester"

const apiUrl = import.meta.env.VITE_API_URL;

export const adminServiceFactory = (token) => {

    const requester = requestFactory(token);

    return {

        pendingAds: async () => {
            return requester.get(`${apiUrl}/listings/pending-ads`)
        },
        approvedAds: async () => {
            return requester.get(`${apiUrl}/listings/approved-ads`)
        },
        rejectAds: async () => {
            return requester.get(`${apiUrl}/listings/denied-ads`)
        },
        updateAdStatus: async (adId, newStatus, adminComment) => {
            return requester.post(`${apiUrl}/listings/ad-update-status`, { adId, newStatus, adminComment });
        },
        deleteAd: async (adId) => {
            return requester.del(`${apiUrl}/listings/ad-delete/${adId}`);
        },
        deleteUserData: (email) => {
            return requester.del(`${apiUrl}/admin/delete-account/${email}`);
        },
        deleteMessage: (email,id) => {
            return requester.patch(`${apiUrl}/admin/delete-comment`,{email:email,adId:id});
        },
         getBotSummary: async () => {
            return requester.get(`${apiUrl}/admin/bot-summary`);
        },

        // ─── User Management (Admin User Management feature) ───
        lookupUserByEmail: (email) => {
            return requester.get(`${apiUrl}/admin/users/lookup?email=${encodeURIComponent(email)}`);
        },

        inviteUser: (data) => {
            return requester.post(`${apiUrl}/admin/users/invite`, data);
        },

        sendResetLink: (data) => {
            return requester.post(`${apiUrl}/admin/users/send-reset`, data);
        },

        // ─── Audit log ───
        getUserActionLogs: (params = {}) => {
            const queryString = new URLSearchParams(
                Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
            ).toString();
            return requester.get(`${apiUrl}/admin/user-actions${queryString ? `?${queryString}` : ''}`);
        },

        // PDF export — uses custom fetch (not requester) because the response is a binary
        // PDF blob, not JSON. The token is read from localStorage like the regular requester.
        exportUserActionLogs: async (params = {}) => {
            const queryString = new URLSearchParams(
                Object.entries({ ...params, format: 'pdf' }).filter(([, v]) => v !== undefined && v !== null && v !== '')
            ).toString();

            const url = `${apiUrl}/admin/user-actions/export?${queryString}`;
            const auth = JSON.parse(localStorage.getItem('auth') || '{}');

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                    Accept: 'application/pdf',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                let errMsg = `HTTP ${response.status} ${response.statusText}`;
                try {
                    const ct = response.headers.get('content-type') || '';
                    if (ct.includes('application/json')) {
                        const data = await response.json();
                        errMsg = data?.message || errMsg;
                    }
                } catch { /* ignore */ }
                throw new Error(errMsg);
            }

            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/pdf')) {
                throw new Error(`Unexpected response type: ${contentType || 'unknown'}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            return new Blob([arrayBuffer], { type: 'application/pdf' });
        },
    }
}