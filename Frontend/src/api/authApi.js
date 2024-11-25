import axios from 'axios';

const AUTH_BASE_URL = 'http://localhost:3000/api/auths';

const authApi = {
    registerCompany: async (companyData) => {
        try {
            const response = await axios.post(`${AUTH_BASE_URL}/companies`, companyData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error registering company');
        }
    },



    registerUser: async (userData) => {
        try {
            const response = await axios.post(`${AUTH_BASE_URL}/users`, userData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error registering user');
        }
    },

    login: async (credentials) => {

        try {
            const response = await axios.post(`${AUTH_BASE_URL}/sessions`, credentials);
            console.log(response.data);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error logging in');
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
};

export default authApi;
