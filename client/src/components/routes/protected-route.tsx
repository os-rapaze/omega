import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    axios
      .get("http://localhost:3000/auth/validate", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => setIsAuthenticated(true))
      .catch(() => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      });
  }, []);

  if (isAuthenticated === null) return <div>Carregando...</div>;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}
