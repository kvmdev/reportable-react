/* import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import "./index.css"
import Login from "./login/main"
import Dashboard from "./dashboard/main"
import RegistrarCliente from "./registrarcliente/main"
import Clientes from "./clientes/main"
import CargarFacturas from "./cargarfacturas/main"
import { AuthProvider } from "./context/AuthContext"
import Facturas from "./facturas/main"
import ClienteEditor from "./editClientes/main"
import { NotificationProvider } from "./context/NotificationContext"
import EditFacturas from "./editFacturas/main"
import RegistrarContador from "./registrarContador/main"
import Profile from "./profile/main"
import { FacturaProvider } from "./context/FacturaContext"
import RegisterClient from "./register/cliente/main"
import RegisterAccountant from "./register/contador/main"
import CargarFacturasCliente from "./cargarfacturascliente/main" */

function App() {
  const MaintenanceIcon = () => (
  <svg
    className="w-16 h-16 text-white animate-spin-slow"
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v5h-2zm0 6h2v2h-2z" />
  </svg>
);

const MaintenancePage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <style>
        {`
        /* Definimos una animación de giro lento para el ícono */
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        `}
      </style>
      <div className="text-center">
        <MaintenanceIcon />
        <h1 className="text-4xl md:text-5xl font-bold mt-6 mb-2">
          Modo Mantenimiento
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 font-light mb-4">
          ¡Volveremos pronto!
        </p>
        <p className="max-w-xl mx-auto text-gray-500">
          Estamos realizando algunas mejoras y actualizaciones importantes en nuestro sitio para brindarte una mejor experiencia. Disculpa las molestias.
        </p>
      </div>
    </div>
  );
};
  return (
    <MaintenancePage/>
  )
}

export default App