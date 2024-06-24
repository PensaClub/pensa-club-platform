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
        }
    }
}