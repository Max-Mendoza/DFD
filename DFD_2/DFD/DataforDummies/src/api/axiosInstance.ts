import axios from "axios";

const API_BASE = "http://localhost:5000";

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Agregar token de acceso a cada solicitud
axiosInstance.interceptors.request.use(
  async (config) => {
    const access = localStorage.getItem("access");
    if (access && config.headers) {
      config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta para manejar expiración del token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no es un intento de refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/jwt/refresh/")
    ) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem("refresh");

      if (refresh) {
        try {
          const res = await axios.post(`${API_BASE}/auth/jwt/refresh/`, {
            refresh,
          });

          const newAccess = res.data.access;
          localStorage.setItem("access", newAccess);

          // Añade nuevo token al header original
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;

          // Repite la solicitud original
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error("Error al refrescar el token:", refreshError);
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
