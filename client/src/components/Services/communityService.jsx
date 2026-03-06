import { requestFactory } from "./requester";

const apiUrl = import.meta.env.VITE_API_URL;

export const communityServiceFactory = (token) => {
  const requester = requestFactory(token);

  return {
    getRegions: async () => {
      const response = await fetch("/regions.json");
      if (!response.ok) {
        throw new Error("Failed to fetch regions");
      }
      return response.json();
    },

    getSubregions: async (regionId) => {
      const response = await fetch(
        `/regions-data/region-${regionId}/subregions-${regionId}.json`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch subregions for region ");
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
      return requester.post(`${apiUrl}/listings/ad-create`, adData);

    },
    getMyAds: async (email) => {

      return requester.get(`${apiUrl}/listings/ads-user/${ email }`);
    },
     deleteAd: async (id) => {
      return requester.del(`${apiUrl}/listings/ad-delete/${ id }`);
    },
    editAd: async (adData) => {
      return requester.patch(`${apiUrl}/listings/ad-edit`, adData);
    },
    searchAds: async (filters, page, limit = 25, order = "desc") => {
      const query = new URLSearchParams({ ...filters, page, limit, order }).toString();
      return requester.get(`${apiUrl}/listings/ads-search?${query}`);
    },
    getAdById: async (id) => {
      return requester.get(`${apiUrl}/listings/adById/${id}`);
    },
    updateExpirationDate: async (adId) => {
      return requester.patch(`${apiUrl}/listings/update-expiration-date/${adId}`, { adId })
    },
    getLatestAds: async (count) => {
      return requester.get(
        `${apiUrl}/listings/ads-search?status=approved&order=DESC&limit=${count}`
      );
    },
    subscribeNewUser: async (username,email) => {
      return requester.post(
        `${apiUrl}/subscribe/addSubscriber`, {username, email}
      );
    },
    getSubscribeEmails: async () => {
      return requester.get(
        `${apiUrl}/subscribe/getSubscribers`
      );
    },
  }
}

