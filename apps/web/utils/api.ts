import axios, { AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
    headers: { 'Content-Type': 'application/json' },
});

// api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
//     const user = auth.currentUser;

//     if (user) {
//         const token = await user.getIdToken();
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// });

export default api;