import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function StudentRoute() {
  const { role, loading } = useAuth();

  if (loading) return null; // or loading screen not sure

  if (!role) return <Navigate to="/access" replace />;

  if (role !== "STUDENT") return <Navigate to="/admin" replace />;

  return <Outlet />;
}
