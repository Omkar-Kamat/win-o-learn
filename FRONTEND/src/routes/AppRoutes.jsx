import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import ProtectedRoute from "../components/common/ProtectedRoute";

function Home() {
  return <h1>Home</h1>;
}

function Login() {
  return <h1>Login</h1>;
}

function Dashboard() {
  return <h1>Dashboard</h1>;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}