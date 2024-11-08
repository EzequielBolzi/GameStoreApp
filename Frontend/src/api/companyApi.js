// companyApi.js
import axios from 'axios';

// Set the base URL for your API
const API_BASE_URL = 'http://localhost:3000/api'; // Adjust the URL as needed

const companyApi = {
    // Register a new company
    register: async (companyData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/`, companyData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error registering company');
        }
    },

    // Company login
    login: async (credentials) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/sessions`, credentials);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error logging in');
        }
    },

    // Get current authenticated company information
    getCurrentCompany: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/me`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching current company data');
        }
    },

    // Get all companies 
    getAllCompanies: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/companies`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching companies');
        }
    },
    getCompanyById: async (companyId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/companies/${companyId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching company by ID');
        }
    },

    // Update company profile (authenticated company only)
    updateCompanyProfile: async (profileData) => {
        try {
            const response = await axios.patch(`${API_BASE_URL}/profile`, profileData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error updating company profile');
        }
    },

    // Reset company password
    forgotPassword: async (email) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/forgot-password`, { email });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error sending password reset email');
        }
    }
};

export default companyApi;
