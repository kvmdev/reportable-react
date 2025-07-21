// contexts/AuthContext.jsx
import { createContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import verifyToken from "../lib/auth";

interface User {
  id: number;
  username: string;
  email: string;
  isAdmin?: boolean;
  isContador?: boolean;
  isClient?: boolean;
  role?: string;
  // Agrega cualquier otra propiedad que tu objeto 'user' tenga
}

type SelectedAccount = "ADMIN" | "CONTADOR" | "CLIENT" | null;

interface AuthState {
  user: User | null;
  selectedAccount: SelectedAccount;
  loading: boolean;
  error: string | null;
  loggedIn: boolean;
}

export interface AuthContextType {
  user: User | null;
  selectedAccount: SelectedAccount;
  loading: boolean;
  loggedIn: boolean;
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>;
  notification?: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType>({
  user: null,
  selectedAccount: null,
  loading: true,
  setAuthState: () => {}, // Función vacía para el valor por defecto
  loggedIn: false,
  notification: ''
});


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    selectedAccount: null,
    loading: true,
    error: null,
    loggedIn: false,
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const tokenExists =
          localStorage.getItem("jwt") ||
          document.cookie.includes("Authorization");

        if (!tokenExists) throw new Error("No token found");

        // Tipar la respuesta de verifyToken
        const { isValid, user }: { isValid: boolean; user: User | null } = await verifyToken();

        if (!isValid || !user) throw new Error("Invalid token or user data");

        setAuthState({
          user: user,
          selectedAccount: user.isAdmin
            ? "ADMIN"
            : user.isContador
            ? "CONTADOR"
            : user.isClient
            ? "CLIENT"
            : null,
          loading: false,
          loggedIn: true,
          error: null,
        });
      } catch (error: any) { // Usar 'any' para el catch de error si no sabes el tipo exacto, o un tipo más específico
        localStorage.removeItem("jwt");
        document.cookie =
          "Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        setAuthState({
          user: null,
          selectedAccount: null,
          loading: false,
          loggedIn: false,
          error: error instanceof Error ? error.message : String(error), // Mejor manejo del tipo de error
        });

        if (location.pathname !== "/login") {
          navigate("/login", { state: { from: location }, replace: true });
        }
      }
    };

    if (location.pathname !== "/login") {
      checkAuth();
    } else {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        loggedIn: false,
      }));
    }
  }, [navigate, location]);

  const value: AuthContextType = {
    user: authState.user,
    selectedAccount: authState.selectedAccount,
    loading: authState.loading,
    setAuthState, // Pasa la función directamente
    loggedIn: authState.loggedIn,
  };

  return (
    <AuthContext.Provider value={value}>
      {!authState.loading && children} {/* Renderiza solo cuando la carga inicial haya terminado */}
    </AuthContext.Provider>
  );
}