import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FaEdit, FaFile } from 'react-icons/fa';
import api from '../lib/api';

interface Cliente {
  id: string | number;
  razon_social: string;
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await api.get<Cliente[]>('/api/getClients');
        console.log('Clientes obtenidos:', response.data);
        setClientes(response.data);
      } catch (error) {
        console.error('Error al obtener clientes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

  const handleCreateFactura = (clienteId: Cliente['id']) => {
    navigate(`/facturas/${clienteId}`);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />

      {/* Botón para volver */}

      <div className="container mt-4">
        <h2 className="text-center mb-4">Listado de Clientes</h2>

        {clientes.length === 0 ? (
          <div className="alert alert-info">No hay clientes registrados</div>
        ) : (
          <ul className="list-group">
            {clientes.map((cliente) => (
              <li key={cliente.id} className="list-group-item d-flex justify-content-between align-items-center">
                {cliente.razon_social}
                <div className="d-flex gap-2"> {/* Usa d-flex para flexbox y gap-2 para espaciado */}
                  <button
                    className="btn btn-outline-info btn-sm"
                    onClick={() => navigate(`/edit/cliente/${cliente.id}`)}
                  >
                    <FaEdit /> Editar
                  </button>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => handleCreateFactura(cliente.id)}
                  >
                    <FaFile /> Facturas
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
