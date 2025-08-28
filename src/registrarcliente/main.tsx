import { useState } from 'react';
import type {FormEvent} from 'react';
import { Mail } from 'lucide-react';
// Importamos el hook de notificaciones desde tu contexto.
import { useNotifications } from "../context/NotificationContext";
import api from '../lib/api';
/**
 * Componente principal para el formulario de solicitud.
 * Este componente maneja el estado del formulario y el envío de datos,
 * utilizando el contexto de notificaciones para mostrar mensajes al usuario.
 */
export default function App() {
  // Estado para almacenar el RUC ingresado por el usuario.
  const [ruc, setRuc] = useState<string>('');
  // Desestructuramos las funciones del contexto de notificaciones.
  const { showSuccess, showError } = useNotifications();
  // Estado para deshabilitar el botón de envío durante el proceso.
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /**
   * Maneja el envío del formulario.
   * @param {FormEvent<HTMLFormElement>} e - El evento de envío del formulario.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simula una llamada a la API con un retraso de 1 segundo.
    try {
      // Reemplaza 'http://your-server-url/send-request' con tu endpoint real
      const response = await api.post('/api/send/accessRequest', {ruc});

      if (response.status == 200) {
        // Usa la función del contexto para mostrar una notificación de éxito.
        showSuccess('¡Solicitud enviada correctamente!');
        setRuc(''); // Limpia el campo RUC al tener éxito.
      } else {
        // Usa la función del contexto para mostrar una notificación de error.
        showError('Hubo un error al enviar la solicitud. Por favor, intente de nuevo.');
      }
    } catch (error) {
      // Captura y maneja cualquier error de red usando la función de error del contexto.
      console.error("Error sending request:", error);
      showError('Error de conexión. Por favor, revise su red.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-lg w-full">
        {/* Encabezado de la tarjeta */}
        <div className="bg-blue-900 text-white p-6">
          <h2 className="text-2xl font-bold text-center flex items-center justify-center space-x-2">
            <Mail size={24} />
            <span>Enviar Solicitud</span>
          </h2>
        </div>
        
        {/* Cuerpo del formulario */}
        <div className="p-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="ruc" className="block text-gray-700 text-sm font-semibold mb-2">
                RUC para la Solicitud
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                id="ruc"
                value={ruc}
                onChange={(e) => setRuc(e.target.value)}
                placeholder="Ej. 123456789"
                required
              />
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              className={`w-full py-3 px-4 text-white font-bold rounded-lg transition-colors duration-200 ${
                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-900 hover:bg-blue-800'
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}