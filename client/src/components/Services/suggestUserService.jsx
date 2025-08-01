import { requestFactory } from './requester';

const apiUrl = import.meta.env.VITE_API_URL;

export const suggestUserServiceFactory = () => {
  const requester = requestFactory();

  return {
    getAllSuggested: () => {
      return requester.get(`${apiUrl}/suggest/unresolved`);
    },
    getAllResolve: () => {
      return requester.get(`${apiUrl}/suggest/resolved`);
    },
    suggestUser: (data) => {
      return requester.post(`${apiUrl}/suggest`, data);
    },
    suggestResolve: (id) => {
      return requester.post(`${apiUrl}/suggest/resolve`, {id: id});
    },
    suggestDelete: (id) => {
      return requester.post(`${apiUrl}/suggest/delete`, {id: id});  
    }, 
    createComment: async (comment,id) => {
      return requester.post(`${apiUrl}/suggest/comments`,{comment: comment,id: id});
  }

  };
}
