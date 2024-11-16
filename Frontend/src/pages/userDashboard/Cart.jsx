import React, { useState, useEffect } from 'react';
import './cart.css';
import ShopCartItem from '../../components/ShopCartItem';
import userApi from '../../api/userApi';  
import useAuth from '../../hooks/useAuth'; 

function Cart({ games, reference }) {
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const  {auth}  = useAuth();

  const handleTotalPayment = () => {
    return games
      .map((game) => {
        const price = game.price || 0;
        const discount = game.discountPercentage || 0;
        return price * (1 - discount / 100);
      })
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0)
      .toFixed(2);
  };

  useEffect(() => {
    setTotal(handleTotalPayment());
  }, [games]);

  const handleCheckout = async () => {
    if (games.length === 0) {
      setMessage('Your cart is empty.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
  
        await userApi.purchaseGame(games.map(game => game.id), auth.accessToken);
        
      setMessage('Purchase successful! Thank you for your order.');
    } catch (error) {
      setMessage(`Purchase failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="cart" className="cart" ref={reference}>
      <div className="container-fluid">
        <div className="row mb-3">
          <h1>My Cart</h1>
          <h9 style={ {color: 'white'} }>Recorda cargar los datos de tu tarjeta en : 'Editar perfil' </h9>
        </div>
        {games.length === 0 ? (
          <h2>Your cart is empty</h2>
        ) : (
          <div className="row">
            <div className="table-responsive">
              <table className="shopCartTable table table-borderless align-middle">
                <thead>
                  <tr>
                    <th scope="col">No.</th>
                    <th scope="col">Preview</th>
                    <th scope="col">Game</th>
                    <th scope="col">Price</th>
                    <th scope="col">Discount</th>
                    <th scope="col">Payment</th>
                    <th scope="col">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((game, index) => (
                    <ShopCartItem index={index} key={game.id} game={game} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="row d-flex justify-content-between mt-5">
          <div className="col-lg-2 d-flex align-items-center">
            <p className="itemCount">Total Items: {games.length}</p>
          </div>
          <div className="col-lg-10 d-flex justify-content-end">
            <div className="payment">
              Total: ${total}
              <button 
                className="checkout-button btn btn-primary ms-3" 
                onClick={handleCheckout} 
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Check out'} <i className="bi bi-wallet2"></i>
              </button>
            </div>
          </div>
        </div>
        {message && (
          <div className="row mt-3">
            <div className="col-12">
            <div 
                className={`alert ${message.startsWith('Purchase successful') ? 'alert-success' : 'alert-danger'} fade-out`} 
                role="alert"
              >
                {message}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Cart;
