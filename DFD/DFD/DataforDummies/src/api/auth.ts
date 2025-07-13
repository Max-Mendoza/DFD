import axiosInstance from "./axiosInstance";
export const API_BASE = "http://localhost:5000";

export interface User {
  id: number;
  name: string;
  email: string;
  status: "online" | "offline"
}

// ✅ Obtener el usuario autenticado
export async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const res = await axiosInstance.get<User>("/auth/users/me/");
    return res.data;
  } catch (err: any) {
    console.error("Error obteniendo usuario:", err);
    return null;
  }
}

