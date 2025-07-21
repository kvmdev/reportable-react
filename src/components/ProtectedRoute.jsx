// components/ProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/ContextProvider.js';

export default function ProtectedRoute({ allowedRole = null }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if(allowedRole == 'CONTADOR' && user.isContador) {
      setIsValid(true);
    }
    else if(allowedRole == 'ADMIN' && user.isAdmin) {
      setIsValid(true);
    }
    else if(allowedRole == 'CLIENT' && user.isClient) {
      setIsValid(true);
    }
  }, [navigate, allowedRole, user]);
  // If the token is valid, render the child components

  return isValid ? <Outlet /> : null;
}