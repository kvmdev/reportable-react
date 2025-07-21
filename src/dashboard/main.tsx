// pages/Dashboard.jsx
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header";

export default function Dashboard() {
  const { user, loading } = useContext(AuthContext);

  useEffect(()=> {
    console.log(user)
  }, [user])

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="vh-100">
      <Header />
      
      <div className="container mt-5">
        {user?.isAdmin ? (
          <div className="d-flex min-vh-100 justify-content-center align-items-center">
            <div className="p-4 bg-white rounded-3 shadow">
              <h1 className="text-center mb-4">Menú Principal</h1>
              <a href="/registrar-contador" className="btn btn-primary w-100 mb-2">
                Crear Contador
              </a>
              <a href="/registrar-admin" className="btn btn-primary w-100 mb-2">
                Crear Admin
              </a>
            </div>
          </div>
        ) : user?.isContador ? (
          <div className="d-flex min-vh-100 justify-content-center align-items-center">
            <div className="p-4 bg-white rounded-3 shadow">
              <h1 className="text-center mb-4">Menú Principal</h1>
              <a className="btn btn-primary w-100 mb-2" href="/registrar-cliente">
                Crear Cliente
              </a>
              <a className="btn btn-success w-100" href="/clientes">
                Clientes
              </a>
            </div>
          </div>
        ) : (
          <div className="d-flex min-vh-100 justify-content-center align-items-center">
            <div className="p-4 bg-white rounded-3 shadow">
              <h1 className="text-center mb-4">Menú Principal</h1>
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}