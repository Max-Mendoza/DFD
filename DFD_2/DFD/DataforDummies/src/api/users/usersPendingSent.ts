import axiosInstance from "../axiosInstance"
import { User } from "../auth"
// Aca para los usuarios a los cuales les has enviado soli
export const fetchUsersPendingSent = async (): Promise<User[]> => {
    const response = await axiosInstance.get("/contacts/pending-sent/")
    return response.data
}