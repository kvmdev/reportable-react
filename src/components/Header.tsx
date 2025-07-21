// components/Header.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCog, faUser } from "@fortawesome/free-solid-svg-icons";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Header() {
  useContext(AuthContext);

  return (
    <header className="d-flex justify-content-between align-items-center p-3 bg-white shadow-sm position-fixed w-100 h-screen top-0 start-0" style={{ 
      zIndex: 1000,
      height: "60px" // Altura fija para el header
    }}>
      {/* Left side - Brand/Logo */}
      <div className="fw-bold fs-4"><Link to={'/'} style={{textDecoration: 'none', color: '#000'}}>Reportable</Link></div>

      {/* Right side - Navigation and Actions */}
      <div className="d-flex align-items-center gap-3">
        {/* Notification Button */}
        <div className="position-relative me-2">
          <button
            className="btn p-0 border-0 bg-transparent position-relative"
            aria-label="Notifications"
            id="notification-btn"
          >
            <FontAwesomeIcon icon={faBell} className="fs-5 text-secondary" />
            <span
              className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger"
              style={{
                fontSize: "0.65rem",
                padding: "0.25rem 0.35rem",
                transform: "translate(-30%, -20%)",
              }}
            >
              9+
            </span>
          </button>
        </div>

        {/* Settings Button */}
        <button className="btn btn-sm btn-outline-secondary">
          <FontAwesomeIcon icon={faCog} />
        </button>

        {/* Profile Dropdown */}
        <div className="dropdown">
          <button
            className="btn btn-light rounded-circle bg-secondary text-white"
            type="button"
            id="profileDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{ width: "35px", height: "35px", fontSize: "14px" }}
          >
            <FontAwesomeIcon icon={faUser} />
          </button>
          <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
            <li>
              <a className="dropdown-item" href="/profile">
                Perfil
              </a>
            </li>
            <li>
              <button className="dropdown-item text-danger">
                Cerrar Sesión
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}