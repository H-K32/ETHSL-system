import { useNavigate } from "react-router-dom";
import "../styles/navbar.css";

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        await API.post("/users/logout/", { refresh });
      }
    } catch {
      // ignore — clear client state regardless
    } finally {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      navigate("/login");
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="hamburger" onClick={onMenuClick} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
        <h2 className="navbar-title">Admin Dashboard</h2>
      </div>
      <div className="navbar-right">
        <span className="navbar-user">Welcome, Admin</span>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
};

export default Navbar;
