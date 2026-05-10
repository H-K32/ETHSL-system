import { Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("access"); // ✅ FIXED

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Sidebar />
      <Navbar />
      <main className="page-content">{children}</main>
    </>
  );
};

export default PrivateRoute;