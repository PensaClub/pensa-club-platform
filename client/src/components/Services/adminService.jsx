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
        }
      
    }
}