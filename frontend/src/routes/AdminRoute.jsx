import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function AdminRoute() {
  const { role, loading } = useAuth();

  if (loading) return null;

  if (!role) return <Navigate to="/access" replace />;

  if (role !== "ADMIN") return <Navigate to="/home" replace />;

  return <Outlet />;
}
