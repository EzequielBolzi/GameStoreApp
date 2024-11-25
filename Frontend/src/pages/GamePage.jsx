import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { Trash2 } from "lucide-react";
import gameApi from "../api/gameApi";
import userApi from "../api/userApi";
import companyApi from "../api/companyApi";
import commentApi from "../api/commentApi";
import { AppContext } from '../App';
import useAuth from "../hooks/useAuth";
import Header from "./Header";
import "./gamePage.css";

function GamePage() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [company, setCompany] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [commentData, setCommentData] = useState([]);
  const [newRating, setNewRating] = useState(0); 
  const [message, setMessage] = useState('');
  const [loadingGame, setLoadingGame] = useState(true);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const { auth } = useAuth();
  const { cart, setCart } = useContext(AppContext);

  const isGameInCart = cart.some(cartGame => cartGame.id === game?.id);

  const fetchComments = async () => {
    if (!game?.comments) {
      setCommentData([]);
      return;
    }

    try {
      const comments = await Promise.all(
        game.comments.map(async (commentId) => {
          const commentDetails = await commentApi.getCommentById(commentId);
          return commentDetails;
        })
      );
      setCommentData(comments.filter(comment => comment)); // Filter out any null responses
    } catch (err) {
      setError("Failed to load comments.");
      setCommentData([]); // Set empty array on error
    }
  };

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const gameData = await gameApi.getGame(gameId, auth.accessToken);
        setGame(gameData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingGame(false); 
      }
    };
    fetchGame();
  }, [gameId, auth.accessToken]);

  useEffect(() => {
    if (game?.company) {
      const fetchCompany = async () => {
        try {
          const companyData = await companyApi.getCompanyById(game.company);
          setCompany(companyData);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoadingCompany(false);  
        }
      };
      fetchCompany();
    }
  }, [game?.company]);  

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (auth.role === "user") {
          const data = await userApi.getCurrentUser(auth.accessToken);
          setUserData(data);
        } else if (auth.role === "company") {
          const companyData = await companyApi.getCurrentCompany(auth.accessToken);
          setCompanyData(companyData);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error.message);
        setError("Failed to load profile data.");
      }
    };
    fetchProfile();
  }, [auth.accessToken, auth.role]);

  useEffect(() => {
    fetchComments();
  }, [game?.comments]);

  const handleAddToCart = (game) => {
    if (cart.some(cartGame => cartGame.id === game.id)) return;
    
    setIsAdding(true);
    setCart([...cart, game]);
    
    setTimeout(() => {
      setIsAdding(false);
    }, 300);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || newRating === 0) {
      setMessage("Please write a comment and select a rating.");
      return;
    }
  
    try {
      const commentDataToAdd = {
        comment: newComment.trim(),
        rating: newRating,
      };
  
      const response = await userApi.commentAndRate(gameId, commentDataToAdd, auth.accessToken);
      
      const newCommentObject = {
        _id: response._id, 
        comment: newComment.trim(),
        rating: newRating,
        user: {
          username: userData.username,
          _id: userData._id
        }
      };

      setCommentData(prevComments => [...prevComments, newCommentObject]);
      
      setNewComment('');
      setNewRating(0);
      setMessage("Your comment has been successfully added!");
      
      const updatedGame = await gameApi.getGame(gameId, auth.accessToken);
      setGame(updatedGame);
      
    } catch (error) {
      setMessage(null);
      setTimeout(() => {
        setMessage("You have already commented on this game.");
      }, 0);
    }
  };


  const handleDeleteComment = async (commentId) => {
    try {
      setCommentData(prevComments => 
        prevComments.filter(comment => comment._id !== commentId)
      );

      // Make the API call
      await userApi.deleteCommentAndRate(commentId, auth.accessToken);

      // If we get here, the deletion was successful
      setGame(prevGame => ({
        ...prevGame,
        comments: prevGame.comments.filter(id => id !== commentId)
      }));
      
      setMessage("Comment deleted successfully.");
    } catch (error) {
      console.error("Failed to delete comment:", error.message);
      
      fetchComments();
      
      setMessage("Error deleting the comment. You may not be authorized.");
    }
  };

  if (loadingGame || loadingCompany) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="game-page">
      <Header 
        username={auth.role === "user" ? userData?.username : companyData?.companyName} 
        isGameInformation={true} 
      />      
      <div className="game-container">
        <div className="game-grid">
          {/* Left Column - Game Image */}
          <div className="game-image-container">
            <img
              src={game.gamePhoto}
              alt={`${game.name} Cover`}
              className="game-image"
            />
            <div className="price-overlay">
              <div className="price-container">
                <span className="price">${game.price}</span>
                {auth.role === "user" && !userData?.purchasedGames?.includes(game.id) && (
                  <button 
                    className={`purchase-btn ${isGameInCart ? 'in-cart' : ''} ${isAdding ? 'adding' : ''}`}
                    onClick={() => handleAddToCart(game)}
                    disabled={isGameInCart}
                  >
                    {isGameInCart ? (
                      <>
                        <i className="bi bi-check-circle-fill"></i> Added to Cart
                      </>
                    ) : isAdding ? (
                      'Adding...'
                    ) : (
                      'Add to Cart'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Game Details */}
          <div className="game-details">
            <div>
              <h1 className="game-title">{game.name}</h1>
              <p className="publisher-info">
                Published by <span className="publisher-name">{company?.companyName}</span>
              </p>
              <div className="game-badges">
                <span className="badge badge-category">{game.category}</span>
                <span className="badge badge-language">{game.language}</span>
              </div>
            </div>

            <div className="section-divider"></div>

            <div>
              <h2 className="section-title">About</h2>
              <p className="game-description">{game.description}</p>
            </div>

            <div className="requirements-card">
              <h3 className="section-title">System Requirements</h3>
              <div className="requirements-grid">
                {Object.entries(game.minimumRequirements).map(([key, value]) => (
                  <div className="requirement-item" key={key}>
                    <div className="requirement-content">
                      <p className="requirement-label">{key}</p>
                      <p className="requirement-value">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
         {/* Comments Display */}
         <div className="comments-section mt-6">
          {message && (
            <div className={`message-box ${
              message.includes("Error") ? "error-message" : "added-message"
            }`}>
              <p className="message">{message}</p>
            </div>
          )}
          
          {/* Comment Input */}
          {auth.role === "user" && userData.purchasedGames.includes(gameId) && (
            <div className="comment-input-container mb-4">
              <h2 className="section-title">Leave a comment:</h2>
              <textarea
                className="w-full p-2 border rounded"
                rows="4"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="rating-input-container mb-4">
                <label htmlFor="rating" className="block mb-2">Rate this game:</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${newRating >= star ? 'filled' : ''}`}
                      onClick={() => setNewRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <button
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleAddComment}
                disabled={!newComment.trim() || !newRating}
              >
                Add Comment
              </button>
            </div>
          )}
     
          {/* Comments Display */}
          <h2 className="section-title">User Comments</h2>
          <div>
            {commentData?.length > 0 ? (
              commentData.map((comment) => (
                <div key={comment._id} className="comment-item relative"> 
                  {Array(comment.rating)
                    .fill("⭐")
                    .map((star, index) => <span key={index}>{star}</span>)}
                  <div className="comment-header">
                    <span className="comment-author">
                      <strong>{comment.user?.username}</strong>
                    </span>
                    {auth.role === "user" && comment.user?.username === userData.username && (
                      <a 
                        className="p-1 hover:bg-gray-100 rounded-full"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleDeleteComment(comment._id)}
                      >
                        <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500 remove-comment" />
                      </a>
                    )}
                  </div>
                  <div className="comment-body">
                    <p>{comment.comment}</p>
                    <p style={{fontFamily: "cursive"}}>Posted on {new Date(comment.createdAt).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  
                    </p>                  
                    </div>
                </div>
              ))
            ) : (
              <div>No comments yet. Be the first to comment!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GamePage;