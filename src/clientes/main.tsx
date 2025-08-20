import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FaEdit, FaFile } from 'react-icons/fa';
import api from '../lib/api';
import React from 'react';

interface Cliente {
  id: string | number;
  razon_social: string;
  base: string; // Assuming 'base' exists based on previous conversations
  vence: string;
  guion: string;
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Your predefined vencimientos.
  // We'll also dynamically get vencimientos from the data to ensure all are covered.
  const predefinedVencimientos = ['7', '9', '11', '13', '15', '17', '19', '21', '23', '25'];

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

  useEffect(()=> {
    console.log(clientes)
  }, [clientes])

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

  // --- Dynamic Sorting and Grouping Logic ---
  // Get all unique 'vence' values from the fetched clients, including those not in predefinedVencimientos
  const allUniqueVencimientos = Array.from(new Set(clientes.map(cliente => cliente.vence)));

  // Combine predefined and dynamic vencimientos, then sort them numerically
  const sortedUniqueVencimientos = Array.from(new Set([...predefinedVencimientos, ...allUniqueVencimientos]))
    .sort((a, b) => {
      const venceA = parseInt(a, 10);
      const venceB = parseInt(b, 10);
      return venceA - venceB;
    });

  return (
    <div>
      <Header />

      <div className="container mt-4">
        <h2 className="text-center mb-4">Listado de Clientes</h2>

        {clientes.length === 0 ? (
          <div className="alert alert-info">No hay clientes registrados</div>
        ) : (
          <div> {/* Wrap the dynamic content */}
            {sortedUniqueVencimientos.map(vencimiento => {
              // Filter clients for the current 'vence' group
              const clientsInGroup = clientes.filter(cliente => cliente.vence === vencimiento);

              // Only render the group if there are clients in it
              if (clientsInGroup.length === 0) {
                return null; // Don't render anything if no clients match this vencimiento
              }

              return (
                <React.Fragment key={`vence-group-${vencimiento}`}>
                  {/* Vencimiento header */}
                  <h4 className="mt-4 mb-2">Vencimiento: {vencimiento}</h4>
                  <ul className="list-group mb-4">
                    {/* Map over the filtered clients for this group */}
                    {clientsInGroup.map(cliente => (
                      <li
                        key={cliente.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div>
                          {/* Primary information: Razon Social */}
                          <h5 className="mb-1">{cliente.razon_social}</h5>
                          {/* Secondary information: base and Vence */}
                          <small className="text-muted">
                            {/* Assuming 'base' is available on Cliente interface */}
                            RUC: {cliente.base}{ cliente.guion ? '-' + cliente.guion : ""} <br />
                          </small>
                        </div>
                        <div className="d-flex gap-2">
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
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}