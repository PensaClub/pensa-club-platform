import { requestFactory } from './requester';

const apiUrl = process.env.REACT_APP_API_URL;

export const suggestUserServiceFactory = () => {
  const requester = requestFactory();

  return {
    getAllSuggested: () => {
      return requester.get(`${apiUrl}/suggest`);
    },

    suggestUser: (data) => {
      return requester.post(`${apiUrl}/suggest`, data);
    }
  };
};
