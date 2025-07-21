// components/NotificationPanel.jsx
import { useState } from "react";

export default function NotificationPanel() {
  // eslint-disable-next-line no-unused-vars
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="container notification-container position-absolute top-0 p-3" style={{ maxWidth: "400px", width: "100%", right: "200px" }}>
      <div className="position-fixed notification-panel" style={{ zIndex: 1000, display: showNotifications ? "block" : "none" }}>
        <div className="card shadow-sm">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Notifications</h5>
            <div>
              <button className="btn btn-sm btn-outline-primary">Mark all as read</button>
            </div>
          </div>
          <div className="card-body p-0 notification-container">
            <div className="list-group list-group-flush">
              <a href="#" className="list-group-item list-group-item-action p-3 notification-item unread">
                <div className="d-flex align-items-start">
                  <div className="notification-icon">
                    <i className="bi bi-envelope"></i>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between">
                      <h6 className="mb-1">New message received</h6>
                      <small className="notification-time">2 min ago</small>
                    </div>
                    <p className="mb-1">You have a new message from John Doe regarding your project.</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
          <div className="card-footer bg-white text-center">
            <a href="#" className="text-decoration-none">View all notifications</a>
          </div>
        </div>
      </div>
    </div>
  );
}