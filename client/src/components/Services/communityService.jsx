import { requestFactory } from "./requester"

const apiUrl = process.env.REACT_APP_API_URL;

export const communityServiceFactory = (token) => {

    const requester = requestFactory(token);

    return {
        getRegions: async () => {
            const response = await fetch('/regions.json');
            if (!response.ok) {
                throw new Error('Failed to fetch regions');
            }
            return response.json();
        },

        getSubregions: async (regionId) => {
            const response = await fetch(`/regions-data/region-${regionId}/subregions-${regionId}.json`)
            if (!response.ok) {
                throw new Error('Failed to fetch subregions for region ');
            }
            return response.json();
        },
        getTowns: async (regionId, subregionId) => {
            const response = await fetch(`/regions-data/region-${regionId}/towns/towns-${subregionId}.json`);
            if (!response.ok) {
                throw new Error('Failed to fetch towns');
            }
            return response.json();
        },
        getSearchCriteria: async () => {
            const response = await fetch('/search-criteria.json');

            if (!response.ok) {
                throw new Error('Failed to fetch search criteria');
            }
            return response.json();
        }, 
        createAd: async (adData) => {
            return requester.post(`${apiUrl}/ads/ad-create`,adData);

        },
        getMyAds: async (email) => {

            return requester.get(`${apiUrl}/ads/ads-user`, { email });
        },
        deleteAd: async (adId) => {
            return requester.del(`${apiUrl}/ads/ad-delete/${adId}`);
        },
        editAd: async (adData) => {
            return requester.patch(`${apiUrl}/ads/ad-edit`, adData);
        },
        searchAds: async (filters) => {
            const query = new URLSearchParams(filters).toString();
            return requester.get(`${apiUrl}/ads/ads-search?${query}`);
        },
        updateExpirationDate: async(adId) => {
            return requester.patch(`${apiUrl}/ads/update-expiration-date/${adId}`, { adId })
        },
        getAdById: async(adId) => {
            return requester.get(`${apiUrl}/ads/adById/${adId}`)
        }
    }
}