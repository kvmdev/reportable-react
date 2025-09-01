// components/Header.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCog, faUser } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react"; 
import { Link } from "react-router-dom";
// Import Dropdown and Button from react-bootstrap
import { Dropdown, Button } from "react-bootstrap"; 
import api from "../lib/api";
import { useNotifications } from "../context/NotificationContext";

interface Notifications {
  id: string;
  razon_social: string;
}

export default function Header() {
  const [notifications, setNotifications] = useState<Notifications[]>([]);
  const {showError} = useNotifications()

  const handleAccept = async (id: string) => {
    // Implement logic to accept the request, e.g., an API call
    try {
      const response = await api.post('/api/respond/accessRequest', {
        requestId: id,
        action: 'accept'
      })
      setNotifications(notifications.filter(notification => notification.id !== id));
    } catch (error) {
      showError('Hubo un error');
    }
  };

  const handleReject = async (id: string) => {
    // Implement logic to reject the request, e.g., an API call
    try {
      const response = await api.post('/api/respond/accessRequest', {
        requestId: id,
        action: 'reject'
      })
      setNotifications(notifications.filter(notification => notification.id !== id));
    } catch (error) {
      showError('Hubo un error');
    }
  };

  const fetchRequests = async ()=> {
    try {
      const response = api.get('/api/get/accessRequests')
      .then(res => {
        console.log(res.data)
        setNotifications(res.data)
      }).catch(err => showError('Hubo un error al obtener las notificaciones'))
    } catch (error) {
      showError('Hubo un error al obtener las notificaciones')
    }
  }

  useEffect(()=> {
    fetchRequests()
  }, [])

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
        {/* Notification Dropdown */}
        <Dropdown align="end">
          <Dropdown.Toggle 
            as={Button}
            variant="light"
            className="p-0 border-0 bg-transparent position-relative"
            aria-label="Notifications"
            id="notification-btn"
          >
            <FontAwesomeIcon icon={faBell} className="fs-5 text-secondary" />
            {notifications.length > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger"
                style={{
                  fontSize: "0.65rem",
                  padding: "0.25rem 0.35rem",
                  transform: "translate(-30%, -20%)",
                }}
              >
                {notifications.length}
              </span>
            )}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification.id} className="dropdown-item px-3 py-2">
                  <p className="mb-2">{notification.razon_social} ha solicitado autorizacion para modificar su perfil.</p>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="success" 
                      size="sm" 
                      onClick={() => handleAccept(notification.id)}
                    >
                      Aceptar
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleReject(notification.id)}
                    >
                      Rechazar
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <Dropdown.Item>No hay notificaciones</Dropdown.Item>
            )}
          </Dropdown.Menu>
        </Dropdown>

        {/* Settings Button */}
        <Button variant="outline-secondary" size="sm">
          <FontAwesomeIcon icon={faCog} />
        </Button>

        {/* Profile Dropdown using React-Bootstrap */}
        <Dropdown align="end">
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
            <Dropdown.Item as={Link} to="/profile">
              Perfil
            </Dropdown.Item>
            <Dropdown.Item onClick={()=> {localStorage.setItem('jwt', ''); document.cookie = `Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`; window.location.reload()}} className="text-danger">
              Cerrar Sesión
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
}