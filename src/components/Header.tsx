// components/Header.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCog, faUser } from "@fortawesome/free-solid-svg-icons";
/* import { useContext } from "react"; // No need for useState for dropdown 'options' anymore
import { AuthContext } from "../context/AuthContext"; */
import { Link } from "react-router-dom";
// Import Dropdown and Button from react-bootstrap
import { Dropdown, Button } from "react-bootstrap"; 

export default function Header() {
  // You declared useContext(AuthContext) but didn't assign it to a variable.
  // If you need to access auth context values (like logout function),
  // you should destructure them from the context. Example:
  /* const { logout } = useContext(AuthContext); */ 

  return (
    <header className="d-flex justify-content-between align-items-center p-3 bg-white shadow-sm position-fixed w-100 top-0 start-0" style={{ 
      zIndex: 1000,
      height: "60px" // Altura fija para el header
    }}>
      {/* Left side - Brand/Logo */}
      <div className="fw-bold fs-4">
        <Link to={'/'} style={{textDecoration: 'none', color: '#000'}}>Reportable</Link>
      </div>

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
        <Button variant="outline-secondary" size="sm"> {/* Using React-Bootstrap Button for consistency */}
          <FontAwesomeIcon icon={faCog} />
        </Button>

        {/* Profile Dropdown using React-Bootstrap */}
        <Dropdown align="end"> {/* Use 'align="end"' for right-aligned dropdown */}
          <Dropdown.Toggle 
            as={Button} 
            variant="light" 
            className="rounded-circle bg-secondary text-white"
            id="profile-dropdown-toggle"
            style={{ width: "35px", height: "35px", fontSize: "14px" }}
          >
            <FontAwesomeIcon icon={faUser} />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item as={Link} to="/profile"> {/* Use as={Link} for react-router-dom links */}
              Perfil
            </Dropdown.Item>
            <Dropdown.Item onClick={()=> {localStorage.setItem('jwt', ''); window.cookieStore.set('Authorization', ''); window.location.reload()}} className="text-danger"> {/* Assuming logout is from AuthContext */}
              Cerrar Sesión
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
}