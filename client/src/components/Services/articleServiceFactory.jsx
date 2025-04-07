import { requestFactory } from "./requester";

const apiUrl = process.env.REACT_APP_API_URL;

export const articleServiceFactory = (token) => {
  const requester = requestFactory(token);

  return {
    createArticle: async (articleData) => {
      return requester.post(`${apiUrl}/articles/create`, articleData);
    },
    
    getArticleById: async (id) => {
      return requester.get(`${apiUrl}/articles/${id}`);
    },
    
    getUserArticles: async (email) => {
      return requester.get(`${apiUrl}/articles/user-articles/${email}`);
    },
    
    getAllArticles: async (page = 1, limit = 10) => {
      return requester.get(`${apiUrl}/articles/all?page=${page}&limit=${limit}`);
    },
    
    updateArticle: async (articleData) => {
      return requester.patch(`${apiUrl}/articles/update`, articleData);
    },
    
    deleteArticle: async (id) => {
      return requester.del(`${apiUrl}/articles/delete/${id}`);
    }
  };
};