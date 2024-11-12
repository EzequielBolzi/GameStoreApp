import React, { useContext } from 'react';
import './shopCartItem.css';
import { AppContext } from '../App';

function ShopCartItem({ game, index }) {

    const {cart, setCart} = useContext(AppContext);
    const price = game.isOnSale ? game.salePrice : game.price;

    const handelRemoveFromCart = game => {
        setCart(cart.filter(item => item.id !== game.id));
    };



    return (
        <tr className="shopCartItem">
            <th scope="row">{index + 1}</th>
            <td>
                <img src={game.gamePhoto} alt="" className="img-fluid" />
            </td>
            <td>{game.name}</td>
            <td>{price ? price.toFixed(2) : '0'}</td>
            <td>{game.discountPercentage ? game.discountPercentage : '0'}%</td>
            <td>{price ? price.toFixed(2) : '0'}</td>
            <td>
                <a href="#" onClick={() => handelRemoveFromCart(game)}>
                    <i className="bi bi-trash3"></i>
                </a>
            </td>
        </tr>
    );
}

export default ShopCartItem;
