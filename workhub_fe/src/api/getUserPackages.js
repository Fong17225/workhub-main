import axios from 'axios';
const API_BASE_URL = 'http://localhost:8080/workhub/api/v1';
export const getUserPackages = (userId, config) => axios.get(`${API_BASE_URL}/user-packages/user/${userId}`, config);
