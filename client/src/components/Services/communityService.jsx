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

            return requester.get(`${apiUrl}/ads/user-ads`, { email });
        },
        deleteAd: async (id) => {
            return requester.post(`${apiUrl}/ads/ad-delete`, { id });
        },
        editAd: async (id) => {
            return requester.patch(`${apiUrl}/ads/ad-edit`, { id });
        }
    }
}