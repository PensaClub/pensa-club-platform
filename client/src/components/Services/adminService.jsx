import { requestFactory } from "./requester"

const apiUrl = process.env.REACT_APP_API_URL;

export const adminServiceFactory = (token) => {

    const requester = requestFactory(token);

    return {
      
        pendingAds: async() => {
            return requester.get(`${apiUrl}/ads/pending-ads`)
        },
        approvedAds: async() => {
            return requester.get(`${apiUrl}/ads/approved-ads`)
        },
        updateAdStatus: async (adId, newStatus, adminComment) => {
            return requester.post(`${apiUrl}/ads/ad-update-status`, { adId, newStatus, adminComment });
          },
          deleteAd: async (adId) => {
            return requester.post(`${apiUrl}/ads/ad-delete`, { adId });
        },
    }
}