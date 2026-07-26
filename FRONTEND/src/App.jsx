import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <div className="min-h-screen">
      <AppRoutes />
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
