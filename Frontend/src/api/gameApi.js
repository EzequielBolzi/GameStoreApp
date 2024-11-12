import axios from 'axios';
import io from 'socket.io-client';

const API_BASE_URL = 'http://localhost:3000/api'; 

const gameApi = {
    getAllGames: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const response = await axios.get(`${API_BASE_URL}/games?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching games');
        }
    },
    getGame: async (id,authToken) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/games/${id}`,{
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching game');
        }
    },
    getGameStatistics: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/games/statistics/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching game statistics');
        }
    },

    createGame: async (gameData,authToken) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/games`, gameData, {
                headers: {
                    Authorization: `Bearer ${authToken}`, 
                },
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error creating game');
        }
    },

    updateGame: async (id, gameData,authToken) => {
        try {
            const response = await axios.patch(`${API_BASE_URL}/games/${id}`, gameData, {
                headers: {
                    Authorization: `Bearer ${authToken}`, 
                },
            }); 
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error updating game');
        }
    },

    deleteGame: async (id,authToken) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/games/${id}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`, 
                },
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error deleting game');
        }
    },

    setGameSale: async (id, saleData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/games/sales/${id}`, saleData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error setting game sale');
        }
    },

    removeSale: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/games/sales/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error removing game sale');
        }
    },


};



export default gameApi;