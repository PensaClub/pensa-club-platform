import { requestFactory } from "./requester"

const apiUrl = import.meta.env.VITE_API_URL;

export const mapServiceFactory = (token) => {

    const requester = requestFactory(token)

    return {
        allUsers: () => {
            return requester.get(`${apiUrl}/user/all-users`)
        }
    }
}