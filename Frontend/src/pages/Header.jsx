import React from 'react';
import './header.css';
import userImg from '../images/img_avatar.png';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function Header({ toggleActive, username, isProfileUpdate, gamesCart, gamesLibrary }) {
  const { auth, logout } = useAuth();  

  if (isProfileUpdate) {
    return (
      <header>
        <div className="userItems right-aligned">
          <div className="avatar">
            <img src={userImg} alt="User Avatar" />
            <div className="user">
              <span>{username}</span>
              <Link to="/main">Volver al Home</Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header>
      <a href="#" className="menu" onClick={toggleActive}>
        <i className="bi bi-sliders"></i>
      </a>
      
      <div className="userItems">
        <a href="#" className="icon"> 
          <i className="bi bi-heart-fill"></i>
          <span className="like">{gamesLibrary.length}</span>
        </a>
        <a href="#" className="icon">
          <i className="bi bi-bag-fill"></i>
          <span className="bag">{gamesCart.length}</span>
        </a>
        <div className="avatar">
          <a href="#">
            <img src={userImg} alt="User Image" />
          </a>
          <div className="user">
            <span>{username}</span>
            {auth.role === 'company' && (
              <Link to="/profile/update/company">Editar Perfil</Link>
            )}
            {auth.role === 'user' && (
              <Link to="/profile/update/user">Editar Perfil</Link>
            )}
            <Link 
              to="#" 
              style={{ fontSize: "12px" }} 
              onClick={logout} 
            >
              Sign Out
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
