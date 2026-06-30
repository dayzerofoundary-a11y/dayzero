// Trigger Vercel rebuild to apply env variables
import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./app/App.tsx";
import "./styles/index.css";

// Lazy-load AdminDashboard so Firebase/Firestore is NEVER bundled into the main chunk
const AdminDashboard = lazy(() =>
  import("./app/AdminDashboard.tsx").then((m) => ({ default: m.AdminDashboard }))
);

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route
        path="/admin"
        element={
          <Suspense fallback={
            <div style={{ minHeight: "100vh", background: "#131929", display: "flex", alignItems: "center", justifyContent: "center", color: "#F4EFE4", fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", letterSpacing: "0.1em" }}>
              Loading...
            </div>
          }>
            <AdminDashboard />
          </Suspense>
        }
      />
    </Routes>
  </BrowserRouter>
);