import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/companies'; 

const companyApi = {
    getCurrentCompany: async (authToken) => {
        try {
            if (!authToken) {
              throw new Error('Authorization token is required');
            }
      
            const response = await axios.get(`${API_BASE_URL}/me`, {
              headers: {
                Authorization: `Bearer ${authToken}`, 
              },
            });
      
            return response.data; 
      
          } catch (error) {
            
            const message = error.response?.data?.message || error.message || 'Error fetching current user data';
            throw new Error(message);
          }
        },
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

    updateCompanyProfile: async (profileData, authToken) => {
        try {
            const response = await axios.patch(`${API_BASE_URL}/profile`, profileData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,  
                },
            });
            return response.data;
        } catch (error) {
            console.log(profileData,authToken);
            throw new Error(error.response?.data?.message || 'Error updating company profile');
        }
    },

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
