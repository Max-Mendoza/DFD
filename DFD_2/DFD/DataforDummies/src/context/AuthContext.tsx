import { createContext, useEffect, useState, ReactNode } from "react";
import { User, getAuthenticatedUser } from "../api/auth"; // Tu función que llama a /auth/users/me/
import { login as apiLogin, logout as apiLogout } from "../api/authService"; // Asegúrate de tener logout también

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const access = localStorage.getItem("access");
      if (!access) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getAuthenticatedUser();
        setUser(userData);
      } catch (err) {
        console.error("No se pudo cargar el usuario:", err);
        // Podrías intentar refreshToken aquí si quieres
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);

      // Si `apiLogin` ya guarda tokens en localStorage, no hace falta hacer más aquí
      const userData = await getAuthenticatedUser();
      setUser(userData);
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
    apiLogout?.(); // Si definiste algo extra en apiLogout, como invalidar refresh token en backend
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
