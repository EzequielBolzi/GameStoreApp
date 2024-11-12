// companyApi.js
import axios from 'axios';

// Set the base URL for your API
const API_BASE_URL = 'http://localhost:3000/api/companies'; // Adjust the URL as needed

const companyApi = {
    // Get current authenticated company information
    getCurrentCompany: async (authToken) => {
        try {
            // Ensure that the authToken is provided before making the request
            if (!authToken) {
              throw new Error('Authorization token is required');
            }
      
            const response = await axios.get(`${API_BASE_URL}/me`, {
              headers: {
                Authorization: `Bearer ${authToken}`, // Add token to headers
              },
            });
      
            return response.data; // Returns user data
      
          } catch (error) {
            // Enhanced error handling to cover all cases
            const message = error.response?.data?.message || error.message || 'Error fetching current user data';
            throw new Error(message);
          }
        },
    // Get all companies 
    getAllCompanies: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching companies');
        }
    },
    getCompanyById: async (companyId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/${companyId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching company by ID');
        }
    },

    // Update company profile (authenticated company only)
    updateCompanyProfile: async (profileData, authToken) => {
        try {
            const response = await axios.patch(`${API_BASE_URL}/profile`, profileData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,  // Add token to headers
                },
            });
            return response.data;
        } catch (error) {
            console.log(profileData,authToken);
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
