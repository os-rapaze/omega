import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DashboardPage from "@/pages/dashboard";
import PricingPage from "@/pages/pricing";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";
import LoginPage from "@/pages/login";
import SignUpPage from "@/pages/signup";
import { ProtectedRoute } from "@/components/routes/protected-route"; // ajuste o caminho conforme necessário

function App() {
  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      
      {/* Protegidas */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pricing"
        element={
          <ProtectedRoute>
            <PricingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/blog"
        element={
          <ProtectedRoute>
            <BlogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/about"
        element={
          <ProtectedRoute>
            <AboutPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;

