import axios from 'axios';

const AUTH_BASE_URL = 'http://localhost:3000/api/auths';

const authApi = {
    // Company authentication
    registerCompany: async (companyData) => {
        try {
            const response = await axios.post(`${AUTH_BASE_URL}/companies`, companyData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error registering company');
        }
    },


    // User authentication
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
            // Store the token if you're handling authentication state
            console.log(response.data);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error logging in');
        }
    },

    // Logout (clears token)
    logout: () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
};

export default authApi;
