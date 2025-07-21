import axios from "axios";

// Crear instancia de axios
const api = axios.create({
  baseURL: "http://localhost:3000", // Reemplaza con tu URL base
});

// Interceptar cada petición para agregar el token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt") || 
    document.cookie.replace(/(?:(?:^|.*;\s*)Authorization\s*=\s*([^;]*).*$)|^.*$/, "$1"); // Obtener el token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Agregar al header
  }
  return config;
});

export default api;