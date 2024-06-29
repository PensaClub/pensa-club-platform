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
        }
    }
}