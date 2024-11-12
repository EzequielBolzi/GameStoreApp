import React, { useState, useEffect } from 'react'
import './cart.css'
import ShopCartItem from '../../components/ShopCartItem';

function Cart({ games, reference }) {

  const [total, setTotal] = useState(0);

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
  
  useEffect(()=> {
    setTotal(handleTotalPayment());
  }, [games]);

  return (

      <section id="cart" className="cart" ref={reference}>
          <div className="container-fluid">
              <div className="row mb-3">
                  <h1>My Cart</h1>
              </div>
              {
                  games.length === 0 ? (
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
                                      {games.map( (game,index)=>(
                                          <ShopCartItem index={index} key={game.id} game={game}/>
                                                ))}
                                  </tbody>
                              </table>
                          </div>
                      </div>
               

                  )
              }
                     <div className="row d-flex justify-content-between mt-5">
                     <div className="col-lg-2 d-flex align-items-center ">
                      <p className="itemCount">
                        Total Items: {games.length}
                      </p>
                     </div>
                       
                      <div className="col-lg-10  d-flex justify-content-end">
                      <div className="payment">
                        Total: {total}
                        <a href='#'>Check out <i class="bi bi-wallet2"></i> 
                        </a>
                      </div>
                      </div>
                      </div>
          </div>
      </section>
  );
}
export default Cart
