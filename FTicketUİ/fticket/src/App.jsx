import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import AdminCreateEvent from "./pages/AdminCreateEvent";

export default function App() {
  const [userRole, setUserRole] = useState(null); // "admin" | "user" | null

  // Login sonrası yönləndirmə
  const handleLogin = (role) => {
    setUserRole(role);
  };

  if (!userRole) {
    // hələ daxil olmayıbsa Login səhifəsi açılır
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Routes>
      {userRole === "admin" ? (
        <>
          <Route path="/admin/create" element={<AdminCreateEvent />} />
          <Route path="*" element={<Navigate to="/admin/create" replace />} />
        </>
      ) : (
        <>
          <Route path="/events" element={<Home />} />
          <Route path="*" element={<Navigate to="/events" replace />} />
        </>
      )}
    </Routes>
  );
}
