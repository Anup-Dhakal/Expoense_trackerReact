import { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { observeAuth } from "./lib/auth.js";

const AcceptInvite = lazy(() => import("./pages/AcceptInvite.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const GroupSettings = lazy(() => import("./pages/GroupSettings.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));

function ProtectedRoute({ user, children }) {
  if (user === undefined) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.emailVerified) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = observeAuth(setUser);
    return () => unsub();
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/app"
            element={
              <ProtectedRoute user={user}>
                <Dashboard user={user} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/app/groups/:groupId"
            element={
              <ProtectedRoute user={user}>
                <GroupSettings user={user} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/app/invites/:inviteId"
            element={
              <ProtectedRoute user={user}>
                <AcceptInvite user={user} />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
