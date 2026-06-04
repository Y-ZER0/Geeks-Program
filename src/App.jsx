import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { AuthProvider, useAuth } from "./hooks/useAuth.jsx";
import GeeksLeaderboard from "./index";

const LoginPage = lazy(() => import("./components/admin/LoginPage"));
const DashboardPage = lazy(() => import("./components/admin/DashboardPage"));

function AdminGuard({ children }) {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(155deg,#6D2E2E 0%,#2C1818 45%,#160C0C 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ color: "#FAA41A", fontSize: 14 }}>Loading...</div>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function AdminFallback() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(155deg,#6D2E2E 0%,#2C1818 45%,#160C0C 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ color: "#FAA41A", fontSize: 14 }}>Loading...</div>
    </div>
  );
}

function PublicLeaderboard() {
  return <GeeksLeaderboard fetchUrl="/api/leaderboard?timeframe=live&category=All" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Helmet>
          <html lang="en" />
          <title>Geeks Program Leaderboard | IEEE Computer Society - University of Jordan</title>
          <meta name="description" content="Live leaderboard for the IEEE CS UJ Geeks Program. Track participants across AI, Cybersecurity, and Web Development categories with real-time scores and rankings." />
          <meta property="og:title" content="Geeks Program Leaderboard | IEEE CS UJ" />
          <meta property="og:description" content="Live leaderboard for the IEEE CS UJ Geeks Program — AI, Cybersecurity & Web Development." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://geeks-leaderboard.netlify.app" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Geeks Program Leaderboard | IEEE CS UJ" />
          <meta name="twitter:description" content="Live leaderboard for the IEEE CS UJ Geeks Program — AI, Cybersecurity & Web Development." />
          <link rel="canonical" href="https://geeks-leaderboard.netlify.app" />
        </Helmet>

        <Routes>
          <Route path="/" element={<PublicLeaderboard />} />
          <Route path="/admin/login" element={
            <Suspense fallback={<AdminFallback />}>
              <LoginPage />
            </Suspense>
          } />
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <Suspense fallback={<AdminFallback />}>
                  <DashboardPage />
                </Suspense>
              </AdminGuard>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminGuard>
                <Suspense fallback={<AdminFallback />}>
                  <DashboardPage />
                </Suspense>
              </AdminGuard>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
