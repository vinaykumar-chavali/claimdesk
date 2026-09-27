import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "./components/layout/Navbar";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import MyClaims from "./pages/claimant/MyClaims";
import NewClaim from "./pages/claimant/NewClaim";
import ClaimDetail from "./pages/claimant/ClaimDetail";
import Dashboard from "./pages/officer/Dashboard";
import ClaimList from "./pages/officer/ClaimList";
import ClaimReview from "./pages/officer/ClaimReview";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          {/* Claimant Routes */}
          <Route element={<ProtectedRoute allowedRoles={['claimant']} />}>
            <Route path="claims" element={<MyClaims />} />
            <Route path="claims/new" element={<NewClaim />} />
            <Route path="claims/:id" element={<ClaimDetail />} />
          </Route>

          {/* Officer/Supervisor Routes */}
          <Route element={<ProtectedRoute allowedRoles={['officer', 'supervisor']} />}>
            <Route path="officer" element={<Dashboard />} />
            <Route path="officer/claims" element={<ClaimList />} />
            <Route path="officer/claims/:id" element={<ClaimReview />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
