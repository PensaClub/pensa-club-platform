import { requestFactory } from "./requester"
// const baseUrl = `http://localhost:3005/users`
// const api =`http://localhost:8080`;

// console.log("app",api)

const apiUrl = process.env.REACT_APP_API_URL;

export const userServiceFactory = (token) => {

  const requester = requestFactory(token)
  
  return {
 


    getAll: () => {
      return requester.get(`${apiUrl}/users`)
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

    setUserData: (data, userId) => {
      //TODO: replace endpoint
      return requester.put(`${apiUrl}/users/${userId}`, data)
    },

    getUserData: (userId) => {
      //TODO: replace endpoint
      return requester.get(`${apiUrl}/users/${userId}`)
    },
  }



}

