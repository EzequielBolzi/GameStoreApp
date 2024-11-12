import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/users'; 

const userApi = {

  getCurrentUser: async (authToken) => {
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

    getAllUsers: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching users');
        }
    },

    updateProfile: async (profileData) => {
        try {
            const response = await axios.patch(`${API_BASE_URL}/profile`, profileData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error updating user profile');
        }
    },

    forgotPassword: async (email) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/forgot-password`, { email });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error sending password reset email');
        }
    },

    commentAndRate: async (gameId, commentData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/commendAndRate/${gameId}`, commentData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error commenting and rating game');
        }
    },

    deleteCommentAndRate: async (commentId) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/commendAndRate/${commentId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error deleting comment and rating');
        }
    },

    purchaseGame: async (gameId) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/orders/${gameId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error purchasing game');
        }
    },

    addGameToWishlist: async (gameId, authToken) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/wishlist/${gameId}`, 
                {}, 
                {  
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error adding game to wishlist');
        }
    },

    removeGameFromWishlist: async (gameId, authToken) => {
        try {
            const response = await axios.delete(
                `${API_BASE_URL}/wishlist/${gameId}`, 
                {  
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error removing game from wishlist');
        }
    },
};

export default userApi;
