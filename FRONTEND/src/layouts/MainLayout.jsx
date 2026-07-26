import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { AnimatePresence, motion } from 'framer-motion';

export default function MainLayout() {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-bg overflow-x-hidden">
      <Navbar />
      <main className="flex-1 max-w-[1440px] w-full mx-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div 
            key={location.pathname}
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 250, damping: 25, mass: 0.5 }}
            className="p-6 md:p-10 w-full min-h-[calc(100vh-160px)]"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
