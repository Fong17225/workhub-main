import axios from 'axios';
const API_BASE_URL = 'http://localhost:8080/workhub/api/v1';
export const updateUserPackage = (id, data, config) => axios.put(`${API_BASE_URL}/user-packages/${id}`, data, config);
export const deleteUserPackage = (id, config) => axios.delete(`${API_BASE_URL}/user-packages/${id}`, config);
export const createUserPackage = (data, config) => axios.post(`${API_BASE_URL}/user-packages`, data, config);
