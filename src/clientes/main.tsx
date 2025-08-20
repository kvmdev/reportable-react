import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FaEdit, FaFile } from 'react-icons/fa';
import api from '../lib/api';
import React from 'react';

interface Cliente {
  id: string | number;
  razon_social: string;
  base: string; 
  vence: string;
  guion: string;
}

// Función auxiliar para determinar el vencimiento basado en el último dígito de 'base'
const getVencimiento = (base: string): string => {
  const lastDigit = parseInt(base.slice(-1), 10);
  const vencimientosMap: { [key: number]: string } = {
    0: '7',
    1: '9',
    2: '11',
    3: '13',
    4: '15',
    5: '17',
    6: '19',
    7: '21',
    8: '23',
    9: '25',
  };
  return vencimientosMap[lastDigit] || ''; // Devuelve el vencimiento o una cadena vacía si no hay coincidencia
};

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await api.get<Cliente[]>('/api/getClients');
        // Procesar los datos para asignar el vencimiento antes de guardarlos
        const processedClientes = response.data.map(cliente => ({
          ...cliente,
          vence: getVencimiento(cliente.base),
        }));
        setClientes(processedClientes);
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

  // Agrupar y ordenar clientes por vencimiento
  const groupedClientes = clientes.reduce((acc, cliente) => {
    (acc[cliente.vence] = acc[cliente.vence] || []).push(cliente);
    return acc;
  }, {} as Record<string, Cliente[]>);

  const sortedVencimientos = Object.keys(groupedClientes).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  return (
    <div>
      <Header />

      <div className="container mt-4">
        <h2 className="text-center mb-4">Listado de Clientes</h2>

        {clientes.length === 0 ? (
          <div className="alert alert-info">No hay clientes registrados</div>
        ) : (
          <div>
            {sortedVencimientos.map(vencimiento => (
              <React.Fragment key={`vence-group-${vencimiento}`}>
                <h4 className="mt-4 mb-2">Vencimiento: {vencimiento}</h4>
                <ul className="list-group mb-4">
                  {groupedClientes[vencimiento].map(cliente => (
                    <li
                      key={cliente.id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <h5 className="mb-1">{cliente.razon_social}</h5>
                        <small className="text-muted">
                          RUC: {cliente.base}{cliente.guion ? '-' + cliente.guion : ""} <br />
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}