// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { userPhone } = useAuth();
  return userPhone ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
