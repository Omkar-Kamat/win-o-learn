import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export default function MainLayout() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}