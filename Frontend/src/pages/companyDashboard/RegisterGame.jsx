import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect, useRef } from "react";
import gameApi from '../../api/gameApi';
import '../register.css';
import useAuth from '../../hooks/useAuth';
import filterListData from '../../data/filterListData';
import '../companyDashboard/registerGame.css';
import CompanyGames from "./CompanyGames";

const NAME_REGEX = /^[A-Za-z0-9\s]{3,50}$/;
const PRICE_REGEX = /^[0-9]+(\.[0-9]{1,2})?$/;

const RegisterGame = ({ reference, onSuccess }) => {
    const { auth } = useAuth();
    const nameRef = useRef();
    const errRef = useRef();

    const [name, setName] = useState('');
    const [validName, setValidName] = useState(false);

    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [language, setLanguage] = useState('');
    const [price, setPrice] = useState('');
    const [validPrice, setValidPrice] = useState(false);

    const [system, setSystem] = useState('');
    const [processor, setProcessor] = useState('');
    const [memory, setMemory] = useState('');
    const [graphics, setGraphics] = useState('');
    const [directX, setDirectX] = useState('');
    const [storage, setStorage] = useState('');
    const [gamePhoto, setGamePhoto] = useState('');

    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        nameRef.current.focus();
    }, []);

    useEffect(() => {
        setValidName(NAME_REGEX.test(name));
    }, [name]);

    useEffect(() => {
        setValidPrice(PRICE_REGEX.test(price));
    }, [price]);

    useEffect(() => {
        setErrMsg('');
    }, [name, category, description, language, price]);

    const resetForm = () => {
        setName('');
        setCategory('');
        setDescription('');
        setLanguage('');
        setPrice('');
        setSystem('');
        setProcessor('');
        setMemory('');
        setGraphics('');
        setDirectX('');
        setStorage('');
        setGamePhoto('');
        setSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validName || !validPrice) {
            setErrMsg("Invalid Entry");
            return;
        }
        try {
            
            const gameData = {
                name,
                category,
                description,
                language,
                price: parseFloat(price),
                minimumRequirements: {
                    system,
                    processor,
                    memory,
                    graphics,
                    directX,
                    storage
                },
                gamePhoto: gamePhoto || 'default.jpg' 
            };
            await gameApi.createGame(gameData, auth.accessToken);
            setSuccess(true);
            resetForm();
            onSuccess();  
        } catch (error) {
            setErrMsg(error.response?.data?.message || "Failed to register game");
        }
    };

    useEffect(() => {
        let timeoutId;
        if (success) {
            timeoutId = setTimeout(() => {
                resetForm();
            }, 2000);
        }
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [success]);

    return (
            <section id="registerGame" className="registerGame" ref={reference}>
                <form onSubmit={handleSubmit}>
                
                    <label htmlFor="name">Game Name: <span>*</span></label>
                    <input
                        id="name"
                        ref={nameRef}
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        required
                    />
                    
       
                    <label htmlFor="category">Category: <span>*</span></label>
                    <select
                        id="category"
                        onChange={(e) => setCategory(e.target.value)}
                        value={category}
                        required
                    >
                        <option value="">Select a category</option>
                        {filterListData.map((item) => (
                            <option key={item._id} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>
         
                    <label htmlFor="description">Description: <span>*</span></label>
                    <textarea
                        id="description"
                        onChange={(e) => setDescription(e.target.value)}
                        value={description}
                        required
                    />

              
                    <label htmlFor="language">Language: <span>*</span></label>
                    <input
                        type="text"
                        id="language"
                        onChange={(e) => setLanguage(e.target.value)}
                        value={language}
                        required
                    />

           
                    <label htmlFor="price">Price: <span>*</span></label>
                    <input
                        type="text"
                        id="price"
                        onChange={(e) => setPrice(e.target.value)}
                        value={price}
                        required
                    />
                    
             
                    <h3>Minimum Requirements</h3>
                    <label htmlFor="system">System:</label>
                    <input type="text" id="system" onChange={(e) => setSystem(e.target.value)} value={system} />

                    <label htmlFor="processor">Processor:</label>
                    <input type="text" id="processor" onChange={(e) => setProcessor(e.target.value)} value={processor} />

                    <label htmlFor="memory">Memory:</label>
                    <input type="text" id="memory" onChange={(e) => setMemory(e.target.value)} value={memory} />

                    <label htmlFor="graphics">Graphics:</label>
                    <input type="text" id="graphics" onChange={(e) => setGraphics(e.target.value)} value={graphics} />

                    <label htmlFor="directX">DirectX:</label>
                    <input type="text" id="directX" onChange={(e) => setDirectX(e.target.value)} value={directX} />

                    <label htmlFor="storage">Storage:</label>
                    <input type="text" id="storage" onChange={(e) => setStorage(e.target.value)} value={storage} />

                    <label htmlFor="gamePhoto">Game Photo URL:</label>
                    <input
                        type="url"
                        id="gamePhoto"
                        onChange={(e) => setGamePhoto(e.target.value)}
                        value={gamePhoto}
                        placeholder="Enter the URL of the game photo"
                    />

                    <button disabled={!validName || !validPrice}>Register Game</button>
                    <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>

                </form>
            </section>
    );
};

export default RegisterGame;
