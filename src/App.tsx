import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

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
import CargarFacturasCliente from "./cargarfacturascliente/main"

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <NotificationProvider>
          <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/registrar-cliente" element={<RegistrarCliente />} />
            <Route path="/registrar-contador" element={<RegistrarContador />} />
            <Route path="/clientes" element={<Clientes/>} />
            <Route path="/facturas/:id" element={<FacturaProvider><Facturas /></FacturaProvider>} />
            <Route path="/factura/:id/:idClient" element={<FacturaProvider><EditFacturas /></FacturaProvider>} />
            <Route path='/edit/cliente/:id' element={<ClienteEditor />} />
            <Route path="/cargarfactura/:id" element={<CargarFacturas />} />
            <Route path="/cargar-facturas" element={<CargarFacturasCliente />} />
            <Route path="*" element={<h1>404 Not Found</h1>} />
          </Routes>
        </AuthProvider>
        </NotificationProvider>
      </div>
    </Router>
  )
}

export default App