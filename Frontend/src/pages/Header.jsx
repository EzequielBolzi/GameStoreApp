import React from "react";
import "./header.css";
import userImg from "../images/img_avatar.png";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function Header({ toggleActive, username = "Guest", isProfileUpdate, gamesCart = [], gamesLibrary = [], isGameInformation }) {
  const { auth, logout } = useAuth();

  if (isProfileUpdate) {
    return (
      <header>
        <div className="userItems right-aligned">
          <div className="avatar">
            <img src={userImg} alt="User Avatar" />
            <div className="user">
              <span>{username}</span>
              <Link to="/main">Back to Home</Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header>
      <a
        href="#"
        className="menu"
        onClick={(e) => {
          e.preventDefault();
          toggleActive();
        }}
        role="button"
        aria-label="Toggle Menu"
      >
        { !isGameInformation && (
        <i className="bi bi-sliders"></i>
        )}
      </a>

      <div className="userItems">
        {auth.role === "user" && !isGameInformation && (
          <>
            <a href="#" className="icon" role="button" aria-label="View Favorites">
              <i className="bi bi-heart-fill"></i>
              <span className="like">{gamesLibrary.length}</span>
            </a>
            <a href="#" className="icon" role="button" aria-label="View Cart">
              <i className="bi bi-bag-fill"></i>
              <span className="bag">{gamesCart.length}</span>
            </a>
          </>
        )}

        <div className="avatar">
          <a href="#" role="button">
            <img src={userImg} alt="User Avatar" />
          </a>
          <div className="user">
            <span>{username}</span>

            {auth.role === "company" && !isGameInformation && (
              <>
                <Link to="/profile/update/company">Edit Profile</Link>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    logout();
                    window.location.reload();
                  }}
                  className="sign-out"
                  role="button"
                >
                  Sign Out
                </a>
              </>
            )}

            {auth.role === "user" &&  !isGameInformation &&(
              <>
                <Link to="/profile/update/user">Edit Profile</Link>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    logout();
                    window.location.reload();
                  }}
                  className="sign-out"
                  role="button"
                >
                  Sign Out
                </a>
              </>
            )}

            {isGameInformation && (
              <Link to="/main">Back to Home</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
