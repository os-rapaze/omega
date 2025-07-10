// src/components/routes/protected-route.tsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/contexts/authContext";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, setUser } = useAuth();
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
      .then((response) => {
        const { id, name, email } = response.data.user;
        setUser({ id, name, email });

        setIsAuthenticated(true);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      });
  }, [setUser]);

  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
    }
  }, [user]);

  if (isAuthenticated === null) return <div>Carregando...</div>;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}

