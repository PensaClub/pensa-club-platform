import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

export const FinishedProfileGuard = () => {
    const {isFinish} = useContext(UserContext);
    if (isFinish) {
        
        return <Navigate to="/profile" />
    }
  return (
    <Outlet />
  )
};
