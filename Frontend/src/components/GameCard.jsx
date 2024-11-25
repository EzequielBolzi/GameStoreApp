import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import './gameCard.css';
import GameRating from './GameRating';
import companyApi from '../api/companyApi';
import useAuth from '../hooks/useAuth';
import { AppContext } from '../App';
import userApi from '../api/userApi';

function GameCard({ game, onGameDelete, onDiscountSave }) {
  const [company, setCompany] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const { auth } = useAuth();
  const { library, setLibrary, cart, setCart } = useContext(AppContext);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [duration, setDuration] = useState('');

  const price = game.price || 0;
  const salePrice = game.salePrice || price;
  const formattedPrice = price.toFixed(2);
  const formattedSalePrice = salePrice.toFixed(2);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const data = await companyApi.getCompanyById(game.company);
        setCompany(data.companyName);
      } catch (error) {
        console.error('Error fetching company info:', error);
      }
    };

    const checkIfPurchased = async () => {
      try {
        const response = await userApi.getCurrentUser(auth.accessToken);
        const purchasedGames = response.purchasedGames || [];
        setHasPurchased(
          purchasedGames.some(
            (purchasedGame) => purchasedGame.toString() === game.id.toString()
          )
        );
      } catch (error) {
        console.error('Error checking purchase status:', error);
      }
    };

    if (game.company) {
      fetchCompanyInfo();
    }

    if (auth?.role === 'user') {
      checkIfPurchased();
    }
  }, [game.company, game.id, auth]);

  const handleAddDiscount = () => setShowDiscountModal(true);

  const handleSaveDiscount = () => {
    const discountData = {
      discountPercentage: parseInt(discountPercentage, 10),
      duration: parseInt(duration, 10),
    };
    onDiscountSave(game.id, discountData);

    setShowDiscountModal(false);
    setDiscountPercentage('');
    setDuration('');
  };

  const handleDeleteClick = () => {
    if (window.confirm(`Are you sure you want to delete ${game.name}?`)) {
      onGameDelete(game.id);
    }
  };

  const handleAddToLibrary = () => {
    setLibrary([...library, game]);
  };

  const handleRemoveFromLibrary = () => {
    setLibrary(library.filter((libGame) => libGame.id !== game.id));
  };

  const handleAddToCart = () => {
    // Check if the game is already in the cart
    if (!cart.some((cartGame) => cartGame.id === game.id)) {
      setCart([...cart, game]);
    } else {
      alert('This game is already in your cart.');
    }
  };

  const calculateDaysLeft = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffInMilliseconds = end - now;
    const diffInDays = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24));
    return diffInDays > 0 ? diffInDays : 0;
  };

  return (
    <div className="col-xl-3 col-lg-4 col-md-6">
      <div className="gameCard">
        <Link to={`/game/${game.id}`}>
          <img src={game.gamePhoto} alt={game.name} className="img-fluid" />
        </Link>

        {auth.role === 'user' && !hasPurchased && (
          <>
            <button
              className={`like ${library.includes(game) ? 'active' : ''}`}
              onClick={
                library.includes(game)
                  ? handleRemoveFromLibrary
                  : handleAddToLibrary
              }
            >
              <i className="bi bi-heart-fill"></i>
            </button>
            <button className="addCart" onClick={handleAddToCart}>
              <i className="bi bi-bag-plus-fill"></i>
            </button>
          </>
        )}
        {auth.role === 'company' && (
          <>
            <button className="addDiscount" onClick={handleAddDiscount}>
              <i className="bi bi-pen-fill"></i>
            </button>
            <button className="deleteGame" onClick={handleDeleteClick}>
              <i className="bi bi-trash3-fill"></i>
            </button>
          </>
        )}
        {auth.role === 'user' && hasPurchased && (
          <div className="ownedMessage">
            <span>You already own this game!</span>
          </div>
        )}

        <div className="gameFeature">
          <span className="gameCompany">{company}</span>
          <GameRating rating={game.averageRating} />
        </div>
        <div className="gameTitle mt-4 mb-3">{game.name}</div>
        <div className="gamePrice">
          {game.isOnSale ? (
            <>
              <span className="discount">
                <i>{game.discountPercentage}% off</i>
                <br />
                <i> for {calculateDaysLeft(game.saleEndDate)} days.</i>
              </span>
              <span className="originalPrice">${formattedPrice}</span>
              <br />
              <span className="currentPrice">${formattedSalePrice}</span>
            </>
          ) : (
            <span className="currentPrice">${formattedPrice}</span>
          )}
        </div>
      </div>
      {showDiscountModal && (
        <div
          className="discountModalBackdrop"
          onClick={(e) => {
            if (e.target.className.includes('discountModalBackdrop')) {
              setShowDiscountModal(false);
            }
          }}
        >
          <div className="modalContent">
            <h2>Add Discount</h2>
            <div className="modalInputGroup">
              <label htmlFor="discountPercentage">Discount Percentage:</label>
              <input
                id="discountPercentage"
                type="number"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                min="0"
                max="100"
                placeholder="Enter percentage (0-100)"
              />
            </div>
            <div className="modalInputGroup">
              <label htmlFor="duration">Duration (days):</label>
              <input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
                placeholder="Enter duration in days"
              />
            </div>
            <div className="modalActions">
              <button
                className="modalButton saveButton"
                onClick={handleSaveDiscount}
              >
                Save
              </button>
              <button
                className="modalButton cancelButton"
                onClick={() => setShowDiscountModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameCard;
