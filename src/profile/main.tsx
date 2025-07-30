/* eslint-disable @typescript-eslint/no-unused-vars */
import { useContext, useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useNotifications } from '../context/NotificationContext';
import api from '../lib/api';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';

// Define the type for the user's profile data
interface UserProfile {
  email: string;
  razon_social: string;
  base: string;
  guion: string;
  // Add any other fields your API returns for myInfo
}

// Main Profile component
const Profile = () => {
  const { loading } = useContext(AuthContext);
  const { showError, showSuccess } = useNotifications();

  // State for input fields (editable values)
  const [email, setEmail] = useState<string>('');
  // States for display-only values (fetched from API)
  const [razonSocial, setRazonSocial] = useState<string>('');
  const [ruc, setRuc] = useState<string>('');
  const [guion, setGuion] = useState<string>('');


  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const response = await api.get<UserProfile>('/v0/api/myInfo');
        if (response.status === 200) {
          const data = response.data;
          // Set current input state for email
          setEmail(data.email || '');
          // Set display states for read-only fields
          setRazonSocial(data.razon_social || '');
          setRuc(data.base || '');
          setGuion(data.guion);
        } else {
          showError('Error al obtener la información del usuario');
        }
      } catch (error) {
        showError('Error al conectar con el servidor');
      }
    };
    fetchMyInfo();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-gray-700 text-lg">Cargando perfil...</div>
      </div>
    );
  }

  // Function to handle changes in the email input
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  // Function to validate email format
  const isValidEmail = (emailToCheck: string): boolean => {
    // Simple regex for email validation
    return /\S+@\S+\.\S+/.test(emailToCheck);
  };

  // Function to handle saving the profile
  const handleSave = async () => {
    // Basic validation for editable fields
    if (!email.trim() || !isValidEmail(email)) {
      showError('Por favor, introduce un formato de email válido.');
      return;
    }

    try {
      // Send all profile data, including read-only fields, if your API expects them
      const response = await api.post('/v0/api/myInfo', {
        email: email
      });

      if (response.status === 200) {
        localStorage.setItem('jwt', response.data.token)
        showSuccess('Perfil actualizado correctamente');
      } else {
        showError('Error al actualizar el perfil.');
      }
    } catch (error) {
      showError('Error al guardar los cambios. Intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Header/>
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Editar Perfil</h2>
        {/* Razon Social Display (as plain text) */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Razón Social
          </label>
          <div className="bg-gray-50 border border-gray-200 rounded-lg w-full py-3 px-4 text-gray-800 leading-tight">
            {razonSocial || 'N/A'} {/* Display 'N/A' if empty */}
          </div>
        </div>

        {/* RUC Display (as plain text) */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            RUC
          </label>
          <div className="bg-gray-50 border border-gray-200 rounded-lg w-full py-3 px-4 text-gray-800 leading-tight">
            {ruc + (guion ? ('-' + guion) : "") || 'N/A'} {/* Display 'N/A' if empty */}
          </div>
        </div>
        {/* Email Input */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
            value={email}
            onChange={handleEmailChange}
            placeholder="tu@ejemplo.com"
          />
        </div>


        <button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out transform hover:scale-105"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};

export default Profile;