import { BrowserRouter } from "react-router-dom";
import ScrollToTop from "./components/layout/ScrollToTop";
import AppRoutes from "./routes/AppRoutes";

/**
 * Application shell.
 *
 * Two distinct trees live under one router:
 *   - the public editorial site (PublicLayout provides Navbar/Footer)
 *   - the admin CMS at /admin/* (AdminRoot provides its own shell)
 */
export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  );
}
