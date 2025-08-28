import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Swal from 'sweetalert2';
import loginImage from '../assets/login.png';
import api from '../lib/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from 'react-router-dom';

interface FormData {
  nombre?: string;
  ruc: string;
  password?: string;
}

function Login() {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState(1);
  const [formType, setFormType] = useState<'client' | 'accountant'>('client');
  const [formData, setFormData] = useState<FormData>({
    ruc: '',
    password: '',
  });

  const navigate = useNavigate();

  const [rucExists, setRucExists] = useState(false);
  const [razonSocial, setRazonSocial] = useState('');

  const validarFormatoRUC = (ruc: string): boolean => {
    const formatoValido = /^\d+-\d{1}$/;
    return formatoValido.test(ruc);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleNextStep = async () => {
    if (formType === 'accountant' && !validarFormatoRUC(formData.ruc)) {
      Swal.fire({
        title: 'Error de Formato',
        text: 'El RUC no cumple con el formato requerido (ej: 123456-7).',
        icon: 'error',
      });
      return;
    }

    if (step === 1) {
      try {
        Swal.fire({
          title: 'Verificando...',
          text: formType === 'client' ? 'Verificando RUC o CI...' : 'Verificando RUC...',
          didOpen: () => Swal.showLoading(),
          allowOutsideClick: false,
        });
        const response = await api.get(`/api/getClientByRuc/${formData.ruc}`);
        Swal.close();
        if (response.data) {
          setRucExists(true);
          setRazonSocial(response.data.razon_social);
        } else {
          setRucExists(false);
          setRazonSocial('');
        }
        setStep(2);
      } catch (error) {
        Swal.close();
        setRucExists(false);
        setRazonSocial('');
        setStep(2);
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let endpoint = '';
    if (view === 'login') {
      endpoint = '/auth/login';
    } else if (formType === 'client') {
      endpoint = '/auth/register/client';
    } else {
      endpoint = '/auth/register/accountant';
    }

    try {
      Swal.fire({
        title: 'Procesando...',
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false,
      });
      const response = await api.post(endpoint, formData);
      Swal.close();
      if (response.status === 200 || response.status === 201) {
        if (view === 'login') {
          const token = response.data.token;
          localStorage.setItem('jwt', token);
          document.cookie = `Authorization=Bearer ${token}; path=/`;
          await Swal.fire({ title: 'Inicio de sesión correcto', text: 'Bienvenido', icon: 'success' });
          navigate('/');
        } else {
          await Swal.fire({ title: 'Registro exitoso', text: 'Su cuenta ha sido creada. Ahora puede iniciar sesión.', icon: 'success' });
          setView('login');
        }
      } else {
        throw new Error('Credenciales o datos incorrectos');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        Swal.fire({ title: 'Error', text: error.message || 'Ocurrió un error al procesar su solicitud.', icon: 'error' });
      } else {
        console.error('Error:', error);
      }
    }
  };

  const renderRegisterForm = () => {
  switch (step) {
    case 1: {
      const rucPlaceholder = formType === 'client' ? 'RUC o CI' : 'RUC';
      return (
        <>
          <h2 className="mb-4">Ingresa tu {rucPlaceholder}</h2>
          <div className="mb-3">
            <input
              type="text"
              id="ruc"
              className="form-control form-control-lg"
              placeholder={rucPlaceholder}
              required
              value={formData.ruc}
              onChange={handleChange}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary btn-lg w-100 mt-2"
            onClick={handleNextStep}
            disabled={!formData.ruc}
          >
            Siguiente
          </button>
        </>
      );
    } // Closing curly brace for case 1
    case 2:
      // ... (rest of the code for case 2)
      return (
        <>
          <h2 className="mb-4">Información de la Cuenta</h2>
          {rucExists ? (
            <div className="mb-3">
              <label className="form-label text-muted">Razón Social</label>
              <p className="lead fw-bold">{razonSocial}</p>
            </div>
          ) : (
            <div className="mb-3">
              <input
                type="text"
                id="nombre"
                className="form-control form-control-lg"
                placeholder="Razón Social / Nombre Completo"
                required
                value={formData.nombre || ''}
                onChange={handleChange}
              />
            </div>
          )}
          <div className="mb-3">
            <input
              type="password"
              id="password"
              className="form-control form-control-lg"
              placeholder="Crea una contraseña"
              required
              value={formData.password || ''}
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg w-100 mt-2"
            disabled={!formData.password || (!rucExists && !formData.nombre)}
          >
            Registrarme
          </button>
          <button
            type="button"
            className="btn btn-link mt-2"
            onClick={() => {
              setStep(1);
              setFormData({ ruc: '', password: '' });
              setRucExists(false);
              setRazonSocial('');
            }}
          >
            ← Volver
          </button>
        </>
      );
    default:
      return null;
  }
};

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg p-4 p-md-5 w-100" style={{ maxWidth: '900px' }}>
        <div className="row g-0">
          <div className="col-12 col-lg-6 d-flex flex-column justify-content-center align-items-center text-center p-3 p-md-4">
            <ul className="nav nav-pills nav-fill mb-4">
              <li className="nav-item">
                <button className={`nav-link ${view === 'login' ? 'active' : ''}`} onClick={() => setView('login')}>
                  <i className="bi bi-box-arrow-in-right me-2"></i> Iniciar Sesión
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${view === 'register' ? 'active' : ''}`} onClick={() => setView('register')}>
                  <i className="bi bi-person-plus-fill me-2"></i> Registrarse
                </button>
              </li>
            </ul>

            {view === 'login' ? (
              <div className="w-100">
                <h2 className="mb-4">Bienvenido de nuevo</h2>
                <form onSubmit={handleSubmit} className="mx-auto col-md-8">
                  <div className="mb-3">
                    <input type="text" id="ruc" className="form-control form-control-lg" placeholder="RUC" required value={formData.ruc} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <input type="password" id="password" className="form-control form-control-lg" placeholder="Contraseña" required value={formData.password || ''} onChange={handleChange} />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg w-100 mt-2">Ingresar</button>
                </form>
              </div>
            ) : (
              <div className="w-100">
                <div className="btn-group w-100 mb-4" role="group">
                  <button className={`btn btn-lg ${formType === 'client' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => { setFormType('client'); setStep(1); setFormData({ ruc: '', password: '' }); setRucExists(false); setRazonSocial(''); }}>Como Cliente</button>
                  <button className={`btn btn-lg ${formType === 'accountant' ? 'btn-info' : 'btn-outline-info'}`} onClick={() => { setFormType('accountant'); setStep(1); setFormData({ ruc: '', password: '' }); setRucExists(false); setRazonSocial(''); }}>Como Contador</button>
                </div>
                <form onSubmit={handleSubmit} className="mx-auto col-md-8">
                  {renderRegisterForm()}
                </form>
              </div>
            )}
          </div>
          <div className="col-12 col-lg-6 d-none d-lg-flex justify-content-center align-items-center p-4" style={{ backgroundColor: '#f0f2f5' }}>
            <img src={loginImage} alt="Ilustración de inicio de sesión" className="img-fluid" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;