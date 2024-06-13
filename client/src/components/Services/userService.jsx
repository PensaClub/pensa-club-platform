import { requestFactory } from "./requester"
// const baseUrl = `http://localhost:3005/users`
// const api =`http://localhost:8080`;

// console.log("app",api)

const apiUrl = process.env.REACT_APP_API_URL;

export const userServiceFactory = (token) => {

  const requester = requestFactory(token)
  
  return {
 


    getAll: () => {
      return requester.get(`${apiUrl}/user/all-users`)
    },
    
    login: (data) => {

      return requester.post(`${apiUrl}/auth/login`, data)
    },
    register: (data) => {
    
   
      return requester.post(`${apiUrl}/auth/register`, data)

    },
    logout: () => {
  
      return requester.post(`${apiUrl}/auth/logout`)

    },

    setUserData: (data) => {
      return requester.post(`${apiUrl}/user/details`, data);
    },

    editUserData: (data) => {
      return requester.patch(`${apiUrl}/user/update-details`, data)
    },

    getUserData: () => {
      return requester.get(`${apiUrl}/user/single-user`)
    },
  }



}

