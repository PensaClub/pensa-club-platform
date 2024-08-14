import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { getAuthStatus } from "../../utils/handle401Error";

export const PublicGuard = () => {
    const {isAuthentication} = useContext(UserContext);
    
  const isAuthenticated = getAuthStatus();
    if (isAuthentication && isAuthenticated) {
       
        return <Navigate to="/profile" />
    }
  return (
    <Outlet />
  )
};
