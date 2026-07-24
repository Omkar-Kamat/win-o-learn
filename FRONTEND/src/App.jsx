import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { getCurrentUser } from "./redux/auth/authThunk";

import AppRoutes from "./routes/AppRoutes";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  return <AppRoutes />;
}