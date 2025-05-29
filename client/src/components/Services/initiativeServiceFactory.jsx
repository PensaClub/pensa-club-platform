import { requestFactory } from "./requester";

const apiUrl = process.env.REACT_APP_API_URL;

export const initiativeServiceFactory = (token) => {
  const requester = requestFactory(token);

  return {
    createInitiative: async (initiativeData) => {
      return requester.post(`${apiUrl}/initiatives/create`, initiativeData);
    },
    
    getInitiativeById: async (id) => {
      return requester.get(`${apiUrl}/initiatives/single/${id}`);
    },
    
    getUserInitiatives: async (email) => {
      return requester.get(`${apiUrl}/initiatives/user-initiatives/${email}`);
    },
    
    getAllInitiatives: async (page = 1, limit = 6) => {
      return requester.get(`${apiUrl}/initiatives/all?page=${page}&limit=${limit}`);
    },
    
    updateInitiative: async (id, initiativeData) => {
      return requester.put(`${apiUrl}/initiatives/${id}`, initiativeData);
    },
    
    deleteInitiative: async (id) => {
      return requester.del(`${apiUrl}/initiatives/${id}`);
    }
  };
};