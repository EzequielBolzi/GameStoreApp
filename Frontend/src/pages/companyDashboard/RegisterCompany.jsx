import { useRef, useState, useEffect } from "react";
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import authApi from '../../api/authApi';
import '../register.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const Register = () => {    
    const userRef = useRef();
    const errRef = useRef();

    const [email, setEmail] = useState('');
    const [validName, setValidName] = useState(false);
    const [userFocus, setUserFocus] = useState(false);

    const [pwd, setPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    const [companyName, setCompanyName] = useState('');
    const [validCompanyName, setValidCompanyName] = useState(false);

    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        console.log("Initial useEffect - setting focus");
        userRef.current?.focus();
    }, []);

    useEffect(() => {
        setValidName(EMAIL_REGEX.test(email));
    }, [email]);

    useEffect(() => {
        setValidPwd(PWD_REGEX.test(pwd));
        setValidMatch(pwd === matchPwd);
    }, [pwd, matchPwd]);

    useEffect(() => {
        setValidCompanyName(companyName.length > 0);
    }, [companyName]);

    useEffect(() => {
        setErrMsg('');
    }, [email, pwd, matchPwd, companyName]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form submitted");
        
        const v1 = EMAIL_REGEX.test(email);
        const v2 = PWD_REGEX.test(pwd);
        const v3 = companyName.length > 0;
        if (!v1 || !v2 || !v3) {
            setErrMsg("Invalid Entry");
            return;
        }
    
        try {
            const companyData = { 
                email, 
                companyName,
                password : pwd,
                confirmPassword: matchPwd
            };
            const response = await authApi.registerCompany(companyData);
            console.log('Registration response:', response);
            setSuccess(true);
            setEmail('');
            setPwd('');
            setMatchPwd('');
            setCompanyName('');
        } catch (error) {
            if (error.response) {
                setErrMsg(error.response.data.message || "Registration failed");
            } else if (error.request) {
                setErrMsg("No server response");
            } else {
                setErrMsg("Registration Failed");
            }
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
                <h1>Register for Companies</h1>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="companyName">
                        Company Name:
                        <FontAwesomeIcon icon={faCheck} className={validCompanyName ? "valid" : "hide"} />
                        <FontAwesomeIcon icon={faTimes} className={validCompanyName || !companyName ? "hide" : "invalid"} />
                    </label>
                    <input
                        type="text"
                        id="companyName"
                        onChange={(e) => setCompanyName(e.target.value)}
                        value={companyName}
                        required
                        aria-invalid={validCompanyName ? "false" : "true"}
                        aria-describedby="companyNameNote"
                    />
                    <p id="companyNameNote" className={companyName && !validCompanyName ? "instructions" : "offscreen"}>
                        <FontAwesomeIcon icon={faInfoCircle} />
                        Company name is required.
                    </p>

                    <label htmlFor="email">
                        Email:
                        <FontAwesomeIcon icon={faCheck} className={validName ? "valid" : "hide"} />
                        <FontAwesomeIcon icon={faTimes} className={validName || !email ? "hide" : "invalid"} />
                    </label>
                    <input
                        type="text"
                        id="email"
                        ref={userRef}
                        autoComplete="off"
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        required
                        aria-invalid={validName ? "false" : "true"}
                        aria-describedby="uidnote"
                        onFocus={() => setUserFocus(true)}
                        onBlur={() => setUserFocus(false)}
                    />
                    <p id="uidnote" className={userFocus && email && !validName ? "instructions" : "offscreen"}>
                        <FontAwesomeIcon icon={faInfoCircle} />
                        4 to 24 characters.<br />
                        Must begin with a letter.<br />
                        Letters, numbers, underscores, hyphens allowed.
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
                        8 to 24 characters.<br />
                        Must include uppercase and lowercase letters, a number and a special character.<br />
                        Allowed special characters: <span aria-label="exclamation mark">!</span> <span aria-label="at symbol">@</span> <span aria-label="hashtag">#</span> <span aria-label="dollar sign">$</span> <span aria-label="percent">%</span>
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

                    <button disabled={!validName || !validPwd || !validMatch || !validCompanyName ? true : false}>Sign Up</button>
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
