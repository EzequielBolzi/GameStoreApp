import axios from 'axios';

const COMMENTS_BASE_URL = 'http://localhost:3000/api/comments';

const commentApi = {
    getCommentById: async (commentId) => {
        try {
            const response = await axios.get(`${COMMENTS_BASE_URL}/${commentId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error fetching comment');
        }
    },
   
};

export default commentApi;