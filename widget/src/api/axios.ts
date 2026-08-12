import axios from "axios";

const axiosBase = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
})

export default axiosBase;