import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FormEvent } from 'react';
import Header from '../components/Header';
import api from '../lib/api';

interface Notification {
  show: boolean;
  message: string;
  type: 'success' | 'danger' | string;
}

export default function RegistrarCliente() {
  const [rucToShow, setRucToShow] = useState<string>('');
  const [razonSocial, setRazonSocial] = useState<string>('');
  const [pagaIVA, setPagaIVA] = useState<boolean>(false);
  const [pagaIRE, setPagaIRE] = useState<boolean>(false);
  const [pagaIRP, setPagaIRP] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>({
    show: false,
    message: '',
    type: '',
  });
  let ruc = '';
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      ruc = rucToShow
      const infoResponse = await api.post('/v0/api/info', { ruc });

      const formattedRuc = `${rucToShow}-${infoResponse.data.guion}`;
      setRazonSocial(infoResponse.data.razon_social);
      setRucToShow(formattedRuc);

      const createResponse = await api.post('/v0/api/cliente/create', {
        ruc,
        razon_social: infoResponse.data.razon_social,
        pagaIVA,
        pagaIRE,
        pagaIRP,
      });


      if (createResponse.status === 200) {
        showNotification('¡Cliente creado correctamente!', 'success');
        setTimeout(() => navigate('/clientes'), 1000);
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Ocurrió un error inesperado.';
      showNotification(message, 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showNotification = (message: string, type: Notification['type']) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <Header />

      {notification.show && (
        <div
          className={`alert alert-${notification.type} text-center position-fixed top-0 start-50 translate-middle-x w-50`}
          style={{ zIndex: 1050 }}
          role="alert"
        >
          {notification.message}
        </div>
      )}

      <div
        className="container d-flex align-items-center justify-content-center"
        style={{ minHeight: 'calc(100vh - 60px)' }}
      >
        <div className="card" style={{ maxWidth: '600px', width: '100%' }}>
          <div
            className="card-header"
            style={{ backgroundColor: '#112A46', color: 'white' }}
          >
            <h2 className="mb-0 text-center">Registro de Cliente</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="ruc" className="form-label">
                  RUC
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  id="ruc"
                  value={rucToShow}
                  onChange={(e) => setRucToShow(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="razonSocial" className="form-label">
                  Razón Social
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  id="razonSocial"
                  value={razonSocial}
                  readOnly
                />
              </div>

              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="pagaIVA"
                  onChange={() => setPagaIVA(!pagaIVA)}
                  checked={pagaIVA}
                  readOnly
                />
                <label className="form-check-label" htmlFor="pagaIVA">
                  Paga IVA
                </label>
              </div>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="pagaIRE"
                  onChange={() => setPagaIRE(!pagaIRE)}
                  checked={pagaIRE}
                  readOnly
                />
                <label className="form-check-label" htmlFor="pagaIRE">
                  Paga IRE
                </label>
              </div>
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="pagaIRP"
                  onChange={() => setPagaIRP(!pagaIRP)}
                  checked={pagaIRP}
                  readOnly
                />
                <label className="form-check-label" htmlFor="pagaIRP">
                  Paga IRP
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg w-100"
                style={{ backgroundColor: '#112A46', borderColor: '#112A46' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Procesando...' : 'Registrar Cliente'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
