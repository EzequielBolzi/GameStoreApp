import React, { useState, useEffect, useContext } from 'react';
import './gameCard.css';
import GameRating from './GameRating';
import companyApi from '../api/companyApi';
import useAuth from '../hooks/useAuth';
import { AppContext } from '../App';
import userApi from '../api/userApi';

function GameCard({ game, onGameDelete }) {
  const [company, setCompany] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false); 
  const { auth } = useAuth();
  const { library, setLibrary, cart, setCart } = useContext(AppContext);
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
        // Check if the user has purchased this game
        const response = await userApi.getCurrentUser(auth.accessToken); 
        const purchasedGames = response.purchasedGames || [];
        setHasPurchased(purchasedGames.some(purchasedGame => purchasedGame.toString() === game.id.toString()));
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

  const handleAddToLibrary = async () => {
    try {
      await userApi.addGameToWishlist(game.id, auth.accessToken);
      setLibrary([...library, game]);
    } catch (error) {
      console.error('Error adding game to library:', error);
    }
  };

  const handleRemoveFromLibrary = async () => {
    try {
      await userApi.removeGameFromWishlist(game.id, auth.accessToken);
      setLibrary(library.filter((item) => item.id !== game.id));
    } catch (error) {
      console.error('Error removing game from library:', error);
    }
  };

  const handleAddToCart = (game) => {
    if (cart.includes(game)) return;
    setCart([...cart, game]);
  };

  const handleDeleteClick = () => {
    if (window.confirm(`Are you sure you want to delete ${game.name}?`)) {
      onGameDelete(game.id);
    }
  };

  return (
    <div className="col-xl-3 col-lg-4 col-md-6">
      <div className="gameCard">
        <img src={game.gamePhoto} alt={game.name} className="img-fluid" />
        {
          auth.role === 'user' && !hasPurchased && (
            <>
              <a
                href="#"
                className={`like ${library.includes(game) ? 'active' : ''}`}
                onClick={
                  library.includes(game)
                    ? () => handleRemoveFromLibrary(game)
                    : () => handleAddToLibrary(game)
                }
              >
                <i className="bi bi-heart-fill"></i>
              </a>
              <a href="#" className="addCart" onClick={() => handleAddToCart(game)}>
                <i className="bi bi-bag-plus-fill"></i>
              </a>
              <a href="#" className="gameInfo" >
              <span>Informacion del juego.</span>
              </a>
            </>
          )
        }
        {
          auth.role === 'company' && (
            <>
              <a href="#" className="addDiscount">
                <i className="bi bi-pen-fill"></i>
              </a>
              <a href="#" className="deleteGame" onClick={handleDeleteClick}>
                <i className="bi bi-trash3-fill"></i>
              </a>
              <a href="#" className="gameInfo" >
              <span>Informacion del juego.</span>
              </a>
            </>
          )
        }
           {auth.role === 'user' && hasPurchased && (
            <>
            <a href="#" className="gameInfo" >
            <span>Informacion del juego.</span>
            </a>
          <div className="ownedMessage">
            <span>Ya tienes este juego!</span>
          </div>
          </>
        
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
                <i>{game.discountPercentage}%</i>
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
    </div>
  );
}

export default GameCard;
