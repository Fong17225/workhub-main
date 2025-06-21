import axios from 'axios';
const API_BASE_URL = 'http://localhost:8080/workhub/api/v1';
export const getUserBenefits = (userId, config) => axios.get(`${API_BASE_URL}/user-benefits/user/${userId}`, config);
