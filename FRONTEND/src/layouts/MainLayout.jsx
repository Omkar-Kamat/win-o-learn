import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Navbar />
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-6 md:p-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
