import { requestFactory } from './requester';

const apiUrl = process.env.REACT_APP_API_URL;

export const userServiceFactory = (token) => {
  const requester = requestFactory(token);

  return {
    getAll: () => {
      return requester.get(`${apiUrl}/user/all-users`);
    },

    login: (data) => {
      return requester.post(`${apiUrl}/auth/login`, data);
    },
    register: (data) => {
      return requester.post(`${apiUrl}/auth/register`, data);
    },
    logout: () => {
      return requester.post(`${apiUrl}/auth/logout`);
    },
    resetPassword: (data) => {
      return requester.post(`${apiUrl}/auth/reset-password`, data);
    },
    forgetPassword: (data) => {
      return requester.post(`${apiUrl}/auth/request-reset-password`, data);
    },
    setUserData: (data) => {
      return requester.post(`${apiUrl}/user/details`, data);
    },

    editUserData: (data) => {
      return requester.patch(`${apiUrl}/user/update-details`, data);
    },
    changeRole: (email,role,roleChangeComment) => {
      return requester.post(`${apiUrl}/admin/change-role`, {email,role,roleChangeComment});
    },
    getUserData: () => {
      return requester.get(`${apiUrl}/user/single-user`);
    },
    suggestUser: (data) => {
      return requester.post(`${apiUrl}/user/suggest`, data);
    },

  };
};
