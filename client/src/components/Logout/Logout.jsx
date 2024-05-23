import { useEffect } from "react"
import { Navigate } from "react-router-dom"
import { useAuthContext } from "../contexts/UserContext"

export const Logout = ()=>{
    const {onLogout, token} = useAuthContext()
    useEffect(( )=>{
        onLogout(token)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[onLogout])


    return <Navigate to="/"/>
}