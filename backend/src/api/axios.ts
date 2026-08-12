import axios from "axios";
const axiosBase = axios.create({
    baseURL: process.env.PSEB_API_URL,
    withCredentials: true
})

export default axiosBase;