import axiosInstance from "../axiosInstance"
import { User } from "../auth"
// Usuarios a los que ya son contactos
export const fetchUsersAccepted = async (): Promise<User[]> => {
    const response = await axiosInstance.get("/contacts/accepted/")
    return response.data

}