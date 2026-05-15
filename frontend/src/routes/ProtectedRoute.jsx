import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext";
import LoadingScreen from "../components/LoadingScreen";

/**
 * A unified Protected Route component that handles authentication and authorization.
 * @param {Object} props
 * @param {string[]} props.allowedRoles - Array of roles permitted to access the route.
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { role, loading } = useAuth();

  if (loading) {
    return <LoadingScreen/>; 
  }

  if (!role) {
    return <Navigate to="/access" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    const fallbackPath = role === "ADMIN" ? "/admin" : "/";
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
