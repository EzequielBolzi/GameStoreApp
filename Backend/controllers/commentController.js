const Comment = require('../models/comment');


const getCommentById = async (req, res) => {
    try {
      const commentId = req.params.id;
      const comment = await Comment.findById(commentId)
        .populate('user', 'username'); 
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      res.json(comment);
    } catch (error) {
      console.error('Error fetching comment by ID:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  module.exports = { getCommentById }; 
