import axios from "axios";
export const API_BASE = "http://localhost:5000";

// ✅ Login con Djoser (usa axios normal solo para crear sesión)
export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/jwt/create/`, {
      email,
      password,
    });

    const { access, refresh } = response.data;

    // Guarda tokens en localStorage
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    console.log("Access token:", localStorage.getItem("access"));
    console.log("Refresh token:", localStorage.getItem("refresh"));
    return response.data;
  } catch (error) {
    console.log("Access token:", localStorage.getItem("access"));
    console.log("Refresh token:", localStorage.getItem("refresh"));
    console.error("Error al hacer login:", error);
    throw error;
  }

};

// ✅ Logout
export const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};
