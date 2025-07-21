import { useRef } from 'react';
import Swal from 'sweetalert2';

export default function LoginForm() {
  const rucRef = useRef(null);
  const passwordRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const ruc = rucRef.current.value;
    const password = passwordRef.current.value;

    try {
      // Mostrar loading
      Swal.fire({
        title: "Verificando...",
        text: "Por favor, espere mientras procesamos su información",
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false,
      });

      // Hacer la petición
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, ruc }),
      });

      const data = await response.json();
      Swal.close();

      if (data.token) {
        // Guardar token
        localStorage.setItem('jwt', data.token);
        document.cookie = `Authorization=Bearer ${data.token}; path=/`;

        // Mostrar éxito y redirigir
        await Swal.fire({
          text: "Bienvenido",
          title: "Inicio de sesión correcto",
          icon: "success",
        });
        window.location.href = "/";
      } else {
        throw new Error(data.message || "Credenciales incorrectas");
      }
    } catch (error) {
      Swal.fire({
        text: error.message || "Ocurrió un error al procesar su solicitud.",
        title: "Error",
        icon: "error",
      });
      console.error("Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        id="ruc" 
        ref={rucRef} 
        type="text" 
        placeholder="RUC" 
        required 
      />
      <input
        id="password"
        ref={passwordRef}
        type="password"
        placeholder="Contraseña"
        required
      />
      <button id="button" type="submit">
        Iniciar sesión
      </button>
    </form>
  );
}