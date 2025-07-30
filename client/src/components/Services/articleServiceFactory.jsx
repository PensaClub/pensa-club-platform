import { requestFactory } from "./requester";

const apiUrl = import.meta.env.VITE_API_URL;

export const articleServiceFactory = (token) => {
  const requester = requestFactory(token);

  return {
    createArticle: async (articleData) => {
      return requester.post(`${apiUrl}/articles/create`, articleData);
    },
    
    getArticleById: async (id) => {
      return requester.get(`${apiUrl}/articles/single/${id}`);
    },
    
    getUserArticles: async (email) => {
      return requester.get(`${apiUrl}/articles/user-articles/${email}`);
    },
    
    getAllArticles: async () => {
      return requester.get(`${apiUrl}/articles/all`);
    },
    
    updateArticle: async (id,articleData) => {
      return requester.put(`${apiUrl}/articles/${id}`, articleData);
    },
    
    deleteArticle: async (id) => {
      return requester.del(`${apiUrl}/articles/${id}`);
    }
  };
};