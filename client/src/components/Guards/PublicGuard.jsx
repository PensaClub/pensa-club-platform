import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

export const PublicGuard = () => {
    const {isAuthentication} = useContext(UserContext);
    if (isAuthentication) {
       
        return <Navigate to="/profile" />
    }
  return (
    <Outlet />
  )
};
