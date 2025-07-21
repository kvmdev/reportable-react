// lib/auth.ts (o donde esté tu archivo)

import api from "./api"; // Asume que 'api' es una instancia de Axios o similar

// Define la interfaz para el usuario que se devuelve desde el backend
interface UserResponse {
  id: number;
  username: string;
  email: string;
  isAdmin?: boolean;
  isContador?: boolean;
  isClient?: boolean;
  role?: string;
  // Añade aquí cualquier otra propiedad que tu API devuelva para el usuario
}

// Define la interfaz para la respuesta de verifyToken
interface VerifyTokenResponse {
  isValid: boolean;
  user: UserResponse | null;
}

export default function verifyToken(role: string | null = null): Promise<VerifyTokenResponse> {
  if (role === null) {
    return new Promise((resolve, reject) => {
      api
        .get("/auth/verify")
        .then((response) => {
          // Asegúrate de que response.data.user coincida con UserResponse
          resolve({
            isValid: response.status === 200,
            user: response.data.user as UserResponse, // Cast para asegurar el tipo
          });
        })
        .catch((error) => {
          console.error("Token verification error:", error);
          reject({ isValid: false, user: null });
        });
    });
  } else {
    return new Promise((resolve, reject) => {
      api
        .post("/auth/verifyRole", { role })
        .then((response) => {
          // Asegúrate de que response.data.user coincida con UserResponse
          resolve({
            isValid: response.status === 200,
            user: response.data.user as UserResponse, // Cast para asegurar el tipo
          });
        })
        .catch((error) => {
          console.error("Token verification error:", error);
          reject({ isValid: false, user: null });
        });
    });
  }
}