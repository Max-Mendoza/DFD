import axiosInstance from "../axiosInstance"
// Fetch de usuarios en search
export const fetchUsers = async () => {
    const response = await axiosInstance.get("/contacts/search/")
    return response.data
    // setUsers(response.data)
    // setFilteredUsers(response.data)
}