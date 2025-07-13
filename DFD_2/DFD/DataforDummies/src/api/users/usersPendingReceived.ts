import axiosInstance from "../axiosInstance"
import { User } from "../auth"
//Fetch de contactos con solicitudes pendientes que te hayan mandado
export const fetchUsersPendingReceived = async (): Promise<User[]> => {
    const response = await axiosInstance.get("/contacts/pending-received/")
    return response.data
}