import React, { useState, useEffect, useRef, useContext } from "react";
import { AppContext } from "../App";
import 'bootstrap/dist/css/bootstrap.min.css';
import './main.css';
import SideMenu from "../components/SideMenu";
import Header from './Header';
import Home from './Home';
import gameApi from '../api/gameApi';
import Categories from "./Categories";
import MyLibrary from "./userDashboard/MyLibrary";
import Cart from "./userDashboard/Cart";
import useAuth from '../hooks/useAuth';
import userApi from '../api/userApi';
import companyApi from '../api/companyApi';
import RegisterGame from "../pages/companyDashboard/RegisterGame";
import CompanyGames from "../pages/companyDashboard/CompanyGames";
import UserPurchasedGames from "./userDashboard/UserPurchasedGames";

function Main() {
    const { auth } = useAuth();

    const [active, setActive] = useState(false);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [username, setUsername] = useState(null);
    const { library, cart } = useContext(AppContext);

    const homeRef = useRef();
    const categoriesRef = useRef();
    const libraryRef = useRef();
    const cartRef = useRef();
    const regisGameRef = useRef();
    const companyGamesRef = useRef();
    const purchasedGamesRef = useRef();

    const sections = [
        {
            name: 'home',
            ref: homeRef,
            active: true,
        },
        {
            name: 'categories',
            ref: categoriesRef,
            active: false,
        },
        {
            name: 'library',
            ref: libraryRef,
            active: false,
        },
        {
            name: 'cart',
            ref: cartRef,
            active: false,
        },
        {
            name: 'registerGame',
            ref: regisGameRef,
            active: false,
        },
        {
            name: 'companyGames',
            ref: companyGamesRef,
            active: false,
        },
        {
            name: 'purchasedGames',
            ref: purchasedGamesRef,
            active: false,
        }
    ];

    const handelToggleActive = () => {
        setActive(!active);
    };

    const handleSectionActive = (target) => {
        sections.forEach(section => {
            if (section.ref.current) {
                section.ref.current.classList.remove('active');
                if (section.ref.current.id === target) {
                    section.ref.current.classList.add('active');
                }

            }

        });
    };

    const fetchGames = async () => {
        try {
            const response = await gameApi.getAllGames();
            setGames(response);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGames();
    }, []);


    const handleFetchGames = () => {
        fetchGames();
    };

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (auth?.accessToken) {
                try {
                    const userType = auth.role;

                    let user;
                    if (userType === 'user') {
                        user = await userApi.getCurrentUser(auth.accessToken);
                        setUsername(user.username);
                    } else {
                        user = await companyApi.getCurrentCompany(auth.accessToken);
                        setUsername(user.companyName);
                    }
                } catch (error) {
                    setError(error.message);
                }
            }
        };

        fetchUserInfo();
    }, [auth]);

    const handleGameDelete = async (gameId) => {
        try {
            await gameApi.deleteGame(gameId, auth.accessToken);
            setGames((prevGames) => prevGames.filter((game) => game.id !== gameId));
            handleFetchGames();
        } catch (error) {
            handleFetchGames();
            window.alert("No se puede borrar este juego.");
            setError(`Error deleting game: ${error.message}`);
        }
    };

    return (
        <main>
            {/* En side Menu tengo la asignacion para cada rol lo que tiene aut. ver */}
            <SideMenu 
                active={active}
                sectionActive={handleSectionActive}
                userRole={auth?.role}
            /> 
            <div className={`banner ${active ? 'active' : undefined}`}>
                <div className="content-wrapper">
                    <Header toggleActive={handelToggleActive} username={username} gamesCart={cart} gamesLibrary={library} />
                    <div className="container-fluid">
                        <Home 
                            games={games} 
                            loading={loading} 
                            error={error} 
                            reference={homeRef}
                            categoriesRef={categoriesRef} 
                            onGameDelete={handleGameDelete} 
                            onViewMoreClick={() => {
                              handleSectionActive('categories');
                            }}                        />
                        <Categories 
                            games={games} 
                            reference={categoriesRef} 
                            onSuccess={handleFetchGames} 
                            onGameDelete={handleGameDelete} 
                        />
                        <MyLibrary games={library} reference={libraryRef}/>
                        <Cart games={cart} reference={cartRef}/>
                        <RegisterGame reference={regisGameRef} onSuccess={handleFetchGames}/>       
                        <CompanyGames reference={companyGamesRef} onSuccess={handleFetchGames} onGameDelete={handleGameDelete}  />
                        <UserPurchasedGames reference={purchasedGamesRef}  />
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Main;
