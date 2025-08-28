import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Swal from 'sweetalert2';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

interface AccountantFormData {
  nombre: string;
  colegiatura: string;
  ruc: string;
  email: string;
  password: string;
}

function RegisterAccountant() {
  const [formData, setFormData] = useState<AccountantFormData>({
    nombre: '',
    colegiatura: '',
    ruc: '',
    email: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      Swal.fire({
        title: 'Registrando...',
        text: 'Por favor, espere mientras creamos su cuenta',
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false,
      });

      const response = await api.post('/auth/register/accountant', formData);
      Swal.close();

      if (response.status === 201) {
        await Swal.fire({
          title: 'Registro exitoso',
          text: 'Su cuenta de contador ha sido creada. Ahora puede iniciar sesión.',
          icon: 'success',
        });
        navigate('/login');
      } else {
        throw new Error('Error al registrar al contador');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        Swal.fire({
          title: 'Error',
          text: error.message || 'Ocurrió un error al procesar su solicitud.',
          icon: 'error',
        });
      } else {
        console.error('Register error:', error);
      }
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg p-4 p-md-5 w-100" style={{ maxWidth: '600px' }}>
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Registro de Contador</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="nombre" className="form-label">Nombre Completo</label>
              <input
                type="text"
                id="nombre"
                className="form-control"
                placeholder="Nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="colegiatura" className="form-label">Número de Colegiatura</label>
              <input
                type="text"
                id="colegiatura"
                className="form-control"
                placeholder="Número de Colegiatura"
                required
                value={formData.colegiatura}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="ruc" className="form-label">RUC</label>
              <input
                type="text"
                id="ruc"
                className="form-control"
                placeholder="RUC"
                required
                value={formData.ruc}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="email@ejemplo.com"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="Contraseña"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 mt-3">
              Registrarme
            </button>
          </form>
          <div className="text-center mt-3">
            <a href="/login" className="btn btn-link">
              ¿Ya tienes una cuenta? Inicia sesión
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterAccountant;