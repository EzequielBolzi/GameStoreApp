import React from 'react';
import './header.css';
import userImg from '../images/img_avatar.png';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';


function Header({ toggleActive, username }) {
  const { auth } = useAuth();  


  return (
    <header>
      <a href="#" className="menu" onClick={toggleActive}>
        <i className="bi bi-sliders"></i>
      </a>
      <div className="userItems">
        <a href="#" className="icon"> 
          <i className="bi bi-heart-fill"></i>
          <span className="like">0</span>
        </a>
        <a href="#" className="icon">
          <i className="bi bi-bag-fill"></i>
          <span className="bag">0</span>
        </a>
        <div className="avatar">
          <a href="#">
            <img src={userImg} alt="User Image" />
          </a>
          <div className="user">
            <span>{username}</span>
            {auth.role === 'company' && (
              <Link to="/profile/update/company">Update Profile</Link>
            )}
                 {auth.role === 'user' && (
              <Link to="/profile/update/user">Update Profile</Link>
            )}
    
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
