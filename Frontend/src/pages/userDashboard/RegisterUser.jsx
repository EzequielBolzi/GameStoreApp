import { useRef, useState, useEffect } from "react";
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import authApi from '../../api/authApi';  
import '../register.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[A-Za-z][A-Za-z0-9_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const PHONE_REGEX = /^\+?[\d\s-]{8,}$/;

const Register = () => {    
    const userRef = useRef();
    const errRef = useRef();

    const [email, setEmail] = useState('');
    const [validEmail, setValidEmail] = useState(false);
    const [emailFocus, setEmailFocus] = useState(false);

    const [username, setUsername] = useState('');
    const [validUsername, setValidUsername] = useState(false);
    const [usernameFocus, setUsernameFocus] = useState(false);

    const [pwd, setPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    const [profileAvatar, setProfileAvatar] = useState('');
    
    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        userRef.current?.focus();
    }, []);

    useEffect(() => {
        setValidEmail(EMAIL_REGEX.test(email));
    }, [email]);

    useEffect(() => {
        setValidUsername(USERNAME_REGEX.test(username));
    }, [username]);

    useEffect(() => {
        setValidPwd(PWD_REGEX.test(pwd));
        setValidMatch(pwd === matchPwd);
    }, [pwd, matchPwd]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const v1 = EMAIL_REGEX.test(email);
        const v2 = USERNAME_REGEX.test(username);
        const v3 = PWD_REGEX.test(pwd);
        const v4 = profileAvatar.length > 0;
        if (!v1 || !v2 || !v3 || !v4) {
            setErrMsg("Invalid Entry");
            return;
        }

        try {
            const userData = { 
                email, 
                username,
                password : pwd,
                confirmPassword: matchPwd,
                profileAvatar
                
            };
            const response = await authApi.registerUser(userData);  
            console.log('Registration response:', response);
            setSuccess(true);
            setEmail('');
            setUsername('');
            setPwd('');
            setMatchPwd('');
            setProfileAvatar('');
        } catch (error) {
            setErrMsg(error.message);
            errRef.current?.focus();
        }
    }

    return (
        <>
        {success ? (
            <section>
                <h1>Success!</h1>
                <p>
                    <a href="/login">Sign In</a>
                </p>
            </section>
        ) : (
            <section>
                <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
                <h1>Register for Users</h1>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">
                        Email:
                        <FontAwesomeIcon icon={faCheck} className={validEmail ? "valid" : "hide"} />
                        <FontAwesomeIcon icon={faTimes} className={validEmail || !email ? "hide" : "invalid"} />
                    </label>
                    <input
                        type="text"
                        id="email"
                        ref={userRef}
                        autoComplete="off"
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        required
                        aria-invalid={validEmail ? "false" : "true"}
                        aria-describedby="emailnote"
                        onFocus={() => setEmailFocus(true)}
                        onBlur={() => setEmailFocus(false)}
                    />
                    <p id="emailnote" className={emailFocus && email && !validEmail ? "instructions" : "offscreen"}>
                        <FontAwesomeIcon icon={faInfoCircle} />
                        Please enter a valid email address.
                    </p>

                    <label htmlFor="username">
                        Username:
                        <FontAwesomeIcon icon={faCheck} className={validUsername ? "valid" : "hide"} />
                        <FontAwesomeIcon icon={faTimes} className={validUsername || !username ? "hide" : "invalid"} />
                    </label>
                    <input
                        type="text"
                        id="username"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        required
                        aria-invalid={validUsername ? "false" : "true"}
                        aria-describedby="usernamenote"
                        onFocus={() => setUsernameFocus(true)}
                        onBlur={() => setUsernameFocus(false)}
                    />
                    <p id="usernamenote" className={usernameFocus && username && !validUsername ? "instructions" : "offscreen"}>
                        <FontAwesomeIcon icon={faInfoCircle} />
                        Username must be 4-24 characters long, start with a letter, and only contain letters, numbers, or underscores.
                    </p>

                    <label htmlFor="password">
                        Password:
                        <FontAwesomeIcon icon={faCheck} className={validPwd ? "valid" : "hide"} />
                        <FontAwesomeIcon icon={faTimes} className={validPwd || !pwd ? "hide" : "invalid"} />
                    </label>
                    <input
                        type="password"
                        id="password"
                        onChange={(e) => setPwd(e.target.value)}
                        value={pwd}
                        required
                        aria-invalid={validPwd ? "false" : "true"}
                        aria-describedby="pwdnote"
                        onFocus={() => setPwdFocus(true)}
                        onBlur={() => setPwdFocus(false)}
                    />
                    <p id="pwdnote" className={pwdFocus && !validPwd ? "instructions" : "offscreen"}>
                        <FontAwesomeIcon icon={faInfoCircle} />
                        Password must be 8-24 characters long, include uppercase and lowercase letters, a number, and a special character.
                    </p>

                    <label htmlFor="confirm_pwd">
                        Confirm Password:
                        <FontAwesomeIcon icon={faCheck} className={validMatch && matchPwd ? "valid" : "hide"} />
                        <FontAwesomeIcon icon={faTimes} className={validMatch || !matchPwd ? "hide" : "invalid"} />
                    </label>
                    <input
                        type="password"
                        id="confirm_pwd"
                        onChange={(e) => setMatchPwd(e.target.value)}
                        value={matchPwd}
                        required
                        aria-invalid={validMatch ? "false" : "true"}
                        aria-describedby="confirmnote"
                        onFocus={() => setMatchFocus(true)}
                        onBlur={() => setMatchFocus(false)}
                    />
                    <p id="confirmnote" className={matchFocus && !validMatch ? "instructions" : "offscreen"}>
                        <FontAwesomeIcon icon={faInfoCircle} />
                        Must match the first password input field.
                    </p>

                    <label htmlFor="profileAvatar" >Profile Avatar URL:</label>
                    <input
                        type="url"
                        id="profileAvatar"
                        onChange={(e) => setProfileAvatar(e.target.value)}
                        value={profileAvatar}
                    />

                    <button disabled={!validEmail || !validUsername || !validPwd || !validMatch}>Register</button>
                </form>
                <br></br>
                <p>
                    Already registered?<br />
                    <span className="line">
                        <a href="/login">Sign In</a>
                    </span>
                </p>
            </section>
        )}
        </>
    );
}

export default Register;
