import { requestFactory } from "./requester"

const apiUrl = process.env.REACT_APP_API_URL;

export const mapServiceFactory = (token) => {

    const requester = requestFactory(token)

    return {
        allUsers: () => {
            return requester.get(`${apiUrl}/user/all-users`)
        }
    }
}