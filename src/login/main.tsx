import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Swal from 'sweetalert2';
import '../Login.css';
import loginImage from '../assets/login.png';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';

interface LoginFormData {
  ruc: string;
  password: string;
}

function Login() {
  const [formData, setFormData] = useState<LoginFormData>({
    ruc: '',
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
        title: 'Verificando...',
        text: 'Por favor, espere mientras procesamos su información',
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false,
      });

      const response = await api.post<{ token: string }>('/auth/login', formData);
      Swal.close();

      if (response.status === 200) {
        const token = response.data.token;

        localStorage.setItem('jwt', token);
        document.cookie = `Authorization=Bearer ${token}; path=/`;

        await Swal.fire({
          title: 'Inicio de sesión correcto',
          text: 'Bienvenido',
          icon: 'success',
        });

        navigate('/');
      } else {
        throw new Error('Credenciales incorrectas');
      }
    } catch (error: any) {
      Swal.fire({
        title: 'Error',
        text: error.message || 'Ocurrió un error al procesar su solicitud.',
        icon: 'error',
      });
      console.error('Login error:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <h2>Iniciar Sesión</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            id="ruc"
            placeholder="RUC"
            required
            value={formData.ruc}
            onChange={handleChange}
          />
          <input
            type="password"
            id="password"
            placeholder="Contraseña"
            required
            value={formData.password}
            onChange={handleChange}
          />
          <button type="submit" className="login-button">
            Iniciar Sesión
          </button>
        </form>
      </div>
      <div className="login-right">
        <div className="login-illustration">
          <img src={loginImage} alt="Ilustración del Progreso del Proyecto" />
        </div>
      </div>
    </div>
  );
}

export default Login;
